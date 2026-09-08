"""Restore the open Fusion document from the snapshot save_state.py wrote.

Idempotent: safe to run repeatedly. Reports residuals and mismatch counts so the
restore is verified rather than assumed. Never saves the document.

Expect a worst transform residual around 1e-15 (float noise) and zero visibility
mismatches. Anything larger means the restore did not fully apply.
"""

import adsk.core
import adsk.fusion
import json
import os

HOME = os.path.expanduser("~")
TF_PATH = os.path.join(HOME, "fusion_orig_transforms.json")
VIS_PATH = os.path.join(HOME, "fusion_orig_vis.json")


def run(_context: str):
    app = adsk.core.Application.get()
    des = adsk.fusion.Design.cast(app.activeProduct)
    root = des.rootComponent

    with open(TF_PATH) as f:
        transforms = json.load(f)
    with open(VIS_PATH) as f:
        visibility = json.load(f)

    n_tf = 0
    for occ in root.occurrences:
        want = transforms.get(occ.fullPathName)
        if not want:
            continue
        have = list(occ.transform2.asArray())
        if max(abs(a - b) for a, b in zip(have, want)) > 1e-9:
            m = adsk.core.Matrix3D.create()
            m.setWithArray(want)
            occ.transform2 = m
            n_tf += 1

    n_vis = 0
    for occ in root.allOccurrences:
        want = visibility.get(occ.fullPathName)
        if want is not None and occ.isLightBulbOn != want:
            occ.isLightBulbOn = want
            n_vis += 1

    adsk.doEvents()
    vp = app.activeViewport
    vp.visualStyle = adsk.core.VisualStyles.ShadedVisualStyle
    vp.fit()
    vp.refresh()

    worst = 0.0
    for occ in root.occurrences:
        want = transforms.get(occ.fullPathName)
        if not want:
            continue
        have = list(occ.transform2.asArray())
        worst = max(worst, max(abs(a - b) for a, b in zip(have, want)))
    bad_vis = sum(
        1
        for occ in root.allOccurrences
        if visibility.get(occ.fullPathName) is not None
        and occ.isLightBulbOn != visibility[occ.fullPathName]
    )

    print("restored transforms:", n_tf, "| visibility:", n_vis)
    print("VERIFY worst transform residual:", worst, "| visibility mismatches:", bad_vis)
    print("document NOT saved (Fusion may still flag it modified; content is identical)")

"""Snapshot the open Fusion document so any capture run is fully reversible.

Run this through the Fusion MCP `execute` tool BEFORE anything moves geometry,
as its own call, so the state file exists even if a later capture crashes.

Writes two files to the user's home directory:
  fusion_orig_transforms.json  top-level occurrence transforms (what capture moves)
  fusion_orig_vis.json         isLightBulbOn for every occurrence in the design

See docs/fusion-animation-pipeline.md section 6.
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

    transforms = {o.fullPathName: list(o.transform2.asArray()) for o in root.occurrences}
    with open(TF_PATH, "w") as f:
        json.dump(transforms, f)

    # Every occurrence, not just top level: hiding happens deep in the tree.
    visibility = {o.fullPathName: o.isLightBulbOn for o in root.allOccurrences}
    with open(VIS_PATH, "w") as f:
        json.dump(visibility, f)

    print("saved transforms:", len(transforms), "->", TF_PATH)
    print("saved visibility:", len(visibility), "->", VIS_PATH)

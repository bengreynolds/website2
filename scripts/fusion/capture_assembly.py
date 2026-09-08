"""Capture a scroll-scrubbable assembly build-up as transparent PNG frames.

Each entry in PHASES claims top-level occurrences by component-name prefix, gives
them a starting offset in cm, and a window of the timeline over which that offset
eases to zero. Frame 0 is fully exploded, the last frame is fully assembled.

Run order (three separate MCP `execute` calls, never one):
    1. scripts/fusion/save_state.py
    2. this file
    3. scripts/fusion/restore_state.py     <- always, even if this crashed

Non-obvious requirements, all of which cost real debugging time:
  * Camera must be captured ONCE against the assembled state and re-applied each
    frame. isFitView=False or the model rescales as parts move. See
    docs/fusion-animation-pipeline.md section 2.
  * isSmoothTransition=False or frames land mid-transition.
  * Only the enclosure SKIN needs hiding; the "Allentown Enclosure Lid" is an
    interior cage lid and hiding it alone reveals nothing.

Frame count: keep at or below 27 so the sprite fits one 16384px strip at 600px.
"""

import adsk.core
import adsk.fusion
import os

# --- tune these -------------------------------------------------------------
OUT = os.path.join(os.path.expanduser("~"), "fusion_frames", "hero")
N_FRAMES = 24
PX = 600
VIEW_MARGIN = 1.30  # 1.9 was too loose; assembly filled only ~45% of frame

# (component-name prefix, offset cm (x, y, z), window start, window end)
# Y is the vertical axis in this model.
PHASES = [
    ("10421-Enclosure", (0, -32, 0), 0.00, 0.30),
    ("70727_91292A118", (0, -22, 0), 0.06, 0.34),
    ("50802-ALLENTOWN", (-38, 0, 0), 0.22, 0.48),
    ("50895-Allentown", (-38, 0, 0), 0.26, 0.52),
    ("10394-Mounted_Tunnel", (0, 0, 38), 0.38, 0.64),
    ("10426-Mouse Step", (0, 0, 38), 0.42, 0.66),
    ("10388-Pellet", (34, 0, 0), 0.50, 0.76),
    ("blower", (0, 0, -32), 0.62, 0.86),
    ("50804-Web_Cam", (0, 0, -32), 0.64, 0.88),
    ("60603-Web_Cam_Mount", (0, 0, -32), 0.64, 0.88),
    ("10420-Observation", (0, 38, 0), 0.72, 0.96),
    ("10423-Jetson", (0, 0, -38), 0.78, 1.00),
]

HIDE_TOP = ["50858-Allentown Enclosure Lid-00"]

# Children of 10421-Enclosure Assy-00. The first six are the skin. The last three
# are interior blockers: the "platform rails" are 20x54cm plates, not rails.
HIDE_ENCLOSURE = [
    "30591-Side Panel_Solid-00",
    "30590-Side Panel_Solid Opposite-00",
    "30596-Top_Panel-00",
    "10427-Back Panel Assy-00",
    "Front Door Assy",
    "10425-Top Door Assy-00",
    "30587-Platform_Rail_Left-00",
    "20566-Platform Rail Right-00 (1)",
    "10428-Water Shield Assy-00",
]
# ---------------------------------------------------------------------------


def ease_out_cubic(p: float) -> float:
    return 1.0 - (1.0 - p) ** 3


def run(_context: str):
    app = adsk.core.Application.get()
    des = adsk.fusion.Design.cast(app.activeProduct)
    root = des.rootComponent
    vp = app.activeViewport
    os.makedirs(OUT, exist_ok=True)

    for occ in root.occurrences:
        if occ.component.name in HIDE_TOP:
            occ.isLightBulbOn = False
    enclosure = next(
        o for o in root.occurrences if o.component.name.startswith("10421-Enclosure")
    )
    for child in enclosure.childOccurrences:
        if child.component.name in HIDE_ENCLOSURE:
            child.isLightBulbOn = False

    # Black edges are what separate the same-coloured aluminium parts.
    vp.visualStyle = adsk.core.VisualStyles.ShadedWithVisibleEdgesOnlyVisualStyle

    occurrences = list(root.occurrences)
    original = {o.fullPathName: o.transform2.copy() for o in occurrences}

    assigned = {}
    for occ in occurrences:
        for prefix, offset, start, end in PHASES:
            if occ.component.name.startswith(prefix):
                assigned[occ.fullPathName] = (offset, start, end)
                break
    print("assigned", len(assigned), "of", len(occurrences), "top-level occurrences")
    print(
        "unassigned (stay static):",
        [o.component.name for o in occurrences if o.fullPathName not in assigned],
    )

    # Lock the camera on the ASSEMBLED state so nothing rescales mid-sequence.
    cam = vp.camera
    cam.viewOrientation = adsk.core.ViewOrientations.IsoTopRightViewOrientation
    cam.isFitView = True
    cam.isSmoothTransition = False
    vp.camera = cam
    adsk.doEvents()
    locked = vp.camera
    locked.isFitView = False
    locked.isSmoothTransition = False
    locked.viewExtents = locked.viewExtents * VIEW_MARGIN
    vp.camera = locked
    adsk.doEvents()

    for i in range(N_FRAMES):
        t = i / float(N_FRAMES - 1)
        for occ in occurrences:
            spec = assigned.get(occ.fullPathName)
            if not spec:
                continue
            offset, start, end = spec
            if t <= start:
                p = 0.0
            elif t >= end:
                p = 1.0
            else:
                p = (t - start) / (end - start)
            remaining = 1.0 - ease_out_cubic(p)
            m = original[occ.fullPathName].copy()
            tr = m.translation
            tr.x = tr.x + offset[0] * remaining
            tr.y = tr.y + offset[1] * remaining
            tr.z = tr.z + offset[2] * remaining
            m.translation = tr
            occ.transform2 = m

        adsk.doEvents()
        vp.camera = locked  # re-apply; do not fit() inside the loop
        vp.refresh()

        opts = adsk.core.SaveImageFileOptions.create(os.path.join(OUT, "f%02d.png" % i))
        opts.width = PX
        opts.height = PX
        opts.isBackgroundTransparent = True
        opts.isAntiAliased = True
        vp.saveAsImageFileWithOptions(opts)

    print("wrote", N_FRAMES, "frames to", OUT)
    print("NOW RUN scripts/fusion/restore_state.py")

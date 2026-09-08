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
import math
import os

# --- tune these -------------------------------------------------------------
OUT = os.path.join(os.path.expanduser("~"), "fusion_frames", "hero")
N_FRAMES = 24
PX = 600

# Tuned over four passes. See docs/fusion-animation-pipeline.md section 5.
VIEW_MARGIN = 1.06   # fit is computed on the EXPLODED state, so barely any extra
ELEVATION_DEG = 35   # degrees ABOVE the horizon, looking down. See below.

# (component-name prefix, offset cm (x, y, z), window start, window end)
# Y is the vertical axis in this model.
PHASES = [
    ("10421-Enclosure", (0, -30, 0), 0.00, 0.20),
    ("70727_91292A118", (0, -22, 0), 0.02, 0.22),
    ("50802-ALLENTOWN", (-32, 0, 0), 0.14, 0.38),
    ("50895-Allentown", (-32, 5, 0), 0.18, 0.42),
    ("10394-Mounted_Tunnel", (0, 0, 32), 0.28, 0.52),
    ("10426-Mouse Step", (0, 0, 32), 0.32, 0.56),
    ("10388-Pellet", (32, 0, 0), 0.42, 0.66),
    ("blower", (0, 0, -30), 0.52, 0.74),
    ("50804-Web_Cam", (0, 0, -30), 0.54, 0.76),
    ("60603-Web_Cam_Mount", (0, 0, -30), 0.54, 0.76),
    ("10420-Observation", (0, 32, 0), 0.64, 0.88),
    ("10423-Jetson", (0, 0, -32), 0.74, 1.00),
]

HIDE_TOP = ["50858-Allentown Enclosure Lid-00"]

# Children of 10421-Enclosure Assy-00.
#   1-6  the skin
#   7-9  interior blockers ("platform rails" are 20x54cm plates, not rails)
#   10-11 the floor. 41x55cm of empty grey plate read as ~40% of the frame and
#         dominated the composition. The corner legs and rails still define the
#         volume without it.
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
    "30586-Collection_Pan-00",
    "20557-Base_Panel-00 (1)",
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

    was_visible = {o.fullPathName: o.isLightBulbOn for o in occurrences}

    # Lock the camera on the ASSEMBLED state so nothing rescales mid-sequence.
    # Orthographic reads as technical rather than photographic.
    cam = vp.camera
    cam.cameraType = adsk.core.CameraTypes.OrthographicCameraType
    cam.viewOrientation = adsk.core.ViewOrientations.IsoTopRightViewOrientation
    cam.isFitView = True
    cam.isSmoothTransition = False
    vp.camera = cam
    adsk.doEvents()

    # The view-orientation presets are Z-up. This model is Y-up, so
    # IsoTopRight resolves to 35 degrees BELOW the horizon: a camera looking up
    # at the rig from underneath. Do NOT scale the preset's dy to fix it, it is
    # negative and scaling tilts further underneath. Keep only the preset's
    # horizontal bearing and rebuild the elevation from an explicit angle.
    base = vp.camera
    tgt, eye = base.target, base.eye
    dx, dy, dz = eye.x - tgt.x, eye.y - tgt.y, eye.z - tgt.z
    dist = (dx * dx + dy * dy + dz * dz) ** 0.5
    horiz = (dx * dx + dz * dz) ** 0.5
    rad = math.radians(ELEVATION_DEG)
    direction = adsk.core.Vector3D.create(
        dx / horiz * math.cos(rad),
        math.sin(rad),  # positive: eye above target, looking down
        dz / horiz * math.cos(rad),
    )
    direction.normalize()
    base.eye = adsk.core.Point3D.create(
        tgt.x + direction.x * dist, tgt.y + direction.y * dist, tgt.z + direction.z * dist
    )
    base.target = tgt
    base.upVector = adsk.core.Vector3D.create(0, 1, 0)
    base.isFitView = True
    base.isSmoothTransition = False
    vp.camera = base
    adsk.doEvents()

    locked = vp.camera
    locked.isFitView = False
    locked.isSmoothTransition = False
    locked.viewExtents = locked.viewExtents * VIEW_MARGIN
    vp.camera = locked
    adsk.doEvents()

    # Cheap guard against silently shipping a from-underneath run again.
    assert vp.camera.eye.y > vp.camera.target.y, (
        "camera is below the target: elevation sign is inverted"
    )

    for i in range(N_FRAMES):
        t = i / float(N_FRAMES - 1)
        for occ in occurrences:
            spec = assigned.get(occ.fullPathName)
            if not spec:
                continue
            offset, start, end = spec
            if not was_visible[occ.fullPathName]:
                continue
            # A part parked at its offset would otherwise float in frame for most
            # of the sequence. Keep it hidden until its window opens.
            occ.isLightBulbOn = t >= start - 1e-9
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

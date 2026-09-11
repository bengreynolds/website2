"""Verified helpers for Fusion capture runs on 00000-Full_System_Assy-00.

MCP `execute` sends a script as a string into Fusion's own interpreter, so this
module cannot be imported there. **Paste the functions you need into the script
you send.** It lives in the repo so the next pass copies working code instead of
re-deriving it from prose.

Every function here replaced an approach that produced a wrong result. The
reasoning is in docs/fusion-animation-pipeline.md; the short version is in each
docstring.

Run order for any capture, always as separate MCP calls:
    1. save_state.py
    2. your capture script
    3. restore_state.py      <- always, even if the capture crashed
"""

import math

# --- model constants --------------------------------------------------------

VERTICAL_AXIS = "Y"

# Natively hidden and must stay hidden. Forcing everything visible to compute a
# camera fit re-enables the 65cm CAN harnesses: fitted extents 109.4 with them
# against 80.1 without.
NATIVELY_HIDDEN = (
    "50916-CAN Bus Harness LONG-00",
    "50915-CAN Bus Harness SHORT-00",
    "blower_holder_shifted",
)

# Children of 10421-Enclosure Assy-00. 50858-Allentown Enclosure Lid-00 is NOT
# the occluder; it is a small cage lid inside.
ENCLOSURE_SKIN = (
    "30591-Side Panel_Solid-00",
    "30590-Side Panel_Solid Opposite-00",
    "30596-Top_Panel-00",
    "10427-Back Panel Assy-00",
    "Front Door Assy",
    "10425-Top Door Assy-00",
)
ENCLOSURE_INTERIOR_BLOCKERS = (
    "30587-Platform_Rail_Left-00",
    "20566-Platform Rail Right-00 (1)",
    "10428-Water Shield Assy-00",
    "30586-Collection_Pan-00",      # the "grey wall" in an iso view is the floor
    "20557-Base_Panel-00 (1)",
)

# Bounding boxes envelope the whole module, so these wreck both nearest-contact
# grouping and any camera fit.
ROUTED_WIRE_PARTS = ("50830", "50835", "50888", "50902")

# Measured pivots, from cylindrical faces. (see axes_of)
PIVOT_PELLET_SCOOP_YZ = (14.69, -10.84)     # axis X
PIVOT_PELLET_BARRIER_XZ = (-8.63, -8.73)    # axis Y (vertical)
PIVOT_CLAMP_CRANK_YZ = (19.08, 3.46)        # axis X
PIVOT_CLAMP_ROCKER_YZ = (18.90, -2.98)      # axis X
CLAMP_PIN_CRANK_YZ = (20.78, 2.59)
CLAMP_PIN_ROCKER_YZ = (17.10, -0.80)

# Colour by what moves, for a mechanism. Colour by material only for a static
# or assembly render. Never edit an appearance's albedo - it has no effect on
# the shaded viewport.
MOTION_PALETTE = {
    "fixed": "Plastic - Matte (Gray)",
    "stage_a": "Plastic - Glossy (Red)",
    "stage_b": "Plastic - Glossy (Green)",
    "stage_c": "Plastic - Glossy (Blue)",
    "rotor": "Plastic - Glossy (Yellow)",
    # Was "Smooth - Light Orange", which is NOT in the Fusion Appearance
    # Library of the current build - verified by enumerating all 172 of its
    # appearances, and there is no orange in it at all. It would have raised on
    # the next capture that touched a second rotor. Substitution is unreviewed:
    # pick a different one if white reads badly against the plate.
    "second_rotor": "Plastic - Glossy (White)",
    "vessel": "Plastic - Translucent Matte (Gray)",
    "pcb": "Plastic - Matte (Green)",
}
MATERIAL_PALETTE = {
    "printed": "Paint - Metallic (Dark Grey)",   # NOT Plastic - Matte (Black):
                                                 # that renders as a flat
                                                 # silhouette with no shading
    "machined": "Aluminum - Anodized Glossy (Grey)",
    "fastener": "Stainless Steel - Polished",
    "rail": "Stainless Steel - Satin",
    "stepper": "Steel - Satin",
    "servo": "Plastic - Glossy (Black)",
    "magnet": "Nickel - Polished",
    "bearing": "Stainless Steel - Polished",
    "switch": "Plastic - Matte (Black)",
    # Was "Rubber - Black", also absent from the current library. Same caveat as
    # second_rotor above: this substitution has not been looked at in a render.
    "clip": "Plastic - Matte (Black)",
    "pcb": "Plastic - Matte (Green)",
    "cots": "Plastic - Matte (Gray)",
}
COTS_BY_PREFIX = {
    "50793": "rail", "50857": "rail", "50903": "stepper", "50898": "servo",
    "50919": "servo", "50901": "magnet", "50798": "bearing", "50799": "switch",
    "50800": "switch", "50908": "clip",
}


def resolve_appearance(app, des, name):
    """Design appearance for `name`, copied in from the library on first use.

    Two traps this exists for, both hit for real:

    - `Appearances.itemByName` RAISES `RuntimeError: 3 : invalid name` for a
      name that is not present. It does not return None, so the usual
      `x = coll.itemByName(n) or fallback` shape silently becomes a crash.
    - A palette can name an appearance the installed library does not have.
      Two entries in the tables above did. Failing with the list of near
      matches beats failing inside a capture loop on frame 40.
    """
    def get(coll, n):
        try:
            return coll.itemByName(n)
        except RuntimeError:
            return None

    found = get(des.appearances, name)
    if found:
        return found
    for i in range(app.materialLibraries.count):
        lib = app.materialLibraries.item(i)
        src = get(lib.appearances, name)
        if src:
            return des.appearances.addByCopy(src, name)

    near = []
    key = name.split("(")[0].strip().lower()
    for i in range(app.materialLibraries.count):
        lib = app.materialLibraries.item(i)
        for j in range(lib.appearances.count):
            n = lib.appearances.item(j).name
            if key and key in n.lower():
                near.append(n)
    raise RuntimeError("no appearance %r in any library. Near matches: %s"
                       % (name, sorted(set(near))[:12] or "none"))


def material_family(name):
    """Part-number family -> MATERIAL_PALETTE key. None for containers."""
    if len(name) < 5 or not name[:5].isdigit():
        return None
    p = name[:5]
    if p[0] in "23":
        return "machined"
    if p[0] in "47":
        return "fastener"
    if p[0] == "6":
        return "printed"
    if p[0] == "8":
        return "pcb"
    if p[0] == "5":
        return COTS_BY_PREFIX.get(p, "cots")
    return None


# --- visibility -------------------------------------------------------------


def visible_leaves(root, path_prefix=None):
    """Leaf occurrences that actually render.

    isLightBulbOn is per-occurrence and is NOT ancestor-aware; Occurrence
    .isVisible did not reflect the ancestor either. And a *container*
    occurrence's boundingBox spans its hidden children, so fitting on one
    includes geometry nobody can see. Always fit on leaves from here.
    """
    hidden = set(o.fullPathName for o in root.allOccurrences if not o.isLightBulbOn)

    def shown(o):
        parts = o.fullPathName.split("+")
        return not any("+".join(parts[: i + 1]) in hidden for i in range(len(parts)))

    out = []
    for o in root.allOccurrences:
        if o.childOccurrences.count:
            continue
        if path_prefix and not o.fullPathName.startswith(path_prefix):
            continue
        if shown(o):
            out.append(o)
    return out


# --- camera -----------------------------------------------------------------


UP_AXIS_INDEX = {"y": 1, "z": 2}


def camera_basis(az_deg, el_deg, up="y"):
    """(view direction target->eye, screen right, screen up).

    Y-up (the default, and what both rigs in the playbook are): az is measured
    from +Z toward +X. Do NOT use ViewOrientations presets: they are Z-up, so on
    a Y-up model IsoTopRight resolves to 35.3 degrees BELOW the horizon. Do not
    try to fix that by scaling the preset's dy either - it is negative, so a
    larger factor tilts further underneath.

    Z-up (up="z"): az is measured from +Y toward +X. Inventor defaults to Z-up
    and so does anything round-tripped through it, which is why this parameter
    exists - LickDetect_2Port_FULL reports upVector (0,0,1). Passing a Z-up
    model through the Y-up branch is the same class of error as the preset
    above, just from the other side: elevation goes into the wrong component and
    the assertion in fit_orthographic guards the wrong axis. Read
    viewport.camera.upVector and pass it; never assume.
    """
    if up not in UP_AXIS_INDEX:
        raise ValueError('up must be "y" or "z", got %r' % (up,))
    ar, er = math.radians(az_deg), math.radians(el_deg)
    if up == "y":
        dv = (math.cos(er) * math.sin(ar), math.sin(er), math.cos(er) * math.cos(ar))
        rn = math.hypot(dv[2], dv[0])
        right = (dv[2] / rn, 0.0, -dv[0] / rn)
    else:
        dv = (math.cos(er) * math.sin(ar), math.cos(er) * math.cos(ar), math.sin(er))
        rn = math.hypot(dv[1], dv[0])
        right = (-dv[1] / rn, dv[0] / rn, 0.0)
    ux = dv[1] * right[2] - dv[2] * right[1]
    uy = dv[2] * right[0] - dv[0] * right[2]
    uz = dv[0] * right[1] - dv[1] * right[0]
    un = math.sqrt(ux * ux + uy * uy + uz * uz)
    return dv, right, (ux / un, uy / un, uz / un)


def fit_orthographic(vp, adsk, corners, az_deg, el_deg, margin=1.05, up="y"):
    """Lock an orthographic camera that contains every given corner.

    viewExtents is the FULL WIDTH of a square frame. Fitting on the largest
    axis span clips on all four edges, because an obliquely-viewed box projects
    wider than any of its own axes. Pass every corner the animation can reach -
    sample the timeline and transform each moving part's 8 bbox corners - not
    one pose's bbox.

    `up` must match the model ("y" default, "z" for anything from Inventor).
    It sets both the camera's upVector and which axis the final
    above-the-horizon assertion checks.

    Returns the locked camera; re-apply it each frame and never call fit() in
    the loop.
    """
    dv, r, u = camera_basis(az_deg, el_deg, up=up)
    us = [q[0] * r[0] + q[1] * r[1] + q[2] * r[2] for q in corners]
    vs = [q[0] * u[0] + q[1] * u[1] + q[2] * u[2] for q in corners]
    ws = [q[0] * dv[0] + q[1] * dv[1] + q[2] * dv[2] for q in corners]
    cu = (min(us) + max(us)) / 2.0
    cv = (min(vs) + max(vs)) / 2.0
    cw = (min(ws) + max(ws)) / 2.0
    radius = max((max(us) - min(us)) / 2.0, (max(vs) - min(vs)) / 2.0)
    # aim at the PROJECTED centre, not the bbox centre; the difference is what
    # pushes the subject off to one side
    tgt = [r[i] * cu + u[i] * cv + dv[i] * cw for i in range(3)]

    cam = vp.camera
    cam.cameraType = adsk.core.CameraTypes.OrthographicCameraType
    cam.target = adsk.core.Point3D.create(*tgt)
    cam.eye = adsk.core.Point3D.create(
        tgt[0] + dv[0] * 100.0, tgt[1] + dv[1] * 100.0, tgt[2] + dv[2] * 100.0
    )
    cam.upVector = adsk.core.Vector3D.create(*(1 if i == UP_AXIS_INDEX[up] else 0
                                               for i in range(3)))
    cam.isSmoothTransition = False       # mandatory: else frames land mid-move
    cam.isFitView = False                # mandatory: else the model rescales
    cam.viewExtents = radius * margin * 2.0
    vp.camera = cam
    adsk.doEvents()

    locked = vp.camera
    locked.isFitView = False
    locked.isSmoothTransition = False
    eye_up = (locked.eye.y, locked.eye.z)[UP_AXIS_INDEX[up] - 1]
    tgt_up = (locked.target.y, locked.target.z)[UP_AXIS_INDEX[up] - 1]
    assert eye_up > tgt_up, "camera is below the target (up=%s)" % up
    return locked


def bbox_corners(bb):
    return [
        (x, y, z)
        for x in (bb.minPoint.x, bb.maxPoint.x)
        for y in (bb.minPoint.y, bb.maxPoint.y)
        for z in (bb.minPoint.z, bb.maxPoint.z)
    ]


# --- reading axes out of the solid model ------------------------------------


def axes_of(occ, adsk, top=4):
    """Largest cylindrical faces of an occurrence, biggest first.

    This model has zero joints, so every axis has to come from geometry. A
    part's largest cylindrical face is its shaft, bore or pivot. Bbox
    proportions are NOT a substitute - they put two of three steppers'
    shafts on the wrong axis, and a bbox-estimated linkage pin was 1cm out.

    Two independent parts reporting the same origin is the check that you
    found the real pin.
    """
    found = []
    for body in occ.bRepBodies:
        for f in body.faces:
            g = f.geometry
            if g is None:
                continue
            if g.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
                c = adsk.core.Cylinder.cast(g)
                found.append(
                    {
                        "area": f.area,
                        "radius": c.radius,
                        "axis": (c.axis.x, c.axis.y, c.axis.z),
                        "origin": (c.origin.x, c.origin.y, c.origin.z),
                    }
                )
    found.sort(key=lambda d: -d["area"])
    return found[:top]


# --- group membership -------------------------------------------------------


def bbox_gap(a, b):
    """Shortest distance between two bounding boxes; 0 if they touch."""
    d = 0.0
    for lo1, hi1, lo2, hi2 in (
        (a.minPoint.x, a.maxPoint.x, b.minPoint.x, b.maxPoint.x),
        (a.minPoint.y, a.maxPoint.y, b.minPoint.y, b.maxPoint.y),
        (a.minPoint.z, a.maxPoint.z, b.minPoint.z, b.maxPoint.z),
    ):
        s = max(lo1 - hi2, lo2 - hi1, 0.0)
        d += s * s
    return math.sqrt(d)


def assign_groups(leaves, bbs, core):
    """Explicit membership for named parts, nearest contact for the rest.

    core: {group: [(component name, nominal bbox-centre Y or None, count)]}

    Neither shortcut works on its own here. Height tiering puts
    60598-X_frame one stage too deep, because it sits high but is bolted to
    the carriage below and CARRIES the rail above. Proximity alone puts the
    base plate and the vat on moving stages, because they touch a carriage.

    So: name every non-fastener part (34 of 89 on the pellet module) and let
    only fasteners fall to nearest contact. Height is legitimate for exactly
    one thing - telling duplicate component names apart.
    """
    def cy(o):
        b = bbs[o.fullPathName]
        return (b.minPoint.y + b.maxPoint.y) / 2.0

    grp = {}
    for group, entries in core.items():
        for name, y_nominal, count in entries:
            pool = [
                o for o in leaves
                if o.component.name == name and o.fullPathName not in grp
            ]
            if y_nominal is not None:
                pool.sort(key=lambda o: abs(cy(o) - y_nominal))
            if len(pool) < count:
                raise RuntimeError(
                    "need %d of %s, found %d" % (count, name, len(pool))
                )
            for o in pool[:count]:
                grp[o.fullPathName] = group

    boxes = {}
    for path, group in grp.items():
        boxes.setdefault(group, []).append(bbs[path])
    for o in leaves:
        if o.fullPathName in grp:
            continue
        bb = bbs[o.fullPathName]
        best, best_d = None, 1e9
        for group, box_list in boxes.items():
            d = min(bbox_gap(bb, b) for b in box_list)
            if d < best_d - 1e-9:
                best, best_d = group, d
        grp[o.fullPathName] = best
    return grp


# --- motion -----------------------------------------------------------------


def smoothstep(p):
    return p * p * (3.0 - 2.0 * p)


def sample_keys(keys, t):
    """Interpolate a keyframe table with a smoothstep.

    keys: [(t, v0, v1, ...)] sorted by t. Returns the value tuple at t.
    """
    for i in range(len(keys) - 1):
        t0, t1 = keys[i][0], keys[i + 1][0]
        if t <= t1 or i == len(keys) - 2:
            p = 0.0 if t1 <= t0 else max(0.0, min(1.0, (t - t0) / (t1 - t0)))
            e = smoothstep(p)
            return tuple(
                keys[i][k + 1] + (keys[i + 1][k + 1] - keys[i][k + 1]) * e
                for k in range(len(keys[i]) - 1)
            )
    return keys[-1][1:]


def apply_nested(occ, adsk, base_matrix, offsets, rotations=()):
    """Compose a part's pose: local rotations first, then cumulative offset.

    offsets is the SUM of every stage above this part, not just its own stage.
    Giving each part only its own stage's offset is what made every axis move
    independently and the gantry come apart.

    rotations is [(angle_rad, axis_xyz, origin_xyz)] applied in list order.
    Matrix3D.transformBy composes as `this = m * this`, so call order IS
    application order: local rotation first, then any outer rotation.
    """
    m = base_matrix.copy()
    for angle, axis, origin in rotations:
        rot = adsk.core.Matrix3D.create()
        rot.setToRotation(
            angle,
            adsk.core.Vector3D.create(*axis),
            adsk.core.Point3D.create(*origin),
        )
        m.transformBy(rot)
    t = m.translation
    t.x = t.x + offsets[0]
    t.y = t.y + offsets[1]
    t.z = t.z + offsets[2]
    m.translation = t
    occ.transform2 = m
    return m


def solve_fourbar(rocker_deg, crank_axis, rocker_axis, crank_pin, rocker_pin):
    """Planar four-bar: drive the rocker, return the crank and coupler poses.

    All points are (Y, Z) in the linkage plane. Returns
    (crank delta rad, coupler delta rad, new crank pin) so the coupler can be
    placed from its two pin correspondences rather than rotated about anything.

    Takes the +acos branch, which reproduces the modelled crank angle at
    rocker 0. If your branch does not return the modelled pose at zero, the
    pins are wrong - that reproduction is the only check available.

    Raises when the linkage cannot close, which is how you find its real
    travel limits instead of guessing them.
    """
    def sub(a, b):
        return (a[0] - b[0], a[1] - b[1])

    def norm(v):
        return math.hypot(v[0], v[1])

    a = norm(sub(crank_pin, crank_axis))
    link = norm(sub(crank_pin, rocker_pin))
    th0 = math.atan2(crank_pin[1] - crank_axis[1], crank_pin[0] - crank_axis[0])
    psi0 = math.atan2(rocker_pin[1] - crank_pin[1], rocker_pin[0] - crank_pin[0])

    t = math.radians(rocker_deg)
    c, s = math.cos(t), math.sin(t)
    v = sub(rocker_pin, rocker_axis)
    p2 = (rocker_axis[0] + v[0] * c - v[1] * s, rocker_axis[1] + v[0] * s + v[1] * c)

    d = sub(p2, crank_axis)
    dist = norm(d)
    cos_phi = (a * a + dist * dist - link * link) / (2 * a * dist)
    if abs(cos_phi) > 1.0:
        raise RuntimeError(
            "linkage locks at rocker %.1f deg (cos=%.3f)" % (rocker_deg, cos_phi)
        )
    th = math.atan2(d[1], d[0]) + math.acos(cos_phi)
    p1 = (crank_axis[0] + a * math.cos(th), crank_axis[1] + a * math.sin(th))
    psi = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    return th - th0, psi - psi0, p1


# --- capture ----------------------------------------------------------------


def save_frame(vp, adsk, path, px):
    """Transparent square PNG. Ship the UNCROPPED square canvas.

    Cropping frames to a union alpha bbox gave a 614x618 cell against a
    declared aspect-ratio 1/1, which mis-registers every cell of the sprite
    sheet and reads as cut off. The empty alpha margin costs almost nothing
    in WebP.
    """
    opts = adsk.core.SaveImageFileOptions.create(path)
    opts.width = px
    opts.height = px
    opts.isBackgroundTransparent = True
    opts.isAntiAliased = True
    vp.saveAsImageFileWithOptions(opts)

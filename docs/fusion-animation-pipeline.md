# Fusion → website animation pipeline

A playbook for turning `00000-Full_System_Assy-00` (the Auto-trainer rig) and
`Box_assembly` (the Prosthetic_vib seesaw rig) into scrubbable and
button-triggered animations on this site. Ordered as the work actually runs, not
as it was discovered.

Everything here was verified against the live model through the Fusion MCP
connector. Where a number appears, it was measured.

Reusable scripts: `scripts/fusion/` (state snapshot/restore) and
`scripts/build_demo_sprite.py` (sheet + poster + CSS from one place).

---

## 0. The process

Each step is a section below. The order matters — most of the expensive mistakes
in this file came from doing one of these out of sequence, or skipping step 7.

| # | Step | The rule in one line |
|---|---|---|
| 1 | Snapshot | Write transforms, visibility and the camera to JSON in its own call, before anything moves. |
| 2 | Know the model | Y is up, there are no joints, and nothing renders until every ancestor's bulb is on. |
| 3 | Find the mechanism | Read cylindrical faces and pin bores. Never infer an axis from a name or a bounding box. |
| 4 | Define the motion | Get the nesting from the machine, the order from its config, and the signs from the owner. |
| 5 | Choose the camera | Project the corners over the whole path. Never trust a view preset. |
| 6 | Choose the colours | Colour by what moves for a mechanism; by material for an assembly. |
| 7 | **Preview** | Render stills, look at them, send them to the owner. Never capture blind. |
| 8 | Capture | Lock the camera, apply an explicit colour base, restore at the end. |
| 9 | Ship | Generate sheet, poster and CSS together. Gate the payload. |
| 10 | Verify | Check the files against each other, and look at the result at display size. |

---

## 1. Snapshot, restore, and never save

The capture scripts move real geometry in the owner's open document.

1. Write every occurrence's `transform2` **and** `isLightBulbOn` to JSON
   **before touching anything** (`scripts/fusion/save_state.py`). Do it as its
   own MCP call so the file exists even if a later capture crashes.
2. If the run will change appearances, snapshot those too — occurrence-level
   `appearance.name` for all occurrences is cheap (684 reads, no crash) and is
   enough to restore from. Record **body-level** names as well if the run will
   write bodies; an occurrence-level restore cannot put a body override back.
3. **Snapshot `viewport.camera`.** `save_state.py` does not, so the owner's view
   cannot be returned. The prosthetic run left its capture camera behind and had
   to ask the owner to press Home.
4. Capture.
5. Restore and **verify with numbers**, not assumption: report worst transform
   residual, visibility mismatches, appearance mismatches. Every session in
   this file ended at `residual 0.0 | vis 0 | appearance 0`.
6. **Never save the document.** Fusion still flags it modified; that is expected
   and the content is identical.

State files land in the user's home directory: `fusion_orig_transforms.json`,
`fusion_orig_vis.json`.

**If Fusion crashes, the saved document is fine** — the scripts never save, so a
crash discards only in-memory changes. On restart, **decline** any offer to
recover unsaved changes: that would restore whatever state the script died in.

**An MCP timeout is not a failure.** Fusion is single-threaded and keeps
executing after the client gives up. A 48-frame run returned `Request timed out`
and had written all 48 frames plus its restore. Always check the output
directory before re-running — re-running a capture that already completed can
double-apply transforms.

**What actually crashed Fusion:** bulk-reading `boundingBox` **and** `appearance`
for ~234 *proxy* bodies in one setup phase. Reading `component.bRepBodies`
bounding boxes for the same 234 is cheap and safe. If you need per-body data,
read it in component space, persist it to JSON in one call, and capture in a
second.

---

## 2. Know the model

| Property | Value |
|---|---|
| `designType` | `1` = **Parametric** (`DirectDesignType` is `0`) |
| **Joints in design** | **0** |
| Top-level occurrences | 31 |
| Total occurrences | 684 |
| **Vertical axis** | **Y** |
| Overall extents | ~42.5 (X) × 36.1 (Y) × 62.4 (Z) cm |

> **An earlier version of this table read `1` = Direct.** It is backwards:
> `adsk.fusion.DesignTypes.DirectDesignType` is `0` and `ParametricDesignType`
> is `1`. Both rigs are parametric with real timelines (`Box_assembly` has 314
> entries). It matters in one place: adding BRep bodies needs
> `component.features.baseFeatures.add()` plus `startEdit`/`finishEdit`, or
> `bRepBodies.add` raises "A valid targetBaseFeature is required". Writing
> `occurrence.transform2` still adds **no** timeline entries — verified across a
> 121-frame run, timeline 314 before and after — so the conclusion below holds
> even though the label was wrong.

**Zero joints cuts both ways.** Good: no constraint solver to fight,
`occurrence.transform2` can be set freely, and round-trips are exact (a 10 cm
translation applied at `delta=10.000` and restored at `residual=0.000000`). Bad:
**no motion is encoded anywhere.** Names like `..._MAX_Position`,
`SSEB6-55_SLIDE_MAX` and `SSEB8-55_Z-DEFAULT` are frozen placements, not ranges
the API can read. Every mechanism animation is hand-authored.

### Visibility is not what the API first suggests

`Occurrence.isLightBulbOn` is that occurrence's **own** switch. Hiding a parent
does not clear it on the children, and `Occurrence.isVisible` did not reflect
the ancestor either. Compute effective visibility by walking the path:

```python
hidden = {o.fullPathName for o in root.allOccurrences if not o.isLightBulbOn}
def shown(o):
    parts = o.fullPathName.split("+")
    return not any("+".join(parts[:i+1]) in hidden for i in range(len(parts)))
```

`Occurrence.boundingBox` on a **container** occurrence also spans its hidden
children. Fitting on the pellet module's top-level occurrence returned a box
reaching Y 29.8 — the hidden PCB enclosure. **Always fit on visible leaves**
(`o.childOccurrences.count == 0 and shown(o)`).

**Three occurrences are natively hidden and must stay hidden:**
`50916-CAN Bus Harness LONG-00`, `50915-CAN Bus Harness SHORT-00`,
`blower_holder_shifted`. Forcing everything visible to compute a fit turned the
65 cm CAN harnesses back on: fitted extents **109.4 with them versus 80.1
without**, a 37% inflation that shrank the subject to 20% of frame. Snapshot
native visibility and fit against that — "everything on" is not the widest
legitimate silhouette.

### Opening the enclosure

The assembly renders as a closed grey box. `50858-Allentown Enclosure Lid-00`
is *not* the occluder — it is a small cage lid inside. Hide these children of
`10421-Enclosure Assy-00`:

```
30591-Side Panel_Solid-00        10427-Back Panel Assy-00
30590-Side Panel_Solid Opposite  Front Door Assy
30596-Top_Panel-00               10425-Top Door Assy-00
```

and optionally these interior blockers:

```
30587-Platform_Rail_Left-00      # 20 × 54 cm plates, not "rails"
20566-Platform Rail Right-00 (1)
10428-Water Shield Assy-00
```

**The large grey "wall" in an iso view is the floor.** By projected screen area:
`20557-Base_Panel-00` = 172,557 and `30586-Collection_Pan-00` = 152,031, far
ahead of anything else. A horizontal 41 × 55 cm plate projects as a huge
parallelogram in a top-down iso. Hiding both is what let the build animation
read — the rig's contents cluster high and to the back, so the floor was dead
space.

> **Use projected screen area, not bounding boxes, to answer "what is big on
> screen."** Project the 8 bbox corners with `Viewport.modelToViewSpace` and take
> the extent product. One query resolved what four bbox queries could not.

**Fusion draws origin axis lines as an overlay on top of geometry**, so solid
parts look translucent in screenshots. Never infer transparency from a
screenshot.

### API facts worth not rediscovering

- `occurrence.transform2` is the one to use. JSON round-trip via `.asArray()`
  and `Matrix3D.setWithArray()`.
- **A sub-assembly's children can only be moved through a root-context proxy.**
  Setting `transform2` on a raw child raises "transform overrides can only be
  set on Occurrence proxy from root component". Get the proxy with
  `child.createForAssemblyContext(top_occ)`, and note that the proxy's
  `transform2` is already in **root space** (verified: `proxy == S * raw`), so a
  root-space rotation needs no conjugation into the sub-assembly frame. Reading
  geometry off raw children instead invents a phantom tilt whenever the
  sub-assembly carries a placement transform — `seesaw_assem` carries a flipped
  one, and it produced a convincing but entirely fictional 2.2 degrees.
- **`Appearances.itemByName` raises `RuntimeError: invalid name` on a miss**
  rather than returning None. Iterate and compare `.name`, or wrap the call.
- `Matrix3D.transformBy(m)` composes as `this = m * this`, so **call order is
  application order**. For a part that rotates about its own axis and then rides
  a stage, call the local rotation first, then the outer one, then add the
  translation.
- `Viewport.saveAsImageFileWithOptions` supports `isBackgroundTransparent`,
  `width`, `height`, `isAntiAliased`. One transparent sprite serves both site
  themes.
- `Camera.isSmoothTransition = False` is **mandatory** — otherwise frames land
  mid-transition.
- `Camera.isFitView = False` during the loop, and re-apply the same locked
  camera object each frame. Never call `fit()` inside the loop.
- `visualStyle = ShadedWithVisibleEdgesOnlyVisualStyle`. Black edge lines are
  what separate same-coloured parts — **except where T-slot extrusion
  dominates.** The prosthetic box has eight 80/20 posts whose dense profile
  edges collapse into solid black bars at 300 px, taking dark pixels from 66% to
  75% and reading as black plastic rather than aluminium. That capture uses
  plain `ShadedVisualStyle`. Compare both at display size before choosing.
- MCP `execute` scripts must define `def run(_context: str)`. **Do not catch
  exceptions** — the traceback is the only debugging signal.

---

## 3. Find the mechanism from geometry

With no joints, every axis has to come out of the solid model. Two techniques
replaced all guesswork, and both were adopted only after name- and
bbox-based inference had produced confidently wrong answers.

### Largest cylindrical face = shaft, bore or pivot

```python
for body in occ.bRepBodies:
    for f in body.faces:
        if f.geometry.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
            cyl = adsk.core.Cylinder.cast(f.geometry)   # .axis, .origin, .radius
```

Sort by `f.area` and take the top few. What this settled:

- **The three pellet steppers.** Shaft along Z on the base, along X on the X
  frame, along Y on the lift frame. Two of the three I had assigned *backwards*
  from bbox proportions — a stepper's bbox includes its flange and gearbox, so
  the longest dimension is not the shaft.
- **The scoop pivot.** A 19 mm bore along X shared by `60596-Servo_Mount` and
  `50798-Ball Bearing` at (Y 14.70, Z −10.84), corroborated by the scoop
  table's own r 0.500 bore at the same point.
- **The barrier pivot.** A **vertical** shaft at (X −8.63, Z −8.73), shared by
  the `50919` servo and `60600-Food_Cap` — which is what identified Food_Cap as
  the barrier rather than part of the scoop.
- **Both tunnel clamp axes.** Servo and horn share (Y 19.08, Z 3.46); both
  `70710` shoulder screws give (Y 18.90, Z −2.98).

### Pin bores, not bbox extremes, for link lengths

I estimated the tunnel clamp's coupler pins from rod-end bbox corners and got a
coupler **1 cm too long** (6.048 against the true 5.003). That produced a
confident, wrong published claim: that the linkage locks near −32° and that this
independently confirmed the owner's remembered 30° of travel. It does not — with
the measured pins the rocker is feasible from **−128° to +46°**.

The pins are small transverse cylinders and they read out exactly:

| feature | source | (Y, Z) |
|---|---|---|
| crank axis | servo `50898` + horn `50850`, r 0.392 | 19.08, 3.46 |
| coupler pin on horn | horn r 0.286 and upper rod r 0.117 agree | 20.78, 2.59 |
| coupler pin on swing side | lower rod r 0.117 | 17.10, −0.80 |
| rocker axis | both `70710` shoulder screws, r 0.20 | 18.90, −2.98 |

**A bbox extreme is a plausible pin location, never a measured one.** If a link
length matters, find the bore. Two independent parts agreeing on the same origin
(horn and rod above) is the check that you found the real pin.

### Solving a closed linkage

The tunnel clamp is a planar four-bar in Y–Z at X ≈ −10: servo horn (crank) →
rod ends and spring (coupler) → magnet swing (rocker).

Measured: crank **1.910**, coupler **5.003**, rocker **2.827**, ground **6.443**.

Drive the rocker, solve the crank by the cosine rule, take the **`+acos`
branch** — it reproduces the modelled crank angle (−27.10°) at rocker 0, and
that reproduction *is* the proof the pin estimates are self-consistent. If your
branch does not return the modelled pose at zero, your pins are wrong.

Place the coupler from its **two pin correspondences** (a planar rigid transform
from two points), not by rotating it about anything.

28° of swing costs ~41–47° of servo. A 30° swing needs a ~78° throw, which is
why animating the swing alone looked wrong: **the horn is the part that moves
most**, so leaving it static reads as broken.

### Which parts belong to a moving group

`10388-Pellet Delivery System` is **flat** — 91 direct children, mostly loose
screws, no per-stage sub-assemblies. Nothing in the model records membership.

- **Height tiering is wrong.** `60598-X_frame` sits high but is bolted to the Y
  carriage and *carries* the X rail, so it rides Y, not X. Same error one level
  up with `60597-Yframe`.
- **Proximity alone is wrong.** It put the base plate and the vat on moving
  stages because they touch a carriage.
- **What works:** name all the non-fastener parts explicitly (34 of 89 here) and
  assign only the fasteners by nearest bbox gap. Disambiguate duplicate
  component names (two slide carriages, three steppers) by bbox centre height —
  that is the one legitimate use of height.
- **Watch out for routed-wire components** (`50830` `50835` `50888` `50902`).
  Their bounding boxes envelope the whole module, so they wreck any
  nearest-contact grouping *and* any camera fit. Hide them.

The durable fix is to group the stages as sub-assemblies in the CAD, which is
worth doing regardless.

---

## 4. Define the motion

### Nesting: offsets are cumulative

The bug that shipped once: every part got exactly one stage's offset, so each
axis moved in isolation and the gantry came apart. Membership was right;
composition was missing.

| group | offsets it receives | why |
|---|---|---|
| fixed | — | base plate, base rails, vat, mount magnets, base end stop |
| X frame | **Y** | the Y motor drives the X, Y and Z frames together |
| Y frame | **Y + X** | the X motor drives the Y and Z frames |
| Z frame | **Y + X + Z** | the Z motor drives only the Z frame |

Machine Y is world Z here (the base rails run along Z), machine X is world X,
machine Z is world Y.

**Each motor rides the axis it drives.** The Y motor is bolted to the X frame,
the X motor to the Y frame, the Z motor to the Z frame — every motor is mounted
on the leading frame of its own driven set and translates with its own output.
Confirmed by the owner; do not "correct" it to the more usual stationary-motor
arrangement.

Rotating sub-parts nest one level deeper: the scoop rotates about its bearing
*and* takes all three translations; the barrier is **frame-mounted**, so it
takes the translations and its own vertical rotation but **no part of the
scoop's rotation**. Binding it to the scoop axis made it swing away and vanish
mid-cycle.

### Order comes from the rig's own config

Do not invent choreography. `load_pellet` in
`~/Documents/auto-trainer/tests/move_config.yaml`:

```
y 0 → barrier_arm 110 → x 25 → load_arm 5 → z 22
    → load_arm 114 (speed 25) → z 10 → tone 5000 → barrier_arm 80
```

`barrier_arm` rests at 80 (`cover_pellet` 80, `release_pellet` 95). Servo ranges
from `motor_config.yaml`: `pellet.load` and `pellet.barrier` are 0–120,
`tunnel.magnet` and `tunnel.gate` 0–100.

**The config omits a step the rig performs.** `load_pellet` never returns
`load_arm`; the rig does, via the `retrieve` predefined on
`PELLET_LOAD_SERVO`. **The arm must be back at flush before the barrier
closes**, or the barrier shuts over a raised arm. Shipped order:

```
barrier 80→110, x→25, z→22, load_arm 5→114, z→10,
load_arm→5 (retrieve), barrier 110→80, send
```

`send_pellet` is `predefined: send` → `fixed_position()`, a target stored **on
the device**, not in any repo config. Model it as a move to a delivery pose and
say so in the caption.

**Two calibrations exist and they disagree.** The repo's `tests/move_config.yaml`
(used for the shipped animation) and the live rig's
`configs/alogus_motors/move_config.yaml` on the lab share differ: `x` 25 vs 32,
`load_arm` 114 vs 84, and the live set adds a return traverse. The `alogus_motors`
copy is the live one. The *order* is the same either way, and since travel is
scaled to the rails' real stroke the millimetre values barely change the render
— but if exact fidelity ever matters, use the share copy.

### Signs and end poses are not in the config, so ask

The config gives magnitudes and order. It does not give:

- which way a 109° scoop rotation goes,
- which end of a swing is "released",
- which direction a barrier opens.

All three were resolved by rendering both options and asking. **Budget for
that** — it is one preview round trip, against a wasted two-minute capture and a
wrong shipped animation.

One thing you *can* measure: **"flush" / "in line with ground"**. The scoop
table's underside plane normal is `(0, −1, 0)` in the modelled pose, so
`load_arm 5` needed no offset at all — the CAD position already is flush. Check
before assuming an offset.

Also check the drive ratio: the M0170 and the scoop bearing are **coaxial**, so
servo degrees are scoop degrees 1:1 and `5 → 114` is a true 109°.

---

## 5. Choose the camera

### Fit by projecting corners, not by axis span

`Camera.viewExtents` on an orthographic camera is the **full width of a square
frame**, in model units. Fitting with `viewExtents = maxAxisSpan * margin`
clipped the pellet render on all four edges, because a box seen obliquely
projects wider than any of its own axes.

```python
def basis(az, el):                     # az measured from +Z toward +X
    ar, er = radians(az), radians(el)
    dv = (cos(er)*sin(ar), sin(er), cos(er)*cos(ar))   # target -> eye
    rn = hypot(dv[2], dv[0])
    right = (dv[2]/rn, 0.0, -dv[0]/rn)                 # = up x dv, normalised
    up = normalise(cross(dv, right))
    return dv, right, up
```

Collect every corner the animation can reach, project onto `right` and `up`,
set `viewExtents = 2 * max(halfWidth, halfHeight) * 1.05`, and aim at the
**projected** centre (`right*cu + up*cv + dv*cw`) — not the bbox centre. The
difference between the two is what pushes a subject off to one side.

Verified against rendered alpha: subject at 12..495 of 540 px, no edge contact,
every frame.

**Sweep the whole path, not one pose.** Sample the timeline (40 steps is plenty)
and transform each moving part's 8 bbox corners analytically — offset for a
slider, rotate about the pivot for a hinge. Blanket-padding a static bbox
instead cost 30% of subject size on the first tunnel pass.

### The view presets are Z-up and this model is Y-up

`ViewOrientations.IsoTopRightViewOrientation` here gives
`eye.y − target.y = −121.03` against a distance of 209.63 — **35.3° _below_ the
horizon**, a camera looking up at the rig from underneath. It silently broke
five captures.

Worse, the obvious fix (scaling the preset's `dy`) scales a *negative* number,
so raising the factor tilts further underneath:

| ELEVATION factor | Result |
|---|---|
| 0.92 | 33.0° below horizon |
| 1.60 | 48.5° below horizon |
| 2.40 | 59.5° below horizon |

**Build the direction from an explicit angle**, keeping only the preset's
horizontal bearing, and **assert the sign before every run**:

```python
assert vp.camera.eye.y > vp.camera.target.y, "camera is below the target"
```

Use `cameraType = OrthographicCameraType` — it reads technical rather than
photographic.

**Fit at the final angle, not the preset angle.** Computing extents from a fit
at the preset bearing and applying them at the working elevation left the
subject at 36% of frame. Set eye and target first, *then* fit.

### Finding an angle that shows the motion

Three rules, each learned by getting it wrong:

1. **Put the rotation plane in the screen plane.** For a hinge about X, the
   motion lives in Y–Z, so a view direction in the Y–Z plane (azimuth near 0 or
   180) projects the arc fully. Side-on to the hinge axis shows the arc; end-on
   shows nothing. The clamp went from azimuth 150 to **250** on exactly this
   basis.
2. **Turn a dominating flat panel edge-on.** `30597-PCB Enclosure SM Mount
   Panel` is a 20 × 12 cm plate normal to X and ate 45% of the wide pellet frame
   at az −40. Its screen width is its Z extent projected on `right`, so a
   shallower azimuth shrinks the panel and enlarges the mechanism at the same
   time: az −25 cut the panel ~30% and grew the mechanism ~18%.
3. **Check what the same change does to your translations.** Z motion projects
   onto `right` as `−dv_x/|dv_xz|` — 0.64 at az −40, 0.42 at az −25, 0.17 at
   az −10. Below about 20° the base traverse stops reading at all. az −25 is the
   corner of that trade, which is why it did not go shallower.

**Render the candidates.** Four azimuths × three poses is one script and settles
the question in a way reasoning does not. See step 7.

### Moving the camera

The build animation keyframes (azimuth offset, elevation, extents multiplier)
and interpolates with a smoothstep: high and wide to read the bare frame
(44°, 1.14×), down to 26° and in to 0.96× for the submodule inserts, back out
for panels. Total azimuth travel 44°.

**Hold extents near 1.0 at both ends.** Earlier keyframes zoomed out at the
start and finish, which is exactly what made both ends read as unfocused.

**A moving camera means nothing is static.** Measured frame-to-frame change on
the 100-frame run: minimum 1.58%. With a locked camera, tail frames can be
trimmed (only the last three transitions were under 0.35% different, so 48
frames became 45); with an orbiting camera no trimming is needed.

---

## 6. Choose the colours

### Two palettes for two jobs

**Colour by what moves — for a mechanism.** One hue per moving object,
everything static in one neutral. This is what shipped for both the pellet and
clamp animations, and it is the right default: it survives the ~300 px the
figure actually displays at, where a materially accurate render of a dark
machine collapses to a single silhouette, and it makes the nesting legible — you
can watch the lift ride the X carriage ride the base.

| animation | palette |
|---|---|
| pellet | grey fixed · red X frame · green Y frame · blue Z frame · yellow scoop · orange barrier · translucent grey vat · green PCB |
| clamp | dark static shell · green swing · cyan force contact · orange Clamp_Arm_B · yellow rod ends · red spring · blue horn · nickel magnets |

**Colour by material — for a static or assembly render**, where the subject is
the object rather than its motion. Part-number families map cleanly (confirmed
with the owner):

| Family | Kind | Appearance |
|---|---|---|
| `1xxxx` | sub-assemblies | (container, no appearance) |
| `2xxxx` `3xxxx` | sheet metal, machined | `Aluminum - Anodized Glossy (Grey)` |
| `4xxxx` `7xxxx` | fasteners, press-fit | `Stainless Steel - Polished` |
| `5xxxx` | purchased COTS | per part — see below |
| `6xxxx` | 3D printed | `Paint - Metallic (Dark Grey)` |
| `8xxxx` | PCB | `Plastic - Matte (Green)` |

COTS specifics: rails `50793`/`50857` → `Stainless Steel - Satin`; steppers
`50903` → `Steel - Satin`; servos `50898`/`50919` → `Plastic - Glossy (Black)`;
magnets `50901` → `Nickel - Polished`; switches `50799`/`50800` →
`Plastic - Matte (Black)`; bearing `50798` → `Stainless Steel - Polished`.

### Pure black is unusable

`Plastic - Matte (Black)` on the printed parts renders as a flat silhouette: no
shading, and the visible-edge lines are black too, so nothing separates adjacent
parts. Four candidates compared side by side at 440 px:

| candidate | verdict |
|---|---|
| `Plastic - Matte (Black)` | flat silhouette, no readable geometry |
| `Coating - Black Oxide` | too dark, loses detail |
| **`Paint - Metallic (Dark Grey)`** | **reads as black plastic, keeps its shading — adopted** |
| `Plastic - Matte (Gray)`, `Paint - Enamel Glossy (Grey)` | read as grey, not black |

### A translucent vessel is worth the departure

The pellet vat is drawn `Plastic - Translucent Matte (Gray)`. The scoop dips
inside it at the one moment the animation exists to show, and **no camera angle
sees in**. Drawing the enclosing vessel translucent is a standard
technical-illustration convention; it is honest because the caption says so.

**That appearance does not actually render translucent.** Measured on the
prosthetic box, whose 24 × 24 in lid and rubber mat hide the entire mechanism:
every `Plastic - Translucent *` variant, Matte and Glossy alike, renders **fully
opaque** in the shaded viewport, at both `ShadedVisualStyle` and
`ShadedWithVisibleEdgesOnlyVisualStyle`. What does render transparent is the
true glass family — `Glass (Clear)`, **`Acrylic (Clear)`** (adopted for the
prosthetic lid) and `Polycarbonate (Clear)`. `Glass - Window` is transparent but
tints the whole frame teal.

So **check the shipped pellet vat: it is probably opaque.** This is a render
comparison, not an inference from a screenshot — the Acrylic frames show the
Buttkicker and flexure beam through the lid, the Matte ones show a grey slab.

### What the shaded viewport actually honours

- **Editing an appearance's colour does nothing.** Copying `Plastic - Matte
  (Black)` and setting `surface_albedo` to three different charcoals produced
  three *identical* renders, with the property reading back changed. Three
  darkness levels of `Plastic - Matte (Gray)` likewise. **Pick appearances from
  the library by name; do not try to tune one.**
- **An occurrence-level override masks every body-level override beneath it.**
  The PCB highlight silently did nothing until the board occurrence *and its
  whole ancestor chain* were cleared (the chain carried a `Chestnut` on
  `Pellet PCB Mounting Assy`). `occ.appearance = None` on the board alone
  reports success and changes nothing. Clear ancestors first, then set
  `occ.bRepBodies.item(i).appearance`.
- **Restore body overrides with `= None`**, which drops back to inheritance.
  234 of 234 cleared cleanly, appearance audit 0 mismatches.
- **Apply an explicit colour base at the start of every run.** One capture
  inherited the previous preview's all-orange state, so its travelling highlight
  *cleared* components instead of lighting them. Frame 0 must be constructed,
  never assumed.
- **A few proxy-body overrides survive everything** — small blue features at
  some joints. Proxy-body appearance outranks an occurrence override. They read
  as anodised hardware and are worth leaving alone.

---

## 7. Preview before you capture

**This is the step that pays for itself.** A capture run is ~2 minutes plus
verification; a preview still is a few seconds. Every one of the following
errors was caught by a preview, and several had already shipped once because
there was no preview:

| Preview | Caught |
|---|---|
| stage-colour still | base plate and vat assigned to moving stages |
| stage-colour still, moved pose | stages moving independently instead of nesting |
| pose extremes | barrier bound to the scoop axis, swinging out of frame |
| pose extremes | scoop rotation sign ambiguous — sent both to the owner |
| angle grid | clamp unreadable at azimuth 150 |
| colour candidates | pure black printed parts unreadable |
| display-size composite | PCB highlight band invisible at 300 px |

### The four previews, in order

**1. Stage-colour still.** Colour every part by its kinematic group over a
neutral static, and render two stills: at rest, and with *every* axis and
rotation displaced at once. The second one is the nesting check — if a frame
separates from the stage that carries it, you see it immediately.

**2. Pose extremes.** Render the named poses of the sequence as a labelled grid,
one per key moment. This is also the collision check.

**3. Angle grid.** Candidate azimuths × the two extreme poses. Label every cell
with its azimuth so the answer is pickable rather than describable. Terms like
"counterclockwise" are ambiguous without a stated convention — render both
directions and let the owner point.

**4. Display-size composite.** Crop frames out of the **finished sheet** and
composite them at the width the figure actually renders at, on both theme
grounds. Judging a full-resolution frame is how the PCB band shipped invisible.

### Two techniques for reading your own previews

**Diff two poses to find what moved.** When a change is subtle, don't squint:

```python
bb = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 18 else 0).getbbox()
```

That located the scoop's motion in one call, and revealed that the large arm I
thought was the scoop was actually the barrier.

**Then zoom on that region.** Crop to the changed bbox plus padding and scale
up. The scoop looked static in a 420 px grid cell and was obviously turning at
3× on a 180 px crop.

### Sending previews to the owner

- One decision per column, labelled with the parameter value, not a description.
- Include the current shipped state as a reference cell when asking for a
  change.
- State your own reading and default, so a one-word reply is enough.
- Ask about **signs, end poses and directions**. Those are the things not in the
  config and not derivable from geometry.

---

## 8. Capture

### Frame budget and grid

Sheets must be square-celled and the frame count a perfect square, so the grid
is unambiguous. **GPU texture limit is 16384 px** on the long edge.

| animation | frames | grid | cell | sheet | size | duration |
|---|---|---|---|---|---|---|
| buildup | 100 | 10×10 | 660 | 6600² | 2.9 MB | scroll-driven |
| pellet (wide) | 81 | 9×9 | 540 | 4860² | 1.46 MB | 4.2 s |
| pellet-close | 81 | 9×9 | 540 | 4860² | 1.43 MB | 4.2 s |
| tunnel | 64 | 8×8 | 520 | 4160² | 839 KB | 3.6 s |
| pcb | 64 | 8×8 | 520 | 4160² | 1.1 MB | 3.6 s |
| prosthetic-build | 100 | 10×10 | 660 | 6600² | 1.82 MB | 6.0 s |
| prosthetic-function | 121 | 11×11 | 540 | 5940² | 1.08 MB | 6.0 s |

**Ship the uncropped square render canvas.** Cropping frames to a union alpha
bbox produced a 614 × 618 cell against a declared `aspect-ratio: 1/1`; a few
pixels of mismatch mis-registers every cell and the whole render reads as cut
off. The empty alpha margin costs almost nothing in WebP. (An earlier version of
this document recommended cropping. It was wrong.)

### Frame 0 has to be a composed image

It is the at-rest state every visitor sees before scrolling or clicking.

- **Do not stagger the opening stage.** Jittering the 14 frame-stage parts
  across the first 6% of the timeline left frame 0 containing a single corner
  leg at **1% fill**. All skeleton parts now share one window. Result: 68% fill
  at frame 0, 53% centred at (0.51, 0.51) at the end, no frame touching an edge.
- **Show everything at distinct offsets rather than building up from nothing**,
  so frame 0 already has the colourful modules in it.
- **For a highlight sweep, end where you started.** A travelling band that goes
  dark behind it returns to the same board the poster shows; a cumulative fill
  leaves the figure loud at rest.

### Gate visibility per frame, not just position

With a fixed camera, a part waiting at its offset is on screen the whole time.
Set `isLightBulbOn = (t >= window_start)` so parts appear as they are needed.
Keep offsets short when visibility is gated — parts hidden until their stage
need only a small travel to read as arriving, and short travel keeps them in
frame (scaling the offset table by 0.45 fixed edge clipping).

### Never move a container and its children together

The transforms compose. The build animation animates **children of the
enclosure**, so the snapshot has to cover `enc.childOccurrences` too — 246
transforms, not 31 — or the restore is silently incomplete.

### Per-body highlighting

`80027-Pellet Module PCB` is 234 generically-named bodies (`80026` has 129).

- **Body 233 is the substrate** (11.4 × 10.8 × 0.16). Highlighting it floods the
  frame — 1.6k orange pixels at frame 16 jumping to 122k at frame 32. Treat any
  body whose in-plane footprint exceeds ~25% of the board as substrate.
- **Cluster the rest** by XY bbox gap ≤ 0.12 cm: that recovers 85 real
  components from 233 bodies. Sort by centre X, pack into 16 sequential groups
  of roughly equal body count.
- **Only write the bodies that changed.** Re-setting all 234 every frame ran at
  roughly **one minute per frame**; diffing the active set brought a 64-frame run
  to a couple of minutes and 233 total writes.
- **Band width matters more than it sounds.** Two groups of sixteen lit at once
  was a few stray pixels at display size. **Four of sixteen** lights about a
  quarter of the board and reads as deliberate.
- A ±8° turntable keeps consecutive frames from being identical during a group's
  dwell.

### Hide list for the clamp

Keep the tunnel shell, floor, head bar, swing and its magnets, the servo, horn,
rod ends, spring, and **`60617-Clamp_Arm_B`** — hiding that one as "clutter" left
the push rod ending in mid-air, because the lower coupler pin bore sits inside
it. It rides the swing. The visible chain is swing → `60658` force contact →
`60617-Clamp_Arm_B` → rod end → spring → rod end → horn.

Hide the routed-wire components, the PCB enclosure, the humidity sensing, the
beads, and every fastener except the `70710` pivot pair. That is **62 of 84
leaves hidden**, and it is the difference between a mechanism and a pile of
floating screws.

---

## 9. Ship it to the page

### Generate the sheet, poster and CSS together

`scripts/build_demo_sprite.py <id> <frames-dir> --duration N` writes
`public/rig/<id>.webp`, `public/rig/<id>-poster.webp` and `src/demo-<id>.css`.

**`background-size` must live in the generated file, beside the keyframes it has
to agree with.** Going from a 9×5 to a 10×10 grid left `background-size: 900%
500%` behind in `spa.css` and mis-registered every cell. That pairing has
desynced twice; emitting both from one place makes it impossible.

**Use explicit `step-end` stops, one per frame.** Two chained `steps()`
animations (columns with an iteration count, rows over the full range) is more
compact but drifts: `steps(5, jump-none)` changes rows at fifths of *four*
intervals while columns wrap at fifths of *five*. For a single-axis strip,
`steps(N, jump-none)` is correct — plain `steps(N)` never reaches the last frame.

### Timeline and range

**Which timeline depends on where the figure sits, and they are not
interchangeable.** Below the fold: `view()`, relative to the figure. Above the
fold: `scroll(root)` — a `view()` timeline is already past its `entry` range at
load for anything in the first viewport, so it would show the final frame
immediately.

**Range, for a scroll-scrubbed figure:**

- `entry ... entry 100%` completes the instant the figure is fully in view,
  which for a figure inside a just-opened `<details>` is *immediately*.
- plain `cover` scrubs the opening frames while the figure is still below the
  fold and the closing frames while it is already leaving the top — both ends
  play out of frame.
- **`contain 8% … 92%`** is what shipped: the window where the figure is wholly
  on screen, inset at both ends so the first and last frames get a beat of
  stillness.
- `contain` degenerates when the figure is taller than the viewport, so keep a
  `@media (max-height: 45rem)` fallback to `cover 32% … 68%`.

**Never animate opacity on a scroll-driven timeline** (also in `AGENTS.md`). A
`view()` timeline holds an element at its start state when it cannot advance, so
a faded keyframe leaves content permanently invisible.

**On fine pointers the range above is no longer what drives the scrub.**
`src/rig-scrub.css` swaps the timeline back to `auto` and seeks with a negative
`animation-delay`, because `contain 8% … 92%` is only ~365px of travel and a
100-frame sheet scrubbed at ~3.6px per frame — roughly four wheel notches for
the whole build. `useWheelScrub` in `App.jsx` now maps one notch to one frame.
Two consequences for a new sheet: the frame count must be added to `siteData.js`
as `figureFrames` or the mapping has nothing to divide by, and the seek is
biased half a step past each keyframe stop, since a value landing exactly on a
`step-end` boundary resolves to the *previous* frame once float rounding is
involved. The `view()` range still governs coarse pointers and reduced motion,
so keep it correct.

### Payload gating

- Whole site for reference: ~168 KB JS + 43 KB CSS. The five sprites are 7.9 MB,
  so gating is not optional.
- Posters total ~134 KB and are the only thing that loads eagerly.
- Sprite URLs are attached **only** inside
  `@media (prefers-reduced-motion: no-preference)` (+ `@supports` for the
  scroll-driven one), so reduced-motion visitors never download them.
- **A closed `<details>` does NOT stop a CSS background from being fetched.**
  Measured: the sheet loaded before the case study was ever opened. CSS
  backgrounds have no declarative lazy-load, so the URL is gated behind a class
  React adds on the `toggle` event. Confirmed poster-only before open.

### Presentation

**Colour-accurate renders need a plate.** Once printed parts are genuinely dark
they vanish against the dark theme's ground. Both themes paint the figure
surface with `--plate` — a light sheet (`--n-100` light, dimmed `#c9d0d4` dark)
plus a hairline `--rule` border. It reads as a drawing plate rather than a glare
panel, and it is the only reason an honest palette is shippable at all.

**Do not add padding or change `background-origin` on `.demo-figure`.** The
generated `background-size` percentages resolve against the padding box, so
either would silently rescale every sprite grid.

**Synchronized figures** need no JS: give both `.is-playing` in the same render
with the same frame count and duration, and `steps(1)` keeps them frame-locked.
They do need width — side by side in the narrow figure column they were 205 px
each, so the demo stage moved to its own `grid-column: 1 / -1` row under the
two-column case body, giving 428 px each.

**Figure beside the prose, not above it.** `.case-body--figure` is a two-column
grid with the prose blocks in a `.case-text` wrapper.

---

## 10. Verify

### The preview pane cannot be trusted for timing

The Browser pane goes hidden between calls, and **a hidden document freezes
`document.timeline`** — CSS animations sit at `currentTime: 0` with
`playState: "running"`, and 40 samples all report the same frame. Screenshots
can also come back blank or stale while the DOM is provably fine (right rects,
opacity 1, correct background).

**Check `document.visibilityState` before believing any timing measurement.**

### What is reliable

Run after every rebuild:

- keyframe count vs sheet dimensions vs declared grid, straight off the files
- every frame position landing on the grid step, last keyframe at `100% 100%`
- computed `background-size`, `animation-name`, `animation-duration` and
  `data-demo` per demo button
- asset requests returning 200
- rendered alpha bbox per frame: no edge contact, sensible fill and centre
- every `/rig/...` URL in the built CSS resolving inside `dist/`

### And look at it

Composite frames from the **shipped sheet** at display width on both theme
grounds. That is what caught the invisible PCB band, and it is the only check
that answers "is this any good" rather than "is this correct".

---

## Appendix A: measured constants for this assembly

**Pellet axis mapping** (derived from rail geometry, corroborated by the tunnel
sitting +12.7 cm in model-Z and the vat +7 cm in model-X):

| Machine axis | Meaning | Model direction | Rail | Rail Y |
|---|---|---|---|---|
| X | to/from the pellet vat | **+X** | `50857-SSEB8-55` | 10.0 |
| Y | to/from the tunnel | **+Z** | `50793-SSEB6-55_MAX` ×2 | 8.7 |
| Z | up/down | **+Y** | `50857-SSEB8-55_Z-DEFAULT` | 14.6 |

Usable stroke is ~30 mm per axis (55 mm rail less the carriage), not the 35 mm
nominal.

**Pivots:**

| mechanism | axis | location |
|---|---|---|
| pellet scoop | X | Y 14.69, Z −10.84 |
| pellet barrier | Y (vertical) | X −8.63, Z −8.73 |
| clamp servo/horn | X | Y 19.08, Z 3.46 |
| clamp swing | X | Y 18.90, Z −2.98 |

**Clamp four-bar:** crank 1.910, coupler 5.003, rocker 2.827, ground 6.443.
Modelled crank angle −27.10°. Feasible rocker range −128° … +46°.

**PCBs worth featuring:** `80027-Pellet Module PCB-02` (234 bodies) and
`80026-Tunnel Module PCB-01` (129). The other five boards are skipped.

---

## Appendix B: mistakes that cost real time

Each of these shipped or nearly shipped. Kept short, as a pre-flight list.

1. **Preset camera resolved 35° below the horizon** — Z-up preset, Y-up model.
   Assert `eye.y > target.y`.
2. **Scaling the preset's `dy` to fix elevation** made it worse; the number was
   negative.
3. **Fitting at the preset angle**, then rendering at the working angle — subject
   at 36% of frame.
4. **Fitting on `maxAxisSpan`** — clipped on all four edges. Project the corners.
5. **Fitting with everything forced visible** — re-enabled the hidden CAN
   harnesses, extents 109.4 vs 80.1.
6. **Fitting on a container's bbox** — included its hidden children.
7. **Blanket-padding the bbox for a swept path** — lost 30% of subject size.
8. **Staggering the opening stage** — frame 0 at 1% fill.
9. **Cropping frames to the union alpha bbox** — non-square cell, every sheet
   cell mis-registered.
10. **`background-size` left in the stylesheet** after a grid change — desynced
    twice.
11. **`animation-range: entry … 100%`** on a disclosure-revealed figure —
    completes instantly, nothing to scrub.
12. **Plain `cover`** — both ends of the sequence play out of frame.
13. **Assuming a closed `<details>` lazy-loads** — it does not.
14. **Inferring shaft axes from bbox proportions** — two of three steppers
    backwards.
15. **Estimating pin locations from bbox extremes** — coupler 1 cm out, and a
    confident published claim about a linkage limit that did not exist.
16. **Height-tiering stage membership** — `X_frame` one stage too deep.
17. **Proximity-only membership** — base plate and vat on moving stages.
18. **One offset per part instead of cumulative** — every axis moved
    independently and the gantry came apart.
19. **Binding a frame-mounted part to a rotating axis** — the barrier swung out
    of frame.
20. **Omitting the arm-return the config omits** — barrier closed over a raised
    arm.
21. **Hiding a linkage bracket as clutter** — push rod ended in mid-air.
22. **Editing an appearance's albedo** — no effect, silently.
23. **Setting body appearance under an ancestor override** — no effect, silently.
24. **Not applying an explicit colour base** — inherited the previous run's
    state and inverted the highlight.
25. **Pure black printed parts** — flat silhouette, no readable geometry.
26. **Judging a highlight at full resolution** — invisible at display size.
27. **Bulk-reading proxy-body bbox + appearance** — crashed Fusion.
28. **Re-setting all 234 body appearances per frame** — one minute per frame.
29. **Believing a timing measurement from a hidden browser pane** — the
    timeline is frozen.
30. **Treating an MCP timeout as a failure** — the run had completed.

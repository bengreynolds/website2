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
| 8 | Capture | Spend the pixel budget on cell size before frame count. Lock the camera, apply an explicit colour base, restore at the end. |
| 9 | Ship | Generate sheet, poster and CSS together, name the poster frame, and gate the payload. A re-capture is never a one-file change. |
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
is unambiguous. **WebP's hard limit is 16383 px** on a side. That is not a GPU
texture limit and it is not 16384: libwebp raises `encoding error 5` at exactly
16384, which the guard in `build_demo_sprite.py` used to let through.

#### The budget is `frames × cell²`, and it is memory

Bytes are the forgiving half. Measured on the `pellet` sheet, re-encoded at
five resolutions: **file size scales as roughly pixels^0.74**, so doubling the
pixel count costs about 1.67× the bytes.

| sheet side | MPix | WebP q82 |
|---|---|---|
| 2700 | 7.3 | 617 KB |
| 3240 | 10.5 | 843 KB |
| 3780 | 14.3 | 1078 KB |
| 4320 | 18.7 | 1304 KB |
| 4860 | 23.6 | 1468 KB |

The decoded bitmap is the unforgiving half, and it is **linear**: RGBA is
4 bytes a pixel, so `buildup` at 6600² is 43.6 MPix and **174 MB of decoded
image** that the browser holds for as long as the figure is live. That, not
download size and not the 16383 cap, is what actually limits a sheet. All
thirteen shipped sheets together are 305 MPix — 1.2 GB if they were ever
resident at once, which is why nothing is fetched until a control is pressed.

**Treat ~6400 px a side (≈41 MPix, ≈164 MB) as the ceiling for one sheet**, and
spend it on cell size before frame count. `buildup` already spends 6600 on 100
frames at cell 660; the same sheet as 64 frames at 825, or 49 at 940, is
visibly sharper on the page and no heavier. A 2× tier is *not* available at
high frame counts — `pellet` at cell 1080 would be 94 MPix and 378 MB.

The exception is a cyclic mechanism, where frame rate is the content. `pellet`
runs 81 frames in 4.2 s (19 fps); cutting it to 49 frames to buy resolution
would drop it to 12 fps and read as choppy. **Assembly sequences give up frames
cheaply — the reader steps them one press at a time. Cycles do not.**

#### Size the cell against the slot it lands in

Measured widths of the live containers, at DPR 1:

| slot | selector | width |
|---|---|---|
| project page, sequence | `.rig-figure` | `min(100%, 82vh)` — 590 at a 720-tall viewport, **738 at 900**, 886 at 1080, 1181 at 1440; 335 on a 375 px phone |
| project page, one demo | `.demo-figure` | 640 (capped by `.demo-stage` at 40rem) |
| project page, paired demos | `.demo-figure` | 617 at a 1440 viewport, 662 at 2560, **162 at 375** |
| project page, trio's third | `.demo-stage--trio > :nth-child(3)` | 544 |
| home tile | `.tile-plate` | 355 at a 1440 viewport |

Note the span: one sheet serves 162 px to 1181 px, a factor of seven. It cannot
be right at both ends, and the project page is the end that matters — the home
tile is a hover flourish, the project page is where the figure is the subject.

The number to check is **source pixels per CSS pixel** at the largest common
slot. The screenshot pipeline in `docs/software-animation-patterns.md` targets
1.85 and is sharp on a retina panel. Every CAD sheet currently shipped is
between 0.54 and 0.89, so all of them are upscaled 2.2–3.7× at DPR 2:

| sheet | frames | grid | cell | sheet | size | duration | shown at | src px / CSS px |
|---|---|---|---|---|---|---|---|---|
| buildup | 100 | 10×10 | 660 | 6600² | 2.88 MB | play, 7 s | 738 | 0.89 |
| pellet (wide) | 81 | 9×9 | 540 | 4860² | 1.43 MB | 4.2 s | 617 | 0.88 |
| pellet-close | 81 | 9×9 | 540 | 4860² | 1.40 MB | 4.2 s | 617 | 0.88 |
| tunnel | 64 | 8×8 | 520 | 4160² | 839 KB | 3.6 s | 640 | 0.81 |
| pcb | 64 | 8×8 | 520 | 4160² | 1.07 MB | 3.6 s | 640 | 0.81 |
| lickrevolver-build | 81 | 9×9 | 540 | 4860² | 543 KB | 10 s | 640 | 0.84 |
| lickrevolver-trial | 81 | 9×9 | 540 | 4860² | 591 KB | 13 s | 617 | 0.88 |
| lickrevolver-trial-close | 81 | 9×9 | 540 | 4860² | 874 KB | 13 s | 617 | 0.88 |
| lickrevolver-ui | 81 | 9×9 | 540 | 4860² | 1.33 MB | 13 s | 544 | 0.99 |
| reach-single | 49 | 7×7 | 540 | 3780² | 472 KB | 4 s | 640 | 0.84 |
| reach-session | 81 | 9×9 | 540 | 4860² | 820 KB | 5 s | 640 | 0.84 |
| prosthetic-build | 144 | 12×12 | **400** | 4800² | 1.16 MB | play, 7 s | 738 | **0.54** |
| prosthetic-function | 169 | 13×13 | **380** | 4940² | 840 KB | 10.5 s | 640 | **0.59** |

The two `prosthetic` sheets are the outliers and they show what the trade costs
in practice: both were cut for a smaller container, both spent their whole
budget on frames, and the project-page rewrite then grew their slot without a
re-capture. At 144 and 169 frames they are the two sheets that cannot be
re-tiered, only re-shot.

**An earlier version of this table was wrong about both of them** — it recorded
`prosthetic-build` as 100 frames at cell 660 and `prosthetic-function` as 121 at
540. Read the generated `src/rig-*.css` and `src/demo-*.css` headers, which the
build step writes from the frames it actually composed, rather than this table.

#### Check the fit before blaming the cell

Cell size is not the only place resolution leaks. The subject's union alpha
bbox across every frame, measured on the shipped sheets:

| sheet | swept subject | share of cell |
|---|---|---|
| pellet | 365 × 384 | **71%** |
| pellet-close | 427 × 326 | 79% |
| buildup | 561 × 545 | 85% |
| lickrevolver-build | 474 × 271 | 88% |
| tunnel | 461 × 331 | 89% |
| pcb | 494 × 359 | 95% |
| prosthetic-build | 386 × 312 | 96% |

`lickrevolver-ui`, `reach-single` and `reach-session` are absent because they
are RGB with no alpha channel, so there is no bbox to measure. They are screen
content rather than CAD renders; the fit has to be judged by eye there.

`pellet` throws away 29% of its linear resolution to empty margin — worth 1.37×
for free, at no cost in pixels, bytes or frames. Tighten the fit before
enlarging the cell. The counter-pressure is mistake 7 (blanket-padding a swept
path lost 30% of subject size) and mistake 4 (fitting on `maxAxisSpan` clipped
all four edges), so project the corners over the whole path, then inset — do not
pad a static bbox and do not crop the frames afterwards, which is mistake 9.

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

### Re-capturing a figure that already ships

Regenerating a sheet is not a one-file change, and the generator cannot do any
of the following for you. Work the list before you re-shoot anything, because
several of these fail silently.

**1. Name the poster frame. It is not a placeholder.** `--poster-frame`
defaults to `first`, and the generated CSS attaches the sheet only inside
`prefers-reduced-motion: no-preference` — so under reduce the poster is the
*entire, permanent* rendering of the figure. An accumulating sequence that
takes the default ships a pile of loose parts as its picture.

Nothing recorded which frame each shipped poster came from, so it was recovered
by matching every poster against every cell of its own sheet:

| sheet | `--poster-frame` | evidence |
|---|---|---|
| buildup | `last` (99) | byte-identical to cell 99 — re-cut with `reposter_from_sheet.py` |
| lickrevolver-build | `last` (80) | byte-identical to cell 80 |
| prosthetic-build | `last` (143) | closest cell, 2× margin over the runner-up |
| reach-single | `last` (48) | closest cell, 2× margin |
| reach-session | `last` (80) | closest cell, 0.98 vs 1.43 |
| prosthetic-function | `first` (0) | closest cell, 0.54 vs 1.09 |
| pcb | `first` (0) | closest cell, 1.49 vs 1.75 |
| lickrevolver-trial | `first` (0) | closest cell |
| lickrevolver-trial-close | `first` (0) | closest cell |
| pellet | `first` (0) | cycle returns to its start; frames 0–2 tie |
| pellet-close | `first` (0) | same |
| tunnel | `first` (0) | same |
| lickrevolver-ui | **~33, mid-sequence** | frames 31–37 all tie near 1.00 against a worst cell of 18.7 — the interface dwells there. Neither first nor last; re-derive before trusting the index. |

The pattern to carry forward: **an accumulating sequence wants `last`, a cycle
wants `first`.** Only `lickrevolver-ui` is neither, because it is an interface
holding still mid-trial rather than a mechanism.

Only the two `last` posters that were re-cut from the sheet match byte for
byte. The rest were encoded from the original PNGs, so a cell re-encoded out of
the already-lossy sheet only ever gets close — the minimum is still the answer,
but the margin is compressed. Compare pixels, not bytes, when re-deriving one.

**2. Update `figureFrames` in `src/siteData.js` if the count changed.**
`SequencePanel` divides by it to write `--scrub` and `--scrub-steps`. A stale
value seeks the wrong cell while the counter reads correctly, which is the
hardest version of this bug to see.

**3. Import the new file in `src/main.jsx` *before* `rig-scrub.css`.** This is
load-bearing and was confirmed in the browser rather than reasoned: the
generated range rule and the override in `rig-scrub.css` are both `(0,3,0)`, so
source order alone decides between them. Enumerating the live CSSOM on the
prosthetic page returns the generated `contain 8% contain 92%` first and
`rig-scrub.css`'s `cover 22% cover 78%` after it, which is the only reason the
override wins. The `[data-scrub]` rules are `(0,4,0)` and are safe either way —
the comment in `rig-scrub.css` claiming order does not matter is true of those
and **not** of the bare range.

**4. `buildup` is a special case: half of its rules live in `src/spa.css`.**
It predates the generator, so `src/rig-buildup.css` carries `background-size`
and the keyframes and nothing else, while the poster attach, the sheet attach,
the timeline and the `max-height` fallback are hand-written in `spa.css` — the
poster attach at `:1367`, the rest in the `no-preference` block opening at
`:1395`. `rig-prosthetic-build.css`, written by the current generator, carries
all of it in one file.

Running `build_demo_sprite.py --scroll buildup …` therefore writes a
*self-contained* file and leaves the `spa.css` block behind as a duplicate
definition of the same selector — including a stale `animation-range` and a
hardcoded sheet URL. Delete the `spa.css` block in the same commit, and delete
the comment there that says not to move it into the generated file. That
instruction was right while the split existed and becomes wrong the moment the
figure is regenerated.

**5. `--duration` is silently ignored with `--scroll`.** The scroll template
has no duration slot; a played sequence gets its timing from
`--play-dur` (default `7s`) in `rig-scrub.css`, not from the generated file.
The CLI accepts the flag either way and the printed summary says
`scroll-scrubbed` rather than a duration, which is the only hint.

**6. The `--scroll` template still describes a UX the site no longer has.** It
emits `animation-timeline: view()` and a `contain`/`cover` range, from when
figures were scrubbed by the page. Nothing on the site scrolls a figure now —
`SequencePanel` drives them from Play and frame buttons — so that block
survives only as the fallback beneath `rig-scrub.css`'s overrides. It still has
to be correct, because it is what a coarse pointer and a browser without
`animation-timeline` fall back to, but do not read it as the intended
behaviour.

**7. Switching a sprite between timed and scroll leaves both files behind.**
`--scroll` writes `src/rig-<id>.css` and the default writes
`src/demo-<id>.css`; neither removes the other, and the generator does not warn.
Verified by running both modes over one id — two stylesheets, both claiming the
same sprite, no complaint. `reposter_from_sheet.py` is the only thing that
catches it (`two stylesheets claim <id>: … Delete the stale one first`), and it
only catches it the next time somebody re-cuts a poster. Delete the old file
yourself, and remove its `main.jsx` import in the same edit.

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
31. **Spending the whole pixel budget on frames.** `prosthetic-build` (144) and
    `prosthetic-function` (169) bought frame rate with cell size, at 400 and
    380 px. They were then re-homed onto a project page whose figure slot is
    738 px, so both render at ~0.55 source pixels per CSS pixel and are the
    softest things on the site. Frames and resolution come out of one budget;
    decide the split against the slot the figure will actually ship into, not
    against the one it is being cut for today.
32. **Letting the sheet inventory in this file drift from the files.** It
    recorded `prosthetic-build` as 100 frames at cell 660 and
    `prosthetic-function` as 121 at 540; on disk they are 144 at 400 and 169 at
    380. A table written by hand at capture time and never re-derived is a
    table that will be wrong. The generated `src/rig-*.css` and
    `src/demo-*.css` headers are written from the frames actually composed and
    are the source of truth.
33. **Not recording which frame each poster came from.** `--poster-frame` is a
    deliberate choice per sheet and nothing wrote it down, so thirteen posters
    had to be reverse-engineered by matching each one against every cell of its
    own sheet. Three were only resolvable because a cycle returns to its start;
    `lickrevolver-ui` still is not, beyond "somewhere in the 31–37 dwell". The
    manifest is now in section 9 — keep it current, because the poster is the
    whole figure under reduced motion.
34. **Attributing the size cap to the GPU.** `MAX_TEXTURE = 16384` guarded the
    wrong number for the wrong reason: WebP's own limit is 16383, so a sheet at
    exactly 16384 passed the guard and then failed inside libwebp with
    `encoding error 5`. The cap that actually binds is neither — it is the
    decoded RGBA bitmap, four bytes a pixel, held for as long as the figure is
    live.

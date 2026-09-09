# Fusion → website animation pipeline

Notes from the first capture pass on `00000-Full_System_Assy-00` (the Auto-trainer
rig). Written so later passes do not re-derive any of this. Everything below was
verified against the live model through the Fusion MCP connector, not assumed.

Reusable scripts live in `scripts/fusion/`.

---

## 1. Facts about this assembly

| Property | Value |
|---|---|
| Document | `00000-Full_System_Assy-00` |
| `designType` | `1` = **Direct** (non-parametric) |
| **Joints in design** | **0** |
| Top-level occurrences | 31 |
| Total occurrences | 684 |
| Visible leaf parts (skin on) | 579 |
| Overall extents | ~42.5 (X) x 36.1 (Y) x 62.4 (Z) cm |
| **Vertical axis** | **Y** (the top panel is the thin-in-Y part) |

### Why "0 joints" is the single most important fact

**It cuts both ways.**

Good: there is no constraint solver and nothing to fight. `occurrence.transform2`
can be set freely. Verified: a 10 cm translation applied exactly (`delta=10.000`)
and restored with `residual=0.000000`. A full 24-frame run restored with a worst
residual of `3.6e-15`. Assembly and explode animation is therefore the *reliable*
path here, not the fragile one.

Bad: **no motion is encoded anywhere in the model.** There is no slider joint to
drive. Every mechanism animation has to be hand-authored. Names like
`..._MAX_Position`, `SSEB6-55_SLIDE_MAX` and `SSEB8-55_Z-DEFAULT` are *frozen
placements*, not ranges the API can read.

---

## 2. API facts worth not rediscovering

- `occurrence.transform2` exists and is the one to use. Round-trip through JSON
  with `.asArray()` and `Matrix3D.setWithArray()`.
- `Viewport.saveAsImageFileWithOptions(SaveImageFileOptions)` supports
  `isBackgroundTransparent`, `width`, `height`, `isAntiAliased`. This is how you
  get transparent PNG frames at arbitrary resolution. One transparent sprite then
  serves both the light and dark site themes.
- `Camera.isSmoothTransition = False` is **mandatory** for frame capture. Leave it
  on and frames land mid-transition.
- `Camera.isFitView` must be **False** during the capture loop. Leave it on and the
  model rescales every frame as parts move.
- Capture the camera once against the *assembled* state, then re-apply that same
  camera object each frame. Do not call `fit()` inside the loop.
- `visualStyle = ShadedWithVisibleEdgesOnlyVisualStyle` is the key contrast lever.
  Most structural parts are the same light-grey aluminium; black edge lines are
  what separate them. Keep the model's real appearances, do not flatten to
  monochrome.
- MCP `execute` scripts must define `def run(_context: str)`. Do not catch
  exceptions inside `run` — the error message is the only debugging signal.
- MCP `read` / `screenshot` takes `direction` presets and its own
  `transparentBackground`. Good for spot checks; use the Fusion API for frame runs.

---

## 3. Geometry gotchas, learned the hard way

**The assembly renders as a closed grey box.** Everything worth showing is behind
the enclosure skin.

**`50858-Allentown Enclosure Lid-00` is not the occluder.** It is a small cage lid
*inside* the enclosure. Hiding only it changes nothing visible. To open the rig up,
hide these children of `10421-Enclosure Assy-00`:

```
30591-Side Panel_Solid-00
30590-Side Panel_Solid Opposite-00
30596-Top_Panel-00
10427-Back Panel Assy-00
Front Door Assy
10425-Top Door Assy-00
```

Optionally also, since they block the interior:

```
30587-Platform_Rail_Left-00        # 20 x 54 cm plates, not "rails"
20566-Platform Rail Right-00 (1)
10428-Water Shield Assy-00
```

**The large grey "wall" in an iso view is the floor, not a panel.** Measured by
projected screen area: `20557-Base_Panel-00` = 172,557 and
`30586-Collection_Pan-00` = 152,031, far ahead of anything else. A horizontal
41 x 55 cm plate projects as a huge parallelogram in a top-down iso and reads as a
wall. Bounding-box "find thin vertical plates" queries will never find it.

> **Use projected screen area, not bounding boxes, to answer "what is big on
> screen."** Project the 8 bbox corners with `Viewport.modelToViewSpace` and take
> the extent product. This resolved in one query what four bbox queries could not.

**Fusion draws the origin axis lines as an overlay on top of geometry.** Solid
parts therefore look translucent in screenshots. Do not infer transparency from a
screenshot.

**Check effective visibility, not `isLightBulbOn`.** An occurrence only renders if
it *and every ancestor* has its bulb on. Walk `assemblyContext` upward.

---

## 3b. Web integration, as shipped

Live in `src/spa.css` under "rig build-up", markup in the hero of `src/App.jsx`.

```
frame 508 x 398   strip 12192 x 398   565 KB   poster 23 KB
background-size: 2400% 100%          (24 frames side by side)
animation-timing-function: steps(24, jump-none)
```

`steps(N, jump-none)` is the correct stepping function for a sprite: it yields
exactly N discrete values including both 0% and 100%. Plain `steps(N)` never
reaches the last frame.

Three things worth keeping:

1. **The poster carries real weight.** The strip is declared only inside
   `@media (prefers-reduced-motion: no-preference)` + `@supports
   (animation-timeline: ...)`. Anyone outside that gets the ~25 KB still of the
   assembled rig and never downloads the strip.
2. **Timeline choice depends on where the figure sits, and it is not
   interchangeable.**
   - Below the fold: `view()`. The timeline is relative to the figure.
   - Above the fold: `scroll(root)`. A `view()` timeline is already past its
     `entry` range at load for anything in the first viewport, so it would show
     the final frame immediately.

   The figure moved from the hero into the project case study during this work,
   which meant switching from `scroll(root) 0 22vh` to
   `view() entry 0% cover 42%`. Verified scrubbing 0 -> 26 -> 52 -> 78 -> 100%.
3. **For an above-the-fold figure, the range must finish while it is still on
   screen.** `animation-range: 0 72vh` was wrong: at 52% of the animation the
   figure had already scrolled away, so the last half never got seen. `0 22vh`
   completed at ~212 px with the figure still 78% visible.
4. **A closed `<details>` does NOT stop a CSS background from being fetched.**
   Measured: the strip loaded before the case study was ever opened, so
   "put it in a disclosure for free lazy-loading" is false. The strip URL is
   gated behind a `.is-live` class that React adds on the `toggle` event.
   Confirmed: poster only before open, strip fetched on open. CSS backgrounds
   have no declarative lazy-load, so gating on an event is the only option
   short of switching to `<img loading="lazy">`, which would break the
   percentage `background-size` the responsive sprite depends on.

### Full assembly, 45 frames as a 9x5 grid

The shipped animation is the complete build, not a module drop-in: bare corner
legs, horizontal bars, platform rails, submodules, floor, side and top panels,
doors, then panel connectors. It animates **children of the enclosure**, not
just top-level occurrences, so the snapshot has to cover
`enc.childOccurrences` too (246 transforms, not 31) or the restore is silently
incomplete.

Never move the enclosure occurrence itself while also moving its children;
the transforms compose. Move the children only.

```
45 frames  460 x 460  ->  9x5 grid  4140 x 2300  1105 KB   poster 42 KB
background-size: 900% 500%
animation: rig-buildup step-end both
```

**A single strip cannot hold this.** 45 frames at 460 px is 20700 px, past the
16384 px texture limit, so it has to be a 2D grid.

**Keyframes are generated, one stop per frame, into `src/rig-buildup.css`.** Two
chained `steps()` animations (columns with `iteration-count`, rows over the full
range) is more compact but needs phase alignment across both axes: `steps(5,
jump-none)` changes rows at fifths of *four* intervals while the columns wrap at
fifths of *five*, so they drift. Explicit `step-end` stops cannot.

**Trim static tail frames.** Measured frame-to-frame pixel change: only the last
three transitions were under 0.35% different, so 48 captured frames became 45.
Worth measuring rather than eyeballing a contact sheet, where the tail *looked*
much more static than it was.

**The poster is a mid-sequence frame (27), not the last.** The last frame is the
finished closed enclosure. That is truthful but shows none of the work, and the
poster is the entire image for anyone who cannot animate it. Frame 27 has the
modules in, floor down, panels not yet closed.

**Panel connectors are near-invisible at this scale.** Ethernet, USB,
DisplayPort and the power switch are ~3 cm parts on a 42 cm box. They are in the
sequence for completeness but contribute almost nothing visually.

### Two bugs that only show up in the browser

**Do not crop frames to a union bounding box.** It produced a 614 x 618 cell
against a declared `aspect-ratio: 1/1`, and `background-size: 900% 500%` assumes
each cell is exactly the element's box. A few pixels of mismatch mis-registers
every cell and the render reads as cut off. Ship the **uncropped square render
canvas** so the cell is always PX x PX and the aspect can never drift. The empty
alpha margin costs almost nothing in WebP.

**`animation-range: entry ... entry 100%` is wrong for a figure revealed by a
disclosure.** It completes the moment the figure is fully in view, which for a
figure inside a `<details>` the reader just opened is immediately, so scrolling
does nothing at all. Use `cover`, which spans the figure's whole travel through
the viewport: `cover 12% cover 78%` yields 18 distinct frames across the sweep
and reaches both ends.

**Offsets should be short when visibility is gated.** Parts hidden until their
stage only need a small travel to read as arriving, and a short travel keeps
them inside the frame. Full-length offsets clipped frames at the canvas edge.
Scaling the offset table by 0.45 fixed it.

### The 100-frame version, and where the frame budget goes

```
100 frames  cell 660 x 660  ->  10 x 10 grid  6600 x 6600  2.7 MB   poster 42 MB->42 KB
background-size: 1000% 1000%      (owned by the GENERATED css, see below)
```

Four phases in the owner's order, with submodules inserted **top-down, one beat
at a time**, because that is how the rig is actually built into an open-top
enclosure:

| Phase | Window | Notes |
|---|---|---|
| Frame | 0.00-0.20 | legs, top rails, cross bar, mounting rods, platform rails |
| Submodules | 0.19-0.70 | 5 sequential beats, all entering straight down (+Y) |
| Panels | 0.68-0.86 | floor, collection pan, sides, back, top |
| Mounts, lids, doors | 0.83-0.955 | doors, guides, hinges, handle, cage lid, connectors |
| Fasteners | 0.93-1.00 | last, per the owner's order |

Submodules own the middle half of the timeline because that is the part worth
watching. Five beats rather than eleven individual parts: cage plus bottle,
tunnel plus step, pellet, camera plus webcam, Jetson plus blower. Eleven
sequential slots would have given each about four frames.

**`background-size` belongs in the generated file, not the stylesheet.** Going
from a 9x5 to a 10x10 grid left `background-size: 900% 500%` behind in
`spa.css`, which mis-registered every cell. It now lives in
`src/rig-buildup.css` beside the keyframes it has to agree with, so a grid
change cannot silently break it. Verified in the browser: 78 distinct frames
across an 80-step sweep, **0 frames off-grid** (every computed position lands
within 0.02% of a legal multiple of 100/9).

**Nothing is static once the camera moves.** Measured frame-to-frame change on
the 100-frame run: minimum 1.58%. The earlier static-tail trimming was only
needed because the camera was locked; an orbiting camera makes every frame
carry change, so no trimming is required.

### Dynamic camera

The camera is keyframed on (azimuth offset, elevation, extents multiplier) and
interpolated with a smoothstep, keeping the preset's horizontal bearing as the
base. It starts high and wide (44 degrees, 1.14x) to read the bare frame, drops
to 26 degrees and pushes in to 0.96x for the submodule inserts, then pulls back
out for panels and finishing. Total azimuth travel is 44 degrees.

Elevation is still built from an explicit angle, never from the preset's `dy`
(see the Z-up warning above).

### Pellet delivery: kinematics solved, legibility not

The axis mapping is settled, derived from rail geometry rather than guessed:

| Machine axis | Owner's description | Model direction | Rail | Rail height Y |
|---|---|---|---|---|
| X | to/from the pellet vat | model **+X** | `50857-SSEB8-55` | 10.0 |
| Y | to/from the tunnel | model **+Z** | `50793-SSEB6-55_MAX` x2 | 8.7 |
| Z | up/down | model **+Y** | `50857-SSEB8-55_Z-DEFAULT` | 14.6 |

Corroborated two ways: the tunnel sits +12.7 cm in model-Z from the pellet
module, and the vat +7 cm in model-X. Rail heights give the nesting: **Y carries
X carries Z carries the spoon.**

Stage membership for the 91 flat children, by bbox centre height Y, with
overrides:

```
Y < 8.75                    fixed (base plate, base steppers, Y rails)
8.75 <= Y < 9.6             rides machine-Y
9.6  <= Y < 12.5            rides machine-Y + X
Y >= 12.5                   rides machine-Y + X + Z
fixed by name:  Base_Pla, SSEB6-55_MAX, Pellet_Vat (the bucket does not move),
                Pellet PCB Mounting Assy, Base End Stop, PCB Enclosure Panel
forced to X:    SSEB8-55_Z-DEFAULT, Yframe_vmettetal   <- bolted TO the X stage;
                only their carriage rides Z, so height tiering puts them one
                stage too deep
```

Composition: a part on stage Z translates by all three; on X by machine Y and X;
on Y by machine Y only.

**Fit the camera AT the final angle, not at the preset angle.** Computing
`viewExtents` from a fit at the preset (below-horizon) bearing and then applying
those extents at a 26 degree elevation left the subject at 36% of the frame.
Set eye/target first, then `isFitView = True`, then read the extents back. Fixed
it to 47%.

**Open problem: the motion is correct but not legible.** 32 mm of travel on a
200 mm module is a small movement, and at sprite scale the module reads as a
dark mass. The kinematics and choreography are right; the presentation is not
persuasive. Options before shipping it: frame much tighter on the spoon and vat
rather than the whole module, exaggerate travel (dishonest, and an engineer
would notice), or animate the load and barrier servo rotations, which are the
motions that actually look like scooping.

Assets built and ready but deliberately NOT wired into the site:
`public/rig/pellet.webp` (100 frames, 10x10, 560px cells, 1.5 MB),
`public/rig/pellet-poster.webp`, and `src/pellet-demo.css` (time-based,
button-triggered, 4 s).

### Servo rotations: now modelled, from cylindrical faces

An earlier pass left every servo rotation out, because no pivot axis is
recorded in the model. They are recoverable: see *Read cylindrical faces to
find shafts and pivots* below. Both the pellet scoop and the tunnel clamp now
rotate about axes read straight off the geometry.

### PCB highlighting: how appearances actually resolve

Both boards are populated with discrete geometry, so per-component highlighting
is possible: `80027-Pellet Module PCB-02` has **234 bodies**,
`80026-Tunnel Module PCB-01` has **129**.

Three things have to be right or nothing highlights:

1. **Clear the appearance override on the whole ANCESTOR CHAIN, not just the
   board.** Both `80027-Pellet Module PCB-02` and its parent
   `Pellet PCB Mounting Assy` carry a `Chestnut` override, and an ancestor
   override masks every body appearance beneath it. Setting
   `occ.appearance = None` on the board alone **silently does nothing**: it
   still reports `Chestnut`, with no exception raised. Walk `assemblyContext`
   upward and clear each one, then assert `occ.appearance is None`.
   Clearing it also turns the board light grey, which gives highlights far
   better contrast than orange-on-chestnut would have.
2. **Set appearance on `occurrence.bRepBodies` (the instance proxies), not
   `component.bRepBodies`.** Both accept the assignment, but the proxies scope
   the change to this instance.
3. **Exclude the substrate.** The board itself is a single body spanning the
   whole outline. Highlighting it floods the frame the instant the sweep passes
   its centroid: measured 1.6k orange pixels at frame 16 jumping to 122k at
   frame 32. Treat any body whose in-plane footprint exceeds ~25% of the board
   as substrate rather than as a component.

**Performance:** re-setting all 234 body appearances every frame ran at roughly
**one minute per frame**. Only touching the bodies the sweep front crosses in
that frame (about four) brought a 64-frame run down to a couple of minutes.

### Fusion crashed on the PCB run: heavy proxy-body traffic is a real limit

The final PCB attempt never wrote a frame and took Fusion down with it. The
setup phase reads `boundingBox` and `appearance` for ~234 **proxy** bodies and
stores them for restore, which is a lot of API traffic before the loop even
starts; Fusion is single-threaded, so an MCP read issued meanwhile also times
out, which looks like a hang rather than a crash.

**The saved document survived because the scripts never save.** A crash
discards the in-memory modifications, so the cloud copy stays clean. On restart,
**decline** any offer to recover unsaved changes: recovering restores whatever
state the script died in.

Safer shape for a retry:
- Split it. One call to collect and persist the body order to JSON, a second to
  capture. The capture then needs no bulk reads.
- Skip the per-body appearance backup entirely. Clearing the ancestor chain and
  restoring that is enough, since the bodies had no individual overrides worth
  preserving.
- Fewer bodies: filter to components above a minimum size first, then order.

### Framing: fit on what is ACTUALLY VISIBLE

The shipped build animation opened on a frame filling **1%** of the canvas: a
single corner leg, off centre. Two independent causes, both worth remembering.

**1. Do not stagger the opening stage.** Jittering the 14 frame-stage parts
across the first 6% of the timeline meant frame 0 contained exactly one leg.
Frame 0 is the at-rest state a scroll-driven figure sits on, so it has to be a
composed image. All skeleton parts now share one window and arrive together.

**2. Fit the camera on the model's NATIVE visibility.** Forcing every
occurrence visible in order to compute the fit turns the normally-hidden
**65 cm CAN harnesses** back on. Measured: fitted extents 109.4 with them on
versus **80.1** with them off, a 37% inflation that shrank the subject to 20%
of frame. Snapshot `isLightBulbOn` first, fit against that, and never assume
"everything on" is the widest legitimate silhouette.

Three occurrences are natively hidden in this model and must stay that way:
`50916-CAN Bus Harness LONG-00`, `50915-CAN Bus Harness SHORT-00`,
`blower_holder_shifted`.

Result: frame 0 went from 1% fill to **68%**, the final frame from 43% and
off-centre to **53% centred at (0.51, 0.51)**, with no frame touching an edge.
Camera extents are also held near 1.0 across the whole path now; the previous
keyframes zoomed out at both ends, which is what made both ends read as
unfocused.

### Part-number families map cleanly to materials

Confirmed with the owner. Useful for colour-accurate renders:

| Family | Kind | Render as |
|---|---|---|
| `1xxxx` | sub-assemblies | (container, no appearance) |
| `2xxxx`, `3xxxx` | sheet metal, machined | light grey |
| `4xxxx`, `7xxxx` | press-fit hardware, fasteners | polished steel |
| `5xxxx` | purchased COTS | per part (servo black, magnet silver, rail steel) |
| `6xxxx` | 3D printed | black |
| `8xxxx` | PCB | green |

Appearances already present in the design and usable without touching the
material libraries: `Black`, `Anodized - Light Gray`, `Aluminum - Polished`,
`Dark Green`, `Rubber - Black`, `Polycarbonate - Clear`, `Smooth - Light
Orange`, `Cadet Blue`, `Canary`, `Chestnut`.

### Pellet gantry: membership is explicit, never by height

The owner confirmed the mechanism is a **nested gantry**: the Y carriage carries
the X rail, which carries the Z rail, which carries the spoon. Frames are rigid
*within* a stage but the stages stack.

Height tiering gets this wrong and must not be used. `60598-X_frame` sits at
Y=10.1 but is bolted to the **Y** carriage and carries the X rail, so it rides
Y, not X. The same error repeats one level up with `60597-Yframe`. Correct
membership:

```
FIXED     60590-Base_Pla, 50793-SSEB6-55_MAX x2, 60591-Pellet_Vat (the bucket
          does not move), Pellet PCB Mounting Assy, base stepper, base limits
RIDES Y   50793-SSEB6-55_SLIDE_MAX, 60598-X_frame_vmettetal, 50857-SSEB8-55
          (the X rail), the stepper driving X
RIDES X   50857-SSEB8-55_Slide_Carriage (the Y=10.0 instance),
          60597-Yframe_vmettetal, 50857-SSEB8-55_Z-DEFAULT, stepper driving Z
RIDES Z   50857-SSEB8-55_Slide_Carriage (the Y=14.0 instance),
          60599-Pellet_Spoon_Table, 60600-Food_Cap, 50919-KPower P0025 Servo,
          60670-Pellet Z Hard Stop, 60596-Servo_Mount, 50799-Limit Switch 90
```

Duplicate component names (two slide carriages, three steppers) are
disambiguated by bbox centre height, which is the only legitimate use of height
here.

### Camera framing: project the corners, do not use the max axis span

`Camera.viewExtents` on an orthographic camera is the **full width of a square
frame**, in model units. Fitting with `viewExtents = maxAxisSpan * margin`
clipped the pellet render on all four edges, because a box seen from an oblique
angle projects wider than any of its own axes.

The fit that works, now used by every capture:

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
then set `viewExtents = 2 * max(halfWidth, halfHeight) * 1.05`. Aim at the
projected centre (`right*cu + up*cv + dv*cw`), not the bbox centre - they
differ, and the difference is what pushes the subject off to one side.

Verified against the rendered alpha: the subject lands at 12..495 of 540 px with
no edge contact, on every frame of the run.

**Sweep the whole path, not one pose.** Sample the timeline (40 steps is plenty)
and transform each moving part's 8 bbox corners analytically - offset for a
slider, rotate about the pivot for a hinge. Blanket-padding the static bbox
instead cost 30% of subject size on the first tunnel pass.

### isLightBulbOn is not ancestor-aware, and container bboxes include hidden children

Two traps that both made the camera fit on geometry nobody can see.

`Occurrence.isLightBulbOn` is that occurrence's own switch. Hiding a parent does
not clear it on the children, and `Occurrence.isVisible` did not reflect the
ancestor either. Compute effective visibility by walking `fullPathName`:

```python
hidden = {o.fullPathName for o in root.allOccurrences if not o.isLightBulbOn}
def shown(o):
    parts = o.fullPathName.split("+")
    return not any("+".join(parts[:i+1]) in hidden for i in range(len(parts)))
```

And `Occurrence.boundingBox` on a *container* occurrence spans its hidden
children too. Fitting on the pellet module's top-level occurrence returned a box
reaching Y 29.8 - the hidden PCB enclosure. **Fit on visible leaves only**
(`o.childOccurrences.count == 0` and `shown(o)`).

### Appearances: what the shaded viewport actually honours

- **Editing an appearance's colour does nothing.** Copying `Plastic - Matte
  (Black)` and setting `surface_albedo` to three different charcoals produced
  three identical renders; the property reads back changed. Three darkness
  levels of `Plastic - Matte (Gray)` likewise rendered identically. Pick
  appearances from the library by name; do not try to tune one.
- **An occurrence-level override masks every body-level override beneath it.**
  The PCB highlight silently did nothing until the board occurrence *and its
  whole ancestor chain* were cleared with `occ.appearance = None` (the chain
  carried a `Chestnut` on `Pellet PCB Mounting Assy`). Clear ancestors first,
  then set `occ.bRepBodies.item(i).appearance`.
- **Restore body overrides with `= None`**, which drops back to inheritance.
  234 of 234 cleared cleanly and the appearance audit came back 0 mismatches.
- **Apply an explicit base at the start of every run.** One capture inherited
  the previous preview's all-orange state, so its travelling highlight
  *cleared* components instead of lighting them. Frame 0 must be constructed,
  never assumed.

### Pure black is unusable, and a translucent vessel is worth it

Colour accuracy and legibility fight each other, and there is a specific
resolution for this model.

`Plastic - Matte (Black)` on the printed parts renders as a flat silhouette: no
shading, and the visible-edge lines are black too, so nothing separates
adjacent parts. Four candidates compared at 440 px; **`Paint - Metallic (Dark
Grey)`** reads as black plastic and keeps its shading. `Coating - Black Oxide`
is too dark; `Plastic - Matte (Gray)` and `Paint - Enamel Glossy (Grey)` read
as grey rather than black.

The shipped palette:

| Family | Appearance |
|---|---|
| printed `6xxxx` | `Paint - Metallic (Dark Grey)` |
| the pellet vat `60591` | `Plastic - Translucent Matte (Gray)` |
| machined / sheet `2xxxx` `3xxxx` | `Aluminum - Anodized Glossy (Grey)` |
| fasteners `4xxxx` `7xxxx` | `Stainless Steel - Polished` |
| rails `50793` `50857` | `Stainless Steel - Satin` |
| steppers `50903` | `Steel - Satin` |
| servos `50898` `50919` | `Plastic - Glossy (Black)` |
| magnets `50901` | `Nickel - Polished` |
| switches `50799` `50800` | `Plastic - Matte (Black)` |
| PCB `8xxxx` | `Plastic - Matte (Green)` |

The vat is the one deliberate departure from accuracy: the scoop dips inside it
at the one moment the animation exists to show, and no camera angle sees in.
Drawing it translucent is a technical-illustration convention, and the caption
says so.

A handful of small blue features survive every override - they are proxy-body
overrides in the assembly context, which outrank an occurrence override. They
read as anodised hardware at the joints and are worth leaving alone.

### Read cylindrical faces to find shafts and pivots

This model has no joints, so every axis has to come out of geometry. A part's
largest cylindrical face is its shaft, bore or pivot:

```python
for body in occ.bRepBodies:
    for f in body.faces:
        if f.geometry.surfaceType == adsk.core.SurfaceTypes.CylinderSurfaceType:
            cyl = adsk.core.Cylinder.cast(f.geometry)   # .axis, .origin, .radius
```

What that settled, after bbox proportions had failed on all of it:

- The three pellet steppers: shaft along Z on the base (drives the base stage),
  along X on the X frame, along Y on the lift frame. Two of those I had
  assigned backwards from bbox proportions.
- A real **19 mm bearing bore along X** shared by `60596-Servo_Mount` and
  `50798-Ball Bearing`, at Y 14.70, Z -10.84. That is the scoop pivot, so the
  scoop turns about its own axis instead of riding rigid.
- The tunnel clamp's two axes: the servo and its horn share (Y 19.08, Z 3.46);
  both `70710` shoulder screws give (Y 18.90, Z -2.98).

Reading `component.bRepBodies` bounding boxes is cheap - 234 in one call, no
crash. It is *proxy* bodies, and especially bbox **and** appearance together,
that killed Fusion before. Cluster in component space; body indices match
`occurrence.bRepBodies`, so the highlight still applies to proxies.

### The tunnel clamp is a four-bar, and it closes exactly

Servo horn (crank) -> rod-ends and spring (coupler) -> magnet swing (rocker),
all planar in Y-Z at X about -10. Measured:

| link | length (cm) |
|---|---|
| crank, horn axis to rod pin | 2.083 |
| coupler, pin to pin | 6.048 |
| rocker, swing axis to rod pin | 2.830 |
| ground, crank axis to rocker axis | 6.443 |

Drive the rocker and solve the crank by the cosine rule; take the `+acos`
branch, which reproduces the modelled crank angle (-14.17 degrees) at rocker 0
and so proves the pin estimates are self-consistent. Place the coupler from its
two pin correspondences rather than rotating it about anything.

> **Retracted.** This section originally claimed the linkage locks near -32
> degrees and that this confirmed the owner's 30 degrees of travel. That came
> from a coupler length estimated off bounding boxes and 1 cm too long. See
> *Read pin bores, not bounding boxes, for linkage lengths* below for the
> measured geometry: there is no lock near 30 degrees.

A 30 degree swing needs a 78 degree servo throw, which is why animating the
swing alone looked wrong: the horn is the part that moves most.

For the clamp animation keep the tunnel shell, floor, head bar, swing and its
magnets, the servo, horn, rod-ends and spring. Hide the routed-wire components
(`50830` `50835` `50888` `50902` - their bboxes envelope the whole module and
also wreck any nearest-contact grouping), the PCB enclosure, the humidity
sensing, the beads, and every fastener except the `70710` pivot pair. That is
62 of 84 leaves hidden, and it is the difference between a mechanism and a pile
of floating screws.

### The PCB highlight: a travelling band, not a fill

`80027-Pellet Module PCB` is 234 generically-named bodies. Body 233 is the
substrate (11.4 x 10.8 x 0.16); highlighting it floods the frame, so it stays
green. Cluster the remaining 233 by XY bbox gap <= 0.12 cm, which recovers 85
real components, sort clusters by centre X, and pack them into 16 sequential
groups of roughly equal body count.

A travelling band that lights and goes dark behind it reads as a scan and,
unlike a cumulative fill, ends on the same dark board the poster shows. Set
only the changed bodies each frame (233 writes across the run, not 15,000). A
+/-8 degree turntable keeps consecutive frames from being identical during a
group's dwell.

Band width matters more than it sounds. Two groups of sixteen lit at a time was
invisible at the 300 px the figure actually displays at - a few stray orange
pixels per frame. **Four of sixteen** lights about a quarter of the board, so
the big connectors get a clear moment and the sweep reads as deliberate. Judge
this at display size, never on a full-resolution frame.

### Verify sprites offline; the preview pane cannot be trusted for timing

The Browser pane goes hidden between calls, and a hidden document freezes
`document.timeline`, so CSS animations sit at `currentTime: 0` with
`playState: "running"`. Screenshots can also come back blank or stale while the
DOM is provably fine. Check `document.visibilityState` before believing any
timing measurement.

What is reliable, and worth running after every rebuild:

- computed `background-size`, `animation-name` and `data-demo` per demo button
- keyframe count against sheet dimensions against declared grid, off the files
- every frame position landing on the grid step, and the last keyframe at
  `100% 100%`
- asset requests returning 200

`scripts/build_demo_sprite.py` emits the sheet, the poster and the CSS from one
place precisely so those checks cannot disagree.

### Colour-accurate renders need a plate on the page

Once the printed parts are actually dark, the figures disappear against the
dark theme's ground. Both themes now paint the figure surface with `--plate`, a
light sheet (`--n-100` on light, a dimmed `#c9d0d4` on dark) plus a hairline
`--rule` border. It reads as a drawing plate rather than a glare panel, and it
is the only reason the honest palette is shippable.

Do **not** add padding or change `background-origin` on `.demo-figure`: the
generated `background-size` percentages resolve against the padding box, so
either would silently rescale every sprite grid.

### Nested stages need CUMULATIVE offsets, not one offset each

The bug that shipped: every part was assigned to exactly one stage and then
given only that stage's offset. Each axis therefore moved in isolation and the
gantry came apart. Group membership was right; composition was missing.

The owner's description of the machine, which is what the code now implements:

| group | offsets it receives | why |
|---|---|---|
| fixed | — | base plate, base rails, vat, mount magnets, base end stop |
| X frame | **Y** | the Y motor drives the X, Y and Z frames together |
| Y frame | **Y + X** | the X motor drives the Y and Z frames |
| Z frame | **Y + X + Z** | the Z motor drives only the Z frame |

Machine Y is world Z here (the base rails run along Z), machine X is world X,
machine Z is world Y.

**Each motor rides the axis it drives.** The Y motor is bolted to the X frame,
the X motor to the Y frame, the Z motor to the Z frame — so every motor is
mounted on the leading frame of its own driven set and translates with its own
output. Confirmed by the owner; do not "fix" it to the more usual
stationary-motor arrangement.

### Read pin bores, not bounding boxes, for linkage lengths

I estimated the tunnel clamp's coupler pins from rod-end bbox extremes and got
a coupler **1 cm too long** (6.048 against the true 5.003). That error produced
a confident, wrong conclusion: that the linkage locks near −32°, and that this
independently confirmed the owner's remembered 30° of travel. It does not. With
the measured pins the rocker is feasible from **−128° to +46°** and there is no
lock anywhere near 30°.

The pins are small transverse cylinders and they read out exactly:

| feature | source | (Y, Z) |
|---|---|---|
| crank axis | servo `50898` and horn `50850`, r 0.392 | 19.08, 3.46 |
| coupler pin on horn | horn r 0.286 and upper rod r 0.117 agree | 20.78, 2.59 |
| coupler pin on swing side | lower rod r 0.117 | 17.10, −0.80 |
| rocker axis | both `70710` shoulder screws, r 0.20 | 18.90, −2.98 |

Corrected links: crank **1.910**, coupler **5.003**, rocker **2.827**, ground
**6.443**. The `+acos` branch reproduces the modelled crank angle (−27.10°) at
rocker 0, which is the check that the pin estimates are self-consistent.
28° of swing costs ~41–47° of servo, inside the 0–100 range `motor_config.yaml`
gives the tunnel magnet.

The general rule: a bbox extreme is a plausible pin location, never a measured
one. If a link length matters, find the bore.

### `60617-Clamp_Arm_B` is the rod's lower bracket and rides the swing

Hiding it as "clutter" left the push rod ending in mid-air, because the lower
coupler pin bore sits inside it. It moves rigidly with the magnet swing. The
visible chain is swing → `60658` force-sensor contact → `60617-Clamp_Arm_B` →
rod end → spring → rod end → horn.

### The pellet module's two servos, and the step that was missing

- **`60600-Food_Cap` is the barrier**, and it turns about a **vertical** axis at
  (X −8.63, Z −8.73) — the bore of the `50919` P0025 shaft. Both the servo and
  the barrier are **frame-mounted**: they translate with the Z frame and take no
  part in the scoop's rotation. Binding them to the scoop axis made the barrier
  swing away and vanish mid-cycle.
- **`60599-Pellet_Spoon_Table` is the scoop**, turning about the X bearing at
  (Y 14.69, Z −10.84). Its underside plane is already horizontal in the modelled
  pose, so `load_arm 5` — the owner's "flush, in line with ground" — needs no
  offset. The M0170 and that bearing are coaxial, so the servo angle is the
  scoop angle 1:1 and `5 → 114` is a true 109°.

`load_pellet` in `tests/move_config.yaml` ends with `barrier_arm 80` and never
returns `load_arm`. The rig does return it — that is the `retrieve` predefined
on `PELLET_LOAD_SERVO` — and **the arm must be back at 5 before the barrier
closes** or the barrier shuts over a raised arm. Shipped order:

```
barrier 80->110, x->25, z->22, load_arm 5->114, z->10,
load_arm->5 (retrieve), barrier 110->80, send
```

### Colour by what moves, not by material

The owner's call, and it is the right one for a mechanism: **one colour per
moving object, everything static in one neutral.** It survives the 300 px the
figure actually displays at, where a materially accurate render of a dark
machine turns into a single silhouette, and it makes the nesting legible —
you can see the lift riding the X carriage riding the base.

Shipped palettes: pellet — grey fixed, red X frame, green Y frame, blue Z
frame, yellow scoop, orange barrier, translucent grey vat, green PCB. Clamp —
dark static shell, green swing, cyan contact, orange Clamp_Arm_B, yellow rod
ends, red spring, blue horn, nickel magnets.

Material accuracy is still the right choice for a static or assembly render.
Keep the part-number table above for those.

### Turn a dominating flat panel edge-on

`30597-PCB Enclosure SM Mount Panel` is a 20 × 12 cm plate normal to X, and at
az −40 it ate 45% of the wide pellet frame. Its screen width is its Z extent
projected on the camera's right vector, so a shallower azimuth shrinks it and
enlarges the mechanism at the same time: az −25 cut the panel by ~30% and grew
the mechanism by ~18%.

The limit is that the base stage travels along Z, and Z motion projects onto
the right vector as `−dv_x/|dv_xz|` — 0.64 at az −40, 0.42 at az −25, 0.17 at
az −10. Below about 20° the traverse stops reading. az −25 is the corner of that
trade.

### Scroll range: contain, inset at both ends

`animation-range: cover 2% cover 98%` scrubs the opening frames while the figure
is still below the fold and the closing frames while it is already leaving the
top — both ends play out of frame. `contain 0% … 100%` is the window where the
figure is wholly on screen; **`contain 8% … 92%`** is what shipped, inset so the
first and last frames get a beat of stillness. A `@media (max-height: 45rem)`
fallback to `cover 32% … 68%` covers viewports too short for `contain` to have
any range at all.

### Synchronized figures

Two figures play together simply by getting `.is-playing` in the same render
with the same frame count and duration; `steps(1)` keeps them frame-locked with
no JS. They need width, though — side by side inside the narrow figure column
they were 205 px each, so the demo stage moved to its own `grid-column: 1 / -1`
row under the two-column case body, which gives 428 px each.

### MCP timeout does not mean the script failed

The 48-frame run returned `Request timed out` to the client, but Fusion kept
executing and wrote all 48 frames. Check the output directory before assuming a
failure and re-running. Because the last frame returns every part to its
original transform, the model had also already restored itself.

### Figure placement in a case study

The figure sits beside the prose, not above it: `.case-body--figure` becomes a
two-column grid and the three prose blocks move into a `.case-text` wrapper.
`animation-range: entry 12% entry 100%` completes the build exactly when the
figure is fully in view, verified at `visibleFraction: 1`. An earlier range let
it finish while the figure was still partly off screen.

**Frame 0 must be worth looking at.** The first tuned pass built the rig
sequentially, so frame 0 was a bare grey skeleton and the colourful modules only
arrived later. Since frame 0 is the at-rest state a visitor sees before
scrolling, the adopted version instead shows every module present at distinct
offsets and collapses them together. Fit the camera on the **exploded** state and
use a small `VIEW_MARGIN` (1.06); fitting the assembled state and padding out to
1.5 leaves the subject tiny.

Direction is currently exploded to assembled. Reversing it (land on the assembled
rig, explode on scroll) is a one-line change and would put the stronger image in
the at-rest state; it was left as assembly because that is what was asked for.

---

## 4. Pellet delivery kinematics (resolved)

> This section records how the axes were derived. Membership is now an
> explicit name list, not proximity - see *Pellet gantry: membership is
> explicit, never by height*.

`10388-Pellet Delivery System-01_MAX_Position` is a **flat** assembly: 91 direct
children, almost all loose screws, with no per-stage sub-assemblies. Three
`50903-Thinker Motion Stepper Motor-00` instances confirm three axes. Rail parts
present:

```
50793-SSEB6-55_MAX            50857-SSEB8-55
50793-SSEB6-55_SLIDE_MAX      50857-SSEB8-55_Z-DEFAULT
50857-SSEB8-55_Slide_Carriage (x2)
```

### Owner-supplied motion spec

Not in the model, so it is recorded here.

**Pellet delivery, 35 mm travel on each axis.** Axis meanings, in the owner's
terms:

| Axis | Direction |
|---|---|
| X | Toward and away from the pellet bucket |
| Y | Toward and away from the tunnel |
| Z | Up and down (the last stage) |

Method sanctioned by the owner: **infer the moving set from the SSEB slider
rails.** For each SSEB rail, the long bounding-box dimension gives the travel
axis, and the carriage plus everything mounted above it rides that axis. Relevant
parts:

```
50793-SSEB6-55_MAX            50857-SSEB8-55
50793-SSEB6-55_SLIDE_MAX      50857-SSEB8-55_Z-DEFAULT
50857-SSEB8-55_Slide_Carriage (x2)
```

Three `50903-Thinker Motion Stepper Motor-00` instances confirm three axes.

**Magnet swing, defined by end states rather than an angle:**

- **100%** = magnets flush with the tunnel front face
- **0%** = arm as straight as possible, magnets furthest from flush

So the sweep is derived from the geometry between those two poses rather than a
supplied angle. Parts: `10400-Magnet_Swing_Assy_Half_Inch_v3-00`,
`60616-Magnet_Swing_v7-02`, `10396-Servo_Arm_Assy-00`, `50850-Servo_Arm-00`,
`60658-Magnet Swing Force Sensor Contact-00`.

### The real choreography, from the rig's own config

The motion does not have to be invented. It is in the deployed config on the lab
share, and this is the sequence a "Demo" animation should reproduce.

Source of truth (live rig):
`Z:\PHYS\ChristieLab\Data\JetsonAutoTrainer\Jetson_install\alogus_install_assets\configs\alogus_motors\`

`load_pellet`, then `send_pellet`, then `release_pellet`:

| # | Move | Value | Reading |
|---|---|---|---|
| 1 | `y` | 0 | retract away from the tunnel |
| 2 | `barrier_arm` | 110 | open the barrier |
| 3 | `x` | 32 | traverse toward the pellet vat |
| 4 | `load_arm` | 5 | arm down into the vat |
| 5 | `z` | 22 | raise |
| 6 | `load_arm` | 84,25 | scoop |
| 7 | `z` | 8.8 | lower |
| 8 | `x` | 20 | traverse back |
| 9 | `tone` | 5000, 0.3 | 5 kHz cue, 0.3 s |
| 10 | `z` | -5.0 | \} `send` predefined |
| 11 | `x` | 16.0 | \} |
| 12 | `y` | 20.0 | \} extend toward the tunnel, presenting the pellet |
| 13 | `barrier_arm` | 98 | release |
| 14 | `tone` | 6000, 0.3 | 6 kHz cue, 0.3 s |

Axis ranges from `motor_config.yaml`: `load` and `barrier` are servos on 0-120;
`x`/`y`/`z` are steppers (microsteps 8; 48 steps/rev for x and y, 24 for z).
`tunnel.magnet` is 0-100, which matches the owner's "100% flush with the tunnel
face" definition. Three axis positions in the sequence (32, 22, 20) sit inside
the stated 35 mm travel, so the stepper values read as millimetres.

**Three cautions before animating from these numbers:**

1. **Two calibrations exist.** `configs/move_config.yaml` and
   `configs/alogus_motors/move_config.yaml` disagree (`load_arm` 20 vs 5, scoop
   91 vs 84, cover 83 vs 87, release 93 vs 98). The `alogus_motors/` copy is the
   live one.
2. **Steps 10-12 come from a stale dev config.** The `send` action is not in the
   `alogus_motors/` set; it resolves at runtime from `~/.alogus_config.yaml` on
   the Jetson. The copy on the share is from Feb 2025 and uses different
   conventions (negative z, `barrier` pinned to 50-51), so its numbers must not
   be mixed with the live set. The *order* (z, then x, then y toward the tunnel)
   is still the right structure.
3. **`load_arm: 84,25` has an unexplained second value.** `tone: 5000,0.3` is
   clearly frequency and duration, so `84,25` is probably position and
   speed, but that is an inference.

Reference for how these are consumed:
`auto-trainer-alogus-dev/tools/pellet_delivery/model/app_model.py` builds
`WhiskerMovement.from_dict(...)` for `load`, `home` and `send`.

### Remaining risk

`10388-Pellet Delivery System` is flat, so nothing in the model records which of
the 91 children ride which stage. Proximity alone got this wrong twice: it put
the base plate and the vat on moving stages because they touch a carriage. All
34 non-fastener parts are now named explicitly and only the 55 fasteners are
assigned by nearest contact. The durable fix is still to group the three stages
as sub-assemblies in Fusion, which is worth doing to the CAD regardless.

PCBs to feature: **Pellet Module and Tunnel Module only** (`80027-Pellet Module
PCB-02`, `80026-Tunnel Module PCB-01`). The other five boards are skipped.

---

## 5. Web delivery constraints

- **Sprite strips cap at 16384 px** GPU texture width.
- **Crop to the union alpha bbox across all frames before building the strip.**
  The 600 x 600 captures only contain content in a 456 x 482 box, so a naive strip
  spends a third of its payload on empty pixels. Cropping also shrinks the strip
  from 14400 px to 10944 px, comfortably inside the texture limit, so 24 frames
  need no 2D grid.
- **Do not resample after cropping.** Measured: the native 482 px-tall strip is
  540 KB, while resizing to 480 px produces 699 KB. Resampling introduces
  high-frequency detail that costs more than the two pixels saved.
- Measured final numbers for the 24-frame build-up:

  | Form | Size |
  |---|---|
  | 24 transparent PNG at 600 px (raw capture) | 2158 KB |
  | Cropped WebP strip, 10944 x 482, q82 | **540 KB** |

  Serve a single cropped frame as a static poster for LCP and let the strip load
  after, since the scroll animation starts at frame 0 anyway.
- Context: the whole site is currently 163 KB JS + 22 KB CSS. Four of these
  animations at raw PNG weight would be 20-30x the entire page.
- Therefore: **hero animation loads eagerly, module animations live inside the
  project's `<details>` case study** and cost nothing until opened.
- Scroll scrubbing uses `animation-timeline: view()` with a `steps()` animation on
  `background-position`. Zero JavaScript, and it reuses the motion layer already in
  `src/spa.css`.
- **Never animate opacity on a scroll-driven timeline** (see `AGENTS.md`). A
  `view()` timeline holds an element at its start state when it cannot advance, so
  a faded keyframe leaves content invisible in headless capture.

### Composition, tuned over four passes

Final values are in `scripts/fusion/capture_assembly.py`. What each pass taught:

| Pass | Change | Result |
|---|---|---|
| 1 | `viewExtents * 1.9`, `IsoTopRight`, skin only | Subject filled 33% x 47%. Platform rails still on, reading as a grey slab. |
| 2 | margin 1.22, elevation x0.42, offsets 52-58 cm | Subject 75% wide but clipped, view went flat and unreadable, and parts parked at their offsets hovered in frame for most of the sequence. |
| 3 | hide parts until their window opens | Fixed the hovering. Sequence finally reads. Floor still ~40% of the frame. |
| 4 | hide the floor, elevation x0.92, compress the grey opening | **Adopted.** Subject 67% x 61%, one frame clipped at the exploded extreme. |

Three specific lessons:

1. **Gate visibility per frame, not just position.** With a fixed camera, a part
   waiting at its offset is on screen the whole time. Set
   `isLightBulbOn = (t >= window_start)` so parts appear as they are needed.
2. **Hide the floor.** `20557-Base_Panel-00` plus `30586-Collection_Pan-00` is
   41 x 55 cm of empty grey plate. The rig's contents cluster high and to the
   back, so the floor was dead space. Corner legs and rails define the volume
   without it.
3. **Never scale the preset's elevation. Build the eye direction from an
   explicit angle.** See the warning immediately below, which invalidated the
   earlier approach. Use `cameraType = OrthographicCameraType` so it reads
   technical rather than photographic.

### The view-orientation presets are Z-up and this model is Y-up

`ViewOrientations.IsoTopRightViewOrientation` on this assembly produces
`eye.y - target.y = -121.03` against a distance of 209.63, i.e. **35.3 degrees
_below_ the horizon**. The preset is "top" with respect to Fusion's Z-up
convention; because this model's vertical axis is Y, the preset resolves to a
camera looking **up at the rig from underneath**.

That silently broke the first five captures, and worse, the fix at the time
(multiplying `dy` by an `ELEVATION` factor) scaled a *negative* number, so
raising the factor tilted the camera further underneath:

| ELEVATION factor | Result |
|---|---|
| 0.92 | 33.0 deg below horizon |
| 1.60 | 48.5 deg below horizon |
| 2.40 | 59.5 deg below horizon |

**Correct approach: ignore the preset's Y and construct the direction from a
target angle**, keeping the preset's horizontal bearing:

```python
horiz = (dx*dx + dz*dz) ** 0.5
rad = math.radians(35)                      # degrees above horizon, looking down
nd = adsk.core.Vector3D.create(
    dx / horiz * math.cos(rad),
    math.sin(rad),                          # positive: eye above target
    dz / horiz * math.cos(rad),
)
nd.normalize()
```

Measured: 25 deg requested gives 22.5 actual, 35 gives 31.3, 45 gives 42.3. The
small shortfall is the orthographic fit adjusting; 35 is the adopted value.

**Always assert the sign before capturing a run:**
`assert vp.camera.eye.y > vp.camera.target.y`

Measured output of the adopted pass: 24 transparent PNG at 600 px, mean 89.9 KB
per frame, one frame clipping at the exploded extreme (acceptable, it is frame 0).
Convert to WebP before shipping.

---

## 6. Safety protocol

The capture scripts move real geometry in the owner's open document. Always:

1. Write original `transform2` arrays **and** the visibility of every occurrence to
   JSON **before touching anything** (`scripts/fusion/save_state.py`). Do this as a
   separate call so the file exists even if the capture crashes.
2. Capture frames.
3. Restore from JSON and **verify**, reporting residuals and mismatch counts
   (`scripts/fusion/restore_state.py`).
4. **Never save the document.** Fusion will still flag it modified; that is
   expected and the content is identical.

State files land in the user's home directory:
`fusion_orig_transforms.json`, `fusion_orig_vis.json`.

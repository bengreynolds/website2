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

## 4. Open blocker: pellet delivery kinematics

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

`10388-Pellet Delivery System` is flat, so even with the axis definitions above
nothing in the model records which of the 91 children ride which stage. The rail
inference gives the axis and the carriage, but parts bolted to a carriage have to
be found by proximity. Moving the wrong subset detaches screws visibly. If the
inferred result looks wrong, the durable fix is to group the three stages as
sub-assemblies in Fusion, which is worth doing to the CAD regardless.

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

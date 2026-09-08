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

Travel is **35 mm on each axis** (from the owner).

The blocker is not the travel value, it is that nothing records *which parts ride
which axis*. Moving the wrong subset detaches screws visibly and an engineer will
notice. Options, best first:

1. Group the three stages as sub-assemblies in Fusion. Makes the animation trivial
   and is worth doing to the CAD regardless.
2. Owner lists the parts riding each axis.
3. Infer spatially from proximity to `60598-X_frame_vmettetal-02` /
   `60597-Yframe_vmettetal-01`. Cheapest, and approximate.
4. Drop the motion for this module and ship a turntable plus PCB reveal, which
   needs no kinematics at all.

---

## 5. Web delivery constraints

- **Sprite strips cap at 16384 px** GPU texture width. At 600 px frames that is
  **27 frames max** in a single strip. More than that needs a 2D grid.
- Measured cost of the first run: 24 transparent PNG at 600 px = **1.27 MB raw,
  mean 51.6 KB/frame**. Convert to WebP before shipping.
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

### Composition notes from the first run

- `viewExtents * 1.9` was too loose; the assembly filled only ~45% of the frame.
  Use ~1.25-1.4 and let incoming parts enter from off-frame.
- `IsoTopRight` is too top-down: the floor dominates the composition. Set a
  shallower custom camera `eye` instead of using the preset.

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

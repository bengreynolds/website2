# NWB Forge conversion-pipeline demo

Design for a software-focused demo on the Neuroscience Data Standardization
Platform case study. Approved 2026-09-09.

## Why a new demo type

Every demo on the site today is a pre-rendered Fusion 360 frame grid.
`scripts/build_demo_sprite.py` writes `public/rig/<id>.webp` plus a generated
`src/demo-<id>.css` carrying the poster, `background-size` and `steps(1)`
keyframes; `WorkEntry` in `src/App.jsx` renders one or two 520px square
`.demo-figure` divs, and a button row remounts them to replay.

That mechanism suits a mechanism moving through space, where a photoreal
render is the point and there is no text to read. NWB Forge's substance is
architecture: heterogeneous inputs, three conversion routes, a review gate
that can stop a write, and one validated file plus a provenance trail. That
is labels, filenames and field names. Baked into a 520px sprite cell they
would be illegible, the payload would grow by roughly half a megabyte, and
every copy edit would require a re-capture.

So this project gets a second demo kind, rendered live from data, alongside
the sprite kind rather than replacing it.

## Decisions

| Decision | Choice |
| --- | --- |
| Story | Pipeline flow: mixed inputs to one validated file |
| Medium | HTML nodes in a CSS grid, real text, no sprite and no SVG |
| Interaction | Click-through stepper, visitor sets the pace |
| Composition | Persistent stage rail plus a live detail region |
| Scope | One demo, but the stage list is data so other projects can follow |

## What the visitor sees

One forged hybrid session. Hybrid is deliberate: it exercises supported and
custom routes in the same run, so a single demo carries the whole
architecture. Nine loose files off a SpikeGLX amplifier, a camera, and the
lab's own bookkeeping become one validated file.

All vocabulary is real to the tool and the standard: SpikeGLX, Phy,
DeepLabCut, NeuroConv, NWB Inspector, and the `pass` / `review` / `blocked`
outcome triple. The session itself is invented; no API, route, check name or
container path is.

Stage 4 blocking the write and stage 5 clearing it is the point of the demo.
It is what separates the platform from a conversion script, and it is the
reason the stepper is worth building at all.

The demo `caption`, in the house style of the existing sprite captions and
inside their 46ch measure:

> One hybrid session, stepped through the way the app runs it. Nine files
> off a SpikeGLX amplifier, a camera and the lab's own bookkeeping become
> one validated NWB file. The write stays blocked at validation until two
> metadata conflicts are resolved on the record.

The italic line under each stage heading below is that stage's `note`
string, verbatim.

### Stage 0 - Sources

*Nine files, two acquisition systems and the lab's own notes, no shared
metadata.*

View `list`:

| name | meta |
| --- | --- |
| `run1_g0_t0.imec0.ap.bin` | SpikeGLX / 41.2 GB |
| `run1_g0_t0.imec0.ap.meta` | SpikeGLX / 14 KB |
| `run1_g0_t0.imec0.lf.bin` | SpikeGLX / 3.4 GB |
| `phy_output/` | Phy / 212 MB |
| `cam0_2025-03-14.mp4` | Video / 8.9 GB |
| `cam0DLC_resnet50_reachMar14.h5` | DeepLabCut / 47 MB |
| `trials_run1.csv` | Tabular / 62 KB |
| `notes_run1.txt` | Free text / 2 KB |
| `rig_config.yaml` | Config / 6 KB |

### Stage 1 - Group

*Heuristic grouping proposes three datasets and a hybrid pathway.*

View `groups`:

| name | route | count | kind |
| --- | --- | --- | --- |
| Ecephys | SpikeGLX & Phy | 4 | supported |
| Behavior | DeepLabCut, Video | 2 | supported |
| Trials & rig | Custom mapping | 3 | custom |

Supported and custom in one session is what makes the pathway hybrid.

### Stage 2 - Normalize

*Metadata is extracted per source and standardized. Two fields disagree.*

View `status`:

| label | value | state |
| --- | --- | --- |
| `identifier` | `nwbforge:2025-03-14_M241_run1` | ok |
| `session_description` | Reach-to-grasp, run 1 | ok |
| `devices` | Neuropixels 1.0, cam0 | ok |
| `session_start_time` | 2 sources disagree | conflict |
| `subject_id` | 2 sources disagree | conflict |

### Stage 3 - Map

*A rule-based plan for where each source lands. The two metadata sidecars
were consumed at normalize and get no container of their own.*

View `mapping`:

| from | to | note |
| --- | --- | --- |
| `run1_g0_t0.imec0.ap.bin` | `acquisition/ElectricalSeries` | SpikeGLX route, NeuroConv |
| `run1_g0_t0.imec0.lf.bin` | `acquisition/ElectricalSeriesLF` | NeuroConv |
| `phy_output/` | `units` | Phy route |
| `cam0_2025-03-14.mp4` | `acquisition/ImageSeries` | external file, not copied |
| `cam0DLC_resnet50_reachMar14.h5` | `processing/behavior/PoseEstimation` | DeepLabCut route |
| `trials_run1.csv` | `intervals/trials` | `start_s` to `start_time`, `stop_s` to `stop_time`, `outcome` to `success` |
| `rig_config.yaml` | `general/devices` | custom mapping |

The `trials_run1.csv` note is the clearest single illustration of why a
custom path exists: a lab's own column names have to be stated explicitly
because no route can guess them.

Seven rows for nine files is correct, not an omission.
`run1_g0_t0.imec0.ap.meta` and `notes_run1.txt` carry metadata rather than
data, so they were consumed at stage 2 and have no container target here.
The stage note says so, because a reader who counts will otherwise think two
files were dropped.

### Stage 4 - Validate

*Artifact policy, schema and NWB Inspector run before anything is written.*

View `status`:

| label | value | state |
| --- | --- | --- |
| Artifact policy | 3 artifacts planned | pass |
| NWB schema 2.7.0 | conforms | pass |
| `check_timestamps_ascending` | ok | pass |
| `check_data_orientation` | ok | pass |
| `check_subject_species_exists` | `subject.species` not supplied | review |
| `session_start_time` | unresolved across 2 sources | blocked |

The stage note ends on the outcome: `blocked`, write prevented.

### Stage 5 - Review

*The gate. Conflicts are resolved by a person and the decision is recorded.*

View `conflicts`:

| field | a | b | chosen | why |
| --- | --- | --- | --- | --- |
| `session_start_time` | `2025-03-14T09:12:04-06:00` from `run1_g0_t0.imec0.ap.meta` | `2025-03-14T09:12:41-06:00` from `cam0_2025-03-14.mp4` | `09:12:04-06:00` | The amplifier clock starts the session; the camera start is kept as an offset on the `ImageSeries`. |
| `subject_id` | `M241` from `rig_config.yaml` | `m-241` from `notes_run1.txt` | `M241` | Matches the colony registry format; the note spelling is recorded as an alias in provenance. |

The stage note ends: `check_subject_species_exists` acknowledged, outcome
clears to `pass`, decision persisted to the session snapshot.

### Stage 6 - Assemble

*PyNWB writes the file, and the evidence is written beside it.*

View `list`:

| name | meta |
| --- | --- |
| `session.nwb` | NWB 2.7.0 / 45.1 GB |
| `validation_report.json` | 6 checks / pass |
| `provenance.log` | inspect, normalize, map, assemble |

## Data contract

Stages are data; the renderer is generic. In `src/siteData.js` the project
gains a `demos` array whose single entry declares a kind:

```js
{
  kind: "pipeline",
  id: "nwb-pipeline",
  label: "Conversion pipeline",
  caption: "...",
  stages: [
    { id: "sources", label: "Sources", note: "...",
      view: { type: "list", rows: [...] } },
    // ...
  ],
}
```

A demo with no `kind` is a sprite. That default keeps the three existing rig
entries untouched, at the cost of the contract being implicit for them; the
trade is deliberate, because rewriting working data for no behaviour change
is churn.

Five view types cover all seven stages. `list` serves both sources and
artifacts because their shape is identical, and `status` serves both the
normalized field table and the validation checks for the same reason.

| type | row shape | used by |
| --- | --- | --- |
| `list` | `{ name, meta }` | Sources, Assemble |
| `groups` | `{ name, route, count, kind }` | Group |
| `status` | `{ label, value, state }` | Normalize, Validate |
| `mapping` | `{ from, to, note }` | Map |
| `conflicts` | `{ field, a, b, chosen, why }` | Review |

`kind` on a `groups` row is `supported` or `custom`. `state` on a `status`
row is one of `ok`, `conflict`, `pass`, `review`, `blocked`. `note` on a
`mapping` row is optional; every other field is required.

Five semantic states, three visual treatments. `ok` and `pass` share one
settled style; `conflict` and `blocked` share one alert style; `review` gets
its own middle style. Both pairs are kept as distinct names because
normalization has no notion of passing and validation has no notion of a
conflict, but the implementation must not invent five different looks.

None of the three may use `--accent`. `AGENTS.md` reserves the accent colour
for things that are interactive, and a state chip is static text. The three
treatments are built from `--text`, `--text-muted`, `--rule-strong` and
typographic weight instead. The rail's progress bar does use the accent,
because it reports the visitor's own position in something they are driving.

A pipeline demo for another project is then a data addition, and only a
genuinely new row shape would need renderer work.

## Components and files

New `src/PipelineDemo.jsx` holds the rail, the detail region, the stage index
and the five view renderers. It is a new file rather than more of
`src/App.jsx`, which is already 664 lines and would otherwise carry two
unrelated demo mechanisms.

New `src/pipeline-demo.css` holds the styles, with a header comment saying it
is hand-written. It is deliberately not named `demo-pipeline.css`:
`demo-<id>.css` is the namespace `build_demo_sprite.py` generates into, and a
hand-edited file in that namespace would eventually be overwritten or
mistaken for generated output.

Edited:

- `src/App.jsx` - inside the existing `hasDemo` block, branch on
  `active.kind === "pipeline"` and render `<PipelineDemo>` in place of the
  sprite stage. The sprite path is untouched.
- `src/siteData.js` - the `demos` array on
  `scientific-data-standardization-platform`.
- `src/main.jsx` - one stylesheet import.

`src/spa.css` is not modified. See Layout for why the width problem it
first appeared to pose does not exist.

Data flow: `siteData` to `WorkEntry` to `PipelineDemo`, which holds the stage
index in React state, writes it to `data-stage` on its root element and
exposes progress as a custom property. CSS reacts to both. React swaps the
detail rows. No observers, no scroll listeners, no timers.

## Motion

Two active animations, which satisfies the calm rule in `AGENTS.md`:

1. The rail's progress bar, `transform: scaleX()` driven by a `--progress`
   custom property set inline from the stage index.
2. A transform-only entrance stagger on the incoming detail rows.

Both use `--dur-med` and `--ease` from section 1 of `src/spa.css`. No new
motion constants are introduced.

Two things were considered and dropped. A dot travelling the connector to the
next node would have been a third simultaneous animation; a colour change
between stages carries the same meaning for free. An SVG connector layer is
unnecessary once the composition is a rail: the track is one 1px element and
the progress is one scaled element, which is less code than SVG and flips to
the vertical mobile layout by swapping `scaleX` for `scaleY`.

## Accessibility and reduced motion

The stepper is an ordered list of stage buttons carrying `aria-current="step"`
on the active one, plus a prominent Next stage button and a Replay control at
the last stage. The rail nodes alone are too small a tap target on a phone,
and the explicit button is what makes the demo obviously interactive.

It is deliberately not `role="tablist"`. That role obliges roving tabindex
and arrow-key handling, and half-implemented ARIA is worse than none. These
are steps in one process rather than peer tabs, so `aria-current="step"` on
native buttons is both correct and complete. No live region: every change is
user-initiated, and announcing a six-row table swap would be noise.

Reduced motion largely handles itself. Section 14 of `src/spa.css` crushes
every `animation-duration` and `transition-duration` to `0.01ms !important`,
so stages snap instead of sliding and all content stays readable. No poster
fallback is needed, unlike the sprite demos.

One trap must be handled explicitly: that block crushes `animation-duration`
but not `animation-delay`. A staggered row with `both` fill would hold its
start transform through the delay and visibly jump in late. The stagger
therefore lives inside `@media (prefers-reduced-motion: no-preference)` only,
so under reduce there is no delay to wait out.

The container uses `--surface` and `--text`, not `.demo-figure`'s `--plate`.
That plate is a deliberately light sheet so near-black CAD renders do not
vanish in dark mode; text on it would fail contrast when the site is dark.

## Layout

`.case-body` behaves in two distinct ways either side of 56rem, and the
demo has to answer both. Below 56rem it is one column capped at
`var(--measure)`, 66ch, which is roughly 528px. At and above 56rem the
media query at `spa.css:1117` replaces that with `max-width: none` and
`grid-template-columns: repeat(2, minmax(0, 1fr))`.

Two consequences. Above 56rem there is no width cap to raise, so no
`case-body--wide` modifier is needed; what is needed is
`grid-column: 1 / -1` on the demo, or it lands in one half-width column of
that two-column grid. The existing `.case-demos` rule only spans columns
under `.case-body--figure`, which this project is not, so the pipeline
declares the span itself.

Below 56rem the 528px cap does bind, and a seven-node horizontal rail there
gets about 75px per node against about 72px for the longest label,
`Normalize`, at `--step--1` in mono with `--tracking-label`. That is too
close to call. So the rail is horizontal only at and above 56rem, exactly
where the cap is lifted, and vertical below it - progress element switching
from `scaleX` to `scaleY`, detail rows underneath.

Setting the rail's breakpoint to the one the layout already changes at
removes the narrow horizontal band entirely, and means `src/spa.css` needs
no edit at all.

Because the nodes are HTML in a grid rather than SVG, the reflow is a
`grid-auto-flow` change and labels wrap on their own.

## Verification

The repository has no test framework and `package.json` declares no test
script, so verification is a build plus a driven preview:

1. `npm run build` completes clean.
2. Dev server in the browser pane; step all seven stages and back.
3. Console clear of errors and warnings.
4. Screenshots at a desktop width and at 375px.
5. Dark theme correct, since the container leaves the `--plate` convention.
6. `prefers-reduced-motion: reduce` emulated: stages snap, no row arrives
   late, all content readable.

Screenshots go to the owner rather than a request to check by hand.

## Out of scope

Pipeline demos for other projects, any change to the sprite pipeline or its
generator, and any change to the three existing rig demos.

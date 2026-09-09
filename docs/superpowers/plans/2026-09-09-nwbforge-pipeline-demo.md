# NWB Forge Pipeline Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a click-through stepper demo to the Neuroscience Data Standardization Platform case study that walks one forged NWB conversion run through seven stages, rendered live from data as real text.

**Architecture:** A second demo *kind* alongside the existing sprite kind. `siteData.js` carries the seven stages as data; `PipelineDemo.jsx` holds a single number (the stage index) in React state and writes it to `data-stage` plus a `--progress` custom property; all motion and state styling is CSS reacting to those two values. `PipelineViews.jsx` renders five row shapes that cover all seven stages. The sprite path in `App.jsx` is untouched.

**Tech Stack:** React 18, Vite 5, hand-written CSS using the existing tokens in section 1 of `src/spa.css`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-09-nwbforge-pipeline-demo-design.md`

## Global Constraints

Copied from the spec and `AGENTS.md`. Every task's requirements implicitly include these.

- **No new dependencies.** `package.json` is not modified by this plan.
- **Two active animations maximum**, ever: the rail progress bar and the row entrance stagger. No third.
- **Motion values come from existing tokens only** — `--dur-fast` (140ms), `--dur-med` (240ms), `--ease`, `--reveal-shift` (14px). No new motion constants.
- **Transform only — but for the right reason.** `AGENTS.md` forbids opacity only on a *scroll-driven* timeline, where a stalled timeline can leave a faded keyframe permanently invisible; `.rise` at `spa.css:329` legitimately fades because it is time-based. This demo is click-triggered, so opacity would be permitted. Use transform anyway, because a row that never animates then stays fully readable.
- **`--accent` is reserved for interactive things.** State chips and badges are static text and must not use it. Rail node buttons and the progress bar may, because both report the visitor's own position in something they are driving.
- **Five semantic states, three visual treatments.** `ok` and `pass` share one; `conflict` and `blocked` share one; `review` sits between. Distinguish by border strength and font weight, not hue — that also survives colour blindness.
- **The stagger delay must live inside `@media (prefers-reduced-motion: no-preference)`.** Section 14 of `src/spa.css` crushes `animation-duration` to `0.01ms !important` but leaves `animation-delay` alone; a delay outside that query makes rows land late under reduce, which is worse than no animation.
- **Do not use `--plate`.** That light sheet exists so near-black CAD renders survive dark mode; text on it fails contrast when the site is dark. Use `--surface` and `--text`.
- **Do not touch** `scripts/build_demo_sprite.py`, any `src/demo-*.css`, `public/rig/*`, the three existing rig demo entries, or `src/spa.css`.
- **`.case-body` changes shape at 56rem.** Below it, one column capped at `var(--measure)` (66ch, about 528px). At and above it, `spa.css:1117` sets `max-width: none` and `grid-template-columns: repeat(2, minmax(0, 1fr))`. The pipeline therefore needs `grid-column: 1 / -1` above 56rem or it lands in one half-width column, and its rail must be vertical below 56rem because 528px does not hold seven labels.
- **File naming:** the new stylesheet is `src/pipeline-demo.css`, never `src/demo-pipeline.css`. `demo-<id>.css` is the namespace the sprite generator writes into.

## Verification Model

The repository has no test framework and `package.json` declares no `test` script. Adding one is out of scope. So the TDD cycle in this plan is **build plus driven preview**, and the "failing test" step of each task is a concrete browser observation that must be false before the work and true after.

This is not a licence to skip verification. Each task names exactly what to click and exactly what to expect.

The dev server is already configured: `.claude/launch.json` defines `website2-dev` on port 5178. Start it with the browser pane's `preview_start` using `{name: "website2-dev"}` — never with `Bash`.

**Reaching the demo takes three steps every time**, because it lives behind a disclosure:

1. Navigate to `http://localhost:5178/`.
2. Scroll to the Work section and find **Neuroscience Data Standardization Platform** (it is the first project entry).
3. Click its **Case study** summary to open the `<details>`.

Prefer `read_page` over screenshots for checking text and structure; it returns refs you can click. Use screenshots for the visual checks in Task 5.

---

### Task 1: Forge the session data

The seven stages as data, with nothing yet consuming them. This is its own task because the forged content is separately rejectable: a wrong NWB container path or an implausible filename is a content bug, not a renderer bug, and it should be caught before any markup exists.

**Files:**
- Modify: `src/siteData.js` — the `scientific-data-standardization-platform` entry, which currently ends at its `bullets` array around line 155

**Interfaces:**
- Consumes: nothing
- Produces: `projects[0].demos[0]` with shape `{ kind: "pipeline", id, label, caption, stages }`, where each stage is `{ id, label, note, view }` and each view is `{ type, rows }`. `type` is one of `"list" | "groups" | "status" | "mapping" | "conflicts"`. Row shapes:
  - `list` → `{ name: string, meta: string }`
  - `groups` → `{ name: string, route: string, count: number, kind: "supported" | "custom" }`
  - `status` → `{ label: string, value: string, state: "ok" | "conflict" | "pass" | "review" | "blocked" }`
  - `mapping` → `{ from: string, to: string, note?: string }`
  - `conflicts` → `{ field: string, a: string, b: string, chosen: string, why: string }`

- [ ] **Step 1: Write the failing shape check**

There is no test runner, so this check runs through Node directly against the ES module. Save it to the scratchpad, not the repo — it is a one-off gate for this task, not a fixture worth keeping.

Write to `check-demo-shape.mjs` in your scratchpad directory:

```js
import { projects } from "./src/siteData.js";

const SHAPES = {
  list: ["name", "meta"],
  groups: ["name", "route", "count", "kind"],
  status: ["label", "value", "state"],
  mapping: ["from", "to"],
  conflicts: ["field", "a", "b", "chosen", "why"],
};
const STATES = ["ok", "conflict", "pass", "review", "blocked"];
const fail = [];

const project = projects.find(
  (p) => p.id === "scientific-data-standardization-platform"
);
if (!project) fail.push("project not found");

const demo = project?.demos?.[0];
if (!demo) fail.push("no demo on the project");
if (demo && demo.kind !== "pipeline") fail.push(`kind is ${demo.kind}`);
if (demo && !demo.caption) fail.push("no caption");
if (demo && demo.stages?.length !== 7)
  fail.push(`${demo.stages?.length} stages, expected 7`);

for (const stage of demo?.stages ?? []) {
  for (const key of ["id", "label", "note"]) {
    if (!stage[key]) fail.push(`stage ${stage.id}: missing ${key}`);
  }
  const shape = SHAPES[stage.view?.type];
  if (!shape) {
    fail.push(`stage ${stage.id}: unknown view type ${stage.view?.type}`);
    continue;
  }
  if (!stage.view.rows?.length)
    fail.push(`stage ${stage.id}: no rows`);
  for (const [i, row] of (stage.view.rows ?? []).entries()) {
    for (const key of shape) {
      if (row[key] === undefined)
        fail.push(`stage ${stage.id} row ${i}: missing ${key}`);
    }
    if (row.state && !STATES.includes(row.state))
      fail.push(`stage ${stage.id} row ${i}: bad state ${row.state}`);
    if (row.kind && !["supported", "custom"].includes(row.kind))
      fail.push(`stage ${stage.id} row ${i}: bad kind ${row.kind}`);
  }
}

// The file counts have to agree across stages or the story does not hold up.
const sources = demo?.stages?.find((s) => s.id === "sources");
const group = demo?.stages?.find((s) => s.id === "group");
const grouped = (group?.view.rows ?? []).reduce((n, r) => n + r.count, 0);
if (sources && grouped !== sources.view.rows.length) {
  fail.push(`${grouped} files grouped, ${sources.view.rows.length} listed`);
}

if (fail.length) {
  console.error("FAIL\n" + fail.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("PASS: 7 stages, shapes valid, file counts agree");
```

- [ ] **Step 2: Run it to verify it fails**

Run from the repo root, substituting your scratchpad path:

```bash
node "$SCRATCHPAD/check-demo-shape.mjs"
```

Expected: `FAIL` listing `no demo on the project` and the cascading `undefined stages` complaints. If it prints PASS, you are on the wrong branch.

- [ ] **Step 3: Add the demos array**

In `src/siteData.js`, insert `demos` into the `scientific-data-standardization-platform` object immediately after its `bullets` array. Every filename, route name, check name and container path below is deliberate — see the spec's "What the visitor sees" for why each one was chosen.

```js
    demos: [
      {
        /* The software counterpart to the rig's sprite demos. A demo with no
           kind is a sprite, which is why the three rig entries need no
           change; this one has to say what it is. */
        kind: "pipeline",
        id: "nwb-pipeline",
        label: "Conversion pipeline",
        caption:
          "One hybrid session, stepped through the way the app runs it. Nine files off a SpikeGLX amplifier, a camera and the lab's own bookkeeping become one validated NWB file. The write stays blocked at validation until two metadata conflicts are resolved on the record.",
        stages: [
          {
            id: "sources",
            label: "Sources",
            note: "Nine files, two acquisition systems and the lab's own notes, no shared metadata.",
            view: {
              type: "list",
              rows: [
                { name: "run1_g0_t0.imec0.ap.bin", meta: "SpikeGLX · 41.2 GB" },
                { name: "run1_g0_t0.imec0.ap.meta", meta: "SpikeGLX · 14 KB" },
                { name: "run1_g0_t0.imec0.lf.bin", meta: "SpikeGLX · 3.4 GB" },
                { name: "phy_output/", meta: "Phy · 212 MB" },
                { name: "cam0_2025-03-14.mp4", meta: "Video · 8.9 GB" },
                {
                  name: "cam0DLC_resnet50_reachMar14.h5",
                  meta: "DeepLabCut · 47 MB",
                },
                { name: "trials_run1.csv", meta: "Tabular · 62 KB" },
                { name: "notes_run1.txt", meta: "Free text · 2 KB" },
                { name: "rig_config.yaml", meta: "Config · 6 KB" },
              ],
            },
          },
          {
            id: "group",
            label: "Group",
            note: "Heuristic grouping proposes three datasets and suggests a pathway. Supported and custom routes in one session is what makes this session hybrid.",
            view: {
              type: "groups",
              rows: [
                {
                  name: "Ecephys",
                  route: "SpikeGLX & Phy",
                  count: 4,
                  kind: "supported",
                },
                {
                  name: "Behavior",
                  route: "DeepLabCut, Video",
                  count: 2,
                  kind: "supported",
                },
                {
                  name: "Trials & rig",
                  route: "Custom mapping",
                  count: 3,
                  kind: "custom",
                },
              ],
            },
          },
          {
            id: "normalize",
            label: "Normalize",
            note: "Metadata is extracted per source and standardized. Two fields disagree across sources, which is the whole reason a review gate exists.",
            view: {
              type: "status",
              rows: [
                {
                  label: "identifier",
                  value: "nwbforge:2025-03-14_M241_run1",
                  state: "ok",
                },
                {
                  label: "session_description",
                  value: "Reach-to-grasp, run 1",
                  state: "ok",
                },
                {
                  label: "devices",
                  value: "Neuropixels 1.0, cam0",
                  state: "ok",
                },
                {
                  label: "session_start_time",
                  value: "2 sources disagree",
                  state: "conflict",
                },
                {
                  label: "subject_id",
                  value: "2 sources disagree",
                  state: "conflict",
                },
              ],
            },
          },
          {
            id: "map",
            label: "Map",
            note: "A rule-based plan for where each source lands. Seven rows for nine files is right: the two metadata sidecars were consumed at normalize and get no container of their own.",
            view: {
              type: "mapping",
              rows: [
                {
                  from: "run1_g0_t0.imec0.ap.bin",
                  to: "acquisition/ElectricalSeries",
                  note: "SpikeGLX route, NeuroConv",
                },
                {
                  from: "run1_g0_t0.imec0.lf.bin",
                  to: "acquisition/ElectricalSeriesLF",
                  note: "NeuroConv",
                },
                { from: "phy_output/", to: "units", note: "Phy route" },
                {
                  from: "cam0_2025-03-14.mp4",
                  to: "acquisition/ImageSeries",
                  note: "external file, not copied",
                },
                {
                  from: "cam0DLC_resnet50_reachMar14.h5",
                  to: "processing/behavior/PoseEstimation",
                  note: "DeepLabCut route",
                },
                {
                  from: "trials_run1.csv",
                  to: "intervals/trials",
                  note: "start_s to start_time, stop_s to stop_time, outcome to success",
                },
                {
                  from: "rig_config.yaml",
                  to: "general/devices",
                  note: "custom mapping",
                },
              ],
            },
          },
          {
            id: "validate",
            label: "Validate",
            note: "Artifact policy, schema and NWB Inspector run before anything is written. Outcome: blocked. Nothing is written.",
            view: {
              type: "status",
              rows: [
                {
                  label: "Artifact policy",
                  value: "3 artifacts planned",
                  state: "pass",
                },
                { label: "NWB schema 2.7.0", value: "conforms", state: "pass" },
                {
                  label: "check_timestamps_ascending",
                  value: "ok",
                  state: "pass",
                },
                { label: "check_data_orientation", value: "ok", state: "pass" },
                {
                  label: "check_subject_species_exists",
                  value: "subject.species not supplied",
                  state: "review",
                },
                {
                  label: "session_start_time",
                  value: "unresolved across 2 sources",
                  state: "blocked",
                },
              ],
            },
          },
          {
            id: "review",
            label: "Review",
            note: "The gate. A person resolves each conflict, the species check is acknowledged, and both decisions are persisted to the session snapshot. Outcome clears to pass.",
            view: {
              type: "conflicts",
              rows: [
                {
                  field: "session_start_time",
                  a: "2025-03-14T09:12:04-06:00 — run1_g0_t0.imec0.ap.meta",
                  b: "2025-03-14T09:12:41-06:00 — cam0_2025-03-14.mp4",
                  chosen: "09:12:04-06:00",
                  why: "The amplifier clock starts the session; the camera start is kept as an offset on the ImageSeries rather than discarded.",
                },
                {
                  field: "subject_id",
                  a: "M241 — rig_config.yaml",
                  b: "m-241 — notes_run1.txt",
                  chosen: "M241",
                  why: "Matches the colony registry format; the note spelling is recorded as an alias so the original is not lost.",
                },
              ],
            },
          },
          {
            id: "assemble",
            label: "Assemble",
            note: "PyNWB writes the file, and the evidence is written beside it.",
            view: {
              type: "list",
              rows: [
                { name: "session.nwb", meta: "NWB 2.7.0 · 45.1 GB" },
                { name: "validation_report.json", meta: "6 checks · pass" },
                {
                  name: "provenance.log",
                  meta: "inspect, normalize, map, assemble",
                },
              ],
            },
          },
        ],
      },
    ],
```

- [ ] **Step 4: Run the check to verify it passes**

```bash
node "$SCRATCHPAD/check-demo-shape.mjs"
```

Expected: `PASS: 7 stages, shapes valid, file counts agree`

Then confirm the build still compiles, since nothing renders this yet:

```bash
npm run build
```

Expected: exit 0, no warnings about `siteData`.

- [ ] **Step 5: Commit**

```bash
git add src/siteData.js
git commit -m "$(cat <<'EOF'
Forge the NWB Forge conversion session

Seven stages of one hybrid run as data, consumed by nothing yet. All
route, check and container names are real to NeuroConv, NWB Inspector
and the NWB schema; only the session is invented.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: The rail and the stepper

A visible, steppable rail showing stage labels and notes, with no detail rows yet. Wiring into the case study belongs here rather than in its own task, because a component nothing renders cannot be verified.

**Files:**
- Create: `src/PipelineDemo.jsx`
- Create: `src/pipeline-demo.css`
- Modify: `src/App.jsx` — add an import at the top, and branch inside the `hasDemo` block at line 198
- Modify: `src/main.jsx` — one import after the `demo-pcb.css` line
- `src/spa.css` is **not** modified; see Global Constraints

**Interfaces:**
- Consumes: `projects[0].demos[0]` from Task 1
- Produces: `PipelineDemo` as the default export of `src/PipelineDemo.jsx`, taking one prop `demo` of the pipeline shape. It renders a `<figure className="pipeline case-demos">` with `data-stage` set to the current index, and expects to import `{ StageView }` from `./PipelineViews` — created in Task 3, stubbed here.

- [ ] **Step 1: Write the failing observation**

Start the dev server and reach the demo:

```
preview_start {name: "website2-dev"}
```

Then navigate to `http://localhost:5178/`, find **Neuroscience Data Standardization Platform**, and click its **Case study** summary.

Run `read_page` on the opened case body. Expected now: the Problem / Approach / Implementation blocks and **no** stage rail — no text `Sources`, `Normalize` or `Assemble` anywhere. Record that as the failing state.

- [ ] **Step 2: Create the stub view module**

`src/PipelineViews.jsx` gets its real contents in Task 3. It exists now only so the shell imports something real:

```jsx
/* Filled in by Task 3. The shell imports this so the rail can be verified
   on its own, before any row shape exists. */
export function StageView() {
  return null;
}
```

- [ ] **Step 3: Create the component**

`src/PipelineDemo.jsx`:

```jsx
import { useState } from "react";
import { StageView } from "./PipelineViews";

/* The software counterpart to the sprite demos. Those replay a pre-rendered
   mechanism; this one steps through a conversion run, rendered live from
   siteData so filenames and NWB paths stay real, selectable text.

   React owns exactly one number - the stage index. Everything visual reads
   it off data-stage and --progress, so there is no animation state in JS
   and nothing to keep in sync. */
export default function PipelineDemo({ demo }) {
  const stages = demo.stages;
  const last = stages.length - 1;
  const [stage, setStage] = useState(0);
  const current = stages[stage];
  const atEnd = stage === last;

  return (
    <figure className="pipeline case-demos" data-stage={stage}>
      {/* --progress is a string, not a number: React appends "px" to some
          numeric style values, and a unitless scale factor must survive
          intact. */}
      <ol
        className="pipeline-rail"
        style={{ "--progress": String(last === 0 ? 1 : stage / last) }}
        aria-label="Conversion stages"
      >
        {stages.map((s, i) => (
          <li className="pipeline-node" key={s.id}>
            <button
              type="button"
              className="pipeline-node-btn"
              data-state={
                i === stage ? "current" : i < stage ? "done" : "ahead"
              }
              /* Steps in one process, not peer tabs. aria-current="step" is
                 complete on its own; role="tablist" would oblige roving
                 tabindex and arrow keys, and half-built ARIA is worse than
                 none. */
              aria-current={i === stage ? "step" : undefined}
              onClick={() => setStage(i)}
            >
              <span className="pipeline-node-num">{i + 1}</span>
              <span className="pipeline-node-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="pipeline-detail">
        <p className="pipeline-note">{current.note}</p>
        {/* Keying on the stage id remounts the rows, which is the reliable
            way to restart their CSS entrance - the same trick the sprite
            demos use with their runs counter. */}
        <StageView key={current.id} view={current.view} />
      </div>

      {/* Reuses .demo-caption and .demo-button so this demo's controls read
          as the same furniture as the rig's, rather than a second style of
          button on one page. */}
      <figcaption className="demo-caption">
        <div className="demo-switch">
          <button
            type="button"
            className="btn btn--quiet demo-button"
            onClick={() => setStage(atEnd ? 0 : stage + 1)}
          >
            {atEnd ? "Replay" : "Next stage"}
          </button>
          <span className="pipeline-count">
            {stage + 1} / {stages.length}
          </span>
        </div>
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: Create the stylesheet**

`src/pipeline-demo.css`. Only the rail and shell are styled here; row styling arrives in Task 3 and motion in Task 4.

```css
/* HAND-WRITTEN, unlike the generated demo-*.css files. Do not rename this
   to demo-pipeline.css: demo-<id>.css is the namespace
   scripts/build_demo_sprite.py generates into, and a hand-edited file there
   would eventually be overwritten.

   No focus styles here - the global :focus-visible rule at spa.css:227
   already covers these buttons, and `button` is reset at spa.css:220 too,
   so the node buttons need no font, background, border or cursor reset of
   their own. */

.pipeline {
  margin: 0;
}

/* ---- rail ----------------------------------------------------------- */

/* The track and the progress bar are the two pseudo-elements, so the rail
   needs no extra DOM. Progress is scaled rather than resized: transform is
   the one property that animates without laying out again. */
.pipeline-rail {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 0.25rem;
  margin: 0;
  padding: 0 0 0.75rem;
  list-style: none;
}

.pipeline-rail::before,
.pipeline-rail::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  transform-origin: left center;
}

.pipeline-rail::before {
  background: var(--rule);
}

/* The one place accent is allowed in this demo: it reports the visitor's own
   position in something they are driving. Static state labels may not use
   it - see the chips in pipeline-demo.css section "rows". */
.pipeline-rail::after {
  background: var(--accent);
  transform: scaleX(var(--progress, 0));
  transition: transform var(--dur-med) var(--ease);
}

.pipeline-node {
  display: grid;
}

.pipeline-node-btn {
  display: grid;
  gap: 0.35rem;
  justify-items: start;
  padding: 0.5rem 0.5rem 0.6rem 0;
  text-align: left;
  color: var(--text-subtle);
  transition: color var(--dur-fast) var(--ease);
}

.pipeline-node-btn:hover {
  color: var(--text);
}

.pipeline-node-btn[data-state="done"] {
  color: var(--text-muted);
}

.pipeline-node-btn[data-state="current"] {
  color: var(--accent);
}

.pipeline-node-num,
.pipeline-node-label {
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-label);
}

.pipeline-node-num {
  font-size: 0.625rem;
  color: var(--text-subtle);
}

.pipeline-node-label {
  font-size: var(--step--1);
  text-transform: uppercase;
}

/* ---- detail --------------------------------------------------------- */

/* --surface, not --plate. The plate is a light sheet so near-black CAD
   renders survive dark mode; text on it fails contrast when the site is
   dark. */
.pipeline-detail {
  border: 1px solid var(--rule);
  border-radius: var(--radius-control);
  background: var(--surface);
  padding: clamp(0.875rem, 2vw, 1.25rem);
}

.pipeline-note {
  margin: 0 0 0.875rem;
  max-width: 62ch;
  color: var(--text-muted);
  font-size: var(--step--1);
  line-height: var(--lh-body);
}

.pipeline-count {
  align-self: center;
}
```

- [ ] **Step 5: Wire it into the case study**

In `src/App.jsx`, add the import beside the `siteData` import at the top:

```jsx
import PipelineDemo from "./PipelineDemo";
```

Then branch at the top of the `hasDemo` block, immediately after the `active` line (currently line 199). This is the **only** change to `App.jsx` besides the import — no `hasPipeline` flag and no change to the `case-body` class, because the width problem those would have solved does not exist above 56rem:

```jsx
            const active = demos.find((d) => d.id === play.id) || demos[0];
            /* Pipeline demos bring their own stepper controls, so they do
               not use the shared sprite stage or its button row. A project
               mixing both kinds would lose the switcher; no project does,
               and the spec scopes this to one demo per project. */
            if (active.kind === "pipeline") {
              return <PipelineDemo demo={active} />;
            }
            const ids = active.ids || [active.id];
```

In `src/main.jsx`, add the stylesheet import after the `demo-pcb.css` line:

```jsx
import "./pipeline-demo.css";
```

- [ ] **Step 6: Verify the observation now passes**

```bash
npm run build
```

Expected: exit 0.

Then in the browser pane, reload and reopen the case study. Check with `read_page`:

- The rail lists all seven labels in order: `Sources`, `Group`, `Normalize`, `Map`, `Validate`, `Review`, `Assemble`.
- The note under the rail reads `Nine files, two acquisition systems and the lab's own notes, no shared metadata.`
- The counter reads `1 / 7` and the button reads `Next stage`.

Click **Next stage** six times. Expected after each click: the note text changes, the counter increments, and at `7 / 7` the button reads **Replay**. Click **Replay**; expected back to `1 / 7`.

Click the rail's `Map` button directly. Expected: counter `4 / 7`, note mentioning the two metadata sidecars — this proves the rail nodes work as jump targets, not just as decoration.

Finally run `read_console_messages` with `onlyErrors: true`. Expected: empty. A React key or `--progress` unit warning would show up here.

- [ ] **Step 7: Commit**

```bash
git add src/PipelineDemo.jsx src/PipelineViews.jsx src/pipeline-demo.css src/App.jsx src/main.jsx
git commit -m "$(cat <<'EOF'
Add the pipeline demo rail and stepper

A second demo kind beside the sprite one. React holds only the stage
index; the rail reads it off data-stage and --progress so no animation
state lives in JS. Detail rows are stubbed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: The five view renderers

Each stage shows its actual rows. Five renderers cover seven stages because `list` and `status` are each used twice — their row shapes are identical, and a renderer per stage would have meant two pairs differing only in a heading.

**Files:**
- Modify: `src/PipelineViews.jsx` — replace the Task 2 stub entirely
- Modify: `src/pipeline-demo.css` — append a rows section

**Interfaces:**
- Consumes: `PipelineDemo` renders `<StageView view={current.view} />`; `view` is `{ type, rows }` per the Task 1 contract
- Produces: `StageView` as a named export of `src/PipelineViews.jsx`, taking one prop `view`. Returns `null` for an unknown `type`.

- [ ] **Step 1: Write the failing observation**

With the dev server running and the case study open, run `read_page`. Expected now: notes and rail present, but **no** row content — no `run1_g0_t0.imec0.ap.bin` on stage 1, no `acquisition/ElectricalSeries` on stage 4. That absence is the failing state.

- [ ] **Step 2: Replace the stub with the renderers**

`src/PipelineViews.jsx`, in full:

```jsx
/* One renderer per view type in the demo data contract. Five types cover
   seven stages: list and status are each used twice, because their row
   shapes are identical and a type per stage would have meant two pairs of
   renderers differing only in a heading. */

/* Consumed by the entrance stagger in pipeline-demo.css, which applies the
   delay itself - inside prefers-reduced-motion: no-preference, because the
   global reduce block crushes animation-duration but not animation-delay. */
function rowStyle(i) {
  return { "--i": String(i) };
}

function List({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--list">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.name}>
          <span className="pipeline-row-name">{row.name}</span>
          <span className="pipeline-row-meta">{row.meta}</span>
        </li>
      ))}
    </ul>
  );
}

function Groups({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--groups">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.name}>
          <span className="pipeline-row-name">{row.name}</span>
          <span className="pipeline-row-meta">{row.route}</span>
          <span className="pipeline-row-count">{row.count} files</span>
          <span className="pipeline-chip" data-state={row.kind}>
            {row.kind}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Status({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--status">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.label}>
          <span className="pipeline-row-name">{row.label}</span>
          <span className="pipeline-row-meta">{row.value}</span>
          <span className="pipeline-chip" data-state={row.state}>
            {row.state}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Mapping({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--mapping">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.from}>
          <span className="pipeline-row-name">{row.from}</span>
          {/* Hidden from assistive tech deliberately: "right arrow" between
              every pair is noise, and source-then-target in a list already
              reads as a mapping. */}
          <span className="pipeline-row-arrow" aria-hidden="true">
            &rarr;
          </span>
          <span className="pipeline-row-target">{row.to}</span>
          {row.note ? (
            <span className="pipeline-row-meta">{row.note}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Conflicts({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--conflicts">
      {rows.map((row, i) => (
        <li className="pipeline-conflict" style={rowStyle(i)} key={row.field}>
          <span className="pipeline-row-name">{row.field}</span>
          <span className="pipeline-conflict-side">{row.a}</span>
          <span className="pipeline-conflict-side">{row.b}</span>
          <span className="pipeline-conflict-kept">Kept {row.chosen}</span>
          <p className="pipeline-conflict-why">{row.why}</p>
        </li>
      ))}
    </ul>
  );
}

const VIEWS = {
  list: List,
  groups: Groups,
  status: Status,
  mapping: Mapping,
  conflicts: Conflicts,
};

export function StageView({ view }) {
  const Body = VIEWS[view.type];
  /* An unknown type is a data error, not a runtime one. Render nothing
     rather than take the whole case study down with it. */
  if (!Body) return null;
  return <Body rows={view.rows} />;
}
```

Note that `Groups` reuses `.pipeline-chip` with `data-state` carrying `supported` or `custom`, rather than a separate `.pipeline-badge` class. One chip element with one set of states is less CSS than two near-identical components.

- [ ] **Step 3: Append the rows styles**

Add to the end of `src/pipeline-demo.css`:

```css
/* ---- rows ----------------------------------------------------------- */

.pipeline-rows {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pipeline-row {
  display: grid;
  gap: 0.15rem 0.75rem;
  align-items: baseline;
  padding: 0.4rem 0;
  border-top: 1px solid var(--rule);
  font-size: var(--step--1);
}

.pipeline-row:first-child,
.pipeline-conflict:first-child {
  border-top: 0;
}

.pipeline-row-name,
.pipeline-row-target,
.pipeline-row-arrow {
  font-family: var(--font-mono);
  color: var(--text);
  overflow-wrap: anywhere;
}

.pipeline-row-arrow,
.pipeline-row-meta,
.pipeline-row-count {
  color: var(--text-subtle);
}

.pipeline-row-meta,
.pipeline-row-count {
  font-size: 0.75rem;
  line-height: var(--lh-snug);
}

/* Single column below 34rem - the rows stack and every label wraps on its
   own, which is the whole reason these are HTML nodes and not SVG text. */
@media (min-width: 34rem) {
  .pipeline-rows--list .pipeline-row {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .pipeline-rows--status .pipeline-row {
    grid-template-columns: minmax(0, 16rem) minmax(0, 1fr) auto;
  }

  .pipeline-rows--groups .pipeline-row {
    grid-template-columns: minmax(0, 8rem) minmax(0, 1fr) auto auto;
  }

  .pipeline-rows--mapping .pipeline-row {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  }

  /* The note is a third piece of information, not a fourth column: give it
     its own line under the pair it annotates. */
  .pipeline-rows--mapping .pipeline-row-meta {
    grid-column: 1 / -1;
  }
}

/* Five semantic states, three treatments. ok/pass settle, review sits
   between, conflict/blocked alert. Distinguished by border strength and
   weight rather than hue, which keeps them legible in both themes and
   survives colour blindness.

   None of them may use --accent: AGENTS.md reserves it for interactive
   things and a state label is static text. */
.pipeline-chip {
  justify-self: start;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--rule);
  border-radius: var(--radius-control);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--text-subtle);
}

.pipeline-chip[data-state="review"] {
  border-color: var(--rule-strong);
  color: var(--text-muted);
}

.pipeline-chip[data-state="conflict"],
.pipeline-chip[data-state="blocked"],
.pipeline-chip[data-state="custom"] {
  border-color: var(--text);
  color: var(--text);
  font-weight: 600;
}

/* ---- conflicts ------------------------------------------------------ */

.pipeline-conflict {
  display: grid;
  gap: 0.3rem;
  padding: 0.65rem 0;
  border-top: 1px solid var(--rule);
  font-size: var(--step--1);
}

.pipeline-conflict-side,
.pipeline-conflict-kept {
  padding-left: 0.75rem;
  border-left: 2px solid var(--rule);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-subtle);
  overflow-wrap: anywhere;
}

/* The kept value is the outcome of the gate, so it gets the strong rule -
   the same weight the blocked chip uses, for the same reason. */
.pipeline-conflict-kept {
  border-left-color: var(--text);
  color: var(--text);
}

.pipeline-conflict-why {
  margin: 0.15rem 0 0;
  max-width: 62ch;
  color: var(--text-muted);
  line-height: var(--lh-body);
}
```

- [ ] **Step 4: Verify the observation now passes**

```bash
npm run build
```

Expected: exit 0.

Reload, reopen the case study, and step through all seven stages with `read_page` after each. Expected content, one distinguishing string per stage:

| Stage | Must appear |
| --- | --- |
| 1 Sources | `run1_g0_t0.imec0.ap.bin` and `SpikeGLX · 41.2 GB` |
| 2 Group | `SpikeGLX & Phy`, `4 files`, chips reading `supported` and `custom` |
| 3 Normalize | `session_start_time` with a `conflict` chip |
| 4 Map | `acquisition/ElectricalSeries` and `intervals/trials` |
| 5 Validate | `check_subject_species_exists` with `review`, and `blocked` |
| 6 Review | `2025-03-14T09:12:04-06:00` and `Kept 09:12:04-06:00` |
| 7 Assemble | `session.nwb`, `validation_report.json`, `provenance.log` |

Then `read_console_messages` with `onlyErrors: true`. Expected: empty. Duplicate-key warnings would appear here — every `key` above is a filename, field or label that is unique within its stage, so any warning means a data typo in Task 1.

- [ ] **Step 5: Commit**

```bash
git add src/PipelineViews.jsx src/pipeline-demo.css
git commit -m "$(cat <<'EOF'
Render the five pipeline row shapes

list and status each serve two stages, so five renderers cover seven.
State chips are told apart by border weight rather than hue: accent is
reserved for interactive things, and hue alone excludes colourblind
readers.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Motion and reduced motion

Two animations, and the delay trap handled. Its own task because the reduced-motion behaviour is separately rejectable and easy to get wrong in a way no build catches.

**Files:**
- Modify: `src/pipeline-demo.css` — append a motion section

**Interfaces:**
- Consumes: `--i` set inline per row by `rowStyle` in Task 3; `--progress` set inline on the rail in Task 2
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Write the failing observation**

With the case study open, use `javascript_tool` to read the computed animation on a row:

```js
getComputedStyle(document.querySelector(".pipeline-row")).animationName
```

Expected now: `"none"`. That absence is the failing state.

- [ ] **Step 2: Append the motion section**

Add to the end of `src/pipeline-demo.css`:

```css
/* ---- motion --------------------------------------------------------- */

/* Two active animations and no more, per AGENTS.md: the rail's progress bar
   (declared with the rail above) and this entrance settle on the incoming
   rows. A dot travelling the rail was considered and dropped - it would
   have been a third, and the node colour change already says the same
   thing. */
@media (prefers-reduced-motion: no-preference) {
  @keyframes pipeline-row-in {
    from {
      transform: translate3d(0, calc(var(--reveal-shift) / 2), 0);
    }
    to {
      transform: translate3d(0, 0, 0);
    }
  }

  /* Transform only, never opacity - the same rule the scroll reveals in
     spa.css follow. A row that never animates is still fully readable.

     The delay is declared in here rather than beside the animation on
     purpose. Section 14 of spa.css crushes animation-duration to 0.01ms
     under reduce but leaves animation-delay untouched, so a delay declared
     outside this query would hold each row at its start transform and make
     it arrive late - visibly worse than no animation at all. Inside the
     no-preference query there is no delay left to wait out. */
  .pipeline-row,
  .pipeline-conflict {
    animation: pipeline-row-in var(--dur-med) var(--ease) both;
    animation-delay: calc(var(--i, 0) * 28ms);
  }
}
```

28ms times the longest stage (nine source rows) is a 224ms tail, which lands inside the settle of the row before it rather than reading as a queue.

- [ ] **Step 3: Verify the observation now passes**

```bash
npm run build
```

Expected: exit 0.

Reload, reopen the case study, then:

```js
getComputedStyle(document.querySelector(".pipeline-row")).animationName
```

Expected: `"pipeline-row-in"`.

Check the stagger is actually per-row, not uniform:

```js
[...document.querySelectorAll(".pipeline-row")]
  .slice(0, 4)
  .map((el) => getComputedStyle(el).animationDelay)
```

Expected: `["0s", "0.028s", "0.056s", "0.084s"]`.

Check the rail progress tracks the stage. On stage 1 of 7:

```js
getComputedStyle(document.querySelector(".pipeline-rail")).getPropertyValue("--progress")
```

Expected: `"0"`. Click **Next stage** three times, then re-run — expected `"0.5"` at stage 4 of 7.

- [ ] **Step 4: Verify reduced motion**

Emulate reduce and reload so the load-time media queries re-evaluate:

```
resize_window {preset: "desktop", colorScheme: "light"}
```

The browser pane has no reduced-motion preset, so force it in the page instead. Re-run the delay check under an emulated reduce is not possible from JS alone, so verify the guarantee structurally with `Grep` over the stylesheet:

```bash
grep -n "animation-delay" src/pipeline-demo.css
```

Expected: exactly one hit, and `sed -n` around it must show it inside the `@media (prefers-reduced-motion: no-preference)` block opened above it. If `animation-delay` appears anywhere outside that block, the task fails.

Then confirm nothing else in the file animates:

```bash
grep -cn "animation:" src/pipeline-demo.css
```

Expected: `1`. Plus the one `transition: transform` on the rail progress and the one `transition: color` on the node buttons — `grep -c "transition:"` should return `2`.

- [ ] **Step 5: Commit**

```bash
git add src/pipeline-demo.css
git commit -m "$(cat <<'EOF'
Settle the pipeline rows in on stage change

Transform only, and the stagger delay lives inside the no-preference
query: the global reduce block crushes animation-duration but not
animation-delay, so a delay declared outside it would make rows land
late under reduce instead of instantly.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Responsive rail, dark theme, and final verification

The rail goes vertical on narrow screens, and the whole demo is checked in both themes. Last task because it verifies the finished thing.

**Files:**
- Modify: `src/pipeline-demo.css` — append a width section and a narrow section
- Modify: `docs/software-animation-patterns.md` — retag its `[open]` rules (Step 6)

**Interfaces:**
- Consumes: everything from Tasks 2 through 4
- Produces: nothing

- [ ] **Step 1: Write the failing observation**

Set a phone viewport and reload:

```
resize_window {preset: "mobile"}
```

Reopen the case study and screenshot the rail. Expected now: seven labels crushed into seven columns roughly 45px wide, with `NORMALIZE` and `ASSEMBLE` wrapping or overflowing. That is the failing state — capture it so the after-shot has something to compare against.

- [ ] **Step 2: Append the responsive section**

Add to the end of `src/pipeline-demo.css`:

```css
/* ---- width ----------------------------------------------------------- */

/* 56rem is where .case-body stops being one capped column and becomes a
   two-column grid with no width cap (spa.css:1117). The existing
   .case-demos span only applies under .case-body--figure, which this
   project is not, so the pipeline claims the full width itself - otherwise
   the rail would sit in one half-width column beside the prose. */
@media (min-width: 56rem) {
  .pipeline {
    grid-column: 1 / -1;
  }
}

/* Below that same 56rem the case body is capped at 66ch, about 528px, which
   gives seven nodes roughly 75px each against about 72px for NORMALIZE.
   Too close to call, so the rail turns vertical there instead. Pinning the
   rail's breakpoint to the one the layout already changes at removes the
   narrow-horizontal band entirely.

   Because the nodes are HTML in a grid rather than SVG text, this is a
   grid-auto-flow change and the labels wrap on their own - the reason the
   composition is not an SVG drawing.

   The track and progress rotate with it: same two pseudo-elements, 1px wide
   instead of 1px tall, scaled on Y instead of X. */
@media (max-width: 55.99rem) {
  .pipeline-rail {
    grid-auto-flow: row;
    grid-auto-columns: auto;
    gap: 0;
    padding: 0 0 0 0.875rem;
  }

  .pipeline-rail::before,
  .pipeline-rail::after {
    top: 0;
    bottom: auto;
    width: 1px;
    height: 100%;
    transform-origin: center top;
  }

  .pipeline-rail::after {
    transform: scaleY(var(--progress, 0));
  }

  .pipeline-node-btn {
    grid-template-columns: 1.25rem minmax(0, 1fr);
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0 0.4rem 0.5rem;
  }
}
```

- [ ] **Step 3: Verify narrow**

```bash
npm run build
```

Expected: exit 0.

At `resize_window {preset: "mobile"}`, reload, reopen the case study, and screenshot. Expected: the rail is a vertical list of seven rows, each showing its number and its full unwrapped label, with a 1px vertical rule down the left and the accent portion filling from the top. Step to stage 4 and confirm the accent fill reaches roughly half way down.

Also confirm the rows stacked: at this width `.pipeline-row` has no `grid-template-columns`, so each row's name, value and chip sit on their own lines. `read_page` should show every string from the Task 3 table still present and none truncated.

Then check the band this breakpoint choice exists for — 768px, between the old 44rem guess and the 56rem the layout actually changes at:

```
resize_window {preset: "tablet"}
```

Reload, reopen, screenshot. Expected: the rail is **still vertical** here. A horizontal rail at this width is the failure the 56rem breakpoint prevents, because `.case-body` is still capped at 66ch until 56rem.

- [ ] **Step 4: Verify wide and both themes**

Back to desktop:

```
resize_window {preset: "desktop", colorScheme: "light"}
```

Reload, reopen, screenshot stage 5 (Validate) — the densest stage, with six rows and three different chip treatments. Expected: horizontal rail with seven readable labels, and `pass`, `review` and `blocked` chips visibly distinct from one another by border weight and text weight, with no orange on any of them.

Confirm the demo spans the two-column case body rather than sitting in one column of it:

```js
const p = document.querySelector(".pipeline");
[p.getBoundingClientRect().width,
 p.parentElement.getBoundingClientRect().width]
```

Expected: the two numbers match to within a pixel. If the first is roughly half the second, the `grid-column: 1 / -1` rule is missing or the media query did not match.

Then dark:

```
resize_window {preset: "desktop", colorScheme: "dark"}
```

Reload, reopen, screenshot stage 5 again. Expected: the detail panel is `--surface` dark, all text legible, chips still distinguishable, and the rail's accent bar the dark-theme orange. Any light-grey panel here means `--plate` leaked in.

Confirm the panel background is the surface token and not the plate:

```js
getComputedStyle(document.querySelector(".pipeline-detail")).backgroundColor
```

Expected in dark: `rgb(23, 30, 35)` — that is `--surface` `#171e23`. If it comes back near `rgb(201, 208, 212)` the plate leaked in.

- [ ] **Step 5: Verify the sprite demos still work**

The one regression risk in this plan is the `App.jsx` branch. Scroll to **Autonomous Behavioral Training Rig**, open its case study, and click **Pellet delivery**, **Head-fix clamp** and **Control board** in turn. Expected: the shared sprite stage still plays, the pressed button still highlights, and the pellet pair still renders two figures side by side. `read_console_messages` with `onlyErrors: true` expected empty.

- [ ] **Step 6: Retag the open items in the patterns doc**

`docs/software-animation-patterns.md` marks each rule **[read]** (verified against source) or **[open]** (reasoned, not yet exercised). This demo is what exercises the open ones. Go through every `[open]` tag and either promote it to `[read]` with the evidence, or correct the rule.

At the time of writing there is one, in section 4: that React appends `px` to some numeric style values, so custom properties must be passed as strings. Task 4 already read `--progress` back and got `"0"` and `"0.5"` rather than `"0px"`, so that rule is confirmed — change the tag and cite the check.

Also add one line to Appendix B if this implementation produced a mistake worth recording. An appendix entry that came from real work is worth more than any rule in the body.

```bash
git add docs/software-animation-patterns.md
git commit -m "$(cat <<'EOF'
Confirm the open rules in the software animation patterns

The pipeline demo exercised them, so they are no longer reasoned.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: Send the screenshots and commit**

Send the owner the desktop light, desktop dark, and mobile screenshots of stage 5, plus one of stage 6 (Review) since the conflict layout is the densest prose in the demo.

```bash
git add src/pipeline-demo.css
git commit -m "$(cat <<'EOF'
Pin the pipeline rail to the case body's own breakpoint

56rem is where .case-body drops its 66ch cap and becomes two columns, so
that is where the rail can afford to be horizontal and where the demo has
to claim both columns. Below it the rail turns vertical: the same two
pseudo-elements rotate, 1px wide instead of 1px tall, scaled on Y instead
of X. Labels wrap on their own because the nodes are HTML in a grid,
which is why this is not an SVG drawing.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes

Checked against the spec:

- **Spec coverage.** Every section maps to a task: "What the visitor sees" and the data contract to Task 1; components and files to Task 2; the five view types to Task 3; motion and the reduced-motion trap to Task 4; layout, dark theme and verification to Task 5. The spec's "Out of scope" list appears in Global Constraints as explicit do-not-touch paths.
- **The spec's Layout section was rewritten while writing this plan, and the spec was updated to match.** It originally called for a `case-body--wide` modifier at 76ch and a 44rem rail breakpoint. Reading `spa.css:1117` showed `.case-body` already takes `max-width: none` above 56rem, so there was no cap to raise there — and it simultaneously becomes `grid-template-columns: repeat(2, ...)`, which would have put the rail in one half-width column. The real requirements are `grid-column: 1 / -1` above 56rem and a vertical rail below it. Aligning the rail's breakpoint to 56rem also removes the 44–56rem band where a horizontal rail had 75px per node against a 72px label, and means `src/spa.css` needs no edit at all.
- **One deliberate simplification against the spec.** The spec named both `.pipeline-chip` and `.pipeline-badge`; Task 3 uses one `.pipeline-chip` with `supported` and `custom` as two more `data-state` values. Two near-identical elements were not worth the duplicate CSS. This adds `supported` and `custom` to the state vocabulary in markup while leaving the *data* contract exactly as specified — `groups` rows still carry `kind`, not `state`.
- **The spec's `.pipeline-caption` was dropped.** `.demo-caption` in `spa.css` already provides the exact grid, gap and mono treatment, so Task 2 reuses it. One less class, and the demo's controls match the rig's.
- **Type consistency.** `StageView` is named identically in Tasks 2 and 3. `rowStyle` sets `--i`, which only Task 4 reads. `--progress` is written in Task 2 and read in Tasks 2 and 5. `data-state` values on `.pipeline-chip` are `ok`, `pass`, `review`, `conflict`, `blocked`, `supported`, `custom`; Task 3's CSS gives explicit rules for `review`, `conflict`, `blocked` and `custom`, and `ok`, `pass` and `supported` fall through to the base rule, which is the intended settled treatment.
- **Verification honesty.** Step 4 of Task 4 cannot emulate reduced motion from the browser pane, so it verifies the guarantee structurally with `grep` instead of behaviourally. That is stated in the step rather than glossed.

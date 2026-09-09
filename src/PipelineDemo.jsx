import { useState } from "react";
import { StageView } from "./PipelineViews";

/* The software counterpart to the sprite demos. Those replay a pre-rendered
   mechanism; this one steps through a conversion run, rendered live from
   siteData so filenames and NWB paths stay real, selectable text.

   React owns exactly one number - the stage index. Everything visual reads
   it off --progress, so there is no animation state in JS and nothing to
   keep in sync. data-stage carries the same number for inspection and
   debugging; nothing in CSS selects on it. */
export default function PipelineDemo({ demo }) {
  const stages = demo.stages;
  const last = stages.length - 1;
  const [stage, setStage] = useState(0);
  const current = stages[stage];
  const atEnd = stage === last;

  return (
    <figure className="pipeline case-demos" data-stage={stage}>
      {/* A custom property is exempt from React's px coercion, so String()
          here is insurance rather than load-bearing. */}
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
          <span className="pipeline-count" aria-live="polite">
            {stage + 1} / {stages.length}
          </span>
        </div>
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}

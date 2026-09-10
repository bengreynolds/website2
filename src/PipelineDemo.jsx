import { useState } from "react";

/* A walkthrough of the real desktop application, not a diagram of it.

   Every frame is a screenshot of NWB Forge captured while driving one
   conversion end to end, and the facts beside each frame were read off that
   same run. An earlier version of this demo rebuilt the interface in the
   browser from invented data; it was a decent diagram and a poor piece of
   evidence, and it could not show the software actually refusing to write.

   The visitor drives it. There is no playback, so there is no timer, no
   reduced-motion branch to gate and no live region to silence - the step only
   ever changes because someone asked for it.

   React owns one number - the step index. Everything else reads off it. */

export default function PipelineDemo({ demo }) {
  const steps = demo.steps;
  const last = steps.length - 1;
  const [step, setStep] = useState(0);
  const current = steps[step];

  const atStart = step === 0;
  const atEnd = step === last;
  const go = (next) => setStep(Math.min(last, Math.max(0, next)));

  return (
    <figure className="pipeline case-demos" data-step={step}>
      <ol
        className="pipeline-rail"
        style={{ "--progress": String(last === 0 ? 1 : step / last) }}
        aria-label="Conversion walkthrough steps"
      >
        {steps.map((s, i) => (
          <li className="pipeline-node" key={s.id}>
            <button
              type="button"
              className="pipeline-node-btn"
              data-state={i === step ? "current" : i < step ? "done" : "ahead"}
              aria-current={i === step ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="pipeline-node-num">{i + 1}</span>
              <span className="pipeline-node-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="shot-row">
        {/* The interface, at the size it was captured. Left column, because
            the frame is the evidence and the numbers annotate it. */}
        <figure className="shot-frame">
          <div className="shot-chrome">
            <span className="shot-app">{demo.app}</span>
            <span className="shot-session">{demo.session}</span>
          </div>
          {/* Keyed on the step so the browser treats each frame as a new
              element and the entrance runs again. Lazy: six frames is 223KB
              nobody should pay for before opening the case study. */}
          <img
            key={current.id}
            className="shot-img"
            src={current.shot}
            alt={current.alt}
            loading="lazy"
            decoding="async"
            width="1400"
            height="774"
          />
        </figure>

        <div className="shot-read">
          <p className="shot-headline">{current.headline}</p>
          <p className="shot-note">{current.note}</p>
          <dl className="shot-facts">
            {current.facts.map((fact) => (
              <div className="shot-fact" data-state={fact.state} key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <figcaption className="demo-caption">
        <div className="demo-switch">
          {/* Arrows carry no text, so the accessible name is on the button and
              the glyph is hidden - a screen reader should hear "Previous step",
              not "left arrow". Disabled at the ends rather than wrapping: the
              rail above already gives random access, and silently jumping from
              the last frame back to the first is a worse surprise than a
              control that plainly cannot go further. */}
          <button
            type="button"
            className="btn btn--quiet demo-button demo-button--nav"
            aria-label="Previous step"
            disabled={atStart}
            onClick={() => go(step - 1)}
          >
            <span aria-hidden="true">&larr;</span>
          </button>
          <button
            type="button"
            className="btn btn--quiet demo-button demo-button--nav"
            aria-label="Next step"
            disabled={atEnd}
            onClick={() => go(step + 1)}
          >
            <span aria-hidden="true">&rarr;</span>
          </button>
          {/* Polite now that nothing changes the step but the visitor. */}
          <span className="pipeline-count" aria-live="polite">
            {step + 1} / {steps.length}
          </span>
        </div>
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}

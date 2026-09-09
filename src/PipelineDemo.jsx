import { useEffect, useRef, useState } from "react";

/* A walkthrough of the real desktop application, not a diagram of it.

   Every frame is a screenshot of NWB Forge captured while driving one
   conversion end to end, and the facts beside each frame were read off that
   same run. An earlier version of this demo rebuilt the interface in the
   browser from invented data; it was a decent diagram and a poor piece of
   evidence, and it could not show the software actually refusing to write.

   React owns one number - the step index. Everything else reads off it. */

const FALLBACK_DWELL = 4600;

export default function PipelineDemo({ demo }) {
  const steps = demo.steps;
  const last = steps.length - 1;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = steps[step];
  const atEnd = step === last;
  const dwell = demo.dwell || FALLBACK_DWELL;

  /* A self-advancing walkthrough is motion, so under reduce it does not run
     and the stepper is the whole control set. Read once on mount. */
  const canPlay = useRef(false);
  useEffect(() => {
    canPlay.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /* AGENTS.md rules out timers; this is the documented exception. One
     timeout, cleared on every change, stopping at the last frame rather than
     looping. */
  useEffect(() => {
    if (!playing) return undefined;
    if (atEnd) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => setStep((s) => Math.min(last, s + 1)), dwell);
    return () => clearTimeout(id);
  }, [playing, step, atEnd, last, dwell]);

  const go = (next) => {
    setPlaying(false);
    setStep(next);
  };

  /* While playing, the rail sweeps to where the next step begins over the
     dwell, so it reads as a playhead rather than a bar that jumps. */
  const target = last === 0 ? 1 : (playing && !atEnd ? step + 1 : step) / last;

  return (
    <figure className="pipeline case-demos" data-step={step}>
      <ol
        className="pipeline-rail"
        data-playing={playing ? "1" : undefined}
        style={{ "--progress": String(target), "--playhead-dur": `${dwell}ms` }}
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
              element and the entrance runs again. Sized in the stylesheet
              rather than by attribute, and lazy: six frames is 223KB nobody
              should pay for before opening the case study. */}
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
          <button
            type="button"
            className="btn btn--quiet demo-button"
            data-playing={playing ? "1" : undefined}
            onClick={() => {
              if (playing) {
                setPlaying(false);
                return;
              }
              if (!canPlay.current) {
                setStep(atEnd ? 0 : step + 1);
                return;
              }
              if (atEnd) setStep(0);
              setPlaying(true);
            }}
          >
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </button>
          <button
            type="button"
            className="btn btn--quiet demo-button"
            onClick={() => go(atEnd ? 0 : step + 1)}
          >
            {atEnd ? "Restart" : "Next step"}
          </button>
          {/* Silent while the walkthrough drives itself; six announcements in
              half a minute is a metronome, not feedback. */}
          <span className="pipeline-count" aria-live={playing ? "off" : "polite"}>
            {step + 1} / {steps.length}
          </span>
        </div>
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}

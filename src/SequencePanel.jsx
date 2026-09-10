import { useEffect, useRef, useState } from "react";
import { loadSprite, prefersReducedMotion } from "./sprites";

/* --------------------------------------------------------------------------
   Sequence panel
   The assembly sequences, driven by buttons rather than by the page's scroll
   position. On the home grid a figure was something you scrolled past, so a
   scroll timeline was the right driver; here the figure is the subject of the
   page and the reader should decide when it runs and how fast.

   Three states, all set through one data attribute the stylesheet reads:
     absent    the poster, and nothing fetched
     play      running on the document timeline, one pass, holds the last frame
     step      paused, seeked by --scrub, one frame per press

   The sheet is 1 to 3MB and is not fetched until the reader asks. Under
   prefers-reduced-motion the generated CSS never attaches a sheet at all, so
   the controls would download megabytes to show the poster that is already
   there, and they are not rendered.
   -------------------------------------------------------------------------- */

export default function SequencePanel({ project }) {
  const { figure, figureFrames: frames, figureLabel } = project;

  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState(null);
  const [frame, setFrame] = useState(0);
  /* Bumping this remounts the figure, which is the reliable way to restart a
     CSS animation that has already run to completion. */
  const [runs, setRuns] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const last = frames - 1;

  /* Stepping writes the seek straight to the element rather than through
     state: the value is a custom property the stylesheet resolves, and
     nothing React renders depends on it. */
  useEffect(() => {
    const el = ref.current;
    if (!el || mode !== "step") return;
    el.style.setProperty("--scrub", String(frame / last));
    el.style.setProperty("--scrub-steps", String(last));
  }, [mode, frame, last]);

  const ensureSheet = (then) => {
    if (live) {
      then();
      return;
    }
    const wait = loadSprite(figure);
    if (!wait) {
      setLive(true);
      then();
      return;
    }
    setLoading(true);
    wait.then(() => {
      setLoading(false);
      setLive(true);
      then();
    });
  };

  const play = () =>
    ensureSheet(() => {
      setMode("play");
      setRuns((value) => value + 1);
    });

  /* Entering step mode remounts the figure. Seeking is done by writing a
     negative animation-delay, and a delay change is not re-evaluated on an
     animation that has already finished - measured: after one full play, the
     first three step presses moved the counter to 4 while the figure stayed
     on frame 100. A fresh mount gives the seek an unfinished animation to
     act on. Only the mode change remounts; stepping within the mode does
     not, or every press would restart it. */
  const step = (delta) =>
    ensureSheet(() => {
      if (mode !== "step") {
        setMode("step");
        setRuns((value) => value + 1);
      }
      setFrame((current) => Math.min(last, Math.max(0, current + delta)));
    });

  if (reduced) {
    return (
      <figure className="project-figure">
        <div className="rig-figure" data-figure={figure} role="img" aria-label={figureLabel} />
        <figcaption className="project-figure-caption">{figureLabel}</figcaption>
      </figure>
    );
  }

  return (
    <figure className="project-figure">
      <div
        key={runs}
        ref={ref}
        className={`rig-figure ${live ? "is-live" : ""}`}
        data-figure={figure}
        data-scrub={live && mode ? mode : undefined}
        role="img"
        aria-label={figureLabel}
      />

      <div className="seq-controls">
        <button type="button" className="btn btn--quiet" onClick={play} aria-busy={loading || undefined}>
          {loading ? "Loading" : mode === "play" ? "Replay" : `Play sequence (${frames} frames)`}
        </button>

        <div className="seq-step" role="group" aria-label="Step through the sequence">
          <button
            type="button"
            className="btn btn--quiet seq-nudge"
            onClick={() => step(-1)}
            disabled={mode === "step" && frame <= 0}
            aria-label="Previous frame"
          >
            &#8592;
          </button>
          <button
            type="button"
            className="btn btn--quiet seq-nudge"
            onClick={() => step(1)}
            disabled={mode === "step" && frame >= last}
            aria-label="Next frame"
          >
            &#8594;
          </button>
          <span className="seq-count" aria-live="off">
            {mode === "step" ? `${frame + 1} / ${frames}` : `${frames} frames`}
          </span>
        </div>
      </div>

      <figcaption className="project-figure-caption">{figureLabel}</figcaption>
    </figure>
  );
}

import { memo, useCallback, useState } from "react";
import PipelineDemo from "./PipelineDemo";
import ConsoleReport from "./ConsoleReport";
import { loadSprite, prefersReducedMotion, warmSprites } from "./sprites";

/* --------------------------------------------------------------------------
   Shared figures
   One component now: the sprite stage and its switcher. The scroll-scrubbed
   ScrubFigure that used to live here is gone with the scroll driving - the
   assembly sequences run from buttons in SequencePanel.jsx.
   -------------------------------------------------------------------------- */

/* One sprite stage plus its trigger row. Its own module so a project page
   and the grid share one payload gate and one switcher rather than two that
   drift apart. */
export const SpriteStage = memo(function SpriteStage({ demos, className = "" }) {
  /* Bumping runs remounts the stage, which is the reliable way to restart a
     CSS animation; a demo listing two ids renders both side by side and they
     play together. */
  const [play, setPlay] = useState({ id: null, runs: 0 });
  /* Which demo is waiting on its sprite. Keeps the poster up and the button
     honest instead of swapping to an empty --plate panel. */
  const [warming, setWarming] = useState(null);

  const runDemo = useCallback((id, ids) => {
    const start = () =>
      setPlay((prev) => ({ id, runs: prev.id === id ? prev.runs + 1 : 1 }));

    /* Under reduce the generated CSS never attaches a sprite, so fetching one
       would be megabytes spent to show the poster that is already up. */
    if (prefersReducedMotion()) {
      start();
      return;
    }

    const waits = ids.map(loadSprite).filter(Boolean);
    if (!waits.length) {
      start();
      return;
    }

    setWarming(id);
    Promise.all(waits).then(() => {
      setWarming((current) => (current === id ? null : current));
      start();
    });
  }, []);

  const active = demos.find((demo) => demo.id === play.id) || demos[0];

  /* The demo switcher, built once. A self-rendering demo owns its whole
     <figure> including the figcaption, so it cannot be wrapped - it is handed
     the switcher instead and puts it in its own caption. Before this, any
     self-rendering demo returned early and the switcher never rendered, which
     silently stranded every demo after the first one on the same project. */
  const switcher = demos.length > 1 ? (
    <div className="demo-switch">
      {demos.map((demo) => (
        <button
          key={demo.id}
          type="button"
          className={`btn btn--quiet demo-button ${demo.id === active.id ? "is-active" : ""}`}
          aria-pressed={demo.id === active.id}
          onPointerEnter={() => warmSprites(demo.ids || [demo.id])}
          onFocus={() => warmSprites(demo.ids || [demo.id])}
          onClick={() => runDemo(demo.id, demo.ids || [demo.id])}
        >
          {demo.label}
        </button>
      ))}
    </div>
  ) : null;

  /* Kinds that draw themselves. A demo with no kind is a sprite. */
  const SelfRendering = { walkthrough: PipelineDemo, report: ConsoleReport }[active.kind];
  if (SelfRendering) {
    return <SelfRendering demo={active} switcher={switcher} />;
  }

  const ids = active.ids || [active.id];
  const running = play.id === active.id && play.runs > 0;

  return (
    <figure className={`demo-wrap ${className}`}>
      <div
        className={`demo-stage ${ids.length === 2 ? "demo-stage--pair" : ""} ${
          ids.length > 2 ? "demo-stage--trio" : ""
        }`}
      >
        {ids.map((id) => (
          <div
            key={`${id}-${play.runs}`}
            data-demo={id}
            className={`demo-figure ${running ? "is-playing" : ""}`}
            role="img"
            aria-label={`${active.label}. ${active.caption}`}
          />
        ))}
      </div>
      <figcaption className="demo-caption">
        <div className="demo-switch">
          {demos.map((demo) => (
            <button
              key={demo.id}
              type="button"
              className={`btn btn--quiet demo-button ${
                demo.id === active.id ? "is-active" : ""
              }`}
              aria-pressed={demo.id === active.id}
              aria-busy={warming === demo.id || undefined}
              data-warming={warming === demo.id ? "1" : undefined}
              onPointerEnter={() => warmSprites(demo.ids || [demo.id])}
              onFocus={() => warmSprites(demo.ids || [demo.id])}
              onClick={() => runDemo(demo.id, demo.ids || [demo.id])}
            >
              {demo.label}
            </button>
          ))}
        </div>
        <span>{active.caption}</span>
      </figcaption>
    </figure>
  );
});

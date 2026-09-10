import { memo, useState } from "react";
import { tilePlacements, workIndex } from "./siteData";
import { loadSprite, prefersReducedMotion, warmSprites } from "./sprites";
import { AppLink } from "./router";

/* --------------------------------------------------------------------------
   Work grid
   Nine tiles: number, title, stack. Nothing else - no pulled metric, no
   featured treatment, no discipline filter. A tile that has art carries a
   square plate; the five that do not are typographic, and that mix is what
   stops nine cells reading as a table.

   Where the plate sits relative to the text is frozen per project in
   siteData's tilePlacements, written by scripts/seed_tile_placements.py. It
   is randomised once at build rather than per render, so the arrangement a
   visitor sees is the one that was reviewed, and a reroll shows up in the
   diff.

   The plate stays square in every placement. The generated sprite CSS
   computes background-size as a percentage of a square cell, so a plate that
   is not square draws every sprite stretched.
   -------------------------------------------------------------------------- */

/* One type scale for all nine tiles. The number is the large element and the
   title sits beside it at --step-2; there is no second size for a "featured"
   tile because nothing is featured any more. */

const Tile = memo(function Tile({ entry }) {
  const { project, n, shot } = entry;
  const placement = tilePlacements[project.id];
  /* Both sprite kinds play in a tile now. A figure used to be scrubbed by a
     view() timeline, so it sat on its poster however long you hovered it and
     the tile fell back to a still; since the sequences moved onto the document
     timeline it plays here the same way it does on the project page, driven by
     data-scrub="play" out of rig-scrub.css. Only a captured screenshot ("shot")
     is still a plain <img>. */
  const playable = shot && (shot.kind === "demo" || shot.kind === "figure") ? shot.id : null;

  /* Bumping runs remounts the plate, which is the reliable way to restart a
     CSS animation. Hover and focus are intent, so the sheet is fetched there
     and the poster stays up until it resolves. */
  const [runs, setRuns] = useState(0);

  const play = () => {
    if (!playable || prefersReducedMotion()) return;
    const wait = loadSprite(playable);
    if (!wait) {
      setRuns((value) => value + 1);
      return;
    }
    wait.then(() => setRuns((value) => value + 1));
  };

  return (
    <article
      id={`project-${project.id}`}
      className="tile"
      data-art={shot ? shot.kind : "none"}
      data-placement={placement || undefined}
      onPointerEnter={play}
    >
      {shot ? (
        <div className="tile-plate">
          {playable && shot.kind === "figure" ? (
            /* The sequence sprite. .is-live is what attaches the sheet, and
               data-scrub="play" is what puts it on the document timeline; both
               together are the project page's Play button, minus the button. */
            <div
              key={runs}
              className={`tile-figure rig-figure ${runs > 0 ? "is-live" : ""}`}
              data-figure={playable}
              data-scrub={runs > 0 ? "play" : undefined}
              role="img"
              aria-label={project.figureLabel || project.title}
            />
          ) : playable ? (
            <div
              key={runs}
              className={`tile-figure demo-figure ${runs > 0 ? "is-playing" : ""}`}
              data-demo={playable}
              role="img"
              aria-label={project.figureLabel || project.title}
            />
          ) : (
            <img
              className="tile-shot"
              src={shot.src}
              alt={project.figureLabel || project.title}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      ) : null}

      <div className="tile-read">
        <span className="tile-num" aria-hidden="true">
          {n}
        </span>
        <h3 className="tile-title">
          <AppLink
            className="tile-link"
            href={`/work/${project.id}`}
            onFocus={() => playable && warmSprites([playable])}
          >
            {project.title}
          </AppLink>
        </h3>
        <ul className="tile-tools">
          {project.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </article>
  );
});

export default function WorkGrid() {
  return (
    <section id="projects" className="section section--tinted">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">Selected work</h2>
          <p className="section-lead">
            Nine systems taken from problem to dependable operation. Open one for the
            problem, the approach, and the mechanism in motion.
          </p>
        </div>

        <div className="work-grid reveal">
          {workIndex.map((entry) => (
            <Tile entry={entry} key={entry.project.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

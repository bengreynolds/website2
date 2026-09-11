import { memo, useEffect, useState } from "react";
import { tilePlacements, workIndex } from "./siteData";
import { loadSprite, prefersReducedMotion, warmSprites } from "./sprites";
import { AppLink, isPlainClick } from "./router";
import { aimPlate, bloomPlate, sleepAll, sleepPlate, wakePlate } from "./tileGL";

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
  /* Only a demo sprite can play in a tile. A figure sprite is scrubbed by a
     scroll timeline and would sit on its poster however long you hovered it,
     so its tile shows the poster as an image and its animation lives on the
     project page. */
  const playable = shot && shot.kind === "demo" ? shot.id : null;
  const titleId = `tile-title-${project.id}`;

  /* Bumping runs remounts the plate, which is the reliable way to restart a
     CSS animation. Hover and focus are intent, so the sheet is fetched there
     and the poster stays up until it resolves. */
  const [runs, setRuns] = useState(0);

  /* Only the tile being entered is named, and only while it is being entered.
     Two elements sharing a view-transition-name aborts the transition, so
     naming all nine up front would break every navigation.

     Nothing resets this, and that is only safe because HomePage unmounts on
     navigate, which takes the name with it. If the grid is ever kept mounted
     across a route change - a cached home, a modal route, a transition that
     animates home out rather than replacing it - the name is stranded here,
     the project page's figure claims the same name, and every later
     transition aborts. Whoever makes that change owns resetting this. */
  const [leaving, setLeaving] = useState(false);

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
      /* Two things happen on intent, and they are mutually exclusive by
         construction: a demo tile fetches its sprite sheet, an image tile
         builds a WebGL plate. wakePlate returns immediately on a tile with no
         .tile-shot, which is every demo tile and every typographic one. */
      onPointerEnter={(event) => {
        play();
        wakePlate(event.currentTarget, event.clientX, event.clientY);
      }}
      /* Per tile, not on the grid: a pointer crossing from one tile to the
         next never leaves the grid, and a plate left running because the
         pointer moved sideways holds a WebGL context for nothing. */
      onPointerLeave={(event) => sleepPlate(event.currentTarget)}
    >
      {shot ? (
        <div
          className="tile-plate"
          style={leaving ? { viewTransitionName: "project-plate" } : undefined}
        >
          {playable ? (
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
        <h3 className="tile-title" id={titleId}>
          {project.title}
        </h3>
        <ul className="tile-tools">
          {project.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>

      {/* The link covers the whole panel, so it is a child of the tile rather
          than of the heading: grid-depth.css gives .tile-read and its
          children 3D transforms, and every one of those is a containing
          block, so an overlay raised from inside the heading would size
          itself to the title text instead of to the tile. See the .tile-link
          note in spa.css. It is last so it paints over the content, and it
          takes its accessible name from the heading. */}
      <AppLink
        className="tile-link"
        href={`/work/${project.id}`}
        aria-labelledby={titleId}
        onFocus={() => playable && warmSprites([playable])}
        onClick={(event) => {
          /* A modifier-click opens a new tab without unmounting this grid,
             so naming the plate on one would strand the name and abort every
             later transition. The bloom is on the same condition for the same
             reason: a tile that is staying put should not dissolve. */
          if (!isPlainClick(event)) return;
          setLeaving(true);
          bloomPlate(event.currentTarget.closest(".tile"));
        }}
      />
    </article>
  );
});

export default function WorkGrid() {
  /* One listener for nine tiles. Each tile gets the pointer's position within
     its own box as two unitless numbers; the transform that reads them lives
     in grid-depth.css. Writing the properties straight to the node rather
     than through state is deliberate - this fires at pointer rate, and a
     re-render per frame would be nine reconciliations for two numbers that
     only CSS consumes.

     Plain functions, not useCallback: WorkGrid holds no state, so it renders
     once and there is no identity to preserve. They are passed to a DOM
     element, not to the memoised Tile, so a new identity would not re-render
     anything either. */
  const track = (event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    const box = tile.getBoundingClientRect();
    tile.style.setProperty("--px", ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
    tile.style.setProperty("--py", ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
    /* The same event, and the same one listener, feeds the plate's shader.
       aimPlate is a no-op on a tile with no live WebGL plate, which is most
       of them most of the time. */
    aimPlate(tile, event.clientX, event.clientY);
  };

  /* Clearing on leave lets tiles fall back to their resting transform rather
     than freezing at whatever angle the pointer left them at.

     This clears every tile, not event.target.closest(".tile"). pointerleave
     fires on the grid when the pointer exits the grid, and at that moment
     event.target is the grid itself - closest(".tile") returns null from
     there, so the closest() version would clear nothing and leave the last
     hovered tile stuck tilted. */
  const release = (event) => {
    event.currentTarget.querySelectorAll(".tile").forEach((tile) => {
      tile.style.removeProperty("--px");
      tile.style.removeProperty("--py");
    });
  };

  /* Navigating away unmounts this grid, and a bloomed plate is mid-tween when
     that happens. Nothing here is React's to clean up - the canvases were
     appended by tileGL.js and the contexts belong to the driver - so the grid
     hands them all back on the way out. Without it a visitor who paged
     through several projects would accumulate dead contexts until the browser
     started evicting live ones. */
  useEffect(() => sleepAll, []);

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

        <div className="work-grid reveal" onPointerMove={track} onPointerLeave={release}>
          {workIndex.map((entry) => (
            <Tile entry={entry} key={entry.project.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

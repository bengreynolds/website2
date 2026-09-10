import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  aboutCards,
  contactLinks,
  education,
  experience,
  heroFacts,
  heroStatement,
  findProject,
  navigation,
  pathIntro,
  pathStages,
  projectFilters,
  resolveDemo,
  resolveShot,
  roleLabel,
  shortTitles,
  skillGroups,
  workIndex,
} from "./siteData";
import PipelineDemo from "./PipelineDemo";

const sectionIds = navigation.map((item) => item.id);
const THEME_KEY = "theme";

/* --------------------------------------------------------------------------
   Hooks
   All scroll-aware behavior uses IntersectionObserver. No scroll listeners.
   -------------------------------------------------------------------------- */

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  return (
    readStoredTheme() ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

const filterIds = projectFilters.map((option) => option.id);

function getInitialFilter() {
  if (typeof window === "undefined") return "all";
  const value = new URLSearchParams(window.location.search).get("work");
  return filterIds.includes(value) ? value : "all";
}

/* Let the browser handle modified clicks so "open in new tab", middle-click,
   and shift-click keep working on in-page links. */
function isPlainClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

/* Header hairline appears once the page has scrolled past a sentinel. */
function useStuckHeader() {
  const sentinelRef = useRef(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, stuck };
}

function useSectionSpy(setActive) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target.id);
      },
      { threshold: [0.2, 0.5], rootMargin: "-15% 0px -45% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActive]);
}

/* Which stage the reader is standing in, for the fixed index.

   Not intersectionRatio like useSectionSpy: every stage track is taller than
   the viewport, so each one's ratio is (viewport / track) and they are all
   equal. The rootMargin instead collapses the viewport to a thin band across
   its middle, and whichever track crosses that band is the current stage.
   Exactly one can, because the tracks are stacked and none is shorter than
   the band. */
function useStageSpy(setActive) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const tracks = Array.from(document.querySelectorAll("[data-stage-id]"));
    if (!tracks.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        setActive(hit.target.dataset.stageId);
      },
      { rootMargin: "-50% 0px -49% 0px" }
    );

    tracks.forEach((track) => observer.observe(track));
    return () => observer.disconnect();
  }, [setActive]);
}

/* --------------------------------------------------------------------------
   Sprite warm-up
   -------------------------------------------------------------------------- */

/* .is-playing swaps background-image from the poster to a sprite of 0.9-3MB
   that has never been fetched, because the whole point of the poster is that
   it has not. For the length of that download the element has no renderable
   image and falls back to background-color: var(--plate), which AGENTS.md
   keeps light in both themes - so the dark page flashes a bright panel. Worse,
   the 18s animation clock starts when the class lands rather than when the
   image arrives, so playback also begins part-way through.

   Decoding before the class is applied fixes both: the swap is then a cache
   hit, and frame 0 is the first thing painted. The poster stays up meanwhile,
   which is what it is for. Payload gating is untouched - nothing is fetched
   until the visitor asks for a demo, or hovers a button and all but says so. */

/* Convention from scripts/build_demo_sprite.py: data-demo="<id>" is served
   /rig/<id>.webp by the generated CSS. */
const spriteUrl = (id) => `/rig/${id}.webp`;

const spriteReady = new Set();
const spriteLoading = new Map();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Returns a promise while the sprite is still coming, or null once it is
   usable - so a warm demo starts on the same tick and never shows a wait. */
function loadSprite(id) {
  if (spriteReady.has(id)) return null;

  let pending = spriteLoading.get(id);
  if (!pending) {
    const img = new Image();
    img.src = spriteUrl(id);

    /* onload, not decode(), is the gate. These sheets are 17-66 megapixels and
       decode() on one does not resolve while the page is hidden - measured at
       over 10s for the 4160x4160 tunnel sheet that had already downloaded in
       7ms. Gating on it would mean clicking a demo, switching tabs, and coming
       back to a button that never fired. onerror resolves too: a missing
       sprite should fall back to the CSS behaviour we already had rather than
       leave the control dead. */
    const loaded = new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });

    /* Download is the part that caused the flash, and it is now done. Decoding
       is still worth a moment to avoid a paint hitch, but only as a courtesy:
       capped, never awaited to completion, and skipped entirely if it stalls. */
    pending = loaded
      .then(() =>
        img.decode
          ? Promise.race([
              img.decode().catch(() => {}),
              new Promise((resolve) => setTimeout(resolve, 400)),
            ])
          : undefined
      )
      .then(() => {
        spriteReady.add(id);
        spriteLoading.delete(id);
      });
    spriteLoading.set(id, pending);
  }
  return pending;
}

/* Hover and focus are intent, so start the download there. By click time the
   sprite is usually decoded and the demo starts instantly. */
function warmSprites(ids) {
  if (prefersReducedMotion()) return;
  ids.forEach(loadSprite);
}

/* --------------------------------------------------------------------------
   Wheel scrub
   -------------------------------------------------------------------------- */

/* One wheel notch, near enough, on every platform that reports pixels. Making
   it the cost of a single frame is the whole point of this hook: at the
   view() timeline's ~3.6px per frame a notch skipped ~27 frames, so the
   sequence was over in about four of them. Raise it to make the figure slower
   and finer, lower it to get past the figure in fewer notches. */
const PX_PER_FRAME = 100;

/* Firefox reports lines, and page mode exists on some remotes. */
function wheelPixels(event) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/* AGENTS.md forbids scroll listeners and this is the one deliberate exception
   to it; see the header of src/rig-scrub.css for why no declarative timeline
   can do this. It stays narrow: a wheel listener on one figure, no observers,
   no timers, and nothing on the page or document.

   React owns the frame index, but it lives in a closure and is written
   straight to a custom property rather than to state. A wheel gesture fires
   dozens of events a second and none of them change anything React renders. */
function useWheelScrub(ref, frames, enabled) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !frames || frames < 2) return undefined;

    /* Coarse pointers keep the view() timeline: capturing a touch drag is far
       more hostile than capturing a wheel, and there is no hover to scope it
       to. Under reduce the sprite is never even downloaded, so a panel that
       ate the wheel would trap the page in front of a static poster. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const last = frames - 1;
    let frame = 0;
    let carry = 0;

    /* Snapped to a keyframe stop rather than left continuous. The generated
       keyframes put frame k at k/(frames-1) of the timeline and hold it with
       step-end, so landing on a stop is what guarantees every frame is
       reachable instead of some being scrubbed past between notches.
       rig-scrub.css biases the seek half a step past the stop; without that,
       float rounding lands under the boundary and shows frame k-1. */
    const write = () => {
      el.style.setProperty("--scrub", String(frame / last));
      /* Drives the cursor: at either end the wheel goes back to the page, and
         the panel should stop advertising a scrub it will not perform. */
      el.dataset.scrubEnd = frame <= 0 || frame >= last ? "1" : "0";
    };

    /* Where the scroll timeline currently has the sprite, read back off the
       painted cell so handing over is seamless. background-size carries the
       column count ("1000%" is ten) and background-position the cell, both
       from the generated CSS, so this cannot disagree with the sheet. */
    const frameFromPaint = () => {
      const cs = getComputedStyle(el);
      const cols = Math.round(parseFloat(cs.backgroundSize) / 100);
      if (!cols || cols < 2) return 0;
      const [x, y] = cs.backgroundPosition.split(" ").map(parseFloat);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
      const stepPct = 100 / (cols - 1);
      const col = Math.round(x / stepPct);
      const row = Math.round(y / stepPct);
      return Math.min(last, Math.max(0, row * cols + col));
    };

    let engaged = false;

    /* Engaging is deliberate. An earlier build handed the wheel over as soon
       as the pointer was inside the figure, which meant anyone scrolling the
       page with the cursor over it got caught mid-sequence and had to wheel
       out the remaining frames. Worse, it replaced the scroll timeline
       outright, so a visitor who never hovered watched the figure sit frozen
       on frame 0 while it scrolled past - measured: 600px of page scroll, no
       frame change. The scroll timeline now stays in charge until asked. */
    const engage = () => {
      if (engaged) return;
      engaged = true;
      frame = frameFromPaint();
      carry = 0;
      el.dataset.scrub = "wheel";
      /* Interval count, not frame count: stops sit 1/steps apart, and
         rig-scrub.css needs that spacing to bias the seek off the boundary. */
      el.style.setProperty("--scrub-steps", String(last));
      write();
    };

    const release = () => {
      if (!engaged) return;
      engaged = false;
      delete el.dataset.scrub;
      delete el.dataset.scrubEnd;
      el.style.removeProperty("--scrub");
      el.style.removeProperty("--scrub-steps");
    };

    const onClick = () => (engaged ? release() : engage());

    const onWheel = (event) => {
      if (!engaged) return; // scroll timeline still owns it; let the page have it
      const direction = Math.sign(event.deltaY);
      if (!direction) return;

      /* Release at the ends: once the sequence is exhausted in the direction
         being scrolled, the wheel goes back to the page untouched. Without
         this the figure is a scroll trap for anyone whose pointer happens to
         rest on it. */
      if (direction > 0 && frame >= last) return;
      if (direction < 0 && frame <= 0) return;

      event.preventDefault();

      carry += wheelPixels(event);
      const step = Math.trunc(carry / PX_PER_FRAME);
      if (!step) return;

      carry -= step * PX_PER_FRAME;
      const next = Math.min(last, Math.max(0, frame + step));
      if (next === frame) return;
      frame = next;
      write();
    };

    /* The keyboard equivalent of the wheel, and the reason engaging is worth
       making focusable at all: arrows step a frame, Home/End jump the ends,
       Escape hands the figure back to the scroll timeline. */
    const onKeyDown = (event) => {
      const { key } = event;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        onClick();
        return;
      }
      if (key === "Escape") {
        release();
        return;
      }
      if (!engaged) return;
      const delta =
        key === "ArrowDown" || key === "ArrowRight"
          ? 1
          : key === "ArrowUp" || key === "ArrowLeft"
            ? -1
            : key === "End"
              ? last
              : key === "Home"
                ? -last
                : 0;
      if (!delta) return;
      event.preventDefault();
      const next = Math.min(last, Math.max(0, frame + delta));
      if (next === frame) return;
      frame = next;
      write();
    };

    /* Armed, not engaged: the cursor and the caption can advertise the scrub
       without the figure having taken the wheel yet. */
    el.dataset.scrubArmed = "1";
    el.tabIndex = 0;
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKeyDown);
    /* Not passive: preventDefault is the entire mechanism. */
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("wheel", onWheel);
      delete el.dataset.scrubArmed;
      el.removeAttribute("tabindex");
      release();
    };
  }, [ref, frames, enabled]);
}

/* --------------------------------------------------------------------------
   Shared figures
   The same two components serve the narrative stages and the work index, so
   a caption is written once in siteData and rendered wherever it is needed.
   -------------------------------------------------------------------------- */

/* One sprite stage plus its trigger row. Extracted from the work entry so a
   narrative stage can borrow a project's demo without duplicating either the
   payload gating or the switcher. */
const SpriteStage = memo(function SpriteStage({ demos, className = "" }) {
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

  /* The walkthrough brings its own stepper, so it does not use the shared
     sprite stage or its button row. A project mixing both kinds would lose the
     switcher; no project does. */
  if (active.kind === "walkthrough") {
    return <PipelineDemo demo={active} />;
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

/* The scroll-scrubbed assembly sequence. `live` is what attaches the sheet;
   until it flips, the poster is the whole image. */
function ScrubFigure({ figureId, frames, label, live }) {
  const ref = useRef(null);
  useWheelScrub(ref, frames, live);
  return (
    <div
      ref={ref}
      className={`rig-figure ${live ? "is-live" : ""}`}
      data-figure={figureId}
      role="img"
      aria-label={label}
    />
  );
}

/* --------------------------------------------------------------------------
   Narrative stage
   -------------------------------------------------------------------------- */

const StageFigure = memo(function StageFigure({ stage }) {
  const figure = stage.figure;

  /* Software stages have no render, so the readout takes the figure column
     rather than a placeholder panel pretending there is something to see. */
  if (!figure) {
    return (
      <dl className="stage-plate">
        {stage.readout.map((row) => (
          <div className="stage-plate-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (figure.kind === "scrub") {
    return <ScrubStageFigure stage={stage} figure={figure} />;
  }

  if (figure.kind === "shot") {
    const found = resolveShot(figure);
    if (!found) return null;
    const { step } = found;
    return (
      <figure className="stage-shot">
        <img
          src={step.shot}
          alt={step.alt}
          loading="lazy"
          decoding="async"
          width="1400"
          height="774"
        />
        <figcaption>{step.note}</figcaption>
      </figure>
    );
  }

  const demos = figure.demos.map(resolveDemo).filter(Boolean);
  if (!demos.length) return null;
  return <SpriteStage demos={demos} className="stage-demos" />;
});

/* 3MB of sprite sheet is not something to spend on a visitor who only
   scrolled past, so the sequence is opt-in the same way every button demo on
   this site is - and the control says what it costs. Once loaded, the figure
   scrubs off the stage's own scroll travel (see src/rig-scrub.css) and can
   also be clicked to step frame by frame. */
function ScrubStageFigure({ stage, figure }) {
  const [live, setLive] = useState(false);
  const [warming, setWarming] = useState(false);
  /* The description of the sequence lives on the project that owns it, so the
     stage borrows it rather than restating it. */
  const owner = findProject(stage.owners[0].project);
  const label = owner ? owner.figureLabel : figure.id;

  const go = () => {
    if (prefersReducedMotion()) {
      /* The generated CSS attaches no sheet under reduce, so this would be
         megabytes spent to keep showing the poster already on screen. */
      setLive(true);
      return;
    }
    const wait = loadSprite(figure.id);
    if (!wait) {
      setLive(true);
      return;
    }
    setWarming(true);
    wait.then(() => {
      setWarming(false);
      setLive(true);
    });
  };

  return (
    <figure className="rig-figure-wrap stage-scrub">
      <ScrubFigure
        figureId={figure.id}
        frames={figure.frames}
        label={label}
        live={live}
      />
      {/* .motion-only is hidden under prefers-reduced-motion, where the
          sheet is never attached and there is nothing to scroll through. */}
      <figcaption className="rig-figure-caption">
        Full assembly sequence, {figure.frames} frames.{" "}
        <span className="motion-only">Scroll to build.</span>
      </figcaption>
      {live ? null : (
        <button
          type="button"
          className="btn btn--quiet demo-button stage-scrub-load"
          aria-busy={warming || undefined}
          data-warming={warming ? "1" : undefined}
          onPointerEnter={() => warmSprites([figure.id])}
          onFocus={() => warmSprites([figure.id])}
          onClick={go}
        >
          Load the sequence ({figure.sheet})
        </button>
      )}
      <a className="link stage-scrub-link" href={`#project-${stage.owners[0].project}`}>
        Full case study
      </a>
    </figure>
  );
}

const PathStage = memo(function PathStage({ stage }) {
  const kind = stage.figure ? stage.figure.kind : "plate";
  return (
    /* The anchor is the track, not the pinned frame: jumping to the top of
       the track is what puts the reader at the start of the stage.

       data-stage-kind is how CSS picks the scroll span: the 100-frame
       assembly needs far more travel than a stage of prose, and React should
       not be computing viewport heights. */
    <div
      className="stage-track"
      id={`stage-${stage.id}`}
      data-stage-kind={kind}
      data-stage-id={stage.id}
    >
      <div className="stage-frame">
        <div className="container stage-grid">
          <div className="stage-body">
            <p className="stage-num">{stage.n}</p>
            <h3 className="stage-title">{stage.title}</h3>
            <p className="stage-lede">{stage.lede}</p>

            {stage.figure ? (
              <dl className="stage-readout">
                {stage.readout.map((row) => (
                  <div className="stage-readout-row" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="stage-owners">
              <p className="stage-owners-label">Owned by</p>
              <ul>
                {stage.owners.map((owner) => (
                  <li key={owner.project}>
                    <a className="stage-owner" href={`#project-${owner.project}`}>
                      {shortTitles[owner.project]}
                    </a>
                    <span className="stage-owner-note">{owner.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="stage-figure">
            <StageFigure stage={stage} />
          </div>
        </div>
      </div>
    </div>
  );
});

/* --------------------------------------------------------------------------
   Fixed index
   The escape hatch. A narrative is the least skimmable structure there is, so
   every stage and every project stays one click away for the whole scroll.
   -------------------------------------------------------------------------- */

/* Labels, not headings: this nav sits above the <h1> in the document, so a
   real <h2> here would put the page out of heading order. The two <nav>
   landmarks carry the semantics through aria-label instead. */
function SignalRail({ activeStage, open, onToggle, onJump }) {
  return (
    <div className={`rail ${open ? "is-open" : ""}`}>
      <div className="rail-inner">
        <button
          type="button"
          className="rail-toggle"
          aria-expanded={open}
          aria-controls="rail-lists"
          onClick={onToggle}
        >
          <span className="rail-toggle-label">Index</span>
          <span className="rail-toggle-hint">
            {pathStages.length} stages / {workIndex.length} projects
          </span>
        </button>

        <div className="rail-lists" id="rail-lists">
          <nav className="rail-group" aria-label="Signal path stages">
            <p className="rail-label">Path</p>
            <ol className="rail-list">
              {pathStages.map((stage) => (
                <li key={stage.id}>
                  <a
                    className={`rail-link ${
                      activeStage === stage.id ? "is-current" : ""
                    }`}
                    aria-current={activeStage === stage.id ? "true" : undefined}
                    href={`#stage-${stage.id}`}
                    onClick={(event) => onJump(event, `stage-${stage.id}`)}
                  >
                    <span className="rail-num">{stage.n}</span>
                    <span className="rail-text">{stage.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <nav className="rail-group" aria-label="Projects">
            <p className="rail-label">Work</p>
            <ol className="rail-list">
              {workIndex.map((entry) => (
                <li key={entry.project.id}>
                  <a
                    className="rail-link"
                    href={`#project-${entry.project.id}`}
                    onClick={(event) =>
                      onJump(event, `project-${entry.project.id}`)
                    }
                  >
                    <span className="rail-num">{entry.n}</span>
                    <span className="rail-text">{entry.short}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Work index
   The complete portfolio, reachable without reading a word of the narrative.
   -------------------------------------------------------------------------- */

const WorkEntry = memo(function WorkEntry({ entry }) {
  const { project, n, shot, stages } = entry;
  /* A closed <details> does NOT stop a CSS background from being fetched, so
     the sprite has to be attached on open or it costs every visitor 3MB they
     may never look at. */
  const [figureLive, setFigureLive] = useState(false);
  const hasFigure = Boolean(project.figure);
  const demos = project.demos || [];

  return (
    <article id={`project-${project.id}`} className="work-entry reveal">
      <div className="work-entry-head">
        <span className="work-num" aria-hidden="true">
          {n}
        </span>

        {/* Poster, not sprite: 4-46KB each, so the whole index costs less
            than one sheet. Five projects have no render, and those show the
            stages they own rather than a grey box.

            The --plate class is not cosmetic: CAD posters are near-black
            plastic and need a light sheet in BOTH themes or they disappear in
            dark mode. App screenshots are already light and do not. */}
        <div
          className={`work-shot ${
            shot ? (shot.plate ? "work-shot--plate" : "work-shot--shot") : "work-shot--stages"
          }`}
        >
          {shot ? (
            <img
              className="work-shot-img"
              src={shot.src}
              alt=""
              loading="lazy"
              decoding="async"
              data-fit={shot.fit}
              data-plate={shot.plate ? "1" : undefined}
            />
          ) : (
            <ul className="work-shot-stages" aria-hidden="true">
              {stages.map((stage) => (
                <li key={stage.id}>{stage.n}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="work-body">
          <h3 className="work-title">
            <a className="work-anchor" href={`#project-${project.id}`}>
              {project.title}
            </a>
          </h3>
          <p className="work-outcome">{project.summary}</p>

          <div className="work-meta">
            <div className="work-meta-row">
              <span className="work-meta-label">Role</span>
              <p className="work-meta-text">{project.role}</p>
            </div>
            <div className="work-meta-row">
              <span className="work-meta-label">Stack</span>
              <ul className="work-meta-items">
                {project.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
            <div className="work-meta-row">
              <span className="work-meta-label">Stages</span>
              <ul className="work-meta-items work-stage-links">
                {stages.map((stage) => (
                  <li key={stage.id}>
                    <a href={`#stage-${stage.id}`}>
                      {stage.n} {stage.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Outside the head grid on purpose: the case body is a two-column
          layout of its own above 56rem, and the walkthrough inside it claims
          the full width (see the width note in src/pipeline-demo.css). Nested
          in a column it would get half of that. */}
      <details
        className="case"
        onToggle={(event) => {
          if (event.currentTarget.open) setFigureLive(true);
        }}
      >
        <summary className="case-summary">Case study</summary>
        <div className={`case-body ${hasFigure ? "case-body--figure" : ""}`}>
          {hasFigure ? (
            <div className="case-figures">
              <figure className="rig-figure-wrap">
                <ScrubFigure
                  figureId={project.figure}
                  frames={project.figureFrames}
                  label={project.figureLabel}
                  live={figureLive}
                />
                <figcaption className="rig-figure-caption">
                  Full assembly sequence.{" "}
                  <span className="motion-only">Scroll to build.</span>
                </figcaption>
              </figure>
            </div>
          ) : null}

          {/* The demo stage spans both columns: a synchronized pair needs the
              full width, and stacking it under the build figure would leave a
              column twice the height of the prose beside it. */}
          {demos.length ? <SpriteStage demos={demos} className="case-demos" /> : null}

          <div className="case-text">
            <div className="case-block">
              <h4>Problem</h4>
              <p>{project.challenge}</p>
            </div>
            <div className="case-block">
              <h4>Approach</h4>
              <p>{project.approach}</p>
            </div>
            <div className="case-block">
              <h4>Implementation</h4>
              <ul className="case-list">
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>
    </article>
  );
});

/* --------------------------------------------------------------------------
   App
   -------------------------------------------------------------------------- */

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  /* null, not stage one: while the reader is still in the hero, no stage is
     current, and marking one would be a lie the rail tells on first paint. */
  const [activeStage, setActiveStage] = useState(null);
  const [filter, setFilter] = useState(getInitialFilter);
  const [theme, setTheme] = useState(getInitialTheme);

  const reducedMotion = usePrefersReducedMotion();
  const { sentinelRef, stuck } = useStuckHeader();

  const filteredWork = useMemo(
    () =>
      filter === "all"
        ? workIndex
        : workIndex.filter((entry) => entry.project.tags.includes(filter)),
    [filter]
  );

  useSectionSpy(setActiveSection);
  useStageSpy(setActiveStage);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* Follow the OS scheme only while the visitor has made no explicit choice. */
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = (event) => {
      if (readStoredTheme()) return;
      setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /* Honor a deep link on first paint, including project and stage
     permalinks. */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    setActiveSection(
      hash.startsWith("project-") ? "projects" : hash.startsWith("stage-") ? "path" : hash
    );
    const target = document.getElementById(hash);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (!event.target.closest(".masthead")) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!railOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [railOpen]);

  const scrollTo = useCallback(
    (id) => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      return true;
    },
    [reducedMotion]
  );

  const goToSection = useCallback(
    (id) => {
      setMenuOpen(false);
      setActiveSection(id);
      window.history.pushState(null, "", `#${id}`);
      scrollTo(id);
    },
    [scrollTo]
  );

  /* Rail links are real anchors, so a modified click still opens a tab. This
     only takes over the plain case, to close the mobile panel and keep the
     scroll consistent with the reduced-motion preference. */
  const jumpFromRail = useCallback(
    (event, id) => {
      if (!isPlainClick(event)) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      setRailOpen(false);
      window.history.pushState(null, "", `#${id}`);
      scrollTo(id);
    },
    [scrollTo]
  );

  /* Keep the active discipline in the URL so a filtered view can be shared
     and survives a reload. */
  const applyFilter = useCallback((next) => {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === "all") {
      url.searchParams.delete("work");
    } else {
      url.searchParams.set("work", next);
    }
    window.history.replaceState(null, "", url);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode; the in-memory value still applies */
      }
      return next;
    });
  }, []);

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div ref={sentinelRef} aria-hidden="true" />

      <header className={`masthead ${stuck ? "is-stuck" : ""}`}>
        <div className="container masthead-inner">
          <a
            className="wordmark"
            href="#home"
            onClick={(event) => {
              if (!isPlainClick(event)) return;
              event.preventDefault();
              goToSection("home");
            }}
          >
            Benjamin Reynolds
          </a>

          <nav
            id="primary-navigation"
            className={`primary-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Primary"
          >
            {navigation.map((item) => (
              <a
                key={item.id}
                className={`nav-link ${activeSection === item.id ? "is-current" : ""}`}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "location" : undefined}
                onClick={(event) => {
                  if (!isPlainClick(event)) return;
                  event.preventDefault();
                  goToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="masthead-actions">
            <button
              type="button"
              className="theme-button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              className="menu-button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <SignalRail
        activeStage={activeStage}
        open={railOpen}
        onToggle={() => setRailOpen((open) => !open)}
        onJump={jumpFromRail}
      />

      <main id="main">
        {/* Hero: the claim, the facts, and the two ways in - the story or the
            index. */}
        <section id="home" className="section hero">
          <div className="container hero-inner">
            <div>
              <span className="label role-label rise">{roleLabel}</span>
              <h1 className="hero-name rise" style={{ "--delay": "60ms" }}>
                Benjamin Reynolds
              </h1>
              <p className="hero-statement rise" style={{ "--delay": "120ms" }}>
                {heroStatement}
              </p>
              <div className="hero-ctas rise" style={{ "--delay": "180ms" }}>
                <a
                  className="btn btn--primary"
                  href="#path"
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;
                    event.preventDefault();
                    goToSection("path");
                  }}
                >
                  Follow the signal path
                </a>
                <a
                  className="btn btn--quiet"
                  href="#projects"
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;
                    event.preventDefault();
                    goToSection("projects");
                  }}
                >
                  Skip to all nine projects
                </a>
              </div>
            </div>

            <dl className="hero-facts rise" style={{ "--delay": "140ms" }}>
              {heroFacts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <dt className="fact-label">{fact.label}</dt>
                  <dd className="fact-value">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* The spine. Seven stages, each pinned while it is read, each naming
            the projects that own it. */}
        <section id="path" className="section section--stage">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title">Signal path</h2>
              <p className="section-lead">{pathIntro}</p>
            </div>
          </div>

          <div className="stages">
            {pathStages.map((stage) => (
              <PathStage key={stage.id} stage={stage} />
            ))}
          </div>
        </section>

        <section id="projects" className="section section--tinted">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title">Selected work</h2>
              <p className="section-lead">
                All nine, in full, with no narrative to read first. What each one is
                and what I did on it, with the engineering detail one click away.
              </p>
            </div>

            <div className="work-filters reveal" role="group" aria-label="Filter work by discipline">
              {projectFilters.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`filter ${filter === option.id ? "is-active" : ""}`}
                  aria-pressed={filter === option.id}
                  onClick={() => applyFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="work-index">
              {filteredWork.length > 0 ? (
                filteredWork.map((entry) => (
                  <WorkEntry key={entry.project.id} entry={entry} />
                ))
              ) : (
                <div className="work-empty">
                  <p>No work is tagged with that discipline yet.</p>
                  <p>
                    <button type="button" className="link" onClick={() => applyFilter("all")}>
                      Show everything
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title">Experience</h2>
              <p className="section-lead">
                Research engineering, hardware development, and software delivery. Full
                history is in the resume.
              </p>
            </div>

            <div className="roles">
              {experience.map((item, index) => (
                <details
                  key={`${item.role}-${item.dates}`}
                  className="role reveal"
                  open={index === 0}
                >
                  <summary className="role-summary">
                    <span className="role-dates">{item.dates}</span>
                    <span className="role-heading">
                      <span className="role-title">{item.role}</span>
                      <span className="role-org">{item.org}</span>
                    </span>
                    <span className="role-toggle" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <ul className="role-bullets">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="education reveal">
              <h3 className="education-title">Education and training</h3>
              <div className="edu-list">
                {education.map((item) => (
                  <div className="edu-entry" key={item.title}>
                    <h4>{item.title}</h4>
                    <p className="edu-sub">{item.subtitle}</p>
                    <p className="edu-body">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="section section--tinted">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title">Capabilities</h2>
            </div>

            <p className="cap-intro reveal">
              Three kinds of work, usually on the same project. Getting a system from
              prototype into daily use tends to need all of them.
            </p>

            <div className="cap-body">
              <div className="cap-notes reveal">
                {aboutCards.map((card) => (
                  <div className="cap-note" key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                ))}
              </div>

              {/* The footnote sits outside the group flow: the groups pack
                  into balanced columns and a paragraph in that flow would be
                  packed with them. */}
              <div className="cap-stack">
                <div className="cap-groups">
                  {skillGroups.map((group) => (
                    <div className="cap-group reveal" key={group.title}>
                      <h3 className="cap-group-title">{group.title}</h3>
                      <ul className="cap-items">
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="cap-footnote">
                  Primary tools only. The resume, linked at the end of the page,
                  carries the full list.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <div className="reveal">
              <h2 className="contact-title">Start a technical conversation</h2>
              <p className="contact-lede">
                Email is the most reliable route. The resume carries the full role history
                and tool list.
              </p>
            </div>

            <dl className="contact-list reveal">
              {contactLinks.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <div className="contact-row" key={link.label}>
                    <dt className="contact-label">{link.label}</dt>
                    <dd>
                      <a
                        className="contact-value"
                        href={link.href}
                        download={link.download ? "" : undefined}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                      >
                        {link.value}
                      </a>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </section>
      </main>

      <footer className="site-foot">
        <div className="container foot-inner">
          <span>&copy; {new Date().getFullYear()} Benjamin Reynolds</span>
          <span>{roleLabel}</span>
        </div>
      </footer>
    </div>
  );
}

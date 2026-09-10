import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  aboutCards,
  contactLinks,
  education,
  experience,
  heroFacts,
  heroStatement,
  navigation,
  projectFilters,
  projects,
  resumeHref,
  roleLabel,
  skillGroups,
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

/* --------------------------------------------------------------------------
   Sprite warm-up
   -------------------------------------------------------------------------- */

/* .is-playing swaps background-image from the poster to a sprite of 0.9-2.2MB
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
   Work entry
   -------------------------------------------------------------------------- */

const WorkEntry = memo(function WorkEntry({ project, index }) {
  /* A closed <details> does NOT stop a CSS background from being fetched, so
     the sprite has to be attached on open or it costs every visitor 648KB
     they may never look at. */
  const [figureLive, setFigureLive] = useState(false);
  const hasFigure = Boolean(project.figure);
  const figureRef = useRef(null);
  useWheelScrub(figureRef, project.figureFrames, figureLive);
  const demos = project.demos || [];
  const hasDemo = demos.length > 0;
  /* The demos share one stage and a row of buttons, so the case study stays
     two balanced columns instead of a stack of square figures. Bumping runs
     remounts the stage, which is the reliable way to restart a CSS animation;
     a demo listing two ids renders both side by side and they play together. */
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

  return (
    <article id={`project-${project.id}`} className="work-entry reveal">
      <div className="work-entry-head">
        <span className="work-num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>

        <h3 className="work-title">
          <a className="work-anchor" href={`#project-${project.id}`}>
            {project.title}
          </a>
        </h3>

        <div className="work-body">
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
          </div>
        </div>
      </div>

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
              <div
                ref={figureRef}
                className={`rig-figure ${figureLive ? "is-live" : ""}`}
                data-figure={project.figure}
                role="img"
                aria-label={project.figureLabel}
              />
              <figcaption className="rig-figure-caption">
                Full assembly sequence. Scroll to build.
              </figcaption>
            </figure>
          </div>
          ) : null}

          {/* The demo stage spans both columns: a synchronized pair needs the
              full width, and stacking it under the build figure would leave a
              column twice the height of the prose beside it. */}
          {hasDemo ? (() => {
            const active = demos.find((d) => d.id === play.id) || demos[0];
            /* The walkthrough brings its own stepper, so it does not use
               the shared sprite stage or its button row. A project mixing
               both kinds would lose the switcher; no project does. */
            if (active.kind === "walkthrough") {
              return <PipelineDemo demo={active} />;
            }
            const ids = active.ids || [active.id];
            const running = play.id === active.id && play.runs > 0;
            return (
              <figure className="demo-wrap case-demos">
                <div
                  className={`demo-stage ${
                    ids.length === 2 ? "demo-stage--pair" : ""
                  } ${ids.length > 2 ? "demo-stage--trio" : ""}`}
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
                        onPointerEnter={() =>
                          warmSprites(demo.ids || [demo.id])
                        }
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
          })() : null}

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
  const [activeSection, setActiveSection] = useState("home");
  const [filter, setFilter] = useState(getInitialFilter);
  const [theme, setTheme] = useState(getInitialTheme);

  const reducedMotion = usePrefersReducedMotion();
  const { sentinelRef, stuck } = useStuckHeader();

  const filteredProjects = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((project) => project.tags.includes(filter)),
    [filter]
  );

  useSectionSpy(setActiveSection);

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

  /* Honor a deep link on first paint, including project permalinks. */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    setActiveSection(hash.startsWith("project-") ? "projects" : hash);
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

  const goToSection = useCallback(
    (id) => {
      const target = document.getElementById(id);
      if (!target) return;
      setMenuOpen(false);
      setActiveSection(id);
      window.history.pushState(null, "", `#${id}`);
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reducedMotion]
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
            <a className="btn btn--quiet" href={resumeHref} download>
              Resume
            </a>
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

      <main id="main">
        {/* Hero: asymmetric split. Left carries the message, right carries
            real facts rather than a decorative diagram. */}
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
                  href="#projects"
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;
                    event.preventDefault();
                    goToSection("projects");
                  }}
                >
                  Selected work
                </a>
                <a className="btn btn--quiet" href={resumeHref} download>
                  Resume
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

        <section id="projects" className="section section--tinted">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title">Selected work</h2>
              <p className="section-lead">
                Systems taken from problem to dependable operation. What each one is and
                what I did on it, with the engineering detail one click away.
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
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <WorkEntry key={project.id} project={project} index={index} />
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
                <p className="cap-footnote">
                  Primary tools only. The{" "}
                  <a className="link" href={resumeHref} download>
                    resume
                  </a>{" "}
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

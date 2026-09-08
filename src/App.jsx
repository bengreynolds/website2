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
   Work entry
   -------------------------------------------------------------------------- */

const WorkEntry = memo(function WorkEntry({ project, index }) {
  /* A closed <details> does NOT stop a CSS background from being fetched, so
     the sprite has to be attached on open or it costs every visitor 648KB
     they may never look at. */
  const [figureLive, setFigureLive] = useState(false);
  const hasFigure = project.figure === "buildup";
  const demos = project.demos || [];
  const hasDemo = demos.length > 0;
  /* Per-demo { runs, view }. Bumping runs remounts that figure, which is the
     reliable way to restart a CSS animation; toggling a class alone does not.
     view walks demo.views so one button can play several sprites in sequence. */
  const [demoPlay, setDemoPlay] = useState({});

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
          {hasFigure || hasDemo ? (
          <div className="case-figures">
          {hasFigure ? (
            <figure className="rig-figure-wrap">
              <div
                className={`rig-figure ${figureLive ? "is-live" : ""}`}
                role="img"
                aria-label="Assembly sequence of the training rig, built up from bare corner legs through horizontal bars, platform rails, the cage, tunnel, pellet delivery, camera and Jetson modules, then the floor, side panels, doors and panel connectors."
              />
              <figcaption className="rig-figure-caption">
                Full assembly sequence. Scroll to build.
              </figcaption>
            </figure>
          ) : null}

          {demos.map((demo) => {
            const views = demo.views || [demo.id];
            const { runs = 0, view = 0 } = demoPlay[demo.id] || {};
            return (
              <figure className="demo-wrap" key={demo.id}>
                <div
                  key={`${runs}-${view}`}
                  data-demo={views[view]}
                  className={`demo-figure ${runs ? "is-playing" : ""}`}
                  role="img"
                  aria-label={`${demo.label}. ${demo.caption}`}
                  onAnimationEnd={() => {
                    if (view + 1 < views.length) {
                      setDemoPlay((prev) => ({ ...prev, [demo.id]: { runs, view: view + 1 } }));
                    }
                  }}
                />
                <figcaption className="demo-caption">
                  <button
                    type="button"
                    className="btn btn--quiet demo-button"
                    onClick={() =>
                      setDemoPlay((prev) => ({
                        ...prev,
                        [demo.id]: { runs: ((prev[demo.id] || {}).runs || 0) + 1, view: 0 },
                      }))
                    }
                  >
                    {runs ? `Replay ${demo.label.toLowerCase()}` : `Run ${demo.label.toLowerCase()}`}
                  </button>
                  <span>{demo.caption}</span>
                </figcaption>
              </figure>
            );
          })}
          </div>
          ) : null}

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

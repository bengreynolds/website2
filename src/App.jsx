import { useCallback, useEffect, useRef, useState } from "react";
import { navigation, roleLabel } from "./siteData";
import {
  AppLink,
  NavigateProvider,
  isPlainClick,
  parseRoute,
  routeTitle,
  useRouter,
} from "./router";
import HomePage from "./HomePage";
import ProjectPage from "./ProjectPage";
import Rail from "./Rail";
import NavSwap from "./NavSwap";

const sectionIds = navigation.map((item) => item.id);
const THEME_KEY = "theme";

/* --------------------------------------------------------------------------
   Shell
   Masthead, theme, rail, and the two routes. Every scroll-aware behaviour
   below is an IntersectionObserver, used to mark where the reader is; there
   is no scroll listener anywhere on the site, and nothing a sprite does
   depends on scroll position.
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

/* Which section the reader is in, for the masthead's current marker and for
   which rail group is emphasised once the rail is open.

   `epoch` is in the dependency list because the observed elements are route
   content: after a navigation the old sections are gone and the observer is
   watching detached nodes. Without it the rail would keep reporting the
   section the reader left. */
function useSectionSpy(setActive, epoch) {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    /* The same thin band as useStageSpy, and for the same reason. Ranking by
       intersectionRatio needs a section to fill enough of the observation box
       to clear a threshold, and once the skills section collapsed, the work
       grid became more than twice the height of that box: its ratio never
       reached 0.2, no entry ever reported as intersecting, and the callback
       returned early - leaving "skills" marked in the masthead and in the
       rail while the reader was standing in the work grid. A band that
       exactly one section crosses does not care how tall the sections are. */
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (!hit) return;
        setActive(hit.target.id);
      },
      { rootMargin: "-50% 0px -49% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActive, epoch]);
}

/* Which skill the reader is standing in.

   Not intersectionRatio like useSectionSpy: every stage track is taller than
   the viewport, so each one's ratio is (viewport / track) and they are all
   equal. The rootMargin instead collapses the viewport to a thin band across
   its middle, and whichever track crosses that band is the current stage.
   Exactly one can, because the tracks are stacked and none is shorter than
   the band. */
function useStageSpy(setActive, epoch) {
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
  }, [setActive, epoch]);
}

export default function App() {
  const { path, navigate, pendingHash, clearHash } = useRouter();
  const route = parseRoute(path);

  const [theme, setTheme] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [activeStage, setActiveStage] = useState(null);
  const { sentinelRef, stuck } = useStuckHeader();
  const mainRef = useRef(null);

  useSectionSpy(setActiveSection, path);
  useStageSpy(setActiveStage, path);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* Private browsing. The attribute is what themes the page. */
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  /* A route change is a page change, so it resets what a page change resets:
     the title, the scroll position, and focus. "instant" is not the default -
     scroll-behavior is smooth on this site, and "auto" means "use the
     computed behaviour", which would animate the whole document. */
  const firstRender = useRef(true);
  useEffect(() => {
    document.title = routeTitle(route);
    setMenuOpen(false);

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!pendingHash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (mainRef.current) mainRef.current.focus();
    }
  }, [path]);

  /* A hash asked for during navigation, acted on once the target route has
     mounted and the element exists. */
  useEffect(() => {
    if (!pendingHash) return;
    const target = document.getElementById(pendingHash);
    if (target) target.scrollIntoView({ block: "start" });
    clearHash();
  }, [pendingHash, path, clearHash]);

  const goToSection = useCallback(
    (id) => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      /* Not on this route. Ask for it on home and let the hash effect run it
         once home has mounted. */
      navigate(`/#${id}`);
    },
    [navigate]
  );

  const onJump = useCallback((event, id) => {
    if (!isPlainClick(event)) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    /* The skills are closed by default, so jumping to one has to open it.
       Landing on a collapsed heading looks like the link did nothing. */
    if (target.tagName === "DETAILS") target.open = true;
    target.scrollIntoView({ block: "start" });
  }, []);

  return (
    <NavigateProvider navigate={navigate}>
      {/* The rail is permanently open on a project route, so the shell has to
          reserve its full width there. On home it reserves only the collapsed
          strip and the opening rail overlays, which is what stops the article
          reflowing every time the rail breathes. */}
      <div className="page-shell" data-route={route.name}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <div ref={sentinelRef} aria-hidden="true" className="stuck-sentinel" />

        <header className={`masthead ${stuck ? "is-stuck" : ""}`}>
          <div className="container masthead-inner">
            <AppLink className="wordmark" href="/">
              Benjamin Reynolds
            </AppLink>

            <nav
              id="primary-navigation"
              className={`primary-nav ${menuOpen ? "is-open" : ""}`}
              aria-label="Primary"
            >
              {navigation.map((item) => (
                <a
                  key={item.id}
                  className={`nav-link ${
                    route.name === "home" && activeSection === item.id ? "is-current" : ""
                  }`}
                  href={`/#${item.id}`}
                  aria-current={
                    route.name === "home" && activeSection === item.id
                      ? "location"
                      : undefined
                  }
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;
                    event.preventDefault();
                    goToSection(item.id);
                  }}
                >
                  <NavSwap>{item.label}</NavSwap>
                </a>
              ))}
            </nav>

            <div className="masthead-actions">
              <button
                type="button"
                className="theme-button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
                }
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

        <Rail
          route={route}
          activeSection={activeSection}
          activeStage={activeStage}
          onJump={onJump}
        />

        <main id="main" ref={mainRef} tabIndex={-1}>
          {route.name === "work" ? (
            <ProjectPage project={route.project} />
          ) : (
            <HomePage goToSection={goToSection} isPlainClick={isPlainClick} />
          )}
        </main>

        <footer className="site-foot">
          <div className="container foot-inner">
            <span>&copy; {new Date().getFullYear()} Benjamin Reynolds</span>
            <span>{roleLabel}</span>
          </div>
        </footer>
      </div>
    </NavigateProvider>
  );
}

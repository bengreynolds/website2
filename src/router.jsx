import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { findProject } from "./siteData";
import { runShutter } from "./shutter";

/* --------------------------------------------------------------------------
   Router
   Two routes, one listener, no dependency. vercel.json rewrites every path
   to /index.html, so a deep link into /work/<id> is served the same document
   and resolved here.

   popstate, not scroll: AGENTS.md bans scroll listeners, and this is not one.
   The browser fires popstate for Back and Forward and for nothing else, so
   there is one event per navigation rather than one per frame.

   Every link on the site stays a real <a href>. The only click that is
   intercepted is an unmodified left click, which is what leaves Cmd-click,
   Ctrl-click, middle-click, shift-click and "Open in new tab" working - and
   what lets a crawler and a no-JS reader follow the same href.
   -------------------------------------------------------------------------- */

/* Also used by the masthead and by the SVG node links. */
export function isPlainClick(event) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/* Two routes: the single-page home, and one page per project. Everything the
   old exploration branch put on /about and /contact is a section of home, so
   those paths are not routes here - they resolve to home, and the in-page
   anchors #experience and #contact are what address them.

   Trailing slashes are trimmed, so /work/<id>/ and /work/<id> are one route
   rather than one route and one 'unknown'. */
export function parseRoute(pathname) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "home" };
  if (parts.length === 2 && parts[0] === "work") {
    const project = findProject(decodeURIComponent(parts[1]));
    if (project) return { name: "work", project };
  }

  /* Unknown paths render home. The URL is deliberately left alone: a
     replaceState here would erase the bad link from the visitor's history and
     hide the mistake from whoever sent it. */
  return { name: "home", unknown: true };
}

export function routeTitle(route) {
  if (route.name === "work") return `${route.project.title} | Benjamin Reynolds`;
  return "Benjamin Reynolds | R&D Engineer";
}

/* Where the aperture should open once the new route is on screen.

   The shared-element morph this replaced carried the clicked tile's plate
   into the project page's figure; this is the same intent expressed through a
   wipe - the aperture shuts on what was clicked and opens on what was
   arrived at. Called at the seam, after the swap, so it measures the route
   that just rendered.

   In priority order, and each candidate has to actually be on screen: the
   route change scrolls to the top, and on most project pages the Mechanism
   figure is a screen and a half down, so opening on it would open the
   aperture on something nobody can see. That is why the page's own head is in
   this list and not only the figure - measured on the first build, which
   found the figure every time, rejected it every time, and always fell back
   to the middle of the screen. */
const OPEN_TARGETS = [
  ".project-figure",
  ".demo-stage",
  ".rig-figure",
  ".project-head",
  ".hero",
];

function openPoint() {
  for (const selector of OPEN_TARGETS) {
    const el = document.querySelector(selector);
    if (!el) continue;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) continue;
    if (box.top > window.innerHeight || box.bottom < 0) continue;
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return null;
}

/* --------------------------------------------------------------------------
   Two route transitions, one per navigation
   --------------------------------------------------------------------------
   A plain left click on a work tile morphs that tile's plate into the project
   page's figure, through the View Transitions API. Every other navigation -
   the rail, the masthead, Back and Forward - closes the shutter over the
   page.

   They are exclusive per navigation and the reason is real:
   startViewTransition snapshots the whole document, so a shutter drawn over
   one of its transitions is captured in the old snapshot and freezes there.
   An earlier build read that as "one or the other, forever", and deleted the
   morph. It is a statement about a single navigation, not about the site.

   Which one runs is decided by whether there is a source element to morph
   FROM. WorkGrid names the clicked tile's plate and arms the flag below; the
   rail and the masthead name nothing, and a morph with no source is a
   crossfade with extra steps. A Back press never gets the morph either, and
   could not: its URL has already changed before popstate is reached, and the
   browser has already restored the scroll position for the entry being
   returned to, so the "old" snapshot would not be the page the reader was
   looking at.

   flushSync is needed by both paths, for two different reasons.
   startViewTransition snapshots the old DOM, calls the callback, then
   snapshots the new one, and React 18 batches - so without it both snapshots
   are identical and the transition plays correctly while showing nothing. The
   shutter needs it because openPoint has to measure the route that was just
   swapped in; without it the callback returns before the commit, openPoint
   measures the page being left, and the aperture fell back to the middle of
   the screen every time. Measured, on the first build of each.
   -------------------------------------------------------------------------- */

/* Set by WorkGrid on the click that named a plate, consumed by the very next
   navigate() and by nothing else. A one-shot rather than a parameter on
   navigate() because AppLink is what calls navigate, and threading a
   transition choice through every link on the site to serve nine tiles would
   put the decision everywhere instead of in the one place that makes it. */
let morphArmed = false;

/* Whether the morph can run at all. WorkGrid asks before it arms, so that the
   alternative - bloom the plate, aim the shutter at the tile - is chosen in
   the same breath and the two can never both be set up for one click. */
export function morphAvailable() {
  if (typeof document === "undefined") return false;
  if (typeof document.startViewTransition !== "function") return false;
  /* Reduced motion skips the morph rather than shortening it: a
     cross-document morph has no honest short version. Such a navigation falls
     to the shutter, which is itself instant under reduce. */
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function armPlateMorph() {
  morphArmed = true;
}

function takeMorph() {
  const armed = morphArmed;
  morphArmed = false;
  return armed;
}

function withShutter(apply) {
  runShutter(() => flushSync(apply), openPoint);
}

function withMorph(apply) {
  document.startViewTransition(() => flushSync(apply));
}

const NavigateContext = createContext(null);

export function useNavigate() {
  return useContext(NavigateContext);
}

export function useRouter() {
  const [path, setPath] = useState(() => window.location.pathname);
  /* A hash the caller asked for that the target has not rendered yet. Held
     rather than acted on, because "/#projects" from a project page has to
     mount home before there is a #projects to scroll to. */
  const [pendingHash, setPendingHash] = useState(null);

  useEffect(() => {
    /* Back and Forward always get the shutter, never the morph. The URL has
       already changed by the time this fires, so the aperture closes a beat
       after the address bar rather than before it - which nobody can see, and
       is the price of covering a navigation the page did not initiate. It
       closes on the middle of the screen because a Back press has no position
       on the page.

       takeMorph rather than ignoring the flag: a click that armed it and then
       did not navigate must not leave it armed for whatever comes next. */
    const onPopState = () => {
      takeMorph();
      withShutter(() => setPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  /* pushState does not fire popstate, so the state update here is what
     re-renders. Navigating to the current path is a no-op rather than a new
     history entry: otherwise clicking the wordmark on home would need one
     Back press per click to leave. A bare hash on the current path is not a
     no-op, though - it is a request to move within the page.

     The href is split because the route is the path alone. Storing the raw
     "/#projects" would send parseRoute a single "#projects" segment, which
     resolves to home by accident rather than on purpose, and would then
     disagree with window.location.pathname forever after. */
  const navigate = useCallback((href) => {
    /* Read and cleared first thing, before any early return: a click that
       armed the morph and then turned out to be a no-op must not leave it
       armed for the next link the reader presses. */
    const morph = takeMorph();

    const hashAt = href.indexOf("#");
    const nextPath = (hashAt === -1 ? href : href.slice(0, hashAt)) || "/";
    const hash = hashAt === -1 ? null : href.slice(hashAt + 1) || null;

    if (nextPath === window.location.pathname && !hash) return;

    window.history.pushState(null, "", href);
    const apply = () => {
      setPath(nextPath);
      setPendingHash(hash);
    };
    /* One or the other, never both. morphAvailable is re-read rather than
       trusted from arming time, because a reader can turn reduced motion on
       between the click and here. */
    if (morph && morphAvailable()) withMorph(apply);
    else withShutter(apply);
  }, []);

  const clearHash = useCallback(() => setPendingHash(null), []);

  return { path, navigate, pendingHash, clearHash };
}

export function NavigateProvider({ navigate, children }) {
  return <NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider>;
}

/* An <a> that happens to be intercepted. href is spread-proof: it is applied
   after {...rest}, so a caller cannot override it. onClick is not part of
   rest at all - it is destructured out and composed instead, so a caller's
   handler (e.g. WorkGrid blooming its plate and aiming the shutter at the
   tile) runs first and the interception below always runs after it,
   unconditionally. That gives a
   caller every click, but not a veto: it can still interfere by calling
   event.preventDefault() (killing the browser's own new-tab default on a
   modifier-click) or by throwing (aborting before navigate() runs, which
   degrades to a full page load). No current caller does either. */
export function AppLink({ href, children, onClick, ...rest }) {
  const navigate = useNavigate();
  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!isPlainClick(event)) return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { findProject } from "./siteData";

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

/* Runs a route change inside a view transition when the browser has one.

   flushSync is not optional. startViewTransition snapshots the old DOM, calls
   this callback, then snapshots the new one - and React 18 batches state
   updates, so without flushSync the callback returns before React has
   committed and both snapshots are identical. The transition then plays
   correctly and shows nothing.

   Reduced motion skips the whole thing rather than shortening it: a
   cross-document morph has no honest short version. */
function withViewTransition(apply) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }
  document.startViewTransition(() => {
    flushSync(apply);
  });
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
    const onPopState = () => setPath(window.location.pathname);
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
    const hashAt = href.indexOf("#");
    const nextPath = (hashAt === -1 ? href : href.slice(0, hashAt)) || "/";
    const hash = hashAt === -1 ? null : href.slice(hashAt + 1) || null;

    if (nextPath === window.location.pathname && !hash) return;

    window.history.pushState(null, "", href);
    withViewTransition(() => {
      setPath(nextPath);
      setPendingHash(hash);
    });
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
   handler (e.g. WorkGrid naming its tile before it leaves) runs first and
   the interception below always runs after it, unconditionally. That gives a
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

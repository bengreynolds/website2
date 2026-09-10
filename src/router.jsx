import { createContext, useCallback, useContext, useEffect, useState } from "react";
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
    setPath(nextPath);
    setPendingHash(hash);
  }, []);

  const clearHash = useCallback(() => setPendingHash(null), []);

  return { path, navigate, pendingHash, clearHash };
}

export function NavigateProvider({ navigate, children }) {
  return <NavigateContext.Provider value={navigate}>{children}</NavigateContext.Provider>;
}

/* An <a> that happens to be intercepted. Props spread first so href and
   onClick cannot be replaced by a caller and quietly lose the interception. */
export function AppLink({ href, children, ...rest }) {
  const navigate = useNavigate();
  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

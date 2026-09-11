/* --------------------------------------------------------------------------
   Asset paths
   Every path into /public is written with a leading slash in the data files
   ("/rig/pcb.webp", "/app/nwbforge-ingest.webp"), which is correct for a site
   served from the root of an origin and wrong for one served from a
   sub-path. GitHub Pages serves a project site from /<repo>/, so the leading
   slash there points at the origin root and the asset 404s.

   Vite rewrites url(...) inside CSS against the build's base for us, and the
   generated demo stylesheets are the reason that matters - nothing here has
   to touch them. What it cannot rewrite is a string a module hands to the
   DOM, which is what this is for.

   BASE_URL always ends in a slash and is "/" when the site is served from a
   root, so on Vercel or a custom domain this is the identity function.
   -------------------------------------------------------------------------- */

export function asset(path) {
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;
}

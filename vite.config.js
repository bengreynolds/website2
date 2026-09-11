import { copyFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The preview harness assigns a free port via PORT; fall back to Vite's defaults.
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

/* Where the site is served from. Root by default, which is what `npm run dev`,
   `npm run preview` and a root host (Vercel, a custom domain) all want, so
   nothing about local work changes. The GitHub Pages workflow sets
   VITE_BASE=/website2/ because Pages serves a project repo from /<repo>/.
   src/router.jsx and src/assetPath.js read this back through BASE_URL. */
const base = process.env.VITE_BASE || "/";

/* Pages has no rewrite rule: a deep link to /work/<id> is a real request for a
   path with no file behind it, and Pages answers that with 404.html. Serving
   the app's own document there is what makes the deep link resolve in the
   router instead of on a 404 page - the same job vercel.json does with its
   rewrite. .nojekyll is belt and braces: the Actions artifact path does not
   run Jekyll, but without it a future switch to branch-based Pages would drop
   public/_mock and every other underscore-prefixed directory. */
function pagesFallback() {
  return {
    name: "pages-spa-fallback",
    apply: "build",
    closeBundle() {
      const dist = fileURLToPath(new URL("./dist/", import.meta.url));
      copyFileSync(`${dist}index.html`, `${dist}404.html`);
      writeFileSync(`${dist}.nojekyll`, "");
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), pagesFallback()],
  server: {
    open: "/index.html",
    port,
  },
  preview: {
    port,
  },
});

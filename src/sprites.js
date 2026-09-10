/* Shared sprite plumbing. Extracted from App.jsx when the page became more
   than one route: the work grid, the project pages and the scroll figures all
   need the same payload gate, and three copies of it would drift.

   Nothing here is new. The comments are the original ones and they record why
   each choice is the way it is, which is the reason they travelled with it.
   -------------------------------------------------------------------------- */

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
export const spriteUrl = (id) => `/rig/${id}.webp`;

const spriteReady = new Set();
const spriteLoading = new Map();

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Returns a promise while the sprite is still coming, or null once it is
   usable - so a warm demo starts on the same tick and never shows a wait. */
export function loadSprite(id) {
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
export function warmSprites(ids) {
  if (prefersReducedMotion()) return;
  ids.forEach(loadSprite);
}


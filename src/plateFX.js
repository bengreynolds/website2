/* --------------------------------------------------------------------------
   Work plate effect - the gate, and nothing else
   --------------------------------------------------------------------------
   src/tileGL.js is the implementation and it pulls in GSAP. This module is
   what WorkGrid imports, and it holds only the three cheap questions that
   decide whether any of that is wanted: is there a fine pointer, is motion
   allowed, is there a WebGL context to be had. All three are answered without
   loading a byte of the thing they gate.

   That split is the whole point. Before it, tileGL's `import gsap` put the
   whole animation library in the entry chunk for every visitor, including the
   ones on a phone who can never trigger a single tween in it. Now GSAP
   arrives with tileGL, on the first pointer that reaches a tile that can use
   it, the same way the 0.5-3MB sprite sheets arrive on intent.

   Every exported call is a no-op until that import has resolved, which is
   correct rather than merely safe: nothing can be sleeping, aimed or bloomed
   before anything has been woken.
   -------------------------------------------------------------------------- */

let mod = null;
let pending = null;

/* Cached, because the probe costs a context and there are only about sixteen
   of them per page. loseContext() hands this one straight back. */
let webglOK = null;
function hasWebGL() {
  if (webglOK !== null) return webglOK;
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") || probe.getContext("webgl");
    webglOK = !!gl;
    const ext = gl && gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
  } catch {
    webglOK = false;
  }
  return webglOK;
}

/* Every gate, read at the moment of the pointer rather than once at module
   load: a visitor can turn reduced motion on, and a laptop with a touchscreen
   can go from a finger to a trackpad between one tile and the next. */
export function plateGLWanted() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return hasWebGL();
}

/* The poster URL of a demo tile, read here rather than inside tileGL.js
   because of a race that only exists on the far side of the await.

   A demo figure shows its poster until .is-playing lands, and .is-playing
   swaps background-image to the sprite sheet. On a FIRST hover the sheet is
   still downloading, so the poster is up for hundreds of milliseconds and any
   moment would do. On a SECOND hover loadSprite() resolves synchronously,
   WorkGrid's setRuns commits in the same React event handler, and the figure
   is already playing by the time a dynamic import could possibly resolve - so
   the still read there would be the whole sheet, shrunk to fit the plate.

   Read synchronously, at the top of the pointerenter handler, and cached by
   demo id so a tile that has been hovered once never has to read it again. */
const posterByDemo = new Map();

function readPoster(tile) {
  const fig = tile.querySelector(".tile-plate .tile-figure");
  if (!fig) return null;
  const id = fig.dataset.demo;
  if (id && posterByDemo.has(id)) return posterByDemo.get(id);

  const cs = getComputedStyle(fig);
  /* A percentage pair is the sprite grid (800% 800%), which means .is-playing
     has already landed and this is the sheet, not the poster. */
  if (/^\s*[\d.]+%\s+[\d.]+%\s*$/.test(cs.backgroundSize)) return null;
  const match = cs.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
  const url = match ? match[1] : null;
  if (url && id) posterByDemo.set(id, url);
  return url;
}

function load() {
  if (!pending) {
    pending = import("./tileGL.js").then((loaded) => {
      mod = loaded;
      return loaded;
    });
  }
  return pending;
}

export function wakePlate(tile, clientX, clientY) {
  if (!tile || !plateGLWanted()) return;
  /* A typographic tile has no plate at all, and there are four of those. */
  if (!tile.querySelector(".tile-plate")) return;

  const poster = readPoster(tile);
  if (mod) {
    mod.wakePlate(tile, clientX, clientY, poster);
    return;
  }
  load()
    .then((loaded) => {
      /* The pointer may have left during the import. */
      if (tile.isConnected && tile.matches(":hover")) {
        loaded.wakePlate(tile, clientX, clientY, poster);
      }
    })
    .catch(() => {
      /* A failed import leaves the DOM tile exactly as it was, which is what
         every other gate in this file leaves behind too. */
    });
}

export function aimPlate(tile, clientX, clientY) {
  if (mod) mod.aimPlate(tile, clientX, clientY);
}

export function sleepPlate(tile) {
  if (mod) mod.sleepPlate(tile);
}

export function bloomPlate(tile) {
  if (mod) mod.bloomPlate(tile);
}

export function sleepAll() {
  if (mod) mod.sleepAll();
}

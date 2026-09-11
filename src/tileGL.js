import gsap from "gsap";

/* --------------------------------------------------------------------------
   Work tile plates, on the GPU
   --------------------------------------------------------------------------
   A WebGL canvas laid over the <img> inside a work tile's plate, drawing the
   same image through a shader that can refract it around the pointer and
   blow it out on the way to a project page.

   ---- which tiles, and why not all of them --------------------------------

   Only the tiles whose plate is an <img> - siteData's indexShot() calls those
   "figure" (a scroll figure's poster) and "shot" (a captured frame of a real
   application). The "demo" tiles are left as DOM and get nothing from this
   file.

   That is a deliberate limit, not an oversight. A demo tile's plate is a
   sprite sheet driven by generated CSS: scripts/build_demo_sprite.py writes
   the grid, the poster and the keyframes, and the animation is
   background-position stepping across a sheet of up to 66 megapixels. To put
   that through a shader the frame index would have to be re-derived in JS
   from numbers that currently exist only in generated CSS, and every future
   regeneration would have to keep the two in step. The sheet is also far
   larger than the maximum texture size on a lot of hardware. The brief allows
   the fallback and this takes it: sprite tiles keep the DOM animation that
   already works, image tiles get the shader.

   ---- what the visitor gets ----------------------------------------------

   At rest: nothing. No canvas exists, no WebGL context is created, and the
   ogl module has not been fetched. The tile is exactly the DOM tile.

   On pointer: the module is imported, a context is created for that plate,
   and the canvas fades up over the <img> drawing the same pixels - the fade
   is there to hide any colour-management difference between the two, not to
   be seen. A refraction lens then follows the pointer.

   On click: the texture magnifies out of the plate and dissolves, handing the
   screen to the route shutter.

   The <img> underneath is never removed. It is the fallback for context loss,
   for a failed import, and for every gate below, and it means the worst case
   is the grid exactly as it was.
   -------------------------------------------------------------------------- */

/* One import promise for the whole grid, started on the first pointer that
   reaches a plate. The site already gates 0.5-3MB sprite sheets behind a
   click for the same reason, and a WebGL library nobody's pointer ever
   touches should not be in the first paint either. */
let oglPromise = null;
function loadOGL() {
  if (!oglPromise) oglPromise = import("./ogl-plate.js");
  return oglPromise;
}

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

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/* The fragment shader is the whole effect, so the notes are here.

   uFit reproduces object-fit: contain. .tile-shot is a contained image in its
   plate, so a full-plate quad that simply stretched the texture would be
   visibly wider than the DOM it replaces - which breaks the one rule this
   feature has, that a visitor who never interacts sees no difference. Outside
   the fitted box the fragment is fully transparent and the tile's own ground
   shows through, exactly as the letterbox does now.

   uPlate is (aspect, 1) and is applied to the distance and then removed from
   the push, so the lens is a circle on a 16:10 plate rather than an ellipse.

   The displacement is a gaussian lens with one ring around it, and it does
   not move on its own: there is no time uniform anywhere in this file. What
   the eye reads as a ripple following the pointer is the lens itself moving,
   and it trails the pointer because uMouse is tweened rather than assigned.
   That keeps the effect off the "infinite animation" list - it renders only
   while something is actually changing, and not at all when the pointer is
   still. */
const FRAG = `
precision mediump float;

uniform sampler2D tMap;
uniform vec2 uPlate;
uniform vec2 uFit;
uniform vec2 uMouse;
uniform float uHover;
uniform float uBloom;

varying vec2 vUv;

void main() {
  vec2 p = vUv;

  vec2 d = (p - uMouse) * uPlate;
  float r = length(d);
  vec2 dir = r > 0.0001 ? d / r : vec2(0.0);

  float lens = exp(-r * r * 30.0);
  float ring = sin(r * 24.0) * exp(-r * r * 44.0);
  p += (dir / uPlate) * (lens * 0.011 + ring * 0.004) * uHover;

  /* Contracting the sample coordinates magnifies the image, which is the
     outward bloom. */
  p = 0.5 + (p - 0.5) * (1.0 - 0.24 * uBloom);

  vec2 t = (p - 0.5) / uFit + 0.5;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  /* A negative LOD bias. The plate is a heavy minification of a captured
     screenshot, so trilinear lands part-way up the mip chain and reads softer
     than the browser's own downscale of the same <img>. Biasing toward the
     sharper mip closes most of that gap; going further starts to alias on the
     fine UI text these captures are full of. */
  vec4 tex = texture2D(tMap, t, -0.4);
  gl_FragColor = vec4(tex.rgb + uBloom * 0.3, tex.a * (1.0 - uBloom));
}
`;

const live = new Map();

/* Plates that have outlived their tile. A click navigates, HomePage unmounts,
   and React removes the tile - measured at under 45ms after the click, which
   is before the bloom has rendered a single frame. The first build ran the
   bloom on a canvas inside the tile and it was simply never seen.

   So on click the canvas is lifted out of the tile onto the body as a fixed
   element at the rect the plate occupied, and finishes there. It is no longer
   anyone's child, which is exactly why it survives - and why it has to clean
   itself up on a deadline rather than waiting for an unmount that has already
   happened. */
const orphans = new Set();

/* One shared ticker callback for the whole grid, and it only draws plates
   that have been marked dirty. GSAP's ticker is the rAF the deck already
   runs on, so this adds no second loop. */
let ticking = false;

function draw(plate) {
  if (plate.dead) return true;
  if (plate.dirty) {
    plate.dirty = false;
    plate.renderer.render({ scene: plate.mesh });
  }
  return false;
}

function frame() {
  let busy = false;
  live.forEach((plate) => {
    busy = !draw(plate) || busy;
  });
  orphans.forEach((plate) => {
    busy = !draw(plate) || busy;
  });
  if (!busy) stopTicker();
}

function startTicker() {
  if (ticking) return;
  ticking = true;
  gsap.ticker.add(frame);
}

function stopTicker() {
  if (!ticking) return;
  ticking = false;
  gsap.ticker.remove(frame);
}

function fit(plate) {
  const box = plate.el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const iw = plate.img.naturalWidth || 1;
  const ih = plate.img.naturalHeight || 1;
  const plateAspect = box.width / box.height;
  const imgAspect = iw / ih;

  plate.renderer.setSize(box.width, box.height);
  plate.program.uniforms.uPlate.value = [plateAspect, 1];
  plate.program.uniforms.uFit.value =
    imgAspect > plateAspect ? [1, plateAspect / imgAspect] : [imgAspect / plateAspect, 1];
  plate.dirty = true;
  startTicker();
}

async function build(tile) {
  const el = tile.querySelector(".tile-plate");
  const img = el && el.querySelector(".tile-shot");
  if (!el || !img) return null;

  /* A lazy image that has not arrived yet has no pixels to upload, and
     uploading it anyway gives a black plate. Wait for it; the DOM img is on
     screen the whole time. */
  if (!img.complete || !img.naturalWidth) {
    await new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }
  if (!img.naturalWidth) return null;

  const { Renderer, Program, Mesh, Texture, Triangle } = await loadOGL();

  const renderer = new Renderer({
    alpha: true,
    depth: false,
    antialias: false,
    premultipliedAlpha: false,
    /* Capped at 2: these are 380px plates and a 3x phone-class DPR would
       triple the fill rate for pixels nobody can resolve. */
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  });
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.className = "tile-gl";
  canvas.setAttribute("aria-hidden", "true");

  /* Mipmaps and anisotropy are not polish. A tile plate is about 366px wide
     and a captured application screenshot is several times that, so drawing
     it is a heavy minification. A single bilinear tap at that ratio aliases
     badly: the first build rendered the plate visibly softer and moirer than
     the <img> beside it, which fails the one rule this feature has. Trilinear
     off a mip chain is what the browser's own downscale is doing.

     OGL turns mipmaps off and falls back to LINEAR by itself if this lands on
     WebGL1 with a non-power-of-two image, so this is safe rather than
     conditional. anisotropy is clamped to the driver's maximum inside OGL. */
  const texture = new Texture(gl, {
    image: img,
    generateMipmaps: true,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
    anisotropy: 8,
  });
  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    transparent: true,
    depthTest: false,
    cullFace: false,
    uniforms: {
      tMap: { value: texture },
      uPlate: { value: [1, 1] },
      uFit: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uBloom: { value: 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const plate = { el, img, canvas, renderer, program, mesh, dirty: true, dead: false };

  /* Context loss is not recoverable here and does not need to be: hiding the
     canvas leaves the <img> that was underneath it the whole time, so the
     grid is the DOM grid again rather than a row of blank squares.
     preventDefault is what stops the browser treating it as fatal. */
  canvas.addEventListener(
    "webglcontextlost",
    (event) => {
      event.preventDefault();
      teardown(tile);
    },
    false
  );

  el.appendChild(canvas);

  if (typeof ResizeObserver === "function") {
    plate.ro = new ResizeObserver(() => fit(plate));
    plate.ro.observe(el);
  }
  fit(plate);

  return plate;
}

function dispose(plate) {
  if (plate.dead) return;
  plate.dead = true;
  gsap.killTweensOf(plate.program.uniforms.uHover);
  gsap.killTweensOf(plate.program.uniforms.uBloom);
  gsap.killTweensOf(plate.program.uniforms.uMouse);
  gsap.killTweensOf(plate.canvas);
  if (plate.ro) plate.ro.disconnect();
  if (plate.guard) clearTimeout(plate.guard);
  plate.canvas.remove();
  if (plate.img.isConnected) plate.img.style.removeProperty("opacity");
  /* Handing the context back rather than letting it idle. A browser allows
     roughly sixteen at once, and paging through nine projects would otherwise
     leak one per tile until it started evicting the live ones. */
  const ext = plate.renderer.gl.getExtension("WEBGL_lose_context");
  if (ext) ext.loseContext();
  orphans.delete(plate);
  if (!live.size && !orphans.size) stopTicker();
}

function teardown(tile) {
  const plate = live.get(tile);
  if (!plate) return;
  live.delete(tile);
  dispose(plate);
}

/* pointerenter. Returns nothing: everything after the await is best-effort,
   and a failure anywhere in it leaves the DOM tile alone. */
export function wakePlate(tile, clientX, clientY) {
  if (!tile || live.has(tile) || tile.dataset.glPending === "1") return;
  if (!plateGLWanted()) return;
  if (!tile.querySelector(".tile-plate .tile-shot")) return;

  tile.dataset.glPending = "1";
  build(tile)
    .then((plate) => {
      delete tile.dataset.glPending;
      if (!plate) return;
      /* The pointer may have left during the import. Attaching anyway and
         letting the leave path find it would fade a canvas up on a tile
         nobody is pointing at. */
      if (!tile.matches(":hover")) {
        plate.dead = true;
        plate.canvas.remove();
        if (plate.ro) plate.ro.disconnect();
        const ext = plate.renderer.gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
        return;
      }
      live.set(tile, plate);
      /* Seed the lens where the pointer actually is. uMouse otherwise starts
         at the middle of the plate, and the first thing a visitor saw was a
         refraction appearing dead centre and then sliding out to meet the
         cursor - which is the one moment the effect is most obviously an
         effect. */
      if (clientX !== undefined) {
        const box = plate.el.getBoundingClientRect();
        if (box.width && box.height) {
          plate.program.uniforms.uMouse.value = [
            (clientX - box.left) / box.width,
            1 - (clientY - box.top) / box.height,
          ];
        }
      }
      gsap.to(plate.canvas, { opacity: 1, duration: 0.2, ease: "power1.out" });
      gsap.to(plate.program.uniforms.uHover, {
        value: 1,
        duration: 0.35,
        ease: "power2.out",
        onUpdate: () => {
          plate.dirty = true;
        },
      });
      startTicker();
    })
    .catch(() => {
      delete tile.dataset.glPending;
    });
}

/* pointermove, fed from the one listener the grid already has. The pointer
   position is tweened rather than assigned, which is what makes the lens
   trail the cursor like something with mass instead of snapping to it. */
export function aimPlate(tile, clientX, clientY) {
  const plate = live.get(tile);
  if (!plate || plate.dead) return;
  const box = plate.el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  gsap.to(plate.program.uniforms.uMouse, {
    value: [(clientX - box.left) / box.width, 1 - (clientY - box.top) / box.height],
    duration: 0.45,
    ease: "power2.out",
    onUpdate: () => {
      plate.dirty = true;
    },
  });
  startTicker();
}

export function sleepPlate(tile) {
  const plate = live.get(tile);
  if (!plate || plate.dead || plate.leaving) return;
  plate.leaving = true;
  gsap.killTweensOf(plate.program.uniforms.uMouse);
  gsap.to(plate.program.uniforms.uHover, {
    value: 0,
    duration: 0.3,
    ease: "power2.in",
    onUpdate: () => {
      plate.dirty = true;
    },
  });
  gsap.to(plate.canvas, {
    opacity: 0,
    duration: 0.26,
    ease: "power1.in",
    /* The context goes back rather than idling: nine tiles times one context
       each is most of the browser's budget, and a grid nobody is pointing at
       should be holding none of it. */
    onComplete: () => teardown(tile),
  });
  startTicker();
}

/* The click. Short, because the route shutter is closing over it and a bloom
   that outlasts the shutter is a bloom nobody sees the end of. */
export const BLOOM_MS = 300;

export function bloomPlate(tile) {
  const plate = live.get(tile);
  if (!plate || plate.dead) return;

  const box = plate.el.getBoundingClientRect();
  if (!box.width || !box.height) {
    teardown(tile);
    return;
  }

  /* Out of the tile before the tile goes. Fixed, at the rect the plate is
     occupying right now, so the bloom happens exactly where the visitor
     clicked even though the page underneath is being replaced and scrolled to
     the top beneath it. */
  live.delete(tile);
  orphans.add(plate);
  if (plate.ro) plate.ro.disconnect();
  plate.ro = null;
  gsap.killTweensOf(plate.canvas);
  gsap.killTweensOf(plate.program.uniforms.uMouse);
  gsap.killTweensOf(plate.program.uniforms.uHover);

  const canvas = plate.canvas;
  canvas.classList.add("tile-gl--free");
  canvas.style.left = `${box.left}px`;
  canvas.style.top = `${box.top}px`;
  canvas.style.opacity = "1";
  document.body.appendChild(canvas);
  /* The <img> is still under the old tile for the moment or two before React
     removes it. Hiding it stops a crisp photograph showing through the
     dissolving texture in that gap. */
  plate.img.style.opacity = "0";

  gsap.to(plate.program.uniforms.uBloom, {
    value: 1,
    duration: BLOOM_MS / 1000,
    ease: "power2.in",
    onUpdate: () => {
      plate.dirty = true;
    },
    onComplete: () => dispose(plate),
  });
  /* Nothing owns this canvas any more, so it cannot rely on an unmount to
     collect it. If the tween is killed - a second navigation on top of this
     one, a reduced-motion flip - the deadline still frees the context. */
  plate.guard = setTimeout(() => dispose(plate), BLOOM_MS + 900);
  startTicker();
}

/* Grid unmount, and the grid's own pointerleave. Orphans are deliberately
   left alone: they are mid-bloom over a page that has already changed, and
   each one is on its own deadline. */
export function sleepAll() {
  [...live.keys()].forEach((tile) => teardown(tile));
}

import gsap from "gsap";

/* --------------------------------------------------------------------------
   Work tile plates, on the GPU
   --------------------------------------------------------------------------
   A WebGL canvas laid over the art inside a work tile's plate, drawing the
   same pixels through a shader that can refract them around the pointer and
   blow them out on the way to a project page.

   src/plateFX.js is the door. It answers the cheap questions - fine pointer,
   motion allowed, WebGL available - and only then imports this file, which is
   why GSAP is not in the entry bundle.

   ---- which tiles ---------------------------------------------------------

   All five that have art. Four carry a sprite animation and one carries a
   captured screenshot; the other four tiles in the grid are typographic and
   have no plate to draw.

   An earlier build of this file shaded the screenshot and left the four
   sprites as DOM, on two stated grounds: that the frame index lives only in
   generated CSS, and that the largest sheet is 4160px against a 4096 texture
   limit. Neither survives contact:

   1. The frame index does not have to be re-derived. The DOM animation IS the
      clock - fig.getAnimations()[0].currentTime is the same number the
      browser is stepping background-position with - and the grid is
      background-size, a percentage pair the same generated file writes. Both
      are read off computed style, so a re-capture with a different grid
      cannot desync this from scripts/build_demo_sprite.py, and nothing here
      changes when one happens.

      That only works because the DOM figure is FADED rather than hidden.
      opacity keeps a CSS animation running; display:none or visibility:hidden
      stop it, and stopping it stops the clock this reads.

   2. The sheet is downscaled before it is uploaded, in createImageBitmap, off
      the main thread. See the sizing note above sheetScale().

   ---- what the visitor gets ----------------------------------------------

   At rest: nothing. No canvas exists, no WebGL context is created, and
   neither this module nor ogl has been fetched. The tile is the DOM tile.

   On pointer: the modules are imported, a context is created for that plate,
   and the canvas fades up drawing the same picture - the fade is there to
   hide any colour-management difference between the two, not to be seen. A
   refraction lens then follows the pointer.

   On click: the texture magnifies out of the plate and dissolves, handing the
   screen to the route shutter. (A tile click that runs the View Transitions
   plate morph instead does not bloom - see src/WorkGrid.jsx.)

   The DOM art underneath is never removed, only faded. It is the fallback for
   context loss, for a failed import and for every gate, and it means the
   worst case is the grid exactly as it was.
   -------------------------------------------------------------------------- */

/* One import promise for the whole grid, started on the first pointer that
   reaches a plate. The site already gates 0.5-3MB sprite sheets behind a
   hover for the same reason. */
let oglPromise = null;
function loadOGL() {
  if (!oglPromise) oglPromise = import("./ogl-plate.js");
  return oglPromise;
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

   uFit reproduces object-fit: contain. Both sources are contained in their
   plate - the screenshot by object-fit, the sprite by background-size:
   contain on a square cell in a square plate - so a full-plate quad that
   simply stretched the texture would be visibly wider than the DOM it
   replaces, which breaks the one rule this feature has: a visitor who never
   interacts sees no difference. Outside the fitted box the fragment is fully
   transparent and the tile's own ground shows through, exactly as the
   letterbox does now.

   uCell and uCellOffset are the sprite grid. For the screenshot and for a
   poster they are (1,1) and (0,0), so a single image is the degenerate case
   of a one-cell sheet and there is one sampling path rather than two.

   uInset is half a texel, in cell units. Without it LINEAR filtering at a
   cell edge reaches into the neighbouring frame, which on a 13x13 sheet is a
   visible sliver of the wrong moment along two sides of every frame.

   uPlate is (aspect, 1) and is applied to the distance and then removed from
   the push, so the lens is a circle on a 16:10 plate rather than an ellipse.

   The displacement is a gaussian lens with one ring around it, and it does
   not move on its own: there is no time uniform anywhere in this file. What
   the eye reads as a ripple following the pointer is the lens itself moving,
   and it trails the pointer because uMouse is tweened rather than assigned.
   A sprite plate does redraw while its sprite is playing, because the frame
   index changed - that is the DOM animation's cadence, not a loop of ours,
   and it stops when the sprite's single run ends. */
const FRAG = `
precision mediump float;

uniform sampler2D tMap;
uniform vec2 uPlate;
uniform vec2 uFit;
uniform vec2 uCell;
uniform vec2 uCellOffset;
uniform vec2 uInset;
uniform vec2 uMouse;
uniform float uHover;
uniform float uBloom;
uniform float uBias;

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

  vec2 st = uCellOffset + clamp(t, uInset, 1.0 - uInset) * uCell;

  /* A negative LOD bias, on the single-image path only. That plate is a heavy
     minification of a captured screenshot, so trilinear lands part-way up the
     mip chain and reads softer than the browser's own downscale of the same
     <img>. Biasing toward the sharper mip closes most of that gap; going
     further starts to alias on the fine UI text these captures are full of.
     A sheet has no mip chain at all - see makeSheetTexture - so uBias is 0
     there and this call is an ordinary lookup. */
  vec4 tex = texture2D(tMap, st, uBias);
  gl_FragColor = vec4(tex.rgb + uBloom * 0.3, tex.a * (1.0 - uBloom));
}
`;

/* --------------------------------------------------------------------------
   Sheet sizing
   --------------------------------------------------------------------------
   The sheets are 17 to 66 megapixels: 8x8 of 520px, 9x9 of 540px, and
   prosthetic-function's 13x13 of 380px, which is 4940 square and 97MB of RGBA
   once it is resident on the GPU. Uploading one at native size for a plate
   about 366 CSS px across is absurd, and on a lot of hardware it simply will
   not upload - MAX_TEXTURE_SIZE is still 4096 in plenty of places.

   So the sheet is resized in createImageBitmap, off the main thread, and the
   target is computed rather than fixed:

       target = min( native, driver's MAX_TEXTURE_SIZE, CEILING,
                     cells-across x the plate's size in DEVICE pixels )

   The last term is the one that matters and it is the thing this had to get
   right. A flat 2048 cap gives a 9x9 sheet 227px cells. On a 366px plate at
   devicePixelRatio 2 the plate is 732 device pixels, so 227 is barely a third
   of native resolution and the sprite is visibly soft against the DOM figure
   beside it - measured, at dpr 2, and that measurement is the reason this is
   not a constant.

   Scaling to the plate asks for 9 x 732 = 6588, which the ceiling then cuts
   to 4096: 455px cells against a native 540, or 84% - close enough that the
   handover between the DOM figure and the shader does not read as a change of
   sharpness. The 7x7 sheet is 3780 native and is not resized at all.

   CEILING is a memory decision, not a capability one. 4096 square is 67MB of
   RGBA, and because a context is handed back on pointerleave only one plate
   ever holds one. Raising it to 4940 to reach native on the largest sheet
   would buy 17% more linear resolution for 45% more VRAM. */
const SHEET_CEILING = 4096;

function sheetScale(gl, img, cols, rows, cellDevicePx) {
  const driver = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 2048;
  const limit = Math.min(driver, SHEET_CEILING);
  const native = Math.max(img.width || 1, img.height || 1);
  const need = Math.max(cols, rows) * cellDevicePx;
  const target = Math.min(native, limit, Math.max(1, Math.ceil(need)));
  return target / native;
}

/* The sheet images, kept alive by URL. Not the resized bitmaps, which are
   closed the moment they are uploaded: a 4096 square bitmap is another 67MB
   held on the CPU for a picture the GPU already has. Keeping the <img> costs
   nothing extra - the CSS background is the same resource and the browser is
   holding it anyway - and it means a second hover re-resizes a decoded image
   rather than decoding a 66 megapixel webp again. */
const sheetImages = new Map();

function sheetImage(url) {
  let img = sheetImages.get(url);
  if (img) return img;
  img = new Image();
  img.decoding = "async";
  img.src = url;
  sheetImages.set(url, img);
  return img;
}

/* Grid and sheet URL, off the generated demo CSS through computed style at
   the moment .is-playing lands. Parsing the computed background is what keeps
   this in step with a re-capture: build_demo_sprite.py rewrites
   background-size and the keyframes together, and background-size IS the
   grid. */
function readSheet(fig) {
  const cs = getComputedStyle(fig);
  const url = cs.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
  const size = cs.backgroundSize.match(/([\d.]+)%\s+([\d.]+)%/);
  if (!url || !size) return null;
  const cols = Math.round(parseFloat(size[1]) / 100);
  const rows = Math.round(parseFloat(size[2]) / 100);
  if (!(cols > 1) || !(rows > 1)) return null;
  return { url: url[1], cols, rows };
}

/* --------------------------------------------------------------------------
   Textures
   -------------------------------------------------------------------------- */

/* A single image - the screenshot, or a demo's poster.

   Mipmaps and anisotropy are not polish here. A tile plate is about 366px
   wide and a captured application screenshot is several times that, so
   drawing it is a heavy minification; a single bilinear tap at that ratio
   aliases badly. OGL turns mipmaps off and falls back to LINEAR by itself on
   WebGL1 with a non-power-of-two image, so this is safe rather than
   conditional, and anisotropy is clamped to the driver's maximum inside
   OGL. */
function makeImageTexture(Texture, gl, image) {
  return new Texture(gl, {
    image,
    generateMipmaps: true,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
    magFilter: gl.LINEAR,
    anisotropy: 8,
  });
}

/* A sprite sheet.

   No mipmaps, and this one is not a tradeoff: a mip chain averages across
   cell boundaries, so every level above the base blends each frame into the
   next one along and the one below. The half-texel inset in the shader deals
   with the base level's own edge bleed.

   flipY is false because the bitmap is already flipped. UNPACK_FLIP_Y_WEBGL,
   which is how OGL flips everything else, is specified not to apply to an
   ImageBitmap source - the bitmap's own imageOrientation is what counts, so
   the flip is asked for in createImageBitmap and turned off here. Getting
   this wrong is silent: the sheet uploads fine and every frame comes out of
   the wrong row. */
function makeSheetTexture(Texture, gl, bitmap) {
  return new Texture(gl, {
    image: bitmap,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    flipY: false,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
  });
}

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

/* --------------------------------------------------------------------------
   The sprite clock
   --------------------------------------------------------------------------
   The DOM figure's own animation, read every tick while a plate is live. Not
   a timer of ours, and deliberately not a copy of the keyframe timings: this
   is the same currentTime the browser is stepping background-position with,
   so the two cannot drift and a handover in either direction lands on the
   same frame.

   The figure element is re-queried every tick because WorkGrid remounts it
   (key={runs}) to restart the animation - the element this had a reference to
   a moment ago is gone, and the new one has a new animation starting at 0. */
function advance(plate) {
  if (plate.kind !== "sprite") return;

  /* A sheet that will not upload means this plate can never show the sprite,
     only its poster - and the poster is a still of a demo the visitor is
     watching play. Holding it while the DOM figure is faded underneath is
     worse than not being here at all, so the plate gives the tile back. The
     first build left the canvas up and a demo that could not upload froze on
     frame one, with the real animation running invisibly beneath it. */
  if (plate.sheet.state === "unavailable") {
    plate.giveUp = true;
    return;
  }

  const fig = plate.el.querySelector(".tile-figure");
  const anim = fig ? fig.getAnimations()[0] : null;

  /* The DOM figure is FADED, never hidden: opacity leaves the CSS animation
     running and that animation is the clock above. display:none and
     visibility:hidden both stop it, and a stopped clock is a frozen sprite.

     Its alpha is the complement of the canvas's, so the two are a crossfade
     and never a gap. Writing "0" the moment the canvas starts fading up left
     an empty plate for the whole 200ms of that fade - the canvas was still at
     0.05 when the figure was already gone.

     Re-applied against whichever element is there, because WorkGrid remounts
     the figure to restart the animation and the new one arrives at alpha 1. */
  if (fig !== plate.fig) {
    if (plate.fig && plate.fig.isConnected) plate.fig.style.removeProperty("opacity");
    plate.fig = fig;
  }
  if (fig) {
    const cover = plate.revealed ? Number(plate.canvas.style.opacity || "0") : 0;
    const want = cover >= 0.999 ? "0" : String(Number((1 - cover).toFixed(3)));
    if (fig.style.opacity !== want) fig.style.opacity = want;
  }

  /* The sheet upload starts the first time the DOM animation exists, so a
     sheet is only ever uploaded for a demo that actually ran. */
  if (anim && plate.sheet.state === "idle") {
    markSheet(plate, "loading");
    const spec = fig ? readSheet(fig) : null;
    if (!spec || typeof createImageBitmap !== "function") {
      /* No resizing createImageBitmap means no shader on this tile. The DOM
         sprite is playing underneath and stays that way. */
      markSheet(plate, "unavailable");
    } else {
      loadSheet(plate, spec);
    }
  }

  if (!anim || plate.sheet.state !== "ready") return;

  const sheet = plate.sheet;
  const frames = sheet.cols * sheet.rows;
  const total = anim.effect && anim.effect.getTiming ? anim.effect.getTiming().duration : 0;
  if (!total) return;
  const at = Number(anim.currentTime) || 0;
  /* frames - 1, not frames. build_demo_sprite.py writes one keyframe per
     frame with the FIRST at 0% and the LAST at 100%, so the steps are
     1/(n-1) of the duration apart, and steps(1) holds each one until the
     next. Dividing by n instead drifts a frame ahead through the middle of
     every run - small enough to look like nothing and large enough that a
     paused comparison against the DOM never quite lines up. Read off the
     generated keyframes: 169 frames, second keyframe at 0.5952% = 1/168. */
  const span = Math.max(1, frames - 1);
  const i = Math.min(frames - 1, Math.max(0, Math.floor((at / total) * span)));
  if (i === plate.frame && plate.source === "sheet") return;

  plate.frame = i;
  setSource(plate, "sheet");
  const col = i % sheet.cols;
  const row = Math.floor(i / sheet.cols);
  /* Texture V runs bottom-up and the sheet is laid out top-down. */
  plate.program.uniforms.uCellOffset.value = [col / sheet.cols, 1 - (row + 1) / sheet.rows];
  plate.dirty = true;
}

function loadSheet(plate, spec) {
  const img = sheetImage(spec.url);
  const box = plate.el.getBoundingClientRect();
  const cellDevicePx = Math.max(1, Math.round(box.width * (plate.renderer.dpr || 1)));

  const ready = img.complete && img.naturalWidth ? Promise.resolve() : img.decode();

  ready
    .then(() => {
      if (plate.dead) throw new Error("gone");
      const scale = sheetScale(plate.renderer.gl, img, spec.cols, spec.rows, cellDevicePx);
      return createImageBitmap(img, {
        resizeWidth: Math.max(1, Math.round(img.width * scale)),
        resizeHeight: Math.max(1, Math.round(img.height * scale)),
        resizeQuality: "high",
        /* See makeSheetTexture: the flip has to happen here, not in GL. */
        imageOrientation: "flipY",
        premultiplyAlpha: "none",
      });
    })
    .then((bitmap) => {
      if (plate.dead) {
        bitmap.close();
        return;
      }
      plate.sheet.tex = makeSheetTexture(plate.Texture, plate.renderer.gl, bitmap);
      plate.sheet.cols = spec.cols;
      plate.sheet.rows = spec.rows;
      plate.sheet.cellW = bitmap.width / spec.cols;
      plate.sheet.cellH = bitmap.height / spec.rows;
      plate.sheet.aspect = plate.sheet.cellW / plate.sheet.cellH;
      markSheet(plate, "ready");
      /* Closed after the first draw has uploaded it - see draw(). */
      plate.pendingClose = bitmap;
      plate.dirty = true;
      reveal(plate);
      startTicker();
    })
    .catch(() => {
      /* A sheet that will not decode, resize or upload is not an error worth
         showing: the DOM sprite is still playing underneath it. */
      if (!plate.dead) markSheet(plate, "unavailable");
    });
}

/* --------------------------------------------------------------------------
   Source, fit and draw
   -------------------------------------------------------------------------- */

/* The sheet's progress, on the plate element. A state flag CSS could read,
   in the same spirit as data-scrub and .is-playing, and the only way to tell
   from outside whether a plate is drawing the sheet or still holding the
   poster - which is a distinction two screenshots cannot make on a demo whose
   first second barely moves. */
function markSheet(plate, state) {
  plate.sheet.state = state;
  if (plate.el && plate.el.isConnected) plate.el.dataset.glSheet = state;
}

function setSource(plate, which) {
  if (plate.source === which) return;
  const u = plate.program.uniforms;
  if (which === "sheet") {
    u.tMap.value = plate.sheet.tex;
    u.uCell.value = [1 / plate.sheet.cols, 1 / plate.sheet.rows];
    u.uInset.value = [
      0.5 / Math.max(1, plate.sheet.cellW),
      0.5 / Math.max(1, plate.sheet.cellH),
    ];
    u.uBias.value = 0;
    plate.srcAspect = plate.sheet.aspect;
  } else {
    u.tMap.value = plate.still.tex;
    u.uCell.value = [1, 1];
    u.uCellOffset.value = [0, 0];
    u.uInset.value = [0, 0];
    u.uBias.value = -0.4;
    plate.srcAspect = plate.still.aspect;
  }
  plate.source = which;
  applyFit(plate);
  plate.dirty = true;
}

function applyFit(plate) {
  const pa = plate.boxAspect || 1;
  const sa = plate.srcAspect || 1;
  plate.program.uniforms.uPlate.value = [pa, 1];
  plate.program.uniforms.uFit.value = sa > pa ? [1, pa / sa] : [sa / pa, 1];
}

function fit(plate) {
  const box = plate.el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  plate.boxAspect = box.width / box.height;
  /* Snapped DOWN to a whole device pixel, not passed through raw.
     Renderer.setSize writes box.width straight into canvas.width, which is an
     unsigned long and truncates, and then writes the untruncated number into
     canvas.style.width - so a 364.76px plate got a 364px buffer stretched
     back over 364.76px. A 0.2% resample is invisible on a flat area and
     obvious on the hard edges of a CAD render, and it was most of the
     measured difference between this plate and the DOM one. Snapping costs
     at most one device pixel of canvas at the right and bottom edges, over a
     plate whose own ground is what shows there. */
  const dpr = plate.renderer.dpr || 1;
  plate.renderer.setSize(
    Math.floor(box.width * dpr) / dpr,
    Math.floor(box.height * dpr) / dpr
  );
  applyFit(plate);
  plate.dirty = true;
  startTicker();
}

function draw(plate) {
  if (plate.dead) return true;
  if (plate.dirty) {
    plate.dirty = false;
    plate.renderer.render({ scene: plate.mesh });
    /* The resized bitmap has been uploaded by now; the GPU has the only copy
       that matters and holding a second one on the CPU is 67MB for nothing. */
    if (plate.pendingClose) {
      plate.pendingClose.close();
      plate.pendingClose = null;
    }
  }
  return false;
}

function frame() {
  let busy = false;
  let quitters = null;
  live.forEach((plate, tile) => {
    advance(plate);
    if (plate.giveUp) {
      (quitters || (quitters = [])).push(tile);
      return;
    }
    busy = !draw(plate) || busy;
  });
  /* Collected rather than torn down inside the walk: teardown deletes from
     the same map this is iterating. */
  if (quitters) quitters.forEach((tile) => teardown(tile));
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

/* --------------------------------------------------------------------------
   Build
   -------------------------------------------------------------------------- */

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.addEventListener("load", () => resolve(img), { once: true });
    img.addEventListener("error", () => resolve(null), { once: true });
    img.src = src;
  });
}

async function build(tile, poster) {
  const el = tile.querySelector(".tile-plate");
  if (!el) return null;

  const shot = el.querySelector(".tile-shot");
  const kind = shot ? "shot" : el.querySelector(".tile-figure") ? "sprite" : null;
  if (!kind) return null;

  /* A lazy image that has not arrived yet has no pixels to upload, and
     uploading it anyway gives a black plate. Wait for it; the DOM img is on
     screen the whole time. */
  if (shot && (!shot.complete || !shot.naturalWidth)) {
    await new Promise((resolve) => {
      shot.addEventListener("load", resolve, { once: true });
      shot.addEventListener("error", resolve, { once: true });
    });
  }
  if (shot && !shot.naturalWidth) return null;

  /* A demo tile's still is its poster. It can be absent - a tile whose sheet
     was already warm when it was first pointed at is playing before this runs
     and there is no poster on screen to read - and that is survivable: the
     canvas simply does not fade up until the sheet is ready. */
  let stillImage = shot;
  if (kind === "sprite") {
    stillImage = poster ? await loadImage(poster) : null;
  }

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

  const program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    transparent: true,
    depthTest: false,
    cullFace: false,
    uniforms: {
      tMap: { value: null },
      uPlate: { value: [1, 1] },
      uFit: { value: [1, 1] },
      uCell: { value: [1, 1] },
      uCellOffset: { value: [0, 0] },
      uInset: { value: [0, 0] },
      uMouse: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uBloom: { value: 0 },
      uBias: { value: 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const plate = {
    el,
    kind,
    img: shot,
    fig: null,
    canvas,
    renderer,
    program,
    mesh,
    Texture,
    still: null,
    /* The tween target for the lens. See aimPlate for why this is two scalars
       and not the uniform's own array. */
    mouse: { x: 0.5, y: 0.5 },
    sheet: { state: "idle", tex: null, cols: 1, rows: 1, cellW: 1, cellH: 1, aspect: 1 },
    source: null,
    srcAspect: 1,
    frame: -1,
    revealed: false,
    pendingClose: null,
    dirty: true,
    dead: false,
  };

  if (stillImage) {
    plate.still = {
      tex: makeImageTexture(Texture, gl, stillImage),
      aspect: (stillImage.naturalWidth || 1) / (stillImage.naturalHeight || 1),
    };
    setSource(plate, "still");
  }

  /* Context loss is not recoverable here and does not need to be: removing
     the canvas leaves the DOM art that was underneath it the whole time, so
     the grid is the DOM grid again rather than a row of blank squares.
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

/* The canvas only fades up once there is something on it. A sprite plate that
   was already playing when it was woken has no poster, so this is deferred to
   the sheet landing rather than run on build - otherwise the first thing a
   visitor sees is a black square where a sprite was. */
function reveal(plate) {
  if (plate.dead || plate.revealed || !plate.source) return;
  plate.revealed = true;
  gsap.to(plate.canvas, { opacity: 1, duration: 0.2, ease: "power1.out" });
}

function dispose(plate) {
  if (plate.dead) return;
  plate.dead = true;
  gsap.killTweensOf(plate.program.uniforms.uHover);
  gsap.killTweensOf(plate.program.uniforms.uBloom);
  gsap.killTweensOf(plate.mouse);
  gsap.killTweensOf(plate.canvas);
  if (plate.ro) plate.ro.disconnect();
  if (plate.guard) clearTimeout(plate.guard);
  if (plate.pendingClose) {
    plate.pendingClose.close();
    plate.pendingClose = null;
  }
  plate.canvas.remove();
  if (plate.img && plate.img.isConnected) plate.img.style.removeProperty("opacity");
  /* Every figure in the plate, not just the one this last saw: a remount
     between the fade and the teardown leaves an element nobody is holding. */
  if (plate.el && plate.el.isConnected) {
    plate.el
      .querySelectorAll(".tile-figure")
      .forEach((fig) => fig.style.removeProperty("opacity"));
    delete plate.el.dataset.glSheet;
  }
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

/* pointerenter, via src/plateFX.js. Returns nothing: everything after the
   await is best-effort, and a failure anywhere in it leaves the DOM tile
   alone. `poster` is read synchronously by the gate - see the note there. */
export function wakePlate(tile, clientX, clientY, poster) {
  if (!tile || live.has(tile) || tile.dataset.glPending === "1") return;

  tile.dataset.glPending = "1";
  build(tile, poster)
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
          plate.mouse.x = (clientX - box.left) / box.width;
          plate.mouse.y = 1 - (clientY - box.top) / box.height;
          plate.program.uniforms.uMouse.value = [plate.mouse.x, plate.mouse.y];
        }
      }
      reveal(plate);
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
   trail the cursor like something with mass instead of snapping to it.

   Two scalars on a plain object, NOT the uniform's own [x, y] array. Tweening
   the array directly is what the first build did and it silently did nothing:
   GSAP has no array interpolator, so it fell back to its complex-string
   tween, wrote "0.47,0.63" into uniform.value, and OGL handed that string to
   uniform2fv. Chrome answers GL_INVALID_OPERATION - "Only array uniforms may
   have count > 1" - and keeps the last good value, so the lens sat wherever
   the pointer entered and never moved again. Found by patching uniform2fv and
   logging what it was actually given; it is invisible in a screenshot because
   a lens that does not move still looks like a lens. */
export function aimPlate(tile, clientX, clientY) {
  const plate = live.get(tile);
  if (!plate || plate.dead) return;
  const box = plate.el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  gsap.to(plate.mouse, {
    x: (clientX - box.left) / box.width,
    y: 1 - (clientY - box.top) / box.height,
    duration: 0.45,
    ease: "power2.out",
    onUpdate: () => {
      plate.program.uniforms.uMouse.value = [plate.mouse.x, plate.mouse.y];
      plate.dirty = true;
    },
  });
  startTicker();
}

export function sleepPlate(tile) {
  const plate = live.get(tile);
  if (!plate || plate.dead || plate.leaving) return;
  plate.leaving = true;
  gsap.killTweensOf(plate.mouse);
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
    /* The DOM figure comes back up as this comes down - advance() holds it at
       the complement of this value on every tick, so the leave is a crossfade
       in the other direction and needs nothing of its own here. */
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
  gsap.killTweensOf(plate.mouse);
  gsap.killTweensOf(plate.program.uniforms.uHover);

  const canvas = plate.canvas;
  canvas.classList.add("tile-gl--free");
  canvas.style.left = `${box.left}px`;
  canvas.style.top = `${box.top}px`;
  canvas.style.opacity = "1";
  document.body.appendChild(canvas);
  /* The DOM art is still under the old tile for the moment or two before
     React removes it. Hiding it stops a crisp frame showing through the
     dissolving texture in that gap. The sprite's own clock stops here with
     the element, so the bloom holds whichever frame it was on. */
  if (plate.img) plate.img.style.opacity = "0";
  if (plate.fig && plate.fig.isConnected) plate.fig.style.opacity = "0";

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

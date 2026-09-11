/* --------------------------------------------------------------------------
   Route shutter
   --------------------------------------------------------------------------
   A machined aperture that closes over the page, lets the route swap behind
   it, and opens on the new one.

   ---- which navigations get this one --------------------------------------

   Every navigation EXCEPT a plain left click on a work tile, which gets the
   View Transitions plate morph instead - see src/router.jsx. The two are
   genuinely exclusive per navigation: startViewTransition snapshots the whole
   document, so a wipe drawn over one of its transitions is captured in the
   old snapshot and freezes there. But "exclusive per navigation" is not the
   same as "one or the other forever", which is what an earlier build
   concluded. A tile click has a source element to morph FROM; the masthead,
   the rail and a Back press do not, and a morph with nothing to morph from is
   a crossfade with extra steps.

   So: the morph where there is a named plate, the shutter everywhere else -
   including popstate, whose URL has already changed before the callback is
   reached, and every browser without startViewTransition, and every route
   that throws. Those three are exactly the cases a clip-path this code owns
   can cover honestly and a snapshot cannot: this one is finished
   unconditionally from a guarded call AND from a deadline, which is the whole
   of the "must not strand the page" requirement.

   Where the shutter runs after a tile click - because the browser has no
   View Transitions, say - the morph's intent is carried across in the one way
   a wipe can carry it: the aperture closes on the point that was clicked and
   opens on the figure of the page it arrived at.

   ---- no animation library -------------------------------------------------

   Two easing functions and one requestAnimationFrame loop. This used to run
   on GSAP, which meant the entire library sat in the entry chunk so that the
   FIRST navigation would not have to wait for a chunk - 45kB paid by every
   visitor for about 60 frames of arithmetic. The clip-path string has to be
   rebuilt in JS every frame whatever drives it, so a library was never buying
   interpolation here, only its own ticker.

   ---- the aperture --------------------------------------------------------

   One element, one polygon, one number tweened. The polygon traces the
   viewport rectangle clockwise and then a six-sided aperture anticlockwise,
   which under the default nonzero fill rule leaves the aperture unpainted -
   the classic hole-in-a-rectangle trace, and the reason this does not need
   polygon()'s evenodd fill rule, which is newer than the browsers this site
   still has to work in.

   Two of them, in fact: a rim behind the blade with an aperture three pixels
   smaller, so the blade's edge is drawn in accent for exactly those three
   pixels. Accent means interactive on this site and is not spent on
   decoration; a navigation is the result of an interaction, and this is the
   tell that says so rather than a glow.

   The blades also rotate a sixth of a turn while they close. That, and the
   straight edges, are what make it read as a machined aperture rather than a
   circle shrinking.
   -------------------------------------------------------------------------- */

const BLADES = 6;
/* A hexagon's inradius is cos(pi/6) of its circumradius, so an aperture that
   must clear the far corner of the viewport needs a radius that much larger
   or the blades leave triangles of page showing at the corners. */
const COVER = 1 / Math.cos(Math.PI / BLADES);
const RIM_PX = 3;

/* The budget. 170 + 30 + 200 = 400ms, the top of the brief's range, and the
   30 exists so React has a frame to commit the new route while the aperture
   is shut. */
const CLOSE_MS = 170;
const SEAM_MS = 30;
const OPEN_MS = 200;
/* Nothing may leave the page behind a closed shutter. If the route throws, if
   a tween is killed, if a second navigation lands on top of this one, this
   fires and the overlay goes away whatever state it was in. */
const DEADLINE_MS = CLOSE_MS + SEAM_MS + OPEN_MS + 600;

let root = null;
let rim = null;
let blade = null;
let deadline = 0;
let running = null;

/* Where the aperture should close. Set by whatever was clicked - the work
   grid sets it to the tile - and consumed once. A navigation from the
   masthead or the rail sets nothing and closes on the middle of the screen,
   which is the honest answer for a link that has no position on the page it
   is leaving. */
let aim = null;

export function aimShutter(clientX, clientY) {
  aim = { x: clientX, y: clientY };
}

function build() {
  if (root) return;
  root = document.createElement("div");
  root.className = "shutter";
  root.setAttribute("aria-hidden", "true");
  rim = document.createElement("div");
  rim.className = "shutter-rim";
  blade = document.createElement("div");
  blade.className = "shutter-blade";
  root.append(rim, blade);
  document.body.appendChild(root);
}

/* Radius that covers the whole viewport from (cx, cy). */
function coverRadius(cx, cy) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dx = Math.max(cx, w - cx);
  const dy = Math.max(cy, h - cy);
  return Math.hypot(dx, dy) * COVER;
}

function polygon(cx, cy, r, spin) {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  /* The viewport, clockwise in CSS coordinates, returning to its start. */
  const parts = ["0% 0%", "100% 0%", "100% 100%", "0% 100%", "0% 0%"];
  /* The aperture, anticlockwise, so the winding cancels inside it. Counting
     down from BLADES means the first and last points coincide, which closes
     the inner ring before the implicit close retraces the seam. */
  for (let i = BLADES; i >= 0; i -= 1) {
    const a = spin + (i / BLADES) * Math.PI * 2;
    const x = ((cx + Math.cos(a) * r) / w) * 100;
    const y = ((cy + Math.sin(a) * r) / h) * 100;
    parts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${parts.join(", ")})`;
}

function paint(state) {
  blade.style.clipPath = polygon(state.cx, state.cy, state.r, state.spin);
  rim.style.clipPath = polygon(state.cx, state.cy, Math.max(0, state.r - RIM_PX), state.spin);
}

/* GSAP's power2 is cubic. Kept cubic so the close still bites late and the
   open still lands soft, which is what makes it read as a mechanism rather
   than a fade. */
const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t);

function finish() {
  if (deadline) {
    clearTimeout(deadline);
    deadline = 0;
  }
  if (running) {
    running.cancelled = true;
    cancelAnimationFrame(running.raf);
    running = null;
  }
  if (root) root.classList.remove("is-live");
}

export function shutterSupported() {
  return typeof CSS !== "undefined" && CSS.supports && CSS.supports("clip-path", "polygon(0% 0%)");
}

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* apply() is the route swap. It runs exactly once, behind the closed
   aperture, and its failure is contained: the shutter opens either way, on a
   page that did not change rather than on no page at all.

   focus() is an optional second callback run at the same seam, after the swap
   has been committed, returning the point the aperture should open on. It is
   how the project figure takes over from the tile that was clicked. */
function safeApply(apply) {
  try {
    apply();
  } catch (error) {
    /* Reported, not swallowed silently, and never rethrown. In the animated
       path a throw here would abort the timeline and leave the page behind a
       shut aperture; in the instant path it would escape into a React event
       handler and can take the tree down with it. Either way the visitor is
       better off on the page they were already on. */
    console.error("Route change failed", error);
  }
}

export function runShutter(apply, focus) {
  if (reducedMotion() || !shutterSupported()) {
    aim = null;
    safeApply(apply);
    return;
  }

  build();

  /* A second navigation while one is running - a fast double click, a Back
     pressed during the open - kills the first outright rather than queueing
     it. Queueing would leave the page shut for two full cycles. Its swap has
     already happened or is about to be forced by the line below, so nothing
     is lost by cutting its animation short. */
  if (running) {
    running.commit();
    finish();
  }

  const cx = aim ? aim.x : window.innerWidth / 2;
  const cy = aim ? aim.y : window.innerHeight / 2;
  aim = null;

  const state = { cx, cy, r: coverRadius(cx, cy), spin: 0 };
  const startR = state.r;
  const shut = Math.PI / BLADES;
  let openR = startR;

  paint(state);
  root.classList.add("is-live");

  const run = { cancelled: false, raf: 0, commit: null };
  running = run;

  /* The swap, exactly once, wherever it is called from: the close finishing,
     the deadline firing on a tab that was never painted, or a second
     navigation landing on top of this one. An aperture that shuts and never
     swaps is the one failure this feature is not allowed to have. */
  let swapped = false;
  run.commit = () => {
    if (swapped) return;
    swapped = true;
    safeApply(apply);
    let next = null;
    try {
      next = focus ? focus() : null;
    } catch {
      next = null;
    }
    state.cx = next ? next.x : window.innerWidth / 2;
    state.cy = next ? next.y : window.innerHeight / 2;
    openR = coverRadius(state.cx, state.cy);
  };

  /* Nothing may leave the page behind a closed shutter. A background tab does
     not paint, so its rAF does not advance - but setTimeout still fires, and
     this is what makes the navigation happen anyway. */
  deadline = setTimeout(() => {
    run.commit();
    finish();
  }, DEADLINE_MS);

  const step = (now) => {
    if (run.cancelled) return;
    if (!run.started) run.started = now;
    const t = now - run.started;

    if (t < CLOSE_MS) {
      const p = easeIn(t / CLOSE_MS);
      state.r = startR * (1 - p);
      state.spin = shut * p;
      paint(state);
    } else if (!swapped) {
      /* Shut, and painted shut before the swap rather than after it: the new
         route must never be visible through an aperture that has not closed
         yet. */
      state.r = 0;
      state.spin = shut;
      paint(state);
      run.commit();
    } else if (t < CLOSE_MS + SEAM_MS) {
      /* The hold is the frame React needs to commit, and it is also what lets
         the aperture move to its new centre while it is shut rather than
         visibly jumping. */
    } else if (t < CLOSE_MS + SEAM_MS + OPEN_MS) {
      const p = easeOut((t - CLOSE_MS - SEAM_MS) / OPEN_MS);
      state.r = openR * p;
      state.spin = shut * (1 - p);
      paint(state);
    } else {
      state.r = openR;
      state.spin = 0;
      paint(state);
      finish();
      return;
    }
    run.raf = requestAnimationFrame(step);
  };
  run.raf = requestAnimationFrame(step);
}

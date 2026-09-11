# Experimental motion brief — GSAP + ScrollTrigger + OGL

Branch: `worktree-agent-ae4eea6a203eb8ee3`
Base: `6c6a23d` (the nav-experiments work: rail depth gauge, nav label swap,
tile tilt, View Transitions route morph)

| Feature | Commit |
| --- | --- |
| 1 — Skills as a card stack | `b2be964` |
| 2 — Work grid as GPU texture | `d8173ce` |
| 3 — Route transition layer | `0e85d26` |

Everything below that is stated as measured was measured in Chrome, driven by
Playwright, at 1440×900. The "what I could not verify" sections are not
boilerplate; read them.

---

## Before the features: the base I actually started from

The worktree was created at `62c0189`, which does **not** contain the
navigation-depth work the task describes — no `src/grid-depth.css`, no
`docs/superpowers/specs/2026-09-10-navigation-depth-design.md`, no View
Transitions morph in `src/router.jsx`. `62c0189` is a strict ancestor of
`6c6a23d`, so the first thing I did was fast-forward onto `6c6a23d`, which is
the base the task describes and the one Feature 3 has to replace something on.

Worth flagging because the other stack's worktree is also sitting at
`62c0189`. If it was not fast-forwarded, the two branches are not being
compared from the same starting point.

---

## Bundle size

Shipping build, `npm run build`:

| | raw | gzip |
| --- | --- | --- |
| `index.css` | 94.36 kB | **15.14 kB** |
| `index.js` (initial) | 351.57 kB | **124.00 kB** |
| `ogl-plate.js` (lazy chunk) | 49.43 kB | **14.09 kB** |

Baseline at `6c6a23d` was 225.00 kB / **73.51 kB** gzipped JS and 94.19 kB /
14.94 kB gzipped CSS.

### The dependency number, isolated

The brief asked for the actual figure, so I built once more with the vendors
split into their own chunks (measurement config only, not committed to
`vite.config.js`):

| | raw | gzip | when it loads |
| --- | --- | --- | --- |
| `gsap` core + `ScrollTrigger` | 114.85 kB | **45.47 kB** | always, initial bundle |
| `ogl` (5 modules) | 49.41 kB | **14.08 kB** | first pointer over an image tile |
| my own new app code | — | ~4.6 kB | always |

**Total new dependency: 59.55 kB gzipped, against a budget of ~40 kB. Over by
roughly 50%.** GSAP alone is over the budget before OGL is considered.

I did not hide this behind a dynamic import, although I could have — the deck
only runs on a roomy desktop with motion enabled, so GSAP could have been a
lazy chunk too and the initial bundle would have read 78 kB. That would have
flattered the number without changing what the stack costs, and it would have
made the comparison with the other branch dishonest. GSAP is the stack under
test; it is in the initial bundle and the number is what it is.

OGL is lazy because the brief required it ("Do not load the WebGL payload
until it is needed"), and that is verified rather than asserted: under reduced
motion and on a coarse pointer, `performance.getEntriesByType("resource")`
contains no request matching `ogl`.

One real saving is worth recording. Importing from `"ogl"` produces a 39.38 kB
gzipped chunk even though the package declares `sideEffects: false`; importing
the five modules from their own paths (`src/ogl-plate.js`) produces 14.08 kB.
The package index drags in transitive dependencies that tree-shaking does not
remove.

---

## Feature 1 — Skills as a card stack

`src/Skills.jsx`, `src/deck.css`, section 9 of `src/spa.css`, `src/App.jsx`.

### What I built

Eight `<details>` accordions become eight full-viewport cards in a pinned
stage. As the reader scrolls the front card lifts, rotates back and recedes to
`z: -520`; the next rises from `yPercent: 11, z: -260` into its place.
Painting order inside the `preserve-3d` stage follows `z`, so the deck stacks
correctly without a single `z-index`.

The hard constraint is solved by a named constant and nothing else:

```js
export const DECK_SCROLL_VH = 5;
```

It sets the ScrollTrigger `end` (`+=${DECK_SCROLL_VH * window.innerHeight}`),
and through the pin spacer it sets the section's height and the spacing of the
scroll marks. One number, one place. The version this replaces failed because
its scroll cost fell out of the layout and nobody ever wrote it down.

### The part that took the longest: the rail

A pinned panel has no scroll position of its own. All eight occupy the same
box, so `#skill-<id>` on a panel scrolls every skill to the same place, and
`App.jsx`'s stage observer — a 1% band across the middle of the viewport —
sees all eight cross it at once and marks an arbitrary one.

So `id` and `data-stage-id` move to eight zero-width marks that tile the pin
track, one per card, positioned by CSS from three numbers JS writes onto
`.deck`. Each mark also carries a `scroll-margin-top` that re-aims a rail jump
to the middle of the stationary part of its unit. The arithmetic is derived in
the comment at the top of the mark rules in `src/deck.css`.

The marks deliberately lead the timeline's unit boundaries by `--mark-lead`.
The first build marked the unit boundaries, and the rail said `03` with card
`04` filling the screen — the card a reader is *looking at* changes when the
incoming one becomes opaque (t = i + 0.63), not when its unit ends.

### Measured

- Section height **6.000 viewport heights** — one for the stage, five for the
  pin. Constraint was ≤ 5 for the eight panels; the pin is exactly 5, and the
  travel from card 1 front to card 8 front is 4.375.
- Whole-page height went from 24 viewports (the deleted pinned version, per
  the note in `spa.css`) to **11.54**.
- **8 of 8** rail jumps land on their own card at opacity 1.00, with the rail
  marking the matching skill.
- A **41-sample sweep** of the entire pin found **0** disagreements between
  the dominant card and the rail's mark.
- No horizontal overflow (`scrollWidth - clientWidth = -15`, i.e. the
  scrollbar).
- Reduced motion: `data-deck` is never set, no marks are rendered, no timeline
  is built, all 8 panels report opacity 1, and the rail still jumps correctly
  to all 8. Page height 11.33 viewports — within 2% of the animated version.
- After 3 home → project → back round trips: exactly 1 pin spacer on home,
  0 on a project page, and all 8 rail jumps still correct. No leak.

### Two things the first build got wrong

**Transparent cards.** A handover put two full ledes on top of each other at
opacity 0.51 and 0.74 — genuinely unreadable for about a third of a viewport
of scroll. The cards are now opaque `--surface` plates, and the fade is not a
crossfade: the incoming card reaches full alpha in the first 32% of the
handover and *covers* the outgoing one, which only then fades, behind it.

**Mode decided in an effect.** It is decided at first render from
`matchMedia`, because `App.jsx`'s observer queries `[data-stage-id]` once on
mount and would otherwise latch onto nodes about to be replaced. I also had to
subscribe to `resize` as well as the media query's `change` event: DevTools
device emulation updates `matchMedia().matches` without always dispatching
`change`, which left the deck in flow mode on a window that had grown.

### What I could not verify

- **Any browser other than Chrome.** ScrollTrigger's pin uses
  `position: fixed` here; Safari's handling of a fixed pin inside a spacer is
  the classic source of jitter and I have not seen it run there.
- **Touch.** The deck is gated to `(min-width: 78rem) and (min-height: 34rem)`
  — the breakpoint where the index rail becomes a fixed left column rather
  than a sticky top bar a 100vh pinned stage would sit under. Every phone and
  most tablets therefore get the flow stack. That is a defensible call for a
  full-viewport deck, but it does mean the feature does not exist on mobile.
- **High-refresh displays.** The scrub smoothing (`scrub: 0.3`) was tuned at
  60 Hz.
- **Screen readers.** Seven of eight cards are `visibility: hidden` via GSAP's
  `autoAlpha` while the deck runs, so they are out of the accessibility tree
  and out of find-in-page. That is consistent with them being invisible, but I
  have not put a screen reader on it, and it is a real regression against the
  `<details>` version where all eight headings were always findable.

### What I would do differently

Give each card a dwell proportional to its content rather than a flat 45% of a
unit — skill 01 has ten more words of lede than skill 07 and gets the same
reading time. And 0.625 viewports per panel is genuinely tight; the constraint
is met, but a reader who wants to *read* all eight is better served by the
reduced-motion stack, which is an uncomfortable thing to be true of the
fallback.

---

## Feature 2 — Work grid as GPU texture

`src/tileGL.js`, `src/ogl-plate.js`, `src/tile-gl.css`, `src/WorkGrid.jsx`.

### The finding that matters most

**Of nine tiles, exactly one carries an `<img>`.** Four carry sprite
animations, four are typographic. The brief's premise ("five carry a square
plate holding either a sprite animation or a screenshot") is accurate, but the
split is 4 sprites to 1 screenshot, not an even mix — `indexShot()` in
`siteData.js` prefers a demo sprite whenever a project has one, and both
projects with a scroll figure also have demos.

So the WebGL path covers **one tile**. That is not a bug in what I built; it is
what the data says, and the owner should know it before deciding this feature
is worth keeping.

### The sprite fallback, and why

I took the fallback the brief permits: image plates get WebGL, sprite plates
stay DOM. Two independent reasons, either sufficient:

1. A demo plate is animated by generated CSS — `scripts/build_demo_sprite.py`
   writes the grid, the poster and the `steps()` keyframes. Driving it as a
   texture means re-deriving the frame index in JS from numbers that exist
   only in that generated CSS, and keeping the two in step through every
   future regeneration.
2. The largest sheet is 4160 px on a side. `MAX_TEXTURE_SIZE` is still 4096 on
   a lot of hardware. It would not upload.

### What I built

A canvas over the `<img>`, inside `.tile-plate`, drawing the same image
through a shader that reproduces `object-fit: contain` in UV space (so the
letterbox stays transparent and the tile's own ground shows through, exactly
as now), applies a gaussian refraction lens plus one ring around the pointer,
and on click magnifies and dissolves the texture.

There is **no time uniform anywhere in the shader**. What reads as a ripple
following the pointer is the lens moving, and it trails because `uMouse` is
GSAP-tweened rather than assigned. The renderer draws only on a dirty flag, so
a still pointer costs nothing.

### Measured

- Canvas CSS size 365.688 × 228.438 against a plate box of 366 × 228 — the
  quad matches the DOM box it covers.
- Click target checked at **6 points** across the tile (corners, edges,
  centre), **cold and with the canvas live**: all 6 resolve to `.tile-link`.
- Pointer leave → canvas removed, context handed back, `<img>` at opacity 1.
- **Forced `loseContext()` while live**: canvas removed, `<img>` still
  366 × 228 at opacity 1. The grid does not blank.
- Reduced motion and a 390 × 844 touch context: no canvas, and the `ogl`
  chunk is never requested.
- 3 navigation round trips: 0 canvases and 0 free canvases left behind.
- No console errors in any run.

### Three things the first build got wrong

**The plate rendered softer than the `<img>` beside it.** A 366 px plate is a
heavy minification of a captured screenshot and a single bilinear tap aliases
badly — visible moiré on the fine UI text these captures are full of. Fixed
with mipmaps, anisotropy and a −0.4 LOD bias.

**`uMouse` started at the plate centre**, so the refraction appeared dead
centre and slid out to meet the cursor. It is now seeded from the pointer that
woke it.

**The click bloom was never seen at all.** React removes the tile under 45 ms
after a click — measured — which is before the tween renders a frame. The
canvas is now lifted onto the body as a `position: fixed` element at the
plate's rect and finishes there on its own deadline, because nothing owns it
any more. Verified: it survives for ~250–300 ms at the right rect with
`z-index: 9000`, then disposes.

### What I could not verify

- **That the GL plate is pixel-identical to the DOM plate.** It is close after
  the mipmap fix, and a visitor who never interacts sees no canvas at all
  (which is the rule the brief actually states), but with the pointer on the
  tile and the lens far from the plate the GL render is still *slightly*
  softer than the browser's own downscale. I compared 2× screenshots by eye; I
  did not do a numeric pixel diff, because `preserveDrawingBuffer` is off and
  turning it on for a test would change the thing being tested.
- **Colour management.** The canvas is faded in over 200 ms partly to hide any
  profile mismatch. On a wide-gamut display the two may not match; I have not
  seen one.
- **Real GPU cost.** Headless Chrome's GL is not a laptop's.
- **More than one plate at a time**, because there is only one image tile.
  The context budget logic (one context per hovered plate, returned on leave)
  is written for the general case and exercised on a single tile.

### What I would do differently

Given that this covers one tile in nine, the honest recommendation is either
to put the demo sprites' *posters* through the same shader while the sheet
downloads — which is real coverage for a real moment — or to accept that this
particular design does not fit this particular grid and spend the 14 kB
somewhere else.

---

## Feature 3 — Route transition layer

`src/shutter.js`, `src/shutter.css`, `src/router.jsx`, `src/WorkGrid.jsx`,
`src/ProjectPage.jsx`. Deletes `src/view-transition.css`.

### What I built, and what I removed

A six-bladed `clip-path` aperture that closes over the page, lets the route
swap behind it, and opens on the new one. It **replaces** the View Transitions
plate morph rather than sitting alongside it.

I removed the morph deliberately, not silently. A full-page wipe covers the
screen; a shared-element morph happens on it. Run together, the morph plays
under an opaque plate and the only thing a visitor sees of it is that the
transition takes longer. The morph's intent is carried over in the one way a
wipe can carry it: **the aperture closes on the point that was clicked and
opens on the thing that was arrived at.**

`startViewTransition` is also the wrong tool for this specific effect, for
three reasons that are not preferences:

1. It animates between two snapshots, so a wipe through it is a wipe of one
   still image over another.
2. It cannot honestly cover a `popstate`, whose URL has already changed before
   the callback is reached.
3. A route that throws leaves the page under a frozen snapshot. A `clip-path`
   this code owns is finished from a guarded call *and* from a deadline, which
   is the entire "must not strand the page" requirement.

The polygon traces the viewport clockwise and the aperture anticlockwise, so
the default nonzero fill rule leaves the aperture unpainted — no dependence on
`polygon()`'s `evenodd` fill rule, which is newer than the browsers this site
still supports. A second layer behind it, with an aperture 3 px smaller, draws
the blade edge in `--accent`. The blades rotate a sixth of a turn as they
close; that and the straight edges are what make it a machined aperture rather
than a circle shrinking.

### Measured

- Forward navigation **418 ms** over 49–56 sampled frames; Back **403–408 ms**.
  Brief's target was 300–400 ms; this is at the top of it and 18 ms over.
- Aperture closes to a **zero-width** polygon in both directions, so the page
  is genuinely covered rather than nearly covered.
- Clicking tile 01 closes the aperture at **22.6%, 48.4%** of the viewport —
  that tile's centre — and opens it at **52.1%, 35.9%** — the project page's
  head.
- Overlay is `pointer-events: none` in every state, and the overlay element is
  removed from the render tree (`display: none`) when idle.
- A route callback that **throws**: no live overlay afterwards, page clickable.
- Reduced motion: the shutter element is **never created** and the swap is
  instant.
- Ctrl-click and middle-click: the page does not navigate, a new tab opens,
  the shutter never runs, `href` is still `/work/<id>`. `isPlainClick`
  interception preserved exactly.
- Longest inter-frame gap during a transition: **58 ms**, at the seam where
  `flushSync` commits the new route. One dropped frame, behind a closed
  aperture.

### The bug worth recording

`openPoint()` measured the page being *left*, not the one being arrived at,
because React 18 batches and the callback returned before the commit. The
aperture fell back to the viewport centre on every navigation and the feature
looked like it worked. `flushSync` — which I had removed with the View
Transitions code, thinking it was only needed for snapshots — had to come
back for a different reason. I found this only because I instrumented the
aperture's centre rather than trusting the screenshot.

### What I could not verify

- **Any browser but Chrome.** The per-frame `clip-path` rewrite is the
  performance risk here: it repaints a full-viewport layer 50-odd times per
  transition. Chrome holds ~8 ms frames. Safari and Firefox are unmeasured,
  and a low-end machine is unmeasured everywhere.
- **A slow route.** The seam holds for 30 ms and `flushSync` makes the commit
  synchronous, so a route that took longer than a frame to render would render
  *inside* the aperture-closed window and be invisible — but every route here
  is cheap and I have not tested one that is not.
- **The aperture on a very wide or very tall viewport**, where the hexagon's
  cover radius is much larger than the diagonal.

### What I would do differently

Drive the blades as six transformed elements rather than as a polygon
rewritten every frame. It would be GPU-composited instead of repainted, it
would look more like a real shutter (blades that overlap rather than a
polygon that shrinks), and it would remove the only per-frame paint cost in
this branch.

---

## Rules I broke

`AGENTS.md` bans most of this, which the task said was an approved override on
this branch. For the record, and with a judgement on each:

| Rule | Broken? | Worth it? |
| --- | --- | --- |
| "no scroll listeners anywhere on the site" | **Yes.** ScrollTrigger attaches one. | Yes. There is no other way to bound a pin's scroll distance to an explicit number, which is the whole point of Feature 1. |
| "Motion is pure CSS… no JS gating class" | **Yes.** GSAP writes inline transform and opacity on the deck; `data-deck` is a JS gating attribute. | Yes, and `data-deck` is a feature: the CSS that collapses eight panels onto one box only applies once the code that animates them is known to have run, so a JS failure leaves a readable stack. |
| "Never animate opacity on a scroll-driven timeline" | **No**, and this is worth being precise about. The ban is specific to CSS `animation-timeline: view()`, where a stalled timeline holds the start state and can make text permanently invisible. A ScrollTrigger scrub writes a value on every scroll event and on every refresh, and reverting the context removes the inline style entirely. The brief permits it explicitly. | n/a |
| "no parallax" | **Adjacent.** The deck is depth-on-scroll, which is the same family even if it is not layer parallax. | Yes for the deck; it is the design. |
| "no blur" | No. Nothing in this branch blurs. | n/a |
| "Limit infinite animations to background/ambient elements" | **No.** The tile lens has no time uniform and renders only on change; the deck is scrub-driven. Nothing loops. | n/a |
| "only 1–2 active animations visible at once" | **Yes**, for about 300 ms: clicking a tile runs the plate bloom and the shutter together. | Yes — they are one gesture, and the shutter closes over the bloom rather than competing with it. |
| "Accent means interactive. Do not use it on static text." | **Edge.** The shutter's 3 px rim is accent on a non-text element during a navigation. | Yes. A navigation is the result of an interaction, and the rim is the tell that makes the aperture read as machined rather than as a fade. |
| "Centralize motion values in CSS variables (section 1 of spa.css)" | **Yes.** `DECK_SCROLL_VH`, `CLOSE_MS`, `OPEN_MS`, `BLOOM_MS` and the shader constants are JS, not CSS custom properties. | Unavoidable — GSAP cannot read a CSS variable as a timeline duration without a getComputedStyle round trip per refresh. Section 4 of `spa.css` has been updated to point at the files that own them. |

## Where I departed from "React owns one number, CSS reads it off `data-*`"

Asked for explicitly, so:

- **GSAP writes inline `transform` and `opacity`** on the eight deck panels on
  every scroll frame. That is the largest departure and it is inherent to the
  stack.
- **`tileGL.js` writes shader uniforms** and the canvas's inline size and
  opacity.
- **`shutter.js` writes a `clip-path` string** on two elements every frame.

Where the convention is *kept*, and deliberately:

- The deck's mark geometry. React writes `--mark-lead` and `--jump-at` as
  dimensionless numbers, JS writes `--deck-vh` and `--deck-step` in px from
  the ScrollTrigger itself, each mark carries `--i`, and **CSS does all the
  arithmetic** — the `top`, `height` and `scroll-margin-top` expressions in
  `deck.css` are the only place that maths exists.
- `data-deck` on the deck and `.tile-gl--free` on a blooming canvas are state
  flags that CSS reads, exactly as `data-scrub` and `.is-playing` already are.

## How to run what I ran

The probes live in `output/probe/` (gitignored) and drive their own Chrome via
`playwright-core`, installed with `--no-save` so it is in neither
`package.json` nor the lockfile. The dev server was on **port 5247**, verified
free and verified to be serving this worktree (`/src/Skills.jsx` contains
`DECK_SCROLL_VH`, which exists nowhere else) before any measurement was taken.

I started on a shared Playwright MCP browser and abandoned it: another session
was driving the same instance and navigated it to `about:blank` mid-measurement
and resized it under me. Two of the numbers I nearly reported — a horizontal
scrollbar that did not exist, and a click target that resolved to `null` —
were artifacts of that. The Claude browser pane was not usable either; it was
hidden, so `innerWidth`/`innerHeight` were 0 and timers were throttled hard
enough to time out a 500 ms sleep. Anything measured through a shared or
hidden browser in a session like this should be re-checked.

One more harness trap, in case it saves the next person an hour: Playwright's
`page.mouse.click(x, y, { modifiers: ["Control"] })` did **not** set `ctrlKey`
on the event the page received. The modifier-click test passed a plain click
and silently "proved" that Ctrl-click navigated. `page.keyboard.down("Control")`
around the click works.

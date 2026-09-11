# Synthesis — Stack A's deck, Stack B's plates, both route transitions

Branch: `worktree-nav-experiments`, reset onto Stack A's tip (`f6f1925`) and
built from there.

| Task | Commit |
| --- | --- |
| 1 — Sprite plates on the GPU | `93bcffe` |
| 2 — Find-in-page across the deck | `eedf270` |
| 3 — GSAP out of the entry chunk | `27a60de` |
| 4 — Both route transitions, per navigation | `796dbad` |
| 6 — AGENTS.md | `a20628c` |

Task 5 is cross-browser verification and produced no code change; its findings
are below and it is committed with this report.

**Entry bundle, gzipped: 124.00 kB → 76.38 kB.** Baseline before any of this
branch's features was 73.51 kB, so all three features now cost 2.87 kB of
entry between them.

Everything below marked as measured was measured through Playwright-driven
Chromium 129 and Firefox 130 against a dev server on port 5361, verified free
and verified to be serving this worktree (`/src/plateFX.js` contains
`posterByDemo`, which exists nowhere else), plus `vite preview` on 5362 for
the built-output payload numbers. The probes are in `output/probe/`
(gitignored). Sections headed "not verified" are not boilerplate.

---

## Task 1 — Stack B's sprite technique, in Stack A's OGL plate layer

`src/tileGL.js`, `src/plateFX.js`, `src/tile-gl.css`, `src/WorkGrid.jsx`.

### Coverage

Five of nine tiles carry art: four sprite animations and one captured
screenshot. **All five now get the shader.** Stack A shaded one.

Its two stated reasons for not shading the sprites were both solvable, and
both were solved the way Stack B solved them:

- The frame index does not have to be re-derived from generated CSS.
  `fig.getAnimations()[0].currentTime` is the same clock the browser is
  stepping `background-position` with, and `background-size` as a percentage
  pair *is* the grid. Both are read off computed style, so a re-capture with a
  different grid cannot desync this from `scripts/build_demo_sprite.py`.
- The sheets are past the texture limit only at native size.

That only works because **the DOM figure is faded, never hidden** — `opacity`
keeps the CSS animation running and that animation is the clock. Its alpha is
held at the complement of the canvas's, so the handover is a crossfade in both
directions rather than a gap. Writing `opacity: 0` on the figure the moment
the canvas began fading up left an empty plate for the whole 200 ms of that
fade; that is fixed.

### The DPR-2 question Stack B could not answer

Stack B's `MAX_SHEET = 2048` gives ~227 px cells. **It is visibly soft at
`devicePixelRatio: 2`, and I measured it rather than leaving it there.**

The rule now is computed, not constant: `target = min(native, driver
MAX_TEXTURE_SIZE, 4096 ceiling, cells-across × the plate's size in device
pixels)`. Sharpness measured as mean gradient energy on luma over the plate,
with the sprite frozen at a known `currentTime` so the shader and the DOM are
on the same frame, at 1440×900 `deviceScaleFactor: 2`:

| tile | sheet | shader @2048 | shader @computed | DOM |
| --- | --- | --- | --- | --- |
| 01 pellet | 9×9 | 6.032 | **7.281** | 7.224 |
| 03 reach-single | 7×7 | 2.955 | **3.114** | 3.201 |
| 05 prosthetic-function | 13×13 | 4.585 | **5.290** | 4.930 |
| 06 lickrevolver-build | 9×9 | 2.028 | **2.144** | 1.897 |

At 2048 the worst tile is 16.5% softer than the DOM plate beside it. Computed,
the same tile is 0.8% sharper, and none of the four is more than 2.7% below.
The 7×7 sheet (3780 native) is now not downscaled at all.

The 4096 ceiling is a memory decision: 67 MB of RGBA, and because a context is
handed back on `pointerleave` only one plate ever holds one. Reaching native
on the largest sheet would want 4940 — 17% more linear resolution for 45% more
VRAM.

### Three bugs this found

1. **`uMouse` was never actually tweened.** Stack A's `aimPlate` did
   `gsap.to(uniforms.uMouse, { value: [x, y] })`. GSAP has no array
   interpolator, so it fell through to its complex-string tween and handed OGL
   `"0.47,0.63"`; Chrome answers `GL_INVALID_OPERATION: Only array uniforms
   may have count > 1` and keeps the last good value. The lens sat wherever
   the pointer entered the tile and never moved. Found by patching
   `uniform2fv` and logging what it was given — it is invisible in a
   screenshot, because a lens that does not move still looks like a lens. Now
   tweens two scalars.
2. **The frame index divided by the frame count.** The generated keyframes are
   spaced `1/(n-1)` of the duration apart (169 frames, second keyframe at
   0.5952% = 1/168). Stack B's formula divides by `n` and drifts a frame ahead
   through the middle of every run.
3. **A sheet that will not upload left a frozen poster over a playing demo.**
   With `createImageBitmap` removed, the first build kept the canvas showing
   the poster while the DOM figure stayed faded. The plate now gives the tile
   back.

Also: `Renderer.setSize` writes a fractional plate width into `canvas.width`,
which truncates, and the untruncated one into `canvas.style.width` — a 364 px
buffer stretched over 364.76 px. Snapped to whole device pixels.

### Fallbacks, all measured

| gate | result |
| --- | --- |
| `prefers-reduced-motion: reduce` | 0 canvases, `tileGL`/`ogl` never requested |
| coarse pointer, 390×844 | 0 canvases, `tileGL`/`ogl` never requested |
| no `createImageBitmap` | canvas removed, figure back at opacity 1, sprite still running |
| forced `loseContext()` | canvas removed, figure 365×365 at opacity 1, animation still running |
| click target, live canvas | 6 of 6 points (4 corners, top edge, centre) resolve to `.tile-link` |

The link's box is 399×570 against a tile of 401×572 — the difference is the
tile's own 1 px border on each side; the link covers the content box and every
probed point hits it.

Three route round trips leave 0 canvases, 0 free canvases on the body, exactly
1 pin spacer and 1 shutter element, and 0 elements holding a
`view-transition-name`.

### Not verified

- **Pixel identity with the DOM plate.** It is close and characterised rather
  than asserted. An amplified difference image (`output/probe/diff-tile1.png`)
  is an outline: flat areas are identical and the residual is entirely on
  edges, 11.7% of pixels differing by more than 24 luma with a mean signed
  offset of −1.1. A frame, flip or grid error was ruled out separately — the
  shader at t₁ against the DOM at t₁ scores MAD 20.6 where the same shader
  frame against the DOM at t₂ scores 60.7, and sweeping the DOM ±3 frames
  around the match leaves the minimum at k = 0. What is left is that the
  shader's downscale of a 455 px cell and the browser's downscale of a 540 px
  cell disagree at high-contrast edges.
- **Real GPU cost, and the hitch on a first sheet upload.** `createImageBitmap`
  is off-thread, but I did not measure the resize of a 4940² webp on a real
  laptop. Headless Chrome's GL is not a laptop's.
- **Colour management on a wide-gamut display.**
- **More than one plate live at once**, because the design returns the context
  on `pointerleave` and only one ever is.

---

## Task 2 — Find-in-page across all eight skills

`src/deckTimeline.js` (was `src/Skills.jsx`), `src/deck.css`.

GSAP's `autoAlpha` is opacity plus visibility, so seven of the eight cards
were `visibility: hidden`. Plain `opacity` instead.

Verified with `window.find()` — the browser's own find-in-page search, which
will not match inside `display: none`, `visibility: hidden` or
`content-visibility: hidden` — plus `document.body.innerText` and a layout-box
check on each card, at 1600×900:

| | before | after |
| --- | --- | --- |
| findable by `window.find()` | 1 / 8 | **8 / 8** |
| present in `document.body.innerText` | 1 / 8 | **8 / 8** |
| non-zero layout box | 8 / 8 | 8 / 8 |

Firefox 130: 8 / 8 on all three.

The cost is that an invisible full-viewport card is a hit target again, so the
deck writes `data-front` on the card the reader is looking at and `deck.css`
gives that one alone `pointer-events: auto`. The index comes from the same
expression as the scroll marks — `floor(t + MARK_LEAD)` — so the rail, the
marks and the clickable card agree by construction.

Sequencing is intact: **8 / 8 rail jumps** land on their own card at opacity
1.00 with exactly one card clickable, and **0 disagreements over a 41-sample
sweep** of the pin between `data-front` and the card actually in front. Two
probe artifacts had to be removed before that number meant anything: the
`scrub: 0.3` smoothing is still catching up for ~300 ms after a scroll lands,
and between the incoming card reaching alpha 1 and the outgoing one starting
to fade both are at 1, so the visible card is the one with the greater `z`,
not the first at maximum opacity.

### Not verified

- **A screen reader.** All eight cards are now in the accessibility tree,
  which is a strict improvement over seven being removed from it, but a reader
  moving through eight stacked cards of which seven are invisible is a
  different experience from reading eight headings, and I have not put NVDA or
  VoiceOver on it.

---

## Task 3 — GSAP out of the entry chunk

`src/deckGeometry.js` (new), `src/deckTimeline.js` (new), `src/plateFX.js`
(new), `src/Skills.jsx`, `src/shutter.js`.

**Entry bundle, gzipped: 124.00 kB → 76.38 kB** (raw 351.57 kB → 231.83 kB).
Baseline before this branch's features: 73.51 kB.

| chunk | gzip | when |
| --- | --- | --- |
| entry `index.js` | **76.38 kB** | always |
| `index.css` | 15.23 kB | always |
| gsap core (shared) | 27.81 kB | with either lazy chunk |
| `deckTimeline` (+ScrollTrigger) | 18.87 kB | approaching the skills section |
| `ogl-plate` | 14.09 kB | first pointer over a tile plate |
| `tileGL` | 4.28 kB | first pointer over a tile plate |

Three moves, only the first about the deck:

- The timeline moved to `deckTimeline.js`, dynamically imported from an
  IntersectionObserver at `rootMargin: 150%`. Its numbers moved to
  `deckGeometry.js`, which imports nothing, because `Skills.jsx` writes two of
  them into the markup on the first paint.
- `tileGL.js` moved behind `plateFX.js`, which answers the pointer, motion and
  WebGL questions without loading what they gate.
- `shutter.js` dropped GSAP for two easing functions and one rAF loop. Its
  deadline now forces the route swap rather than only tidying the overlay,
  which is a real fix: a background tab does not paint, so its rAF never
  advances and the old code could sit shut.

Measured against the built output:

- **Reduced motion:** entry + CSS only. Scrolling to the skills section and
  hovering every tile fetches neither lazy chunk.
- **390×844 phone:** entry + CSS only, scrolling to the bottom of the page.
- **1600×900 desktop:** the deck chunk **is** fetched on load. Honest number,
  and it is not the gate misfiring — the skills section starts 0.95 viewports
  from the top of the document, so "about to be needed" is "now". What changed
  is that it is no longer in front of the first paint. The tile chunks are
  still only fetched on a pointer.

### Not verified

- **That 150% is the right margin.** It is far enough that the flow-to-pinned
  layout change happens off screen on the viewports I tested, but a very short
  window or a deep link to an anchor below the skills section could land a
  reader mid-shift. I did not construct that case.

---

## Task 4 — Both route transitions, chosen per navigation

`src/router.jsx`, `src/WorkGrid.jsx`, `src/ProjectPage.jsx`,
`src/view-transition.css` (restored), `src/main.jsx`.

A plain left click on a work tile runs the View Transitions plate morph, as on
`main`. Everything else runs the shutter. `WorkGrid` makes the choice, because
the two need different preparation and only one may be prepared: a morph needs
the plate intact (no bloom, no aperture), a wipe has nothing to carry (plate
dissolves, aperture closes on the tile). The router holds a one-shot flag that
the very next `navigate()` consumes and that `popstate` clears rather than
ignores.

Measured in Chromium at 1440×900, watching both tells — a patched
`document.startViewTransition` and a MutationObserver on the shutter's
`is-live` class:

| navigation | view transition | shutter |
| --- | --- | --- |
| plain click on a tile | yes, `finished`, not aborted | never built |
| Back (`popstate`) | no | 418 ms |
| masthead wordmark | no | 402 ms |
| Ctrl-click on a tile | no | no |
| tile click, `startViewTransition` deleted | no | 399 ms |
| tile click, reduced motion | no | no |
| any navigation, reduced motion | no | no |

Never both, in any row.

The modifier-click contract is intact and measured rather than assumed:
`ctrlKey: true` reaches the page, `defaultPrevented` is false, the URL does
not change, a second tab opens, **no element is left holding a
`view-transition-name`**, and the plain tile click immediately afterwards
still takes the morph. (Playwright's `page.mouse.click(x, y, { modifiers })`
does not set `ctrlKey`; `keyboard.down("Control")` around the click does.)

A mid-transition screenshot (`output/probe/nav/chromium-midmorph.png`) shows
the `project-plate` group carrying real content, not an empty box — worth
checking because the source plate has a live WebGL canvas inside it at the
moment of the snapshot.

### What is lost, deliberately

The plate bloom does not run on a morph navigation. It dissolves the plate,
and the morph needs the plate. It still runs when a tile click falls through
to the shutter, which is every browser without `startViewTransition`.

A project with no demos claims no `project-plate` on arrival and gets the
plain root crossfade. That is `main`'s behaviour and I did not extend it,
though naming `.project-figure` as a second candidate would be a small change
if the owner wants the morph on those four projects too.

### Not verified

- **A route that actually throws** under the morph. The shutter's `try/finally`
  and deadline are exercised by construction; `startViewTransition`'s failure
  mode is the browser's and I did not force it.
- **Safari's View Transitions.** See below.

---

## Task 5 — Cross-browser, honestly

### Firefox (Playwright build 130, real, driven)

- Skills deck: pinned, 8 / 8 rail jumps, **0 sweep disagreements over 41
  samples**, section 6.367 viewports, no horizontal overflow.
- Find-in-page: **8 / 8** by `window.find()`, innerText and layout box.
- Route transitions: this Firefox build has **no `startViewTransition`**, so
  every navigation takes the shutter — 413, 438, 464, 465 ms across four
  navigations, no stranded names, Ctrl-click opens a tab. That is the designed
  fallback and it works. **Caveat: Firefox shipped View Transitions after the
  build Playwright bundles, so a current Firefox will take the morph path on
  tile clicks and I have not seen that happen.**
- Tile plates: all five shaded, sprite frames stepping, DOM figure faded,
  no console errors. Gradient energy within 8–12% of the DOM plate.
- Demo switchers on the project routes: play, in sync.

### A real Firefox bug, pre-existing, that this pass found

**The assembly sequences on `/work/<id>` do not run in Firefox at all**, and
they did not before this branch either. In `src/spa.css` the rule that
attaches the sprite sheet and the `animation` to `.rig-figure[data-figure]
.is-live` sits inside `@supports (animation-timeline: view())`. Firefox 130
does not support it, so the whole block is dropped: computed `animation-name`
is `none`, `getAnimations()` is empty, and `background-position` stays at
`50% 50%`. Pressing Play sets `data-scrub="play"` and the frame counter
advances to `2 / 100`, `3 / 100` — **and the picture never changes.**

I did not fix it in these six tasks. It was outside them, the files involved
were byte-identical to `main`, and it is not a one-line fix: moving the
`animation` declaration out of the `@supports` would give every `.is-live`
figure a default-duration animation that snaps to the last frame on load in
exactly the browsers being fixed. It needed its own change, with the button
path's `animation-timeline: auto` taken into account — which is the point,
because the `@supports` guard was written when scroll was the only driver and
the buttons made it unnecessary.

**Fixed since, in `c93c44e`** (cherry-picked from `main`'s `f04bf52`). The
answer was a `@supports not (animation-timeline: view())` block gated on
`[data-scrub]` rather than `.is-live`, which is what avoids the snap-to-last-
frame problem described above: no control pressed, no animation, poster holds.
Verified in Firefox 155 against this branch's own stylesheet — a figure with
no `data-scrub` renders the poster, and `buildup` and `prosthetic-build`
seeked to `--scrub 0.5` render distinct mid-sequence frames.

Chromium, same probe: 10 distinct background-positions over 10 samples during
Play, and the step buttons move both the counter and the picture.

### Safari — read, not run. I cannot test Safari on Windows and did not.

**ScrollTrigger's fixed-position pinning.** ScrollTrigger pins `.deck-stage`
with `position: fixed` here; I confirmed that by reading the computed style
inside the pin range (`position: fixed`, `top: 0.484px`, wrapped in a
`.pin-spacer`). The classic Safari failure is a fixed pin whose containing
block is not the viewport, so I walked every ancestor from `.deck-stage` to
the root looking for `transform`, `filter`, `backdrop-filter`, `perspective`,
`contain` or `will-change`. **There are none** — `html` and `body` both report
`transform: none`. The stage's own `perspective: 1400px` is on the pinned
element itself, not above it, so it does not capture the pin. That removes the
most common cause. What I cannot rule out: Safari's rubber-band overscroll,
where a fixed element visibly detaches at the ends of the document, and its
history of jitter when a fixed layer's position is recomputed from a scroll
handler at a different cadence from the compositor. The deck sits mid-document
with content above and below, which is the less exposed case, but a full
100vh fixed stage under elastic scrolling is exactly where this shows up.

**The shutter's per-frame `clip-path` repaint.** Two full-viewport divs get a
new 12-point `polygon()` every frame for ~60 frames per navigation, and both
are painted layers — `--stage-bg` and `--accent` backgrounds — with no
`will-change` and nothing that would promote them. Chromium holds this at ~8 ms
frames; Safari on a Retina display repaints 4× the pixels for the same CSS
area, which is the single riskiest thing in this branch for that engine. Two
specific concerns beyond throughput: the aperture depends on the **nonzero
fill rule** to leave a hole (the viewport traced clockwise, the aperture
anticlockwise), which the spec makes the default and which WebKit has had bugs
around historically; and `shutterSupported()` tests
`CSS.supports("clip-path", "polygon(0% 0%)")` unprefixed, which modern Safari
answers true for — but if a build ever needed `-webkit-clip-path`, that
support test would pass and `blade.style.clipPath` would silently do nothing,
leaving a fully opaque overlay for 400 ms. The deadline would clear it, and the
route would still swap, so the failure is ugly rather than fatal.

### Mobile and narrow viewports

Chromium, `hasTouch`/`isMobile` where applicable:

| | 390×844 | 768×1024 | 1100×800 |
| --- | --- | --- | --- |
| deck mode | flow | flow | flow |
| `perspective` on stage | none | none | none |
| `transform-style` | flat | flat | flat |
| panels with a transform | 0 | 0 | 0 |
| panels at opacity 1 | 8 | 8 | 8 |
| findable by `window.find()` | 8 / 8 | 8 / 8 | 8 / 8 |
| canvases anywhere | 0 | 0 | 0 |
| horizontal overflow | 0 | 0 | −17 (scrollbar) |
| `.stage-lede` size | 15.1 px | 15.6 px | 16.1 px |
| tap on a tile navigates | yes | yes | yes |

Nothing 3D leaks into the fallback: no perspective, no `preserve-3d`, no
transforms, no marks, no canvases. The eight panels carry their own
`data-stage-id`, so the rail still works.

---

## Task 6 — AGENTS.md

Rewritten so the file describes the site that exists. The budget table from
section 4 of `src/spa.css` is now the centre of the motion section, and
everything outside it is still banned — no parallax, no blur, nothing that
loops, which is truer now than before because there is no ambient motion at
all.

Preserved, each as a scar with its reason: never animating opacity on a
scroll-driven CSS timeline and why that is specific to `animation-timeline:
view()`; `animation-delay` only inside `prefers-reduced-motion: no-preference`;
`--plate` for CAD renders only; `.tile-plate` square on a sprite tile; and why
the earlier pinned skills section was deleted — now amended to say what the
current one does instead, which is declare `DECK_SCROLL_VH = 5` where the
deleted one let its cost fall out of its layout and reached twenty-four
viewports.

Added, each from this branch: never sequencing by `visibility` or
`content-visibility`; fading rather than hiding a sprite's DOM figure; sizing a
texture from the plate's device pixels; GSAP having no array interpolator; the
`1/(n-1)` keyframe spacing; snapping a canvas to whole device pixels; one route
transition per navigation, chosen; and the payload-gate rules with the entry
number to defend.

The scroll-listener ban is now a one-place exception with the property it was
protecting stated directly.

---

## What I think is still wrong

1. **The Firefox sequence bug above.** It is pre-existing and out of scope, but
   it means a third of the project pages show a still picture and a moving
   counter to every Firefox reader, which is worse than showing nothing.
2. **The deck chunk still loads on every desktop visit**, because the skills
   section begins 0.95 viewports down. The entry bundle is honest and the
   first paint is not blocked, but a reader who never scrolls past the hero
   still fetches 46.68 kB of animation library. Moving the skills section
   lower, or accepting a visible layout settle, are the only ways out of that,
   and both are content decisions.
3. **0.625 viewports per skill panel is tight**, which Stack A said and I did
   not change. A reader who wants to *read* all eight skills is better served
   by the reduced-motion stack, which is an uncomfortable thing to be true of
   a fallback.
4. **The shutter is the per-frame paint cost of this branch** and it is the one
   thing most likely to be bad on a machine I have not used. Driving six
   transformed blade elements instead of rewriting a polygon would make it
   GPU-composited; Stack A said the same and it is still the right next change.
5. **The plate shader and the DOM plate differ at edges** by a characterised
   but non-zero amount. It is a resampling difference, not an error, and it is
   only visible with a pointer on the tile — but "a visitor who never interacts
   sees no difference" is the rule, and a visitor who does interact sees a
   small one at the moment of handover.
6. **Nothing here has been seen by a person on a real display.** Every number
   in this report came out of a headless browser.

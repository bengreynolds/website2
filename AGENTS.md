# Project Guidance (website2)

## Objectives
- Present a clean, confident portfolio/resume experience for hiring managers.
- Emphasize clarity, scannability, and a motion language that is deliberate
  rather than decorative: every moving thing on this site is either answering
  a control the reader pressed or carrying them between two states.
- Keep interactions lightweight and fast on desktop and mobile. "Lightweight"
  is a payload number, not a feeling — see **Payload gates**.

## Visual & Motion Principles

This section used to read "prefer subtle, single-purpose motion" and "only
1–2 active animations at once". The site outgrew both. What replaced them is
not "more motion is fine"; it is a short list of things motion is allowed to
be, and everything outside the list is still banned.

**The whole budget.** Section 4 of `src/spa.css` carries the same table and is
the canonical copy.

| what | why it moves |
| --- | --- |
| `.rise` | hierarchy — a staggered entrance orders the hero at first paint |
| `.reveal` | sequence — a 14px settle says a new block has arrived |
| skills deck | sequence — eight panels dealt off a pinned stage |
| sprite scrub | content — the frame index IS the assembly step |
| demo switcher | state — a mechanism runs because someone asked it to |
| tile plate | feedback — a refraction under the pointer, on the GPU |
| route transition | sequence — a morph or an aperture between two routes |
| hover/focus | feedback — 140ms colour and border changes, no lifts |

Nothing else. No parallax, no blur, no glow, and nothing that loops forever.
"Nothing loops" is the rule that replaced "limit infinite animations to
ambient elements": there is no ambient motion here at all. The deck is
scrubbed, the plates render only while a value is changing, the sprites run
once per press, and the shutter has a deadline.

- One purpose per moving element, still. Two effects may overlap only when
  they are one gesture — clicking a tile blooms its plate *and* closes the
  shutter, for about 300ms, because that is one act of leaving.
- Consistent easing and timing. Durations live in CSS variables (section 1 of
  `src/spa.css`) wherever CSS owns the animation. Where JS owns it the number
  lives beside the code that uses it and is named: `DECK_SCROLL_VH`,
  `CLOSE_MS`, `BLOOM_MS`, `SHEET_CEILING`. A JS timeline cannot read a CSS
  variable as a duration without a `getComputedStyle` round trip per frame,
  so this is a real split rather than an inconsistency — but a number with no
  name is a bug waiting to be argued about.
- Accent color means "interactive". Do not use it on static text. Tell states
  apart by border strength and font weight rather than hue, which also keeps
  them readable for colorblind visitors. The shutter's 3px rim is accent on a
  non-text element and is the one deliberate edge case: a navigation is the
  result of an interaction.
- Prefer hover states that change color/outline over large lifts. The tile
  plate's refraction is about 4px of displacement, which is a lens, not a lift.
- Everything must be readable with WebGL unavailable, with the deck or sprite
  chunk failing to load, and under `prefers-reduced-motion: reduce`. Every
  feature on this site has a fallback that is the plain DOM, and every one of
  them is exercised by a real reader on some machine.
- This is *not* true of JS disabled, and the checklist should not pretend
  otherwise: `index.html` ships an empty `#root` with no `<noscript>`, so with
  scripting off the page is blank. That is a real gap rather than a decision -
  worth closing with a `<noscript>` carrying the name, the summary and the
  resume link, so a crawler or a scripting-off reader gets something.

## Information Flow
- Home page: brief narrative + clear CTAs + quick navigation tiles.
- Internal pages: short hero, then content grouped into 2–3 main sections.
- Prioritize outcome/impact statements near the top of each page.

## Implementation Guidelines

### Scroll

- **Scroll listeners are allowed in exactly one place**, and it is
  ScrollTrigger's, inside `src/deckTimeline.js`. The old blanket ban existed
  because a scroll handler that does layout work per event is the classic way
  to make a page feel heavy. What actually matters is the property that ban
  was protecting: **a section that pins must declare what it costs in scroll,
  as a number, in one place.** `DECK_SCROLL_VH = 5` in
  `src/deckGeometry.js` sets the ScrollTrigger `end`, the pin spacer's height
  through that, and the spacing of the marks the rail jumps to. Change it and
  all three move together.
- **Why the previous pinned skills section was deleted, and what is different
  now.** It let its pin length fall out of the layout — a track taller than
  its content, per stage — so nobody ever wrote down the cost, and it came to
  three viewports of scroll per skill: twenty-four viewports for eight skills,
  with no way for a reader to move at their own pace. The section was removed
  and replaced with eight `<details>` accordions for exactly that reason. The
  deck that stands there now is pinned again, and the only thing that makes
  that acceptable is the number above: five viewports for all eight panels,
  0.625 each, declared rather than emergent. **If you find yourself adding a
  pin whose length is implied by its content, you are rebuilding the thing
  that was deleted.**
- Everything else that reacts to scroll is `.reveal`, plus two
  IntersectionObservers in `src/App.jsx` and one in `src/Skills.jsx`. None of
  the three drives motion: two mark which section and which skill the reader
  is in so the rail can open the right group, and the third arms a payload.
- **Never animate opacity on a scroll-driven CSS timeline**
  (`animation-timeline: view()`). The timeline holds an element at its start
  state whenever it cannot advance, so a faded keyframe can leave text
  permanently invisible. Animate transform only. This ban is specific to CSS
  scroll timelines: the deck fades its cards from a GSAP scrub, which writes a
  value on every scroll event and every refresh and is removed entirely when
  the context reverts, and that is fine.
- **Never sequence by `visibility: hidden` or `content-visibility: hidden`.**
  The deck's first build used GSAP's `autoAlpha`, which is opacity plus
  visibility, so seven of its eight cards were `visibility: hidden` whenever
  they were not in front. That took them out of find-in-page and out of the
  accessibility tree: Ctrl-F for any skill but the one on screen found
  nothing, measured at 1 of 8 against the `<details>` version it replaced
  where all eight were always findable. Use plain opacity, which leaves the
  text laid out, rendered, searchable and announced. The cost is that an
  invisible full-viewport card is still a hit target, so hand `pointer-events`
  to the front card alone — `deck.css` does that off `data-front`.

### Sprites and figures

- Sprite figures are driven by controls, not by the page. The assembly
  sequences run from buttons in `src/SequencePanel.jsx`: Play puts the
  generated keyframes on the document timeline (`data-scrub="play"`), and the
  frame buttons pause it and seek with a negative `animation-delay`
  (`data-scrub="step"`). The button demos run from the switcher in
  `src/Figures.jsx`. Nothing about a sprite depends on scroll position.
- The wheel scrub that used to be the one sanctioned scroll exception is gone,
  along with `useWheelScrub`. Two things it left behind that are worth keeping
  in mind: `--scrub-dur` has to be defined for whichever `data-scrub` mode is
  active, or the duration and the seek both resolve to nothing and the figure
  sits on the wrong frame while the counter moves; and a negative
  `animation-delay` is not re-evaluated on an animation that has already
  finished, so entering step mode remounts the element.
- **`.tile-plate` stays exactly square on a sprite tile.** The generated demo
  CSS computes `background-size` as a percentage of a square cell, so a plate
  that is not square draws every frame stretched. `.tile[data-art="shot"]` at
  16/10 is the one legitimate exception: a captured screenshot is not a sprite
  and letterboxes badly in a square. Nothing may set width, height or
  aspect-ratio on `.tile-plate` from any other file.
- The keyframes a sprite's generated CSS writes are spaced `1/(n-1)` of the
  duration apart — first at 0%, last at 100%. Anything deriving a frame index
  from a clock divides by `n-1`, not by `n`. Dividing by `n` drifts a frame
  ahead through the middle of every run, which is small enough to look like
  nothing and large enough that nothing ever lines up.

### The GPU plates

`src/plateFX.js` gates, `src/tileGL.js` implements, `src/ogl-plate.js` is the
five OGL modules it uses. All five tiles that carry art get the shader,
sprites included.

- **The DOM art is faded, never hidden.** A sprite tile's shader reads its
  frame index off `fig.getAnimations()[0].currentTime` — the DOM animation is
  the clock, so `display: none` and `visibility: hidden` stop the clock and
  freeze the sprite. Opacity keeps it running. The figure's alpha is held at
  the complement of the canvas's, so the handover is a crossfade in both
  directions and never a gap.
- **Read the grid off computed style, never from a table.**
  `background-size` as a percentage pair *is* the sprite grid, and
  `scripts/build_demo_sprite.py` rewrites it and the keyframes together. Any
  code that restates the grid has to be kept in step with every re-capture by
  hand; code that parses it cannot go stale.
- **Size a texture, do not pick a number.** Sheets here run from 3780 to 4940
  square, which is up to 97MB of RGBA for a plate about 366 CSS px across, and
  past `MAX_TEXTURE_SIZE` on plenty of hardware. `sheetScale()` takes the
  smallest of: native, the driver's `MAX_TEXTURE_SIZE`, a memory ceiling, and
  the plate's own size in **device** pixels times the cells across. A flat
  2048 cap measured 16.5% softer than the DOM plate at `devicePixelRatio: 2`;
  scaling to the plate measured 0.8% sharper. Resize inside
  `createImageBitmap`, which is off the main thread, and drop the bitmap once
  it is uploaded.
- **A plate that cannot draw what the DOM is drawing gives the tile back.**
  If the sheet will not upload, the canvas is removed and the DOM sprite comes
  back rather than the plate holding a frozen poster over a demo that is
  playing underneath it.
- **GSAP cannot tween an array.** `gsap.to(uniform, { value: [x, y] })` falls
  through to the complex-string tween and hands the renderer `"0.47,0.63"`;
  the upload fails with `GL_INVALID_OPERATION` and the uniform keeps its last
  good value, so the effect looks like it is working and is not. Tween two
  scalars on a plain object and write the array in `onUpdate`.
- Snap a canvas to whole device pixels. `Renderer.setSize` writes a fractional
  CSS width into `canvas.width`, which truncates, and the untruncated one into
  the style — a 364px buffer stretched over 364.76px, which is invisible on a
  flat area and obvious on the hard edges of a CAD render.

### Route transitions

There are two, and **exactly one runs per navigation**. `src/router.jsx`
chooses.

- A plain left click on a work tile gets the **View Transitions plate morph**:
  the tile's plate carries `view-transition-name: project-plate` into the
  project page's figure. That click is the only navigation on the site with a
  source element to morph from.
- Everything else gets the **shutter** (`src/shutter.js`): the rail, the
  masthead, Back and Forward, every browser without `startViewTransition`, and
  reduced motion. `popstate` could not take the morph even in principle — its
  URL and scroll position have both already changed before the callback is
  reached, so the "old" snapshot is not the page the reader was looking at.
- They cannot be layered on one navigation: `startViewTransition` snapshots
  the whole document, so anything drawn over its transition is captured in the
  old snapshot and freezes there. That is a fact about a single navigation and
  not about the site, and reading it as the latter is how both experimental
  branches ended up deleting the morph.
- Whichever path runs, it must be impossible to strand the page. The shutter
  finishes from a guarded call *and* from a deadline that also forces the
  route swap, because a background tab does not paint and its rAF never
  advances.
- Every link stays a real `<a href>` and only an unmodified left click is
  intercepted (`isPlainClick`). Cmd/Ctrl/Shift/middle-click must keep opening
  a new tab, and a modifier-click must not leave a `view-transition-name`
  stranded on a grid that is not going anywhere — two elements sharing a name
  aborts every later transition.

### Payload gates

The entry bundle is the number to defend. Baseline before any of this was
73.51kB gzipped; it is 76.38kB now, with GSAP, OGL and every sprite sheet
behind a gate.

- Anything over a few kB that only some readers can use is imported
  dynamically, behind the cheapest possible test of whether they can use it.
  `plateFX.js` asks about pointer, motion and WebGL before loading a byte of
  `tileGL.js`; `Skills.jsx` arms `deckTimeline.js` from an
  IntersectionObserver; `sprites.js` fetches a 0.5–3MB sheet on hover.
- Import deep module paths, not a package index, when the index re-exports
  more than you need: `"ogl"` produced a 39.38kB chunk where five direct
  module imports produce 14.09kB, because the index drags in transitive
  dependencies tree-shaking cannot remove.
- A gate that fires means a layout change. Arm it far enough ahead that the
  change happens off screen — the deck's flow-to-pinned switch moves the
  section by several viewports.

### Reduced motion, and the delay trap

- **Declare `animation-delay` only inside `prefers-reduced-motion:
  no-preference`.** Section 17 of `src/spa.css` crushes every duration but
  leaves delay alone, so a delay declared outside that query makes the element
  land late under reduce. `.rise` is the pattern to copy.
- Under reduce the deck is never built, the plates never exist, the shutter
  element is never created, and no route transition runs. Reduce is not a
  faster version of the site; it is the plain one.

### Colour and material

- **`--plate` is for CAD renders only.** It is light in both themes so dark
  renders survive; text on it fails contrast in dark mode. Live DOM demos and
  the deck's cards use `--surface`.
- Structure is hairlines and space, not card borders.

### Producing the figures

- CAD animations: follow `docs/fusion-animation-pipeline.md`. It is ordered as
  the work runs, and step 7 (preview stills, and send them to the owner, before
  capturing) is the one that pays for itself. Reusable helpers, all of them
  replacing an approach that produced a wrong result, are in
  `scripts/fusion/animation_helpers.py`.
- Software demos: follow `docs/software-animation-patterns.md`. **If the
  subject is an application that runs, capture it running** — launch it, drive
  the real workflow, take a frame at each beat, and put that run's own numbers
  beside them (`scripts/uicapture/`). A rebuilt interface can only assert what
  the software does; a capture shows it, and driving the real one is what found
  the bug the replica could not. Rebuild only when there is nothing to run: then
  sprite for a mechanism, live DOM for anything with words in it — a 520px
  sprite cell cannot hold a readable filename. This applies to software only;
  hardware figures stay CAD renders under `docs/fusion-animation-pipeline.md`.
  Either way, put the content in `siteData.js` and keep the renderer generic.
  React owns one number; CSS reads it off `data-*` and custom properties.

## Review Checklist

Every item here is something a build passes and a reader does not.

- Is each moving thing on screen doing one of the jobs in the budget table,
  and is anything that overlaps another one part of the same gesture?
- Does the page still read with WebGL refused, with the deck chunk failing to
  load, and under `prefers-reduced-motion: reduce`? Check all three; they fail
  differently. (JS disabled is not on this list because it does not currently
  pass - see the note in the guidelines above.)
- **Can Ctrl-F find every word on the page?** Anything sequenced by hiding
  elements fails this, and it fails silently.
- Does the whole work tile still take the click? `main` fixed a regression
  where the target collapsed to the title box; check the link's rect against
  the tile's, and hit-test the corners with a live canvas over the plate.
- Does exactly one route transition run per navigation — and does a
  modifier-click still open a new tab, leaving no `view-transition-name`
  behind?
- After touching a demo: do the existing sprite demos still play? Press the
  control; do not scroll past the figure and assume.
- Has the entry bundle grown? `npm run build` prints it. Anything new that is
  not behind a gate needs a reason.
- Are sections clearly separated with whitespace and headings, and do CTAs
  remain visible above the fold?

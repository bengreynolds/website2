# Navigation depth — design

Date: 2026-09-10
Branch: `worktree-nav-experiments`, based on `62c0189` (= `main`)
Status: design approved in chat; spec awaiting review

## What this is

Four changes to navigation, all of them about depth. The register was chosen
deliberately over three alternatives: instrument/telemetry, kinetic
typography, and glass/neon. Spatial won, with one amendment argued below —
depth arrives through **perspective and lighting on a page that still scrolls
normally**, not through a camera that flies.

Reference sites named by the owner: `apple.com` and `landonorris.com`. Both
were read directly rather than recalled, and their measured values are in
"What the references actually do" below.

## The constraint that shapes everything

`AGENTS.md` and section 4 of `src/spa.css` define a motion budget with one
line of justification per animation, ending "Nothing else. No parallax, no
infinite loops, no blur." This branch is an explicit sandbox: the budget is
suspended while exploring, and anything that survives is re-argued against
section 4 before it merges.

Two rules are **not** suspended, because both record a real failure:

- **Never animate opacity on a scroll-driven timeline.** The timeline holds an
  element at its start state whenever it cannot advance, so a faded keyframe
  can leave text permanently invisible.
- **Declare `animation-delay` only inside `prefers-reduced-motion:
  no-preference.`** Section 17 crushes duration but leaves delay alone.

The first rule is narrower than it first reads, and the distinction matters
for component 1. It bans opacity on `animation-timeline: view()`, where the
failure mode is a stalled timeline. A React-state-driven CSS *transition* on
opacity has no timeline to stall and no such failure mode. Opacity is
therefore available to the rail and not available to `.reveal`.

### Why the camera does not fly

The literal reading of "spatial" — scroll drives a camera through z-layered
content — was rejected, and the rejection is the main design decision here.

Every revealing block on this site runs `animation-timeline: view()`, which
reads real document scroll position. Taking over scroll breaks all of them
silently. The effect also wants opacity fades for atmospheric perspective,
which is the one thing the rules above ban outright. And `useWheelScrub` was
already built in this repo once and deleted: per `AGENTS.md`, `view()` gave a
100-frame sequence about four wheel notches of travel.

The references support the amendment rather than contradicting it. Neither
site makes *navigation* spatial by moving the page. Their depth is in content;
their navigation is quiet, small, and precise.

## What the references actually do

Measured from the live sites, not remembered.

| | landonorris.com | apple.com |
|---|---|---|
| Ground | `#F4F4ED` warm off-white | `#FAFAFC` at 0.8 alpha |
| Text | olive/sage ramp, `#282C20` darkest | `rgba(0,0,0,0.8)` |
| Nav type | 14px / 400, uniform | 17px / 600, tracking −0.374px |
| Display type | 87px / 700, tracking **−3px**, uppercase | — |
| Chrome | none, transparent over canvas | fixed 44px, `saturate(1.8) blur(20px)` |
| Controls | — | `border-radius: 980px` (full pill) |
| 3D | 21 canvases, WebGL | 0 canvases, 4 videos |
| Page length | 11438px / 16 screens | 5934px / 8 screens |
| Pinning | 4 sticky, one 2483px horizontal track | — |

Three techniques transfer. Two do not.

**Transfers — stacked-label swap.** Lando's nav labels contain their text
twice (`"HomeHome"`, `"StoreStore"`): two stacked copies in a clipped box, one
translating up on hover. Transform-only, no JS, fits `--dur-fast` exactly.
This is already legal under section 4 as written.

**Transfers — scale contrast.** 14 → 32 → 87px is a far steeper jump than this
repo's, and the negative tracking at display size is what makes it read as
designed rather than merely large. This site tops out at `--step-4` = 76px
with no negative tracking.

**Transfers — frosted fixed chrome.** The masthead already carries an
`is-stuck` class from a sentinel IntersectionObserver, so the hook exists.
Blur is section-4-banned, so this is sandbox-only and must be argued
separately.

**Does not transfer — the volt accent.** This repo's amber `#984a00` carries
measured contrast ratios in its own token comment: 5.14:1 as text on
`--surface-sunken`, 6.33:1 behind white on the primary button. The acid green
is also the most-copied colour on the web at present. Amber stays.

**Does not transfer — Lando's duplicated label markup.** His second copy is
not hidden from assistive technology, so a screen reader announces "Home
Home". Our implementation marks the decorative copy `aria-hidden="true"`.
Copy the technique, not the defect.

## Components

### 1. Rail as depth gauge

`src/Rail.jsx` currently receives `activeSection` and `activeStage` from two
IntersectionObservers in `src/App.jsx` and spends them on a colour and a bar.
This makes them a position in a narrative instead.

Links sit on a shared perspective. Each link's distance from the active one
drives how far it recedes in z and turns in y, so the list reads as a surface
curving away from the reader in both directions. The mono numeral is the
depth cue, because a number is what a measuring instrument shows.

React owns one number, per rule 4 of `docs/software-animation-patterns.md`.
The component computes the signed distance from the active index and writes it
to a custom property; every transform is CSS reading that property. No layout
value is computed in JavaScript.

- Signed `--depth` for direction of turn, its absolute value for recession.
- Opacity is permitted here and only here — see the distinction above.
- Guarded by `@supports (transform-style: preserve-3d)`.
- Under `prefers-reduced-motion: reduce`, depth collapses to zero and the
  existing colour-and-bar marking is the whole rendering, unchanged.
- New file `src/rail-depth.css`, imported from `src/main.jsx`. It stays out of
  the generated `demo-*` namespace, per rule 8 of the software playbook.

### 2. Tile tilt

`src/WorkGrid.jsx`. Nine tiles that are currently flat: `background:
var(--surface)`, a 1px `--rule` border, and a single 140ms `border-color`
transition. No shadows exist anywhere in the file.

One shared perspective on `.work-grid`; the hovered tile takes a small
`rotateX`/`rotateY` of 3° or less. This is a genuine tilt, not a lift, which
keeps `AGENTS.md`'s "prefer hover states that change color/outline over large
lifts". Inside the tile, the plate, the number and the title sit at different
`translateZ`, so they separate as it turns.

- **`.tile-plate` keeps `aspect-ratio: 1 / 1`.** The generated sprite CSS
  computes `background-size` as a percentage of a square cell, and a
  non-square plate draws every sprite stretched. `translateZ` and `perspective`
  change only the rendered projection, never the layout box, so the constraint
  holds — but nothing in this component may alter that ratio.
- One delegated `pointermove` listener on the grid, not nine. It writes
  normalised pointer position to custom properties on the hovered tile only.
- Gated behind `@media (hover: hover) and (pointer: fine)`, so touch devices
  get the unchanged flat grid rather than a tilt they cannot aim.
- Under `prefers-reduced-motion: reduce`, no tilt.

### 3. Stacked-label swap

`src/App.jsx` masthead nav and `src/Rail.jsx`. The Lando technique: a clipped
box containing the label twice, the stack translating one line-height on hover
and focus-visible.

- The second copy is `aria-hidden="true"`. See the defect note above.
- Transform-only, `--dur-fast`, `--ease`. Legal under section 4 unchanged.
- Focus-visible must trigger it, not only hover, or keyboard users get a
  dead control.

### 4. Shared-element route transition

`src/router.jsx`, `src/WorkGrid.jsx`, `src/ProjectPage.jsx`. The clicked
tile's plate becomes the project page's figure, so entering a project reads as
moving into the tile.

**This project is on React 18.3.1.** React 19's `<ViewTransition>` component
does not exist here, and the installed `vercel:vercel-react-view-transitions`
skill documents that React 19 API. The implementation is therefore the native
browser API, hand-rolled:

- `document.startViewTransition()` wrapping the route state update, with
  `flushSync` so React commits inside the callback rather than after it.
- `view-transition-name` must be unique per document at any moment. It is
  assigned to the clicked tile's plate at click time and cleared when the
  transition finishes; the destination figure carries the matching name.
- Feature-detected: without `document.startViewTransition` the route swaps
  exactly as it does today.
- Skipped entirely under `prefers-reduced-motion: reduce`.
- `src/router.jsx` intercepts only unmodified left clicks and every link stays
  a real `<a href>`. That must remain true — it is what keeps Cmd-click,
  middle-click and crawlers working.

## Panels

Lighting rather than lift, applied to the same tiles as component 2: layered
shadows cast from one shared virtual light, and a border that brightens on the
lit edge. This is the answer to the owner's "shadows, borders, panels" note
and it introduces the first shadows in the stylesheet.

`--plate` is not available for this. It is light in both themes so dark CAD
renders survive on it, and `AGENTS.md` reserves it for renders; live DOM uses
`--surface`.

## Considered and deferred

**WebGL.** Raised during design. Rejected for navigation and recorded here so
the reasoning is not relitigated: it cannot render text, contributes nothing
to accessibility, and three.js is roughly 150KB gzipped against a current
bundle of 73KB — on a site that gates 0.5–3MB sprite sheets behind a click
specifically to avoid unrequested payload. Neither reference uses it for
navigation; Lando's 21 canvases are all content.

It is, however, the right tool for a different job on this site. The CAD
figures are sprite sheets of real Fusion 360 geometry, and a live model viewer
would beat a 4860×4860 sheet on both fidelity and transfer size. That is
separate work with its own design, not part of this one.

**Pinned and horizontal-scroll storytelling.** Lando's `is-horizontal-track`
section and four sticky pins are the most distinctive thing about his page.
They are also scroll-driven, and this site's reveal system reads document
scroll. Deferred until components 1–4 show whether the grid can hold depth at
all.

## Verification

There is no test framework; `npm run build` plus driving the preview is the
check, per rule 9 of the software playbook.

Two environment findings from this session that will affect verification:

- The in-app Browser pane does not paint animation frames reliably. CSS
  animations sit in a pending play task with `startTime: null` and
  `currentTime` frozen at 0 while `document.timeline` advances normally. This
  reproduces on already-shipped demos, so it is the pane and not the code.
  Anything time-based must be verified another way, or in a real browser.
- Five dev servers per folder is the cap, and other sessions hold them.

Each component must be checked at three settings: default, `prefers-reduced-
motion: reduce`, and a browser without the relevant `@supports` capability.

## Out of scope

Skills-section imagery, the sprite demos on the Motion Analysis Suite, and any
change to `siteData.js` content.

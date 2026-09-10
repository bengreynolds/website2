# Navigation Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give this site's four navigation surfaces real depth — perspective and lighting on a page that still scrolls normally.

**Architecture:** React owns one number per surface and writes it to a CSS custom property; every transform is CSS reading that property. No layout value is computed in JavaScript. Each component is feature-detected, gated behind `prefers-reduced-motion: no-preference`, and degrades to the current flat rendering.

**Tech Stack:** React 18.3.1, Vite 5, plain CSS custom properties. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-10-navigation-depth-design.md`

## Global Constraints

- **No new dependencies.** React stays 18.3.1; React 19's `<ViewTransition>` does not exist here.
- **Never animate opacity on a scroll-driven timeline** (`animation-timeline: view()`). A stalled timeline leaves the element at its start state, which can make text permanently invisible. State-driven CSS *transitions* on opacity are permitted — they have no timeline to stall.
- **Declare `animation-delay` only inside `prefers-reduced-motion: no-preference`.** Section 17 of `src/spa.css` crushes duration but leaves delay alone.
- **`.tile-plate` must keep `aspect-ratio: 1 / 1`.** The generated sprite CSS computes `background-size` as a percentage of a square cell; a non-square plate draws every sprite stretched.
- **Stay out of the generated `demo-*.css` namespace.** New stylesheets get their own filenames and are imported in `src/main.jsx`.
- **Every link stays a real `<a href>`.** `src/router.jsx` intercepts only unmodified left clicks — this is what keeps Cmd-click, middle-click and crawlers working.
- **Accent `--accent: #984a00` is unchanged.** Its contrast ratios (5.14:1, 6.33:1) are recorded in the token comment.
- Motion tokens only: `--dur-fast` 140ms, `--dur-med` 240ms, `--ease` `cubic-bezier(0.2, 0.7, 0.3, 1)`.

## Verification model — read this before Task 1

**This repo has no test framework.** There is no `npm test`; `package.json` defines only `dev`, `build`, `preview`. Do not add Vitest — that is a dependency change and out of scope.

Verification per task is therefore three concrete gates, and each task below states the exact commands and expected output:

1. `npm run build` — must succeed.
2. A **computed-style assertion** run against the dev server. This is the real test: it reads back what the browser actually resolved, which is what catches a custom property that never landed or a selector that never matched.
3. A **reduced-motion assertion** — the same read with reduced motion emulated.

**Known environment limitation:** the in-app Browser pane does not reliably paint animation frames. CSS animations sit in a pending play task with `startTime: null` while `document.timeline` advances. This reproduces on already-shipped demos, so it is the pane, not your code. It does **not** affect the assertions below, which read computed styles and transitions rather than animation progress. Do not try to verify these components by watching them move in that pane.

To emulate reduced motion for gate 3, use the `resize_window` tool's sibling capability or run the assertion with the OS setting on; if neither is available, verify by reading the stylesheet rule directly and confirming the declaration sits inside the `no-preference` query.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/rail-depth.css` | create | Rail perspective, recession, and the reduced-motion collapse |
| `src/nav-swap.css` | create | Stacked-label hover swap, shared by masthead and rail |
| `src/grid-depth.css` | create | Tile tilt, inner `translateZ` separation, panel lighting |
| `src/view-transition.css` | create | `view-transition-name` assignments and transition tuning |
| `src/Rail.jsx` | modify | Compute signed depth per link; render swap markup |
| `src/App.jsx` | modify | Render swap markup in the masthead nav |
| `src/WorkGrid.jsx` | modify | Delegated pointer tracking; set the transition name on click |
| `src/ProjectPage.jsx` | modify | Carry the matching `view-transition-name` on the hero figure |
| `src/router.jsx` | modify | Wrap the route state update in `startViewTransition` |
| `src/main.jsx` | modify | Import the four new stylesheets |

Four stylesheets rather than one: each is owned by exactly one task, so a reviewer can reject one component without unpicking another, and each can be deleted whole if it does not survive the section-4 argument.

---

### Task 1: Rail as depth gauge

**Files:**
- Create: `src/rail-depth.css`
- Modify: `src/Rail.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `activeStage` (string skill id, or `null`) and `route` — both already props of `Rail`. `skills` and `workIndex` from `siteData`.
- Produces: two CSS custom properties on every `.rail-link` — `--depth` (signed integer) and `--dist` (its absolute value). Task 2 renders inside `.rail-link` and must not remove either.

- [ ] **Step 1: Write the depth helper in `src/Rail.jsx`**

Add above the `RailGroup` definition:

```jsx
/* Distance from the link the reader is standing on. Signed for which way the
   link turns, absolute for how far it recedes - and React writes both rather
   than making CSS derive one from the other. CSS abs() and pow() are recent
   enough that relying on either would put a support floor under this file for
   the sake of one subtraction, and React already owns the number.

   Null active index means nobody is marked, so every link sits at zero and
   the rail renders exactly as it did before depth existed. */
function depthOf(index, activeIndex) {
  if (activeIndex < 0) return { "--depth": 0, "--dist": 0 };
  const signed = index - activeIndex;
  return { "--depth": signed, "--dist": Math.abs(signed) };
}
```

- [ ] **Step 2: Apply it to the skills group**

In `Rail`, before the `return`, compute the active index:

```jsx
  const activeSkillIndex = markedStage
    ? skills.findIndex((skill) => skill.id === markedStage)
    : -1;
```

Then in the skills `.map`, change the callback signature to `(skill, index)` and add the style to the `<a>`:

```jsx
                  style={depthOf(index, activeSkillIndex)}
```

- [ ] **Step 3: Apply it to the work group**

Compute the active index before the `return`:

```jsx
  const activeWorkIndex = onWork
    ? workIndex.findIndex((entry) => entry.project.id === route.project.id)
    : -1;
```

Change the work `.map` callback to `(entry, index)` and add to the `AppLink`:

```jsx
                  style={depthOf(index, activeWorkIndex)}
```

- [ ] **Step 4: Create `src/rail-depth.css`**

```css
/* Rail depth gauge.
   The rail stops being a list and becomes a position: links recede and turn
   away from the one the reader is standing on, so the group reads as a
   surface curving off in both directions.

   React owns one number. --depth is a signed integer written per link in
   Rail.jsx; every value below is CSS derived from it, so no layout is
   computed in JavaScript.

   Opacity is animated here deliberately, and it is legal here specifically.
   The rule in AGENTS.md bans opacity on a scroll-driven timeline, where a
   timeline that cannot advance holds the element at its start state and can
   leave it permanently invisible. This is a state-driven transition with no
   timeline to stall, so that failure mode does not exist. Do not copy this
   into anything using animation-timeline: view(). */

@supports (transform-style: preserve-3d) {
  @media (prefers-reduced-motion: no-preference) {
    .rail-list {
      perspective: 620px;
      perspective-origin: 0% 50%;
      transform-style: preserve-3d;
    }

    .rail-link {
      /* --dist is the absolute distance and --depth the signed one, both
         written by Rail.jsx. Recession is symmetric either side of the
         reader; only the turn takes a direction. */
      transform:
        translateZ(calc(var(--dist, 0) * -14px))
        rotateY(calc(var(--depth, 0) * -1.1deg));
      opacity: max(0.42, calc(1 - 0.13 * var(--dist, 0)));
      transition:
        color var(--dur-fast) var(--ease),
        border-color var(--dur-fast) var(--ease),
        opacity var(--dur-med) var(--ease),
        transform var(--dur-med) var(--ease);
    }

    /* The reader's own position comes forward rather than merely colouring
       differently, so the marked link is legible as the near one. */
    .rail-link.is-current {
      transform: translateZ(10px);
      opacity: 1;
    }

    .rail-group:hover .rail-link,
    .rail-group:focus-within .rail-link {
      transform: none;
      opacity: 1;
    }
  }
}
```

- [ ] **Step 5: Import it**

In `src/main.jsx`, after the existing `demo-*` imports and before `./pipeline-demo.css`:

```jsx
import "./rail-depth.css";
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `✓ built in <time>` with no errors.

- [ ] **Step 7: Assert the property lands and CSS consumes it**

Start the dev server, open the home page, scroll into the skills spine so a stage is marked, then run:

```js
const links=[...document.querySelectorAll('.rail-group .rail-link')];
const read=links.map(a=>{const s=getComputedStyle(a);return{
  d:s.getPropertyValue('--depth').trim(), dist:s.getPropertyValue('--dist').trim(),
  t:s.transform.slice(0,24), o:s.opacity};});
({count:links.length, distinctDepths:new Set(read.map(r=>r.d)).size,
  allDistNonNegative:read.every(r=>Number(r.dist)>=0),
  anyMatrix3d:read.some(r=>r.t.startsWith('matrix3d')), sample:read.slice(0,4)})
```

Expected: `count` is 8 or 9, `distinctDepths` is greater than 1, `allDistNonNegative` is `true`, `anyMatrix3d` is `true`, and the samples show `--depth` values that differ in sign either side of the marked link.

Failure to watch for: `distinctDepths` of 1 means `activeSkillIndex` resolved to `-1` — the stage spy has not marked anything yet, so scroll further into the spine before re-running.

- [ ] **Step 8: Assert the reduced-motion collapse**

With reduced motion on, reload and run:

```js
const a=document.querySelector('.rail-group .rail-link');
({transform:getComputedStyle(a).transform, opacity:getComputedStyle(a).opacity})
```

Expected: `transform` is `none` and `opacity` is `1`. The whole depth block sits inside `no-preference`, so nothing in this task should apply.

- [ ] **Step 9: Commit**

```bash
git add src/rail-depth.css src/Rail.jsx src/main.jsx
git commit -m "Turn the rail into a depth gauge for where the reader is standing"
```

---

### Task 2: Stacked-label swap

**Files:**
- Create: `src/nav-swap.css`
- Modify: `src/Rail.jsx`
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: nothing from Task 1 except that `.rail-link` still renders `.rail-num` and `.rail-text` children and still carries `--depth`.
- Produces: a `NavSwap` component exported from `src/NavSwap.jsx` with signature `NavSwap({ children })` where `children` is a string. Task 3 and Task 4 do not use it.

- [ ] **Step 1: Create `src/NavSwap.jsx`**

```jsx
import { memo } from "react";

/* --------------------------------------------------------------------------
   NavSwap
   A label that swaps for a copy of itself on hover and focus. Two stacked
   copies in a clipped box; the stack translates exactly one line on hover, so
   the outgoing and incoming glyphs are the same shape and the movement reads
   as one object rather than a crossfade.

   The technique is lifted from landonorris.com. The defect is not: that site
   leaves both copies in the accessibility tree, so a screen reader announces
   "Home Home". The second copy here is aria-hidden, and the box is presented
   as a single label.

   Transform only, no opacity, one duration token. This is legal under the
   section 4 motion budget as written, which is why it is the one component
   here that needs no sandbox argument.
   -------------------------------------------------------------------------- */

const NavSwap = memo(function NavSwap({ children }) {
  return (
    <span className="nav-swap">
      <span className="nav-swap-track">
        <span className="nav-swap-face">{children}</span>
        <span className="nav-swap-face" aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  );
});

export default NavSwap;
```

- [ ] **Step 2: Create `src/nav-swap.css`**

```css
/* Stacked-label swap. See src/NavSwap.jsx for why the second face is hidden.

   The clip is on the outer box and the movement is on the track, so the
   faces themselves are never transformed and their text stays on the
   pixel grid. line-height is fixed rather than inherited: the translate is
   exactly 50% of a two-face track, which is only exactly one line if both
   faces are exactly one line tall. */

.nav-swap {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}

.nav-swap-track {
  display: grid;
  transform: translateY(0);
}

.nav-swap-face {
  display: block;
  line-height: 1.35;
}

@media (prefers-reduced-motion: no-preference) {
  .nav-swap-track {
    transition: transform var(--dur-fast) var(--ease);
  }

  .nav-link:hover .nav-swap-track,
  .nav-link:focus-visible .nav-swap-track,
  .rail-link:hover .nav-swap-track,
  .rail-link:focus-visible .nav-swap-track {
    transform: translateY(-50%);
  }
}
```

- [ ] **Step 3: Use it in the masthead**

In `src/App.jsx`, add the import beside the others:

```jsx
import NavSwap from "./NavSwap";
```

Then replace the nav link's body — the bare `{item.label}` — with:

```jsx
                  <NavSwap>{item.label}</NavSwap>
```

- [ ] **Step 4: Use it in the rail**

In `src/Rail.jsx`, add the import:

```jsx
import NavSwap from "./NavSwap";
```

Then wrap both `.rail-text` contents. Skills group:

```jsx
                  <span className="rail-text">
                    <NavSwap>{skill.title}</NavSwap>
                  </span>
```

Work group:

```jsx
                  <span className="rail-text">
                    <NavSwap>{entry.short}</NavSwap>
                  </span>
```

- [ ] **Step 5: Import the stylesheet**

In `src/main.jsx`, after `./rail-depth.css`:

```jsx
import "./nav-swap.css";
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 7: Assert the accessible name is not doubled**

This is the whole point of the task's one deviation from the source technique, so test it directly:

```js
const link=document.querySelector('.primary-nav .nav-link');
const faces=link.querySelectorAll('.nav-swap-face');
({rawText:link.textContent, faces:faces.length,
  hiddenOnSecond:faces[1].getAttribute('aria-hidden'),
  clipped:getComputedStyle(link.querySelector('.nav-swap')).overflow})
```

Expected: `faces` is `2`, `hiddenOnSecond` is `"true"`, `clipped` is `"hidden"`. `rawText` **will** read doubled (e.g. `"WorkWork"`) — that is the DOM text and it is expected; the accessible name is what `aria-hidden` fixes.

- [ ] **Step 8: Assert the swap distance is exactly one line**

```js
const t=document.querySelector('.nav-swap-track');
const f=t.querySelector('.nav-swap-face');
({trackH:t.getBoundingClientRect().height, faceH:f.getBoundingClientRect().height,
  ratio:+(t.getBoundingClientRect().height/f.getBoundingClientRect().height).toFixed(3)})
```

Expected: `ratio` is `2.000`. Anything else means a face is wrapping to two lines and `translateY(-50%)` will land mid-glyph — shorten the label or fix `line-height` before continuing.

- [ ] **Step 9: Commit**

```bash
git add src/NavSwap.jsx src/nav-swap.css src/Rail.jsx src/App.jsx src/main.jsx
git commit -m "Swap nav labels for a copy of themselves on hover"
```

---

### Task 3: Tile tilt and panel lighting

**Files:**
- Create: `src/grid-depth.css`
- Modify: `src/WorkGrid.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: nothing from Tasks 1–2.
- Produces: `--px` and `--py` custom properties (unitless, range roughly −0.5 to 0.5) on the hovered `.tile`. Task 4 reads no properties from this task but does add an attribute to the same element.

**Deviation from the spec, and why.** The spec says a shared `perspective` on `.work-grid`. Do not do that. `.work-grid` also carries `.reveal`, which animates `transform` on a `view()` timeline, and a shared vanishing point makes tiles at the grid's edges tilt about a point outside themselves, which reads as a skew rather than a tilt. Per-tile `transform: perspective(...)` gives each tile its own vanishing point at its own centre — correct for independent hover targets — and sidesteps the `.reveal` interaction entirely.

- [ ] **Step 1: Add delegated pointer tracking to `src/WorkGrid.jsx`**

Change the React import to include `useCallback` (`useState` is already there):

```jsx
import { memo, useCallback, useState } from "react";
```

In the `WorkGrid` default export, above the `return`, add:

```jsx
  /* One listener for nine tiles. Each tile gets the pointer's position within
     its own box as two unitless numbers; the transform that reads them lives
     in grid-depth.css. Writing the properties straight to the node rather
     than through state is deliberate - this fires at pointer rate, and a
     re-render per frame would be nine reconciliations for two numbers that
     only CSS consumes. */
  const track = useCallback((event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    const box = tile.getBoundingClientRect();
    tile.style.setProperty("--px", ((event.clientX - box.left) / box.width - 0.5).toFixed(3));
    tile.style.setProperty("--py", ((event.clientY - box.top) / box.height - 0.5).toFixed(3));
  }, []);

  /* Clearing on leave lets the tile fall back to its resting transform rather
     than freezing at whatever angle the pointer left it at. */
  const release = useCallback((event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    tile.style.removeProperty("--px");
    tile.style.removeProperty("--py");
  }, []);
```

Then attach them to the grid element:

```jsx
        <div className="work-grid reveal" onPointerMove={track} onPointerLeave={release}>
```

- [ ] **Step 2: Create `src/grid-depth.css`**

```css
/* Tile tilt and panel lighting.

   A tilt, not a lift: AGENTS.md prefers hover states that change colour or
   outline over large translations, and 3 degrees about the tile's own centre
   moves no edge more than a couple of pixels while still reading as a solid
   object turning.

   perspective is per tile, in the transform, not shared on .work-grid. The
   grid carries .reveal, which animates transform on a view() timeline, and a
   shared vanishing point would make edge tiles skew rather than tilt.

   .tile-plate is not touched here beyond translateZ. Its aspect-ratio is
   load-bearing: the generated sprite CSS computes background-size as a
   percentage of a square cell. translateZ changes the projection, never the
   layout box, so the ratio survives - but nothing in this file may set
   width, height or aspect-ratio on it. */

@media (hover: hover) and (pointer: fine) {
  @media (prefers-reduced-motion: no-preference) {
    @supports (transform-style: preserve-3d) {
      .tile {
        transform-style: preserve-3d;
        transform:
          perspective(900px)
          rotateX(calc(var(--py, 0) * -3deg))
          rotateY(calc(var(--px, 0) * 3deg));
        transition:
          border-color var(--dur-fast) var(--ease),
          transform var(--dur-med) var(--ease),
          box-shadow var(--dur-med) var(--ease);
      }

      /* One virtual light, up and to the left, fixed for every tile so the
         grid reads as nine objects under one lamp rather than nine
         independently lit cards. The pointer shifts the cast slightly, which
         is what sells the tilt as rotation rather than as a skew. */
      /* Two cast shadows and one inset highlight on the lit edges.

         The highlight is inset rather than a border-colour change on purpose.
         spa.css already sets .tile:hover { border-color: var(--accent) },
         this file loads after it, and tinting two edges grey would half-erase
         the one hover affordance the grid has - accent means interactive, and
         weakening it to imply lighting trades a signal for a decoration. An
         inset shadow sits inside the border and leaves it entirely alone. */
      .tile:hover {
        box-shadow:
          calc(var(--px, 0) * 10px - 2px) calc(var(--py, 0) * 10px + 6px) 22px
            -12px rgba(22, 24, 28, 0.28),
          calc(var(--px, 0) * 4px - 1px) calc(var(--py, 0) * 4px + 2px) 6px -4px
            rgba(22, 24, 28, 0.18),
          inset 1px 1px 0 0 rgba(255, 254, 252, 0.5);
      }

      .tile-plate {
        transform: translateZ(26px);
      }

      .tile-num {
        display: inline-block;
        transform: translateZ(40px);
      }

      .tile-title {
        transform: translateZ(14px);
      }
    }
  }
}
```

- [ ] **Step 3: Import it**

In `src/main.jsx`, after `./nav-swap.css`:

```jsx
import "./grid-depth.css";
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 5: Assert the plate stayed square — this is the regression that breaks every sprite**

On the home page:

```js
const bad=[...document.querySelectorAll('.tile-plate')].map(p=>{
  const r=p.getBoundingClientRect(); const s=getComputedStyle(p);
  return {ratio:+(r.width/r.height).toFixed(3), ar:s.aspectRatio};
}).filter(x=>Math.abs(x.ratio-1)>0.01);
({plates:document.querySelectorAll('.tile-plate').length, nonSquare:bad})
```

Expected: `nonSquare` is `[]`. Any entry here means a sprite is drawing stretched — stop and fix before committing.

- [ ] **Step 6: Assert the pointer properties drive a real 3D transform**

```js
const tile=document.querySelector('.tile');
const box=tile.getBoundingClientRect();
tile.dispatchEvent(new PointerEvent('pointermove',{clientX:box.left+box.width*0.9,
  clientY:box.top+box.height*0.1, bubbles:true}));
await new Promise(r=>setTimeout(r,50));
({px:tile.style.getPropertyValue('--px'), py:tile.style.getPropertyValue('--py'),
  transform:getComputedStyle(tile).transform.slice(0,9)})
```

Expected: `px` is close to `0.400`, `py` is close to `-0.400`, and `transform` starts with `matrix3d`. A `transform` of `none` means the `@media (hover: hover)` gate did not match — check you are not emulating a touch device.

- [ ] **Step 7: Assert the reduced-motion and touch fallbacks**

With reduced motion on, reload and run:

```js
({tile:getComputedStyle(document.querySelector('.tile')).transform,
  plate:getComputedStyle(document.querySelector('.tile-plate')).transform})
```

Expected: both `none`. Then set a mobile viewport (which emulates coarse pointer), reload, and confirm the same.

- [ ] **Step 8: Commit**

```bash
git add src/grid-depth.css src/WorkGrid.jsx src/main.jsx
git commit -m "Tilt the work tiles under one fixed light"
```

---

### Task 4: Shared-element route transition

**Files:**
- Create: `src/view-transition.css`
- Modify: `src/router.jsx`
- Modify: `src/WorkGrid.jsx`
- Modify: `src/ProjectPage.jsx`
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: `.tile-plate` from Task 3 (the element that carries the name). Task 3's `translateZ` on it is irrelevant here — a view transition snapshots the rendered element either way.
- Produces: nothing later tasks consume. This is the last task.

**Why this is hand-rolled.** React is 18.3.1. React 19's `<ViewTransition>` component does not exist, and the installed `vercel:vercel-react-view-transitions` skill documents that React 19 API — do not follow it here. The native browser API needs `flushSync` because `document.startViewTransition` snapshots the DOM when its callback returns, and React 18 batches state updates asynchronously, so without `flushSync` the callback returns before React has committed and the transition captures no change.

- [ ] **Step 1: Add the transition wrapper to `src/router.jsx`**

Add to the React import:

```jsx
import { flushSync } from "react-dom";
```

Add this helper above `useRouter`:

```jsx
/* Runs a route change inside a view transition when the browser has one.

   flushSync is not optional. startViewTransition snapshots the old DOM, calls
   this callback, then snapshots the new one - and React 18 batches state
   updates, so without flushSync the callback returns before React has
   committed and both snapshots are identical. The transition then plays
   correctly and shows nothing.

   Reduced motion skips the whole thing rather than shortening it: a
   cross-document morph has no honest short version. */
function withViewTransition(apply) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }
  document.startViewTransition(() => {
    flushSync(apply);
  });
}
```

- [ ] **Step 2: Route the navigation through it**

Find the `navigate` callback in `useRouter` — the one that calls `history.pushState` and sets path state. Wrap only the state update, not the `pushState`:

```jsx
      window.history.pushState({}, "", href);
      withViewTransition(() => {
        setPath(window.location.pathname);
        setPendingHash(hash || null);
      });
```

Keep the existing `isPlainClick` guard and the `<a href>` behaviour exactly as they are.

- [ ] **Step 3: Name the source element in `src/WorkGrid.jsx`**

`view-transition-name` must be unique in the document at the moment the transition starts, so exactly one tile may carry it. Add to the `Tile` component, above its `return`:

```jsx
  /* Only the tile being entered is named, and only while it is being entered.
     Two elements sharing a view-transition-name aborts the transition, so
     naming all nine up front would break every navigation. */
  const [leaving, setLeaving] = useState(false);
```

Add the handler to the `AppLink`:

```jsx
            onClick={() => setLeaving(true)}
```

And put the name on the plate:

```jsx
        <div
          className="tile-plate"
          style={leaving ? { viewTransitionName: "project-plate" } : undefined}
        >
```

- [ ] **Step 4: Name the destination in `src/ProjectPage.jsx`**

In the Mechanism section (around line 80), this line exists:

```jsx
          {demos.length ? <SpriteStage demos={demos} className="project-demo" /> : null}
```

Replace it with a named wrapper, leaving the `SpriteStage` props unchanged:

```jsx
          {demos.length ? (
            <div style={{ viewTransitionName: "project-plate" }}>
              <SpriteStage demos={demos} className="project-demo" />
            </div>
          ) : null}
```

The wrapper is unconditional in structure but conditional in render, which matters: a project with no demos renders no named element at all, and the transition then falls back to the plain root crossfade rather than aborting on a missing pair. Four of the nine projects have no demos, so this path runs often.

`SequencePanel` on the line above is deliberately not named. It is a scroll-scrubbed figure, and snapshotting one mid-scrub captures whatever frame it happened to be on.

- [ ] **Step 5: Create `src/view-transition.css`**

```css
/* Shared-element route transition.

   The named pair is the work tile's plate and the project page's figure, so
   entering a project reads as moving into the tile you clicked rather than as
   a page replacing a page.

   The root fade is shortened well below the default 250ms because the morph
   is the content of the transition; a slow crossfade over the top of it just
   looks like lag. Everything here is inside no-preference - router.jsx also
   skips the transition entirely under reduce, so this is belt and braces. */

@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: var(--dur-med);
    animation-timing-function: var(--ease);
  }

  ::view-transition-group(project-plate) {
    animation-duration: var(--dur-reveal);
    animation-timing-function: var(--ease);
  }
}
```

- [ ] **Step 6: Import it**

In `src/main.jsx`, after `./grid-depth.css`:

```jsx
import "./view-transition.css";
```

- [ ] **Step 7: Build**

Run: `npm run build`
Expected: `✓ built` with no errors.

- [ ] **Step 8: Assert uniqueness — the failure that silently kills the transition**

On the home page, before any click:

```js
const named=[...document.querySelectorAll('*')].filter(
  e=>getComputedStyle(e).viewTransitionName!=='none');
({namedAtRest:named.length, names:named.map(e=>getComputedStyle(e).viewTransitionName)})
```

Expected: `namedAtRest` is `0`. Then click one tile's title link and re-run immediately — expected: exactly `1`, named `project-plate`. Two or more means the transition will abort and the route will swap with no animation.

- [ ] **Step 9: Assert the fallback path**

Confirm the no-API branch works, since most of the risk is there:

```js
const real=document.startViewTransition;
document.startViewTransition=undefined;
history.pushState({},'','/');
dispatchEvent(new PopStateEvent('popstate'));
await new Promise(r=>setTimeout(r,200));
const ok=!!document.querySelector('.work-grid');
document.startViewTransition=real;
({fellBackCleanly:ok, path:location.pathname})
```

Expected: `fellBackCleanly` is `true`. The route must still change with the API removed.

- [ ] **Step 10: Assert middle-click and modifier-click still leave the site**

Non-negotiable per the global constraints:

```js
const a=document.querySelector('.tile-link');
({href:a.getAttribute('href'), isAnchor:a.tagName==='A'})
```

Expected: `isAnchor` is `true` and `href` is a real path such as `/work/reachaq-acquisition-platform`. Then Cmd/Ctrl-click one by hand and confirm it opens a new tab rather than transitioning in place.

- [ ] **Step 11: Commit**

```bash
git add src/view-transition.css src/router.jsx src/WorkGrid.jsx src/ProjectPage.jsx src/main.jsx
git commit -m "Morph the clicked tile's plate into the project figure"
```

---

## Final gate

After Task 4, run all three settings once more across both routes:

- [ ] `npm run build` succeeds
- [ ] Home and one `/work/<id>` render correctly at default settings
- [ ] Both render correctly under `prefers-reduced-motion: reduce`, with every component inert
- [ ] The existing sprite demos still play — Task 3 touches the tiles that host them, and a stretched or non-square plate is the specific way this plan could break them
- [ ] Re-read section 4 of `src/spa.css` and decide, per component, whether it earns a place in the budget or is deleted. Tasks 1, 3 and 4 need that argument; Task 2 is already legal as written.

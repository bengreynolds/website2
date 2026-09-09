# Software demo animation patterns

The counterpart to `docs/fusion-animation-pipeline.md`. That one covers
animations captured from CAD geometry; this one covers demos of software,
where the subject is a workflow rather than a mechanism and the content is
words rather than surfaces.

Ordered as the work actually runs, not as it was discovered.

Every rule below is tagged:

- **[read]** — verified against this repo's source. The file and line are
  given; go look.
- **[open]** — reasoned but not yet exercised in a shipped demo. Confirm it
  and re-tag when the next demo ships.

Worked example: `docs/superpowers/specs/2026-09-09-nwbforge-pipeline-demo-design.md`
and its plan, which is where most of this came from.

---

## 0. The rules

| # | Step | The rule in one line |
|---|---|---|
| 1 | Choose the kind | Sprite for a mechanism, live DOM for anything with words in it. |
| 2 | Stages are data | Put the content in `siteData.js` and keep the renderer generic. Merge view types with identical row shapes. |
| 3 | Layout | HTML nodes in a CSS grid, not SVG, wherever text must reflow. Measure the slot and fit the type; never drop the layout on an estimate. |
| 4 | State | React owns one number. Everything visual reads it off `data-*` and custom properties. |
| 5 | Colour | `--accent` means interactive. `--plate` is for renders. Tell states apart by weight, not hue. |
| 6 | Motion budget | Two animations visible at once, from the existing tokens, transform only. |
| 7 | Reduced motion | Duration is crushed globally; **delay is not**. Put every delay inside `no-preference`. |
| 8 | Ship | Stay out of the `demo-*.css` generated namespace. Import in `main.jsx`. |
| 9 | Verify | No test framework. Build, then drive the preview, and remember the demo is behind a disclosure. |

---

## 1. Choose the demo kind

**[read]** There are two, and picking wrong is the most expensive mistake
available.

**Sprite** — a pre-rendered frame grid played back with `steps(1)` on
`background-position`. `scripts/build_demo_sprite.py` writes
`public/rig/<id>.webp`, a poster, and a generated `src/demo-<id>.css`
carrying the grid and keyframes together. See `src/demo-pcb.css` for what
that output looks like. Right for a mechanism moving through space, where a
photoreal render *is* the content.

**Live DOM** — HTML nodes rendered from data, animated with CSS. Right for a
workflow, an architecture, a data flow.

**The test: does the thing have text in it?** A 520px sprite cell cannot hold
a readable filename, a sprite adds roughly half a megabyte, and every copy
edit means a re-capture. If the demo's content is labels, filenames, field
names or paths, it is a live DOM demo and no amount of render quality will
fix it.

Both kinds live in the same `project.demos[]` array and share the
`.demo-caption` / `.demo-switch` / `.demo-button` furniture, so they read as
one family on the page. A demo with no `kind` is a sprite; only the newer
kinds declare themselves. That keeps existing sprite entries untouched when
a kind is added.

## 2. Make the stages data

**[read]** The content belongs in `src/siteData.js`, not in the component.
The renderer switches on a `type` and knows nothing about the subject.

**Merge view types whose row shapes are identical.** The NWB demo needed
seven stages but only five renderers: sources and artifacts are both
`{ name, meta }`, and a normalized field table and a validation report are
both `{ label, value, state }`. Writing a renderer per stage would have
produced two pairs differing only in a heading.

State the row shape for each type in the design doc, including which fields
are optional. The component reading it and the data feeding it are edited in
different sessions.

Give the switch a fallback that returns `null` rather than throwing. An
unknown `type` is a data typo; it should cost that one stage, not the whole
case study.

## 3. Layout: HTML nodes, and the 56rem inversion

**[read]** SVG text does not wrap or reflow. A demo has to survive from about
20rem on a phone to full width on a desktop, so anything with labels wants
HTML nodes in a CSS grid — the narrow layout is then a `grid-auto-flow`
change and labels wrap on their own, instead of a second hand-authored SVG
layout or a viewBox squeeze that shrinks text below readable.

Reach for SVG only when the geometry is the content and there is no text to
set.

**The trap that already cost one spec revision.** `.case-body`
(`src/spa.css:1110`) inverts at 56rem:

- **Below 56rem** — one column, `max-width: var(--measure)`, 66ch, about
  528px.
- **At and above 56rem** (`src/spa.css:1117`) — `max-width: none` **and**
  `grid-template-columns: repeat(2, minmax(0, 1fr))`.

So above 56rem there is no width cap to raise, and a full-width demo needs
`grid-column: 1 / -1` or it lands in one half-width column beside the prose.
The existing `.case-demos` span (`src/spa.css:820`) only fires under
`.case-body--figure`, so a project without a `figure` must declare the span
itself.

Below 56rem, 528px is the real constraint — but **a cap is not a reason to
abandon the layout.** The first version of this demo pinned its own
breakpoint to 56rem and went vertical below it, reasoning that seven nodes
at ~75px could not hold a ~72px label. Both numbers were estimates, and the
decision cost the demo its only visualisation at every window narrower than
896px, including this app's own 785px browser pane, where the rail read as a
plain text list. The owner reported it as "no visualizations", which is
exactly what it was.

**Measure the slot, then fit the type to it.** Measured: the container is
501px at a 544px viewport and 556px at 785px, giving 68px and 76px slots; at
`0.625rem` with `0.04em` tracking the widest label is 58px, so it fits with
10-18px to spare. One `font-size` override in a
`(min-width: 34rem) and (max-width: 55.99rem)` band keeps the rail
horizontal down to 34rem, and only a real phone gets the vertical fallback.

Two things this cost, worth knowing in advance:

- **Single words cannot wrap.** `NORMALIZE` has no break opportunity, so a
  too-narrow slot overflows rather than reflowing. Shrinking the type is the
  fix; `overflow-wrap: anywhere` would break it mid-word instead.
- **Verify overflow by measuring, not by looking.** Compare each label's
  `scrollWidth` against its button's `clientWidth` at each width you claim to
  support. Estimating character widths from font size and tracking is what
  produced the wrong answer both times.

## 4. State in React, motion in CSS

**[read]** React should own the smallest possible amount: an index, a
boolean. Write it to a `data-*` attribute or a custom property on the root
and let CSS do everything else. There is then no animation state in JS and
nothing to keep in sync.

This is how the sprite demos already work — `App.jsx:138` holds
`{ id, runs }` and nothing more.

**To restart a CSS animation, remount the element.** Changing a `key` is the
reliable way; there is no need for a class toggle, a reflow read, or a
timer. `App.jsx:215` keys on `` `${id}-${play.runs}` `` for exactly this, and
a stepper can key on the current stage id.

**[read]** **A custom property is exempt from `px` coercion, so passing it as
a string is optional, not required.** React appends `px` to some numeric
values on **standard** style properties; a `--`-prefixed custom property
skips that step entirely, no matter whether the value handed to it is a
string or a number:

```jsx
style={{ "--progress": String(stage / last) }}
```

`String(...)` above is still correct — it costs nothing and is free
insurance if the property is ever renamed off `--` — it is just not
load-bearing the way the original phrasing of this rule claimed. Established
during implementation: reading the property back with
`getComputedStyle(el).getPropertyValue("--progress")` returned `"0"` and
`"0.5"`, never `"0.5px"`, which a bare number would also have produced.

**Do not add scroll listeners, observers or timers.** `AGENTS.md` is explicit
and the existing motion honours it: `.rise` is time-based, `.reveal` is
scroll-driven via `animation-timeline: view()`, and neither needs JS. There
are two `IntersectionObserver` instances in `App.jsx` — `useStuckHeader`
(App.jsx:86) condenses the header, and `useSectionSpy` (App.jsx:106) drives
nav highlighting — and neither one drives motion.

## 5. Colour, and what the tokens actually mean

**[read]** Three rules, all of which are easy to violate by accident.

**`--accent` means interactive.** `AGENTS.md` reserves it, so a static state
label — a `blocked` chip, a `pass` row — may not use it however much it wants
to be red or green. Controls may: a button, or a progress bar reporting the
visitor's own position in something they are driving.

**`--plate` is for renders only.** It is defined at `src/spa.css:65` and
`:122` and applied at `:703` and `:766`, deliberately light in *both* themes
so that near-black printed-plastic CAD renders do not vanish on a dark
ground. Text on it fails contrast when the site is dark. A live DOM demo uses
`--surface` and `--text`.

**Collapse semantic states into fewer visual treatments, and use weight
rather than hue.** The NWB demo has five states — `ok`, `pass`, `review`,
`conflict`, `blocked` — and three looks: settled, middle, alert. Both pairs
keep distinct names because the domains differ, but they render identically.
Distinguishing by border strength and font weight instead of colour keeps
them legible in both themes, needs no new tokens, and survives colour
blindness.

## 6. The motion budget

**[read]** `AGENTS.md`: calm means one or two active animations visible at
once. For a demo that usually means **one state change plus one entrance**,
and the third idea has to go.

Dropped from the NWB demo, and worth dropping again: a dot travelling a
connector line, when the node's own colour change already carries the same
meaning.

**Use the existing tokens** from section 1 of `src/spa.css` — `--dur-fast`
140ms, `--dur-med` 240ms, `--dur-reveal` 620ms, `--ease`, `--reveal-shift`
14px. A demo that needs a new motion constant is usually a demo doing too
much.

**On opacity, be precise about the rule.** `AGENTS.md` forbids animating
opacity *on a scroll-driven timeline*, because such a timeline holds an
element at its start state whenever it cannot advance — leaving a faded
keyframe permanently invisible. The comment at `src/spa.css:340` spells this
out, and `.reveal` is transform-only for that reason. A **time-based**
animation is not subject to it: `.rise` at `src/spa.css:329` does fade,
legitimately, because it always runs.

So a click-triggered demo *may* fade. Transform-only is still usually the
better choice — it keeps content readable if the animation never runs at all
— but choose it for that reason, not by misapplying the scroll rule.

## 7. Reduced motion

**[read]** Section 14 of `src/spa.css` (`:1555`) crushes every
`animation-duration` and `transition-duration` to `0.01ms !important`
globally.

The happy consequence: **a CSS-transition-driven demo degrades for free.**
Stages snap instead of sliding, all content stays readable, and no static
fallback has to be built. Sprite demos need the opposite — their generated
CSS attaches the sheet only inside `no-preference`, so `.is-playing` keeps
the poster.

**The trap: that block crushes `animation-duration` but leaves
`animation-delay` alone.** A staggered element with `both` fill and a delay
declared outside `no-preference` therefore holds its start transform through
the full delay and lands *late* — visibly worse than no animation at all.

Put every delay inside the query:

```css
@media (prefers-reduced-motion: no-preference) {
  .thing {
    animation: settle var(--dur-med) var(--ease) both;
    animation-delay: calc(var(--i, 0) * var(--stagger));
  }
}
```

This is not new. `.rise` at `src/spa.css:355` already does exactly this with
`animation-delay: var(--delay, 0ms)` inside the `no-preference` block. Follow
the established pattern rather than rediscovering the bug.

Verify it structurally, since the browser pane has no reduced-motion preset:
`grep -n "animation-delay" src/<your>.css` should return only hits inside a
`no-preference` block.

## 8. Ship

**[read]** **Never hand-write a file matching `src/demo-*.css`.** That is the
namespace `scripts/build_demo_sprite.py` generates into, and every generated
file says "Do not hand-edit" at the top. A hand-authored
`src/demo-pipeline.css` would eventually be overwritten or mistaken for
output. Name it `src/pipeline-demo.css` — subject first, `demo` second.

Put a header comment on the file saying it is hand-written, precisely because
its neighbours are not.

Import the stylesheet in `src/main.jsx` alongside the others. Order matters
for equal-specificity overrides: `spa.css` is imported first, so a demo
stylesheet can override it with a single class and no `!important`.

Add nothing to `package.json`. Every demo so far is React plus CSS.

**No local focus or button resets.** `src/spa.css:210` already resets
`button` (font, colour, background, border, padding, cursor) and `:227` is a
global `:focus-visible`. Re-declaring either is dead code.

## 9. Verify

**[read]** There is no test framework and `package.json` declares no `test`
script. Adding one for a visual demo is not worth it, so the cycle is
**build, then drive the preview** — but each step still needs a concrete
observation that is false before the work and true after. "Looks right" is
not a verification.

1. `npm run build` — exit 0.
2. `preview_start {name: "website2-dev"}` — already configured in
   `.claude/launch.json` on port 5178. Never start a dev server with `Bash`.
3. **The demo is behind a disclosure.** Navigate, scroll to Work, find the
   project, and click its **Case study** summary. Nothing renders until that
   `<details>` is open. Every verification pass repeats these three steps.
4. `read_page` over screenshots for text and structure — it returns refs you
   can click. Screenshots for the visual checks only.
5. `read_console_messages {onlyErrors: true}` — this is where duplicate-key
   warnings and custom-property unit complaints show up.
6. `javascript_tool` with `getComputedStyle` for the things you cannot see:
   which animation is attached, what the per-row delays actually are, whether
   a panel's background is the surface token or the plate.
7. `resize_window` for narrow, wide, and both themes. Reload after switching
   so load-time media queries re-evaluate.
8. **Re-test the sprite demos.** Any change to the `hasDemo` block in
   `App.jsx:199` can break them, and a build will not catch it.
9. **[read]** **Screenshots are unreliable when the Browser pane is hidden.**
   Capture returns the page background only for anything outside the
   initially-painted viewport, and `scrollIntoView` does not move the
   capture view — scrolling to a section and shooting it silently produces a
   blank frame instead of an error. Verify layout with `getComputedStyle`
   and `getBoundingClientRect` instead; it is more precise anyway, since it
   reads the actual computed values rather than eyeballing a picture of
   them.

For a data-heavy demo, a **shape check is worth writing** even with no test
framework — `siteData.js` is a dependency-free ES module, so
`node --input-type=module` can import it and assert every row has its
required fields, every enum value is in range, and any counts that appear in
two stages agree. That catches content typos before any markup exists.

---

## Appendix A: tokens a demo may use

Everything a demo needs already exists in section 1 of `src/spa.css`. Adding
a token is a signal to re-read this list first.

| Purpose | Token |
|---|---|
| Panel ground | `--surface`, `--surface-sunken` |
| Text | `--text`, `--text-muted`, `--text-subtle` |
| Rules and borders | `--rule`, `--rule-strong` |
| Interactive only | `--accent`, `--accent-hover`, `--accent-wash` |
| CAD renders only | `--plate` |
| Radius | `--radius-control` |
| Small text | `--step--1`, `--tracking-label`, `--font-mono` |
| Motion | `--dur-fast`, `--dur-med`, `--dur-reveal`, `--ease`, `--reveal-shift` |

## Appendix B: mistakes that cost real time

1. **Turning a layout off because a container is capped.** The rail was made
   vertical below 56rem on an estimate that its labels would not fit, which
   silently removed the demo's only visualisation at every width under 896px
   — the state the owner eventually reported as "no visualizations". The slots
   were 68-76px and the label fits at 58px once the type is a step smaller.
   Measure the slot; fit the type; keep the layout.
2. **Assuming `.case-body` is width-capped everywhere.** It is capped below
   56rem and uncapped-but-two-column above. A modifier raising the cap was
   designed, specced, and thrown away; the actual need was
   `grid-column: 1 / -1`. Read the media queries around a container before
   designing against it.
3. **Planning to put text in a sprite.** Caught at design time. Would have
   cost a full capture pipeline for illegible output.
4. **Reaching for SVG because the thing is a diagram.** SVG text does not
   reflow. The composition changed to HTML nodes and the SVG layer stopped
   earning its place entirely — the connector became one 1px pseudo-element
   and one scaled pseudo-element.
5. **Over-broadening the opacity rule.** "Never animate opacity" is not the
   repo's rule; "never on a scroll-driven timeline" is. `.rise` fades. Copying
   the strict version into a plan meant justifying a correct choice with a
   wrong reason.
6. **Nearly declaring a stagger delay outside `no-preference`.** Rows would
   have landed late under reduced motion. The pattern to copy was already in
   the file at `src/spa.css:355`.
7. **Designing seven renderers for seven stages.** Two pairs had identical
   row shapes. Compare shapes before writing components.
8. **Inlining a motion constant.** A `28ms` stagger was written straight into
   an `animation-delay` calc and review caught it: `AGENTS.md` centralizes
   motion values, and hand-written `src/spa.css` carries no literal design
   motion value at all — only the `0ms` zero-fallback at `:357` and the
   `0.01ms !important` reduce sentinel at `:1559`/`:1561`. The one literal
   duration in the repo, `3.6s` in `src/demo-pcb.css:18`, is in a generated
   file and exempt. The fix was to name it `--pipeline-stagger` on
   `.pipeline`.

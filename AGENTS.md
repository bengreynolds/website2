# Project Guidance (website2)

## Objectives
- Present a clean, confident portfolio/resume experience for hiring managers.
- Emphasize clarity, scannability, and a calm motion language.
- Keep interactions lightweight and fast on desktop and mobile.

## Visual & Motion Principles
- Prefer subtle, single-purpose motion over multiple simultaneous effects.
- Use consistent easing and timing; avoid stacking blur + parallax + glow together.
- Limit infinite animations to background/ambient elements only.
- Ensure content is readable with JS disabled and with reduced motion enabled.

## Information Flow
- Home page: brief narrative + clear CTAs + quick navigation tiles.
- Internal pages: short hero, then content grouped into 2–3 main sections.
- Prioritize outcome/impact statements near the top of each page.

## Implementation Guidelines
- Centralize motion values in CSS variables (see section 1 of `src/spa.css`).
- Motion is pure CSS: a time-based `.rise` entrance for above-the-fold hero
  content, and a scroll-driven `.reveal` (`animation-timeline: view()`) for
  everything below. No JS gating class and no scroll listeners. Two
  IntersectionObservers do exist, in `src/App.jsx`, and neither drives motion:
  they mark which section and which skill the reader is in so the rail can
  open the right group.
- Sprite figures are driven by controls, not by the page. The assembly
  sequences run from buttons in `src/SequencePanel.jsx`: Play puts the
  generated keyframes on the document timeline (`data-scrub="play"`), and the
  frame buttons pause it and seek with a negative `animation-delay`
  (`data-scrub="step"`). The button demos run from the switcher in
  `src/Figures.jsx`. Nothing about a sprite depends on scroll position.
- The wheel scrub that used to be the one sanctioned scroll exception is gone,
  along with `useWheelScrub`. It existed because `view()` gave a 100-frame
  sequence about four wheel notches of travel, which was a real problem while
  the figure lived inside a page you scrolled past. Now the figure is the
  subject of its own route and a button is the honest control. Two things it
  left behind that are worth keeping in mind: `--scrub-dur` has to be defined
  for whichever `data-scrub` mode is active, or the duration and the seek both
  resolve to nothing and the figure sits on the wrong frame while the counter
  moves; and a negative `animation-delay` is not re-evaluated on an animation
  that has already finished, so entering step mode remounts the element.
- Scroll-driven motion is therefore `.reveal` and nothing else.
- Never animate opacity on a scroll-driven timeline. The timeline holds an
  element at its start state whenever it cannot advance, so a faded keyframe
  can leave text permanently invisible. Animate transform only.
- Keep animations short and avoid large translate/scale jumps.
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
- Declare `animation-delay` only inside `prefers-reduced-motion: no-preference`.
  Section 14 of `src/spa.css` crushes every duration but leaves delay alone, so
  a delay outside that query makes the element land late under reduce. `.rise`
  is the pattern to copy.
- `--plate` is for CAD renders only. It is light in both themes so dark renders
  survive; text on it fails contrast in dark mode. Live DOM demos use
  `--surface`.
- Prefer hover states that change color/outline over large lifts.
- Accent color means "interactive". Do not use it on static text. Tell states
  apart by border strength and font weight rather than hue, which also keeps
  them readable for colorblind visitors.

## Review Checklist
- Does the page feel calm with only 1–2 active animations visible at once?
- Are sections clearly separated with whitespace and headings?
- Does the page still look good if animations are disabled?
- Do CTAs remain visible above the fold?
- After touching a demo: does it still read under reduced motion, and do the
  existing sprite demos still play? A build will not catch either.

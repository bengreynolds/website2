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
  everything below. No JS gating class, no scroll listeners, no observers.
- Never animate opacity on a scroll-driven timeline. The timeline holds an
  element at its start state whenever it cannot advance, so a faded keyframe
  can leave text permanently invisible. Animate transform only.
- Keep animations short and avoid large translate/scale jumps.
- CAD animations: follow `docs/fusion-animation-pipeline.md`. It is ordered as
  the work runs, and step 7 (preview stills, and send them to the owner, before
  capturing) is the one that pays for itself. Reusable helpers, all of them
  replacing an approach that produced a wrong result, are in
  `scripts/fusion/animation_helpers.py`.
- Software demos: follow `docs/software-animation-patterns.md`. Sprite for a
  mechanism, live DOM for anything with words in it — a 520px sprite cell
  cannot hold a readable filename. Put the content in `siteData.js` and keep
  the renderer generic. React owns one number; CSS reads it off `data-*` and
  custom properties.
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

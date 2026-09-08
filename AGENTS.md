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
- Prefer hover states that change color/outline over large lifts.
- Accent color means "interactive". Do not use it on static text.

## Review Checklist
- Does the page feel calm with only 1–2 active animations visible at once?
- Are sections clearly separated with whitespace and headings?
- Does the page still look good if animations are disabled?
- Do CTAs remain visible above the fold?

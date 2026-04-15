# Website2 Remaining Work

Last updated: 2026-04-15

This file is the active todo list for the SPA portfolio. It should be used as the short-term implementation checklist and as the place to gather content that still needs to be provided by the site owner.

All user-provided content that still needs to be added should live in `assets/`.

## Current State

The site already has:
- a React/Vite SPA shell
- sticky frosted navigation
- light and dark themes
- hero, proof, about, skills, experience, projects, gallery, and contact sections
- reveal-on-scroll motion
- project filters
- project case-study modal
- evidence-based gallery treatment
- mailto contact fallback
- SEO and social metadata in the document head

The remaining work is mostly content quality, real supporting assets, and a final polish pass.

## Priority 1: Content To Add In `assets/`

- `assets/images/headshot.jpg`
- `assets/images/gallery/01.jpg`
- `assets/images/gallery/02.jpg`
- `assets/images/gallery/03.jpg`
- `assets/images/projects/autonomous-behavioral-system.jpg`
- `assets/images/projects/rfid-pipeline.jpg`
- `assets/images/projects/prosthetic-tester.jpg`
- `assets/images/projects/taste-rig.jpg`
- `assets/images/projects/tens-dbs-alignment.jpg`
- `assets/images/projects/reach-analysis.jpg`
- `assets/docs/resume.pdf`
- `assets/docs/portfolio-one-pager.pdf`
- `assets/copy/hero-statement.md`
- `assets/copy/about-bio.md`
- `assets/copy/contact-prompt.md`
- `assets/copy/social-proof.md`
- `assets/copy/testimonials.md`
- `assets/copy/projects/autonomous-behavioral-system.md`
- `assets/copy/projects/rfid-pipeline.md`
- `assets/copy/projects/prosthetic-tester.md`
- `assets/copy/projects/taste-rig.md`
- `assets/copy/projects/tens-dbs-alignment.md`
- `assets/copy/projects/reach-analysis.md`
- `assets/data/project-links.json`
- `assets/data/social-links.json`

## Priority 2: Replace Placeholder Or Generic Copy

- Replace any filler social proof with real quotes, awards, posters, publications, or recommendations.
- Replace any placeholder project case-study text with true problem, constraints, approach, result, and role copy.
- Replace generic contact language with a sharper statement about the kinds of roles and projects you want.
- Replace any placeholder or illustrative metrics with factual numbers or remove them entirely.
- Replace any abstract gallery note with real evidence descriptions that match the uploaded assets.

## Priority 3: Final UI/UX Edits

- Verify the hero feels specific enough on the first screen and revise if the message still reads too broadly.
- Make sure the proof strip feels credible and not crowded once real content is added.
- Confirm the projects section reads like case studies and not just cards with a modal.
- Keep the gallery only if the assets make it feel like real work evidence; otherwise simplify it.
- Keep the resume CTA visible in the hero, header, contact section, and footer.
- Review card surfaces again after real content is added so repeated styling still feels intentional.
- Check the contact section on mobile for spacing, line length, and tap targets.
- Confirm the motion still feels calm after assets and copy length change layout.

## Priority 4: Site Quality And Trust

- Add a PDF resume that matches the site content.
- Add at least one real testimonial or recommendation if available.
- Add at least one real project screenshot or diagram per major project.
- Add any publication, poster, conference, award, or presentation assets that reinforce credibility.
- Add real external links for projects if those URLs exist.
- Add a real portrait or headshot instead of the placeholder portrait treatment.

## Suggested Implementation Order

- Gather content into `assets/`.
- Replace placeholder copy in `src/siteData.js`.
- Wire real images and documents into the SPA.
- Do a typography and spacing polish pass after the text is finalized.
- Re-check mobile layouts.
- Re-check the hero, proof strip, and project modal after content changes.
- Decide whether the gallery should stay after real imagery is added.

## Notes For A Future Developer

- Keep the SPA as the primary implementation.
- Prefer content updates before structural rewrites.
- Do not add more visual complexity unless real assets justify it.
- Treat `assets/` as the source-of-truth for all future portfolio content.
- Keep placeholder content clearly marked until the real content exists.

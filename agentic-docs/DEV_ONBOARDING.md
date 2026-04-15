# Website2 Developer Onboarding

This file is intentionally left untracked.
It is the practical starting point for a new developer coming into this repository.

## 1. What This Repo Is

This is a personal portfolio website for Benjamin Reynolds.

The current implementation is a React single-page application built with Vite.
The site is intended to present a professional, recruiter-friendly portfolio with:
- a strong landing section
- a concise bio
- skills grouped by relevance
- an experience timeline
- a project showcase
- a gallery / visual reel
- a clear contact path

The goal is not to build a generic brochure site.
The goal is to make the page feel credible, calm, and conversion-oriented for technical and HR audiences.

## 2. How To Think About The Site

Treat the app as a single long-form page with anchored sections, not as a traditional multi-page site.

The visible sections are:
- Home
- About
- Skills
- Experience
- Projects
- Gallery
- Contact

The old HTML pages are compatibility redirects only.

## 3. Start Here

Read these files in this order:
1. [src/siteData.js](./src/siteData.js)
2. [src/App.jsx](./src/App.jsx)
3. [src/spa.css](./src/spa.css)
4. [index.html](./index.html)

That order matters because:
- `siteData.js` tells you what content exists
- `App.jsx` tells you how the page is assembled and how the interactions work
- `spa.css` tells you how the UI actually looks and behaves
- `index.html` tells you how Vite bootstraps the app

## 4. Local Setup

### Install

Run the standard package install for the repo:

```bash
npm install
```

### Dev Server

Run:

```bash
npm run dev
```

That should start Vite and open the app.

### Build

Run:

```bash
npm run build
```

Use this to confirm that the SPA and redirects still work in production mode.

### Preview

Run:

```bash
npm run preview
```

Use this to sanity-check the built output locally.

## 5. Important Files And Their Jobs

### [index.html](./index.html)

The single SPA mount point.

Contains:
- document metadata
- the `#root` mount target
- the module entry import for React

### [src/main.jsx](./src/main.jsx)

Bootstraps the React app and imports the SPA stylesheet.

### [src/App.jsx](./src/App.jsx)

The main app component.

Contains:
- section layout
- navigation
- modal logic
- scroll tracking
- reveal setup
- project filtering
- gallery reel
- contact form behavior

### [src/siteData.js](./src/siteData.js)

Centralized content records.

If you need to change portfolio content, this is usually the first place to look.

### [src/spa.css](./src/spa.css)

The authoritative stylesheet.

Contains:
- typography
- layout
- cards
- modal
- nav
- footer
- motion
- responsive breakpoints

### [about.html](./about.html), [experience.html](./experience.html), [projects.html](./projects.html), [gallery.html](./gallery.html), [contact.html](./contact.html)

Legacy compatibility redirects.

They should not be extended into separate pages unless the project direction changes again.

### [public/Benjamin_Reynolds_Updated_CV_Fall2025.docx](./public/Benjamin_Reynolds_Updated_CV_Fall2025.docx)

Static file served from the public directory.

The resume download link points here.

## 6. How The SPA Behaves

### Navigation

Navigation is hash-based.

Examples:
- `#home`
- `#about`
- `#skills`
- `#experience`
- `#projects`
- `#gallery`
- `#contact`

When a nav item is clicked:
- the page scrolls to the relevant section
- the URL hash updates
- the active nav state updates
- the mobile menu closes

### Scroll State

The app tracks:
- scroll progress
- active section
- reveal-triggered visibility

The section spy is important because it keeps the nav synced to where the user actually is in the document.

### Motion

Motion is subtle and controlled.

There is:
- a page-level ambient background
- reveal-on-scroll
- count-up stats
- gallery reel rotation
- modal transitions inherited from the layout

Respect `prefers-reduced-motion` when modifying anything animated.

### Project Cards

Project cards are clickable buttons that open a modal.

The modal is not a separate page.

If you add projects:
- update `src/siteData.js`
- verify filtering tags
- verify the featured project still makes sense

### Contact Form

The contact form opens a `mailto:` draft.

There is no backend.

If you change this, decide whether the new behavior should be:
- still mailto-based
- a hosted form service
- a custom backend

## 7. Content Editing Guidance

### Safe Places To Edit

Usually safe:
- `src/siteData.js` for portfolio content
- `src/spa.css` for styling
- `src/App.jsx` for layout or interaction changes

### Things To Be Careful With

Be careful changing:
- nav hash ids
- section ids
- modal behavior
- mobile nav behavior
- scroll observer thresholds
- reduced-motion handling

Those pieces are part of the site’s core behavior.

### Content Rules

Keep copy:
- professional
- concise
- specific
- recruiter readable

Avoid:
- lorem ipsum
- vague filler
- over-technical jargon with no payoff
- inflated claims that can’t be defended

## 8. Visual And UX Rules

The site should stay:
- calm
- editorial
- restrained
- easy to scan

Do not over-stack motion effects.

Prefer:
- one clear motion treatment per element group
- subtle hover color changes
- slight lift
- simple modal open/close behavior

Avoid:
- heavy parallax
- aggressive scaling
- too many competing animations
- flashy gradients that fight the content

## 9. What Is Still Missing

The main missing pieces are content, not structure.

Still needed:
- real portrait / headshot
- real imagery for gallery cards
- real project screenshots or media
- real external project links
- verified metric values
- any case-study depth you want beyond the current summary-level cards

## 10. Common Developer Tasks

### Add Or Edit A Project

1. Update `src/siteData.js`
2. Confirm the tags match the filter buttons
3. Check whether the project should be featured
4. Confirm the modal copy is enough

### Change The Visual Style

1. Edit `src/spa.css`
2. Keep the typography and spacing system consistent
3. Verify mobile breakpoints
4. Verify reduced-motion behavior

### Update The Home Message

1. Update the hero copy in `src/App.jsx`
2. Update the hero metrics if they remain defensible
3. Check whether any CTA labels should change

### Change Contact Behavior

1. Edit the contact form handler in `src/App.jsx`
2. Decide whether the app should still open mailto
3. If introducing a backend, make sure the UI still works without JavaScript failures

## 11. Build / Verification Notes

This handoff does not assume the app has been built and verified after the React migration.

Before treating the site as complete, a developer should:
- install dependencies
- run the dev server
- run a production build
- verify navigation, modal, filter, and contact behavior

## 12. If You Need To Make Bigger Changes

If the next change starts to feel broad, the likely safe expansion path is:
- extract reusable components from `src/App.jsx`
- split the content model further if the site grows
- decide whether the SPA should eventually use router-level structure
- decide whether the contact form should become a real service submission

Do not broaden scope silently.
The site currently works best as a lightweight SPA with one clear content model.


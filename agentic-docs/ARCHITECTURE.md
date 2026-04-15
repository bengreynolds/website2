# Website2 Architecture

This file is intentionally left untracked.
It describes how the current version of the site is built, how the SPA is organized, and what each major subsystem is responsible for.

## 1. Architectural Summary

This repository is a client-rendered React SPA built with Vite.

The architecture is intentionally lightweight:
- one React root
- one main app component
- one centralized content module
- one primary stylesheet
- compatibility redirect pages for old URLs

The architecture is optimized for:
- maintainability
- recruiter-facing presentation
- smooth section navigation
- modest motion
- easy content edits

## 2. Top-Level Structure

### Entry Layer

- [index.html](./index.html)
  - Vite entry
  - mounts the app at `#root`

- [src/main.jsx](./src/main.jsx)
  - React bootstrap
  - imports [src/App.jsx](./src/App.jsx)
  - imports [src/spa.css](./src/spa.css)

### Application Layer

- [src/App.jsx](./src/App.jsx)
  - page shell
  - section rendering
  - state
  - observers
  - modal
  - contact behavior

- [src/siteData.js](./src/siteData.js)
  - content records
  - portfolio structure
  - navigation targets
  - project definitions

### Styling Layer

- [src/spa.css](./src/spa.css)
  - visual system
  - layout system
  - motion system
  - responsive behavior

### Compatibility Layer

- [about.html](./about.html)
- [experience.html](./experience.html)
- [projects.html](./projects.html)
- [gallery.html](./gallery.html)
- [contact.html](./contact.html)

These are redirect stubs so legacy URLs continue to function.

## 3. Rendering Model

The app renders a long single page composed of anchored sections.

Sections:
- home
- overview
- about
- skills
- experience
- projects
- gallery
- contact

The nav uses those ids directly.

There is no client-side router library at the moment.
The site uses hash-based in-page scrolling instead.

## 4. State Management

The app uses React local state only.

Current state variables in [src/App.jsx](./src/App.jsx):
- `menuOpen`
- `activeSection`
- `projectFilter`
- `selectedProject`
- `galleryIndex`
- `contactStatus`

### Why Local State Is Enough

The app is small enough that global state would be unnecessary overhead.

Each piece of state serves one visible purpose:
- menu open/close
- active nav highlighting
- project filtering
- project modal content
- gallery rotation
- contact feedback text

## 5. Hooks And Effects

### `usePrefersReducedMotion`

Reads the browser media query and updates if the user changes the preference.

Used to:
- disable or simplify motion
- stop auto-rotation behavior
- avoid animated scroll behavior when appropriate

### `useRevealAndCounters`

Sets up `IntersectionObserver` for:
- reveal-on-scroll
- count-up stats

Behavior:
- if unsupported, elements are shown without animation
- reveals use a threshold of `0.15`
- counters use a threshold of `0.5`

### `useScrollProgress`

Tracks:
- scroll progress ratio
- whether the header should appear scrolled

This drives the top progress bar and header background state.

### `useSectionSpy`

Observes the major sections and updates `activeSection`.

Also updates the hash when the visible section changes.

This is the mechanism that keeps nav highlighting aligned with scroll position.

## 6. Component Structure

### `SectionHeading`

Reusable section heading block.

Responsibilities:
- eyebrow label
- title
- supporting body text

Used across multiple sections for consistency.

### `ProjectCard`

Clickable button-style card for each project.

Responsibilities:
- show tags
- show summary
- show bullet snippets
- open modal on click

### `ProjectModal`

Overlay dialog for project detail.

Responsibilities:
- display full project info
- close on ESC
- close on backdrop click
- provide contact handoff actions

## 7. Content Flow

The data flow is:

`src/siteData.js` -> `src/App.jsx` -> rendered section components -> CSS presentation

This keeps content and structure separate:
- content lives in one file
- layout and logic live in the app component
- styling lives in the stylesheet

That separation is good enough for the current size of the site.

## 8. Visual System

The SPA stylesheet defines the app’s design language.

### Design Tokens

The stylesheet uses variables for:
- background colors
- surface colors
- text colors
- muted text
- borders
- shadows
- accent colors
- motion timing
- radii
- max width

### Typography

- `Fraunces` is used for headings
- `Inter` is used for body copy
- `IBM Plex Mono` is used for labels, tags, and small UI text

### Layout System

Main layout primitives:
- centered container
- section spacing
- responsive grid cards
- split layout for hero / bio / contact
- timeline layout with a vertical rule
- modal overlay

### Motion System

Motion is intentionally restrained.

Effects currently used:
- reveal / fade-up
- slight card lift
- gallery rotation
- progress bar width animation
- modal overlay

Motion is reduced for users who request reduced motion.

## 9. Responsive Behavior

### Breakpoints

The stylesheet currently includes major breakpoints around:
- `1024px`
- `768px`
- `640px`

### Mobile Changes

On smaller screens:
- nav collapses into a toggle
- grids collapse toward single columns
- contact and hero layouts stack
- buttons and filter controls expand to full width
- timeline shifts left appropriately

The intent is to keep the site readable, not to preserve desktop density on small screens.

## 10. Content Inventory

### Home / Hero

Contains:
- title line
- name
- value proposition
- CTA buttons
- contact metadata
- working-style summary
- quick-jump tiles
- stat cards

### About

Contains:
- portrait placeholder
- role chips
- bio copy
- about cards

### Skills

Contains:
- grouped skill cards
- chip lists per category

### Experience

Contains:
- work timeline
- education cards

### Projects

Contains:
- filter controls
- featured project
- additional projects
- modal detail presentation

### Gallery

Contains:
- rotating hero reel
- selectable visual cards

### Contact

Contains:
- direct links
- collaboration notes
- contact form

## 11. Compatibility Strategy

The old page URLs are preserved through redirect stubs.

Reason:
- external bookmarks still work
- older links don’t break
- the SPA can remain the real implementation while old entry points continue to function

If this compatibility layer becomes unnecessary later, the redirect stubs can be removed.

## 12. Known Technical Constraints

### No Backend

The contact flow does not submit to a server.

### No Router Library

There is no React Router or similar dependency.
The app uses hashes and scroll behavior only.

### No CMS

Content is static in source files.

### No Real Media Yet

The gallery and portrait remain placeholders until real assets are added.

## 13. Why The Architecture Is Shaped This Way

This design was chosen because it is:
- simple to host
- easy to edit
- visually cohesive
- good enough for a portfolio without unnecessary infrastructure

It is also a good fit for a personal portfolio because:
- the content is mostly static
- the interactions are limited and bounded
- the most important task is presentation, not application complexity

## 14. Things To Be Careful Changing

### Section IDs

Changing section ids requires updating:
- nav items
- section spy
- scroll links
- compatibility redirects if you rely on hash navigation

### Motion Hooks

Changing observer thresholds or motion behavior can affect:
- reveal timing
- stat timing
- perceived polish

### Project Data Shape

If you change the project object shape, update:
- cards
- modal
- filters

### Gallery Behavior

Gallery rotation is tied to:
- `galleryIndex`
- the timer effect
- reduced-motion state

## 15. Future Architecture Options

If the site grows, the next rational steps are:

1. Extract reusable components from `src/App.jsx`
2. Split the app into page/section components
3. Introduce a proper router only if separate URLs become necessary again
4. Add a lightweight form service if contact needs real submission handling
5. Add image/media assets for project and gallery sections

Do not jump to heavier architecture unless the content or behavior actually requires it.

## 16. Current State Summary

What is currently solid:
- app shell
- navigation
- motion
- content structure
- presentation quality
- compatibility redirects

What is still provisional:
- visual media
- real project links
- verified metrics
- contact backend

## 17. Working Rule For Contributors

If you need to change the site:
- prefer content edits in `siteData.js`
- prefer layout behavior in `App.jsx`
- prefer styling in `spa.css`
- keep the site calm and recruiter-friendly
- don’t introduce unnecessary abstractions


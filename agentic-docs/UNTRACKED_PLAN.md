# Website2 Developer Handoff

This file is intentionally left untracked.
It is the current-state reference for the website, the implementation status, the intended goals, and the remaining work.

Related docs:
- [DEV_ONBOARDING.md](./DEV_ONBOARDING.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)

## 1. Project Goal

The website is a personal portfolio for Benjamin Reynolds aimed at:
- hiring managers
- HR professionals
- technical recruiters
- collaborators

The site should communicate:
- professionalism
- technical credibility
- systems thinking
- research engineering experience
- clarity and restraint rather than visual noise

The current direction is a polished, recruiter-friendly single-page experience with strong sectioning, lightweight motion, and clear paths to contact.

## 2. Current Website State

The site is now a React single-page application built with Vite.

From a user perspective, it behaves as one site with anchored sections:
- Home
- About
- Skills
- Experience
- Projects
- Gallery
- Contact

The old multi-page HTML files still exist for compatibility, but they now redirect into the SPA hash sections.

That means:
- `about.html` opens the About section
- `experience.html` opens the Experience section
- `projects.html` opens the Projects section
- `gallery.html` opens the Gallery section
- `contact.html` opens the Contact section

The SPA is the source of truth.

## 3. High-Level Implementation Summary

The site now includes:
- a React app shell
- section-based client navigation
- sticky frosted header
- scroll progress tracking
- section spy / active nav highlighting
- reveal-on-scroll animation
- count-up stats
- project filtering
- project detail modal
- gallery feature reel
- mailto-backed contact form
- reduced-motion fallback
- responsive mobile navigation

This is a real SPA re-platforming, not just styling around the old static pages.

## 4. Technology Stack

### Runtime

- React 18
- ReactDOM
- Vite

### Source Files

- [index.html](./index.html)
- [src/main.jsx](./src/main.jsx)
- [src/App.jsx](./src/App.jsx)
- [src/siteData.js](./src/siteData.js)
- [src/spa.css](./src/spa.css)

### Build / Tooling

- [package.json](./package.json)
- [vite.config.js](./vite.config.js)

### Compatibility Assets

- [public/Benjamin_Reynolds_Updated_CV_Fall2025.docx](./public/Benjamin_Reynolds_Updated_CV_Fall2025.docx)

### Legacy Files

These exist in the repo but are no longer the active implementation:
- [script.js](./script.js)
- [styles.css](./styles.css)

Treat them as stale unless you intentionally want to reuse or delete them.

## 5. How the App Is Structured

### App Shell

The React app is mounted from [src/main.jsx](./src/main.jsx) into the `#root` element in [index.html](./index.html).

`src/main.jsx` imports:
- the app component
- the SPA stylesheet

### Content Model

Content is centralized in [src/siteData.js](./src/siteData.js).

That file currently stores:
- navigation labels
- hero stats
- about cards
- skill groups
- experience entries
- education entries
- project data
- gallery data
- contact links

The point of this file is to keep the app component focused on presentation and interaction, while keeping the portfolio content in one easy-to-edit place.

### App Component

[src/App.jsx](./src/App.jsx) is the main application file.

It owns:
- all section rendering
- navigation behavior
- project modal behavior
- project filtering
- gallery reel state
- contact form submission behavior
- hash / section synchronization
- active section tracking

## 6. Runtime Behavior

### Navigation

The nav is section-based rather than page-based.

Behavior:
- clicking a nav item updates the hash
- the page scrolls to the target section
- the active nav item updates based on viewport position
- the mobile menu closes after navigation

The nav has:
- desktop layout
- mobile toggle
- sticky positioning
- frosted glass background
- active state underline

### Scroll and Motion

The app uses multiple lightweight scroll-linked behaviors:
- a progress bar at the top
- reveal-on-scroll animation on section elements
- counter animation for stat cards
- section spy to keep the nav state synced

Motion is reduced when `prefers-reduced-motion` is enabled.

### Project Filtering

The Projects section has filter buttons for:
- All
- Automation
- Data
- Hardware
- Software

When a filter is selected:
- the project list updates in place
- the featured project is preserved if it matches the current filter
- the selected project modal remains consistent with the visible list

### Project Detail Modal

Projects open in a modal rather than a new page.

The modal supports:
- click to open from a project card
- ESC to close
- backdrop click to close
- contact-action handoff

The modal is currently text-heavy and designed to be expanded later with visuals or links.

### Gallery Feature Reel

The Gallery section has:
- a large rotating feature panel
- selectable gallery cards
- auto-rotation on a timer when motion is allowed

The gallery currently uses abstract visual treatments rather than actual photography or project imagery.

### Contact Form

The contact form is mailto-based.

Behavior:
- user enters name, email, and message
- submit opens an email client with a prefilled draft
- the app updates a status message after the draft action

There is no backend form submission in the current implementation.

## 7. Section-by-Section Content

### Home

The home section contains:
- professional title line
- name
- value proposition
- primary CTAs
- contact metadata
- working-style panel
- quick-jump tiles to the rest of the site
- hero metrics section

The home section is intended to act as the first conversion surface.

### About

The About section contains:
- stylized portrait placeholder
- role chips
- first-person bio
- supporting about cards

The portrait is intentionally a placeholder treatment for now.

### Skills

The Skills section contains three grouped categories:
- languages and scripting
- platforms and tools
- operations and leadership

This section is intentionally compact and recruiter-readable, not a giant badge grid.

### Experience

The Experience section contains:
- work history timeline
- role title
- organization
- dates
- bullet highlights
- education cards below the timeline

This is the strongest factual section of the site.

### Projects

The Projects section contains:
- filter controls
- featured project card
- additional project cards
- click-to-open modal detail view

This section is the best place to add future case studies, screenshots, demo links, or GitHub references.

### Gallery

The Gallery section contains:
- feature reel hero panel
- selectable gallery cards
- abstract gradient imagery

This section currently serves a branding and visual role more than a photographic documentation role.

### Contact

The Contact section contains:
- direct email
- phone
- LinkedIn
- collaboration notes
- mailto form

The contact form is intentionally backend-free at the moment.

## 8. Design System

### Typography

- headings: `Fraunces`
- body: `Inter`
- labels and compact UI text: `IBM Plex Mono`

### Visual Tone

- warm light theme
- editorial / paper-like background
- subtle texture grid
- soft shadows
- frosted surfaces
- restrained accent usage

### Layout

- centered max-width container
- section-based vertical rhythm
- responsive grids
- stacked mobile layout below the smaller breakpoints

### Motion Principles

- motion is short and calm
- infinite motion is limited to ambient or reel elements
- animation is disabled or simplified for reduced-motion users
- interaction states use color, border, and slight lift rather than large movement

## 9. Accessibility / UX Notes

Implemented:
- visible focus outlines
- semantic headings
- keyboard-close modal support
- escape-key modal support
- reduced-motion fallback
- touch-friendly button sizing
- accessible section navigation

Potential follow-up improvements:
- add stronger modal focus trapping if the modal becomes more complex
- add more descriptive alt text once real media is added
- tighten keyboard behavior around the nav toggle if additional nav content is introduced

## 10. File-by-File Notes

### [index.html](./index.html)

Minimal Vite entry file that mounts the SPA.

### [src/main.jsx](./src/main.jsx)

Bootstraps React and imports the SPA stylesheet.

### [src/App.jsx](./src/App.jsx)

Main application layout and behavior.

### [src/siteData.js](./src/siteData.js)

Portfolio content source.

### [src/spa.css](./src/spa.css)

Current authoritative stylesheet for the app.

### [about.html](./about.html), [experience.html](./experience.html), [projects.html](./projects.html), [gallery.html](./gallery.html), [contact.html](./contact.html)

Legacy compatibility redirects into the SPA.

### [public/Benjamin_Reynolds_Updated_CV_Fall2025.docx](./public/Benjamin_Reynolds_Updated_CV_Fall2025.docx)

Served from `public` so Vite exposes it at the root URL.

### [script.js](./script.js) and [styles.css](./styles.css)

Legacy static-site implementation files. They are not wired into the current app.

## 11. Current Content Quality

What is already good:
- overall site voice is coherent
- experience content is credible and specific
- recruiter-facing structure is now clear
- motion is restrained enough for professional use
- section hierarchy is easy to follow

What still needs real content:
- portrait / headshot
- real gallery imagery
- real project screenshots
- real live links or GitHub links
- confirmed numeric metrics
- potentially richer case-study copy for projects

## 12. Known Technical Gaps

- The build and dependency install have not been verified in this stage
- Legacy files still remain in the repo
- The gallery and project sections are stronger structurally than they are visually or content-wise
- The contact flow still depends on the user’s mail client
- There is no backend or CMS

## 13. Recommendations for the Next Developer

Read in this order:
1. [src/siteData.js](./src/siteData.js)
2. [src/App.jsx](./src/App.jsx)
3. [src/spa.css](./src/spa.css)
4. [index.html](./index.html)

Then decide which of these to do first:
- verify the build
- remove stale legacy files
- replace placeholder visuals
- replace illustrative stats with factual ones
- add deeper project detail
- integrate a real form service if needed

## 14. Current Plan

Completed:
- migrated to React SPA
- preserved old URLs through redirects
- centralized content
- added shared motion and interaction patterns
- added project filtering and modal detail
- added gallery rotation
- added contact fallback behavior

In progress or still pending:
- build verification
- real imagery
- project links
- metric validation
- optional cleanup of legacy static files

## 15. Assumptions

- The site should remain a single-page experience from the user’s perspective
- The portfolio should stay lightweight and easy to host
- The primary goal is professional presentation rather than experimental UI
- Content should stay editable without introducing unnecessary tooling

## 16. Handoff Summary

If a new developer takes over, they should understand the site as:
- a React/Vite SPA
- driven by one main component and one data file
- structured around anchor sections rather than multiple pages
- already functional and presentable
- still needing real content assets and verification work before it is truly complete

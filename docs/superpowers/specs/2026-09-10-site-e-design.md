# Site E design

Branch `design/site-e`, forked from `main`. Supersedes the four exploration
branches: E is the build, they were the comparison.

## 1. Provenance

E is not a fifth direction. It is D's type and spacing system carrying A's two
best sections, with B's router added so a project can have its own page.

| Piece | From | Treatment |
| --- | --- | --- |
| Tokens, type, palette, spacing, section rhythm | D `design/signal-path` | unchanged |
| Hero | D | figure removed, CTAs retargeted |
| Experience, education | D | unchanged |
| Skills section | D's signal path | rebuilt as general skills, no project ties |
| Selected work grid | A `design/contact-sheet` | simplified, see 4.3 |
| Capabilities | A | unchanged |
| Router | B `design/systems-map` | `src/router.jsx` lifted as-is |
| Everything else in B and C | - | discarded |

Fork D rather than A because the thing being kept from D is the token layer
itself. Moving two sections onto D is a small diff; moving D's tokens into A
would mean retuning A's whole stylesheet.

## 2. Decisions locked with the owner

1. Skill imagery: free-license stills only, one per skill, credited. No GIFs.
2. The four projects with no sprite stay typographic. That mix is what makes
   the grid asymmetric, so placement shuffling only applies to plated cells.
3. Previews play on hover or focus. Poster until intent, sheet preloaded
   before the class lands.
4. Posters become the final frame for the three assembly sequences only;
   cyclic demos keep frame 0, because a cycle ends where it began.
5. Project pages draw on all six GitHub repos, private included, extracted
   freely. Credentials, participant data and collaborator personal details
   stay out of published copy regardless.
6. Project page depth defaults to expansion from existing plus repo-derived
   facts. The owner reviews later, so a wrong emphasis is recoverable.

## 3. Routes

Hand-rolled History API router from B. `vercel.json` already rewrites every
path to `/index.html`, so deep links resolve.

| Route | Content |
| --- | --- |
| `/` | hero, skills, selected work, experience, capabilities, contact |
| `/work/<project-id>` | one page per project, existing ids |
| unknown | renders `/`, URL left alone so a bad link stays visible |

Every link is a real `<a href>`. Only unmodified left clicks are intercepted,
so middle-click and Cmd-click still open tabs. Each navigation retitles the
document, resets scroll instantly (not smoothly), and moves focus to `<main>`.

## 4. Home route

Order: hero, skills, selected work, experience, capabilities, contact. Skills
sits before the work so the page answers "who is this" before "what did he
build". Reversible in one move if the owner prefers work first.

### 4.1 Hero

D's hero unchanged in structure: role label, name, statement, two CTAs, facts
column. No figure and no animation anywhere in this section. `spotlightId` and
the featured-system row are deleted, not hidden.

### 4.2 Skills

The signal path, rebuilt. Stages become skills with no relationship to any
project. Proposed set, for the owner to edit before build:

| n | Skill |
| --- | --- |
| 01 | Software development: firmware, desktop interfaces, data pipelines |
| 02 | Closed-loop automation |
| 03 | CAD and 3D modeling |
| 04 | Electronics and PCB design |
| 05 | Data acquisition and instrumentation |
| 06 | Machine learning and computer vision |
| 07 | Statistical analysis |
| 08 | Deployment, documentation and support |

Eight is likely two too many for a scroll narrative. Recommended fold to six:
04 into 05, and 08 into 01.

Each skill carries a number, title, two or three sentences, and one image.
Content is written fresh for this section and is about competence, not about a
specific build, so it cites the CV and the existing copy rather than a project.

Imagery: one still per skill in `public/skills/<nn>-<slug>.webp`, sourced from
a free-license library. `src/skillCredits.js` records file, source, author,
licence and URL per image, rendered as a small credits line at the foot of the
section. Slots render a labelled placeholder until filled, so the section is
shippable with images missing.

Keeps D's sticky-stage mechanics: `view-timeline-name` on the non-sticky
track, transform-only reveals, pins gated on width, height and motion
preference together so `reduce` resolves to plain stacked sections.

### 4.3 Selected work

A's tile grid with four changes.

1. Every panel is number, title, stack. The pulled metrics and the `stat` grid
   area are removed. The `featured` flag stops affecting presentation.
2. One type scale for all nine panels: `.tile-num` at `--step-3`,
   `.tile-title` at `--step-2`. Today the art panels use `0.75rem` and
   `--step-1`, and the two typographic panels differ from each other because
   one is flagged `featured`. `--step-2` is chosen because the large number
   needs the larger title beside it.
3. Plate placement is randomized once at build and frozen. A seeded script
   writes a `tilePlacement` field per plated project into `siteData.js`, one
   of `plate-top`, `plate-bottom`, `plate-left`, `plate-right`. Frozen in the
   data means stable across loads, visible in the diff, and re-rollable by
   rerunning the script with a new seed.
4. Hard constraint: the plate stays square in every placement. The generated
   sprite CSS computes `background-size` as a percentage of a square cell, so
   a non-square plate draws every sprite stretched.

Clicking a panel navigates to `/work/<id>`. The inline case panel A used is
removed; the project page replaces it.

### 4.4 Experience, capabilities, contact

Experience and education: D's markup unchanged. Capabilities: A's three lead
statements plus the six-group tool grid, unchanged. Contact keeps the single
resume download, which stays the only route to the file.

## 5. Project route

Full-width demo first, which is the reason these pages exist: the home grid
affords a plated cell about 480px, and a 520px sprite cell cannot hold a
readable filename. Then the technical body, then navigation.

Sections: demo or figure, problem, approach, implementation, stack and role,
deep dive, then previous / index / next.

Back to home is deliberately overserved: the masthead wordmark, a
`Selected work` link above the title, the rail, and the index link between
previous and next. The bottom of a project page is never a dead end.

The NWB Forge walkthrough (`PipelineDemo`) and the sprite switcher both live
here, at the size they were built for.

## 6. Rail

Dynamic, replacing D's manual toggle.

- Collapsed to a thin strip by default.
- The group containing the current section auto-expands; others collapse.
- Current item marked with `aria-current`.
- Hover and focus expand it; a pin toggle locks it open.
- Present on project routes as well as the home route.
- Disclosure on mobile, not a fixed strip.

Driven by IntersectionObserver. No scroll listener: `AGENTS.md` bans them, and
the one documented exception is the wheel scrub on a rig figure.

## 7. Poster regeneration

`scripts/build_demo_sprite.py` writes the poster from frame 0. Line 8 of that
file says so, and it saves `first`. Every panel therefore rests on the unbuilt
state, and because the sheet is never attached under `prefers-reduced-motion`,
the poster is the entire reduced-motion rendering. A visitor with motion off
currently sees bare corner legs and calls it the rig.

Fix without the original captures: every grid is exact, so the last cell is
always the final real frame.

| Sprite | Frames | Grid | New poster |
| --- | --- | --- | --- |
| `buildup` | 100 | 10x10 | last cell |
| `prosthetic-build` | 144 | 12x12 | last cell |
| `lickrevolver-build` | 81 | 9x9 | last cell |
| `pellet`, `pellet-close`, `lickrevolver-trial`, `lickrevolver-trial-close`, `lickrevolver-ui` | 81 | 9x9 | frame 0 kept |
| `tunnel`, `pcb` | 64 | 8x8 | frame 0 kept |
| `prosthetic-function` | 169 | 13x13 | frame 0 kept |

Add a `--poster-frame first|last|<n>` argument to the script so the choice is
recorded in the tool rather than applied by hand, and regenerate the three
assembly posters by cropping the existing sheets with Pillow.

## 8. Repo extraction

| Project | Repo | Visibility |
| --- | --- | --- |
| Neuroscience Data Standardization Platform | `nwbforge` | public |
| Reach-to-Grasp Motion Analysis Suite | `ReachX` | private |
| Autonomous Training Rig, reachAQ | `reach-training` | private |
| Neonatal Hypoxia Chamber | `Neonatal_rodent_hypoxia` | public |
| Multi-Solution Lickometer | `kinnamon-lick` | public |
| Deployment Toolkit | `sm-manager`, `gitControl` | public, private |

Read README, module layout, entry points, configuration and dependencies.
Prefer facts a reader could verify against a file over narrative. Three
projects have no repo and keep the copy they have.

## 9. Constraints carried

- Both themes. `--plate` light in both, so colour-accurate near-black CAD
  renders survive a dark ground.
- Transform only on scroll-driven timelines. A `view()` timeline holds an
  element at its start state when it cannot advance, so an opacity keyframe
  can leave text permanently invisible.
- `animation-delay` declared only inside `prefers-reduced-motion:
  no-preference`.
- Sprite sheets are 0.9 to 2.2MB and attach on intent only, preloaded before
  the class lands so the swap is a cache hit.
- Accent means interactive.
- One `h1` per route, skip link, focus-visible rings, AA contrast.
- One resume link, the download at the end.

## 10. Build order

Each phase ends at a verification gate: `npm run build`, then the audit sweep
at 1440 / 900 / 390 across both themes plus reduced motion, which checks
horizontal overflow, elements past the right edge, text left invisible by a
stalled timeline, stray transforms, `h1` count, skip link and stray dashes.

1. Fork D, strip the project-coupled path content, delete the spotlight row.
2. Poster regeneration and the `--poster-frame` argument.
3. Transplant A's work grid; simplify to number, title, stack; unify the type
   scale; add seeded placement.
4. Transplant A's capabilities.
5. Router in, project pages built, home grid linked to them.
6. Skills section content, then imagery and credits.
7. Dynamic rail.
8. Repo extraction into the deep-dive sections.
9. Full sweep, both routes, every demo, keyboard paths.

## 11. Open items

- Skill list needs the owner's edit before phase 6, including whether to fold
  to six.
- Section order puts skills before work; one-line change if wrong.
- Three projects have no repo, so their pages stay at current depth.

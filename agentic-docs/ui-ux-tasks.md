# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

# ═══════════════════════════════════════════════════
# PERSONAL PORTFOLIO WEBSITE — CLAUDE CODE PROMPT
# Goal: Professionalize & build out a partially-existing
# personal site for HR / professional audiences
# ═══════════════════════════════════════════════════

## CONTEXT & EXISTING STATE
Project: Personal portfolio website (partially built)
Audience: Hiring managers, HR professionals, technical recruiters, collaborators
Goal: A polished, impressive, conversion-optimized personal brand site
Stack: [INSERT YOUR STACK — e.g. React + Vite, Next.js, plain HTML/CSS/JS]
Existing files: [LIST YOUR EXISTING FILES — e.g. index.html, styles.css, about.js]

First, AUDIT the existing codebase:
- Identify what sections/components already exist
- Note what is incomplete, missing, or poorly styled
- Do NOT rewrite things that already work well
- Flag anything broken, inconsistent, or inaccessible

## REQUIRED SECTIONS TO BUILD OR POLISH

1. HERO / LANDING
   - Full-viewport hero with name, title, and a one-liner value proposition
   - Animated entrance: staggered fade-in for name → title → CTA (CSS keyframes, no JS lib needed)
   - Smooth scroll CTA button ("View My Work", "See Projects", etc.)
   - Subtle background: either a dark muted gradient, geometric SVG pattern, or soft noise texture
   - DO NOT use stock photos or generic gradients

2. ABOUT / BIO
   - 2-column layout: photo/avatar left, bio + quick stats right
   - Quick stats row: years of experience, # of projects, skills count, etc.
   - Animate stats counting up when they scroll into view (IntersectionObserver)
   - Soft personality — write in first person, professional but human

3. SKILLS & TECH STACK
   - Visual grid of skill badges (icon + label)
   - Group by category: Languages, Frameworks, Tools, Soft Skills
   - Hover micro-interaction on each badge (subtle lift + color fill)
   - Animated skill bar OR proficiency dots — choose whichever fits aesthetic

4. WORK HISTORY / EXPERIENCE TIMELINE
   - Vertical timeline layout with company, role, dates, and 2-3 bullet highlights
   - Animate timeline line drawing in on scroll (CSS clip-path or SVG stroke-dashoffset)
   - Each card slides in from alternating sides on scroll
   - Use IntersectionObserver with threshold: 0.15 for all scroll-triggered animations

5. PROJECTS SHOWCASE
   - Card grid (2-3 cols desktop, 1 col mobile) with thumbnail, title, tech tags, short desc
   - Hover: card lifts with a soft shadow, thumbnail zooms slightly (transform: scale)
   - Filter tabs by technology or category (vanilla JS toggling, no framework needed)
   - Each card links to live demo and/or GitHub — open in new tab
   - "Featured" project gets a large hero card treatment at top

6. CONTACT / CTA SECTION
   - Clean contact form: name, email, message (no backend needed — mailto: fallback or Formspree)
   - Social links row: GitHub, LinkedIn, email, optionally X/Twitter
   - Subtle gradient or dark background to differentiate from page sections
   - Animated underline on hover for links

7. NAVIGATION
   - Sticky top nav with blur/frosted glass effect (backdrop-filter: blur)
   - Active section highlighting as user scrolls (IntersectionObserver on sections)
   - Hamburger menu on mobile — animated to X on open
   - Smooth scroll to section on nav click (scroll-behavior: smooth)

## DESIGN SYSTEM — APPLY CONSISTENTLY

Typography:
   - Display/headings: a distinctive serif or geometric sans (e.g. Fraunces, Syne, Cabinet Grotesk)
   - Body: clean, readable (e.g. DM Sans, Outfit, General Sans)
   - Mono: for code/tags/tech labels (e.g. JetBrains Mono, DM Mono)
   - Scale: 64px hero → 40px h1 → 28px h2 → 20px h3 → 16px body → 13px caption

Color palette:
   - Choose ONE dominant approach and stick to it:
     Option A: Dark mode — near-black bg (#0A0A0F), off-white text, one vivid accent (electric blue, teal, or lime)
     Option B: Light + ink — warm white bg, near-black ink, muted dusty accent (slate, sage, copper)
   - Use CSS custom properties (--color-bg, --color-text, --color-accent, --color-muted)
   - Maintain 4.5:1 contrast ratio minimum for all body text

Spacing:
   - Section padding: 80px top/bottom desktop, 48px mobile
   - Container max-width: 1100px, centered
   - Consistent 8px grid for all component spacing

Motion principles:
   - Duration: 300-500ms for UI interactions, 600-900ms for entrance animations
   - Easing: cubic-bezier(0.16, 1, 0.3, 1) for entrances, ease-out for exits
   - ALWAYS respect prefers-reduced-motion — wrap all animations:
     @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
   - Stagger sibling elements 80-120ms apart

## SPECIFIC ANIMATION IMPLEMENTATIONS

Implement these exactly:

Scroll reveal (use for all major sections):
   const observer = new IntersectionObserver((entries) => {
     entries.forEach(el => {
       if (el.isIntersecting) el.target.classList.add('visible');
     });
   }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
   document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

   CSS: .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

Counting stats animation:
   Trigger when stat enters viewport. Count from 0 to target value over 1200ms using requestAnimationFrame.

Timeline line draw:
   SVG vertical line with stroke-dashoffset animating to 0 on scroll. Use CSS animation triggered by .visible class.

Nav frosted glass:
   backdrop-filter: blur(12px) saturate(180%);
   background: rgba(255,255,255,0.75); /* or dark equivalent */
   border-bottom: 1px solid rgba(255,255,255,0.15);

## RESPONSIVENESS REQUIREMENTS
- Mobile-first CSS with breakpoints at 640px, 768px, 1024px, 1280px
- All grids collapse to single column on mobile
- Touch targets minimum 44x44px
- Test hamburger menu, project filter tabs, and timeline on 375px viewport

## PERFORMANCE & QUALITY GATES
- All images: use  and provide width/height attributes
- Fonts: preload display fonts; use font-display: swap
- No jQuery, no heavy libraries — vanilla JS or your existing framework only
- Each animation must degrade gracefully if JS is disabled
- Final Lighthouse score target: Performance 90+, Accessibility 95+, Best Practices 95+

## OUTPUT EXPECTATIONS
After completing each section, provide:
1. A brief summary of what was built/changed
2. Any design decisions made and why
3. Anything that needs REAL content from me (photos, project descriptions, copy)
4. Any follow-up improvements or stretch goals

Ask me clarifying questions before starting if my stack is ambiguous.
Do NOT invent placeholder copy that sounds like lorem ipsum — use [PLACEHOLDER: description] format instead.

## UPGRADE 11 — React.memo, useCallback, and lazy section imports
# Files: src/App.jsx, src/siteData.js
# Current: everything in one App.jsx file — appropriate for now
# This is prep work before the file gets much larger

TASK: Apply targeted performance improvements to App.jsx without
prematurely restructuring the whole file.

Step 1 — Memoize ProjectCard:
  Wrap with React.memo() — it re-renders on every filter change unnecessarily.
  const ProjectCard = React.memo(function ProjectCard({ project, onOpen }) { ... });

Step 2 — Stabilize callback refs:
  Wrap modal open/close handlers in useCallback:
  const openProject  = useCallback((p) => setSelectedProject(p), []);
  const closeProject = useCallback(() => setSelectedProject(null), []);

Step 3 — Lazy-load the Gallery section:
  Gallery is below the fold and currently loads with the initial bundle.
  const GallerySection = React.lazy(() => import('./sections/GallerySection'));
  Wrap in <Suspense fallback={<div className="skeleton" style={{height:'400px'}}/>}>
  (Extract gallery JSX into a new src/sections/GallerySection.jsx file first.)

Step 4 — useMemo for filtered projects:
  const filteredProjects = useMemo(
    () => projects.filter(p => filter === 'All' || p.tags.includes(filter)),
    [filter]
  );

Step 5 — Check bundle size before and after:
  npm run build -- --report (or add rollup-plugin-visualizer to vite.config.js)
  Target: main JS chunk under 150kb gzipped.

Do NOT extract all sections into separate files yet — only Gallery.
The monolithic App.jsx is acceptable at the current content volume.

## UPGRADE 12 — Dark mode toggle with system preference sync
# Files: src/App.jsx (nav), src/spa.css (:root vars + [data-theme="dark"])
# Current: warm light theme only
# This is a high-signal feature for technical audiences

TASK: Add a light/dark mode toggle to the nav. Persist preference to
localStorage. Sync with system prefers-color-scheme on first visit.

Step 1 — Detect and initialize:
  const getInitialTheme = () => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState(getInitialTheme);

Step 2 — Apply to document:
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

Step 3 — In spa.css, duplicate your color token block under:
  [data-theme="dark"] {
    --bg: #111010;
    --surface: #1c1b1a;
    --text: #ede8e0;
    --text-muted: #8a857c;
    --border: rgba(255,255,255,0.10);
    --accent: [your accent, slightly brighter for dark bg];
  }

  Keep Fraunces/Inter — they both read beautifully in dark mode.
  The warm dark bg (#111010) aligns with your existing paper-like warmth.

Step 4 — Toggle button in nav:
  Sun/Moon SVG icon (inline — no icon library needed).
  Aria-label: "Switch to dark mode" / "Switch to light mode"
  Animate icon swap with CSS opacity transition (150ms).

Step 5 — Listen for system preference changes:
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
    });

The dark theme should feel like a premium evening reading mode — warm dark,
not cold black. Match the editorial restraint of the light version.


import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  aboutCards,
  contactLinks,
  contactPrompt,
  education,
  experience,
  heroProofPoints,
  heroStatement,
  navigation,
  projects,
  resumeHref,
  socialProofItems,
  skillGroups,
} from "./siteData";

const sectionIds = navigation.map((item) => item.id);
const THEME_STORAGE_KEY = "theme";
const GallerySection = lazy(() => import("./sections/GallerySection"));

function readStoredTheme() {
  try {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function getInitialTheme() {
  const storedTheme = readStoredTheme();
  if (storedTheme) return storedTheme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function useRevealAndCounters() {
  useEffect(() => {
    const animateCount = (el) => {
      const target = Number(el.dataset.count || 0);
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * progress).toString();
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      document.querySelectorAll("[data-count]").forEach((el) => animateCount(el));
      return undefined;
    }

    const observedReveals = new WeakSet();
    const observedCounts = new WeakSet();

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    const observeReveal = (element) => {
      if (!(element instanceof Element) || observedReveals.has(element)) return;
      observedReveals.add(element);
      revealObserver.observe(element);
    };

    const observeCount = (element) => {
      if (!(element instanceof Element) || observedCounts.has(element)) return;
      observedCounts.add(element);
      countObserver.observe(element);
    };

    const scan = (root = document) => {
      if (root instanceof Element) {
        if (root.matches(".reveal")) observeReveal(root);
        if (root.matches("[data-count]")) observeCount(root);
      }
      root.querySelectorAll?.(".reveal").forEach(observeReveal);
      root.querySelectorAll?.("[data-count]").forEach(observeCount);
    };

    scan();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          scan(node);
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      revealObserver.disconnect();
      countObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const value = totalHeight > 0 ? Math.min(scrollTop / totalHeight, 1) : 0;
      setProgress(value);
      setHeaderScrolled(scrollTop > 24);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { progress, headerScrolled };
}

function useSectionSpy(setActiveSection) {
  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          setActiveSection(id);
          if (window.location.hash !== `#${id}`) {
            window.history.replaceState(null, "", `#${id}`);
          }
        });
      },
      { threshold: 0.35, rootMargin: "-14% 0px -52% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [setActiveSection]);
}

function SectionHeading({ eyebrow, title, body, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "is-centered" : ""} reveal`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

const ProjectCard = memo(function ProjectCard({ project, onOpen }) {
  return (
    <button
      type="button"
      className={`project-card reveal ${project.featured ? "is-featured" : ""}`}
      onClick={() => onOpen(project)}
    >
      <div className="project-card-top">
        <div className="tag-row">
          {project.featured ? <span className="tag">Featured</span> : null}
          <span className="tag">Case study</span>
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <span className="project-cue">View details</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="project-snapshot">
        <div>
          <span>Problem</span>
          <strong>{project.challenge || "[PLACEHOLDER: project problem]"}</strong>
        </div>
        <div>
          <span>Result</span>
          <strong>{project.result || "[PLACEHOLDER: project result]"}</strong>
        </div>
      </div>
      <ul>
        {project.bullets.slice(0, project.featured ? 3 : 2).map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </button>
  );
});

function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!project) return null;

  const goToContact = (event) => {
    event.preventDefault();
    onClose();
    const contact = document.getElementById("contact");
    if (contact) {
      contact.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
      window.history.pushState(null, "", "#contact");
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close project details">
          Close
        </button>
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <h3 id="project-title">{project.title}</h3>
        <p>{project.summary}</p>
        <div className="case-study-grid">
          <article>
            <span>Problem</span>
            <p>{project.challenge || "[PLACEHOLDER: project problem]"}</p>
          </article>
          <article>
            <span>Constraints</span>
            <p>{project.constraints || "[PLACEHOLDER: project constraints]"}</p>
          </article>
          <article>
            <span>Approach</span>
            <p>{project.approach || "[PLACEHOLDER: project approach]"}</p>
          </article>
          <article>
            <span>Result</span>
            <p>{project.result || "[PLACEHOLDER: project result]"}</p>
          </article>
          <article>
            <span>Role</span>
            <p>{project.role || "[PLACEHOLDER: your role on this project]"}</p>
          </article>
        </div>
        <ul>
          {project.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <a className="button" href="#contact" onClick={goToContact}>
            Discuss this project
          </a>
          <a className="button ghost" href="mailto:Benjamin.g.reynolds@ucdenver.edu">
            Email details
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(projects.find((project) => project.featured) || projects[0] || null);
  const [contactStatus, setContactStatus] = useState("mailto");
  const [theme, setTheme] = useState(getInitialTheme);
  const reducedMotion = usePrefersReducedMotion();
  const { progress, headerScrolled } = useScrollProgress();

  useRevealAndCounters();
  useSectionSpy(setActiveSection);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.add("theme-spa");
    return () => document.body.classList.remove("theme-spa");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("motion-ready", !reducedMotion);
    return () => {
      document.body.classList.remove("motion-ready");
    };
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = (event) => {
      if (readStoredTheme()) return;
      setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const initialSection = hash || "home";
    setActiveSection(initialSection);
    if (!hash) return undefined;
    const target = document.getElementById(hash);
    if (!target) return undefined;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
    return undefined;
  }, [reducedMotion]);

  useEffect(() => {
    if (!selectedProject) return;
    const filtered = projectFilter === "all" ? projects : projects.filter((project) => project.tags.includes(projectFilter));
    if (!filtered.length) return;
    if (!filtered.some((project) => project.id === selectedProject.id)) {
      setSelectedProject(filtered[0]);
    }
  }, [projectFilter, selectedProject]);

  useEffect(() => {
    const onClick = (event) => {
      if (!menuOpen) return;
      const shell = document.querySelector(".site-header");
      if (shell && !shell.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  const filteredProjects = useMemo(() => {
    return projectFilter === "all"
      ? projects
      : projects.filter((project) => project.tags.includes(projectFilter));
  }, [projectFilter, projects]);

  const goToSection = useCallback((id) => {
    const target = document.getElementById(id);
    if (!target) return;
    setMenuOpen(false);
    setActiveSection(id);
    window.history.pushState(null, "", `#${id}`);
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }, [reducedMotion]);

  const openProject = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        /* ignore storage failures */
      }
      return nextTheme;
    });
  }, []);

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    setContactStatus("draft");
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || "a visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name || "Not provided"}`,
        `Email: ${email || "Not provided"}`,
        "",
        message || "No message provided.",
      ].join("\n")
    );
    window.location.href = `mailto:Benjamin.g.reynolds@ucdenver.edu?subject=${subject}&body=${body}`;
  };

  return (
    <div className="spa-shell">
      <div className="scroll-progress" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>

      <header className={`site-header ${headerScrolled ? "is-scrolled" : ""}`}>
        <div className="container nav-shell">
          <div className="brand" aria-label="Benjamin Reynolds">
            BR
          </div>
          <a className="button ghost nav-resume" href={resumeHref}>
            Resume
          </a>
          <button
            type="button"
            className="theme-toggle"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            onClick={toggleTheme}
          >
            <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 1.8v3.4M12 18.8v3.4M4.2 4.2l2.4 2.4M17.4 17.4l2.4 2.4M1.8 12h3.4M18.8 12h3.4M4.2 19.8l2.4-2.4M17.4 6.6l2.4-2.4" />
              </svg>
            </span>
            <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M18.5 14.8A8 8 0 0 1 9.2 5.5 8.4 8.4 0 1 0 18.5 14.8Z" />
              </svg>
            </span>
          </button>
          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={menuOpen ? "is-open" : ""}>
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "is-active" : ""}
                aria-current={activeSection === item.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  goToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a className="button ghost nav-cta" href="#contact" onClick={(event) => {
            event.preventDefault();
            goToSection("contact");
          }}>
            Let's talk
          </a>
        </div>
      </header>

      <main>
        <section id="home" className="hero section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow reveal" style={{ "--delay": "0.05s" }}>
                Research Engineer | Automation, Lab Systems, and Software
              </p>
              <h1 className="reveal" style={{ "--delay": "0.15s" }}>
                Benjamin Reynolds
              </h1>
              <p className="lead reveal" style={{ "--delay": "0.25s" }}>
                {heroStatement}
              </p>
              <div className="hero-actions reveal" style={{ "--delay": "0.35s" }}>
                <a className="button" href="#projects" onClick={(event) => { event.preventDefault(); goToSection("projects"); }}>
                  View case studies
                </a>
                <a className="button ghost" href="#about" onClick={(event) => { event.preventDefault(); goToSection("about"); }}>
                  View profile
                </a>
                <a className="button ghost" href={resumeHref}>
                  Download resume
                </a>
              </div>
              <div className="hero-meta reveal" style={{ "--delay": "0.45s" }}>
                <span>Denver, CO</span>
                <span><a href="tel:+13035472170">303-547-2170</a></span>
                <span><a href="mailto:Benjamin.g.reynolds@ucdenver.edu">Benjamin.g.reynolds@ucdenver.edu</a></span>
              </div>
              <div className="hero-tiles reveal" style={{ "--delay": "0.5s" }}>
                <a href="#experience" onClick={(event) => { event.preventDefault(); goToSection("experience"); }}>
                  Experience
                </a>
                <a href="#gallery" onClick={(event) => { event.preventDefault(); goToSection("gallery"); }}>
                  Gallery
                </a>
                <a href="#contact" onClick={(event) => { event.preventDefault(); goToSection("contact"); }}>
                  Contact
                </a>
              </div>
            </div>

            <aside className="hero-panel reveal" style={{ "--delay": "0.2s" }}>
              <div className="panel-header">
                <span className="tag">Working style</span>
                <span className="panel-note">Systems-first, steady iteration</span>
              </div>
              <ul>
                <li>Clear documentation and repeatable workflows.</li>
                <li>Hands-on prototyping with practical constraints.</li>
                <li>Cross-team coordination and stakeholder clarity.</li>
              </ul>
              <div className="panel-highlight">
                Open to roles centered on automation, lab infrastructure, and applied R&D.
              </div>
            </aside>
          </div>
        </section>

        <section id="overview" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Proof"
              title="Why this work is credible"
              body="A quick read on the domains, recognition, and operating context behind the portfolio."
            />
            <div className="proof-grid">
              {heroProofPoints.map((point, index) => (
                <article key={point.title} className="proof-card reveal" style={{ "--delay": `${index * 0.08}s` }}>
                  <p className="proof-card-title">{point.title}</p>
                  <p>{point.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="recognition" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="Recognition"
              title="Selected proof points"
              body="A small set of credentials, milestones, and placeholders that can grow into stronger social proof as more material becomes available."
            />
            <div className="proof-grid recognition-grid">
              {socialProofItems.map((item, index) => (
                <article key={item.title} className="proof-card recognition-card reveal" style={{ "--delay": `${index * 0.08}s` }}>
                  <p className="proof-card-title">{item.title}</p>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container bio-layout">
            <aside className="bio-portrait reveal">
              <div className="portrait-mark" aria-hidden="true" />
              <div className="tag-row">
                <span className="tag">Research Engineering</span>
                <span className="tag">Automation</span>
                <span className="tag">Lab Ops</span>
              </div>
              <p>Denver-based, working across neuroscience infrastructure, software, and operational systems.</p>
            </aside>

            <div className="bio-copy">
              <SectionHeading
                eyebrow="Profile"
                title="Bio"
                body="I build reliable systems that make complex work easier to run, audit, and improve."
              />
              <div className="bio-text reveal">
                <p>
                  I'm a neuroscience research engineer focused on automation, lab software, and infrastructure that supports repeatable experiments.
                  I work closely with researchers and stakeholders to plan upgrades, document processes, and keep systems dependable under real lab constraints.
                </p>
                <p>
                  My day-to-day work sits at the intersection of hardware, data, and operations: building tools, coordinating vendors, and writing the procedural layer that keeps projects moving with less friction.
                </p>
              </div>

              <div className="about-grid">
                {aboutCards.map((card, index) => (
                  <article key={card.title} className="about-card reveal" style={{ "--delay": `${0.1 * (index + 1)}s` }}>
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Capabilities"
              title="Skills and tech stack"
              body="Grouped around the work I actually do, not around a generic badge cloud."
            />
            <div className="skill-grid">
              {skillGroups.map((group, index) => (
                <article key={group.title} className="skill-card reveal" style={{ "--delay": `${index * 0.1}s` }}>
                  <h3>{group.title}</h3>
                  <div className="chip-row">
                    {group.items.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="History"
              title="Experience"
              body="Engineering roles and research leadership across lab systems."
            />
            <div className="timeline">
              {experience.map((item, index) => (
                <article key={`${item.role}-${item.dates}`} className="timeline-item reveal" style={{ "--delay": `${index * 0.1}s` }}>
                  <div className="timeline-meta">
                    <h3>{item.role}</h3>
                    <span>{item.org}</span>
                    <span>{item.dates}</span>
                  </div>
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="edu-grid">
              <SectionHeading
                eyebrow="Education"
                title="Academic foundation"
                body="Academic training and lab residency that support the systems work."
              />
              <div className="edu-cards">
                {education.map((item, index) => (
                  <article key={item.title} className="edu-card reveal" style={{ "--delay": `${index * 0.1}s` }}>
                    <h3>{item.title}</h3>
                    <p className="edu-subtitle">{item.subtitle}</p>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Work"
              title="Selected systems and builds"
              body="Representative work spanning automation, data systems, and applied engineering."
            />

            <div className="filter-row reveal">
              {["all", "automation", "data", "hardware", "software"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-btn ${projectFilter === filter ? "is-active" : ""}`}
                  onClick={() => setProjectFilter(filter)}
                >
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={openProject} />
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="section">
          <div className="container">
            <Suspense fallback={<div className="gallery-skeleton" aria-busy="true" aria-live="polite" />}>
              <GallerySection reducedMotion={reducedMotion} />
            </Suspense>
          </div>
        </section>

        <section id="contact" className="section section-alt">
          <div className="container contact-grid">
            <div className="contact-copy">
              <SectionHeading
                eyebrow="Contact"
                title="Start the conversation"
                body="Open to collaborations in automation, lab infrastructure, and applied research engineering."
              />
              <p className="contact-prompt reveal">{contactPrompt}</p>
              <div className="contact-links">
                {contactLinks.map((link) => (
                  <a key={link.label} className="contact-link reveal" href={link.href}>
                    <span>{link.label}</span>
                    <strong>{link.value}</strong>
                  </a>
                ))}
              </div>
              <div className="contact-notes reveal">
                <div className="note-card">
                  <strong>Best for</strong>
                  <p>Collaborations, hiring conversations, and project inquiries.</p>
                </div>
                <div className="note-card">
                  <strong>Response style</strong>
                  <p>Direct, concise, and focused on next steps.</p>
                </div>
              </div>
              <a className="button ghost contact-resume reveal" href={resumeHref}>
                Resume / CV
              </a>
            </div>

            <form className="contact-form reveal" onSubmit={handleContactSubmit}>
              <div className="section-heading is-centered reveal">
                <p className="eyebrow">Message</p>
                <h2>Send a note</h2>
                <p>A short message is enough. The form opens your email client with the details filled in.</p>
              </div>
              <label className="field">
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" placeholder="Your name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
              </label>
              <label className="field">
                <span>Message</span>
                <textarea name="message" placeholder="What are you working on, and what kind of help do you need?" />
              </label>
              <div className="form-actions">
                <button className="button" type="submit">
                  Open email draft
                </button>
                <span className="form-status">{contactStatus === "draft" ? "Draft opened in mail client." : "Mailto fallback enabled."}</span>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <p className="footer-meta">(c) {new Date().getFullYear()} Benjamin Reynolds</p>
          <div className="footer-links">
            <span>Denver, CO</span>
            <a href={resumeHref}>Resume</a>
            <a href="mailto:Benjamin.g.reynolds@ucdenver.edu">Email</a>
            <a href="https://www.linkedin.com/in/benjamin-reynolds">LinkedIn</a>
          </div>
        </div>
      </footer>

      <ProjectModal project={selectedProject} onClose={closeProject} />
    </div>
  );
}

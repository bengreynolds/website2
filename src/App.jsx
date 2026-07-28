import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  aboutCards,
  contactLinks,
  education,
  experience,
  heroStatement,
  navigation,
  projects,
  resumeHref,
  skillGroups,
} from "./siteData";

const sectionIds = navigation.map((item) => item.id);
const navAccentBySection = {
  home: "var(--accent)",
  projects: "var(--accent)",
  experience: "var(--accent)",
  capabilities: "var(--accent)",
  contact: "var(--accent)",
};
const THEME_STORAGE_KEY = "theme";

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
          const projectHashIsActive = id === "projects" && window.location.hash.startsWith("#project-");
          if (!projectHashIsActive && window.location.hash !== `#${id}`) {
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

const skillVisuals = {
  scientific: { kind: "chart", accent: "var(--accent)" },
  acquisition: { kind: "camera", accent: "var(--accent)" },
  packaging: { kind: "box", accent: "var(--accent)" },
  embedded: { kind: "chip", accent: "var(--accent)" },
  automation: { kind: "network", accent: "var(--accent)" },
  physical: { kind: "draft", accent: "var(--accent)" },
  support: { kind: "wrench", accent: "var(--accent)" },
  developer: { kind: "code", accent: "var(--accent)" },
};

function getVisualMeta(text = "") {
  const lowerText = text.toLowerCase();
  if (
    lowerText.includes("scientific") ||
    lowerText.includes("analysis") ||
    lowerText.includes("python") ||
    lowerText.includes("nwb") ||
    lowerText.includes("data")
  ) {
    return skillVisuals.scientific;
  }
  if (
    lowerText.includes("acquisition") ||
    lowerText.includes("camera") ||
    lowerText.includes("behavior") ||
    lowerText.includes("training") ||
    lowerText.includes("reach")
  ) {
    return skillVisuals.acquisition;
  }
  if (
    lowerText.includes("package") ||
    lowerText.includes("install") ||
    lowerText.includes("deploy") ||
    lowerText.includes("environment") ||
    lowerText.includes("release")
  ) {
    return skillVisuals.packaging;
  }
  if (
    lowerText.includes("embedded") ||
    lowerText.includes("cuda") ||
    lowerText.includes("jetpack") ||
    lowerText.includes("tensorrt") ||
    lowerText.includes("cudnn")
  ) {
    return skillVisuals.embedded;
  }
  if (
    lowerText.includes("agentic") ||
    lowerText.includes("automation") ||
    lowerText.includes("workflow") ||
    lowerText.includes("codex") ||
    lowerText.includes("github")
  ) {
    return skillVisuals.automation;
  }
  if (
    lowerText.includes("hardware") ||
    lowerText.includes("pcb") ||
    lowerText.includes("kicad") ||
    lowerText.includes("inventor") ||
    lowerText.includes("fusion") ||
    lowerText.includes("solidworks") ||
    lowerText.includes("illustrator") ||
    lowerText.includes("draft")
  ) {
    return skillVisuals.physical;
  }
  if (
    lowerText.includes("support") ||
    lowerText.includes("maintenance") ||
    lowerText.includes("help") ||
    lowerText.includes("provisioning") ||
    lowerText.includes("troubleshoot")
  ) {
    return skillVisuals.support;
  }
  if (lowerText.includes("developer") || lowerText.includes("runtime") || lowerText.includes("tooling")) {
    return skillVisuals.developer;
  }
  return skillVisuals.developer;
}

function GlyphIcon({ kind }) {
  switch (kind) {
    case "chart":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M8 36h32" />
          <path d="M12 30l6-6 5 4 10-12" />
          <path d="M32 16h6v6" />
        </svg>
      );
    case "camera":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <rect x="8" y="14" width="32" height="20" rx="4" />
          <circle cx="24" cy="24" r="7" />
          <path d="M14 14l3-5h6l2 5" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M10 18l14-8 14 8-14 8-14-8Z" />
          <path d="M10 18v14l14 8 14-8V18" />
          <path d="M24 26v14" />
        </svg>
      );
    case "chip":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <rect x="14" y="14" width="20" height="20" rx="3" />
          <path d="M19 19h10v10H19z" />
          <path d="M10 18h4M10 24h4M10 30h4M34 18h4M34 24h4M34 30h4M18 10v4M24 10v4M30 10v4M18 34v4M24 34v4M30 34v4" />
        </svg>
      );
    case "network":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M16 18h16M16 30h16M18 18l-6 6 6 6M30 18l6 6-6 6" />
          <circle cx="10" cy="24" r="3" />
          <circle cx="38" cy="24" r="3" />
          <circle cx="24" cy="12" r="3" />
          <circle cx="24" cy="36" r="3" />
        </svg>
      );
    case "draft":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M12 34l14-14 6 6-14 14H12z" />
          <path d="M24 16l4-4 8 8-4 4" />
          <path d="M10 38h28" />
        </svg>
      );
    case "wrench":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M30 10a8 8 0 0 0-7 12L12 33l3 3 11-11a8 8 0 0 0 12-7l-6 6-4-4 6-6z" />
          <path d="M14 34l-4 4" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M18 16L8 24l10 8" />
          <path d="M30 16l10 8-10 8" />
          <path d="M26 12l-4 24" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <rect x="10" y="14" width="28" height="20" rx="4" />
          <path d="M12 18l12 9 12-9" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M16 10h4l3 8-4 3c1 3 4 6 7 7l3-4 8 3v4c0 2-2 4-4 4-13 0-23-10-23-23 0-2 2-4 4-4Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <rect x="8" y="8" width="32" height="32" rx="8" />
          <path d="M17 21v13M17 16.5v.5" />
          <path d="M24 34V21" />
          <path d="M24 26.5c0-3 1.8-5 4.5-5s4.5 2 4.5 5V34" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M24 10a14 14 0 0 0-4.4 27.3c.7.1.9-.3.9-.7v-2.5c-3.7.8-4.5-1.6-4.5-1.6-.6-1.4-1.5-1.8-1.5-1.8-1.2-.9.1-.9.1-.9 1.3.1 2 .7 2.4 1.3 1.2 2.1 3.2 1.5 4 .1.1-.9.5-1.5.9-1.9-3-.3-6.2-1.5-6.2-6.8 0-1.5.5-2.7 1.3-3.7-.1-.4-.6-1.7.1-3.5 0 0 1.1-.4 3.8 1.4a13.4 13.4 0 0 1 6.9 0c2.7-1.8 3.8-1.4 3.8-1.4.7 1.8.3 3.1.1 3.5.8 1 1.3 2.2 1.3 3.7 0 5.3-3.2 6.5-6.3 6.8.5.4 1 1.3 1 2.6v3.8c0 .4.2.8.9.7A14 14 0 0 0 24 10Z" />
        </svg>
      );
    case "download":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M24 10v16" />
          <path d="M17 23l7 7 7-7" />
          <path d="M12 34h24" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle cx="24" cy="24" r="14" />
          <path d="M10 24h28" />
          <path d="M24 10c4.5 4.4 7 9.2 7 14s-2.5 9.6-7 14c-4.5-4.4-7-9.2-7-14s2.5-9.6 7-14Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M10 24h28" />
          <path d="M24 10v28" />
        </svg>
      );
  }
}

function HeroSystemMap() {
  const nodes = [
    { label: "Design", kind: "draft" },
    { label: "Build", kind: "box" },
    { label: "Release", kind: "camera" },
    { label: "Support", kind: "wrench" },
  ];

  return (
    <div className="hero-map" role="img" aria-label="Systems workflow connecting design, build, release, and support">
      {nodes.map((node, index) => (
        <div key={node.label} className={`hero-map-node node-${index + 1}`}>
          <span className="hero-map-icon" aria-hidden="true">
            <GlyphIcon kind={node.kind} />
          </span>
          <strong>{node.label}</strong>
        </div>
      ))}
      <div className="hero-map-core">
        <span>Benjamin Reynolds</span>
        <strong>Systems</strong>
      </div>
    </div>
  );
}

function BioCompass() {
  const points = [
    { label: "Python", kind: "chart" },
    { label: "Packaging", kind: "box" },
    { label: "CAD", kind: "draft" },
    { label: "Maintenance", kind: "wrench" },
  ];

  return (
    <div className="bio-compass" role="img" aria-label="Capability map spanning Python, packaging, CAD, and maintenance">
      <div className="bio-compass-core">
        <span>Focus</span>
        <strong>Systems</strong>
      </div>
      {points.map((point, index) => (
        <div key={point.label} className={`bio-compass-node node-${index + 1}`}>
          <GlyphIcon kind={point.kind} />
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}

const ProjectCard = memo(function ProjectCard({ project }) {
  return (
    <article
      id={`project-${project.id}`}
      className={`project-card reveal ${project.featured ? "is-featured" : ""}`}
    >
      <header className="project-card-header">
        <div>
          {project.featured ? <span className="project-card-kicker">Featured project</span> : null}
          <h3>{project.title}</h3>
        </div>
        <a className="project-permalink" href={`#project-${project.id}`} aria-label={`Link to ${project.title}`}>
          Link
        </a>
      </header>
      <p className="project-outcome">{project.result}</p>
      <p className="project-summary">{project.summary}</p>
      <dl className="project-facts">
        <div>
          <dt>Tools and technologies</dt>
          <dd>
            <ul className="project-keywords" aria-label={`Tools used for ${project.title}`}>
              {project.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Transferable skills</dt>
          <dd>
            <ul className="project-keywords" aria-label={`Skills demonstrated by ${project.title}`}>
              {project.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className="project-contribution">
        <span>Contribution</span>
        <p>{project.role}</p>
      </div>
      <details className="project-details">
        <summary>
          <span>Technical case study</span>
          <span className="project-cue" aria-hidden="true">Expand</span>
        </summary>
        <div className="case-study-stack">
          <article>
            <span>Need</span>
            <p>{project.challenge}</p>
          </article>
          <article>
            <span>Constraints</span>
            <p>{project.constraints}</p>
          </article>
          <article>
            <span>Engineering approach</span>
            <p>{project.approach}</p>
          </article>
        </div>
        <div className="project-implementation">
          <span>Technical implementation</span>
          <ul>
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </details>
    </article>
  );
});

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [projectFilter, setProjectFilter] = useState("all");
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
    const initialSection = hash.startsWith("project-") ? "projects" : hash || "home";
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
    const onClick = (event) => {
      if (!menuOpen) return;
      const shell = document.querySelector(".site-header");
      if (shell && !shell.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
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

  return (
    <div className="spa-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="scroll-progress" style={{ width: `${progress * 100}%` }} aria-hidden="true" />

      <header className={`site-header ${headerScrolled ? "is-scrolled" : ""}`}>
        <div className="container nav-shell">
          <a
            className="brand"
            href="#home"
            aria-label="Benjamin Reynolds, home"
            onClick={(event) => {
              event.preventDefault();
              goToSection("home");
            }}
          >
            BR
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
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav id="primary-navigation" className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "is-active" : ""}
                aria-current={activeSection === item.id ? "location" : undefined}
                style={{ "--nav-accent": navAccentBySection[item.id] || "var(--accent)" }}
                onClick={(event) => {
                  event.preventDefault();
                  goToSection(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a className="button nav-resume" href={resumeHref} download>
            Resume
          </a>
        </div>
      </header>

      <main id="main-content">
        <section id="home" className="hero section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow reveal" style={{ "--delay": "0.05s" }}>
                Research Systems Engineer
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
                <a className="button ghost" href={resumeHref} download>
                  Download resume
                </a>
              </div>
              <div className="hero-meta reveal" style={{ "--delay": "0.45s" }}>
                <span>Denver, CO</span>
                <span>Open to remote, hybrid, on-site, and travel-based roles</span>
              </div>
            </div>

            <aside className="hero-visual reveal" style={{ "--delay": "0.2s" }} aria-label="Systems engineering workflow">
              <div className="panel-header">
                <span className="eyebrow">End-to-end delivery</span>
              </div>
              <HeroSystemMap />
              <p className="hero-visual-caption">
                Design, build, validation, deployment, and support treated as one connected system.
              </p>
            </aside>
          </div>
        </section>

        <section id="projects" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Selected work"
              title="Engineering projects built for operational value"
              body="Outcomes and transferable skills first, with implementation details available for technical review."
            />

            <div className="filter-row reveal">
              {["all", "automation", "data", "hardware", "software"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-btn ${projectFilter === filter ? "is-active" : ""}`}
                  aria-pressed={projectFilter === filter}
                  onClick={() => setProjectFilter(filter)}
                >
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="History"
              title="Experience"
              body="Roles across support, hardware, software, and delivery."
            />
            <div className="experience-layout">
              <div className="timeline">
                {experience.map((item, index) => (
                  <details key={`${item.role}-${item.dates}`} className="timeline-item reveal" style={{ "--delay": `${index * 0.1}s` }}>
                    <summary className="timeline-summary">
                      <div className="timeline-meta">
                        <span className="timeline-badge" aria-hidden="true">
                          <GlyphIcon kind={getVisualMeta(`${item.role} ${item.org}`).kind} />
                        </span>
                        <h3>{item.role}</h3>
                        <span>{item.org}</span>
                        <span>{item.dates}</span>
                      </div>
                      <span className="timeline-cue" aria-hidden="true">Open details</span>
                    </summary>
                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>

              <aside className="education-panel reveal">
                <div className="section-subheading">
                  <p className="eyebrow">Education</p>
                  <h3>Academic foundation</h3>
                  <p>Academic training and residency supporting systems work.</p>
                </div>
                <div className="edu-cards">
                  {education.map((item) => (
                    <article key={item.title} className="edu-card">
                      <h3>{item.title}</h3>
                      <p className="edu-subtitle">{item.subtitle}</p>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="capabilities" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Capabilities"
              title="Engineering across the system lifecycle"
              body="Software, hardware, deployment, validation, and support organized around dependable delivery."
            />

            <div className="capability-overview">
              <aside className="bio-portrait reveal">
                <BioCompass />
              </aside>

              <div className="bio-copy">
                <div className="bio-text reveal">
                  <p>
                    Technical work spans scientific Python, desktop applications, acquisition and control, packaging, CAD, electronics, documentation, troubleshooting, recovery, and handoff.
                  </p>
                </div>

                <div className="about-grid">
                  {aboutCards.map((card, index) => (
                    <article key={card.title} className="about-card about-card-simple reveal" style={{ "--delay": `${0.1 * (index + 1)}s` }}>
                      <span className="about-card-kicker">0{index + 1}</span>
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="capabilities">
              <SectionHeading
                eyebrow="Technical toolkit"
                title="Tools grouped by how they support delivery"
                body="Four areas repeatedly used to move systems from prototype to dependable operation."
              />
              <div className="skill-grid">
                {skillGroups.map((group, index) => {
                  const meta = getVisualMeta(group.title);

                  return (
                    <article key={group.title} className="skill-card reveal" style={{ "--delay": `${index * 0.08}s`, "--skill-accent": meta.accent }}>
                      <div className="skill-card-head">
                        <div className="skill-card-icon" aria-hidden="true">
                          <GlyphIcon kind={meta.kind} />
                        </div>
                        <div className="skill-card-copy">
                          <h3>{group.title}</h3>
                        </div>
                      </div>
                      <div className="chip-row">
                        {group.items.map((item) => (
                          <span key={item} className="chip">
                            {item}
                          </span>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container contact-grid">
            <div className="contact-copy">
              <SectionHeading
                eyebrow="Contact"
                title="Start a technical conversation"
                body="Available for systems engineering roles in scientific software, automation, hardware integration, and technical delivery."
              />
              <p className="contact-availability">Denver, Colorado | Open to remote, hybrid, on-site, and travel-based roles.</p>
            </div>
            <div className="contact-links">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  className="contact-link reveal"
                  href={link.href}
                  download={link.download ? "" : undefined}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  title={link.download ? "Downloads the resume PDF" : link.value}
                >
                  <span className="contact-link-icon" aria-hidden="true">
                    <GlyphIcon kind={link.icon} />
                  </span>
                  <span className="contact-link-copy">
                    <span>{link.label}</span>
                    <strong>{link.value}</strong>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <p className="footer-meta">&copy; {new Date().getFullYear()} Benjamin Reynolds</p>
          <div className="footer-links">
            <span>Denver, CO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

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

const skillVisuals = {
  scientific: { kind: "chart", accent: "#c96a2f" },
  acquisition: { kind: "camera", accent: "#0f8b8d" },
  packaging: { kind: "box", accent: "#2c6bed" },
  embedded: { kind: "chip", accent: "#8b5cf6" },
  automation: { kind: "network", accent: "#db2777" },
  physical: { kind: "draft", accent: "#d97706" },
  support: { kind: "wrench", accent: "#16a34a" },
  developer: { kind: "code", accent: "#4f46e5" },
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
    default:
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <path d="M10 24h28" />
          <path d="M24 10v28" />
        </svg>
      );
  }
}

function CardVisual({ title, label, text }) {
  const meta = getVisualMeta(`${title} ${label} ${text}`);

  return (
    <div className="card-visual" style={{ "--visual-accent": meta.accent }}>
      <div className="card-visual-icon" aria-hidden="true">
        <GlyphIcon kind={meta.kind} />
      </div>
      <div className="card-visual-copy">
        {label ? <span>{label}</span> : null}
        <strong>{title}</strong>
        {text ? <p className="card-visual-text">{text}</p> : null}
      </div>
    </div>
  );
}

function HeroSystemMap() {
  const nodes = [
    { label: "Concept", kind: "draft" },
    { label: "Production", kind: "box" },
    { label: "Deployment", kind: "camera" },
    { label: "Support", kind: "wrench" },
  ];

  return (
      <div className="hero-map" aria-label="Systems map">
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
        <strong>Design to Deployment</strong>
      </div>
    </div>
  );
}

function BioCompass() {
  const points = [
    { label: "Python + tooling", kind: "chart" },
    { label: "Packaging + deployment", kind: "box" },
    { label: "CAD + build work", kind: "draft" },
    { label: "IT support + maintenance", kind: "wrench" },
  ];

  return (
    <div className="bio-compass" aria-label="Portfolio capability compass">
      <div className="bio-compass-core">
        <span>Focus</span>
        <strong>Full Scope</strong>
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

function CapabilityMap({ groups }) {
  const maxCount = Math.max(...groups.map((group) => group.items.length));

  return (
    <div className="capability-map reveal">
      <div className="capability-map-copy">
        <p className="eyebrow">Map</p>
        <h3>Capability density by area</h3>
        <p>
          The stack is intentionally wide: explicit tools, packaging workflows, embedded deployment, physical build work, and support are all represented here.
        </p>
      </div>
      <div className="capability-bars" aria-label="Skill density chart">
        {groups.map((group, index) => {
          const meta = getVisualMeta(group.title);
          const width = `${Math.max(18, Math.round((group.items.length / maxCount) * 100))}%`;

          return (
            <div
              key={group.title}
              className="capability-bar reveal"
              style={{ "--bar-accent": meta.accent, "--delay": `${index * 0.06}s` }}
            >
              <div className="capability-bar-head">
                <span>{group.title}</span>
                <strong>{group.items.length}</strong>
              </div>
              <div className="capability-bar-track" aria-hidden="true">
                <div className="capability-bar-fill" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ProjectCard = memo(function ProjectCard({ project, onOpen }) {
  return (
    <details className={`project-card reveal ${project.featured ? "is-featured" : ""}`}>
      <summary className="project-card-summary">
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
          <span className="project-cue">Open details</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </summary>
      <div className="project-card-body">
        <div className="project-scene" aria-hidden="true">
          <div className="project-scene-icon">
            <GlyphIcon kind={getVisualMeta(`${project.title} ${project.summary}`).kind} />
          </div>
          <div className="project-scene-copy">
            <span>{project.category}</span>
            <strong>{project.tags.join(" / ")}</strong>
          </div>
        </div>
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
        <button type="button" className="button ghost project-open" onClick={() => onOpen(project)}>
          Open full case study
        </button>
      </div>
    </details>
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
  const [selectedProject, setSelectedProject] = useState(null);
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
                Full-Scope Systems Engineer | Design to Deployment
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
                <span className="panel-note">Concept, production, deployment</span>
              </div>
              <HeroSystemMap />
              <ul>
                <li>Clear documentation and repeatable workflows.</li>
                <li>Hands-on prototyping with practical constraints.</li>
                <li>Cross-team coordination, user support, and stakeholder clarity.</li>
              </ul>
              <div className="panel-highlight">
                Open to roles centered on full-scope systems engineering, from concept through physical production, software deployment, support, and applied development.
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
                  <CardVisual title={point.title} label="Proof" text={point.body} />
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
              body="A compact set of credentials and operational proof points across software, hardware, and support."
            />
            <div className="proof-grid recognition-grid">
              {socialProofItems.map((item, index) => (
                <article key={item.title} className="proof-card recognition-card reveal" style={{ "--delay": `${index * 0.08}s` }}>
                  <CardVisual title={item.title} label="Recognition" text={item.body} />
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
                <span className="tag">Systems Engineering</span>
                <span className="tag">Production</span>
                <span className="tag">Deployment</span>
              </div>
              <BioCompass />
              <p>Denver-based, working across design, build, deployment, support, and operational systems.</p>
            </aside>

            <div className="bio-copy">
              <SectionHeading
                eyebrow="Profile"
                title="Bio"
                body="I build reliable systems from design ideas through physical production, software deployment, support, and maintenance."
              />
              <div className="bio-text reveal">
                <p>
                  I'm a full-scope systems engineer working across scientific Python, desktop application development, acquisition and control, packaging and deployment, and analysis tooling.
                  My background is intentionally hybrid: CAD, electronics, embedded and GPU toolchains, fabrication, and the physical systems that keep complex tools usable in practice.
                </p>
                <p>
                  I work closely with teams and stakeholders to plan upgrades, document processes, support users, and keep systems dependable inside real institutional constraints.
                  That includes IT provisioning, troubleshooting, recovery procedures, approved workarounds for platform limits, vendor coordination, hands-on maintenance, and production-minded deployment.
                </p>
              </div>

              <div className="about-grid">
                {aboutCards.map((card, index) => (
                  <article key={card.title} className="about-card reveal" style={{ "--delay": `${0.1 * (index + 1)}s` }}>
                    <CardVisual title={card.title} label="About" text={card.body} />
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
                body="Grouped by concrete tools, runtimes, deployment workflows, and physical systems from design to release."
              />
            <CapabilityMap groups={skillGroups} />
            <div className="skill-grid">
              {skillGroups.map((group, index) => {
                const meta = getVisualMeta(group.title);

                return (
                  <article key={group.title} className="skill-card reveal" style={{ "--delay": `${index * 0.1}s`, "--skill-accent": meta.accent }}>
                    <div className="skill-card-head">
                      <div className="skill-card-icon" aria-hidden="true">
                        <GlyphIcon kind={meta.kind} />
                      </div>
                      <div className="skill-card-copy">
                        <p className="skill-card-count">{group.items.length} explicit skills</p>
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
        </section>

        <section id="experience" className="section">
          <div className="container">
            <SectionHeading
              eyebrow="History"
              title="Experience"
              body="Engineering roles and systems work across support, hardware, and deployment."
            />
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
                    <span className="timeline-cue">Open details</span>
                  </summary>
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="edu-grid">
              <SectionHeading
                eyebrow="Education"
                title="Academic foundation"
                body="Academic training and residency that support the systems work."
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
              body="Representative work spanning automation, data systems, hardware, and applied engineering."
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
                body="Open to collaborations in full-scope systems engineering, automation, hardware, deployment, and user support."
              />
              <p className="contact-prompt reveal">{contactPrompt}</p>
              <div className="contact-route reveal">
                <div className="contact-route-node">
                  <GlyphIcon kind="wrench" />
                  <span>Support</span>
                </div>
                <div className="contact-route-line" aria-hidden="true" />
                <div className="contact-route-node">
                  <GlyphIcon kind="box" />
                  <span>Deploy</span>
                </div>
                <div className="contact-route-line" aria-hidden="true" />
                <div className="contact-route-node">
                  <GlyphIcon kind="chart" />
                  <span>Build</span>
                </div>
              </div>
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
                  <CardVisual title="Best for" label="Contact" text="Collaborations, hiring conversations, and project inquiries." />
                </div>
                <div className="note-card">
                  <CardVisual title="Response style" label="Contact" text="Direct, concise, and focused on next steps." />
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

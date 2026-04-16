import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  aboutCards,
  contactLinks,
  education,
  experience,
  heroStatement,
  navigation,
  projects,
  skillGroups,
} from "./siteData";

const sectionIds = navigation.map((item) => item.id);
const navAccentBySection = {
  home: "#c17537",
  about: "#6b8555",
  skills: "#c8953b",
  experience: "#b06442",
  projects: "#cb7838",
  goals: "#7a628e",
  gallery: "#665276",
  contact: "#d69354",
};
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
  scientific: { kind: "chart", accent: "#c86a2d" },
  acquisition: { kind: "camera", accent: "#8c5a8f" },
  packaging: { kind: "box", accent: "#5f64b8" },
  embedded: { kind: "chip", accent: "#a65544" },
  automation: { kind: "network", accent: "#b7546e" },
  physical: { kind: "draft", accent: "#c3842e" },
  support: { kind: "wrench", accent: "#72813d" },
  developer: { kind: "code", accent: "#5367a6" },
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
    <div className="bio-compass" aria-label="Portfolio capability compass">
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

function CapabilityMap({ groups }) {
  const maxCount = Math.max(...groups.map((group) => group.items.length));

  return (
    <div className="capability-map reveal">
      <div className="capability-map-copy">
        <p className="eyebrow">Map</p>
        <h3>Focus areas</h3>
        <p>
          The stack is intentionally wide, but the graph stays quiet and only gives a sense of where the work is strongest.
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
    <article className={`project-card reveal ${project.featured ? "is-featured" : ""}`}>
      <button
        type="button"
        className="project-card-trigger"
        onClick={() => onOpen(project)}
        aria-label={`Open case study for ${project.title}`}
      >
        {project.featured ? <span className="project-card-kicker">Featured system</span> : null}
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <span className="project-cue">Open case study</span>
      </button>
    </article>
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
        <div className="project-modal-media" aria-hidden="true">
          <div className="project-modal-media-frame">
            <span>Visual space</span>
            <strong>Reserved for renders, animations, and photos</strong>
            <p>Use this area for real-world imagery when you are ready to add it.</p>
          </div>
        </div>
        <h3 id="project-title">{project.title}</h3>
        <p>{project.summary}</p>
        <div className="case-study-stack">
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
        <div className="project-modal-detail">
          <span>Implementation notes</span>
          <ul>
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
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
        </div>
      </header>

      <main>
        <section id="home" className="hero section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow reveal" style={{ "--delay": "0.05s" }}>
                Full-Scope Systems Engineer
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
              </div>
              <div className="hero-meta reveal" style={{ "--delay": "0.45s" }}>
                <span>Denver, CO</span>
              </div>
              <div className="hero-tiles reveal" style={{ "--delay": "0.5s" }}>
                <a href="#experience" onClick={(event) => { event.preventDefault(); goToSection("experience"); }}>
                  Experience
                </a>
                <a href="#gallery" onClick={(event) => { event.preventDefault(); goToSection("gallery"); }}>
                  Gallery
                </a>
              </div>
            </div>

            <aside className="hero-panel reveal" style={{ "--delay": "0.2s" }}>
              <div className="panel-header">
                <span className="tag">Working style</span>
                <span className="panel-note">Practical delivery</span>
              </div>
              <HeroSystemMap />
              <ul>
                <li>Clear documentation and handoffs.</li>
                <li>Practical builds that hold up in use.</li>
                <li>Cross-team coordination when systems change.</li>
              </ul>
              <div className="panel-highlight">
                I work best when technical detail connects to a usable result.
              </div>
            </aside>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container bio-layout">
            <aside className="bio-portrait reveal">
              <div className="portrait-mark" aria-hidden="true" />
              <BioCompass />
            </aside>

            <div className="bio-copy">
              <SectionHeading
                eyebrow="Profile"
                title="Bio"
                body="I build practical systems for real-world use."
              />
              <div className="bio-text reveal">
                <p>
                  I work across scientific Python, desktop application development, acquisition and control, packaging, analysis tooling, CAD, electronics, embedded and GPU toolchains, and the physical systems that keep tools usable in practice.
                  I also handle documentation, troubleshooting, recovery, vendor coordination, and practical workarounds inside real institutional constraints.
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
        </section>

        <section id="skills" className="section section-alt">
          <div className="container">
            <SectionHeading
              eyebrow="Capabilities"
              title="Skills and tech stack"
              body="A focused stack across analysis, deployment, embedded work, and physical build systems."
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
              body="Roles across support, hardware, software, and delivery."
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
              body="Representative work across automation, data systems, hardware, and applied engineering."
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

        <section id="goals" className="section">
          <div className="container goals-layout">
            <SectionHeading
              eyebrow="Future"
              title="What I'm looking for"
              body="A role built around ownership, coordination, and follow-through."
            />
            <div className="goals-copy reveal">
              <p>
                I want work that lets me stay close to the full life cycle of a system, from early design through physical production,
                release, and handoff. I work best when I can see how choices affect the finished system.
              </p>
              <p>
                Longer term, I want to grow into project management. I like keeping work organized, translating between technical and
                non-technical stakeholders, and making sure plans survive real-world constraints.
              </p>
              <p>
                As an employee, I am flexible and practical. I am open to the East Coast, overseas opportunities, remote, hybrid, or on-site
                work, and I would welcome travel-based roles when being on the ground helps the work move faster.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="section section-alt">
          <div className="container contact-grid">
            <div className="contact-copy">
              <SectionHeading
                eyebrow="Contact"
                title="Start the conversation"
                body="Direct links for email, phone, LinkedIn, GitHub, and the resume download."
              />
              <div className="contact-links">
                {contactLinks.map((link) => (
                  <a
                    key={link.label}
                    className="contact-link reveal"
                    href={link.href}
                    download={link.download ? "" : undefined}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                    title={link.download ? "Downloads the resume / CV file" : link.value}
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
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <p className="footer-meta">(c) {new Date().getFullYear()} Benjamin Reynolds</p>
          <div className="footer-links">
            <span>Denver, CO</span>
          </div>
        </div>
      </footer>

      <ProjectModal project={selectedProject} onClose={closeProject} />
    </div>
  );
}

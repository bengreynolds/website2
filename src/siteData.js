export const navigation = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Selected Work" },
  { id: "experience", label: "Experience" },
  { id: "capabilities", label: "Capabilities" },
  { id: "contact", label: "Contact" },
];

export const resumeHref = "/Benjamin_Reynolds_Resume.pdf";

/* Positioning. "R&D Engineer" is the plain description of the work; the
   employed title lives in heroFacts and in the experience entry so the site
   never claims a title that a reference check would contradict. */
export const roleLabel = "R&D Engineer";

export const heroStatement =
  "Automation, instrumentation, and data systems for research, built to run reliably for the people who depend on them.";

/* Facts column beside the hero headline. These are the only place location,
   availability, and current role appear, so nothing restates them later. */
export const heroFacts = [
  { label: "Current", value: "Intermediate Research Engineer, CU Anschutz" },
  { label: "Based in", value: "Denver, Colorado" },
  { label: "Open to", value: "Systems R&D and research engineering roles" },
  { label: "Setting", value: "Remote, hybrid, on-site, or travel" },
];

export const projectFilters = [
  { id: "all", label: "All" },
  { id: "software", label: "Software" },
  { id: "automation", label: "Automation" },
  { id: "data", label: "Data" },
  { id: "hardware", label: "Hardware" },
];

/* Three kinds of work, usually on the same project. */
export const aboutCards = [
  {
    title: "Systems that hold up",
    body: "Validation, recovery paths, documentation, and packaging, so a system survives contact with daily use.",
  },
  {
    title: "Software and data",
    body: "Scientific Python, desktop applications, computer vision, and validated conversion between data formats.",
  },
  {
    title: "Hardware and integration",
    body: "CAD, PCB layout, electronics, embedded control, and the wiring between software and physical devices.",
  },
];

/* Primary tools only. The resume carries the exhaustive list. */
export const skillGroups = [
  {
    title: "Software and data",
    items: ["Python", "NumPy / SciPy", "Pandas", "OpenCV", "PySide6", "NWB"],
  },
  {
    title: "Automation and acquisition",
    items: [
      "DeepLabCut",
      "Multi-camera capture",
      "Closed-loop control",
      "Frame and TTL sync",
      "CAN bus",
    ],
  },
  {
    title: "Deployment and systems",
    items: ["Linux", "Windows", "Docker", "Conda", "PyInstaller", "Git"],
  },
  {
    title: "Hardware",
    items: ["KiCad", "Fusion 360", "SolidWorks", "PCB layout", "Bench testing"],
  },
];

export const experience = [
  {
    role: "Intermediate Research Engineer",
    org: "CU Anschutz - Physiology & Biophysics",
    dates: "Nov 2023 - Present",
    bullets: [
      "Build automated neuroscience systems, scientific data pipelines, desktop tools, and analysis workflows.",
      "Support users through hardware and software troubleshooting, deployment validation, and handoffs.",
      "Lead upgrade cycles with vendors, testing gates, and maintenance planning.",
      "Own rig infrastructure, preventive maintenance, and SOPs.",
    ],
  },
  {
    role: "Lead Researcher & Project Assistant",
    org: "CU Denver CIDE",
    dates: "May 2023 - Oct 2023",
    bullets: [
      "Led a systematic literature review on assistive technology.",
      "Designed mixed-methods studies evaluating iOS accessibility features.",
      "Delivered quantitative and qualitative analysis with formal reporting.",
    ],
  },
  {
    role: "Lead Engineer & Project Manager",
    org: "Senior Design, University of Colorado Denver",
    dates: "Aug 2022 - May 2023",
    bullets: [
      "Directed development of a quick-release mechanism for enteral gastrostomy tubes.",
      "Managed design, prototyping, manufacturing, and validation testing.",
      "Delivered a clinically viable mechanism through a full build and test cycle.",
    ],
  },
  {
    role: "Web Developer & Database Framework Architect",
    org: "Peak Leadership Frameworks",
    dates: "May 2022 - Sep 2022",
    bullets: [
      "Built secure web applications with SQL Server, Caspio, HTML, and JavaScript.",
      "Implemented encryption, authentication, and modular database frameworks.",
    ],
  },
];

export const education = [
  {
    title: "University of Colorado Denver | Anschutz Medical Campus",
    subtitle: "B.S. Bioengineering",
    body: "Graduated 2023. CEDC Design Expo winner.",
  },
];

/* Each entry carries one description line, the contribution, and the stack.
   Problem, approach, and implementation sit behind the disclosure. */
export const projects = [
  {
    id: "scientific-data-standardization-platform",
    title: "Neuroscience Data Standardization Platform",
    category: "software",
    tags: ["software", "data"],
    featured: true,
    summary:
      "Desktop software that converts mixed neuroscience recordings into one validated format, so complex datasets stay auditable and safe to share.",
    challenge:
      "Neuroscience data arrived in incompatible formats with inconsistent metadata, making validation, sharing, and long-term reuse difficult.",
    approach:
      "Designed a staged PySide6 workflow for import, metadata review, mapping, file assembly, provenance tracking, recovery, and validation against the Neurodata Without Borders standard.",
    role: "Designed the desktop workflow, conversion architecture, metadata controls, and validation safeguards.",
    tools: ["Python", "PySide6", "NWB", "Metadata validation"],
    bullets: [
      "Grouped related recording files into reviewable sessions.",
      "Added metadata conflict review before file assembly.",
      "Validated output through PyNWB and NeuroConv workflows.",
      "Preserved provenance and recovery information for auditability.",
    ],
  },
  {
    id: "automated-multicamera-training-control-system",
    title: "Closed-Loop Behavioral Training and Multi-Camera Acquisition",
    category: "automation",
    tags: ["automation", "hardware", "data"],
    featured: true,
    summary:
      "An automated rig synchronizing multi-camera capture, machine-learning tracking, and control hardware, cutting the supervision long training sessions used to need.",
    challenge:
      "Coordinating video, tracking, and physical devices reliably while reducing the manual supervision required during live operation.",
    approach:
      "Integrated acquisition, DeepLabCut tracking, CAN bus control, and operator safeguards into a closed-loop workflow with deployment checks.",
    role: "Built the integration logic and supported deployment, validation, maintenance, and daily operation.",
    tools: ["Python", "DeepLabCut", "CAN bus", "Multi-camera capture"],
    bullets: [
      "Synchronized camera capture with tracking and hardware control.",
      "Implemented closed-loop responses from detected movement.",
      "Designed repeatable startup and validation procedures.",
      "Maintained practical recovery paths for live research use.",
    ],
  },
  {
    id: "motion-analysis-reporting-suite",
    title: "Reach-to-Grasp Motion Analysis Suite",
    category: "software",
    tags: ["data", "software"],
    featured: true,
    summary:
      "GUI and command-line tools that turn raw reach-to-grasp recordings into results comparable across sessions.",
    challenge:
      "Raw recordings needed to become consistent outputs that could be compared across sessions, reviewed by researchers, and reused downstream.",
    approach:
      "Built GUI and CLI workflows for processing, aggregation, structured export, and NWB-compatible handling where standardized interchange was required.",
    role: "Developed the processing workflow, multi-session aggregation, interface, and export structure.",
    tools: ["Python", "Desktop GUI", "Command line", "Structured export"],
    bullets: [
      "Supported interactive and headless processing.",
      "Aggregated results across multiple recording sessions.",
      "Standardized exports for downstream review and reuse.",
      "Separated operator workflows from reusable processing logic.",
    ],
  },
  {
    id: "application-deployment-support-toolkit",
    title: "Research Application Deployment and Support Toolkit",
    category: "software",
    tags: ["software", "automation"],
    summary:
      "Installers, updaters, and recovery tools that let non-developers run internal research software without setup help.",
    challenge:
      "A growing internal software portfolio had to be installable, updateable, and supportable without repeated manual configuration.",
    approach:
      "Combined environment-aware installers, update flows, launch checks, and support utilities into a consistent deployment toolkit.",
    role: "Owned release packaging, environment management, launch behavior, and support tooling.",
    tools: ["Python", "PyInstaller", "Conda", "Git"],
    bullets: [
      "Built installer, updater, and launcher workflows.",
      "Added environment checks and recoverable startup behavior.",
      "Standardized release and support patterns across applications.",
    ],
  },
  {
    id: "multicamera-alignment-data-recovery-tool",
    title: "Multi-Camera Alignment and Recording Recovery Tool",
    category: "software",
    tags: ["software", "hardware", "data"],
    summary:
      "A utility that catches timing mismatches between paired camera recordings and previews fixes before touching the originals.",
    challenge:
      "Camera alignment problems had to be corrected without hiding dropped frames, overwriting source files, or introducing new timing errors.",
    approach:
      "Implemented visual previews, dry-run mode, backup and undo, mismatch detection, and post-process verification.",
    role: "Designed the operator-facing correction, recovery, and validation workflow.",
    tools: ["Python", "OpenCV", "Desktop GUI", "File validation"],
    bullets: [
      "Previewed proposed alignment changes before writing files.",
      "Added dry-run, backup, undo, and post-process verification.",
      "Detected frame-count mismatches and stopped unsafe corrections.",
      "Kept source recordings recoverable throughout processing.",
    ],
  },
  {
    id: "haptic-device-validation-test-bench",
    title: "Prosthetic Sensation Test Bench",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary:
      "A calibrated bench delivering controlled haptic stimulation, with load-cell feedback verifying force, timing, and repeatability.",
    challenge:
      "Evaluating tactile response hardware required a consistent method under controlled, measurable conditions.",
    approach:
      "Combined mechanical design, frequency control, sensing, electronics, and load-cell feedback into a calibrated test workflow.",
    role: "Led the mechanical and electrical integration, calibration strategy, and validation workflow.",
    tools: ["CAD", "Load-cell sensing", "Embedded control", "Electronics"],
    bullets: [
      "Designed mechanical fixtures for repeatable device placement.",
      "Integrated stimulation control, sensing, and calibration.",
      "Structured the bench workflow around repeatable test conditions.",
    ],
  },
];

export const contactLinks = [
  {
    label: "Email",
    href: "mailto:Benjamin.g.reynolds@ucdenver.edu",
    value: "Benjamin.g.reynolds@ucdenver.edu",
  },
  { label: "Phone", href: "tel:+13035472170", value: "303-547-2170" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/benjamin-reynolds",
    value: "linkedin.com/in/benjamin-reynolds",
  },
  { label: "GitHub", href: "https://github.com/bengreynolds", value: "github.com/bengreynolds" },
  { label: "Resume", href: resumeHref, value: "Download resume (PDF)", download: true },
];

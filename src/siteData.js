export const navigation = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Selected Work" },
  { id: "experience", label: "Experience" },
  { id: "capabilities", label: "Capabilities" },
  { id: "contact", label: "Contact" },
];

export const resumeHref = "/Benjamin_Reynolds_Resume.pdf";

export const heroStatement =
  "Scientific software, automation, and hardware-integrated systems built for dependable real-world use.";

export const aboutCards = [
  {
    title: "System Reliability",
    body: "Validation, documentation, recovery paths, and packaging support dependable operation from prototype through launch.",
  },
  {
    title: "Software Tooling",
    body: "Python, SciPy, NumPy, Pandas, OpenCV, PySide6, NWB, and supporting workflows.",
  },
  {
    title: "Physical Build Work",
    body: "CAD, KiCad, Autodesk tools, electronics, embedded setup, fabrication, and hardware maintenance.",
  },
];

export const skillGroups = [
  {
    title: "Scientific software and data",
    items: [
      "Python",
      "NumPy",
      "SciPy",
      "Pandas",
      "OpenCV",
      "PySide6",
      "NWB",
      "PyNWB",
      "NeuroConv",
    ],
  },
  {
    title: "Automation and acquisition",
    items: [
      "DeepLabCut",
      "Multi-camera Capture",
      "Closed-loop Control",
      "Frame Synchronization",
      "TTL Trigger Timing",
      "CAN Bus",
      "Camera Alignment",
      "Frame-drop Detection",
      "Session Recovery",
    ],
  },
  {
    title: "Deployment and systems",
    items: [
      "Linux",
      "Windows",
      "Docker",
      "GitHub",
      "Conda",
      "CMake",
      "PyInstaller",
      "Application Deployment",
      "Release Builds",
    ],
  },
  {
    title: "Hardware and product development",
    items: [
      "KiCad",
      "Autodesk Inventor",
      "AutoCAD",
      "Fusion 360",
      "SolidWorks",
      "Adobe Illustrator",
      "PCB Layout",
      "Enclosure Design",
      "Cable Harnessing",
      "Soldering",
      "Repair and Rework",
      "Prototyping",
      "Bench Testing",
    ],
  },
];

export const experience = [
  {
    role: "Intermediate Research Engineer",
    org: "University of Colorado Anschutz - Department of Physiology & Biophysics",
    dates: "Nov 2023 - Present",
    bullets: [
      "Build automated behavioral systems, NWB pipelines, desktop tools, and analysis workflows.",
      "Support users with hardware/software troubleshooting, deployment validation, and handoffs.",
      "Lead upgrade cycles with vendors, testing gates, and maintenance planning.",
      "Own rig infrastructure, inventory, preventive maintenance, and SOPs.",
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
    role: "Web Developer & Database Framework Architect",
    org: "Peak Leadership Frameworks",
    dates: "May 2022 - Sep 2022",
    bullets: [
      "Built secure web applications with SQL Server, Caspio, HTML, and JavaScript.",
      "Implemented encryption, authentication, and modular database frameworks.",
      "Delivered scalable infrastructure for organizational program management.",
    ],
  },
  {
    role: "Senior Design Project - Lead Engineer & Project Manager",
    org: "University of Colorado Denver",
    dates: "Aug 2022 - May 2023",
    bullets: [
      "Directed development of a quick-release mechanism for enteral gastrostomy tubes.",
      "Managed design, prototyping, manufacturing, and validation testing.",
      "Delivered a clinically viable, industry-aligned mechanism with a strong physical build and test cycle.",
    ],
  },
];

export const education = [
  {
    title: "University of Colorado Denver - Anschutz Medical Campus",
    subtitle: "B.S. Bioengineering",
    body: "Graduated May 2023 | GPA 3.7 | Dean's List (2021-2023) - CEDC Design Expo Winner",
  },
  {
    title: "Christie Lab - CU Anschutz",
    subtitle: "Research Engineering Residency",
    body: "Hands-on automation, systems maintenance, and operations work.",
  },
];

export const projects = [
  {
    id: "scientific-data-standardization-platform",
    title: "Scientific Data Standardization Platform",
    category: "software",
    tags: ["software", "data"],
    featured: true,
    summary:
      "Desktop software that converts mixed research files into a consistent, validated data standard for long-term access, review, and reuse.",
    challenge: "Research data arrived in incompatible formats with inconsistent metadata, making validation, sharing, and long-term reuse difficult.",
    constraints: "Multiple source formats, metadata conflicts, strict validation requirements, and the need to preserve traceability throughout conversion.",
    approach: "Designed a staged PySide6 workflow for import, metadata review, mapping, file assembly, NWB validation, provenance tracking, and recovery.",
    result: "Created a repeatable conversion process that makes complex datasets easier to audit, standardize, share, and trust.",
    role: "Designed the desktop workflow, conversion architecture, metadata controls, and validation safeguards.",
    tools: ["Python", "PySide6", "NWB", "PyNWB", "NeuroConv", "HDF5"],
    skills: ["Desktop software", "Data modeling", "Validation", "Metadata workflows"],
    bullets: [
      "Grouped related recording files into reviewable sessions.",
      "Added metadata conflict review before file assembly.",
      "Supported standard, custom, and hybrid conversion paths.",
      "Preserved provenance and recovery information for auditability.",
    ],
  },
  {
    id: "automated-multicamera-training-control-system",
    title: "Automated Multi-Camera Training and Control System",
    category: "automation",
    tags: ["automation", "hardware", "data"],
    featured: true,
    summary:
      "An automated research system coordinating synchronized video, machine-learning tracking, control hardware, and responsive training logic during long-running sessions.",
    challenge: "Coordinate video, tracking, and physical devices reliably while reducing the amount of manual supervision required during live operation.",
    constraints: "Multi-device timing, continuous uptime, active research use, repeatable setup, and existing institutional hardware.",
    approach: "Integrated acquisition, DeepLabCut tracking, CAN bus control, and operator safeguards into a closed-loop workflow with deployment checks.",
    result: "Reduced manual intervention and improved the repeatability of multi-device training and recording sessions.",
    role: "Built the integration logic and supported deployment, validation, maintenance, and daily operation.",
    tools: ["Python", "DeepLabCut", "CAN bus", "Multi-camera capture", "Embedded control"],
    skills: ["Systems integration", "Automation", "Device synchronization", "Operational reliability"],
    bullets: [
      "Synchronized camera capture with tracking and hardware control.",
      "Implemented closed-loop responses from detected movement.",
      "Designed repeatable startup and validation procedures.",
      "Maintained practical recovery paths for live research use.",
    ],
  },
  {
    id: "motion-analysis-reporting-suite",
    title: "Motion Analysis and Reporting Suite",
    category: "software",
    tags: ["data", "software"],
    featured: true,
    summary:
      "Software that transforms recorded movement data into structured, comparable analysis results through both graphical and command-line workflows.",
    challenge: "Convert raw recordings into consistent outputs that could be compared across sessions, reviewed by researchers, and reused downstream.",
    constraints: "Different session types, variable recording quality, multi-session processing, and support for both interactive and automated use.",
    approach: "Built GUI and CLI workflows for processing, aggregation, structured export, and NWB-compatible data handling.",
    result: "Created a repeatable path from raw recordings to reviewable analysis outputs and standardized handoffs.",
    role: "Developed the processing workflow, multi-session aggregation, user interface, and export structure.",
    tools: ["Python", "GUI", "CLI", "NWB", "Structured exports"],
    skills: ["Data processing", "Motion analysis", "Workflow design", "Reproducible reporting"],
    bullets: [
      "Supported interactive and headless processing.",
      "Aggregated results across multiple recording sessions.",
      "Standardized exports for downstream review and reuse.",
      "Separated operator workflows from reusable processing logic.",
    ],
  },
  {
    id: "application-deployment-support-toolkit",
    title: "Application Deployment and Support Toolkit",
    category: "software",
    tags: ["software", "automation"],
    summary:
      "A shared set of installers, updaters, launchers, conversion utilities, and recovery tools for deploying technical applications to non-developer users.",
    challenge: "Make a growing internal software portfolio installable, updateable, and supportable without repeated manual configuration.",
    constraints: "Mixed user skill levels, changing Windows environments, dependency conflicts, and the need for stable launches and rollback options.",
    approach: "Combined environment-aware installers, update flows, launch checks, and support utilities into a consistent deployment toolkit.",
    result: "Reduced setup friction for users and made application releases, updates, and support easier to maintain.",
    role: "Owned release packaging, environment management, launch behavior, and support tooling.",
    tools: ["Python", "PyInstaller", "Conda", "PowerShell", "GitHub"],
    skills: ["Release engineering", "Environment management", "User support", "Recovery design"],
    bullets: [
      "Built installer, updater, and launcher workflows.",
      "Added environment checks and recoverable startup behavior.",
      "Supported model conversion and camera configuration utilities.",
      "Standardized release and support patterns across applications.",
    ],
  },
  {
    id: "multicamera-alignment-data-recovery-tool",
    title: "Multi-Camera Alignment and Data Recovery Tool",
    category: "software",
    tags: ["software", "hardware", "data"],
    summary:
      "A desktop utility that detects timing mismatches between camera recordings, previews corrections, and protects original data during recovery.",
    challenge: "Correct camera alignment problems without hiding dropped frames, overwriting source files, or introducing new timing errors.",
    constraints: "Paired recordings, frame-count mismatches, large files, operator trust, and the need for reversible changes.",
    approach: "Implemented visual previews, dry-run mode, backup and undo, mismatch detection, and post-process verification.",
    result: "Created a safer correction workflow that catches recording problems before they affect later analysis.",
    role: "Designed the operator-facing correction, recovery, and validation workflow.",
    tools: ["Python", "OpenCV", "Desktop GUI", "File validation"],
    skills: ["Computer vision", "Defensive file operations", "Validation", "User-centered tooling"],
    bullets: [
      "Previewed proposed alignment changes before writing files.",
      "Added dry-run, backup, undo, and post-process verification.",
      "Detected frame-count mismatches and stopped unsafe corrections.",
      "Kept source recordings recoverable throughout processing.",
    ],
  },
  {
    id: "haptic-device-validation-test-bench",
    title: "Haptic Device Validation Test Bench",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary:
      "A physical test system that delivers controlled haptic stimulation and uses load-cell feedback to verify force, timing, and repeatability.",
    challenge: "Create a consistent method for evaluating tactile hardware under controlled, measurable conditions.",
    constraints: "Measurement fidelity, timing stability, mechanical repeatability, straightforward calibration, and safe bench operation.",
    approach: "Combined mechanical design, frequency control, sensing, electronics, and load-cell feedback into a calibrated test workflow.",
    result: "Produced a repeatable validation platform for comparing haptic device performance under controlled conditions.",
    role: "Led the mechanical and electrical integration, calibration strategy, and validation workflow.",
    tools: ["CAD", "Load-cell sensing", "Embedded control", "Electronics"],
    skills: ["Mechanical integration", "Electrical integration", "Calibration", "Test design"],
    bullets: [
      "Designed mechanical fixtures for repeatable device placement.",
      "Used load-cell feedback for measured validation.",
      "Integrated stimulation control, sensing, and calibration.",
      "Structured the bench workflow around repeatable test conditions.",
    ],
  },
];

export const contactLinks = [
  { label: "Email", icon: "mail", href: "mailto:Benjamin.g.reynolds@ucdenver.edu", value: "Benjamin.g.reynolds@ucdenver.edu" },
  { label: "Phone", icon: "phone", href: "tel:+13035472170", value: "303-547-2170" },
  { label: "LinkedIn", icon: "linkedin", href: "https://www.linkedin.com/in/benjamin-reynolds", value: "LinkedIn" },
  { label: "GitHub", icon: "github", href: "https://github.com/bengreynolds", value: "github.com/bengreynolds" },
  { label: "Resume", icon: "download", href: resumeHref, value: "Download resume (PDF)", download: true },
];

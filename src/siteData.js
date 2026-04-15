export const navigation = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export const heroMetrics = [
  { value: 4, label: "roles across research and software delivery" },
  { value: 6, label: "project builds highlighted on the site" },
  { value: 24, label: "capability areas mapped in the resume" },
  { value: 2, label: "core operating environments: lab and web" },
];

export const aboutCards = [
  {
    title: "System Reliability",
    body: "I build around SOPs, validation, and maintenance so systems stay dependable after launch.",
  },
  {
    title: "Engineering Leadership",
    body: "I coordinate upgrades, vendors, and deployment gates so technical work moves with less friction.",
  },
  {
    title: "Automation at Scale",
    body: "I focus on repeatable workflows, real-time control, and lab tools that reduce manual overhead.",
  },
];

export const skillGroups = [
  {
    title: "Languages and scripting",
    items: ["Python", "C++", "JavaScript", "MATLAB"],
  },
  {
    title: "Platforms and tools",
    items: ["NWB", "SQL", "DeepLabCut", "SolidWorks", "CAN Bus", "GUI Development"],
  },
  {
    title: "Operations and leadership",
    items: ["SOPs", "Validation", "Vendor Management", "Inventory", "Training", "Change Management"],
  },
];

export const experience = [
  {
    role: "Intermediate Research Engineer",
    org: "University of Colorado Anschutz - Department of Physiology & Biophysics",
    dates: "Nov 2023 - Present",
    bullets: [
      "Build automated behavioral systems, NWB pipelines, and analysis tooling.",
      "Lead upgrade cycles with vendors, testing gates, and deployment validation.",
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
      "Delivered a clinically viable, industry-aligned mechanism.",
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
    body: "Hands-on automation, experimental infrastructure, and lab operations.",
  },
];

export const projects = [
  {
    id: "autonomous-behavioral-training-system",
    title: "Autonomous Behavioral Training System",
    category: "automation",
    tags: ["automation", "hardware", "data"],
    featured: true,
    summary:
      "Home-cage training with DeepLabCut tracking, CAN bus actuation, and a workflow designed to keep experiments moving with less manual overhead.",
    bullets: [
      "Adaptive training flow for long-running lab sessions.",
      "Real-time interaction between tracking, motion, and control logic.",
      "Built for maintenance, repeatability, and practical deployment.",
    ],
  },
  {
    id: "rfid-metadata-integration-pipeline",
    title: "RFID Metadata Integration Pipeline",
    category: "data",
    tags: ["data", "software"],
    summary: "Real-time tag recognition linked to SQL and automated setup workflows.",
    bullets: ["Streamlined experimental metadata capture.", "Connected setup events to structured storage."],
  },
  {
    id: "prosthetic-sensation-tester",
    title: "Prosthetic Sensation Tester",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary: "Frequency-controlled haptics with load-cell validation and control feedback.",
    bullets: ["Designed for repeatable tactile testing.", "Built around measured response and validation."],
  },
  {
    id: "taste-sensitivity-rotational-rig",
    title: "Taste Sensitivity Rotational Rig",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary: "Multi-solution delivery with high-sensitivity lick detection and repeatable timing.",
    bullets: ["Controlled fluid delivery with reliable timing.", "Optimized for behavioral throughput."],
  },
  {
    id: "tens-triggered-dbs-alignment",
    title: "TENS-Triggered DBS Alignment",
    category: "hardware",
    tags: ["hardware", "data"],
    summary: "Low-latency stimulation with synchronized video acquisition and analysis support.",
    bullets: ["Aligned stimulation and capture timing.", "Designed for synchronized experiment runs."],
  },
  {
    id: "reach-analysis-suite",
    title: "Reach Analysis Suite",
    category: "software",
    tags: ["data", "software"],
    summary: "Pipeline for kinematic extraction and behavioral quantification.",
    bullets: ["Supports structured analysis workflows.", "Helps turn raw recordings into usable outputs."],
  },
];

export const galleryItems = [
  {
    title: "Adaptive training chassis",
    body: "Modular peripherals and control surfaces built for repeatability.",
  },
  {
    title: "Sensor fusion dashboard",
    body: "Telemetry views that keep operators oriented during live runs.",
  },
  {
    title: "High-throughput control hub",
    body: "Synchronized logging, monitoring, and coordination surfaces.",
  },
  {
    title: "Precision validation bench",
    body: "Staged components and test workflows for deployment cycles.",
  },
];

export const contactLinks = [
  { label: "Email", href: "mailto:Benjamin.g.reynolds@ucdenver.edu", value: "Benjamin.g.reynolds@ucdenver.edu" },
  { label: "Phone", href: "tel:+13035472170", value: "303-547-2170" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/benjamin-reynolds", value: "LinkedIn" },
];


export const navigation = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "recognition", label: "Recognition" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export const resumeHref = "/Benjamin_Reynolds_Updated_CV_Fall2025.docx";

export const heroStatement =
  "I build reliable research systems that reduce manual overhead, improve data fidelity, and keep lab work moving.";

export const heroProofPoints = [
  {
    title: "Research engineering",
    body: "Behavioral systems, NWB pipelines, and lab automation in a live research environment.",
  },
  {
    title: "Formal recognition",
    body: "B.S. Bioengineering, GPA 3.7, Dean's List 2021-2023, and CEDC Design Expo Winner.",
  },
  {
    title: "Tooling range",
    body: "Python, C++, JavaScript, SQL Server, Caspio, DeepLabCut, and CAN bus control.",
  },
  {
    title: "Operational ownership",
    body: "SOPs, validation gates, vendor coordination, inventory, and preventive maintenance.",
  },
];

export const socialProofItems = [
  {
    title: "CEDC Design Expo Winner",
    body: "Recognition for a senior design project that combined engineering, validation, and delivery.",
  },
  {
    title: "Dean's List 2021-2023",
    body: "Consistent academic performance through the bioengineering program.",
  },
  {
    title: "[PLACEHOLDER: recommendation snippet]",
    body: "A short supervisor or collaborator quote can go here once you have one ready.",
  },
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
    challenge: "Reduce manual intervention during long-running behavioral sessions without sacrificing repeatability.",
    constraints: "Live lab environment, hardware timing, maintenance load, and the need for dependable deployment gates.",
    approach: "Combined tracking, control, and logging into a workflow that could be validated and maintained in place.",
    result: "A more repeatable system that supports long sessions with less operator friction.",
    role: "Built the integration logic, supported deployment validation, and maintained the surrounding workflow.",
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
    challenge: "Keep experiment setup metadata structured and linked to the right session without adding manual overhead.",
    constraints: "Real-time tag recognition, existing SQL-backed storage, and the need for reliable setup workflows.",
    approach: "Connected RFID recognition to structured data capture and setup automation.",
    result: "Faster session setup with clearer metadata and fewer missed handoffs.",
    role: "Designed the database-facing workflow and helped automate the setup path.",
    bullets: ["Streamlined experimental metadata capture.", "Connected setup events to structured storage."],
  },
  {
    id: "prosthetic-sensation-tester",
    title: "Prosthetic Sensation Tester",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary: "Frequency-controlled haptics with load-cell validation and control feedback.",
    challenge: "Create a repeatable way to evaluate tactile response under controlled conditions.",
    constraints: "Measurement fidelity, stable timing, and the need for a test platform that could be validated.",
    approach: "Built around frequency control, sensing, and load-cell feedback to support structured testing.",
    result: "A more consistent test bench for validating prosthetic sensation experiments.",
    role: "Led the mechanical/electrical integration and validation workflow.",
    bullets: ["Designed for repeatable tactile testing.", "Built around measured response and validation."],
  },
  {
    id: "taste-sensitivity-rotational-rig",
    title: "Taste Sensitivity Rotational Rig",
    category: "hardware",
    tags: ["hardware", "automation"],
    summary: "Multi-solution delivery with high-sensitivity lick detection and repeatable timing.",
    challenge: "Support controlled solution delivery while keeping timing and detection reliable.",
    constraints: "High-throughput behavioral runs, precise timing, and the need for sensitive detection.",
    approach: "Combined fluid delivery, rotation control, and lick detection into one repeatable rig.",
    result: "Improved throughput and more consistent experiment execution.",
    role: "Helped shape the rig mechanics and the operating workflow.",
    bullets: ["Controlled fluid delivery with reliable timing.", "Optimized for behavioral throughput."],
  },
  {
    id: "tens-triggered-dbs-alignment",
    title: "TENS-Triggered DBS Alignment",
    category: "hardware",
    tags: ["hardware", "data"],
    summary: "Low-latency stimulation with synchronized video acquisition and analysis support.",
    challenge: "Align stimulation and capture timing tightly enough to support analysis later.",
    constraints: "Low latency requirements, synchronized video capture, and the need for a dependable signal path.",
    approach: "Built the timing and synchronization layer for stimulation plus capture.",
    result: "Cleaner alignment between stimulation events and downstream analysis.",
    role: "Supported the synchronization logic and validation steps.",
    bullets: ["Aligned stimulation and capture timing.", "Designed for synchronized experiment runs."],
  },
  {
    id: "reach-analysis-suite",
    title: "Reach Analysis Suite",
    category: "software",
    tags: ["data", "software"],
    summary: "Pipeline for kinematic extraction and behavioral quantification.",
    challenge: "Turn raw recordings into a structured analysis workflow that other people could reuse.",
    constraints: "Multiple recording types, kinematic extraction needs, and the need for dependable outputs.",
    approach: "Built a pipeline to move from raw recordings to structured behavioral quantification.",
    result: "Clearer analysis outputs and a better handoff between recording and interpretation.",
    role: "Developed the analysis workflow and supported its organization.",
    bullets: ["Supports structured analysis workflows.", "Helps turn raw recordings into usable outputs."],
  },
];

export const evidenceItems = [
  {
    title: "Behavioral system architecture",
    body: "Live control stack for training, timing, and rig coordination.",
    proof: "Automation, hardware timing, and repeatable operation.",
  },
  {
    title: "Research data pipeline",
    body: "NWB-oriented workflow for getting raw data into a structured analysis path.",
    proof: "Cleaner handoff between acquisition and downstream review.",
  },
  {
    title: "Web/database tooling",
    body: "Secure internal systems built around SQL Server, Caspio, and JavaScript.",
    proof: "Operational tooling for program management and information flow.",
  },
  {
    title: "Validation and maintenance workflow",
    body: "SOPs, testing gates, inventory, and preventive maintenance kept visible.",
    proof: "Safer deployment and easier upkeep in a live lab.",
  },
];

export const contactPrompt =
  "If you need someone who can make research systems more reliable, less manual, and easier to maintain, send a note. I am also open to collaborations, questions, and conversations about roles.";

export const contactLinks = [
  { label: "Email", href: "mailto:Benjamin.g.reynolds@ucdenver.edu", value: "Benjamin.g.reynolds@ucdenver.edu" },
  { label: "Phone", href: "tel:+13035472170", value: "303-547-2170" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/benjamin-reynolds", value: "LinkedIn" },
];

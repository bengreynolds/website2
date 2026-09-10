/* Section order is the page order. "skills" is the one new anchor; the other
   five are load-bearing permalinks and must not change. */
export const navigation = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
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

/* Primary tools only. The resume carries the exhaustive list. Grouped by the
   kind of work rather than by language, so the breadth is visible: the same
   project usually draws on four of these six. */
export const skillGroups = [
  {
    title: "Languages",
    items: ["Python", "C++", "MATLAB", "Rust", "SQL", "JavaScript"],
  },
  {
    title: "Scientific Python",
    items: ["NumPy / SciPy", "Pandas", "OpenCV", "pyqtgraph", "PyNWB / NeuroConv"],
  },
  {
    title: "Applications and delivery",
    items: [
      "PySide6",
      "wxPython",
      "PyInstaller",
      "Conda",
      "Docker",
      "Git",
      "Linux / Windows",
    ],
  },
  {
    title: "Acquisition and control",
    items: [
      "DeepLabCut",
      "Multi-camera capture",
      "NI-DAQ / PXI",
      "FLIR Spinnaker",
      "Closed-loop control",
      "Frame and TTL sync",
      "CAN bus",
    ],
  },
  {
    title: "Embedded and electronics",
    items: [
      "Arduino",
      "Serial protocols",
      "KiCad",
      "PCB layout",
      "Load-cell sensing",
      "Sensor calibration",
    ],
  },
  {
    title: "Mechanical and fabrication",
    items: [
      "Fusion 360",
      "Inventor",
      "SolidWorks",
      "3D printing",
      "Fabrication release",
      "Bench testing",
    ],
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
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Application",
        items: ["PySide6", "staged import to write workflow", "screen models kept out of the widgets"],
      },
      {
        group: "Conversion",
        items: ["NeuroConv-first routing", "direct PyNWB write for custom and hybrid", "61 source adapters"],
      },
      {
        group: "Validation",
        items: ["PyNWB schema", "NWB Inspector", "artifact existence, as three services"],
      },
      {
        group: "Packaging",
        items: ["49 optional dependency groups", "routes registered only when present"],
      },
      {
        group: "Predecessor",
        items: ["nwbconv CLI", "modality auto-detection from the data itself"],
      },
    ],
    tools: ["PySide6", "PyNWB", "NeuroConv", "NWB Inspector"],
    bullets: [
      "Grouped related recording files into reviewable sessions.",
      "Added metadata conflict review before file assembly.",
      "Validated output through PyNWB and NeuroConv workflows.",
      "Preserved provenance and recovery information for auditability.",
    ],
    demos: [
      {
        /* Not a mock. Every frame is a screenshot of the real desktop app
           driven through one conversion end to end, and every number beside
           it was read off that run - including the nine conflicts it actually
           found and the 197,056 bytes it actually wrote. The session is the
           small checked-in hybrid example, so the figures are modest; they are
           real, which the invented ones that used to sit here were not. */
        kind: "walkthrough",
        id: "nwbforge-walkthrough",
        label: "Conversion walkthrough",
        app: "NWB Forge",
        session: "example-hybrid-01 · hybrid pathway · 2 sources",
        dwell: 4600,
        caption:
          "One hybrid session converted in the real application: a manifest-backed supported source and a custom source, normalised against one canonical key set, validated, and written to NWB with its evidence beside it. The write is gated - nothing reaches disk until the pre-write checklist clears.",
        steps: [
          {
            id: "ingest",
            label: "Ingest",
            shot: "/app/nwbforge-ingest.webp",
            alt: "NWB Forge conversion screen with the hybrid session loaded and readiness blocked.",
            headline: "Session loaded, write blocked",
            note: "Two sources arrive with nothing in common. The app will not write anything yet, and says exactly which gates are open rather than greying a button out silently.",
            facts: [
              { label: "Stage", value: "draft" },
              { label: "Validation", value: "not available" },
              { label: "Artifacts", value: "0" },
              { label: "Readiness", value: "Blocked", state: "blocked" },
            ],
          },
          {
            id: "output",
            label: "Output",
            shot: "/app/nwbforge-output.webp",
            alt: "The output path field filled in, with the output checklist row switched to done.",
            headline: "One gate clears",
            note: "Naming the destination flips a single checklist row. Preview and metadata review are still outstanding, so the write stays disabled - and the disabled label stays readable, which it was not before this pass.",
            facts: [
              { label: "Checklist", value: "2 of 4 done" },
              { label: "Session loaded", value: "done", state: "done" },
              { label: "Output path", value: "done", state: "done" },
              { label: "Write", value: "still disabled", state: "blocked" },
            ],
          },
          {
            id: "preview",
            label: "Preview",
            shot: "/app/nwbforge-preview.webp",
            alt: "After building the preview: stage review, nine metadata conflicts, readiness needs review.",
            headline: "Nine disagreements found",
            note: "Building the preview is where the work happens. Both sources are read, their metadata normalised onto one canonical key set, and every field where the two disagree is surfaced. Nine did.",
            facts: [
              { label: "Stage", value: "draft → review" },
              { label: "Conflicts found", value: "9", state: "review" },
              { label: "Sources compared", value: "2" },
              { label: "Readiness", value: "Needs Review", state: "review" },
            ],
          },
          {
            id: "conflicts",
            label: "Review",
            shot: "/app/nwbforge-conflicts.webp",
            alt: "The metadata review tab listing nine pending conflicts with the selected item's detail.",
            headline: "Every conflict is on the record",
            note: "Each one names the canonical key, the value that won, and the adapter that produced it - annotations.operator_note resolved from adapter_extracted - with the recommended action stated rather than implied.",
            facts: [
              { label: "Conflicts", value: "9" },
              { label: "Pending review", value: "9", state: "review" },
              { label: "Resolved", value: "0" },
              { label: "Overrides applied", value: "0 session, 0 source" },
            ],
          },
          {
            id: "written",
            label: "Write",
            shot: "/app/nwbforge-written.webp",
            alt: "Conversion completed: stage completed, zero validation issues, two artifacts.",
            headline: "Written and validated in one run",
            note: "PyNWB writes the file and NWB Inspector validates it in the same pass, so the file and the verdict on it are produced together rather than one being trusted about the other.",
            facts: [
              { label: "Stage", value: "completed", state: "done" },
              { label: "Validation", value: "0 errors, 0 warnings", state: "done" },
              { label: "Written", value: "197,056 bytes" },
              { label: "Readiness", value: "Completed", state: "done" },
            ],
          },
          {
            id: "artifacts",
            label: "Evidence",
            shot: "/app/nwbforge-artifacts.webp",
            alt: "The artifacts tab listing the written NWB file and its validation report.",
            headline: "The evidence ships with the file",
            note: "The validation report is written beside the NWB, so a reviewer can audit the conversion later instead of taking it on trust. That is the whole argument for the tool.",
            facts: [
              { label: "Artifacts", value: "2", state: "done" },
              { label: "nwb", value: "example-hybrid-01.nwb" },
              { label: "validation_report", value: "validation-report.json" },
              { label: "Auditable", value: "yes", state: "done" },
            ],
          },
        ],
      },
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "Layered so the domain does not know about Qt",
        body: [
          "The package splits into domain, adapters, normalization, mapping, validation, persistence, an app service layer, and only then the Qt widgets. The architecture notes state the constraint directly: the domain models stay independent of the interface, the adapters and PyNWB. That is what lets the conversion run without a window open.",
          "The workflow itself is a ten-state machine, from draft through sources added, inspecting, normalizing, mapping, review, validating and ready to write to completed or failed, over three declared pathways: supported, custom and hybrid. The walkthrough on this page is the hybrid one.",
        ],
        source: "nwbforge/src/nwbforge/domain/enums, docs/architecture",
      },
      {
        heading: "Sixty-one adapters, and only the ones you need",
        body: [
          "Supported formats go through NeuroConv first; only custom or hybrid assembly falls back to writing PyNWB directly. Sixty-one NeuroConv-backed source adapters are exported lazily across nine families, and a registry matches each source against every adapter's own capability check rather than a filename convention.",
          "Each acquisition format is an independently installable extra: the project declares forty-nine optional dependency groups, so a machine installs SpikeGLX or Suite2p or ScanImage and nothing else, and a route is only registered when its dependencies are actually present.",
        ],
        source: "nwbforge/pyproject.toml, src/nwbforge/adapters/registry",
      },
      {
        heading: "Validation and review are separate services on purpose",
        body: [
          "Artifact existence, PyNWB schema validation and NWB Inspector best-practice checks are three services rather than one pass, and each writes its report as an artifact. Review state is kept apart from validation output: approve, reject and acknowledge decisions are recorded as their own machine-readable artifact, and warnings or blocks require an explicit decision rather than defaulting through.",
          "Normalization is alias-rule driven, and a value it cannot resolve is surfaced instead of guessed. That is the mechanism behind the nine conflicts the walkthrough finds.",
        ],
        source: "nwbforge/docs/architecture/validation-services.md, review-workflow.md",
      },
      {
        heading: "Where it actually is",
        body: [
          "Worth stating plainly, because the walkthrough looks finished: the README says the platform is not yet packaged for release, and there is no console-script entry point. It launches through a script whose own docstring calls it a temporary desktop launcher. What the frames show is real and reproducible; what it is not yet is installable by somebody else.",
        ],
        source: "nwbforge/README.md, scripts/run_app.py",
      },
    ],
  },
  {
    id: "automated-multicamera-training-control-system",
    title: "Autonomous Behavioral Training Rig",
    category: "automation",
    tags: ["automation", "hardware", "data", "software"],
    featured: true,
    figure: "buildup",
    /* Frame count of the generated sprite, used to map wheel notches to
       frames. Must match the grid in src/rig-buildup.css. */
    figureFrames: 100,
    figureLabel:
      "Assembly sequence of the training rig, built up from bare corner legs through horizontal bars, platform rails, the cage, tunnel, pellet delivery, camera and Jetson modules, then the floor, side panels, doors and panel connectors.",
    demos: [
      {
        id: "pellet",
        /* Two figures, one button, played together: the module as installed
           and the same cycle close on the mechanism. Both sprites are 81
           frames over the same duration, so they stay frame-locked. */
        ids: ["pellet", "pellet-close"],
        label: "Pellet delivery",
        caption:
          "One load-and-send cycle, in context and close up at the same time. Order and servo angles come from the rig's own move_config: barrier out, traverse, drop, scoop through 109°, lift, arm back to flush, barrier closed over the pellet, send. Colour marks what moves together - the lift rides the X carriage, which rides the base - and the vat is drawn translucent so the scoop stays visible inside it.",
      },
      {
        id: "tunnel",
        label: "Head-fix clamp",
        caption:
          "Releasing and re-engaging the head clamp, 28° off the shoulder-screw axis. Servo horn, push rod, spring and swing are solved as the four-bar they are, off pivots measured from the pin bores. Each part that moves carries its own colour.",
      },
      {
        id: "pcb",
        label: "Control board",
        /* Two corrections from reading the board's own repository. The design
           is LeafLabs work - five of their contributors against four commits
           of mine, and an "ll" devicetree vendor prefix - so the caption says
           so, the way the lick-port card already names a board it did not
           design. And the six identical connectors are BNC coax for stimulus
           in and out, not motor and CAN. */
        caption:
          "The board that drives the pellet module, designed by LeafLabs and integrated here, called out group by group across its layout. Six BNC connectors for stimulus in and out, then the drive and sensing hardware.",
      },
    ],
    summary:
      "A self-operating neuroscience rig. I designed the enclosure and its mechanisms, then integrated synchronized cameras, a three-axis pellet delivery, and machine-learning tracking into a loop that runs training sessions with nobody in the room.",
    challenge:
      "Reach training needed an operator present for every session, which capped throughput and made results depend on who was running the rig.",
    approach:
      "Designed the enclosure, pellet mechanism, and mounts in CAD, then integrated multi-camera acquisition, DeepLabCut tracking, CAN bus motor control, and load-cell sensing into a closed loop with tone cues, barrier servos, and recovery paths for unattended overnight operation.",
    role: "Designed the enclosure and mechanisms in CAD, and built, deployed, and maintain the integration that runs on them.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Mechanical",
        items: ["Fusion 360", "215-part enclosure", "three-axis pellet delivery", "servo scoop and barrier"],
      },
      {
        group: "Boards",
        items: ["STM32G474RET", "ATA6561 CAN transceiver", "three TMC2209 drivers", "NAU7802 24-bit ADC"],
      },
      {
        group: "Firmware",
        items: ["Zephyr RTOS", "nine custom drivers", "JerryCAN, fourteen message modules", "pybind11"],
      },
      {
        group: "Vision",
        items: ["FLIR Spinnaker", "hardware primary and secondary trigger", "DeepLabCut", "ten tracked parts"],
      },
      {
        group: "Compute",
        items: ["Jetson AGX", "JetPack 5.1", "50 W power mode"],
      },
      {
        group: "Services",
        items: ["ZeroMQ", "Avahi and mDNS discovery", "Socket.IO bridge", "one nginx gateway"],
      },
      {
        group: "Protocols",
        items: ["JSON phase documents per animal", "schema served over MCP"],
      },
    ],
    tools: ["Fusion 360", "DeepLabCut", "CAN bus", "Jetson"],
    bullets: [
      "Designed a 215-part enclosure carrying every module, cable route, and panel connector.",
      "Built a three-axis pellet delivery with servo scoop and barrier, driven over CAN.",
      "Synchronized multi-camera capture with tracking and hardware control.",
      "Closed the loop on detected movement, with load-cell and presence sensing as guards.",
      "Designed repeatable startup, validation, and recovery so sessions survive being left alone.",
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "One namespace, seven modules, installed separately",
        body: [
          "The codebase is a monorepo by convenience rather than by architecture, and says so: the modules install on devices independently and the loose coupling is meant to be assumed. They are core, video, device, inference, behavior, model and the Qt layer, with four applications on top: acquisition with a GUI, headless acquisition, a tunnel test and a pellet delivery test.",
          "Session flow is a finite state machine deliberately split from a separate behaviour algorithm, so that the decisions about training can be changed by somebody who understands the science without learning the state machine.",
        ],
        source: "auto-trainer/auto-trainer-behavior/README.md",
      },
      {
        heading: "Twenty guards, because nobody is in the room",
        body: [
          "Unattended operation is what the detectors are for: roughly twenty named monitors including animal evasion, animal thrash, autoclamp evasion, headbar pressure, load-cell tare drift, presence in cage, external doors, board hardware reset, free disk space, a watchdog and a system fault.",
          "Cameras are addressed by URL rather than by index, with a scheme, a camera id and query parameters, so a serial number selects a FLIR camera and the primary and secondary parameters configure hardware triggering between the two. Pose inference runs as its own process behind an engine-agnostic interface, so the tracker can be replaced.",
        ],
        source: "auto-trainer/auto-trainer-core/src/autotrainer/core/analysis, auto-trainer-video/README.md",
      },
      {
        heading: "The boards, and whose they are",
        body: [
          "Both custom boards are STM32G474 with a shared CAN transceiver. The pellet board carries three TMC2209 stepper drivers, an audio amplifier and speaker, a flash part and six BNC coaxial connectors; the head-fix board carries a 24-bit load-cell ADC and a MEMS microphone. The board design is LeafLabs work, integrated here rather than drawn here.",
          "Firmware is a Zephyr workspace with two in-tree board definitions and nine custom drivers, each with its own devicetree binding and shell commands. The CAN protocol is a named library with fourteen message modules and build-time size assertions on every message struct, exposed to Python through pybind11 so the same definitions cross the language boundary once.",
        ],
        source: "auto-trainer-hardware/firmware, hardware/manufacturing BOMs",
      },
      {
        heading: "Updated over the bus, and found by mDNS",
        body: [
          "Firmware is updated in place over CAN by module address rather than reflashed on the bench, and there is a terminal application for bring-up that reads and manipulates live module state over the same bus.",
          "Each rig is one Jetson AGX prepared by a script that takes the unit name and uses it as hostname, remote-view identifier and notification identifier. Devices then advertise themselves over mDNS rather than being configured into a list, and a registry keys them by name and can aggregate remote registries into one view.",
        ],
        source: "auto-trainer-hardware/README.md, auto-trainer-device-deployment",
      },
      {
        heading: "Protocols are documents, not code",
        body: [
          "A training protocol is a JSON document of phases with actions, predicates, value providers and hardware settings, tracked per animal. Its schema is exposed to language-model tooling through an MCP server, so a protocol can be generated and validated against the schema rather than hand-edited.",
          "Event logs are read back through a browser tool that parses the CSV client-side, rebuilds the nested lifecycle of sessions, trials, clamp cycles and analysis passes, and virtual-scrolls tens of thousands of events.",
        ],
        source: "auto-trainer-training/README.md, auto-trainer-event-viewer",
      },
    ],
  },
  {
    id: "reachaq-acquisition-platform",
    title: "reachAQ Acquisition Platform",
    category: "software",
    tags: ["software", "data", "automation"],
    featured: true,
    summary:
      "The autonomous trainer's codebase re-adapted back into an operator-run acquisition system, moved off embedded hardware onto workstations with laboratory DAQ instrumentation.",
    challenge:
      "The operator-run reach-training system I helped build first was superseded by the autonomous trainer, which handled sessions, recovery, and data far more rigorously. Those improvements were locked to Jetson hardware and to running unattended, so operator-driven work could not benefit from them.",
    /* "rather than forking a copy" was contradicted by the repositories: the
       hardware repo opens by declaring itself a fork of the upstream
       Mouse-GYM one and carries a PROVENANCE.md recording it. Scoped rather
       than dropped, because both halves are true of different things - the
       software module set was re-adapted, the hardware repository is a
       maintained fork. */
    approach:
      "Took the trainer's module set as the base rather than duplicating it, and maintains the hardware repository as a fork of upstream. Re-adapted for operator-modulated acquisition on x86_64 Ubuntu workstations: PEAK CAN in place of Jetson-native CAN, NI-DAQ and PXI instrumentation added, and module boundaries kept loose enough that each installs independently.",
    role: "Led the re-platforming, the instrumentation swap, and the reproducible offline install path.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Platform",
        items: ["Ubuntu 22.04 x86_64", "conda environment", "desktop launcher, single instance"],
      },
      {
        group: "Instrumentation",
        items: ["NI-DAQmx", "PXIe-1073 chassis over MXI", "channel plan, discovery, preflight, timing"],
      },
      {
        group: "Bus",
        items: ["PEAK SocketCAN", "systemd bring-up units", "reset scoped by channel ownership"],
      },
      {
        group: "Cameras",
        items: ["FLIR Spinnaker 3.2", "wheels vendored per platform behind a manifest"],
      },
      {
        group: "Release",
        items: ["SHA-256 firmware bundles", "app and firmware version-gated against each other"],
      },
      {
        group: "Validation",
        items: ["session rule engine", "atomic session writes", "colony metadata over HTTPS and RFID"],
      },
    ],
    tools: ["Ubuntu x86_64", "NI-DAQ / PXI", "PEAK CAN", "FLIR Spinnaker"],
    bullets: [
      "Carried the trainer's core, video, device, inference, and behavior modules onto a new platform.",
      "Replaced Jetson-native CAN with PEAK CAN and added NI-DAQ and PXI acquisition.",
      /* Was "a staged, checksum-verified offline install". Reading the repo,
         that fused three different mechanisms: the workstation installer is
         staged but online (apt, Miniconda, pip, a CUDA user-space pull); what
         is checksum-verified is the pellet firmware bundle; what is vendored
         for offline use is three Spinnaker wheels behind a manifest. Split
         into what each one actually is. */
      "Staged the workstation install as one re-runnable script that reports PASS, FAIL, SKIP or PLAN per step rather than stopping at the first failure.",
      "Vendored the camera SDK wheels behind a per-platform manifest, and released pellet firmware as a SHA-256 verified bundle so a rig flashes without a build toolchain.",
      "Documented the build so a second rig can be reproduced without the original builder present.",
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "A fork, deliberately",
        body: [
          "The repository is a GitHub fork of the trainer, and the hardware repository carries a provenance file that states the reason: the maintained repository is a fork, not a source-only copy, so upstream history and authorship stay attached. The re-platform target is written into the code guidelines themselves, moving from Jetson and Ubuntu 20.04 to Ubuntu 22.04 on x86_64.",
          "The port is a subtraction as well as an addition, which the summary above does not say: the whole head-fix and tunnel subsystem is gone on this branch, along with its application, its pressure monitor and its evasion detectors. Operator-run acquisition does not head-fix.",
        ],
        source: "reachAQ-hardware/PROVENANCE.md, tree diff against auto-trainer",
      },
      {
        heading: "CAN recovery that refuses to overreach",
        body: [
          "Moving off Jetson-native CAN meant PEAK SocketCAN with its own boot service, and a reset helper that is root-owned and narrowly permitted. It serializes and debounces restarts, refuses to reset a channel owned by another process, and its documentation says outright that it is not a physical emergency stop or a board power cycle.",
          "NI instrumentation is new code rather than configuration: signal-stream and laser drivers in the device module, port and stream configuration in core, and six acquisition-layer models covering channel plan, discovery, preflight, a sample ring, a signal monitor and timing.",
        ],
        source: "reachAQ@devel/auto-trainer-device/src/autotrainer/device/can_ownership.py",
      },
      {
        heading: "An installer that reports instead of stopping",
        body: [
          "The workstation installer is one option-less script that deliberately does not stop at the first failure, so a single failing category does not block the rest. Every step reports pass, fail, skip or plan, a summary always prints, re-running is the supported repair path, and the exit code only turns nonzero after every eligible step has run.",
          "It also draws an explicit boundary: it installs no vendor kernel drivers, selects no camera serial or DAQ channel or CAN bitrate, and installs the CAN tools without enabling the service, because that is intentionally a separate reviewed hardware step.",
        ],
        source: "reachAQ@devel/tools/install/reachaq-linux-install.sh",
      },
      {
        heading: "Tone timing, down to the signal",
        body: [
          "The first firmware change made on this side is narrow and documented at the signal level: one stimulus line asserts for the whole 5 kHz tone interval and another for the whole 6 kHz interval, both clear on any other frequency or on a completion, abort or tone-start failure, and two further lines stay unassigned. That is what lets tone timing be correlated against the DAQ afterwards.",
          "Firmware and application are version-gated against each other through a tracked compatibility table and a runtime check, and the release records its own reference binary with a checksum.",
        ],
        source: "reachAQ-hardware/docs/releases/v2.0.0.md",
      },
    ],
  },
  {
    id: "motion-analysis-reporting-suite",
    title: "Reach-to-Grasp Motion Analysis Suite",
    category: "software",
    tags: ["data", "software"],
    featured: true,
    summary:
      "A headless analysis engine folded into ReachX, so intersession and intrasession results come out of the same app that curates the reaches.",
    challenge:
      "Analysis lived in its own toolkit, apart from the app researchers curated in. Comparing sessions meant exporting from one program and reloading into another, and each figure was rebuilt by hand rather than rerun.",
    approach:
      "Rebuilt analysis as a Qt-free backend inside ReachX on the development branch: stable request and result contracts, cancelable background tasks, and a thin interface layer over them. Nothing in the compute path imports a widget.",
    role: "Designed the analysis backend, the session-selection and metric model, and the intersession workflow.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Backend",
        items: ["frozen request and result contracts", "cancelable background tasks", "no Qt in the compute path"],
      },
      {
        group: "Metrics",
        items: ["fifty-seven declared", "outcome composition", "reach timing", "hand kinematics"],
      },
      {
        group: "Interface",
        items: ["PySide6", "pyqtgraph", "dockable windows", "PNG and SVG export"],
      },
      {
        group: "Inference",
        items: ["TensorFlow 2.10.1", "ResNet backbone", "tf-slim", "pinned to Python 3.10"],
      },
      {
        group: "Tests",
        items: ["offscreen Qt platform", "synthetic trajectories", "no recorded data required"],
      },
    ],
    tools: ["NumPy", "pyqtgraph", "PySide6", "Headless compute"],
    bullets: [
      "Kept widgets out of the compute path so the analysis runs headless.",
      "Compared session summaries across mice, dates, rigs, and named condition groups.",
      "Added an intrasession mode for reach-level distributions inside a single session.",
      "Covered training progression, outcome composition, reach timing, and kinematics.",
      "Ran calculations as cancelable background tasks and saved reusable analysis workspaces.",
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "The boundary is written in the module",
        body: [
          "The analysis module states its own constraint in its docstring: it intentionally contains no Qt widget classes, and defines stable request and result structures with cancelable background tasks. That sentence is what makes the compute path runnable headless, and it is the reason the same engine serves the interface and a script.",
          "The metric surface is enumerated rather than ad hoc: fifty-seven declared metrics spanning success rate, outcome composition, reach counts, timing, inter-reach interval, per-reach distributions and hand kinematics including peak velocity, peak acceleration, path length, straightness and maximum extension.",
        ],
        source: "ReachX/reachx/data/intersession.py",
      },
      {
        heading: "Comparison as orthogonal choices",
        body: [
          "Rather than a pile of boolean switches, comparison behaviour is modelled as separate enumerations for scope, aggregation, grouping, series, x-axis, statistical overlay, error bars and outcome value, plus three more for trajectories, over frozen request, filter and option contracts.",
          "Long calculations run as cancelable background tasks with a per-session summary cache keyed on a trajectory fingerprint, so rerunning does not redo work whose inputs have not changed. Analysis definitions save as reusable workspaces with their own migration path, held separately from the session workspace.",
        ],
        source: "ReachX/reachx/data/intersession.py, reachx/config/intersessionworkspaces.py",
      },
      {
        heading: "Tested without recorded data",
        body: [
          "The validation suite runs on the standard-library test runner under an offscreen Qt platform and generates its own synthetic trajectories, which means it covers plot construction, workspace migration, window and dock restoration and image export without requiring real experiment data to be present.",
          "The application does not depend on DeepLabCut: modelling and inference are TensorFlow with a ResNet backbone adapted from DeepLabCut source, pinned by one real constraint, since the last release with native Windows GPU support fixes both the framework and the Python version. That divergence is the reason a model converter has to exist at all.",
        ],
        source: "ReachX/tests/test_intersession_analysis.py, reachx/modeling/resnet.py",
      },
    ],
  },
  {
    id: "application-deployment-support-toolkit",
    title: "Research Application Deployment and Support Toolkit",
    category: "software",
    tags: ["software", "hardware", "automation"],
    summary:
      "One repository behind the lab's research software: install and update, camera alignment and recovery, model conversion, and git activity logging.",
    challenge:
      "A growing internal portfolio had to be installable, updateable, and supportable without a developer present, and the utilities that kept sessions usable were scattered as isolated scripts.",
    approach:
      "Structured the utilities as submodules of a single toolkit on one shared environment. Each installs and runs on its own, but they are released, launched, and documented together.",
    role: "Owned release packaging, environment management, launch behavior, and the operator-facing utilities.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Distribution",
        items: ["Conda environment", "pip wheels from releases", "PowerShell updater and launchers"],
      },
      {
        group: "Alignment",
        items: ["OpenCV", "ffprobe verification", "dry run, backup and undo"],
      },
      {
        group: "Logging",
        items: ["Rust 1.70", "shell-hook capture", "size and retention rotation", "values sanitised before write"],
      },
      {
        group: "Conversion",
        items: ["bidirectional model formats", "curation workbooks", "annotation regeneration"],
      },
      {
        group: "Diagnostics",
        items: ["thirteen-stage GPU suite", "JSON and HTML reports"],
      },
    ],
    tools: ["Conda", "PowerShell", "Rust", "Git hooks"],
    bullets: [
      "Installer: Windows launcher, updater, and desktop shortcuts that manage the application environment for non-developers.",
      "Camera alignment: previews compensated frames beside the originals, then applies the fix under dry-run, backup, and undo.",
      "Recording recovery: detects frame-count mismatches, stops unsafe corrections, verifies paired output, and regenerates tracking artifacts from legacy folders.",
      "Model conversion: GUI and command-line conversion of pose-estimation models between the analysis app and DeepLabCut formats.",
      "Git monitor: a hook-based command logger that keeps a shared record of repository activity across machines.",
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "One parent repository, five submodules",
        body: [
          "The toolkit is a parent repository whose submodules are the installer, the camera alignment tool, the model converter, the git logger and the training tools, all sharing a single conda environment. A sixth tool, a GPU health suite, sits alongside them.",
          "The installer is script-based by choice rather than omission, and the README says so: it does not build standalone executables. It installs a launcher and an updater with generated icons and shortcuts, and the updater has no Python environment of its own. It drives the application's environment from outside, fetches the newest release wheel, and on a same-version reinstall runs two explicit forced steps.",
        ],
        source: "reachx-tools/.gitmodules, reachx-installer/README.md",
      },
      {
        heading: "Alignment that previews, backs up, and refuses",
        body: [
          "The camera tool shows master, raw secondary and compensated secondary frames side by side before it writes anything, then applies the fix under a dry run, a backup and an undo, and verifies the paired output afterwards with both a container probe and real frame reads.",
          "It also refuses past a threshold: a frame-count mismatch beyond one hundred frames is treated as a significant acquisition error and stops the tool rather than being corrected, and mid-recording hardware drops produce a warning instead of a silent fix. Compensation keeps one authoritative clock, so the master timeline is fixed and offsets apply only to selected secondary cameras.",
        ],
        source: "cam-align/src/cam_align_tool/core/engine.py, postcheck.py, inspect.py",
      },
      {
        heading: "A logger that sanitises before it writes",
        body: [
          "The git monitor is a Rust binary that logs a timestamp, repository and command per line, sanitises sensitive values before writing, and rotates by size and retention. It captures through shell hooks rather than by polling processes, because hooks give the most accurate repository context on Windows, and it ships as a prebuilt bundle for three platforms so operators never compile it.",
          "Its predecessor is still in the tree as the shell-and-Python version of the same idea, with a timeline visualiser and separate user and developer guides written for researchers who need to check out an old tag to reanalyse data.",
        ],
        source: "git-log-access/src/service/logger.rs, hooks.rs",
      },
    ],
  },
  {
    id: "haptic-device-validation-test-bench",
    title: "Prosthetic Sensation Test Bench",
    category: "hardware",
    tags: ["hardware", "automation"],
    figure: "prosthetic-build",
    /* Must match the grid in src/rig-prosthetic-build.css. */
    figureFrames: 144,
    figureLabel:
      "Assembly sequence of the prosthetic sensation test bench. The base sheet stays fixed while every other phase descends onto it: extruded corner posts and cross members, the seesaw shaft supports and bearings, the rotary shaft, the plank, the transducer and its plunger, the shim flexure carrying the load cell and dowel, the amplifier, the control electronics, then the top sheet and standing mat.",
    demos: [
      {
        id: "prosthetic-function",
        label: "How it works",
        caption:
          "How a trial runs, held wide through the placement so the seesaw reads before the camera closes in. The prosthesis settles onto the 5 mm dowel, rotating the seesaw 5.9 degrees until the dowel sits flush with the mat and a 4.69 N preload appears at the load cell. The transducer then drives at 8, 16, 64 and 128 Hz, about two seconds each so the change in rate is unmistakable. The view closes onto the beam itself, cropping the transducer body away, so the chain is what you watch: the green plunger strokes up and down, the yellow beam pivots, and the red shim bends - clamped to its support at one end and deflecting only at the free end - while the dowel itself moves only slightly and never lifts the foot. That is the whole point of the bench - the deflection goes into the shim and the load cell, not into the limb. Measured travel is 0.19 in at the plunger against 0.07 in at the dowel. The trace runs at true signal time, so each frequency shows its real cycle count in the same 0.25 s window, with the slowdown printed per segment. The shim's real deflection is about 7.6 um peak-to-peak, exaggerated far beyond scale here to be visible at all.",


      },
    ],
    summary:
      "A calibrated bench delivering controlled haptic stimulation, with load-cell feedback verifying force, timing, and repeatability.",
    challenge:
      "Evaluating tactile response hardware required a consistent method under controlled, measurable conditions.",
    approach:
      "Combined mechanical design, frequency control, sensing, electronics, and load-cell feedback into a calibrated test workflow.",
    role: "Led the mechanical and electrical integration, calibration strategy, and validation workflow.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Mechanical",
        items: ["Fusion 360", "seesaw on a rotary shaft", "shim flexure clamped at one end"],
      },
      {
        group: "Instrumentation",
        items: ["load cell on the flexure", "signal conditioning amplifier"],
      },
      {
        group: "Drive",
        items: ["frequency-controlled transducer", "8, 16, 64 and 128 Hz"],
      },
      {
        group: "Measured",
        items: ["4.69 N preload", "5.9 degree tilt", "0.19 in at the plunger against 0.07 in at the dowel"],
      },
    ],
    tools: ["Fusion 360", "Load-cell sensing", "Signal conditioning", "Frequency control"],
    bullets: [
      "Designed mechanical fixtures for repeatable device placement.",
      "Integrated stimulation control, sensing, and calibration.",
      "Structured the bench workflow around repeatable test conditions.",
    ],
  },
  {
    id: "multi-solution-lickometer",
    title: "Multi-Solution Lickometer",
    category: "hardware",
    tags: ["hardware", "automation", "software"],
    demos: [
      {
        id: "lickrevolver-build",
        label: "Assembly",
        caption:
          "The rig built up from the floor and T-slot frame, through the servo drive and its gear train, the eight-vial carousel, the fluid path, the shutter servo and solenoid valve, the control board and wiring, and finally the lid. Colour groups the parts that go on together, and the enclosure is drawn translucent so each stage stays visible inside it.",
      },
      {
        id: "lickrevolver-trial",
        /* Three figures, one button: the trial in context, the spout
           mechanism close up, and the operator interface stepping through
           the same trial. All three are 81 frames over the same duration,
           so the protocol table tracks the rig rather than sitting still. */
        ids: ["lickrevolver-trial", "lickrevolver-trial-close", "lickrevolver-ui"],
        label: "Trial demo",
        caption:
          "Two trials, structured the way the rig runs them. One protocol row is one trial. The spouts sit retracted while the carousel indexes a single 45° step to the next vial; the spouts are then presented once, 90° about the servo's gear axis taken from the assembly's coaxial mate. The rewarded side shows green and the other red, the outcome flashes with a ring around that side, and the spouts retract once - that retraction is where the next trial begins. The second trial swaps which side pays out and flashes red: a miss rather than a reward. Colour marks what moves; every other part keeps its Inventor appearance. The rig is symmetric and the second spout and solenoid are reconstructed across the assembly's own centre plane, since the master CAD currently carries one side.",
      },
    ],
    summary:
      "An eight-vial carousel that presents a different solution on each trial, with the mechanism, the firmware, and the operator interface built as one instrument.",
    challenge:
      "Taste-preference work needed many solutions offered to one animal in a single session, without an operator swapping bottles between trials and without the swap itself becoming the variable.",
    approach:
      "Designed the carousel and its gear train in Inventor, then wrote the firmware and a wxPython interface against one serial protocol. The interface holds the protocol and the per-vial assignments, the board holds the trial state machine and the timing.",
    role: "Designed the mechanism, wrote the firmware and the operator interface, and defined the serial protocol between them.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Mechanical",
        items: ["Inventor", "four-stage gear train", "eight-vial carousel", "45 degree index step"],
      },
      {
        group: "Firmware",
        items: ["Arduino", "three-state trial machine", "servo angles mapped to pulse width"],
      },
      {
        group: "Delivery",
        items: ["two shutter servos", "two solenoid valves", "purge buttons wired to fire only when idle"],
      },
      {
        group: "Detection",
        items: ["three TTL lick channels", "each confirmed by a second read 500 us later"],
      },
      {
        group: "Interface",
        items: ["wxPython", "acquisition in a separate process", "Excel protocol sheet read with pandas"],
      },
      {
        group: "Link",
        items: ["nine-command serial protocol", "framed in both directions", "partial messages survive a read"],
      },
    ],
    tools: ["Inventor", "Arduino", "wxPython", "Serial protocol"],
    bullets: [
      "Built a four-stage gear train that indexes eight vials off a single servo.",
      "Gated delivery with two shutter servos and two solenoid valves, with manual purge for priming.",
      /* Was "per-vial solution assignments held in YAML". The YAML holds the
         port, mode, two delays, two idle timeouts and the acid orientation;
         the per-vial table is a pandas-read Excel protocol. The three modes
         were right, the storage was not. */
      "Ran manual, randomized, and automated protocols against a per-vial solution table read from an Excel protocol sheet.",
      "Guarded sessions with separate idle timeouts for the main and reward spouts.",
      "Framed the serial link so the interface and the board both recover from a partial message.",
    ],
    /* Repo-derived. Each part cites the files behind it so a claim can
       be checked rather than taken on trust. */
    deepDive: [
      {
        heading: "The board owns the trial, the interface owns the protocol",
        body: [
          "The carousel is defined in firmware as eight equal positions computed at boot, so one index step is 45 degrees, mapped to a servo pulse width. The board holds the trial state machine, idle then main-spout listen then reward listen, entered on a vial change, and the state transition itself is what emits the markers the interface logs.",
          "Three lick channels are read as separate TTL inputs, one main and two reward, and each detection is confirmed by a second read half a millisecond later before it counts.",
        ],
        source: "kinnamon-lick/Arduino_LickRevolver/LickRevolver/LickRevolver_v4.ino",
      },
      {
        heading: "Priming is hardware, so it cannot fire mid-trial",
        body: [
          "Two momentary purge buttons open their solenoid directly rather than through a software mode, and only while the trial state is idle. A purge therefore cannot interrupt a trial, which is a property of the wiring rather than of the firmware's good behaviour.",
          "Idle timeouts are genuinely separate per spout: two values set by distinct serial commands, swapped in on state entry, each expiry emitting its own marker before the shutters close and the board returns to idle.",
        ],
        source: "kinnamon-lick firmware, LickRevolver_v4.ino",
      },
      {
        heading: "A framed protocol that survives a partial read",
        body: [
          "The serial protocol is a single letter plus an optional integer, nine commands wide. Framing is explicit in both directions: the board echoes the command character, then a marker, then a closing marker to complete a handshake, and every event is terminated. The host splits on those delimiters and re-buffers the remainder, so a message cut in half survives to the next read.",
          "Events decode through a fifteen-entry table, each carrying a session-relative millisecond timestamp, and the acquisition loop runs in a separate process communicating through shared values, so a stalled interface cannot stall the trial.",
        ],
        source: "kinnamon-lick/arduinoCtrl_LickRevolver_v2.py, LickRevolver_GUI_v2.py",
      },
    ],
  },
  {
    id: "lick-port-reward-hardware",
    title: "Lick Port and Reward Delivery Hardware",
    category: "hardware",
    tags: ["hardware"],
    summary:
      "The reward port and detection hardware behind lick-based behavior rigs: an operant box designed to a colleague's protocol, and a build package that made an existing detection board deployable.",
    challenge:
      "Lick experiments depended on hardware that either did not exist yet or existed only as a bare circuit, so every new rig meant re-solving the same port geometry and packaging problems.",
    approach:
      "Designed the behavior box and reward port in Inventor around another researcher's protocol. Separately, took an existing dual-comparator detection circuit from bare board to deployable unit with an enclosure and a complete manufacturing release.",
    role: "Designed the behavior box and reward port for a colleague's experiment. On the detection board, which I did not design, I built the enclosure and the manufacturing release and integrated it into rigs.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Mechanical",
        items: ["Inventor", "panel-built operant box", "machined and PVC variants"],
      },
      {
        group: "Assembly",
        items: ["nose cone", "spout clamp", "dropper", "electronics mount"],
      },
      {
        group: "Release",
        items: ["laser and waterjet files cut to order", "extruded aluminium enclosure with custom end plates"],
      },
      {
        group: "Integration",
        items: ["inherited dual-comparator detection board", "schematic through pick-and-place data"],
      },
    ],
    tools: ["Inventor", "Enclosure design", "Laser and waterjet release", "Pick-and-place data"],
    bullets: [
      "Designed a panel-built operant box with machined and PVC variants for different housing needs.",
      "Drew the nose cone, spout clamp, dropper, and electronics mount as one reward-port assembly.",
      "Released laser and waterjet files so panels and endplates could be cut to order.",
      "Packaged the inherited detection board into an extruded aluminium enclosure with custom end plates and bezel.",
      "Assembled its manufacturing release, schematic through pick-and-place data, so the board reorders without its original designer.",
    ],
  },
  {
    id: "neonatal-hypoxia-chamber",
    title: "Neonatal Hypoxia Chamber",
    category: "hardware",
    tags: ["hardware"],
    summary:
      "A sealed chamber for controlled-atmosphere work on neonatal rodents, with a calibrated oxygen monitor and bench controls designed alongside it.",
    challenge:
      "The protocol calls for a descent to 8% oxygen and a timed hold. A chamber that leaks makes the setpoint meaningless, and a reading nobody trusts makes the protocol unverifiable.",
    approach:
      "Designed the chamber for sealing first, then built the instrumentation around it: an oxygen sensor with stored calibration, nitrogen and air on face-mount solenoids, a mixing fan, and a display and encoder so the rig is usable with no computer attached.",
    role: "Designed the chamber and its gas handling, built the monitoring and calibration firmware, and am developing the automated protocol runner.",
    /* The project page's stack, grouped by layer. `tools` above stays
       the four-chip version a tile can hold; this is where the parts,
       versions and counts go. */
    stack: [
      {
        group: "Mechanical",
        items: ["Inventor", "O-ring groove", "magnetic latch", "captive panel screws"],
      },
      {
        group: "Gas",
        items: ["nitrogen and air on face-mount solenoids", "quick-turn couplings", "tachometer mixing fan"],
      },
      {
        group: "Sensing",
        items: ["oxygen sensor with stored calibration", "8 percent setpoint"],
      },
      {
        group: "Interface",
        items: ["LCD", "encoder and two buttons"],
      },
    ],
    tools: ["Inventor", "Arduino", "Gas handling", "EEPROM calibration"],
    bullets: [
      "Sealed the enclosure with an O-ring groove, magnetic latch, and captive panel screws, iterating through internal and external hinge layouts.",
      "Plumbed nitrogen and air through face-mount solenoids and quick-turn couplings, with a tachometer fan mixing the volume.",
      "Built a calibrated oxygen readout whose calibration is stored in EEPROM, so it survives a power cycle.",
      "Put the rig behind an LCD, encoder, and two buttons so a session needs no laptop at the bench.",
      "In progress: staging the timed descent-and-hold protocol so a run advances without an operator watching the meter.",
    ],
  },
];

/* BEGIN GENERATED tilePlacements
   Written by scripts/seed_tile_placements.py --seed 20260910.
   Do not hand-edit: rerun the script to change the grid. */
export const tilePlacements = {
  "scientific-data-standardization-platform": "plate-bottom",
  "automated-multicamera-training-control-system": "plate-top",
  "haptic-device-validation-test-bench": "plate-bottom",
  "multi-solution-lickometer": "plate-top",
};
/* END GENERATED tilePlacements */

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

/* ==========================================================================
   Signal path
   --------------------------------------------------------------------------
   The narrative spine. One reach, from the box the animal is in to a file
   another lab can trust, told as seven stages with the projects that own
   each one named against it.

   EVERY sentence below is a re-sequencing of strings that already appear
   earlier in this file. The source phrase is cited in a comment on each
   field. The narrative may order and frame those facts; it may not add any.
   If a claim here cannot be traced upward, it is a bug.
   ========================================================================== */

/* Skills, not projects. This section answers "who is this" rather than
   "what did he build", so nothing here names a project or borrows a project
   figure. Every claim is a competence the CV and the capability list already
   assert; the wording is written for this section because no existing string
   describes a skill in general terms.

   Image slugs match public/skills/<slug>.webp. A slug with no file renders a
   labelled placeholder rather than a gap, so the section ships either way.
   Licence and attribution per image live in src/skillCredits.js. */
export const skillsIntro =
  "Eight things I am actually asked to do. Most projects need four of them at once, which is the reason they sit on one page instead of in separate lists.";

export const skills = [
  {
    n: "01",
    id: "software",
    title: "Software development",
    subtitle: "Firmware, desktop interfaces, data pipelines",
    image: "01-software",
    lede: "Most of what I build is software that has to run unattended on somebody else's bench. That means firmware on a microcontroller, a desktop interface a researcher opens every morning, and the pipeline underneath both, written so each part installs and fails on its own rather than as one block. Python and C++ carry most of it, with Rust and MATLAB where they fit better.",
    readout: [
      { label: "Languages", value: "Python 3.10 / C++ / Rust 1.70 / MATLAB" },
      { label: "Interfaces", value: "PySide6 / wxPython / React and TypeScript" },
      { label: "Embedded", value: "Zephyr RTOS / Arduino / nine custom drivers" },
      { label: "Services", value: "ZeroMQ / Socket.IO / ASP.NET Core / nginx" },
      { label: "Patterns", value: "FSM split from policy / namespace packages / cancelable tasks" },
    ],
  },
  {
    n: "02",
    id: "automation",
    title: "Closed-loop automation",
    subtitle: "Sense, decide, drive, recover",
    image: "02-automation",
    lede: "A system that only records is easier to build than one that decides. Closed-loop work means reading a sensor or a tracked position, deciding inside a deadline, and driving hardware back, with a defined path for the case where the decision arrives late. The control is rarely the hard part; the guards around it are.",
    readout: [
      { label: "Bus", value: "CAN 2.0, fourteen message modules, size asserts at build" },
      { label: "Actuation", value: "three stepper axes at 8 microsteps / four servos, 900 to 2100 us" },
      { label: "Sensing", value: "NAU7802 24-bit load cell / headbar pressure / cage presence" },
      { label: "Guards", value: "about twenty named detectors, watchdog, tare drift, disk space" },
      { label: "Update", value: "firmware in place over the bus, addressed by module" },
    ],
  },
  {
    n: "03",
    id: "cad",
    title: "CAD and 3D modeling",
    subtitle: "Drawn to be manufactured, not rendered",
    image: "03-cad",
    lede: "Enclosures, mechanisms and mounts, designed toward the constraints that actually decide the part: how it is cut, how it seals, whether a cable reaches its connector, and whether a person can service it afterwards. Printed parts for iteration, machined and waterjet panels for anything that has to hold.",
    readout: [
      { label: "CAD", value: "Fusion 360 / Inventor / SolidWorks" },
      { label: "Scale", value: "a 215-part enclosure carrying every cable route and connector" },
      { label: "Sealing", value: "O-ring groove / magnetic latch / captive panel screws" },
      { label: "Fabrication", value: "3D print for iteration / machined and PVC panels" },
      { label: "Release", value: "laser and waterjet files, cut to order" },
    ],
  },
  {
    n: "04",
    id: "electronics",
    title: "Electronics and PCB design",
    subtitle: "Schematic, layout, and the bench work after",
    image: "04-electronics",
    lede: "Schematic capture, board layout, and the bench testing that tells you whether the board does what the schematic claimed. I treat the manufacturing release as part of the design: a board that cannot be reordered without its original designer present is not finished.",
    readout: [
      { label: "Layout", value: "KiCad, schematic through pick-and-place" },
      { label: "MCU", value: "STM32G474RET with an ATA6561 CAN transceiver" },
      { label: "Drive", value: "three TMC2209 stepper drivers / TPA2005D1 amplifier / W25Q16JV flash" },
      { label: "Instrument", value: "NAU7802 24-bit ADC / IMP23ABSU MEMS microphone" },
      { label: "Interface", value: "six BNC coaxial lines for stimulus in and out" },
    ],
  },
  {
    n: "05",
    id: "acquisition",
    title: "Data acquisition and instrumentation",
    subtitle: "Trustworthy numbers, and proof they line up",
    image: "05-acquisition",
    lede: "Getting a number off an instrument is easy; being able to defend it later is the discipline. The recurring problem is not sampling but alignment: which frame corresponds to which trigger, and how you demonstrate that after the session is over. Most of the effort goes into synchronisation and into the record that makes it checkable.",
    readout: [
      { label: "DAQ", value: "NI-DAQmx / PXIe-1073 chassis over MXI / channel plan and preflight" },
      { label: "Cameras", value: "FLIR Spinnaker 3.2, hardware primary and secondary triggering" },
      { label: "CAN", value: "PEAK SocketCAN with a scoped reset that checks channel ownership" },
      { label: "Timing", value: "frame and TTL sync / a stimulus line asserted per tone interval" },
      { label: "Rule", value: "a device counts only once NI-DAQmx sees it, not once lspci does" },
    ],
  },
  {
    n: "06",
    id: "ml-vision",
    title: "Machine learning and computer vision",
    subtitle: "Pose estimation used as a sensor",
    image: "06-ml-vision",
    lede: "Applied rather than research: tracking and pose estimation used as an input to a system that has to act on it. That means training and converting models, confirming inference holds its rate on the machine it will actually run on, and knowing what the model does when the subject leaves the frame.",
    readout: [
      { label: "Tracking", value: "DeepLabCut across ten tracked body parts" },
      { label: "Inference", value: "TensorFlow 2.10.1, ResNet backbone, tf-slim" },
      { label: "Stereo", value: "an 8 by 6 checkerboard, DLC-3D calibration, usable alpha near 0.47" },
      { label: "Process", value: "inference in its own process behind an engine-agnostic interface" },
      { label: "Conversion", value: "bidirectional model and result formats, retrainability preserved" },
    ],
  },
  {
    n: "07",
    id: "statistics",
    title: "Statistical analysis",
    subtitle: "Results that survive being questioned",
    image: "07-statistics",
    lede: "Turning sessions into results somebody else can check. I build analysis as a headless backend with stable inputs and outputs, so a figure is regenerated rather than rebuilt by hand, and I have run mixed-methods studies end to end, from design through quantitative and qualitative analysis to the written report.",
    readout: [
      { label: "Numerics", value: "NumPy / SciPy / pandas" },
      { label: "Figures", value: "pyqtgraph, with PNG and SVG export" },
      { label: "Surface", value: "fifty-seven declared metrics: outcome, timing, kinematics" },
      { label: "Contracts", value: "frozen request and result structures, no Qt in the compute path" },
      { label: "Studies", value: "mixed methods, design through quantitative analysis to report" },
    ],
  },
  {
    n: "08",
    id: "deployment",
    title: "Deployment, documentation and support",
    subtitle: "Whether it still runs in six months",
    image: "08-deployment",
    lede: "The part that decides whether any of the above is still working once I am not in the room. Packaged installers and pinned environments so a non-developer can update a rig, written SOPs and versioned documentation so a procedure outlives whoever wrote it, and a validation gate before an update reaches a machine somebody is collecting on.",
    readout: [
      { label: "Packaging", value: "Conda / pip wheels from releases / PowerShell launchers" },
      { label: "Verification", value: "SHA-256 bundles / a pip report, and a fallback when pip writes none" },
      { label: "Services", value: "systemd units / Avahi service files / one nginx gateway" },
      { label: "Recovery", value: "dry run, backup and undo, and a refusal past a 100-frame mismatch" },
      { label: "Practice", value: "SOPs, versioned documentation, a validation gate before rollout" },
    ],
  },
];

/* --------------------------------------------------------------------------
   Derived lookups
   Nothing below introduces a fact. Each value is either a subset of a string
   above or a path already written above.
   -------------------------------------------------------------------------- */

/* The fixed rail is a 15rem column and cannot hold a five-word title, so it
   gets fewer of the same words. No entry adds a word that is not already in
   that project's own `title`. */
export const shortTitles = {
  "scientific-data-standardization-platform": "Data Standardization",
  "automated-multicamera-training-control-system": "Behavioral Training Rig",
  "reachaq-acquisition-platform": "reachAQ",
  "motion-analysis-reporting-suite": "Motion Analysis Suite",
  "application-deployment-support-toolkit": "Deployment Toolkit",
  "haptic-device-validation-test-bench": "Sensation Test Bench",
  "multi-solution-lickometer": "Multi-Solution Lickometer",
  "lick-port-reward-hardware": "Lick Port Hardware",
  "neonatal-hypoxia-chamber": "Hypoxia Chamber",
};

const projectById = new Map(projects.map((project) => [project.id, project]));

export const findProject = (id) => projectById.get(id);

/* Resolves a { project, demo } reference on a stage back to the one demo
   object on the project, so a caption is written once and read twice. */
export function resolveDemo(ref) {
  const project = projectById.get(ref.project);
  if (!project || !project.demos) return null;
  return project.demos.find((demo) => demo.id === ref.demo) || null;
}

/* Resolves a stage's { project, demo, step } reference to one captured frame
   of the walkthrough. */
export function resolveShot(ref) {
  const demo = resolveDemo(ref);
  if (!demo || !demo.steps) return null;
  const step = demo.steps.find((entry) => entry.id === ref.step);
  return step ? { demo, step } : null;
}

/* The plate image for a work tile: the poster of the scroll figure the
   project already carries, else the poster of its first demo, else the first
   captured frame of its walkthrough. Posters are 4-46KB, so the whole grid
   costs less than one sprite sheet. Four projects have no render at all and
   render as typographic tiles instead, which is what makes the grid
   asymmetric rather than nine equal cards. */
function indexShot(project) {
  /* A demo sprite first, deliberately. A project's scroll figure and its
     demos are two different mechanisms: a demo is time-based and plays once
     from .is-playing, while a scroll figure is scrubbed by a view() timeline
     and does nothing on hover. The tile wants the one that moves when it is
     pointed at, so a project with demos uses a demo even when it also has a
     figure, and the figure keeps the project page where scrolling drives it. */
  const demo = project.demos && project.demos.find((entry) => entry.kind !== "walkthrough");
  if (demo) {
    const id = (demo.ids && demo.ids[0]) || demo.id;
    return { kind: "demo", id, src: `/rig/${id}-poster.webp` };
  }

  if (project.figure) {
    return {
      kind: "figure",
      id: project.figure,
      src: `/rig/${project.figure}-poster.webp`,
    };
  }

  /* A walkthrough has no sprite at all, only captured frames of the real
     application, so the tile shows one of those. */
  const walkthrough = project.demos && project.demos.find((entry) => entry.steps);
  if (walkthrough) {
    return { kind: "shot", src: walkthrough.steps[0].shot };
  }

  return null;
}

/* `n` is the project's permanent figure number and is used as its label
   everywhere: the tile, the rail, and the project page. It is derived from
   source order, so reordering `projects` renumbers the site coherently. */
export const workIndex = projects.map((project, index) => ({
  project,
  n: String(index + 1).padStart(2, "0"),
  short: shortTitles[project.id] || project.title,
  shot: indexShot(project),
}));

/* Neighbours for the previous / next control on a project page. Wraps, so
   the last project's "next" is the first: a reader paging through should
   never reach a dead control. */
export const workNeighbours = (id) => {
  const i = workIndex.findIndex((entry) => entry.project.id === id);
  if (i < 0) return { prev: null, next: null };
  const n = workIndex.length;
  return {
    prev: workIndex[(i - 1 + n) % n],
    next: workIndex[(i + 1) % n],
  };
};

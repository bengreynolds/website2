/* Section order is the page order. "skills" is the one new anchor. The
   others are load-bearing permalinks and must not change - except
   "capabilities", which is gone: that section repeated the skills inventory
   and was deleted rather than redesigned. */
export const navigation = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Selected Work" },
  { id: "experience", label: "Experience" },
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "The conversion runs without the window",
        body: [
          "The domain models, the adapters, the normalisation and mapping layers, the validation services and the persistence layer all sit below the interface and none of them import it. A conversion is therefore something the application asks for rather than something the application is, which is what lets the same code run from a script, in a test, or on a machine with no display attached.",
          "The workflow is a ten-state machine over three pathways: supported sources routed through NeuroConv, custom sources assembled directly, and hybrid sessions that mix the two in one file. A session cannot skip a state, so a file that reached disk went through review and validation to get there.",
        ],
      },
      {
        heading: "Sixty-one formats without sixty-one installs",
        body: [
          "Sixty-one source adapters cover nine families of acquisition hardware, and a registry matches an incoming source against each adapter's own capability check rather than against a filename pattern. A format nobody has seen before is a new adapter, not a change to the router.",
          "Every format is an independently installable extra, forty-nine dependency groups in all, and a route only appears once its dependencies are present. A rig that records SpikeGLX and Suite2p installs those two and carries none of the weight of the other fifty-nine, which is the difference between a tool a lab can actually deploy and one that needs a six-gigabyte environment to open.",
        ],
      },
      {
        heading: "Disagreement is surfaced, not resolved quietly",
        body: [
          "Normalisation maps every source's metadata onto one canonical key set through alias rules, and any field where two sources disagree is raised rather than silently won by whichever was read last. The nine conflicts in the walkthrough above are that mechanism working.",
          "Validation is three services rather than one pass: artifacts are checked for existence, the file is checked against the NWB schema, and NWB Inspector checks it against best practice. Review is kept separate again, so an approve or a reject is recorded as its own artifact and a warning has to be acknowledged by a person instead of defaulting through.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Neuroscience data goes stale because the person who recorded it is the only one who knows how. Converting to a standard format is the well-understood part; the hard part is being able to show, later, that the conversion did not quietly lose or invent anything. This writes the file and the evidence for the file in one pass, so a dataset arrives somewhere else with its own audit trail attached and can be trusted without its author in the room.",
        ],
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "Seven modules that install apart",
        body: [
          "The rig's software is one namespace across seven modules - core, video, device, inference, behavior, model and the Qt layer - each installable on its own. Four applications sit on top: acquisition with an interface, headless acquisition, and two test applications for the head-fix and pellet subsystems, so a mechanism can be exercised without running a session around it.",
          "Session flow is a state machine, and the decisions about training are deliberately not in it. They live in a separate behaviour algorithm, so the science can change without touching the machinery that keeps the rig safe.",
        ],
      },
      {
        heading: "Twenty guards, because nobody is in the room",
        body: [
          "Running overnight unattended is not a feature you add, it is a set of things you refuse to let happen. Around twenty named detectors watch for animal evasion and thrashing, clamp evasion, headbar pressure, load-cell tare drift, presence in the cage, external doors, board resets, free disk space, watchdog timeouts and system faults, and each has a defined response rather than a log line.",
          "Cameras are addressed by URL rather than index, so a FLIR camera is selected by serial number and the trigger relationship between two of them is part of the address. Pose inference runs in its own process behind an interface that does not name its engine, so the tracker can be replaced without touching acquisition.",
        ],
      },
      {
        heading: "Two boards, one bus, and whose design",
        body: [
          "Both custom boards are STM32G474 sharing a CAN transceiver: the pellet board carrying three stepper drivers, an audio amplifier and speaker, flash, and six BNC lines for stimulus in and out, and the head-fix board carrying a 24-bit load-cell converter and a MEMS microphone. The board design is LeafLabs work, integrated here rather than drawn here.",
          "The firmware is a Zephyr workspace with nine custom drivers, each with a devicetree binding and its own shell commands, so any subsystem can be driven by hand from a console during bring-up. The CAN protocol is a library of fourteen message modules with size assertions checked at build time, and the same definitions are exposed to Python through pybind11 so the host and the boards cannot drift apart about what a message means.",
        ],
      },
      {
        heading: "Updated over the bus, found by name",
        body: [
          "Firmware goes on over CAN by module address, not by carrying a laptop and a programmer to the bench, and a terminal application reads and manipulates live module state over the same bus while the rig is assembled.",
          "Each rig is a single Jetson prepared by one script that takes the unit name and uses it as hostname, remote-view identifier and alert identifier at once. Rigs then announce themselves over mDNS instead of being configured into a list, so the management plane discovers a new rig rather than being told about it.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Reach training used to need somebody present for every session, which capped how much data a lab could collect and made the results depend on who was running the rig that day. Moving the operator out changes the unit of throughput from a person-hour to a night, and it removes the largest uncontrolled variable in the experiment at the same time. Protocols being documents rather than code is the part that makes that durable: a researcher can change what an animal is trained to do without asking an engineer.",
        ],
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "Forked on purpose",
        body: [
          "The platform is a fork of the trainer rather than a copy of it, which keeps the upstream history and authorship attached to every line that came across. Work continues on both sides without either becoming a snapshot of the other, and it stays possible to see which changes are original to the operator-run system.",
          "The target moved from an embedded board to a standard workstation, and the port removed as much as it added: the head-fix and tunnel subsystem is gone entirely, along with its application, its pressure monitoring and its evasion detectors, because an operator-run session does not head-fix. What remained is the part that was worth carrying.",
        ],
      },
      {
        heading: "Recovery that refuses to overreach",
        body: [
          "Moving off board-native CAN meant a PEAK interface with its own boot service, and a reset helper that is deliberately narrow: root-owned, permitted for exactly one action, serialised and debounced so two requests cannot fight, and refusing outright to reset a channel another process owns. It is not an emergency stop and does not pretend to be one, which matters because the failure it recovers from looks identical to the failure it must not touch.",
          "The instrumentation layer is new code rather than configuration: drivers for signal streaming and laser control, port and stream configuration, and six models covering channel planning, device discovery, preflight checks, a sample ring, signal monitoring and timing.",
        ],
      },
      {
        heading: "An installer that reports instead of stopping",
        body: [
          "Installation is one script with no options that deliberately continues past a failure, so a machine missing one driver category still gets everything else. Every step reports pass, fail, skip or plan, a summary always prints, and re-running is the documented repair path rather than a thing to be avoided.",
          "It also refuses to guess: it installs no vendor kernel drivers, selects no camera serial or channel or bitrate, and installs the CAN tools without enabling the service, because bringing a bus up on a rig somebody is collecting on is a reviewed step and not an install detail.",
        ],
      },
      {
        heading: "Tone timing, down to the signal",
        body: [
          "A stimulus line asserts for the whole duration of one tone and a second line for the other, and both clear on any other frequency or on a completion, abort or tone-start failure. That gives the acquisition side a hardware-timed edge to correlate against instead of a software timestamp taken near the event.",
          "Firmware and application are version-gated against each other through a tracked compatibility table and a check at runtime, so a rig cannot quietly run a build the software was not written for.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "The autonomous trainer solved session handling, recovery and data integrity far more rigorously than the operator-run system it replaced, and all of that was locked to embedded hardware and to running unattended. This puts those same improvements in front of an operator on ordinary workstations with laboratory instrumentation attached, so the careful work does not stay stranded on one class of machine.",
        ],
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "No widgets in the compute path",
        body: [
          "The analysis engine contains no interface classes at all. It exposes stable request and result structures and cancelable background tasks, which means the same code answers a question asked by a window, a test, or a script, and a long calculation can be abandoned without leaving the application in a half-finished state.",
          "The metric surface is enumerated rather than assembled ad hoc: fifty-seven declared metrics spanning success rate, outcome composition, reach counts, timing, inter-reach interval, per-reach distributions, and hand kinematics including peak and mean velocity, peak acceleration, path length, straightness and maximum extension.",
        ],
      },
      {
        heading: "Comparison as choices, not switches",
        body: [
          "How sessions are compared is modelled as separate, orthogonal choices - scope, aggregation, grouping, series, axis, statistical overlay, error bars, outcome value, and three more for trajectories - over frozen request and filter contracts. Adding a way to slice the data is a new value in one enumeration rather than another boolean threaded through the call path.",
          "Results are cached against a fingerprint of the trajectories they came from, so rerunning an analysis whose inputs have not changed costs nothing, and an analysis definition saves as a reusable workspace with its own migration path so last year's comparison still opens.",
        ],
      },
      {
        heading: "Tested without recorded data",
        body: [
          "The test suite generates its own synthetic trajectories and runs the interface headless, which means plot construction, workspace migration, window and dock restoration and image export are all covered without a copy of real experiment data being present. A contributor can verify the application on a laptop.",
          "Inference is a ResNet-backed stack adapted from DeepLabCut source rather than a dependency on DeepLabCut itself, which is what makes the format converter in the toolkit necessary and also what keeps this application's training and inference independent of another project's release schedule.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Analysis used to live in a separate toolkit from the application researchers curated in, so comparing sessions meant exporting from one program and reloading into another, and every figure was rebuilt by hand. Folding the engine into the same application makes a result something you rerun rather than something you remake, which is the difference between a figure you trust and a figure you hope you reproduced.",
        ],
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "One repository, five tools, one environment",
        body: [
          "The toolkit is a parent repository whose submodules are the installer, the camera alignment tool, the model converter, the git logger and the training tools, sharing a single environment so a support task does not begin with an environment problem. A sixth tool, a GPU health suite, answers the narrow question of whether a machine's chosen environment actually sees its GPU.",
          "There are no standalone executables and that is deliberate. A launcher and an updater are installed with shortcuts, and the updater keeps no environment of its own: it drives the application's environment from outside, fetches the newest release, and on a same-version reinstall forces the wheel and its dependencies explicitly, so a repair is a real repair.",
        ],
      },
      {
        heading: "Previews, backs up, and refuses",
        body: [
          "The camera tool shows the master frame, the raw secondary and the compensated secondary side by side before it writes anything, then applies the correction under a dry run, a backup and an undo, and verifies the result afterwards with both a container probe and real frame reads.",
          "It also stops rather than guessing. A frame-count mismatch beyond a hundred frames is treated as a real acquisition failure and refused, and mid-recording hardware drops produce a warning instead of a silent correction, because a session quietly patched into looking correct is worse than one flagged as broken. Compensation keeps one authoritative clock, so the master timeline never moves.",
        ],
      },
      {
        heading: "A logger that sanitises before it writes",
        body: [
          "The git monitor is a small Rust binary that records a timestamp, repository and command per line, strips sensitive values before writing, and rotates by size and retention. It captures through shell hooks rather than by watching processes, which is what gives it accurate repository context, and it ships prebuilt for three platforms so nobody has to compile it to use it.",
          "Its predecessor is still in the tree as the shell and Python version of the same idea, with a timeline viewer and separate guides written for researchers who need to check out an old tag to reanalyse data.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "A growing portfolio of internal software fails in a specific way: it becomes unusable the moment its author is unavailable. Everything here exists to remove that dependency. An update is a shortcut a non-developer clicks, a broken recording has a tool that can inspect and refuse it, a model can move between formats, and a year later there is a record of what was run against which version of the code.",
        ],
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
    /* Greater depth on the project itself: what it does, what is
       notable about how it does it, and what it is worth to whoever
       uses it. No citations - naming the file a fact came from reads
       as a reference rather than as an explanation. */
    deepDive: [
      {
        heading: "The board owns the trial",
        body: [
          "Eight carousel positions are computed at boot, so one index step is exactly 45 degrees and the geometry lives in one constant rather than in a table someone has to keep correct. The trial state machine is on the board, not on the host: it enters a state on a vial change, and the state transition itself is what emits the markers the interface records, so the timing of an event is the timing of the hardware rather than of a serial read.",
          "Three lick channels are separate inputs and each detection is confirmed by a second read half a millisecond later, which is what separates a lick from electrical noise on a line running beside a solenoid.",
        ],
      },
      {
        heading: "Priming is wiring, not a mode",
        body: [
          "Two momentary buttons open their solenoid directly, and only while the trial state is idle. A purge therefore cannot interrupt a trial as a matter of how the circuit is built rather than as a matter of the firmware behaving. That distinction is what makes it safe to prime the lines with an animal already in the rig.",
          "Idle timeouts are genuinely separate per spout, set by their own commands and swapped in on state entry, each expiry emitting its own marker before the shutters close and the board returns to idle, so an abandoned trial is distinguishable in the record from a completed one.",
        ],
      },
      {
        heading: "A link that survives a partial read",
        body: [
          "The serial protocol is a single letter and an optional integer, nine commands wide, and framed in both directions: the board echoes the command, then a marker, then a closing marker, and every event is terminated. The host splits on those delimiters and re-buffers whatever is left over, so a message cut in half by a read boundary completes on the next one instead of corrupting the session.",
          "Events decode through a fifteen-entry table, each carrying a session-relative millisecond timestamp, and acquisition runs in its own process, so an interface busy redrawing cannot delay a trial.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "Taste-preference work needs many solutions offered to one animal in a session, and the usual way to do that is an operator swapping bottles between trials. That makes the swap itself a variable: it takes time, it varies between people, and it puts a hand in the rig. A carousel that indexes to the next solution in one step removes the operator from the inside of the experiment, and putting the trial state machine on the board means the timing in the record is the timing that happened.",
        ],
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
    terms: ["Firmware", "GUI", "UX", "Data pipelines"],
    image: "01-software",
    lede: "Most of what I build is software that has to run unattended on somebody else's bench. That means firmware on a microcontroller, a desktop interface a researcher opens every morning, and the pipeline underneath both, written so each part installs and fails on its own rather than as one block. Python and C++ carry most of it, with Rust and MATLAB where they fit better.",
    readout: [
      { label: "Languages", value: "Python, C++, C, Rust, MATLAB, SQL, JavaScript, TypeScript, PowerShell, Bash" },
      { label: "Desktop UI", value: "PySide6, Qt, Qt Designer, wxPython, Qt threading and signals" },
      { label: "Web and services", value: "React, Node, ASP.NET Core, nginx, REST, Socket.IO" },
      { label: "Concurrency and IPC", value: "ZeroMQ, multiprocessing, background task queues, pybind11" },
      { label: "Build and test", value: "CMake, Cargo, West, pytest, unittest, offscreen Qt, CI workflows" },
    ],
  },
  {
    n: "02",
    id: "automation",
    title: "Closed-loop automation",
    terms: ["Sensing", "Control", "Actuation", "Recovery"],
    image: "02-automation",
    lede: "A system that only records is easier to build than one that decides. Closed-loop work means reading a sensor or a tracked position, deciding inside a deadline, and driving hardware back, with a defined path for the case where the decision arrives late. The control is rarely the hard part; the guards around it are.",
    readout: [
      { label: "Buses and I/O", value: "CAN, SocketCAN, UART, RS-232, RS-485, I2C, SPI, TTL, GPIO, PWM" },
      { label: "Real time", value: "RTOS scheduling, finite state machines, watchdogs, debouncing, deadline handling" },
      { label: "Actuation", value: "stepper drive, microstepping, servo control, solenoid drive, gear trains" },
      { label: "Feedback", value: "load cells, encoders, limit and presence sensing, tare and drift compensation" },
      { label: "Firmware", value: "Zephyr, Arduino, STM32 HAL, devicetree, in-place update over bus" },
    ],
  },
  {
    n: "03",
    id: "cad",
    title: "CAD and 3D modeling",
    terms: ["Enclosures", "Mechanisms", "DFM", "Fabrication"],
    image: "03-cad",
    lede: "Enclosures, mechanisms and mounts, designed toward the constraints that actually decide the part: how it is cut, how it seals, whether a cable reaches its connector, and whether a person can service it afterwards. Printed parts for iteration, machined and waterjet panels for anything that has to hold.",
    readout: [
      { label: "CAD", value: "Fusion 360, Inventor, SolidWorks" },
      { label: "Modeling", value: "parametric solids, assemblies and mates, sheet metal, weldments, motion studies" },
      { label: "Design for manufacture", value: "tolerancing, press and clearance fits, O-ring seals, fastener stacks, cable routing" },
      { label: "Fabrication", value: "FDM, SLA, CNC machining, laser cutting, waterjet, extruded aluminium framing" },
      { label: "Release", value: "2D drawings, STEP, DXF, STL, BOM, cut files" },
    ],
  },
  {
    n: "04",
    id: "electronics",
    title: "Electronics and PCB design",
    terms: ["Schematic", "Layout", "Bring-up", "Release"],
    image: "04-electronics",
    lede: "Schematic capture, board layout, and the bench testing that tells you whether the board does what the schematic claimed. I treat the manufacturing release as part of the design: a board that cannot be reordered without its original designer present is not finished.",
    readout: [
      { label: "EDA", value: "KiCad, schematic capture, multi-layer layout, DRC and ERC" },
      { label: "Microcontrollers", value: "STM32, ARM Cortex-M, AVR" },
      { label: "Analog and drive", value: "op-amps, instrumentation amplifiers, comparators, 24-bit ADCs, motor drivers, MOSFET drive" },
      { label: "Interfaces", value: "CAN transceivers, RS-232, RS-485, USB, BNC and coax, JTAG and SWD" },
      { label: "Manufacture", value: "BOM, gerbers, pick-and-place, DFM review, reflow and rework, bring-up" },
    ],
  },
  {
    n: "05",
    id: "acquisition",
    title: "Data acquisition and instrumentation",
    terms: ["DAQ", "Cameras", "Sync", "Calibration"],
    image: "05-acquisition",
    lede: "Getting a number off an instrument is easy; being able to defend it later is the discipline. The recurring problem is not sampling but alignment: which frame corresponds to which trigger, and how you demonstrate that after the session is over. Most of the effort goes into synchronisation and into the record that makes it checkable.",
    readout: [
      { label: "DAQ", value: "NI-DAQmx, PXI, PXIe, MXI, analog and digital I/O, counters and timers" },
      { label: "Machine vision", value: "FLIR Spinnaker, GenICam, hardware triggering, high-speed capture, multi-camera rigs" },
      { label: "Synchronisation", value: "TTL, frame sync, clock alignment, timestamping, jitter budgeting" },
      { label: "Sensors", value: "load cells, strain gauges, oxygen sensors, encoders, microphones" },
      { label: "Calibration", value: "gain and offset, linearity, drift monitoring, traceable references" },
    ],
  },
  {
    n: "06",
    id: "ml-vision",
    title: "Machine learning and computer vision",
    terms: ["Tracking", "Training", "Inference", "Deployment"],
    image: "06-ml-vision",
    lede: "Applied rather than research: tracking and pose estimation used as an input to a system that has to act on it. That means training and converting models, confirming inference holds its rate on the machine it will actually run on, and knowing what the model does when the subject leaves the frame.",
    readout: [
      { label: "Frameworks", value: "TensorFlow, PyTorch, scikit-learn, JAX" },
      { label: "Vision", value: "OpenCV, DeepLabCut, anipose" },
      { label: "Calibration", value: "3D calibration, stereo and multi-camera, checkerboard, undistortion" },
      { label: "Models", value: "ResNet, RTMPose, tf-slim, transfer learning, augmentation" },
      { label: "Acceleration", value: "CUDA, cuDNN, Jetson, ONNX Runtime, GPU benchmarking" },
      { label: "Pipelines", value: "model training and inference, model conversion, batch and real-time" },
    ],
  },
  {
    n: "07",
    id: "statistics",
    title: "Statistical analysis",
    terms: ["Pipelines", "Statistics", "Kinematics", "Figures"],
    image: "07-statistics",
    lede: "Turning sessions into results somebody else can check. I build analysis as a headless backend with stable inputs and outputs, so a figure is regenerated rather than rebuilt by hand, and I have run mixed-methods studies end to end, from design through quantitative and qualitative analysis to the written report.",
    readout: [
      { label: "Numerics", value: "NumPy, SciPy, pandas, statsmodels" },
      { label: "Methods", value: "regression, ANOVA, mixed models, nonparametric tests, bootstrapping, effect sizes" },
      { label: "Signals", value: "filtering, segmentation, event detection, kinematics, peak and interval analysis" },
      { label: "Visualisation", value: "pyqtgraph, Matplotlib, seaborn" },
      { label: "Reproducibility", value: "parameterised pipelines, cached intermediates, versioned figure export" },
    ],
  },
  {
    n: "08",
    id: "deployment",
    title: "Deployment, documentation and support",
    terms: ["Packaging", "Environments", "SOPs", "Validation"],
    image: "08-deployment",
    lede: "The part that decides whether any of the above is still working once I am not in the room. Packaged installers and pinned environments so a non-developer can update a rig, written SOPs and versioned documentation so a procedure outlives whoever wrote it, and a validation gate before an update reaches a machine somebody is collecting on.",
    readout: [
      { label: "Packaging", value: "conda, pip, wheels, PyInstaller, installers and shortcuts" },
      { label: "Platforms", value: "Linux, Windows, Docker, systemd, PowerShell, bash" },
      { label: "GPU and embedded", value: "CUDA toolkit, cuDNN, NVIDIA drivers, JetPack, Jetson provisioning" },
      { label: "Version control", value: "git, hooks, tags and releases, submodules" },
      { label: "Operations", value: "service discovery, reverse proxy, TLS, log rotation, health checks" },
      { label: "Practice", value: "SOPs, runbooks, release notes, validation gates, vendor coordination" },
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

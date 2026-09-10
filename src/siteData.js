/* Section order is the page order. "path" is the narrative spine (see
   pathStages at the end of this file); the anchor ids of the other five are
   load-bearing permalinks and must not change. */
export const navigation = [
  { id: "home", label: "Home" },
  { id: "path", label: "Signal path" },
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
        caption:
          "The board that drives the pellet module, called out group by group across its layout. Six motor and CAN connectors, then the drive and sensing hardware.",
      },
    ],
    summary:
      "A self-operating neuroscience rig. I designed the enclosure and its mechanisms, then integrated synchronized cameras, a three-axis pellet delivery, and machine-learning tracking into a loop that runs training sessions with nobody in the room.",
    challenge:
      "Reach training needed an operator present for every session, which capped throughput and made results depend on who was running the rig.",
    approach:
      "Designed the enclosure, pellet mechanism, and mounts in CAD, then integrated multi-camera acquisition, DeepLabCut tracking, CAN bus motor control, and load-cell sensing into a closed loop with tone cues, barrier servos, and recovery paths for unattended overnight operation.",
    role: "Designed the enclosure and mechanisms in CAD, and built, deployed, and maintain the integration that runs on them.",
    tools: ["Fusion 360", "DeepLabCut", "CAN bus", "Jetson"],
    bullets: [
      "Designed a 215-part enclosure carrying every module, cable route, and panel connector.",
      "Built a three-axis pellet delivery with servo scoop and barrier, driven over CAN.",
      "Synchronized multi-camera capture with tracking and hardware control.",
      "Closed the loop on detected movement, with load-cell and presence sensing as guards.",
      "Designed repeatable startup, validation, and recovery so sessions survive being left alone.",
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
    approach:
      "Took the trainer's module set as the base rather than forking a copy, and re-adapted it for operator-modulated acquisition on x86_64 Ubuntu workstations: PEAK CAN in place of Jetson-native CAN, NI-DAQ and PXI instrumentation added, and module boundaries kept loose enough that each installs independently.",
    role: "Led the re-platforming, the instrumentation swap, and the reproducible offline install path.",
    tools: ["Ubuntu x86_64", "NI-DAQ / PXI", "PEAK CAN", "FLIR Spinnaker"],
    bullets: [
      "Carried the trainer's core, video, device, inference, and behavior modules onto a new platform.",
      "Replaced Jetson-native CAN with PEAK CAN and added NI-DAQ and PXI acquisition.",
      "Packaged a staged, checksum-verified offline install for workstations with restricted networking.",
      "Documented the build so a second rig can be reproduced without the original builder present.",
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
    tools: ["NumPy", "pyqtgraph", "PySide6", "Headless compute"],
    bullets: [
      "Kept widgets out of the compute path so the analysis runs headless.",
      "Compared session summaries across mice, dates, rigs, and named condition groups.",
      "Added an intrasession mode for reach-level distributions inside a single session.",
      "Covered training progression, outcome composition, reach timing, and kinematics.",
      "Ran calculations as cancelable background tasks and saved reusable analysis workspaces.",
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
    tools: ["Conda", "PowerShell", "Rust", "Git hooks"],
    bullets: [
      "Installer: Windows launcher, updater, and desktop shortcuts that manage the application environment for non-developers.",
      "Camera alignment: previews compensated frames beside the originals, then applies the fix under dry-run, backup, and undo.",
      "Recording recovery: detects frame-count mismatches, stops unsafe corrections, verifies paired output, and regenerates tracking artifacts from legacy folders.",
      "Model conversion: GUI and command-line conversion of pose-estimation models between the analysis app and DeepLabCut formats.",
      "Git monitor: a hook-based command logger that keeps a shared record of repository activity across machines.",
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
    tools: ["Inventor", "Arduino", "wxPython", "Serial protocol"],
    bullets: [
      "Built a four-stage gear train that indexes eight vials off a single servo.",
      "Gated delivery with two shutter servos and two solenoid valves, with manual purge for priming.",
      "Ran manual, randomized, and automated protocols against per-vial solution assignments held in YAML.",
      "Guarded sessions with separate idle timeouts for the main and reward spouts.",
      "Framed the serial link so the interface and the board both recover from a partial message.",
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

/* Sources: "Reach training needed an operator present for every session"
   (rig challenge), "Built a three-axis pellet delivery" (rig bullet), and
   "so complex datasets stay auditable and safe to share" (platform summary).
   The chain, not a new claim about it. */
export const pathIntro =
  "One animal reaches for one pellet, and that reach has to come out the other end as a file somebody else can audit. Seven stages sit between those two facts. Each one names the projects that own it.";

export const pathStages = [
  {
    n: "01",
    id: "enclosure",
    title: "The enclosure",
    /* "Designed a 215-part enclosure carrying every module, cable route, and
       panel connector." + "Designed the enclosure, pellet mechanism, and
       mounts in CAD" (rig) / "Designed a panel-built operant box with
       machined and PVC variants for different housing needs." (lick port) /
       "Sealed the enclosure with an O-ring groove, magnetic latch, and
       captive panel screws" (hypoxia chamber). */
    lede: "Nothing downstream exists until something holds it. The training rig is a 215-part enclosure carrying every module, cable route, and panel connector, drawn in CAD before any of it was integrated. The same problem recurs across the lab: a panel-built operant box with machined and PVC variants, and a chamber sealed with an O-ring groove, magnetic latch, and captive panel screws.",
    figure: {
      kind: "scrub",
      /* All three from the rig entry above: figure, figureFrames,
         figureLabel. The sheet size is the byte size of the checked-in
         public/rig/buildup.webp, stated because the reader opts into it. */
      id: "buildup",
      frames: 100,
      sheet: "3 MB",
    },
    /* Values lifted from rig.tools, lick-port.tools, the 215-part bullet and
       rig.figureFrames. */
    readout: [
      { label: "CAD", value: "Fusion 360 / Inventor" },
      { label: "Parts", value: "215" },
      { label: "Sequence", value: "100 frames" },
    ],
    owners: [
      {
        project: "automated-multicamera-training-control-system",
        note: "A 215-part enclosure carrying every module, cable route, and panel connector.",
      },
      {
        project: "lick-port-reward-hardware",
        note: "A panel-built operant box with machined and PVC variants.",
      },
      {
        project: "neonatal-hypoxia-chamber",
        note: "Sealed with an O-ring groove, magnetic latch, and captive panel screws.",
      },
    ],
  },
  {
    n: "02",
    id: "capture",
    title: "Restraint and capture",
    /* tunnel demo caption ("Releasing and re-engaging the head clamp, 28 deg
       off the shoulder-screw axis. Servo horn, push rod, spring and swing are
       solved as the four-bar they are, off pivots measured from the pin
       bores.") + rig bullet ("Synchronized multi-camera capture with tracking
       and hardware control.") + reachAQ approach ("x86_64 Ubuntu
       workstations: PEAK CAN in place of Jetson-native CAN, NI-DAQ and PXI
       instrumentation added"). */
    lede: "The animal has to be held still, and the cameras have to agree on when. The head clamp releases and re-engages 28 degrees off the shoulder-screw axis, solved as the four-bar it is off pivots measured from the pin bores. Above it, multi-camera capture is synchronized with tracking and hardware control, and that same acquisition core now also runs on x86_64 Ubuntu workstations with NI-DAQ and PXI instrumentation.",
    figure: {
      kind: "demos",
      demos: [
        { project: "automated-multicamera-training-control-system", demo: "tunnel" },
      ],
    },
    /* All four from skillGroups "Acquisition and control" and reachAQ.tools. */
    readout: [
      { label: "Cameras", value: "Multi-camera capture" },
      { label: "Sync", value: "Frame and TTL sync" },
      { label: "Driver", value: "FLIR Spinnaker" },
      { label: "DAQ", value: "NI-DAQ / PXI" },
    ],
    owners: [
      {
        project: "automated-multicamera-training-control-system",
        note: "Synchronized multi-camera capture with tracking and hardware control.",
      },
      {
        project: "reachaq-acquisition-platform",
        note: "NI-DAQ and PXI acquisition added on x86_64 workstations.",
      },
      {
        project: "application-deployment-support-toolkit",
        note: "Camera alignment, and recovery for frame-count mismatches.",
      },
    ],
  },
  {
    n: "03",
    id: "tracking",
    title: "Machine-learning tracking",
    /* rig approach ("integrated multi-camera acquisition, DeepLabCut
       tracking, CAN bus motor control, and load-cell sensing into a closed
       loop") + reachAQ bullet ("Carried the trainer's core, video, device,
       inference, and behavior modules onto a new platform.") + toolkit bullet
       ("Model conversion: GUI and command-line conversion of pose-estimation
       models between the analysis app and DeepLabCut formats."). */
    lede: "Frames become coordinates. DeepLabCut tracking is integrated into the loop rather than run after the session, and the trainer's core, video, device, inference, and behavior modules carried onto the re-platformed acquisition system intact. A GUI and command-line tool converts pose-estimation models between the analysis app and DeepLabCut formats, so a trained model is never stranded in one program.",
    /* No render exists for this stage because the stage is software. The
       readout takes the figure column rather than a placeholder. */
    figure: null,
    /* DeepLabCut and Jetson from rig.tools; OpenCV and NumPy / SciPy from
       skillGroups "Scientific Python". */
    readout: [
      { label: "Tracking", value: "DeepLabCut" },
      { label: "Vision", value: "OpenCV" },
      { label: "Compute", value: "NumPy / SciPy" },
      { label: "Runs on", value: "Jetson" },
    ],
    owners: [
      {
        project: "automated-multicamera-training-control-system",
        note: "DeepLabCut tracking integrated into the closed loop.",
      },
      {
        project: "reachaq-acquisition-platform",
        note: "The inference module carried onto a new platform.",
      },
      {
        project: "application-deployment-support-toolkit",
        note: "Model conversion between the analysis app and DeepLabCut formats.",
      },
    ],
  },
  {
    n: "04",
    id: "control",
    title: "Closed-loop control",
    /* rig approach ("CAN bus motor control, and load-cell sensing into a
       closed loop with tone cues, barrier servos, and recovery paths for
       unattended overnight operation") + rig bullet ("Closed the loop on
       detected movement, with load-cell and presence sensing as guards.") +
       pcb caption ("Six motor and CAN connectors, then the drive and sensing
       hardware."). */
    lede: "Detected movement is what closes the loop. Motor control goes out over CAN bus alongside tone cues and barrier servos, with load-cell and presence sensing as the guards that let a session run unattended overnight. The board driving the pellet module carries six motor and CAN connectors, then the drive and sensing hardware.",
    figure: {
      kind: "demos",
      demos: [
        { project: "automated-multicamera-training-control-system", demo: "pcb" },
        { project: "haptic-device-validation-test-bench", demo: "prosthetic-function" },
      ],
    },
    /* CAN bus from rig.tools; Load-cell sensing and Closed-loop control from
       skillGroups; the recovery row from the rig bullet "Designed repeatable
       startup, validation, and recovery so sessions survive being left
       alone." */
    readout: [
      { label: "Bus", value: "CAN bus" },
      { label: "Sensing", value: "Load-cell sensing" },
      { label: "Loop", value: "Closed-loop control" },
      { label: "Recovery", value: "Repeatable startup and validation" },
    ],
    owners: [
      {
        project: "automated-multicamera-training-control-system",
        note: "Closed the loop on detected movement, with sensing as guards.",
      },
      {
        project: "haptic-device-validation-test-bench",
        note: "Load-cell feedback verifying force, timing, and repeatability.",
      },
      {
        project: "multi-solution-lickometer",
        note: "The board holds the trial state machine and the timing.",
      },
      {
        project: "reachaq-acquisition-platform",
        note: "PEAK CAN in place of Jetson-native CAN.",
      },
      {
        project: "neonatal-hypoxia-chamber",
        note: "In progress: staging the timed descent-and-hold protocol.",
      },
    ],
  },
  {
    n: "05",
    id: "delivery",
    title: "The delivery mechanism",
    /* rig bullet ("Built a three-axis pellet delivery with servo scoop and
       barrier, driven over CAN.") + pellet caption (the move_config order and
       the 109 deg scoop) + lickrevolver-trial caption ("the carousel indexes a
       single 45 deg step to the next vial") + lickometer bullet ("Gated
       delivery with two shutter servos and two solenoid valves, with manual
       purge for priming."). */
    lede: "The reward has to arrive the same way every time. A three-axis pellet delivery runs a fixed order taken from the rig's own move_config: barrier out, traverse, drop, scoop through 109 degrees, lift, arm back to flush, barrier closed over the pellet, send. Where the solution itself is the variable, an eight-vial carousel indexes a single 45 degree step per trial and gates delivery through two shutter servos and two solenoid valves.",
    figure: {
      kind: "demos",
      demos: [
        { project: "automated-multicamera-training-control-system", demo: "pellet" },
        /* The assembly, not the trial demo. The trial is three frame-locked
           figures and the third carries readable text, which needs the full
           width of a case body; a pinned stage cannot give it that without
           running taller than the viewport. It stays on the case study. */
        { project: "multi-solution-lickometer", demo: "lickrevolver-build" },
      ],
    },
    /* Axes and the scoop angle from the pellet caption; vials, gear train and
       gating from the lickometer bullets. */
    readout: [
      { label: "Axes", value: "Three, driven over CAN" },
      { label: "Scoop", value: "109 degrees" },
      { label: "Vials", value: "Eight, one servo" },
      { label: "Gating", value: "Two shutter servos, two valves" },
    ],
    owners: [
      {
        project: "automated-multicamera-training-control-system",
        note: "A three-axis pellet delivery with servo scoop and barrier.",
      },
      {
        project: "multi-solution-lickometer",
        note: "A four-stage gear train that indexes eight vials off a single servo.",
      },
      {
        project: "lick-port-reward-hardware",
        note: "Nose cone, spout clamp, dropper, and electronics mount as one reward-port assembly.",
      },
    ],
  },
  {
    n: "06",
    id: "conversion",
    title: "Conversion and validation",
    /* platform bullets ("Grouped related recording files into reviewable
       sessions." / "Added metadata conflict review before file assembly.") +
       walkthrough step notes ("their metadata normalised onto one canonical
       key set, and every field where the two disagree is surfaced. Nine
       did." / "PyNWB writes the file and NWB Inspector validates it in the
       same pass" / "The validation report is written beside the NWB, so a
       reviewer can audit the conversion later instead of taking it on
       trust."). */
    lede: "A session that cannot be validated is not a result. Mixed recordings are grouped into reviewable sessions, normalised onto one canonical key set, and every field where two sources disagree is surfaced before anything is written; nine of them on the run captured here. PyNWB writes the file and NWB Inspector validates it in the same pass, and the report is written beside the NWB so a reviewer can audit the conversion instead of taking it on trust.",
    figure: {
      /* One real frame out of the walkthrough that already lives on the
         project entry, resolved by step id below. The full six-step
         walkthrough stays on the case study rather than being mounted
         twice. */
      kind: "shot",
      project: "scientific-data-standardization-platform",
      demo: "nwbforge-walkthrough",
      step: "written",
    },
    /* All four read off the same captured run: walkthrough steps "written"
       and "artifacts", plus platform.approach for the standard's name. */
    readout: [
      { label: "Standard", value: "Neurodata Without Borders" },
      { label: "Validation", value: "0 errors, 0 warnings" },
      { label: "Written", value: "197,056 bytes" },
      { label: "Artifacts", value: "2" },
    ],
    owners: [
      {
        project: "scientific-data-standardization-platform",
        note: "Import, metadata review, mapping, assembly, provenance, recovery, validation.",
      },
    ],
  },
  {
    n: "07",
    id: "analysis",
    title: "Analysis",
    /* motion-analysis summary ("A headless analysis engine folded into
       ReachX, so intersession and intrasession results come out of the same
       app that curates the reaches."), challenge ("each figure was rebuilt by
       hand rather than rerun"), approach ("Nothing in the compute path
       imports a widget.") and bullets (session comparison across mice, dates,
       rigs and named condition groups; intrasession mode; cancelable
       background tasks). */
    lede: "Curation and analysis in the same application, so a figure is rerun rather than rebuilt by hand. A Qt-free backend inside ReachX compares session summaries across mice, dates, rigs, and named condition groups, with an intrasession mode for reach-level distributions inside a single session. Nothing in the compute path imports a widget, which is what lets it run headless as cancelable background tasks.",
    /* Software again, so the readout takes the figure column. */
    figure: null,
    /* All four from motion-analysis.tools. */
    readout: [
      { label: "Compute", value: "NumPy" },
      { label: "Plotting", value: "pyqtgraph" },
      { label: "Interface", value: "PySide6" },
      { label: "Mode", value: "Headless compute" },
    ],
    owners: [
      {
        project: "motion-analysis-reporting-suite",
        note: "Training progression, outcome composition, reach timing, and kinematics.",
      },
      {
        project: "application-deployment-support-toolkit",
        note: "Windows launcher, updater, and shortcuts for non-developers.",
      },
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

/* Which stages a project owns, read straight back off pathStages so the rail
   and the work index cannot disagree with the narrative. */
const stagesByProject = new Map();
pathStages.forEach((stage) => {
  stage.owners.forEach((owner) => {
    const list = stagesByProject.get(owner.project) || [];
    list.push(stage);
    stagesByProject.set(owner.project, list);
  });
});

/* The thumbnail for the dense index: the poster of the scroll figure the
   project already carries, else the poster of its first demo, else the first
   captured frame of its walkthrough. Posters are 4-46KB, so the whole index
   costs less than one sprite sheet. Five projects have no render at all;
   those show the stages they own instead of a placeholder. */
function indexShot(project) {
  if (project.figure) {
    return { src: `/rig/${project.figure}-poster.webp`, fit: "contain", plate: true };
  }
  const demo = project.demos && project.demos[0];
  if (!demo) return null;
  if (demo.steps) {
    return { src: demo.steps[0].shot, fit: "cover", plate: false };
  }
  const id = (demo.ids && demo.ids[0]) || demo.id;
  return { src: `/rig/${id}-poster.webp`, fit: "contain", plate: true };
}

/* `n` is the project's permanent figure number, not its position in whatever
   filtered view is on screen. The rail always lists all nine, so a number
   that shifted when a discipline filter was applied would make the rail and
   the index disagree about which project is 04. */
export const workIndex = projects.map((project, index) => ({
  project,
  n: String(index + 1).padStart(2, "0"),
  short: shortTitles[project.id] || project.title,
  shot: indexShot(project),
  stages: stagesByProject.get(project.id) || [],
}));

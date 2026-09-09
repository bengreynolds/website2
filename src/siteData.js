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
    demos: [
      {
        /* The software counterpart to the rig's sprite demos. A demo with no
           kind is a sprite, which is why the three rig entries need no
           change; this one has to say what it is. */
        kind: "pipeline",
        id: "nwb-pipeline",
        label: "Conversion pipeline",
        caption:
          "One hybrid session, stepped through the way the app runs it. Ten files off a SpikeGLX amplifier, a camera and the lab's own bookkeeping become one validated NWB file. The write stays blocked at validation until two metadata conflicts are resolved on the record.",
        stages: [
          {
            id: "sources",
            label: "Sources",
            note: "Ten files, two acquisition systems and the lab's own notes, no shared metadata.",
            view: {
              type: "list",
              rows: [
                { name: "run1_g0_t0.imec0.ap.bin", meta: "SpikeGLX · 41.2 GB" },
                { name: "run1_g0_t0.imec0.ap.meta", meta: "SpikeGLX · 14 KB" },
                { name: "run1_g0_t0.imec0.lf.bin", meta: "SpikeGLX · 3.4 GB" },
                { name: "run1_g0_t0.imec0.lf.meta", meta: "SpikeGLX · 14 KB" },
                { name: "phy_output/", meta: "Phy · 212 MB" },
                { name: "cam0_2025-03-14.mp4", meta: "Video · 8.9 GB" },
                {
                  name: "cam0DLC_resnet50_reachMar14.h5",
                  meta: "DeepLabCut · 47 MB",
                },
                { name: "trials_run1.csv", meta: "Tabular · 62 KB" },
                { name: "notes_run1.txt", meta: "Free text · 2 KB" },
                { name: "rig_config.yaml", meta: "Config · 6 KB" },
              ],
            },
          },
          {
            id: "group",
            label: "Group",
            note: "Heuristic grouping proposes three datasets and suggests a pathway. Supported and custom routes in one session is what makes this session hybrid.",
            view: {
              type: "groups",
              rows: [
                {
                  name: "Ecephys",
                  route: "SpikeGLX & Phy",
                  count: 5,
                  kind: "supported",
                },
                {
                  name: "Behavior",
                  route: "DeepLabCut, Video",
                  count: 2,
                  kind: "supported",
                },
                {
                  name: "Trials & rig",
                  route: "Custom mapping",
                  count: 3,
                  kind: "custom",
                },
              ],
            },
          },
          {
            id: "normalize",
            label: "Normalize",
            note: "Metadata is extracted per source and standardized. Two fields disagree across sources, which is the whole reason a review gate exists.",
            view: {
              type: "status",
              rows: [
                {
                  label: "identifier",
                  value: "nwbforge:2025-03-14_M241_run1",
                  state: "ok",
                },
                {
                  label: "session_description",
                  value: "Reach-to-grasp, run 1",
                  state: "ok",
                },
                {
                  label: "devices",
                  value: "Neuropixels 1.0, cam0",
                  state: "ok",
                },
                {
                  label: "session_start_time",
                  value: "2 sources disagree",
                  state: "conflict",
                },
                {
                  label: "subject_id",
                  value: "2 sources disagree",
                  state: "conflict",
                },
              ],
            },
          },
          {
            id: "map",
            label: "Map",
            note: "A rule-based plan for where each source lands. Seven rows for ten files is right: the three metadata files were consumed at normalize and get no container of their own.",
            view: {
              type: "mapping",
              rows: [
                {
                  from: "run1_g0_t0.imec0.ap.bin",
                  to: "acquisition/ElectricalSeriesAP",
                  note: "SpikeGLX route, NeuroConv",
                },
                {
                  from: "run1_g0_t0.imec0.lf.bin",
                  to: "acquisition/ElectricalSeriesLF",
                  note: "NeuroConv",
                },
                { from: "phy_output/", to: "units", note: "Phy route" },
                {
                  from: "cam0_2025-03-14.mp4",
                  to: "acquisition/ImageSeries",
                  note: "external file, not copied",
                },
                {
                  from: "cam0DLC_resnet50_reachMar14.h5",
                  to: "processing/behavior/PoseEstimation",
                  note: "DeepLabCut route",
                },
                {
                  from: "trials_run1.csv",
                  to: "intervals/trials",
                  note: "start_s to start_time, stop_s to stop_time, outcome to success",
                },
                {
                  from: "rig_config.yaml",
                  to: "general/devices",
                  note: "custom mapping",
                },
              ],
            },
          },
          {
            id: "validate",
            label: "Validate",
            note: "Artifact policy, schema and NWB Inspector run before anything is written. Outcome: blocked. Nothing is written.",
            view: {
              type: "status",
              rows: [
                {
                  label: "Artifact policy",
                  value: "3 artifacts planned",
                  state: "pass",
                },
                { label: "NWB schema 2.7.0", value: "conforms", state: "pass" },
                {
                  label: "check_timestamps_ascending",
                  value: "ok",
                  state: "pass",
                },
                { label: "check_data_orientation", value: "ok", state: "pass" },
                {
                  label: "check_subject_species_exists",
                  value: "subject.species not supplied",
                  state: "review",
                },
                {
                  label: "session_start_time",
                  value: "unresolved across 2 sources",
                  state: "blocked",
                },
              ],
            },
          },
          {
            id: "review",
            label: "Review",
            note: "The gate. A person resolves each conflict, the species check is acknowledged, and both decisions are persisted to the session snapshot. Outcome clears to pass.",
            view: {
              type: "conflicts",
              rows: [
                {
                  field: "session_start_time",
                  a: "2025-03-14T09:12:04-06:00 — run1_g0_t0.imec0.ap.meta",
                  b: "2025-03-14T09:12:41-06:00 — cam0_2025-03-14.mp4",
                  chosen: "09:12:04-06:00",
                  why: "The amplifier clock starts the session; the camera start is kept as an offset on the ImageSeries rather than discarded.",
                },
                {
                  field: "subject_id",
                  a: "M241 — rig_config.yaml",
                  b: "m-241 — notes_run1.txt",
                  chosen: "M241",
                  why: "Matches the colony registry format; the note spelling is recorded as an alias so the original is not lost.",
                },
              ],
            },
          },
          {
            id: "assemble",
            label: "Assemble",
            note: "PyNWB writes the file, and the evidence is written beside it.",
            view: {
              type: "list",
              rows: [
                { name: "session.nwb", meta: "NWB 2.7.0 · 45.1 GB" },
                { name: "validation_report.json", meta: "6 checks · pass" },
                {
                  name: "provenance.log",
                  meta: "inspect, normalize, map, review, assemble",
                },
              ],
            },
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
    demos: [
      {
        id: "pellet",
        /* Two figures, one button, played together: the module as installed
           and the same cycle close on the mechanism. Both sprites are 81
           frames over the same duration, so they stay frame-locked. */
        ids: ["pellet", "pellet-close"],
        label: "Pellet delivery",
        caption:
          "One load-and-send cycle, in context and close up at the same time. Order and servo angles come from the rig's own move_config: barrier out, traverse, drop, scoop through 109°, lift, arm back to flush, barrier closed over the pellet, send. Colour marks what moves together — the lift rides the X carriage, which rides the base — and the vat is drawn translucent so the scoop stays visible inside it.",
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
    tools: ["Fusion 360", "Python", "DeepLabCut", "CAN bus"],
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
    tools: ["Python", "NI-DAQ / PXI", "PEAK CAN", "FLIR Spinnaker"],
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
    tools: ["Python", "PySide6", "pyqtgraph", "NumPy"],
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
    tools: ["Python", "PySide6", "Conda", "Rust", "PowerShell"],
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
    demos: [
      {
        id: "prosthetic-build",
        label: "Assembly",
        caption:
          "The bench as it goes together: extruded frame and base sheet, the seesaw's shaft supports with their needle-roller and thrust bearings, then the 3/8 in rotary shaft sliding in axially the way it actually installs, the plank, the transducer and its rubber plunger, the spring-sheet flexure carrying the load cell and the 5 mm dowel, the amplifier, the Arduino and Qwiic scale, and the lid. Stage order follows the assembly's own structure. The top sheet and standing mat are drawn transparent so the mechanism stays readable once the box closes.",
      },
      {
        id: "prosthetic-function",
        label: "How it works",
        caption:
          "How a trial runs. The prosthesis settles onto the dowel, rotating the seesaw 5.9 degrees until the dowel sits flush with the mat and a 4.69 N preload appears at the load cell. The transducer then drives the spring-sheet flexure at 8, 16, 64 and 128 Hz. Colour marks what moves together: the plank, transducer and plunger rock on the shaft, while the force mount, load cell and dowel flex on the spring sheet above them. The trace runs at true signal time, so each frequency shows its real cycle count in the same window, and the on-screen slowdown is printed per segment. Dowel displacement is exaggerated 10x - its true stroke is 0.91 mm peak-to-peak at the loudest amplitude measured on the bench.",
      },
    ],
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
  {
    id: "multi-solution-lickometer",
    title: "Multi-Solution Lickometer",
    category: "hardware",
    tags: ["hardware", "automation", "software"],
    summary:
      "An eight-vial carousel that presents a different solution on each trial, with the mechanism, the firmware, and the operator interface built as one instrument.",
    challenge:
      "Taste-preference work needed many solutions offered to one animal in a single session, without an operator swapping bottles between trials and without the swap itself becoming the variable.",
    approach:
      "Designed the carousel and its gear train in Inventor, then wrote the firmware and a wxPython interface against one serial protocol. The interface holds the protocol and the per-vial assignments, the board holds the trial state machine and the timing.",
    role: "Designed the mechanism, wrote the firmware and the operator interface, and defined the serial protocol between them.",
    tools: ["Inventor", "Arduino", "Python", "wxPython"],
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
    tools: ["Inventor", "Fabrication release", "Electronics integration"],
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
    tools: ["Inventor", "Arduino", "Gas handling", "Sensor calibration"],
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

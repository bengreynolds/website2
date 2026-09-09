import { useEffect, useRef, useState } from "react";
import { StageView } from "./PipelineViews";

/* The software counterpart to the sprite demos. Those replay a pre-rendered
   mechanism; this one steps through a conversion run, rendered live from
   siteData so filenames and NWB paths stay real, selectable text.

   React owns exactly one number - the stage index. Everything visual reads
   it off --progress, so there is no animation state in JS and nothing to
   keep in sync. data-stage carries the same number for inspection and
   debugging; nothing in CSS selects on it. */
/* Pointer choreography. Travel is long enough to read as a hand moving rather
   than a jump cut; the click pulse is short because it only has to register.
   The pause after a refused click is the beat that sells it - the cursor stays
   on the control it just bounced off. */
const TRAVEL = 900;
const CLICK = 320;
const AFTER_CLICK = 140;
const AFTER_REFUSAL = 900;

/* The write control's four states. "Blocked" is the one the whole demo is
   built to show, so it says why rather than just going grey. */
const WRITE_LABEL = {
  idle: "Write NWB file",
  blocked: "Write blocked — 2 conflicts",
  ready: "Write NWB file",
  written: "session.nwb written",
};

export default function PipelineDemo({ demo }) {
  const stages = demo.stages;
  const last = stages.length - 1;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = stages[stage];
  const atEnd = stage === last;

  /* A self-advancing walkthrough is motion, so under reduce it does not run
     and the manual stepper is the whole control set. Read once on mount
     rather than per render; nobody changes this mid-visit. */
  const canPlay = useRef(false);
  useEffect(() => {
    canPlay.current = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
  }, []);

  /* AGENTS.md rules out timers and this is the second deliberate exception,
     after the wheel scrub. A walkthrough that does not advance itself is just
     the stepper that was already here, and no CSS timeline can swap which
     stage's rows are mounted. It stays contained: one timeout, cleared on
     every change, and it stops itself at the last stage rather than looping. */
  const dwell = demo.dwell || 3600;

  /* Where the gate sits. Read from the data rather than hard-coded, so
     reordering the stages cannot leave the write enabled through validation -
     and declared up here because the playback effect below depends on them. */
  const validateIndex = stages.findIndex((s) => s.id === "validate");
  const reviewIndex = stages.findIndex((s) => s.id === "review");

  const rootRef = useRef(null);
  const [pointer, setPointer] = useState(null);
  const [clicking, setClicking] = useState(false);
  const [refused, setRefused] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    if (atEnd) {
      setPlaying(false);
      return undefined;
    }

    const root = rootRef.current;
    if (!root) return undefined;

    /* Centre of a control, in the figure's own coordinates. Measured when the
       beat fires rather than up front, because the work area resizes between
       stages and a position cached at the start would land in the wrong
       place. */
    const centreOf = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    };
    const railNode = (i) => root.querySelectorAll(".pipeline-node-btn")[i];
    const writeControl = () => root.querySelector(".pipeline-write");

    /* What the cursor does to get from this stage to the next. Ordinary
       stages: reach for the next step. The two that matter get the real
       story - at validate the pointer presses Write and is refused, which is
       the single most important thing this software does, and at review it
       presses the same control again now that the conflicts are resolved and
       the file is written. */
    const beats =
      stage === validateIndex
        ? [
            { at: writeControl, refused: true },
            { at: () => railNode(stage + 1) },
          ]
        : stage === reviewIndex
          ? [{ at: writeControl }]
          : [{ at: () => railNode(stage + 1) }];

    /* Put the cursor on the step the run is already on before anything moves.
       Without this the pointer mounts straight onto its first target, and a
       transition has no previous position to run from - so the very first beat
       teleports instead of travelling. */
    setPointer((prev) => prev ?? centreOf(railNode(stage)));

    const timers = [];
    let t = dwell; // the stage sits still and readable first

    beats.forEach((beat, index) => {
      const isLast = index === beats.length - 1;

      timers.push(setTimeout(() => setPointer(centreOf(beat.at())), t));
      t += TRAVEL;

      timers.push(
        setTimeout(() => {
          setClicking(true);
          if (beat.refused) setRefused(true);
        }, t)
      );
      t += CLICK;

      timers.push(
        setTimeout(() => {
          setClicking(false);
          if (beat.refused) setRefused(false);
          /* Only the closing beat moves the run on, so the refused press at
             validate lands without skipping the stage it happened on. */
          if (isLast) setStage((s) => Math.min(last, s + 1));
        }, t)
      );
      t += beat.refused ? AFTER_REFUSAL : AFTER_CLICK;
    });

    return () => timers.forEach(clearTimeout);
  }, [playing, stage, atEnd, last, dwell, validateIndex, reviewIndex]);

  /* The cursor is a fiction of playback; it has no business on screen while
     the visitor is driving by hand. */
  useEffect(() => {
    if (!playing) {
      setPointer(null);
      setClicking(false);
      setRefused(false);
    }
  }, [playing]);

  const go = (next) => {
    setPlaying(false);
    setStage(next);
  };

  /* While playing, the rail sweeps to where the next stage begins over the
     dwell, so it reads as a playhead rather than a bar that jumps. Paused, it
     snaps back to the stage actually reached - honest, since that stage has
     not finished. One animation either way, which keeps the demo inside the
     two-at-once budget alongside the row entrance. */
  const target = last === 0 ? 1 : (playing && !atEnd ? stage + 1 : stage) / last;

  /* The file pane is the sources stage's own rows, read rather than
     duplicated, so the left pane and the first work area can never disagree. */
  const sourceStage = stages.find((s) => s.view.type === "sources");
  const files = sourceStage ? sourceStage.view.rows : [];

  /* Seven of the ten files get a target at map; the other three are the
     metadata files normalize already consumed. Derived from the mapping rows
     instead of listed again, so editing the data cannot desync the pane. */
  const mapIndex = stages.findIndex((s) => s.view.type === "mapping");
  const mapped = new Set(
    mapIndex >= 0 ? stages[mapIndex].view.rows.map((row) => row.from) : []
  );

  const fileState = (name) => {
    if (mapIndex < 0 || stage < mapIndex) return "pending";
    return mapped.has(name) ? "mapped" : "consumed";
  };

  const writeState = atEnd
    ? "written"
    : reviewIndex >= 0 && stage >= reviewIndex
      ? "ready"
      : validateIndex >= 0 && stage >= validateIndex
        ? "blocked"
        : "idle";

  return (
    <figure className="pipeline case-demos" data-stage={stage} ref={rootRef}>
      {/* The cursor. Decorative in the strict sense - every state it points at
          is already in the DOM and announced - so it is hidden from assistive
          tech rather than narrated as a second, fictional user. */}
      {pointer ? (
        <span
          className="pipeline-pointer"
          aria-hidden="true"
          data-click={clicking ? "1" : undefined}
          style={{
            "--px": `${pointer.x}px`,
            "--py": `${pointer.y}px`,
            "--travel": `${TRAVEL}ms`,
          }}
        />
      ) : null}

      {/* A custom property is exempt from React's px coercion, so String()
          here is insurance rather than load-bearing. */}
      <ol
        className="pipeline-rail"
        data-playing={playing ? "1" : undefined}
        style={{
          "--progress": String(target),
          "--playhead-dur": `${dwell}ms`,
        }}
        aria-label="Conversion stages"
      >
        {stages.map((s, i) => (
          <li className="pipeline-node" key={s.id}>
            <button
              type="button"
              className="pipeline-node-btn"
              data-state={
                i === stage ? "current" : i < stage ? "done" : "ahead"
              }
              /* Steps in one process, not peer tabs. aria-current="step" is
                 complete on its own; role="tablist" would oblige roving
                 tabindex and arrow keys, and half-built ARIA is worse than
                 none. */
              aria-current={i === stage ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="pipeline-node-num">{i + 1}</span>
              <span className="pipeline-node-label">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* One window, not seven slides. The frame - title bar, file pane and
          action bar - is the same at every stage and only the work area
          changes, which is the difference between an application and a
          slideshow. */}
      <div className="pipeline-window">
        <div className="pipeline-chrome">
          <span className="pipeline-app">{demo.app}</span>
          <span className="pipeline-session">{demo.session}</span>
        </div>

        <div className="pipeline-body">
          {/* The session's files stay on screen for the whole run, so the
              visitor can watch the same ten inputs be grouped, consumed and
              mapped rather than being shown a fresh list each stage. */}
          <aside className="pipeline-files" aria-label="Session files">
            <h4 className="pipeline-files-head">
              Session
              <span className="pipeline-files-count">{files.length} files</span>
            </h4>
            <ul className="pipeline-file-list">
              {files.map((file) => (
                <li
                  className="pipeline-file"
                  data-state={fileState(file.name)}
                  key={file.name}
                >
                  <span className="pipeline-file-name">{file.name}</span>
                  <span className="pipeline-file-size">{file.size}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="pipeline-work">
            <p className="pipeline-note">{current.note}</p>
            {/* Keying on the stage id remounts the rows, which is the reliable
                way to restart their CSS entrance - the same trick the sprite
                demos use with their runs counter. */}
            <StageView key={current.id} view={current.view} />
          </div>
        </div>

        {/* The action bar carries the point of the software. The write is not
            a button that happens to be disabled: it is refused, with the
            reason beside it, until the conflicts are resolved on the record.
            Rendered as text rather than a <button> because it is a depiction
            of the app's control, not a working one - a real button that did
            nothing would be worse for a keyboard or screen reader user than
            no button at all. */}
        <div className="pipeline-actionbar">
          {/* The one line that changes every stage and carries the outcome, so
              it is worth announcing - but only when the visitor is the one
              stepping. Left polite during playback it would fire seven times
              in twenty seconds and read as a metronome over whatever the
              screen reader was already saying. */}
          <span
            className="pipeline-status"
            aria-live={playing ? "off" : "polite"}
          >
            {current.status}
          </span>
          <span
            className="pipeline-write"
            data-state={writeState}
            data-refused={refused ? "1" : undefined}
          >
            {WRITE_LABEL[writeState]}
          </span>
        </div>
      </div>

      {/* Reuses .demo-caption and .demo-button so this demo's controls read
          as the same furniture as the rig's, rather than a second style of
          button on one page. */}
      <figcaption className="demo-caption">
        <div className="demo-switch">
          {/* Play is the walkthrough; the stepper stays beside it so the run
              can be driven by hand, which is also the only control under
              reduced motion. WCAG 2.2.2 wants moving content stoppable, and
              this is the stop. */}
          <button
            type="button"
            className="btn btn--quiet demo-button"
            data-playing={playing ? "1" : undefined}
            onClick={() => {
              if (playing) {
                setPlaying(false);
                return;
              }
              if (!canPlay.current) {
                setStage(atEnd ? 0 : stage + 1);
                return;
              }
              if (atEnd) setStage(0);
              setPlaying(true);
            }}
          >
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </button>
          <button
            type="button"
            className="btn btn--quiet demo-button"
            onClick={() => go(atEnd ? 0 : stage + 1)}
          >
            {atEnd ? "Restart" : "Next stage"}
          </button>
          {/* Same reasoning as the status line: feedback for a step the
              visitor took, silent while the walkthrough drives itself. */}
          <span className="pipeline-count" aria-live={playing ? "off" : "polite"}>
            {stage + 1} / {stages.length}
          </span>
        </div>
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}

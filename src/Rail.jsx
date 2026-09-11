import { memo } from "react";
import { skills, workIndex } from "./siteData";
import { AppLink } from "./router";
import NavSwap from "./NavSwap";

/* --------------------------------------------------------------------------
   Rail
   A thin strip that opens itself. Which group is expanded follows where the
   reader is: standing in the skills spine expands the skill list, standing in
   the work grid expands the project list, and everywhere else it stays a
   strip. Hover and focus-within open it too, in CSS.

   Everything here is driven by IntersectionObserver upstream in App.jsx and
   arrives as props. There is no scroll listener: AGENTS.md bans them, and the
   one documented exception is the wheel scrub on a rig figure.

   On a project route there is no spine to spy on, so the work group is the
   only one and it is open with the current project marked. That is also why
   the rail is worth keeping on those pages: it is the fastest way to the
   other eight.
   -------------------------------------------------------------------------- */

/* Distance from the link the reader is standing on. Signed for which way the
   link turns, absolute for how far it recedes - and React writes both rather
   than making CSS derive one from the other. CSS abs() and pow() are recent
   enough that relying on either would put a support floor under this file for
   the sake of one subtraction, and React already owns the number.

   Null active index means nobody is marked, so every link sits at zero and
   the rail renders exactly as it did before depth existed. */
function depthOf(index, activeIndex) {
  if (activeIndex < 0) return { "--depth": 0, "--dist": 0 };
  const signed = index - activeIndex;
  return { "--depth": signed, "--dist": Math.abs(signed) };
}

const RailGroup = memo(function RailGroup({ label, open, children }) {
  return (
    <div className={`rail-group ${open ? "is-open" : ""}`}>
      <p className="rail-label">{label}</p>
      <ol className="rail-list">{children}</ol>
    </div>
  );
});

export default function Rail({ route, activeSection, activeStage, onJump }) {
  const onWork = route.name === "work";

  /* Emphasis only. This no longer decides whether the rail is open - CSS
     does that from hover and focus - it decides which group is at full
     strength once it is. */
  const skillsCurrent = !onWork && activeSection === "skills";
  const workCurrent = onWork || activeSection === "projects";

  /* The stage spy only ever names a stage; it has nothing to report once the
     reader is past the last one. Marking a skill while the reader is down in
     the work grid puts the current-item bar in the wrong list, so the mark
     is only honoured while the skills section is the one being read. */
  const markedStage = skillsCurrent ? activeStage : null;

  const activeSkillIndex = markedStage
    ? skills.findIndex((skill) => skill.id === markedStage)
    : -1;

  const activeWorkIndex = onWork
    ? workIndex.findIndex((entry) => entry.project.id === route.project.id)
    : -1;

  return (
    <div className="rail">
      <nav className="rail-inner" aria-label="Index">
        {onWork ? null : (
          <RailGroup label="Skills" open={skillsCurrent}>
            {skills.map((skill, index) => (
              <li key={skill.id}>
                <a
                  className={`rail-link ${markedStage === skill.id ? "is-current" : ""}`}
                  aria-current={markedStage === skill.id ? "true" : undefined}
                  href={`#skill-${skill.id}`}
                  onClick={(event) => onJump(event, `skill-${skill.id}`)}
                  style={depthOf(index, activeSkillIndex)}
                >
                  <span className="rail-num">{skill.n}</span>
                  <span className="rail-text">
                    <NavSwap>{skill.title}</NavSwap>
                  </span>
                </a>
              </li>
            ))}
          </RailGroup>
        )}

        <RailGroup label="Work" open={workCurrent}>
          {workIndex.map((entry, index) => {
            const current = onWork && route.project.id === entry.project.id;
            return (
              <li key={entry.project.id}>
                <AppLink
                  className={`rail-link ${current ? "is-current" : ""}`}
                  aria-current={current ? "page" : undefined}
                  href={`/work/${entry.project.id}`}
                  style={depthOf(index, activeWorkIndex)}
                >
                  <span className="rail-num">{entry.n}</span>
                  <span className="rail-text">
                    <NavSwap>{entry.short}</NavSwap>
                  </span>
                </AppLink>
              </li>
            );
          })}
        </RailGroup>
      </nav>
    </div>
  );
}

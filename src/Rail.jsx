import { memo } from "react";
import { skills, workIndex } from "./siteData";
import { AppLink } from "./router";

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

  /* On home, the open group is the one the reader is standing in. On a project
     page there is only one group and it is always open. */
  const skillsOpen = !onWork && activeSection === "skills";
  const workOpen = onWork || activeSection === "projects";

  return (
    <div className={`rail ${skillsOpen || workOpen ? "is-open" : ""}`}>
      <nav className="rail-inner" aria-label="Index">
        {onWork ? null : (
          <RailGroup label="Skills" open={skillsOpen}>
            {skills.map((skill) => (
              <li key={skill.id}>
                <a
                  className={`rail-link ${activeStage === skill.id ? "is-current" : ""}`}
                  aria-current={activeStage === skill.id ? "true" : undefined}
                  href={`#skill-${skill.id}`}
                  onClick={(event) => onJump(event, `skill-${skill.id}`)}
                >
                  <span className="rail-num">{skill.n}</span>
                  <span className="rail-text">{skill.title}</span>
                </a>
              </li>
            ))}
          </RailGroup>
        )}

        <RailGroup label="Work" open={workOpen}>
          {workIndex.map((entry) => {
            const current = onWork && route.project.id === entry.project.id;
            return (
              <li key={entry.project.id}>
                <AppLink
                  className={`rail-link ${current ? "is-current" : ""}`}
                  aria-current={current ? "page" : undefined}
                  href={`/work/${entry.project.id}`}
                >
                  <span className="rail-num">{entry.n}</span>
                  <span className="rail-text">{entry.short}</span>
                </AppLink>
              </li>
            );
          })}
        </RailGroup>
      </nav>
    </div>
  );
}

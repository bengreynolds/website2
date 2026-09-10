import { memo } from "react";
import { skills, skillsIntro } from "./siteData";
import { skillCredits } from "./skillCredits";

/* --------------------------------------------------------------------------
   Skills
   Eight stages on one spine. Inherited from the exploration branch's signal
   path, with the coupling removed: a stage is a competence, not a step in one
   project's data flow, so nothing here reads a project or borrows a project
   figure.

   The pin mechanics are the part worth keeping. Each stage is a tall track
   holding a sticky frame, and the copy animates off the TRACK's travel rather
   than the frame's, because a view() timeline on anything inside the frame
   freezes the moment the frame pins: a pinned element's position in the
   scrollport stops changing, so its own timeline has nothing left to measure.
   The track declares the timeline name in CSS; this file only supplies the
   element and the data attribute the rail spies on.
   -------------------------------------------------------------------------- */

const creditBySlug = new Map(skillCredits.map((entry) => [entry.slug, entry]));

/* A slug with no file renders a labelled placeholder rather than a gap. The
   section is meant to ship before every image is sourced, and an empty plate
   that says what belongs in it is more useful to whoever fills it than a
   collapsed box. */
const SkillFigure = memo(function SkillFigure({ skill }) {
  const credit = creditBySlug.get(skill.image);

  if (!credit) {
    return (
      <div className="skill-plate skill-plate--empty">
        <p className="skill-plate-note">
          <span className="skill-plate-slug">{skill.image}</span>
          image not yet sourced
        </p>
      </div>
    );
  }

  return (
    <figure className="skill-plate">
      <img
        className="skill-shot"
        src={credit.file}
        alt={credit.alt || credit.title}
        loading="lazy"
        decoding="async"
      />
      <figcaption className="skill-credit">
        <a href={credit.source} target="_blank" rel="noreferrer noopener">
          {credit.title}
        </a>{" "}
        by {credit.author},{" "}
        <a href={credit.licenceUrl} target="_blank" rel="noreferrer noopener">
          {credit.licence}
        </a>
      </figcaption>
    </figure>
  );
});

const SkillStage = memo(function SkillStage({ skill }) {
  return (
    <div className="stage-track" data-stage-id={skill.id} id={`skill-${skill.id}`}>
      <div className="stage-frame">
        <div className="container stage-grid">
          <div className="stage-body">
            <p className="stage-num">{skill.n}</p>
            <h3 className="stage-title">{skill.title}</h3>
            <p className="stage-subtitle">{skill.subtitle}</p>
            <p className="stage-lede">{skill.lede}</p>

            <dl className="stage-readout">
              {skill.readout.map((row) => (
                <div className="stage-readout-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="stage-figure">
            <SkillFigure skill={skill} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default function Skills() {
  return (
    <section id="skills" className="section section--stage">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">Skills</h2>
          <p className="section-lead">{skillsIntro}</p>
        </div>
      </div>

      <div className="spine">
        {skills.map((skill) => (
          <SkillStage skill={skill} key={skill.id} />
        ))}
      </div>
    </section>
  );
}

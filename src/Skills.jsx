import { memo } from "react";
import { skills, skillsIntro } from "./siteData";
import { skillCredits } from "./skillCredits";

/* --------------------------------------------------------------------------
   Skills
   Eight stages on one spine. Inherited from the exploration branch's signal
   path, with the coupling removed: a stage is a competence, not a step in one
   project's data flow, so nothing here reads a project or borrows a project
   figure.

   Stacked, not pinned. The pinned version held each stage still while its
   track scrolled past, which took three viewports of scroll per skill and
   made eight of them a very long page. These are ordinary sections using the
   same .reveal entrance as the rest of the site, so nothing here is
   scroll-driven and there is no fallback to reason about.

   data-stage-id stays: it is what the rail spies on to mark the current
   skill.
   -------------------------------------------------------------------------- */

const creditBySlug = new Map(skillCredits.map((entry) => [entry.slug, entry]));

/* Whether the image's own title already credits its author. Compared on the
   first word of the author, because the manifest may carry a library credit
   after the person's name ("Max Gruber / Better Images of AI") while the
   title carries only the name. */
function namesAuthor(credit) {
  const first = String(credit.author || "").trim().split(/[\s/]+/)[0];
  if (first.length < 3) return false;
  return String(credit.title || "").toLowerCase().includes(first.toLowerCase());
}

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
        </a>
        {/* Some Commons titles already carry the author, so appending it
            printed "Banana Plant Flask by Max Gruber by Max Gruber". The
            licence still needs the attribution, so it is only skipped when the
            title has already given it. */}
        {namesAuthor(credit) ? null : <> by {credit.author}</>},{" "}
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
          <div className="stage-body reveal">
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

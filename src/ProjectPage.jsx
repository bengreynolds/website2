import { useEffect, useState } from "react";
import { workNeighbours } from "./siteData";
import { AppLink } from "./router";
import { ScrubFigure, SpriteStage } from "./Figures";

/* --------------------------------------------------------------------------
   Project page
   The reason these routes exist: the work grid affords a plated cell about
   480px, and a 520px sprite cell cannot hold a readable filename. Here the
   figure gets the full column, and the technical body gets room to be more
   than three sentences.

   Leaving is deliberately overserved. The masthead wordmark, the breadcrumb
   above the title, the rail, and the index link between previous and next are
   four ways back, because the bottom of a project page is the easiest place
   on a site to trap somebody.
   -------------------------------------------------------------------------- */

/* The scroll figure's sheet is 1 to 3MB and is not fetched until this flips.
   On the grid a closed disclosure gated it; here the figure leads the page, so
   the gate is an explicit control instead. Under reduce the generated CSS
   never attaches a sheet, so the control would download megabytes to show the
   poster that is already up, and it is not rendered at all. */
function ScrubPanel({ project }) {
  const [live, setLive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <figure className="project-figure">
      <ScrubFigure
        figureId={project.figure}
        frames={project.figureFrames}
        label={project.figureLabel}
        live={live}
      />
      <figcaption className="project-figure-caption">
        {reduced ? (
          <span>{project.figureLabel}</span>
        ) : live ? (
          <span>
            Full assembly sequence, {project.figureFrames} frames. Scroll to build,
            or click it to step frame by frame.
          </span>
        ) : (
          <button type="button" className="btn btn--quiet" onClick={() => setLive(true)}>
            Load the assembly sequence
          </button>
        )}
      </figcaption>
    </figure>
  );
}

export default function ProjectPage({ project }) {
  const { prev, next } = workNeighbours(project.id);
  const demos = project.demos || [];

  return (
    <article className="project">
      <header className="container project-head">
        <AppLink className="project-back" href="/#projects">
          Selected work
        </AppLink>
        <h1 className="project-title">{project.title}</h1>
        <p className="project-summary">{project.summary}</p>

        <dl className="project-meta">
          <div className="project-meta-row">
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div className="project-meta-row">
            <dt>Stack</dt>
            <dd>
              <ul className="project-tools">
                {project.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </header>

      {project.figure ? (
        <div className="container">
          <ScrubPanel project={project} />
        </div>
      ) : null}

      {demos.length ? (
        <div className="container">
          <SpriteStage demos={demos} className="project-demo" />
        </div>
      ) : null}

      <div className="container project-body">
        <section className="project-block">
          <h2>Problem</h2>
          <p>{project.challenge}</p>
        </section>

        <section className="project-block">
          <h2>Approach</h2>
          <p>{project.approach}</p>
        </section>

        <section className="project-block">
          <h2>Implementation</h2>
          <ul className="project-list">
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        {/* Repo-derived depth. Absent until a project's sources have been read,
            and simply not rendered when there is nothing to say, because an
            empty heading reads as a broken page rather than as work in
            progress. */}
        {project.deepDive && project.deepDive.length ? (
          <section className="project-block">
            <h2>Deep dive</h2>
            {project.deepDive.map((part) => (
              <div className="project-deep" key={part.heading}>
                <h3>{part.heading}</h3>
                {part.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {part.source ? <p className="project-source">{part.source}</p> : null}
              </div>
            ))}
          </section>
        ) : null}
      </div>

      <nav className="container project-nav" aria-label="Other projects">
        {prev ? (
          <AppLink className="project-nav-link project-nav-link--prev" href={`/work/${prev.project.id}`}>
            <span className="project-nav-dir">Previous</span>
            <span className="project-nav-title">{prev.short}</span>
          </AppLink>
        ) : (
          <span />
        )}

        <AppLink className="project-nav-index" href="/#projects">
          All nine
        </AppLink>

        {next ? (
          <AppLink className="project-nav-link project-nav-link--next" href={`/work/${next.project.id}`}>
            <span className="project-nav-dir">Next</span>
            <span className="project-nav-title">{next.short}</span>
          </AppLink>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

import { workNeighbours } from "./siteData";
import { AppLink } from "./router";
import { SpriteStage } from "./Figures";
import SequencePanel from "./SequencePanel";

/* --------------------------------------------------------------------------
   Project page
   The reason these routes exist: on the home grid a plated cell is about
   420px, and a 520px sprite cell cannot hold a readable filename. Here the
   figure gets the whole column and the body gets room to be more than three
   sentences.

   Organised in four zones rather than one column of prose:

     identity     what it is, who did what, and the stack by layer
     mechanism    every figure, each run from a control
     argument     the problem, the approach, what was built
     detail       the implementation, written from the source

   Nothing on the page is driven by scroll position. The assembly sequences
   run from buttons in SequencePanel and the demos run from the switcher in
   SpriteStage, so a reader decides what moves and when.

   Leaving is deliberately overserved: the masthead wordmark, the breadcrumb
   above the title, the rail, and the index link between previous and next.
   The bottom of a project page is the easiest place on a site to trap
   somebody.
   -------------------------------------------------------------------------- */

function StackPanel({ stack }) {
  if (!stack || !stack.length) return null;
  return (
    <div className="project-stack">
      {stack.map((layer) => (
        <div className="project-layer" key={layer.group}>
          <h3 className="project-layer-name">{layer.group}</h3>
          <ul className="project-layer-items">
            {layer.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function ProjectPage({ project }) {
  const { prev, next } = workNeighbours(project.id);
  const demos = project.demos || [];
  const hasMechanism = Boolean(project.figure) || demos.length > 0;

  return (
    <article className="project">
      <header className="container project-head">
        <AppLink className="project-back" href="/#projects">
          Selected work
        </AppLink>
        <h1 className="project-title">{project.title}</h1>
        <p className="project-summary">{project.summary}</p>

        <div className="project-role">
          <h2 className="project-kicker">Contribution</h2>
          <p>{project.role}</p>
        </div>
      </header>

      <section className="container project-section" aria-labelledby="stack-heading">
        <h2 className="project-kicker" id="stack-heading">
          Stack
        </h2>
        <StackPanel stack={project.stack} />
      </section>

      {hasMechanism ? (
        <section className="container project-section" aria-labelledby="mechanism-heading">
          <h2 className="project-kicker" id="mechanism-heading">
            Mechanism
          </h2>
          {project.figure ? <SequencePanel project={project} /> : null}
          {demos.length ? (
            <div style={{ viewTransitionName: "project-plate" }}>
              <SpriteStage demos={demos} className="project-demo" />
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="container project-body">
        <section className="project-block">
          <h2 className="project-kicker">Problem</h2>
          <p>{project.challenge}</p>
        </section>

        <section className="project-block">
          <h2 className="project-kicker">Approach</h2>
          <p>{project.approach}</p>
        </section>

        <section className="project-block">
          <h2 className="project-kicker">What was built</h2>
          <ul className="project-list">
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Repo-derived depth. Not rendered at all when a project has none,
          because an empty heading reads as a broken page rather than as work
          in progress. */}
      {project.deepDive && project.deepDive.length ? (
        <section className="container project-detail" aria-labelledby="detail-heading">
          <h2 className="project-kicker" id="detail-heading">
            Implementation detail
          </h2>
          {project.deepDive.map((part) => (
            <div className="project-deep" key={part.heading}>
              <h3>{part.heading}</h3>
              {part.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      <nav className="container project-nav" aria-label="Other projects">
        {prev ? (
          <AppLink
            className="project-nav-link project-nav-link--prev"
            href={`/work/${prev.project.id}`}
          >
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
          <AppLink
            className="project-nav-link project-nav-link--next"
            href={`/work/${next.project.id}`}
          >
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

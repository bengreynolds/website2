import {
  contactLinks,
  education,
  experience,
  heroFacts,
  heroStatement,
  roleLabel,
} from "./siteData";
import Skills from "./Skills";
import WorkGrid from "./WorkGrid";

/* --------------------------------------------------------------------------
   Home
   Five sections in page order. Skills sits before the work so the page
   answers "who is this" before "what did he build".

   There was a sixth. Capabilities held three summary statements over a grid
   of six tool groups, and once the skills section existed it was a second
   printing of the same inventory: 27 of its 41 items were named again in the
   skills readouts, and most of the other 14 were near-synonyms. Repeating an
   inventory does not reinforce it, so the section is gone rather than
   redesigned.

   No animation in the hero. The renders are the work's own material and they
   belong in the grid and on the project pages, not decorating a name.
   -------------------------------------------------------------------------- */

export default function HomePage({ goToSection, isPlainClick }) {
  const jump = (id) => (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    goToSection(id);
  };

  return (
    <>
      <section id="home" className="section hero">
        <div className="container hero-inner">
          <div>
            <span className="label role-label rise">{roleLabel}</span>
            <h1 className="hero-name rise" style={{ "--delay": "60ms" }}>
              Benjamin Reynolds
            </h1>
            <p className="hero-statement rise" style={{ "--delay": "120ms" }}>
              {heroStatement}
            </p>
            <div className="hero-ctas rise" style={{ "--delay": "180ms" }}>
              <a className="btn btn--primary" href="#projects" onClick={jump("projects")}>
                Selected work
              </a>
              <a className="btn btn--quiet" href="#contact" onClick={jump("contact")}>
                Get in touch
              </a>
            </div>
          </div>

          <dl className="hero-facts rise" style={{ "--delay": "140ms" }}>
            {heroFacts.map((fact) => (
              <div className="fact" key={fact.label}>
                <dt className="fact-label">{fact.label}</dt>
                <dd className="fact-value">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Skills />

      <WorkGrid />

      <section id="experience" className="section">
        <div className="container">
          <div className="section-head reveal">
            <h2 className="section-title">Experience</h2>
            <p className="section-lead">
              Research engineering, hardware development, and software delivery. Full
              history is in the resume.
            </p>
          </div>

          <div className="roles">
            {experience.map((item, index) => (
              <details
                key={`${item.role}-${item.dates}`}
                className="role reveal"
                open={index === 0}
              >
                <summary className="role-summary">
                  <span className="role-dates">{item.dates}</span>
                  <span className="role-heading">
                    <span className="role-title">{item.role}</span>
                    <span className="role-org">{item.org}</span>
                  </span>
                  <span className="role-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <ul className="role-bullets">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="education reveal">
            <h3 className="education-title">Education and training</h3>
            <div className="edu-list">
              {education.map((item) => (
                <div className="edu-entry" key={item.title}>
                  <h4>{item.title}</h4>
                  <p className="edu-sub">{item.subtitle}</p>
                  <p className="edu-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tinted. Capabilities used to sit between experience and contact and
          carried the tint, and the page uses a change of ground as its
          section separator rather than a rule, so without this the last two
          sections run together. */}
      <section id="contact" className="section section--tinted">
        <div className="container">
          <div className="reveal">
            <h2 className="contact-title">Start a technical conversation</h2>
            <p className="contact-lede">
              Email is the most reliable route. The resume carries the full role history
              and tool list.
            </p>
          </div>

          <dl className="contact-list reveal">
            {contactLinks.map((link) => {
              const external = link.href.startsWith("http");
              return (
                <div className="contact-row" key={link.label}>
                  <dt className="contact-label">{link.label}</dt>
                  <dd>
                    <a
                      className="contact-value"
                      href={link.href}
                      download={link.download ? "" : undefined}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                    >
                      {link.value}
                    </a>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";

/* A console tool's own output, rendered as text rather than photographed.

   The two tools this serves are terminal programs, and the software playbook's
   rule 1 says a thing made of words is a live DOM demo: a screenshot of a
   terminal is unreadable at the width these figures ship at, and the words are
   the whole content. There was also no choice - console windows do not surface
   in the environment these captures were made in, so a photograph of one was
   never available.

   What is here is real output. The installer rows were printed by
   tools/install/reachaq-linux-install.sh on christielab10; the capture lines
   were written by git-monitor's own log while five git commands ran in a
   sandbox repository. Nothing is illustrative.

   Two row shapes, so two renderers, which is the smallest number that fits:
   "steps" is a status plus a group and a label, "log" is a timestamp plus a
   repo and a command. An unknown shape returns null rather than throwing, so a
   data typo costs one figure and not the page.

   React owns one number - which view is open, when the demo offers more than
   one. Everything else is markup and CSS. */

function StepRows({ rows }) {
  return (
    <ol className="creport-rows">
      {rows.map((r, i) => (
        <li className="creport-row" data-state={r.status.toLowerCase()} key={r.group + r.label + i}>
          <span className="creport-status">{r.status}</span>
          <span className="creport-group">{r.group}</span>
          <span className="creport-label">
            {r.label}
            {r.detail ? <span className="creport-detail"> {r.detail}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

function LogRows({ rows }) {
  return (
    <ol className="creport-rows creport-rows--log">
      {rows.map((r, i) => (
        <li className="creport-row creport-row--log" key={r.at + r.command + i}>
          <span className="creport-time">{r.at}</span>
          <span className="creport-repo">{r.repo}</span>
          <code className="creport-cmd">{r.command}</code>
        </li>
      ))}
    </ol>
  );
}

export default function ConsoleReport({ demo, switcher = null }) {
  const views = demo.views;
  const [open, setOpen] = useState(0);
  const view = views[Math.min(open, views.length - 1)];
  if (!view) return null;

  const Body = { steps: StepRows, log: LogRows }[view.type];
  if (!Body) return null;

  return (
    <figure className="creport case-demos">
      <div className="creport-head">
        <p className="creport-cmdline">
          <span className="creport-prompt" aria-hidden="true">
            $
          </span>{" "}
          {view.command}
        </p>
        {view.meta && view.meta.length ? (
          <dl className="creport-meta">
            {view.meta.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="creport-body">
        <Body rows={view.rows} />
      </div>

      {view.summary ? <p className="creport-summary">{view.summary}</p> : null}

      <figcaption className="demo-caption">
        {switcher}
        {views.length > 1 ? (
          <div className="demo-switch">
            {views.map((v, i) => (
              <button
                key={v.id}
                type="button"
                className={`btn btn--quiet demo-button ${i === open ? "is-active" : ""}`}
                aria-pressed={i === open}
                onClick={() => setOpen(i)}
              >
                {v.label}
              </button>
            ))}
          </div>
        ) : null}
        <span>{demo.caption}</span>
      </figcaption>
    </figure>
  );
}

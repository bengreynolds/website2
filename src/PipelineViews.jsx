/* One renderer per view type in the demo data contract. Five types cover
   seven stages: list and status are each used twice, because their row
   shapes are identical and a type per stage would have meant two pairs of
   renderers differing only in a heading. */

/* Consumed by the entrance stagger in pipeline-demo.css, which applies the
   delay itself - inside prefers-reduced-motion: no-preference, because the
   global reduce block crushes animation-duration but not animation-delay. */
function rowStyle(i) {
  return { "--i": String(i) };
}

function List({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--list">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.name}>
          <span className="pipeline-row-name">{row.name}</span>
          <span className="pipeline-row-meta">{row.meta}</span>
        </li>
      ))}
    </ul>
  );
}

function Groups({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--groups">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.name}>
          <span className="pipeline-row-name">{row.name}</span>
          <span className="pipeline-row-meta">{row.route}</span>
          <span className="pipeline-row-count">{row.count} files</span>
          <span className="pipeline-chip" data-state={row.kind}>
            {row.kind}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Status({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--status">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.label}>
          <span className="pipeline-row-name">{row.label}</span>
          <span className="pipeline-row-meta">{row.value}</span>
          <span className="pipeline-chip" data-state={row.state}>
            {row.state}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Mapping({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--mapping">
      {rows.map((row, i) => (
        <li className="pipeline-row" style={rowStyle(i)} key={row.from}>
          <span className="pipeline-row-name">{row.from}</span>
          {/* Hidden from assistive tech deliberately: "right arrow" between
              every pair is noise, and source-then-target in a list already
              reads as a mapping. */}
          <span className="pipeline-row-arrow" aria-hidden="true">
            &rarr;
          </span>
          <span className="pipeline-row-target">{row.to}</span>
          {row.note ? (
            <span className="pipeline-row-meta">{row.note}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Conflicts({ rows }) {
  return (
    <ul className="pipeline-rows pipeline-rows--conflicts">
      {rows.map((row, i) => (
        <li className="pipeline-conflict" style={rowStyle(i)} key={row.field}>
          <span className="pipeline-row-name">{row.field}</span>
          <span className="pipeline-conflict-side">{row.a}</span>
          <span className="pipeline-conflict-side">{row.b}</span>
          <span className="pipeline-conflict-kept">Kept {row.chosen}</span>
          <p className="pipeline-conflict-why">{row.why}</p>
        </li>
      ))}
    </ul>
  );
}

const VIEWS = {
  list: List,
  groups: Groups,
  status: Status,
  mapping: Mapping,
  conflicts: Conflicts,
};

export function StageView({ view }) {
  const Body = VIEWS[view.type];
  /* An unknown type is a data error, not a runtime one. Render nothing
     rather than take the whole case study down with it. */
  if (!Body) return null;
  return <Body rows={view.rows} />;
}

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

/* Log10, not linear. The smallest input is 2 KB against 41.2 GB, a ratio of
   twenty million to one, so a linear bar gives the notes file 0.000005% of the
   track and every metadata file rounds to nothing - which loses exactly the
   files the stage is about. The axis is labelled as log in the legend, because
   a bar a reader assumes is linear is worse than no bar. */
function barFraction(bytes, min, max) {
  if (!(bytes > 0) || max <= min) return 1;
  const span = Math.log10(max) - Math.log10(min);
  return span === 0 ? 1 : (Math.log10(bytes) - Math.log10(min)) / span;
}

/* Even the smallest file keeps a visible stub, or the row reads as missing
   data rather than as a small file. */
const BAR_FLOOR = 0.07;

function Sources({ view }) {
  const { rows, groups } = view;
  const sizes = rows.map((row) => row.bytes).filter((b) => b > 0);
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);

  /* Group order comes from the data, not from the row order, so the two
     acquisition systems lead and the lab's own material lands last however
     the rows happen to be listed. */
  let index = 0;
  return (
    <div className="pipeline-sources">
      {groups.map((group) => {
        const items = rows.filter((row) => row.group === group.id);
        if (!items.length) return null;
        return (
          <section
            className="pipeline-src-group"
            data-kind={group.kind}
            key={group.id}
          >
            <h4 className="pipeline-src-head">
              <span className="pipeline-src-title">{group.label}</span>
              {/* Weight and border carry the distinction; AGENTS.md keeps
                  --accent for interactive things and none of this is. */}
              <span className="pipeline-src-kind">{group.kind}</span>
              <span className="pipeline-src-count">
                {items.length} {items.length === 1 ? "file" : "files"}
              </span>
            </h4>
            <ul className="pipeline-src-rows">
              {items.map((row) => {
                const fraction = barFraction(row.bytes, min, max);
                const width = BAR_FLOOR + fraction * (1 - BAR_FLOOR);
                return (
                  <li
                    className="pipeline-src-row"
                    style={{ "--i": String(index++), "--w": String(width) }}
                    key={row.name}
                  >
                    <span className="pipeline-src-name">{row.name}</span>
                    {/* Decorative: the byte figure sits in the next cell, so
                        announcing the bar too would just read the size
                        twice. */}
                    <span className="pipeline-src-bar" aria-hidden="true" />
                    <span className="pipeline-src-size">{row.size}</span>
                    {/* Omitted where it would only repeat the group heading,
                        which is every SpikeGLX row. */}
                    {row.source && row.source !== group.label ? (
                      <span className="pipeline-src-tag">{row.source}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="pipeline-src-legend">
        Bar length is file size on a log scale, {rows.length} files spanning
        2 KB to 41.2 GB. No two groups share a metadata convention.
      </p>
    </div>
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
  sources: Sources,
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
  /* rows stays for the five row-shaped views; view is passed alongside for
     the ones that also need stage-level data, which so far is sources and its
     group order. The row views ignore it. */
  return <Body rows={view.rows} view={view} />;
}

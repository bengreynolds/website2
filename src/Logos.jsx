import { memo, Fragment } from "react";
import { logos, logoAliases } from "./logoCredits";

/* --------------------------------------------------------------------------
   Brand marks
   A small coloured mark beside a tool's name, in the skills readouts and in
   the project stack panels. Shapes and licences are generated into
   src/logoCredits.js by scripts/logos/fetch-logos.mjs.

   The mark is decoration, not information. Every one of them sits directly
   beside the tool's own name in text, so it is aria-hidden and a reader who
   never sees it loses nothing - which is also why an unmatched tool renders
   as plain text rather than as a gap or a placeholder. Roughly half the
   strings in these lists are not products at all ("tolerancing", "watchdogs",
   "reflow and rework"), so most of them are meant to go unmatched.

   Matching is exact against the whole comma-separated token, never a
   substring: "Qt" takes a mark and "Qt threading and signals" does not.
   Substring matching put a Qt mark on the second one and a C mark on
   practically everything, which is the failure this rule exists to stop.
   -------------------------------------------------------------------------- */

export function logoFor(name) {
  const id = logoAliases[String(name).trim()];
  return id ? logos[id] : null;
}

/* Colour comes from CSS custom properties rather than a fill attribute so one
   element can carry both themes. --mark is the brand hex as published;
   --mark-light and --mark-dark are present only on the marks whose brand hex
   misses contrast on that ground, and section 9 of spa.css falls back to
   --mark wherever they are absent. Multi-colour marks keep their own fills
   and ignore all three. */
export const Mark = memo(function Mark({ logo }) {
  const style = { "--mark": logo.hex };
  if (logo.onLight) style["--mark-light"] = logo.onLight;
  if (logo.onDark) style["--mark-dark"] = logo.onDark;

  return (
    <svg
      className="mark"
      data-tone={logo.tone}
      viewBox={logo.viewBox}
      style={logo.tone === "mono" ? style : undefined}
      aria-hidden="true"
      focusable="false"
      /* Generated at build time from two pinned CDN releases and committed to
         the repo - not runtime input. The alternative, parsing each path into
         elements, buys nothing here and costs the multi-colour marks their
         structure. */
      dangerouslySetInnerHTML={{ __html: logo.body }}
    />
  );
});

/* One tool: the mark and its name, kept on one line. The nowrap matters -
   without it a line break lands between a mark and the word it belongs to,
   and the mark reads as belonging to the tool above it. */
export const Tool = memo(function Tool({ name }) {
  const logo = logoFor(name);
  if (!logo) return name;
  return (
    <span className="tool">
      <Mark logo={logo} />
      {name}
    </span>
  );
});

/* A readout value, which is a comma-separated list written as one string.
   Split, mark what is a tool, and rejoin with the same ", " so the rendered
   text is character-for-character what it was before the marks arrived. */
export const ToolList = memo(function ToolList({ value }) {
  const tokens = String(value).split(", ");
  return tokens.map((token, i) => (
    <Fragment key={`${token}-${i}`}>
      {i ? ", " : null}
      <Tool name={token} />
    </Fragment>
  ));
});

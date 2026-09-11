import { memo } from "react";
import { logos, logoAliases } from "./logoCredits";

/* --------------------------------------------------------------------------
   Brand marks
   The tools named in a skill's readout, or in a project's stack, collected
   into one array set beside that text rather than threaded through it.

   Beside, not inline. The first build put each mark in front of its own word,
   which turned a readout into a run of coloured interruptions and made the
   line height jump wherever a mark landed. Gathered into a block the marks
   read as one object the eye can take in or skip, and the prose is left as
   prose.

   The array is decoration and is marked as such. Every tool in it is already
   named in the text beside it, so the whole block is aria-hidden: a screen
   reader gets the readout, not a second unlabelled copy of it. That is also
   why an unmatched tool costs nothing - most of the strings in these lists
   name a practice rather than a product ("tolerancing", "watchdogs"), and
   they are simply not represented here.

   Matching is exact against a whole token, never a substring: "Qt" resolves
   and "Qt threading and signals" does not. Substring matching put a C mark on
   most of the site, which is the failure this rule exists to prevent.
   -------------------------------------------------------------------------- */

export function logoFor(name) {
  const id = logoAliases[String(name).trim()];
  return id ? logos[id] : null;
}

/* Resolves a list of raw strings to marks: splits the comma-separated readout
   values, keeps first-appearance order, and drops repeats so a tool named in
   three rows of one stage still contributes a single mark. */
export function marksFor(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    for (const token of String(value).split(", ")) {
      const logo = logoFor(token);
      if (logo && !seen.has(logo.id)) {
        seen.add(logo.id);
        out.push(logo);
      }
    }
  }
  return out;
}

/* Colour comes from custom properties rather than a fill attribute so one
   element carries both themes. --mark is the brand hex as published;
   --mark-light and --mark-dark exist only on the marks whose brand hex misses
   contrast on that ground, and the sheet falls back to --mark otherwise.
   Multi-colour marks keep their own fills and ignore all three. */
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
         the repo, not runtime input. Parsing each shape into elements buys
         nothing here and costs the multi-colour marks their structure. */
      dangerouslySetInnerHTML={{ __html: logo.body }}
    />
  );
});

/* The array itself. Renders nothing when the list is too thin to be one, so a
   stage or a stack of pure practice terms gets a clean column rather than an
   empty frame - the same rule the skill plate follows one file over.

   `min` is why this is a prop rather than a constant. The skills readouts are
   lists of products and produce ten to fifteen marks, where anything at all
   is worth showing. The project stacks are deliberately not that: they are
   counts and parts - "215-part enclosure", "nine custom drivers", "61 source
   adapters" - and most of them resolve to one or two marks. A single mark in
   a bordered cell reads as a bug rather than as an array, so the stack rail
   asks for three before it will draw itself, and most project pages
   correctly show none. */
export const LogoArray = memo(function LogoArray({ values, className = "", min = 1 }) {
  const marks = marksFor(values);
  if (marks.length < min) return null;

  return (
    <ul className={`logo-array ${className}`.trim()} aria-hidden="true">
      {marks.map((logo) => (
        /* title, so a mark that is not obvious can still be identified on
           hover. It is not the accessible name - the readout already carries
           that - and nothing here depends on it being read. */
        <li className="logo-cell" key={logo.id} title={logo.label}>
          <Mark logo={logo} />
        </li>
      ))}
    </ul>
  );
});

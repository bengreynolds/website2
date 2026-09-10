@AGENTS.md

## Before building a demo or animation

Read the matching playbook first, before designing anything. Both are ordered
as the work runs, and both exist because the approaches they rule out produced
wrong results.

- Animating CAD geometry: `docs/fusion-animation-pipeline.md`
- A demo of software — a workflow, an architecture, a data flow:
  `docs/software-animation-patterns.md`. Its rule 0: if the software actually
  runs, capture it running rather than rebuilding its interface. That one is
  for software only — hardware stays with the Fusion pipeline above.

Section 0 of each is a one-line-per-rule table. Read that much even for a
change that looks small; most of the expensive mistakes in both files came
from skipping a step rather than from doing one badly.

Two habits that apply to either:

- Read the media queries around a container before designing against it.
  `.case-body` is width-capped below 56rem and uncapped-but-two-column above,
  which has already invalidated one finished design.
- Demos live on the project routes at `/work/<id>`, under the **Mechanism**
  heading, and every one of them runs from a control: Play and frame buttons
  for the assembly sequences, a switcher for the rest. A verification pass has
  to press something; scrolling past a figure will not start it.

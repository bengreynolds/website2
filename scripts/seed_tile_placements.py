#!/usr/bin/env python3
"""Assign a frozen, pseudo-random plate placement to each plated work tile.

The work grid is deliberately asymmetric: a plated tile puts its text block
above or below its square plate, and the mix of that with the five tiles that
have no plate at all is what stops nine cards reading as a table. The arrangement is randomised ONCE, here, and written
into src/siteData.js as a literal, rather than chosen at render time.

Frozen in the data because:
  - it is stable across loads, so the layout a visitor sees is the layout that
    was reviewed;
  - it shows up in the diff, so a reroll is a visible change;
  - it is re-rollable on purpose by running this with a different --seed.

Only plated tiles get a placement. A tile is plated when its project block
declares `figure:` or `demos:`; the rest are typographic and have no plate to
place. Plated-ness is read out of siteData rather than listed here, so adding
a demo to a project cannot leave this script describing the old grid.

Usage:
  python scripts/seed_tile_placements.py            # rewrite with the recorded seed
  python scripts/seed_tile_placements.py --seed 7   # reroll
  python scripts/seed_tile_placements.py --check    # exit 1 if siteData is stale
"""

import argparse
import os
import random
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_DATA = os.path.join(ROOT, "src", "siteData.js")

# Where the text block sits relative to the plate, inside a cell. Every cell
# is the same width: the asymmetry comes from which tiles have a plate at all
# and which side of it the text is on, not from varying cell sizes.
#
# Varying the sizes was tried and abandoned. Wide cells only tile a 6-column
# grid without holes for particular counts, and with the plated tiles sitting
# at positions 1, 2, 6 and 7 of nine there is no arrangement containing a
# wide cell that packs in source order. Source order is not negotiable, since
# the tiles are numbered 01 to 09 and grid-auto-flow: dense would print them
# out of sequence.
# Above or below, not beside. A plate beside its text was built and measured
# and does not survive a 1/3-width cell: at 1440 the read column comes out
# near 200px, which breaks "Autonomous" across two lines mid-word, and the
# only ways out are shrinking the plate to a thumbnail or dropping the title
# a size below the other eight. Above/below is a randomised position too, and
# it holds at every width.
PLACEMENTS = ["plate-top", "plate-bottom"]

BEGIN = "/* BEGIN GENERATED tilePlacements"
END = "/* END GENERATED tilePlacements */"


def read_projects(source):
    """Project ids in source order, with whether each one has a plate.

    The projects array is scanned by locating each `id: "..."` at project
    indentation (four spaces) and treating everything up to the next one as
    that project's block.
    """
    start = source.index("export const projects = [")
    end = source.index("\nexport const contactLinks", start)
    body = source[start:end]

    hits = list(re.finditer(r'^    id: "([^"]+)",$', body, re.M))
    if not hits:
        sys.exit("no projects found: the id indentation in siteData changed")

    out = []
    for n, hit in enumerate(hits):
        block = body[hit.end(): hits[n + 1].start() if n + 1 < len(hits) else len(body)]
        plated = bool(re.search(r"^    (figure|demos):", block, re.M))
        out.append((hit.group(1), plated))
    return out


def assign(projects, seed):
    """A placement per plated tile, randomised once.

    One constraint beyond "random": no two consecutive plated tiles share a
    placement, because the plate landing on the same side twice running is
    the symmetry this exists to break. With two options that makes the
    sequence alternate, which is still the point: the plate is not always
    above the title.
    """
    rng = random.Random(seed)
    plated = [pid for pid, is_plated in projects if is_plated]

    for _ in range(2000):
        picks = [rng.choice(PLACEMENTS) for _ in plated]
        if all(a != b for a, b in zip(picks, picks[1:])):
            return dict(zip(plated, picks))

    sys.exit("could not place tiles without a repeat; widen PLACEMENTS")


def render(mapping, seed):
    lines = [
        BEGIN,
        "   Written by scripts/seed_tile_placements.py --seed %d." % seed,
        "   Do not hand-edit: rerun the script to change the grid. */",
        "export const tilePlacements = {",
    ]
    for key, value in mapping.items():
        lines.append('  "%s": "%s",' % (key, value))
    lines.append("};")
    lines.append(END)
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=20260910)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    with open(SITE_DATA, encoding="utf8") as handle:
        source = handle.read()

    projects = read_projects(source)
    plated = [pid for pid, is_plated in projects if is_plated]
    if not plated:
        sys.exit("no plated projects: every tile would be typographic")

    mapping = assign(projects, args.seed)
    block = render(mapping, args.seed)

    if BEGIN in source:
        head = source[: source.index(BEGIN)]
        tail = source[source.index(END) + len(END):]
        updated = head + block + tail
    else:
        sys.exit("marker %r not found in siteData; add the block first" % BEGIN)

    if args.check:
        sys.exit(0 if updated == source else 1)

    with open(SITE_DATA, "w", encoding="utf8", newline="\n") as handle:
        handle.write(updated)

    print("seed %d" % args.seed)
    print("%d projects, %d plated, %d typographic"
          % (len(projects), len(plated), len(projects) - len(plated)))
    for pid, is_plated in projects:
        print("  %-46s %s" % (pid, mapping[pid] if is_plated else "typographic"))


if __name__ == "__main__":
    main()

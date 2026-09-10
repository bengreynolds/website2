"""Re-cut a shipped sprite's poster from one cell of its own sheet.

    python scripts/reposter_from_sheet.py buildup last
    python scripts/reposter_from_sheet.py prosthetic-build 143

Writes one file and nothing else:

    public/rig/<id>-poster.webp   the cropped cell, re-encoded

build_demo_sprite.py --poster-frame is the right tool when the captured
frames are still on disk. This is the tool for when they are not: the
sheet in public/rig is the only surviving copy of the frames, and a
poster that named the wrong frame has to be re-cut out of it.

Why a poster is worth re-cutting at all: the generated stylesheets attach
the sheet only inside prefers-reduced-motion: no-preference, so the
poster is not a placeholder that a visitor blinks past - under reduce it
is the entire rendering of the figure, permanently.

The grid is read out of the sprite's own generated stylesheet header
(src/rig-<id>.css or src/demo-<id>.css, whichever exists) and never
assumed, then checked against the sheet's pixel dimensions before
anything is written. A wrong grid crops a plausible-looking cell out of
the wrong place, which is exactly the failure that would go unnoticed.

Encoding matches build_demo_sprite.py exactly, so a re-cut poster is
byte-comparable with a rebuilt one.
"""

import argparse
import os
import re
import sys

from PIL import Image

# Same directory; run as `python scripts/reposter_from_sheet.py`. poster_index
# is shared rather than copied so "first"/"last"/index means one thing.
from build_demo_sprite import poster_index

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Every generated header states the geometry the same way, whichever
# template wrote it:
#   demo "lickrevolver-build": 81 frames, 9x9 grid, cell 540x540.
#   figure "prosthetic-build": 144 frames, 12x12 grid, cell 400x400.
#   100 frames, 10x10 grid, cell 660x660 (square: uncropped canvas).
GEOMETRY = re.compile(
    r"(\d+)\s+frames,\s*(\d+)\s*x\s*(\d+)\s+grid,\s*cell\s+(\d+)\s*x\s*(\d+)")


def find_stylesheet(sprite_id):
    """The generated stylesheet for a sprite, scroll-scrubbed or timed."""
    names = ["rig-%s.css" % sprite_id, "demo-%s.css" % sprite_id]
    found = [os.path.join(ROOT, "src", name) for name in names
             if os.path.exists(os.path.join(ROOT, "src", name))]
    if not found:
        sys.exit("no generated stylesheet for %r; looked for src/%s"
                 % (sprite_id, " and src/".join(names)))
    if len(found) > 1:
        sys.exit("two stylesheets claim %r: %s. Delete the stale one first."
                 % (sprite_id, ", ".join(os.path.relpath(p, ROOT) for p in found)))
    return found[0]


def read_geometry(css_path):
    """(frames, cols, rows, cell_w, cell_h) from the generated header."""
    with open(css_path, encoding="utf-8") as f:
        text = f.read()
    header = text.split("*/", 1)[0]
    match = GEOMETRY.search(header)
    if not match:
        sys.exit('no "N frames, CxR grid, cell WxH" line in the header of %s'
                 % os.path.relpath(css_path, ROOT))
    return tuple(int(g) for g in match.groups())


def main():
    ap = argparse.ArgumentParser(
        description="Re-cut public/rig/<id>-poster.webp from a cell of "
                    "public/rig/<id>.webp.")
    ap.add_argument("sprite_id")
    ap.add_argument("frame", metavar="FRAME",
                    help='which cell to cut: "first", "last", or a 0-based '
                         "frame index. Required - the whole point of this "
                         "script is naming the frame deliberately.")
    args = ap.parse_args()

    sheet_path = os.path.join(ROOT, "public", "rig", args.sprite_id + ".webp")
    if not os.path.exists(sheet_path):
        sys.exit("no sheet at " + os.path.relpath(sheet_path, ROOT))
    css_path = find_stylesheet(args.sprite_id)
    n, cols, rows, cell_w, cell_h = read_geometry(css_path)

    if cols * rows != n:
        sys.exit("%s claims %d frames in a %dx%d grid, which holds %d"
                 % (os.path.relpath(css_path, ROOT), n, cols, rows, cols * rows))

    sheet = Image.open(sheet_path)
    expected = (cols * cell_w, rows * cell_h)
    if sheet.size != expected:
        sys.exit("%s is %dx%d but %s describes a %dx%d sheet (%dx%d grid of "
                 "%dx%d cells). The header does not match the image; do not "
                 "trust either until that is resolved."
                 % (os.path.relpath(sheet_path, ROOT), sheet.size[0], sheet.size[1],
                    os.path.relpath(css_path, ROOT), expected[0], expected[1],
                    cols, rows, cell_w, cell_h))

    try:
        i = poster_index(args.frame, n, label="frame")
    except ValueError as err:
        sys.exit(str(err))

    poster_path = os.path.join(
        ROOT, "public", "rig", args.sprite_id + "-poster.webp")
    before = (open(poster_path, "rb").read()
              if os.path.exists(poster_path) else None)

    col, row = i % cols, i // cols
    cell = sheet.crop((col * cell_w, row * cell_h,
                       (col + 1) * cell_w, (row + 1) * cell_h))
    # Identical to the build step's poster encoding.
    cell.convert("RGBA").save(poster_path, "WEBP", quality=88, method=6)
    after = open(poster_path, "rb").read()

    print("grid    %s  %d frames, %dx%d, cell %dx%d"
          % (os.path.relpath(css_path, ROOT), n, cols, rows, cell_w, cell_h))
    print("poster  %s  %dx%d  (frame %d of %d, row %d col %d)"
          % (os.path.relpath(poster_path, ROOT), cell_w, cell_h,
             i, n, row, col))
    if before is None:
        print("bytes   new file, %d" % len(after))
    elif before == after:
        print("bytes   UNCHANGED at %d - frame %d is what was already there"
              % (len(after), i))
    else:
        print("bytes   %d -> %d" % (len(before), len(after)))


if __name__ == "__main__":
    main()

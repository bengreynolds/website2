# uicapture

Helpers for capturing a **desktop application** being driven through a real
workflow, so a case study can show software running rather than a rebuilt
picture of it. Windows only; they call `user32` directly.

Rule 0 of `docs/software-animation-patterns.md` is what these exist to serve.
**Software only** — hardware figures are CAD renders and belong to
`docs/fusion-animation-pipeline.md`, which these scripts have nothing to do
with.

## The scripts

| Script | Does |
|---|---|
| `grab.ps1` | Captures one window to a PNG by title match. |
| `place.ps1` | Restores a window to a recorded position and size. |
| `click.ps1` | Clicks a point given in **window** coordinates. |
| `type.ps1` | Clicks a field and types into it. |

All take `-TitleMatch` (default `NWB Forge`); change it for another app.

## Why `grab.ps1` is not a screenshot

It uses `PrintWindow` with `PW_RENDERFULLCONTENT`, which asks the window to
draw *itself* into our device context. Two consequences that matter:

- Nothing else on the machine can appear in a frame. A screen-region grab of
  someone's desktop is not something to put in a portfolio.
- A window sitting on top does not occlude the capture.

## Coordinates expire

`click.ps1` takes window-relative coordinates measured off a capture, so they
survive the window moving but **not** the UI changing. Raising a base font from
13px to 14px widened a tab bar enough to move every tab; the old coordinate
then landed on the wrong one. Re-probe after any change to type or spacing, and
verify what got selected rather than assuming.

A click issued before the layout settles selects nothing. Wait, then check.

## A typical run

```powershell
$u = "scripts\uicapture"
# 1. launch the app however it is normally launched, then wait for its window
do { Start-Sleep -Seconds 5
     $p = Get-Process | Where-Object { $_.MainWindowTitle -like '*NWB Forge*' }
   } until ($p)

# 2. pin the geometry once; restore it before every later frame so the
#    sequence is dimensionally identical and can cross-dissolve
@{Left=2570;Top=-254;Width=1900;Height=1050} |
  ConvertTo-Json | Set-Content -Encoding utf8 "$u\window-geometry.json"
& "$u\place.ps1"

# 3. drive and capture
& "$u\grab.ps1"  -Out frames\01-start.png
& "$u\type.ps1"  -X 980 -Y 783 -Text "C:\scratch\out.nwb" -ClearFirst
& "$u\click.ps1" -X 943 -Y 841        # a button
Start-Sleep -Seconds 15                # let the work finish
& "$u\grab.ps1"  -Out frames\02-done.png
```

Maximise the window before the first frame. The app's default size needed
scrolling to reach its own buttons, and a scrolled frame is useless in a
sequence.

## Turning frames into web assets

1400px WebP at quality ~82. Measured against the shipped project page, the
frame renders at 755 CSS px, so that is **1.85 source pixels per CSS pixel** —
essentially 1:1 on a DPR-2 panel, crisp on a hidpi laptop without shipping the
1900px original. Six frames came to 223KB. Lazy-load them, and do not sprite
them: a captured interface has to survive scaling, and a 520px sprite cell
makes it unreadable.

```python
from PIL import Image
im = Image.open(src).convert("RGB")
w = 1400
im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) \
  .save(dst, "WEBP", quality=82, method=6)
```

## Before you run one

Driving an app to completion makes it **do its work**. The NWB Forge run wrote
a real 197,056-byte `.nwb` and a validation report. Point the output at a
scratch directory, and tell the owner before running it.

Drive to the end even if you only need early frames — the one real bug this
exercise found was in the final state.

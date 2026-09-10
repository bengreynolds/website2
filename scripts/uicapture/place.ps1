# Restore the app window to the geometry recorded in window-geometry.json, so
# relaunching keeps it on the monitor the user actually has it on instead of
# letting Qt re-place it on whichever screen it feels like.
param([string]$TitleMatch = 'NWB Forge')

Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public class WinPlace {
  [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int ht, bool repaint);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
}
"@

$geoPath = Join-Path $PSScriptRoot 'window-geometry.json'
if (-not (Test-Path $geoPath)) { Write-Output 'NOGEO'; exit 1 }
$geo = Get-Content -Raw $geoPath | ConvertFrom-Json

$p = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitleMatch*" } | Select-Object -First 1
if (-not $p) { Write-Output 'NOWINDOW'; exit 1 }

[void][WinPlace]::MoveWindow($p.MainWindowHandle, [int]$geo.Left, [int]$geo.Top, [int]$geo.Width, [int]$geo.Height, $true)
[void][WinPlace]::SetForegroundWindow($p.MainWindowHandle)
Write-Output "placed at $($geo.Left),$($geo.Top) $($geo.Width)x$($geo.Height)"

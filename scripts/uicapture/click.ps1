# Click a point given in WINDOW coordinates (as measured off a grab.ps1 capture)
# and optionally grab the result. Window-relative so the coordinates stay valid
# if the window moves between runs.
param(
  [string]$TitleMatch = 'NWB Forge',
  [Parameter(Mandatory = $true)][int]$X,
  [Parameter(Mandatory = $true)][int]$Y,
  [string]$Out = ''
)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinClick {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public const uint DOWN = 0x0002, UP = 0x0004;
}
"@

$p = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitleMatch*" } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
$h = $p.MainWindowHandle
[void][WinClick]::SetForegroundWindow($h)
Start-Sleep -Milliseconds 350

$r = New-Object WinClick+RECT
[void][WinClick]::GetWindowRect($h, [ref]$r)
$sx = $r.Left + $X
$sy = $r.Top + $Y
[void][WinClick]::SetCursorPos($sx, $sy)
Start-Sleep -Milliseconds 120
[WinClick]::mouse_event([WinClick]::DOWN, 0, 0, 0, [IntPtr]::Zero)
Start-Sleep -Milliseconds 60
[WinClick]::mouse_event([WinClick]::UP, 0, 0, 0, [IntPtr]::Zero)
Write-Output "clicked window($X,$Y) -> screen($sx,$sy)"

if ($Out) {
  Start-Sleep -Milliseconds 900
  & "$PSScriptRoot\grab.ps1" -TitleMatch $TitleMatch -Out $Out
}

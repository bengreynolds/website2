# Capture a single top-level window by title, by its own contents.
# PrintWindow with PW_RENDERFULLCONTENT (2) asks the window to draw itself into
# our DC, so we get the app alone - not a region of the user's desktop, and not
# whatever happens to be sitting on top of it.
param(
  [string]$TitleMatch = 'NWB Forge',
  [Parameter(Mandatory = $true)][string]$Out
)

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Runtime.InteropServices;
public class WinGrab {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }

  public static string Grab(IntPtr h, string path) {
    if (IsIconic(h)) { ShowWindow(h, 9); System.Threading.Thread.Sleep(400); }
    RECT r; GetWindowRect(h, out r);
    int w = r.Right - r.Left, ht = r.Bottom - r.Top;
    if (w <= 0 || ht <= 0) return "bad-rect";
    using (Bitmap bmp = new Bitmap(w, ht))
    using (Graphics g = Graphics.FromImage(bmp)) {
      IntPtr hdc = g.GetHdc();
      bool ok = PrintWindow(h, hdc, 2);
      g.ReleaseHdc(hdc);
      bmp.Save(path, System.Drawing.Imaging.ImageFormat.Png);
      return ok ? ("ok " + w + "x" + ht) : ("fallback " + w + "x" + ht);
    }
  }
}
"@

$p = Get-Process | Where-Object { $_.MainWindowTitle -like "*$TitleMatch*" } | Select-Object -First 1
if (-not $p) { Write-Output "NOWINDOW"; exit 1 }
[void][WinGrab]::SetForegroundWindow($p.MainWindowHandle)
Start-Sleep -Milliseconds 500
$res = [WinGrab]::Grab($p.MainWindowHandle, $Out)
Write-Output "$res -> $Out"

# Click a field (window coordinates) and type into it.
# SendKeys treats + ^ % ~ ( ) { } [ ] as control characters, so each is escaped
# by wrapping it in braces. Backslashes and colons in a Windows path are safe.
param(
  [string]$TitleMatch = 'NWB Forge',
  [Parameter(Mandatory = $true)][int]$X,
  [Parameter(Mandatory = $true)][int]$Y,
  [Parameter(Mandatory = $true)][string]$Text,
  [switch]$ClearFirst
)

& "$PSScriptRoot\click.ps1" -TitleMatch $TitleMatch -X $X -Y $Y | Out-Null
Start-Sleep -Milliseconds 350

$escaped = [regex]::Replace($Text, '[+^%~(){}\[\]]', { param($m) '{' + $m.Value + '}' })

$wsh = New-Object -ComObject WScript.Shell
if ($ClearFirst) { $wsh.SendKeys('^a'); Start-Sleep -Milliseconds 120 }
$wsh.SendKeys($escaped)
Start-Sleep -Milliseconds 400
Write-Output "typed $($Text.Length) chars"

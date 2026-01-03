param(
  [string]$Kind = "ChatGPT_Log",
  [string]$Section = "Ship Today"
)

$ErrorActionPreference="Stop"
Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)

# Pull from clipboard
$clip = Get-Clipboard -Raw
if (!$clip -or $clip.Trim().Length -lt 10) {
  throw "Clipboard looks empty. Copy the block you want to save, then run again."
}

# Timestamped markdown file
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$out = "logs\${Kind}_${ts}.md"

@"
# $Kind
- Created: $(Get-Date -Format o)
- Source: Clipboard
- Section: $Section

## Content
$clip
"@ | Set-Content -Encoding UTF8 $out

Write-Host "OK: wrote $out"

# Commit + push (safe)
git add -A | Out-Null
$hasChanges = (git status --porcelain)
if ($hasChanges) {
  git commit -m "log: $Kind $ts" | Out-Null
  git push | Out-Null
  Write-Host "OK: committed + pushed log"
} else {
  Write-Host "OK: nothing to commit"
}

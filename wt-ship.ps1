param(
  [string]$Message = "ship: deploy"
)
$ErrorActionPreference="Stop"
Set-Location (Split-Path $MyInvocation.MyCommand.Path -Parent)

function Run($cmd) {
  Write-Host ">> $cmd"
  cmd /c $cmd
  if ($LASTEXITCODE -ne 0) { throw "Command failed: $cmd" }
}

# Build
Run "npm run build"

# Commit if changed
Run "git add -A"
$hasChanges = (git status --porcelain)
if ($hasChanges) {
  Run ("git commit -m `"$Message`"")
} else {
  Write-Host "OK: no changes to commit"
}

# Push
Run "git push"

# Try to trigger Pages workflow (optional but nice)
try {
  $wf = (gh workflow list --json name,path,state | ConvertFrom-Json | Where-Object { $_.name -match "deploy to GitHub Pages" } | Select-Object -First 1)
  if ($wf) {
    Run "gh workflow run `"$($wf.name)`""
    Run "gh run watch"
  } else {
    Write-Host "NOTE: Workflow 'deploy to GitHub Pages' not found; push should still trigger if configured."
  }
} catch {
  Write-Host "NOTE: Could not trigger/watch workflow automatically. Check Actions tab if needed."
}

Write-Host "DONE: ship completed"

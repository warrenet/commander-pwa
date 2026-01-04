$ErrorActionPreference = "Stop"

function Assert-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Missing command: $name"
  }
}

Assert-Cmd git
Assert-Cmd npm
Assert-Cmd gh

if (-not (Test-Path ".git")) { throw "Run this from the repo root (folder that contains .git)." }

# --- Identify repo ---
$repoName = Split-Path -Leaf (Get-Location)
$me = (gh api user --jq .login).Trim()
$full = "$me/$repoName"

# --- Ensure GitHub auth ---
try { gh auth status | Out-Null } catch { throw "GitHub CLI not authenticated. Run: gh auth login" }

# --- Ensure remote/repo exists ---
$exists = $true
try { gh repo view $full | Out-Null } catch { $exists = $false }

$hasOrigin = $true
try { git remote get-url origin | Out-Null } catch { $hasOrigin = $false }

if (-not $exists) {
  Write-Host "Creating repo: $full"
  gh repo create $repoName --public --source . --remote origin | Out-Null
} elseif (-not $hasOrigin) {
  Write-Host "Adding origin remote..."
  git remote add origin "https://github.com/$full.git"
}

# --- Sync main ---
git fetch origin | Out-Null
$branch = "main"
try { git checkout $branch | Out-Null } catch { git checkout -b $branch | Out-Null }
try { git pull origin $branch --ff-only | Out-Null } catch { Write-Host "WARN: Could not fast-forward pull; continuing." }

# --- Install + Build ---
if (Test-Path "package-lock.json") { npm ci } else { npm install }
npm run build

# --- Validate dist output (C = deploy readiness) ---
$mustHave = @(
  "dist/index.html",
  "dist/offline.html",
  "dist/share.html"
)
foreach ($p in $mustHave) {
  if (-not (Test-Path $p)) { throw "Build validation failed: missing $p" }
}
Write-Host "OK: build validated (dist/index.html, offline.html, share.html present)"

# --- Commit if changes ---
git add -A
$dirty = git status --porcelain
if ($dirty) {
  $msg = "feat(v1.2): offline hardening + MacroDroid deep links + diagnostics + weekly AI export"
  git commit -m $msg | Out-Null
  Write-Host "OK: committed changes"
} else {
  Write-Host "OK: no changes to commit"
}

# --- Push (B/C continuation via Actions) ---
git push -u origin $branch | Out-Null

Write-Host ""
Write-Host "OK: Repo     https://github.com/$full"
Write-Host "OK: Pages    https://$me.github.io/$repoName/"
Write-Host "Next: Open the Actions tab if you want to watch the Pages deploy."

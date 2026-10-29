$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$repo    = Join-Path $env:USERPROFILE "Desktop\davoniumtech-corporate-site"
$repoUrl = "https://github.com/DavoniumTech/davoniumtech-corporate-site.git"
$src     = $PSScriptRoot

Write-Host "Source: $src"

if (-not (Test-Path (Join-Path $repo ".git"))) {
  Write-Host "Cloning $repoUrl ..."
  git clone $repoUrl $repo
} else {
  Set-Location $repo
  git fetch origin
  git checkout main
  git pull origin main
}

Set-Location $repo
Write-Host ""
Write-Host "=== Remote HEAD ==="
git ls-remote origin refs/heads/main
Write-Host "=== Local HEAD ==="
git rev-parse HEAD

$backup = "backup/pre-v55-" + (Get-Date -Format "yyyyMMdd-HHmmss")
git branch $backup 2>$null
Write-Host "Backup branch: $backup"

Write-Host "Copying V55 files..."
robocopy $src $repo /E /XD .git LOCAL-DELIVERABLES /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if (Test-Path (Join-Path $repo "directory.md")) { Remove-Item (Join-Path $repo "directory.md") -Force }

git add -A
git status --short
git commit -m "V55: consolidated cinematic design system, dark space, light porcelain, bot closed on load"
if ($LASTEXITCODE -ne 0) { Write-Host "Commit step finished." }

Write-Host ""
Write-Host "Type PUSH and press Enter to push to origin main (no force)."
Write-Host "Anything else cancels."
$confirm = Read-Host "Confirmation"
if ($confirm -ceq "PUSH") {
  git push origin main
  if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: GitHub main verified"
    git ls-remote origin refs/heads/main
    Write-Host "Refresh https://www.davoniumtech.com/ after Cloudflare rebuild (Ctrl+F5)."
  } else {
    Write-Error "Push failed. No force was used."
  }
} else {
  Write-Host "Push cancelled. Local commit only."
}

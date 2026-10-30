$ErrorActionPreference = 'Stop'
$source = $PSScriptRoot
$repoInput = (Read-Host 'Enter the full path to your existing clean local davoniumtech-corporate-site Git repository').Trim()
if ([string]::IsNullOrWhiteSpace($repoInput)) { throw 'No repository path was supplied. Nothing was changed.' }
if (-not (Test-Path -LiteralPath $repoInput -PathType Container)) { throw "Repository folder does not exist: $repoInput" }
$repo = (Resolve-Path -LiteralPath $repoInput).Path
if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) { throw "The selected folder is not a Git repository: $repo" }

Write-Host 'Davonium V56 release preparation' -ForegroundColor Cyan
Write-Host 'This helper will not push unless you type PUSH at the final prompt.' -ForegroundColor Yellow
Set-Location $repo
$remoteUrl = git remote get-url origin
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) { throw 'The repository has no readable origin remote.' }
if ($remoteUrl -notmatch 'DavoniumTech/davoniumtech-corporate-site(\.git)?$') { throw "Unexpected origin remote: $remoteUrl. Stop and inspect it before continuing." }
$dirty = git status --porcelain
if ($LASTEXITCODE -ne 0) { throw 'Could not read Git status.' }
if ($dirty) { throw 'The target repository has local changes. Back them up or commit them separately before running this helper.' }

git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'git fetch failed.' }
git checkout main
if ($LASTEXITCODE -ne 0) { throw 'Could not checkout main.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'Could not fast-forward main. Resolve the repository state manually before continuing.' }

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = "backup/pre-v56-$stamp"
git branch $backup
if ($LASTEXITCODE -ne 0) { throw 'Could not create the local backup branch.' }
Write-Host "Local backup branch created: $backup"

robocopy $source $repo /E /XD .git /XF *.zip *.sha256 /NFL /NDL /NJH /NJS /NC /NS /NP
$copyCode = $LASTEXITCODE
if ($copyCode -ge 8) { throw "Robocopy failed with exit code $copyCode." }
if (Test-Path -LiteralPath (Join-Path $repo 'directory.md')) { Remove-Item -LiteralPath (Join-Path $repo 'directory.md') -Force }

git add -A
if ($LASTEXITCODE -ne 0) { throw 'git add failed.' }
$changes = git status --porcelain
if (-not $changes) { Write-Host 'No file changes to commit. No commit was created.' -ForegroundColor Green; exit 0 }
git status --short
git commit -m 'V56: Davonium Signal Architecture design refinement'
if ($LASTEXITCODE -ne 0) { throw 'Git commit failed. No push was attempted.' }

$localHead = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Could not read the new local commit.' }
$parent = (git rev-parse 'HEAD^').Trim()
if ($LASTEXITCODE -ne 0) { throw 'Could not read the new commit parent.' }
$remoteLine = git ls-remote origin refs/heads/main
if ($LASTEXITCODE -ne 0 -or -not $remoteLine) { throw 'Could not verify the remote main branch.' }
$remoteHead = ($remoteLine -split '\s+')[0]
if ($remoteHead -ne $parent) { throw "Remote main changed after the local update. Local commit parent: $parent; remote main: $remoteHead. Do not push; fetch and reconcile first." }

Write-Host ''
Write-Host "Prepared local commit: $localHead" -ForegroundColor Cyan
Write-Host "Verified remote main before push: $remoteHead" -ForegroundColor Cyan
Write-Host 'Production publication is a separate action and will not happen automatically.' -ForegroundColor Yellow
$approval = Read-Host 'Type PUSH to publish this exact commit to origin/main; anything else cancels'
if ($approval -ceq 'PUSH') {
    git push origin HEAD:main
    if ($LASTEXITCODE -ne 0) { throw 'Push failed. No force push was used. Check remote state before retrying.' }
    $verifyLine = git ls-remote origin refs/heads/main
    if ($LASTEXITCODE -ne 0 -or -not $verifyLine) { throw 'The push command returned success, but remote HEAD verification failed. Check GitHub before retrying.' }
    $verifiedHead = ($verifyLine -split '\s+')[0]
    if ($verifiedHead -ne $localHead) { throw "Remote main SHA $verifiedHead does not match local commit $localHead. Check GitHub before retrying." }
    Write-Host "Remote main verified at $verifiedHead. Verify the production deployment separately." -ForegroundColor Green
} else {
    Write-Host 'Push cancelled. V56 remains local; no remote write was made.' -ForegroundColor Yellow
}


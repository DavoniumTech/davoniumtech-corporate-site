param([string]$Source = $PSScriptRoot)
$ErrorActionPreference = 'Stop'

# Robust source path normalization: tolerate quotes, spaces, and trailing slash characters.
try {
  if ([string]::IsNullOrWhiteSpace($Source)) { $Source = $PSScriptRoot }
  $Source = [Environment]::ExpandEnvironmentVariables($Source.Trim().Trim([char]34))
  if ([string]::IsNullOrWhiteSpace($Source)) { $Source = $PSScriptRoot }
  $Source = $Source.TrimEnd([char[]]@([char]92, [char]47))
  if ([string]::IsNullOrWhiteSpace($Source)) { $Source = $PSScriptRoot }
  $Source = [System.IO.Path]::GetFullPath($Source)
  if (!(Test-Path -LiteralPath $Source -PathType Container)) { throw ('Source folder does not exist: ' + $Source) }
  $Source = (Get-Item -LiteralPath $Source).FullName.TrimEnd([char[]]@([char]92, [char]47))
} catch {
  Write-Host ('Source path validation failed: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'The website has not been copied or pushed. Keep this extracted folder and use the corrected V38 deployment command.' -ForegroundColor Yellow
  exit 2
}
$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Repo = Join-Path $Downloads 'davoniumtech-corporate-site-deploy'
$RemoteUrl = 'https://github.com/DavoniumTech/davoniumtech-corporate-site.git'
$RemotePattern = 'github\.com[:/]DavoniumTech/davoniumtech-corporate-site(?:\.git)?/?$'

function Invoke-GitChecked([string[]]$GitArgs) {
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) { throw ('Git failed: git ' + ($GitArgs -join ' ') + ' (exit ' + $LASTEXITCODE + ').') }
}
function Run-Robocopy([string]$From, [string]$To, [string[]]$ExtraArgs) {
  $copyArgs = @($From, $To, '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS') + $ExtraArgs
  & robocopy @copyArgs
  if ($LASTEXITCODE -ge 8) { throw ('Robocopy failed with exit code ' + $LASTEXITCODE + '.') }
}
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' DAVONIUM TECHNOLOGIES V38 - COMPLETE SITE DEPLOYMENT' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ('Source: ' + $Source)
Write-Host ('Repository: ' + $Repo)
$required = @('index.html','assets/css/release-polish-v38.css','demos/demos.js','sw.js','DEPLOY-V38-WINDOWS.cmd')
foreach ($item in $required) {
  if (!(Test-Path -LiteralPath (Join-Path $Source $item) -PathType Leaf)) { throw ('Required V38 file is missing: ' + $item + '. Extract the complete V38 ZIP and run its CMD from the extracted root folder.') }
}
$htmlCount = @(Get-ChildItem -LiteralPath $Source -Filter '*.html' -File -Recurse).Count
if ($htmlCount -lt 70) { throw ('Unexpectedly low HTML page count (' + $htmlCount + '). The complete source was not copied or extracted.') }
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git was not found. Install Git for Windows, reopen Command Prompt, and run this file again.' }
if (!(Test-Path -LiteralPath (Join-Path $Repo '.git'))) {
  if (Test-Path -LiteralPath $Repo) { throw ('The repository folder exists but is not a Git checkout: ' + $Repo + '. Rename that folder and retry; nothing was overwritten.') }
  Write-Host '[1/8] Cloning the official repository...'
  Invoke-GitChecked @('clone', $RemoteUrl, $Repo)
}
Push-Location $Repo
try {
  $remote = (& git remote get-url origin 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or $remote -notmatch $RemotePattern) { throw ('Safety stop: origin is not the expected Davonium repository. Current origin: ' + $remote) }
  $branch = (& git branch --show-current 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw ('Safety stop: expected branch main but found ' + $branch + '. Nothing was copied.') }
  $status = @(& git status --porcelain)
  if ($LASTEXITCODE -ne 0) { throw 'Could not inspect current Git status.' }
  if ($status.Count -gt 0) {
    Write-Host 'Uncommitted changes were found. They will NOT be overwritten.' -ForegroundColor Yellow
    $status | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
    throw 'Commit or safely back up these repository changes first. The deployment stopped before copying the website.'
  }
  Write-Host '[2/8] Syncing main safely (fast-forward only)...'
  Invoke-GitChecked @('fetch','origin','main')
  Invoke-GitChecked @('pull','--ff-only','origin','main')
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $backup = Join-Path $Downloads ('davonium-v38-safety-backup-' + $stamp)
  $branchName = 'backup-before-dvnm-v38-' + $stamp
  Write-Host '[3/8] Making a full local backup (excluding .git)...'
  New-Item -ItemType Directory -Path $backup -Force | Out-Null
  Run-Robocopy $Repo $backup @('/XD',(Join-Path $Repo '.git'))
  Write-Host '[4/8] Pushing a remote backup branch...'
  Invoke-GitChecked @('branch',$branchName)
  Invoke-GitChecked @('push','origin',$branchName)
  Write-Host '[5/8] Copying the complete V38 website without mirror-deleting files...'
  Run-Robocopy $Source $Repo @('/XD',(Join-Path $Source '.git'))
  $obsoleteHelpers = @(
    'DEPLOY-DVNM-FINAL-RELEASE-CMD.txt','DEPLOY-DVNM-WELCOME-VOICE-CMD.txt',
    'DEPLOY-MOBILE-VOICE-SEVEN-DEMO-CMD.txt','DEPLOY-V30-WINDOWS-CMD.txt',
    'DEPLOY-V31-WINDOWS-CMD.txt','DEPLOY-V32-WINDOWS.cmd','Deploy-V32.ps1',
    'README-V32-DEPLOY.txt','DEPLOY-V33-WINDOWS.cmd','Deploy-V33.ps1','README-V33-DEPLOY.txt',
    'DEPLOY-V34-WINDOWS.cmd','Deploy-V34.ps1','README-V34-DEPLOY.txt',
    'DEPLOY-V35-WINDOWS.cmd','Deploy-V35.ps1','README-V35-DEPLOY.txt',
    'DEPLOY-V36-WINDOWS.cmd','Deploy-V36.ps1','README-V36-DEPLOY.txt',
    'DEPLOY-V37-WINDOWS.cmd','Deploy-V37.ps1','README-V37-DEPLOY.txt',
    'DEPLOY-WINDOWS-CMD.txt'
  )
  $removedHelpers = @()
  foreach ($helper in $obsoleteHelpers) {
    $helperPath = Join-Path $Repo $helper
    if (Test-Path -LiteralPath $helperPath -PathType Leaf) { Remove-Item -LiteralPath $helperPath -Force; $removedHelpers += $helper }
  }
  if ($removedHelpers.Count -gt 0) { Write-Host ('Removed superseded deployment helpers: ' + ($removedHelpers -join ', ')) }
  $obsoleteAssets = @(
    'assets/css/release-polish-v30.css','assets/css/release-polish-v31.css','assets/css/release-polish-v32.css',
    'assets/css/release-polish-v33.css','assets/css/release-polish-v34.css','assets/css/release-polish-v35.css','assets/css/release-polish-v36.css','assets/css/release-polish-v37.css',
    'assets/images/dvnm-bot-body-v36.svg','assets/images/dvnm-bot-head-v36.svg',
    'assets/images/dvnm-bot-body-v37.svg','assets/images/dvnm-bot-head-v37.svg'
  )
  $removedAssets = @()
  foreach ($asset in $obsoleteAssets) {
    $assetPath = Join-Path $Repo $asset
    if (Test-Path -LiteralPath $assetPath -PathType Leaf) { Remove-Item -LiteralPath $assetPath -Force; $removedAssets += $asset }
  }
  if ($removedAssets.Count -gt 0) { Write-Host ('Removed consolidated obsolete assets: ' + ($removedAssets -join ', ')) }
  Write-Host '[6/8] Checking the release...'
  Invoke-GitChecked @('add','-A')
  $staged = @(& git diff --cached --name-only)
  if ($LASTEXITCODE -ne 0) { throw 'Could not inspect staged files. Local and remote backups are retained.' }
  if ($staged.Count -eq 0) {
    Write-Host 'The repository already matches V38; no new commit was needed.' -ForegroundColor Green
    return
  }
  Write-Host ('Files staged: ' + $staged.Count)
  $check = @(& git diff --cached --check 2>&1)
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Whitespace check reported warnings. Review before continuing:' -ForegroundColor Yellow
    $check | Select-Object -First 12 | ForEach-Object { Write-Host $_ }
  } else { Write-Host 'Whitespace check passed.' -ForegroundColor Green }
  $choice = Read-Host 'Ready to commit and push V38 to GitHub main. Type Y to continue'
  if ($choice -notmatch '^(?i:y|yes)$') { throw 'Push cancelled. The backup is retained and staged changes remain local.' }
  Write-Host '[7/8] Committing and pushing without force...'
  Invoke-GitChecked @('commit','-m','Release DVNM V38 robot-first UI, ink-navy theme and mobile refinement')
  try { Invoke-GitChecked @('push','origin','main') }
  catch {
    Write-Host 'The commit exists locally but push did not complete. Do not create another commit.' -ForegroundColor Yellow
    Write-Host 'After network/login is restored, run from the repository folder: git push origin main' -ForegroundColor Yellow
    throw
  }
  Write-Host '[8/8] Verifying the remote main commit...'
  $localCommit = (& git rev-parse HEAD).Trim()
  $remoteLine = (& git ls-remote --heads origin main)
  if ($LASTEXITCODE -ne 0) { throw 'Push completed, but remote verification could not reach GitHub. Check main on GitHub before trying another push.' }
  $remoteCommit = (($remoteLine | Select-Object -First 1) -split '\s+')[0]
  Write-Host ('Local : ' + $localCommit)
  Write-Host ('GitHub: ' + $remoteCommit)
  if ($localCommit -ne $remoteCommit) { throw 'Commit verification differs. Do not recommit; inspect GitHub main and retry only the push if needed.' }
  Write-Host 'SUCCESS: V38 commit is verified on GitHub main.' -ForegroundColor Green
  Write-Host ('Safety backup: ' + $backup)
  Write-Host ('Remote backup branch: ' + $branchName)
  Write-Host 'Next: check Cloudflare deployment. HTML revalidates and the updated service worker replaces the previous cache; then refresh with Ctrl+F5.'
} finally { Pop-Location }

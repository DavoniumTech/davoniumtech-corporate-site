param([string]$Source = $PSScriptRoot)
$ErrorActionPreference = 'Stop'
function Stop-Release([string]$Message) { throw $Message }
function Invoke-GitChecked([string[]]$GitArgs) {
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) { Stop-Release ('Git failed: git ' + ($GitArgs -join ' ') + ' (exit ' + $LASTEXITCODE + ').') }
}
function Run-Robocopy([string]$From, [string]$To, [string[]]$ExtraArgs) {
  $copyArgs = @($From, $To, '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS') + $ExtraArgs
  & robocopy @copyArgs
  if ($LASTEXITCODE -ge 8) { Stop-Release ('Robocopy failed with exit code ' + $LASTEXITCODE + '.') }
}
try {
  if ([string]::IsNullOrWhiteSpace($Source)) { $Source = $PSScriptRoot }
  $Source = [Environment]::ExpandEnvironmentVariables($Source.Trim().Trim([char]34))
  $Source = [System.IO.Path]::GetFullPath($Source)
  if (!(Test-Path -LiteralPath $Source -PathType Container)) { Stop-Release ('Source folder does not exist: ' + $Source) }
  $Source = (Get-Item -LiteralPath $Source).FullName.TrimEnd([char[]]@([char]92,[char]47))
  $required = @('index.html','assets/css/site-refresh-v40.css','assets/images/dvnm-bot-body-v40.svg','assets/images/dvnm-city-skyline-dark-v40.svg','demos/certificates/business-showcase-certificate.pdf','DEPLOY-V41-WINDOWS.cmd')
  foreach ($item in $required) { if (!(Test-Path -LiteralPath (Join-Path $Source $item) -PathType Leaf)) { Stop-Release ('Required release file is missing: ' + $item + '. Re-extract the complete ZIP.') } }
  $htmlCount = @(Get-ChildItem -LiteralPath $Source -Filter '*.html' -File -Recurse).Count
  if ($htmlCount -lt 70) { Stop-Release ('Unexpected HTML page count (' + $htmlCount + '). This is not the complete website package.') }
  if (!(Get-Command git -ErrorAction SilentlyContinue)) { Stop-Release 'Git was not found. Install Git for Windows, reopen CMD, and run again.' }
  if (!(Get-Command robocopy -ErrorAction SilentlyContinue)) { Stop-Release 'Robocopy is unavailable. This command requires Windows.' }

  $Downloads = Join-Path $env:USERPROFILE 'Downloads'
  $RemoteUrl = 'https://github.com/DavoniumTech/davoniumtech-corporate-site.git'
  $RemotePattern = 'github\.com[:/]DavoniumTech/davoniumtech-corporate-site(?:\.git)?/?$'
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
  $preferred = Join-Path $Downloads 'davoniumtech-corporate-site-deploy'
  $Repo = $null
  # Reuse only a clean, correct main checkout with no Git index lock. Never overwrite a dirty/mismatched checkout.
  if ((Test-Path -LiteralPath (Join-Path $preferred '.git')) -and !(Test-Path -LiteralPath (Join-Path $preferred '.git/index.lock'))) {
    $origin = (& git -C $preferred remote get-url origin 2>$null | Out-String).Trim()
    $originOk = ($LASTEXITCODE -eq 0 -and $origin -match $RemotePattern)
    $branch = (& git -C $preferred branch --show-current 2>$null | Out-String).Trim()
    $branchOk = ($LASTEXITCODE -eq 0 -and $branch -eq 'main')
    $status = @(& git -C $preferred status --porcelain 2>$null)
    $statusOk = ($LASTEXITCODE -eq 0 -and $status.Count -eq 0)
    if ($originOk -and $branchOk -and $statusOk) { $Repo = $preferred }
  }
  if (!$Repo) {
    $Repo = Join-Path $Downloads ('davoniumtech-corporate-site-deploy-v41-' + $stamp)
    Write-Host 'A clean safe checkout was not available. I will clone the official repository into a new folder and leave any existing folder untouched.' -ForegroundColor Yellow
    Invoke-GitChecked @('clone','--branch','main',$RemoteUrl,$Repo)
  }

  Write-Host '============================================================' -ForegroundColor Cyan
  Write-Host ' DAVONIUM TECHNOLOGIES V41 - DEPLOYMENT HOTFIX RELEASE' -ForegroundColor Cyan
  Write-Host '============================================================' -ForegroundColor Cyan
  Write-Host ('Source: ' + $Source)
  Write-Host ('Repository: ' + $Repo)
  Push-Location $Repo
  try {
    $remote = (& git remote get-url origin 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $remote -notmatch $RemotePattern) { Stop-Release ('Safety stop: origin is not the expected Davonium repository: ' + $remote) }
    $branch = (& git branch --show-current 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { Stop-Release ('Safety stop: expected main branch but found ' + $branch + '.') }
    $status = @(& git status --porcelain)
    if ($LASTEXITCODE -ne 0) { Stop-Release 'Could not inspect Git status.' }
    if ($status.Count -gt 0) { Stop-Release 'Safety stop: the selected Git checkout has uncommitted changes. No website files were copied or pushed. Existing folder was preserved.' }
    Write-Host '[1/8] Fetching and fast-forwarding main...' -ForegroundColor Cyan
    Invoke-GitChecked @('fetch','origin','main')
    Invoke-GitChecked @('pull','--ff-only','origin','main')
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
    $backup = Join-Path $Downloads ('davonium-v41-local-safety-backup-' + $stamp)
    $backupBranch = 'backup-before-dvnm-v41-' + $stamp
    Write-Host '[2/8] Creating local backup...' -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $backup -Force | Out-Null
    Run-Robocopy $Repo $backup @('/XD',(Join-Path $Repo '.git'))
    Write-Host '[3/8] Creating remote backup branch...' -ForegroundColor Cyan
    Invoke-GitChecked @('branch',$backupBranch)
    Invoke-GitChecked @('push','origin',$backupBranch)
    Write-Host '[4/8] Copying the complete website package...' -ForegroundColor Cyan
    Run-Robocopy $Source $Repo @('/XD',(Join-Path $Source '.git'))
    # Remove outdated deployment entry points from the GitHub worktree.
    $obsoleteHelpers = @(
      'DEPLOY-V30-WINDOWS-CMD.txt','DEPLOY-V31-WINDOWS-CMD.txt','DEPLOY-V32-WINDOWS.cmd','Deploy-V32.ps1','README-V32-DEPLOY.txt',
      'DEPLOY-V33-WINDOWS.cmd','Deploy-V33.ps1','README-V33-DEPLOY.txt','DEPLOY-V34-WINDOWS.cmd','Deploy-V34.ps1','README-V34-DEPLOY.txt',
      'DEPLOY-V35-WINDOWS.cmd','Deploy-V35.ps1','README-V35-DEPLOY.txt','DEPLOY-V36-WINDOWS.cmd','Deploy-V36.ps1','README-V36-DEPLOY.txt',
      'DEPLOY-V37-WINDOWS.cmd','Deploy-V37.ps1','README-V37-DEPLOY.txt','DEPLOY-V38-WINDOWS.cmd','Deploy-V38.ps1','README-V38-DEPLOY.txt',
      'DEPLOY-V39-WINDOWS.cmd','Deploy-V39.ps1','README-V39-DEPLOY.txt','DEPLOY-V40-WINDOWS.cmd','Deploy-V40.ps1','V40-RELEASE-NOTES.md','README-V40-DEPLOY.txt','V32-DEPLOY-FIX-README.txt','DEPLOY-WINDOWS-CMD.txt'
    )
    foreach ($helper in $obsoleteHelpers) { $p=Join-Path $Repo $helper; if (Test-Path -LiteralPath $p -PathType Leaf) { Remove-Item -LiteralPath $p -Force } }
    $cssFolder = Join-Path $Repo 'assets/css'
    if (Test-Path -LiteralPath $cssFolder -PathType Container) { Get-ChildItem -LiteralPath $cssFolder -Filter 'release-polish-v*.css' -File | Remove-Item -Force }
    Write-Host '[5/8] Checking and staging files...' -ForegroundColor Cyan
    Invoke-GitChecked @('add','-A')
    $staged = @(& git diff --cached --name-only)
    if ($LASTEXITCODE -ne 0) { Stop-Release 'Unable to inspect staged changes. Local/remote backups are retained.' }
    if ($staged.Count -eq 0) { Write-Host 'GitHub main already matches this release; no new commit is needed.' -ForegroundColor Green; return }
    if (!(Test-Path -LiteralPath (Join-Path $Repo 'assets/css/site-refresh-v40.css'))) { Stop-Release 'Safety check failed: active design-system stylesheet is missing from staged repository.' }
    if (!(Test-Path -LiteralPath (Join-Path $Repo 'demos/certificates/community-showcase-certificate.pdf'))) { Stop-Release 'Safety check failed: one or more individual demo certificates are missing.' }
    Write-Host ('Staged files: ' + $staged.Count)
    $check = @(& git -c core.whitespace=cr-at-eol diff --cached --check -- . ':(exclude,glob)**/*.pdf' 2>&1)
    if ($LASTEXITCODE -ne 0) { $check | Select-Object -First 15 | ForEach-Object { Write-Host $_ }; Stop-Release 'Staged whitespace validation failed.' }
    Write-Host 'Text-source whitespace check passed (generated PDF assets and CRLF line endings are handled correctly).' -ForegroundColor Green
    $answer = Read-Host 'Ready to commit and push V41 deployment hotfix to GitHub main. Type Y to continue'
    if ($answer -notmatch '^(?i:y|yes)$') { Stop-Release 'Push cancelled. The local backup and remote backup branch remain available.' }
    Write-Host '[6/8] Committing V41 deployment hotfix...' -ForegroundColor Cyan
    Invoke-GitChecked @('commit','-m','Release V41 deployment hotfix for complete Davonium Technologies website')
    Write-Host '[7/8] Pushing main without force...' -ForegroundColor Cyan
    try { Invoke-GitChecked @('push','origin','main') } catch { Write-Host 'Commit exists locally but push did not finish. Do not create another commit; restore connection/authentication then run git push origin main from the repository folder.' -ForegroundColor Yellow; throw }
    Write-Host '[8/8] Verifying GitHub main...' -ForegroundColor Cyan
    $localCommit = (& git rev-parse HEAD | Out-String).Trim()
    $remoteOutput = & git ls-remote --heads origin main
    if ($LASTEXITCODE -ne 0) { Stop-Release 'Push succeeded but GitHub verification could not reach the server. Check GitHub main before attempting any new commit.' }
    $remoteCommit = (($remoteOutput | Select-Object -First 1) -split '\s+')[0]
    Write-Host ('Local : ' + $localCommit)
    Write-Host ('GitHub: ' + $remoteCommit)
    if ($localCommit -ne $remoteCommit) { Stop-Release 'Remote commit differs from local. Do not recommit; inspect GitHub main and retry only if a push is actually pending.' }
    Write-Host 'SUCCESS: V41 commit is verified on GitHub main.' -ForegroundColor Green
    Write-Host ('Local backup: ' + $backup)
    Write-Host ('Remote backup branch: ' + $backupBranch)
    Write-Host 'Next: wait for Cloudflare deployment to finish, then refresh the live site with Ctrl+F5. Installed PWAs can update after their service worker activates.' -ForegroundColor Cyan
  } finally { Pop-Location }
} catch {
  Write-Host ''
  Write-Host ('DEPLOYMENT STOPPED: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'No force push is used. Review the message above; any completed backups are kept.' -ForegroundColor Yellow
  exit 2
}

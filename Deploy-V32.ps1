param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference = 'Stop'
$SourceInput = ([string]$Source).Trim().Trim('"')
if (!(Test-Path -LiteralPath $SourceInput -PathType Container)) { throw ('Source folder does not exist: ' + $SourceInput) }
$Source = (Get-Item -LiteralPath $SourceInput -ErrorAction Stop).FullName

$Downloads = Join-Path $env:USERPROFILE 'Downloads'
$Repo = Join-Path $Downloads 'davoniumtech-corporate-site-deploy'
$ExpectedRemotePattern = 'github\.com[:/]DavoniumTech/davoniumtech-corporate-site(?:\.git)?/?$'

function Invoke-GitChecked([string[]]$GitArgs) {
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) { throw ('Git command failed: git ' + ($GitArgs -join ' ') + ' (exit ' + $LASTEXITCODE + ').') }
}
function Run-Robocopy([string]$From, [string]$To, [string[]]$ExtraArgs) {
    $copyArgs = @($From, $To, '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS') + $ExtraArgs
    & robocopy @copyArgs
    if ($LASTEXITCODE -ge 8) { throw ('Robocopy failed with exit code ' + $LASTEXITCODE + '.') }
}

Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' DAVONIUM TECHNOLOGIES V32 - COMPLETE SOURCE DEPLOYMENT' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ('Source: ' + $Source)
Write-Host ('Target: ' + $Repo)

if (!(Test-Path -LiteralPath (Join-Path $Source 'index.html'))) { throw 'The extracted full website source is missing index.html. No target files changed.' }
if (!(Test-Path -LiteralPath (Join-Path $Source 'assets/css/release-polish-v32.css'))) { throw 'The V32 theme stylesheet is missing. No target files changed.' }
if (!(Test-Path -LiteralPath (Join-Path $Source 'assets/images/dvnm-bot-body-v32.webp')) -or !(Test-Path -LiteralPath (Join-Path $Source 'assets/images/dvnm-bot-head-v32.webp'))) { throw 'The full-body robot layers are missing. No target files changed.' }
if (!(Test-Path -LiteralPath (Join-Path $Repo '.git'))) { throw ('The existing Git repository was not found at ' + $Repo + '. Extract this ZIP and try again from the provided deployment command.') }

Push-Location $Repo
try {
    $branchOutput = & git branch --show-current 2>$null
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the Git branch. No files changed.' }
    # Normalize invisible whitespace/BOM and ANSI terminal colour sequences before comparing.
    $branch = (@($branchOutput) -join '')
    $branch = [regex]::Replace($branch, ([string][char]27 + '\[[0-?]*[ -/]*[@-~]'), '')
    $branch = [regex]::Replace($branch, '[\s\u00A0\u200B-\u200D\uFEFF]', '')
    if ($branch -ne 'main') { throw ("Safety stop: expected main branch but found '" + $branch + "'. No files changed.") }

    $remote = (& git remote get-url origin 2>$null).Trim()
    if ($LASTEXITCODE -ne 0 -or $remote -notmatch $ExpectedRemotePattern) { throw ("Safety stop: origin is not the DavoniumTech/davoniumtech-corporate-site repository. Current origin: " + $remote) }

    $status = @(& git status --porcelain)
    if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the working tree. No files changed.' }
    if ($status.Count -gt 0) {
        Write-Host 'Current repository changes:' -ForegroundColor Yellow
        $status | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
        throw 'Safety stop: the repository has local changes. Nothing was overwritten. Commit/stash those changes first.'
    }

    Write-Host '[1/7] Fetching the latest main safely...'
    Invoke-GitChecked @('fetch','origin','main')
    Invoke-GitChecked @('pull','--ff-only','origin','main')

    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $LocalBackup = Join-Path $Downloads ('davonium-v32-safety-backup-' + $stamp)
    $BackupBranch = 'backup-before-dvnm-v32-' + $stamp
    Write-Host '[2/7] Creating a local website backup...'
    New-Item -ItemType Directory -Path $LocalBackup -Force | Out-Null
    Run-Robocopy $Repo $LocalBackup @('/XD',(Join-Path $Repo '.git'))

    Write-Host '[3/7] Publishing a remote safety branch...'
    Invoke-GitChecked @('branch',$BackupBranch)
    Invoke-GitChecked @('push','origin',$BackupBranch)

    Write-Host '[4/7] Copying complete V32 website files (without mirror-deleting anything)...'
    Run-Robocopy $Source $Repo @('/XD',(Join-Path $Source '.git'))

    Write-Host '[5/7] Exporting a complete, portable website ZIP...'
    $FullZip = Join-Path $Downloads ('Davonium-Technologies-V32-FULL-WEBSITE-' + $stamp + '.zip')
    if (Test-Path -LiteralPath $FullZip) { Remove-Item -LiteralPath $FullZip -Force }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::Open($FullZip, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $SourcePrefix = $Source.TrimEnd('\') + '\'
        Get-ChildItem -LiteralPath $Source -Recurse -Force -File | Where-Object { $_.FullName -notmatch '[\\/]\.git([\\/]|$)' } | ForEach-Object {
            $entry = 'davoniumtech-corporate-site-v32/' + $_.FullName.Substring($SourcePrefix.Length).Replace('\','/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally { $zip.Dispose() }
    $hash = (Get-FileHash -LiteralPath $FullZip -Algorithm SHA256).Hash.ToLowerInvariant()
    Set-Content -LiteralPath ($FullZip + '.sha256.txt') -Value ($hash + '  ' + [IO.Path]::GetFileName($FullZip)) -Encoding ASCII
    Write-Host ('Full website ZIP: ' + $FullZip) -ForegroundColor Green
    Write-Host ('ZIP size: ' + [math]::Round((Get-Item -LiteralPath $FullZip).Length / 1MB, 2) + ' MB')
    Write-Host ('SHA-256: ' + $hash)

    Write-Host '[6/7] Staging the release...'
    Invoke-GitChecked @('add','-A')
    $changed = @(& git diff --cached --name-only)
    if ($LASTEXITCODE -ne 0) { throw 'Could not review the staged files. Backups and full-site ZIP are preserved.' }
    if ($changed.Count -eq 0) {
        Write-Host 'The Git source already matches this release. Nothing new needs committing.' -ForegroundColor Yellow
        Write-Host ('Local backup: ' + $LocalBackup)
        Write-Host ('Remote backup branch: ' + $BackupBranch)
        Write-Host ('Full website ZIP: ' + $FullZip)
        return
    }
    $whitespace = @(& git diff --cached --check 2>&1)
    $checkCode = $LASTEXITCODE
    if ($checkCode -ne 0) {
        Write-Host 'Notice: Git found whitespace warnings in staged legacy/source lines. They do not block the export; review the release before pushing.' -ForegroundColor Yellow
        $whitespace | Select-Object -First 8 | ForEach-Object { Write-Host $_ }
    } else { Write-Host 'Staged whitespace check passed.' -ForegroundColor Green }

    Write-Host ('Files staged: ' + $changed.Count)
    $choice = Read-Host 'Commit and push V32 to GitHub main now? Type Y to approve, or N to keep local'
    if ($choice -match '^(?i:y|yes)$') {
        Write-Host '[7/7] Committing and pushing without force...'
        Invoke-GitChecked @('commit','-m','Release DVNM full-body bot, midnight glass themes, voice and mobile V32')
        try {
            Invoke-GitChecked @('push','origin','main')
        } catch {
            Write-Host 'The commit is saved locally, but the push did not complete. Do not repeat the commit; retry this command from the repo:' -ForegroundColor Yellow
            Write-Host 'git push origin main' -ForegroundColor Yellow
            throw
        }
        Write-Host 'SUCCESS: V32 committed and pushed to GitHub main.' -ForegroundColor Green
        Write-Host ('Commit: ' + ((& git rev-parse --short HEAD).Trim()))
    } else {
        Write-Host 'Push skipped. Your complete website ZIP and local changes are ready; no remote main push was made.' -ForegroundColor Yellow
    }
    Write-Host '============================================================' -ForegroundColor Cyan
    Write-Host ('Local backup: ' + $LocalBackup)
    Write-Host ('Remote backup branch: ' + $BackupBranch)
    Write-Host ('Full website ZIP: ' + $FullZip)
    Write-Host 'Next: wait for Cloudflare Pages/Workers to finish deploying, then hard-refresh the site.'
} finally {
    Pop-Location
}

# Davonium Technologies V51 publisher — Windows PowerShell 5.1 compatible.
# Pushes public website files to main after explicit approval. Cloudflare deployment is a separate, explicit approval.
$ErrorActionPreference = 'Stop'
$Remote = 'https://github.com/DavoniumTech/davoniumtech-corporate-site.git'
$Branch = 'main'
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$TempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('Davonium-V51-Publish-' + $Stamp)
$Repo = Join-Path $TempRoot 'repository'
$CommitMessage = 'Redesign Davonium Technologies V51 UI and compact DVNM Bot'

function Invoke-Git {
    param([Parameter(Mandatory = $true)][string[]]$GitArgs)
    & git @GitArgs
    $gitCode = $LASTEXITCODE
    if ($gitCode -ne 0) {
        throw ('Git failed with exit code {0}: git {1}' -f $gitCode, ($GitArgs -join ' '))
    }
}

function Get-GitOutput {
    param([Parameter(Mandatory = $true)][string[]]$GitArgs)
    $gitOutput = @(& git @GitArgs 2>&1)
    $gitCode = $LASTEXITCODE
    if ($gitCode -ne 0) {
        throw ('Git inspection failed with exit code {0}: git {1}' -f $gitCode, ($GitArgs -join ' '))
    }
    return $gitOutput
}

function Get-RemoteBranchSha {
    param([string]$RemoteUrl, [string]$BranchName)
    $lines = @(& git ls-remote $RemoteUrl ('refs/heads/' + $BranchName) 2>&1)
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        throw ('Could not read remote main (git ls-remote exit code {0}). No new push was attempted.' -f $code)
    }
    foreach ($line in $lines) {
        if ([string]$line -match ('^(?<sha>[0-9a-f]{40})\s+refs/heads/' + [regex]::Escape($BranchName) + '$')) {
            return $Matches['sha']
        }
    }
    throw ('Remote branch {0} was not found. No push was attempted.' -f $BranchName)
}

Write-Host ''
Write-Host 'DAVONIUM TECHNOLOGIES V51 — GUARDED RELEASE' -ForegroundColor Cyan
Write-Host ('Repository: ' + $Remote)
Write-Host ('Branch: ' + $Branch)
Write-Host 'This script never force-pushes. It excludes directory.md, local proposals, credentials and deployment scripts. The actual host is configured as a Worker with static assets, not plain GitHub Pages.'
Write-Host 'Cloudflare deployment is optional and requires a separate DEPLOY confirmation.'

if (!(Test-Path -LiteralPath (Join-Path $Source 'index.html'))) { throw ('index.html is missing from the extracted package: ' + $Source) }
if (!(Test-Path -LiteralPath (Join-Path $Source 'wrangler.jsonc'))) { throw 'wrangler.jsonc is missing; cannot confirm the existing asset Worker configuration.' }
$GitCommand = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $GitCommand) { throw 'Git for Windows was not found. Install Git for Windows, reopen PowerShell and retry.' }

$ConfigPath = Join-Path $Source 'wrangler.jsonc'
$WorkerConfig = $null
try { $WorkerConfig = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json } catch { throw 'wrangler.jsonc could not be parsed as JSON. No push was attempted.' }
if ($WorkerConfig.name -ne 'davoniumtech-corporate-site' -or !$WorkerConfig.assets -or !$WorkerConfig.assets.directory) {
    throw 'The checked-in Wrangler config does not match the expected static-assets Worker. No push was attempted.'
}

# Capture and parse remote output in a separate step. Do not pipe git ls-remote straight into Select-Object,
# because PowerShell pipeline exit-code handling can falsely report failure after a successful push.
$BaseSha = Get-RemoteBranchSha -RemoteUrl $Remote -BranchName $Branch
Write-Host ('Current remote main: ' + $BaseSha) -ForegroundColor Yellow
New-Item -ItemType Directory -Path $TempRoot -Force | Out-Null
Invoke-Git -GitArgs @('clone', '--branch', $Branch, '--single-branch', $Remote, $Repo)
$ClonedSha = (& git -C $Repo rev-parse 'HEAD').Trim()
if ($LASTEXITCODE -ne 0 -or $ClonedSha -ne $BaseSha) {
    throw 'Remote main changed during the initial clone or could not be verified. No push was attempted.'
}

# Copy the website into a clean clone. LOCAL-DELIVERABLES and directory.md are for the local ZIP only.
$ExcludedDirectories = @('.git', 'node_modules', '__pycache__', '.venv', 'venv', 'LOCAL-DELIVERABLES')
$PrivatePattern = '(^|[\\/])\.env([^\\/]*$)|(^|[\\/])\.dev\.vars([^\\/]*$)|(^|[\\/])(secrets?|private|credentials?)([\\/]|$)|(^|[\\/])(service[-_]?account[^\\/]*|firebase-adminsdk[^\\/]*|client_secret[^\\/]*)\.json$|\.(pem|key|p12|pfx|jks|keystore|mobileprovision|p8|crt|der)$|(^|[\\/])[^\\/]*(credential|secret|token)[^\\/]*\.(json|ya?ml|txt)$'
$ExcludedFilePattern = '^(directory\.md|V49-QA-REPORT\.json|V49-RELEASE-NOTES\.md|V50-QA-REPORT\.json|V50-RELEASE-NOTES\.md|V51-QA-REPORT\.json|V51-RELEASE-NOTES\.md|MASTER-PROMPT-COVERAGE\.md|MASTER-3D-APPLICATION-BLUEPRINT\.md|BUILD-REPORT\.json|DEPLOY.*\.(cmd|ps1|txt)|Deploy.*\.ps1|PUBLISH.*\.(cmd|ps1|txt)|RESTORE-.*\.(cmd|ps1)|.*\.zip)$|^\.env'
$SourceFiles = @(Get-ChildItem -LiteralPath $Source -Force -Recurse -File)
foreach ($File in $SourceFiles) {
    $Relative = $File.FullName.Substring($Source.Length).TrimStart([char[]]@('\', '/'))
    $Parts = $Relative -split '[\\/]'
    $Skip = $false
    foreach ($Part in $Parts) { if ($ExcludedDirectories -contains $Part) { $Skip = $true; break } }
    if ($Skip) { continue }
    if ($File.Name -match $ExcludedFilePattern -or $Relative -match $PrivatePattern) { continue }
    $Target = Join-Path $Repo $Relative
    $Parent = Split-Path -Parent $Target
    if (!(Test-Path -LiteralPath $Parent)) { New-Item -ItemType Directory -Path $Parent -Force | Out-Null }
    Copy-Item -LiteralPath $File.FullName -Destination $Target -Force
}

# Remove local-only material and stale releases from the public working tree.
$PathsToRemove = @(
    'directory.md', 'DIRECTORY.md', 'LOCAL-DELIVERABLES', 'PUBLISH-ONE-COMMAND.txt', 'V49-QA-REPORT.json', 'V49-RELEASE-NOTES.md', 'V50-QA-REPORT.json', 'V50-RELEASE-NOTES.md', 'V51-QA-REPORT.json', 'V51-RELEASE-NOTES.md', 'MASTER-PROMPT-COVERAGE.md', 'MASTER-3D-APPLICATION-BLUEPRINT.md', 'BUILD-REPORT.json',
    'DEPLOY-DAVONIUM-V46.ps1', 'DEPLOY-DAVONIUM-V45.ps1', 'DEPLOY-DAVONIUM-V44.ps1',
    'DEPLOY-DAVONIUM-V43.ps1', 'Deploy-Davonium-V44.ps1',
    'assets/images/design-concepts/global-solutions-and-seven-demos.webp',
    'assets/images/design-concepts/dvnm-bot-mobile-interaction.webp',
    'assets/images/dvnm-human-presenter-v45.webp'
)
foreach ($RelativePath in $PathsToRemove) {
    $Existing = Join-Path $Repo $RelativePath
    if (Test-Path -LiteralPath $Existing) { Remove-Item -LiteralPath $Existing -Force -Recurse }
}
# Deployment helpers must never be copied into the public repository, including older ones already tracked.
$OldHelpers = @(Get-ChildItem -LiteralPath $Repo -Force -Recurse -File | Where-Object { $_.Name -match '^(DEPLOY.*\.(cmd|ps1|txt)|Deploy.*\.ps1|PUBLISH.*\.(cmd|ps1|txt))$' })
foreach ($Helper in $OldHelpers) { Remove-Item -LiteralPath $Helper.FullName -Force }

Push-Location -LiteralPath $Repo
try {
    Invoke-Git -GitArgs @('add', '-A')
    $StagedPaths = @(Get-GitOutput -GitArgs @('diff', '--cached', '--name-only'))
    if ($StagedPaths.Count -eq 0) {
        Write-Host 'No public website changes are staged. No commit or push was made.' -ForegroundColor Green
        exit 0
    }
    $StatusRows = @(Get-GitOutput -GitArgs @('diff', '--cached', '--name-status'))
    $UnsafePaths = @()
    foreach ($Row in $StatusRows) {
        $Columns = [string]$Row -split "`t"
        if ($Columns.Count -lt 2) { continue }
        $Status = $Columns[0]
        $PathName = $Columns[$Columns.Count - 1]
        $IsPrivate = ($PathName -match '(^|/)(directory\.md|LOCAL-DELIVERABLES)(/|$)|(^|/)DEPLOY.*\.(cmd|ps1|txt)$|(^|/)Deploy.*\.ps1$|(^|/)PUBLISH.*\.(cmd|ps1|txt)$|(^|/)\.env[^/]*$|(^|/)\.dev\.vars[^/]*$|(^|/)(secrets?|private|credentials?)/|\.(pem|key|p12|pfx|jks|keystore|mobileprovision|p8|crt|der)$')
        if ($IsPrivate -and $Status -eq 'D') { continue }
        if ($IsPrivate -or $PathName -match $PrivatePattern) { $UnsafePaths += $PathName }
    }
    if ($UnsafePaths.Count -gt 0) {
        Write-Host ($UnsafePaths -join "`n") -ForegroundColor Red
        throw 'A private/local-only path is staged. No push was attempted.'
    }

    $SecretPattern = 'BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9]{28,}'
    $SecretMatches = @(& git grep --cached -I -n -E $SecretPattern -- . 2>&1)
    $SecretScanCode = $LASTEXITCODE
    if ($SecretScanCode -eq 0) {
        $SecretLocations = @()
        foreach ($SecretMatch in $SecretMatches) {
            if ([string]$SecretMatch -match '^(?<path>[^:]+):(?<line>\d+):') {
                $SecretLocations += ($Matches['path'] + ':' + $Matches['line'])
            } else {
                $SecretLocations += '[location could not be safely parsed]'
            }
        }
        Write-Host 'Possible credential-like content was found. Values are suppressed; inspect only these file/line locations locally:' -ForegroundColor Red
        Write-Host (($SecretLocations | Select-Object -Unique) -join "`n") -ForegroundColor Red
        throw 'A possible credential pattern was found in the staged tree. No push was attempted.'
    }
    if ($SecretScanCode -ne 1) { throw ('Credential scan could not complete (git grep exit code {0}). No push was attempted.' -f $SecretScanCode) }

    Write-Host ''
    Write-Host 'Staged release summary:' -ForegroundColor Cyan
    Invoke-Git -GitArgs @('diff', '--cached', '--stat')
    Write-Host ''
    Write-Host 'Files to publish:' -ForegroundColor Cyan
    foreach ($PathName in $StagedPaths) { Write-Host ('  ' + $PathName) }
    Write-Host ''
    Write-Host 'directory.md, LOCAL-DELIVERABLES and deployment scripts will stay private.'
    Write-Host 'Type PUSH exactly to create a commit and publish to main. Anything else cancels before a remote push.'
    $Approval = Read-Host 'Approval'
    if ($Approval -cne 'PUSH') {
        Write-Host 'Cancelled. No remote push was made.' -ForegroundColor Yellow
        exit 0
    }

    $GitName = (& git config --get user.name 2>$null)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace([string]$GitName)) {
        $GitName = Read-Host 'Git commit author name'
        if ([string]::IsNullOrWhiteSpace($GitName)) { throw 'Git author name is required. No push was made.' }
        Invoke-Git -GitArgs @('config', '--local', 'user.name', $GitName)
    }
    $GitEmail = (& git config --get user.email 2>$null)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace([string]$GitEmail)) {
        $GitEmail = Read-Host 'Git commit author email'
        if ([string]::IsNullOrWhiteSpace($GitEmail)) { throw 'Git author email is required. No push was made.' }
        Invoke-Git -GitArgs @('config', '--local', 'user.email', $GitEmail)
    }

    Invoke-Git -GitArgs @('commit', '-m', $CommitMessage)
    $LocalSha = (& git rev-parse 'HEAD').Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($LocalSha)) { throw 'The new commit SHA could not be read.' }
    $BackupBranch = 'backup/davonium-v51-before-' + $Stamp
    Write-Host ('Backing up original main commit to ' + $BackupBranch + '...') -ForegroundColor Yellow
    Invoke-Git -GitArgs @('push', 'origin', ($BaseSha + ':refs/heads/' + $BackupBranch))
    Write-Host 'Publishing the release commit to main without force...' -ForegroundColor Yellow
    Invoke-Git -GitArgs @('push', 'origin', ('HEAD:refs/heads/' + $Branch))

    # Verify with captured output and a checked exit code, not a pipeline that can mask the native exit code.
    $RemoteLines = @(& git ls-remote origin ('refs/heads/' + $Branch) 2>&1)
    $RemoteCode = $LASTEXITCODE
    if ($RemoteCode -ne 0) {
        Write-Host ('The push command succeeded for commit ' + $LocalSha + ', but verification could not read GitHub. Do not rerun; inspect GitHub main first.') -ForegroundColor Yellow
        exit 2
    }
    $RemoteSha = $null
    foreach ($Line in $RemoteLines) {
        if ([string]$Line -match ('^(?<sha>[0-9a-f]{40})\s+refs/heads/' + [regex]::Escape($Branch) + '$')) { $RemoteSha = $Matches['sha']; break }
    }
    if ($RemoteSha -ne $LocalSha) {
        Write-Host ('Local commit: ' + $LocalSha) -ForegroundColor Yellow
        Write-Host ('Remote commit: ' + [string]$RemoteSha) -ForegroundColor Yellow
        Write-Host 'The remote did not verify as the release commit. Do not rerun; inspect GitHub main before any other action.' -ForegroundColor Red
        exit 2
    }
    Write-Host ''
    Write-Host ('SUCCESS: GitHub main verified at ' + $LocalSha) -ForegroundColor Green
    Write-Host ('Backup branch: ' + $BackupBranch)

    Write-Host ''
    Write-Host ('Configured Cloudflare Worker: ' + $WorkerConfig.name)
    $WorkflowDir = Join-Path $Repo '.github/workflows'
    $AutoDeployWorkflow = $false
    if (Test-Path -LiteralPath $WorkflowDir) {
        $WorkflowFiles = @(Get-ChildItem -LiteralPath $WorkflowDir -Recurse -File | Where-Object { $_.Extension -in @('.yml', '.yaml') })
        foreach ($WorkflowFile in $WorkflowFiles) {
            $WorkflowText = Get-Content -LiteralPath $WorkflowFile.FullName -Raw
            if (($WorkflowText -match '(?is)wrangler[\s\S]{0,180}\bdeploy\b') -or ($WorkflowText -match 'cloudflare/pages-action') -or ($WorkflowText -match 'cloudflare/wrangler-action')) { $AutoDeployWorkflow = $true; break }
        }
    }
    if ($AutoDeployWorkflow) {
        Write-Host 'A repository workflow appears to deploy through Cloudflare. Skipping manual Wrangler deployment to avoid a conflicting second deployment.' -ForegroundColor Yellow
        Write-Host 'Verify the published release in the GitHub Actions/Cloudflare deployment logs.'
        exit 0
    }
    Write-Host 'No Cloudflare deploy workflow was detected in the cloned repository, but an external Git-to-Cloudflare integration cannot be discovered from repository files.' -ForegroundColor Yellow
    Write-Host 'Inspect Cloudflare > Workers & Pages > this Worker > Settings/Builds before proceeding.'
    Write-Host 'Type DEPLOY only if you have confirmed that this exact main commit is NOT already being deployed automatically. Enter/anything else skips deployment.'
    $DeployApproval = Read-Host 'Cloudflare deployment approval'
    if ($DeployApproval -cne 'DEPLOY') {
        Write-Host 'GitHub publication is verified. Cloudflare deployment was skipped by choice.' -ForegroundColor Yellow
        exit 0
    }

    $Npx = Get-Command 'npx.cmd' -ErrorAction SilentlyContinue
    if ($null -eq $Npx) { throw 'npx.cmd was not found. Install Node.js or fix PATH. GitHub push is already verified; do not republish.' }
    $WhoOutput = @(& $Npx.Source --yes wrangler@4 whoami 2>&1)
    $WhoCode = $LASTEXITCODE
    if ($WhoCode -ne 0) {
        Write-Host 'Wrangler is not authenticated in this Windows profile. Starting browser-based login...' -ForegroundColor Yellow
        & $Npx.Source --yes wrangler@4 login
        $LoginCode = $LASTEXITCODE
        if ($LoginCode -ne 0) { throw 'Cloudflare login did not complete. GitHub is already published; do not repeat the push.' }
        $WhoOutput = @(& $Npx.Source --yes wrangler@4 whoami 2>&1)
        $WhoCode = $LASTEXITCODE
        if ($WhoCode -ne 0) { throw 'Could not verify the Cloudflare account. GitHub is already published; do not repeat the push.' }
    }
    Write-Host 'Wrangler account identity:' -ForegroundColor Cyan
    foreach ($Line in $WhoOutput) { Write-Host ([string]$Line) }
    Write-Host 'Confirm that this is the Cloudflare account that owns the intended Davonium Worker/domain.'
    $AccountApproval = Read-Host 'Type DEPLOY again to confirm this account'
    if ($AccountApproval -cne 'DEPLOY') {
        Write-Host 'GitHub publication is verified. Cloudflare deployment was skipped because the account was not confirmed.' -ForegroundColor Yellow
        exit 0
    }
    $WorkerConfigPath = Join-Path $Repo 'wrangler.jsonc'
    & $Npx.Source --yes wrangler@4 deploy --config $WorkerConfigPath
    $WranglerCode = $LASTEXITCODE
    if ($WranglerCode -ne 0) { throw ('Wrangler deployment returned exit code {0}. GitHub main is already published; do not repeat the push.' -f $WranglerCode) }

    Write-Host 'Wrangler reported a successful Worker deployment. Verifying the public website release marker...' -ForegroundColor Yellow
    $TestUrls = @(
        'https://www.davoniumtech.com/',
        'https://www.davoniumtech.com/work',
        'https://www.davoniumtech.com/docs/',
        'https://www.davoniumtech.com/demos/business',
        'https://www.davoniumtech.com/demos/shop',
        'https://www.davoniumtech.com/demos/portfolio',
        'https://www.davoniumtech.com/demos/learning',
        'https://www.davoniumtech.com/demos/technology'
    )
    $NotUpdated = @()
    foreach ($Url in $TestUrls) {
        try {
            $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 25
            if ($Response.StatusCode -lt 200 -or $Response.StatusCode -ge 300 -or $Response.Content -notmatch 'davonium-v51-studio\.css\?v=51') {
                $NotUpdated += $Url
            }
        } catch { $NotUpdated += $Url }
    }
    if ($NotUpdated.Count -gt 0) {
        Write-Host 'Worker deployment command completed, but these live routes did not confirm the V51 studio stylesheet marker:' -ForegroundColor Yellow
        foreach ($Url in $NotUpdated) { Write-Host ('  ' + $Url) }
        Write-Host 'Check custom-domain routing, hosting integration and cache. Do not rerun the publisher just because the live marker is stale.' -ForegroundColor Yellow
    } else {
        Write-Host 'SUCCESS: the V51 studio stylesheet marker was confirmed on the homepage, Work, Documentation and all five demo routes.' -ForegroundColor Green
    }
} finally {
    Pop-Location -ErrorAction SilentlyContinue
}

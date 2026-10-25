# Davonium Technologies — V43 Website Release

This is the full static-site source package for the Davonium Technologies corporate website. It retains the existing pages, branded icons, product/service descriptions, documentation, legal pages, progressive-web-app assets, and sample demo pages while replacing the main DVNM Bot character with an articulated Three.js character.

## What changed in V43

- **Actual real-time 3D character:** DVNM Bot is built from articulated 3D meshes and materials in Three.js, not layered SVG art. Its idle movement, head/eye attention, blinking, chest core, antenna, subtle orbit elements, arm gesture, pointer tracking, and mouth movement during browser speech are animated in the renderer.
- **Performance-first loading:** the small local renderer waits until a robot canvas is near the viewport before importing Three.js. It lowers antialiasing/pixel ratio on phones, pauses while hidden or off-screen, respects `prefers-reduced-motion`, and falls back to the existing artwork if WebGL or the CDN is unavailable. The main site remains readable without that optional effect.
- **Five primary demos:** DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills, and DVNM Digital. Growth/marketing patterns are folded into Biz; community/skills patterns are folded into Skills. Older routes remain available for backward compatibility but are not promoted as core demos.
- **No automatic welcome takeover:** the initial page view is no longer interrupted by the large welcome overlay. The visitor opens the bot and requests speech when they choose.
- **Separate theme palettes:** the existing theme toggle retains the written content and changes interface colors/visual surfaces. The robot's shell lighting also responds to the active theme.
- **Deployment correction:** `Deploy-Davonium-V43.ps1` is the exact script invoked by `DEPLOY-DAVONIUM-V43.cmd`; both are included in the ZIP and excluded from the public commit. This fixes the previous V42 mismatch where a launcher could refer to a missing script.
- `directory.md` is included for local navigation only and is excluded from the Git commit. Treat it as private local documentation; do not place credentials in it.
- `CNAME` keeps the intended host `www.davoniumtech.com`.

## Publish from Windows

**Prerequisites:** Git for Windows, an account with push permission to `DavoniumTech/davoniumtech-corporate-site`, network access, and GitHub authentication set up through Git Credential Manager or an equivalent secure login. Do not place a token in a command or source file.

### Simplest route

1. Extract the whole ZIP to a new folder.
2. Double-click `DEPLOY-DAVONIUM-V43.cmd`.
3. Read the checks. When you are ready, type exactly `PUSH` at the final prompt.

The script creates a fresh clone in `%USERPROFILE%\Davonium-Website-Releases`, creates a local ZIP backup, excludes local-only and secret patterns, prepares a backup branch of the old `main`, stages a full mirror of this release, validates the staged paths, commits, pushes without force, and compares the resulting GitHub `main` SHA with the local release commit. It stops if any check fails.

### Single command to extract and start deployment

If you saved the ZIP in the standard Windows `Downloads` folder, open **PowerShell** and paste the one-liner from `PUBLISH-ONE-COMMAND.txt`. It extracts the ZIP into a new timestamped folder and launches the CMD deployment runner.

## GitHub Pages and the custom domain

The script pushes the source to the repository's `main` branch. It cannot switch GitHub Pages settings or configure DNS. In the repository, verify **Settings → Pages** is configured to publish from `main` and the repository root (`/(root)`), or use the existing Pages workflow if the repository is already configured that way. Then confirm the custom domain and DNS remain correct before relying on `www.davoniumtech.com`. If the repo is hosted on Cloudflare Pages instead, the git push triggers deployment only if that integration is configured.

## Private file and secrets warning

`directory.md` is local-only. GitHub Pages is public hosting; never commit anything that must be secret. `.gitignore` is not encryption, does not remove secrets from earlier Git history, and does not revoke exposed credentials. Rotate any key that was ever published. Browser JavaScript configuration values must be treated as public.

## Validation and honest limitations

Static release checks passed: both changed JavaScript files pass Node syntax checks; 73 HTML pages were parsed; 3,045 local URL references and 331 same-page anchor references resolved; duplicate HTML IDs were not found; five CSS files parsed without errors; and the sitemap/manifest validate. A headless Chromium screenshot attempt stalled in this environment, so the page has not received a confirmed browser visual pass here, and physical Android/iOS tests have not been run. The Three.js module is fetched from jsDelivr at runtime, so first-load 3D needs access to that CDN. Offline or restricted-network use falls back to the existing robot artwork. TTS is browser-provided; the bot does not ship a proprietary voice model or phoneme-perfect lip synchronisation. Live GitHub publishing and live Pages build success must be confirmed by running the deployment script with your authorized GitHub account.

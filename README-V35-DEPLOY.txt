DAVONIUM TECHNOLOGIES V35 — COMPLETE WEBSITE ZIP

THIS RELEASE FIXES THE V34 DEPLOYMENT ERROR
The V34 CMD passed a folder path ending in a backslash as a quoted PowerShell argument. On Windows, the final backslash could interfere with the closing quote and cause `Resolve-Path : Illegal characters in path`. V35 launches the PS1 from its own directory without that argument, and PowerShell normalizes paths defensively.

INCLUDED
- Complete website source, all current routes and seven distinctly themed demo websites
- Existing features, QR images, product/service pages, docs and PWA files
- Two previously provided design-concept images integrated into Our Work > Visual concept gallery as optimized WebP
- Concise homepage copy, priority/lazy-loading corrections, clean robot and bot-panel surfaces
- DVNM Bot outside-tap dismissal and mobile panel sizing
- V35 versioned CSS, versioned site JS reference, a fresh service-worker cache name, and cache header tuning
- `DEPLOY-V35-WINDOWS.cmd` and `Deploy-V35.ps1`

WINDOWS DEPLOYMENT
1. Download the entire V35 ZIP.
2. Run the one-line PowerShell command provided in ChatGPT or extract the ZIP and double-click `DEPLOY-V35-WINDOWS.cmd`.
3. Keep Git for Windows installed, internet active, and GitHub authentication working.
4. The deployment script validates the source, checks the official repo and `main`, pulls fast-forward only, stops if the repo has uncommitted changes, creates local and remote safety backups, copies without mirror-deleting, and asks for confirmation before committing/pushing.
5. Type `Y` at the explicit commit prompt. Confirm the printed local and GitHub commit hashes match.
6. Check Cloudflare deployment status and refresh the site with Ctrl+F5.

CACHE NOTES
- HTML and `sw.js` are not set to a long immutable cache. This permits newer HTML and service-worker code to be fetched.
- Versioned CSS/JS URLs use long browser caching; a changed asset must receive a new `?v=N` URL.
- The service worker has a new cache name and deletes the prior Davonium cache on activation. Existing installed apps will update when their browser checks and activates the new service worker; this is not an instantaneous force-update on every already-open screen.

HONEST LIMITS
- Static checks cover local references, parse errors, and package integrity, but the release has not been run through a live Windows Git/GitHub push or physical mobile browser in this environment. No script can promise zero errors under every machine/network/account condition; this version specifically fixes the path failure shown in your log.
- The concept images are labeled as concept artwork, not screenshots of the live website. This code release does not redraw the robot artwork's baked-in arm pose.
- No DNS, Cloudflare account bindings, Firebase, or product backend settings are changed.

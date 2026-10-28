# Davonium Technologies — V49 immersive website release

**Production domain:** https://www.davoniumtech.com/  
**Repository:** https://github.com/DavoniumTech/davoniumtech-corporate-site.git  
**Release marker:** V49  
**Deployment configuration in this source:** Cloudflare Worker with static assets (`davoniumtech-corporate-site`, as configured in `wrangler.jsonc`). This is not configured as a plain GitHub Pages deployment.

## What V49 adds

- A native ES-module immersive control layer under `assets/js/immersive/`: `App.js`, `EventDispatcher.js`, `AssetLoader.js`, `SceneManager.js`, `RenderEngine.js`, `InputController.js`, and `AudioManager.js`.
- A compact, accessible control deck on the homepage, Work page, and five core demos. It stays hidden until an actual WebGL scene reports ready, so failed WebGL/CDN loads do not leave a dead control panel over the fallback.
- Render quality selection: Adaptive, High performance, and Battery saver. The two scene renderers expose rolling 60-frame telemetry and adapt pixel ratio in Adaptive mode within device-aware caps.
- Live frame-rate readout, approximate GPU-memory estimate, Orbit/Cinematic/Reset camera presets, a theme shortcut, PNG capture, a visible reduce-effects preference, opt-in synthesized ambient audio, and optional pointer-based spatialisation. Sound is never started before the visitor turns it on.
- Page-scene raycasting for object hover feedback and more purposeful interactive 3D response.
- Lower-allocation renderer resize/animation work in the procedural DVNM Bot, improved scene resource disposal when a robot canvas is removed, and a ResizeObserver fallback for older browsers.
- Service-worker cache version and cache-busting URLs updated to V49; the new module graph and control-deck stylesheet are included in the PWA core cache.
- Windows PowerShell 5.1 publisher updated to V49. It checks remote `main`, prepares the public tree from the clean remote clone, excludes local-only files and deployment scripts, scans staged changes for common credential patterns, asks for exact `PUSH` approval before a normal non-force push, then separately asks for `DEPLOY` and account confirmation before Cloudflare deployment.

## What remains from the V48 site

The existing semantic HTML, company content, logo/icon, 73 published HTML routes, PWA/offline experience, readable documentation library, product-status language, five distinct demo route identities, certificate showcase, shared procedural Three.js DVNM Bot, fallback art, and light/dark theme are preserved. V49 builds on the supplied V48 archive; it is not a new generic site template.

## Entry points

- `index.html`: company homepage and full DVNM Bot welcome scene.
- `work.html`: product status, four-stage delivery process, shared robot scene.
- `demos/business.html`, `shop.html`, `portfolio.html`, `learning.html`, `technology.html`: five original demo experiences.
- `assets/js/immersive/App.js`: module entry for the new scene-control layer.
- `assets/js/immersive/`: event bus, asset tracking, input, audio, scene registry and renderer controls.
- `assets/js/dvnm-final-v45.js`: existing page-scene renderer, now exposing a bounded adapter for module controls.
- `assets/js/dvnm-robot-3d.js`: articulated procedural Three.js robot renderer, with quality/camera/telemetry hooks.
- `assets/css/davonium-v49-hud.css`: compact responsive control deck.
- `sw.js`, `manifest.webmanifest`, `_headers`, `_redirects`, `wrangler.jsonc`: PWA, headers and deployment/routing configuration.
- `directory.md`, `LOCAL-DELIVERABLES/`, `V49-QA-REPORT.json`, `V49-RELEASE-NOTES.md`, `MASTER-PROMPT-COVERAGE.md`, and `DEPLOY-DAVONIUM-V49.ps1`: local-only package content. They must not be published by the release helper.

## One-command Windows release

Save `Davonium-Technologies-V49-Immersive-Release.zip` in your Windows Downloads folder. Open Windows PowerShell 5.1 or later and paste the single command in `PUBLISH-ONE-COMMAND.txt`. The command extracts the archive into a fresh timestamped folder and runs the included V49 publisher; no separate helper download is needed.

Requirements: Git for Windows, permission to the GitHub repository, and Node.js/npm plus authenticated Cloudflare access only if you approve the separate Worker deployment. The script will not push without typing `PUSH`, will not force-push, and will not deploy to Cloudflare without typing `DEPLOY` twice. It will not change DNS or rewrite Git history.

## Honest QA status

The generated `V49-QA-REPORT.json` is the source of truth for the checks run in this environment. Static integrity and syntax checks can be run locally here. Native Windows PowerShell execution and a full browser/physical-device pass could not be performed in this environment; GitHub and the public website could not be reached from the shell network, and Chromium navigation was blocked by the environment. The publisher therefore remains guarded and must verify the real remote/live environment from your Windows machine before publication.

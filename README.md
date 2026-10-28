# Davonium Technologies — V48 immersive website release

**Production domain:** https://www.davoniumtech.com/  
**Repository:** https://github.com/DavoniumTech/davoniumtech-corporate-site.git  
**Current release marker:** V48  
**Deploy target configured in this source:** Cloudflare Worker with static assets (`davoniumtech-corporate-site` in `wrangler.jsonc`).

## What changed in V48

- Added a consistent Inter-led typography system with system-font fallbacks and a clean, high-contrast light/dark interface across all 73 HTML routes. The exact font used by the A&S Tech reference could not be verified from its accessible source, so Inter is a deliberate approximation rather than a claim of exact font matching.
- Removed the second full-screen intro injection from the legacy scene module; the existing DVNM welcome remains the sole entry greeting. The headline reveal is letter-by-letter, short, skippable through the existing welcome action, and respects reduced-motion settings.
- Fixed the page-scene rendering bug where `baseX` and `baseZ` were referenced without being destructured from each scene object, which could stop the animation loop on first draw.
- Fixed the duplicate Creative/Skills scene-control row. The shared V48 controls on all five demos now update the real Three.js scene mode as well as the visible control state; Skills controls also change the sample learning accordion state.
- Corrected the actual demo class selectors for DVNM Biz and DVNM Skills, so the right accent, surface and theme environment apply.
- Kept the angular, articulated, procedural Three.js DVNM Bot as the common character for the homepage, welcome and Work feature, with the head-only assistant launcher and vector fallback. The old concept-image references are absent from the Work source.
- Kept the assistant to one launcher and one speech toggle, including a visible “Stop speaking” state. Voice settings remain inside a collapsed panel section. Speech remains user-triggered.
- Added crisp, different light/dark surface, lighting, orbital motion and demo-environment treatments without changing page wording. Reduced motion turns off looping decorative effects.
- Refined mobile nav, bottom-sheet bounds, touch targets, safe-area spacing, Docs typography/search panels, certificate output/print/share styles, and code block containment.
- Corrected Services content to describe exactly five core demos and added scoped business-systems/workflow automation and analytics/integration services inspired by useful business-software categories in the Hestek reference—without copying its claims, testimonials or metrics.
- Included an editable business digital-presence and operations proposal under `LOCAL-DELIVERABLES/` for local reference. The proposal is excluded from GitHub and the public Worker release.
- Updated service-worker cache version to V48 and adjusted CSP for the optional Google Fonts stylesheet/files and locally generated certificate image blob URLs.
- Rebuilt the publisher for Windows PowerShell 5.1 syntax: it checks live remote `main` first, copies only public website files into a clean clone, checks private paths and common credential patterns, asks for `PUSH`, backs up the current main commit to a branch, uses a normal non-force push, then verifies the exact remote SHA. Cloudflare Worker deployment is separate and asks for `DEPLOY` twice, including account confirmation.

## Main entry points

- `index.html`: homepage and angular 3D DVNM Bot stage.
- `work.html`: product progress, delivery process and shared robot scene; no old concept-image block.
- `services.html`: service catalogue and the five-demo journey.
- `assets/css/davonium-v48-cinematic.css`: global typography, theme environments, responsive page layout and demo scene controls.
- `assets/js/davonium-v48-experience.js`: shared demo scene controls, assistant/welcome consistency and runtime orchestration.
- `assets/js/dvnm-final-v45.js`: existing modular scene renderer, type reveal, docs search/filter and related enhancements; updated for V48 scene control integration.
- `assets/js/dvnm-robot-3d.js`: articulated, hard-surface Three.js DVNM Bot and its animation states.
- `assets/js/site.js`: navigation, persisted appearance settings, DVNM Bot, browser speech and PWA behavior.
- `demos/`: five distinct sample experiences, local sample interactions, and certificate/showcase material.
- `docs/`: public guide catalogue and individual documentation routes.
- `sw.js`, `manifest.webmanifest`, `_headers`, `_redirects`, `wrangler.jsonc`: PWA, routing, security headers, and current Worker-with-assets configuration.
- `LOCAL-DELIVERABLES/`: locally editable business proposal (MD + DOCX); **not sent to GitHub or the public Worker**.
- `directory.md`: local-only source map; **not sent to GitHub or the public Worker**.
- `DEPLOY-DAVONIUM-V48.ps1`: local publishing tool; **not sent to GitHub or the public Worker**.
- `V48-QA-REPORT.json`: static checks and explicit limitations.

## One-command release on Windows

Save this ZIP in your Windows Downloads folder, open Windows PowerShell 5.1 or later, and paste the single command supplied with this release. It extracts the archive to a fresh timestamped folder and runs the included `DEPLOY-DAVONIUM-V48.ps1` script. You do not need to download a separate script.

Requirements: Git for Windows, Node.js/npm for the optional Cloudflare step, and authenticated permission for the GitHub repository/Cloudflare account. If the `PUSH` prompt is not explicitly approved, the GitHub release is cancelled. After the push is verified, the script offers an optional `DEPLOY` step for the Worker configured in `wrangler.jsonc`; it will not change DNS or rewrite Git history.

## Privacy and release integrity

`directory.md`, `LOCAL-DELIVERABLES/`, and deployment helpers are included only in the local ZIP and are excluded from the public repository/Worker. A deletion from the current commit does not remove data from older public Git history. If credentials were ever committed, rotate them and review history separately. Never put keys, passwords or account secrets in frontend source.

## QA status

The V48 QA report records static checks. In this environment: 73 HTML pages were parsed; 3,385 local HTML `href`/`src` references resolved; 331 same-page fragment links were checked with no missing targets; there were no duplicate HTML IDs, CSS parser errors or Node JavaScript syntax errors; sitemap XML, Web App Manifest, and Worker config parsed. Nine CSS URL references were also checked. All five demo routes exist and include the shared scene-control layer.

**Not claimed:** native Windows PowerShell execution; a full interactive browser visual pass (local headless Chromium timed out); physical Android/iOS/tablet testing; a GitHub push or Cloudflare deployment from this environment; or confirmation of live CDN/cache changes. Use the staged summary and route marker checks in the publisher to verify actual release state.

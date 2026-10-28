# Davonium Technologies — V50 immersive website release

**Production domain:** https://www.davoniumtech.com/  
**Repository:** https://github.com/DavoniumTech/davoniumtech-corporate-site.git  
**Release marker:** V50  
**Configured deployment:** Cloudflare Worker with static assets (`davoniumtech-corporate-site`, as configured in `wrangler.jsonc`). The release helper does not assume that the site is hosted by plain GitHub Pages.

## V50 additions

- An incremental vanilla-JavaScript ES-module layer under `assets/js/immersive/`: `App.js`, `CoreEngine.js`, `EventDispatcher.js`, `AssetLoader.js`, `SceneManager.js`, `RenderEngine.js`, `InputController.js`, `AudioManager.js`, `ObjectPool.js`, `ShaderPipeline.js`, and `ParticleEngine.js`.
- A responsive control deck on the homepage, Work page and five core demo experiences. It becomes available only after a live 3D scene reports ready.
- Adaptive / High / Battery render-quality profiles, a rolling 60-frame FPS sample already present in the page renderer, an explicitly estimated GPU-memory readout, Orbit/Cinematic/Reset camera presets, theme controls, reduced-effects mode, PNG capture, and user-activated procedural audio.
- A GLSL-displaced `THREE.InstancedMesh` field. High mode supports up to 100,000 instances on desktop-capacity scenes; adaptive and battery profiles build smaller counts by default. This is not a measured 100k performance benchmark or a physics engine.
- Optional Web Audio `PannerNode` positioning with stereo-panning fallback and real loader-progress support for Three.js-style loaders.
- More careful scene listener/resource disposal, query/cache version V50, and a publisher that checks remote `main` and asks for explicit release approval.

## Existing site preserved

The release builds upon the supplied V48 source and the previous V49 control layer; it is not a generic replacement template. It retains the existing semantic HTML, company identity, product/status copy, 73 HTML pages, documentation library, PWA/offline behavior, policies, certificates, QR assets, five distinct demo routes and the procedural DVNM Bot. Text and primary actions remain outside WebGL so the site remains readable if graphics fail.

## Entry points

- `index.html`: company homepage and DVNM Bot welcome scene.
- `work.html`: work/product progress and delivery story.
- `demos/business.html`, `demos/shop.html`, `demos/portfolio.html`, `demos/learning.html`, `demos/technology.html`: five distinct sample experiences.
- `assets/js/immersive/App.js`: module entry point for immersive controls.
- `assets/js/immersive/`: event, lifecycle, asset-progress, input, audio, pooling, shader, particle, scene and render-control modules.
- `assets/js/dvnm-final-v45.js`: existing page-scene renderer with the V50 particle integration hooks.
- `assets/js/dvnm-robot-3d.js`: articulated procedural robot renderer.
- `assets/css/davonium-v50-hud.css`: responsive control deck.
- `sw.js`, `manifest.webmanifest`, `_headers`, `_redirects`, `wrangler.jsonc`: PWA, headers and route/deployment configuration.

## One-command Windows release

Save `Davonium-Technologies-V50-World-Class-3D-Release.zip` in your Windows Downloads folder, then paste the single command from `PUBLISH-ONE-COMMAND.txt` into Windows PowerShell 5.1 or later. It extracts to a timestamped folder and invokes `DEPLOY-DAVONIUM-V50.ps1`. The script checks the actual remote `main` SHA, stages changes from a clean remote clone, checks for private files and common credential patterns, asks for exact `PUSH` confirmation, creates a backup branch, uses a normal non-force push and verifies the remote SHA. Cloudflare deployment is a separate choice and requires `DEPLOY` confirmation twice plus account verification. It does not change DNS or rewrite Git history.

Requirements: Git for Windows and access to the GitHub repository. Node.js/npm and Cloudflare authentication are needed only if deployment is separately approved. The supplied command does not itself prove publication or deployment succeeded.

## Honest QA status

`V50-QA-REPORT.json` records the static and local HTTP checks that actually passed. The V50 tree passed HTML/reference/fragment checks, CSS parsing and URL resolution, JavaScript syntax/import checks, SVG/XML/JSON/config parsing, the service-worker path audit, and 19/19 local HTTP smoke checks. Chromium browser navigation was blocked by administrator policy, so full visual/runtime checks and a real GLSL compile were not verified. Native Windows PowerShell 5.1 execution, physical device/screen-reader testing, live GitHub verification and production deployment remain pending.

`MASTER-PROMPT-COVERAGE.md` maps the six-section interactive 3D blueprint and 24-section Davonium redesign brief. `MASTER-3D-APPLICATION-BLUEPRINT.md` records the technical blueprint. The original 24-section prompt, QA notes and coverage docs are kept in the local ZIP for review but excluded by the publisher from the public deployment tree. `directory.md` is local-only and is removed from the public staged tree if tracked; deleting it from the latest commit does not erase older Git history.

# Davonium Technologies — V51 Studio Redesign

**Production domain:** https://www.davoniumtech.com/  
**Repository:** https://github.com/DavoniumTech/davoniumtech-corporate-site.git  
**Release marker:** V51  
**Configured deployment:** Cloudflare Worker with static assets (`davoniumtech-corporate-site`, from `wrangler.jsonc`). Do not assume this is a plain GitHub Pages target.

## V51 visual redesign

V51 introduces a new visual direction for the existing Davonium site: a cleaner editorial layout, stronger responsive typography, clearer actions, updated theme/surface tokens, restrained cyan/violet accents, more deliberate hero composition, and a consistent control style. It preserves the company's real content, product statuses, policies, documentation, contact paths, five demo URLs, certificate/QR pages, PWA behavior, and compatibility routes rather than replacing the website with a content-free template.

Page families have different treatments. About, Products, Services, Work, Contact, Install, Support, Documentation and legal pages have their own section treatments. DVNM Biz, Market, Creative, Skills, and Digital use separate art directions and accent palettes. All 73 HTML pages load the new `assets/css/davonium-v51-studio.css` layer.

## The compact DVNM Bot

The former bulky articulated robot has been replaced by a small, friendly real-time Three.js companion: a simple light shell, dark visor, expressive cyan eyes and smile, compact limbs, and a glowing `DVNM` chest mark. While browser speech synthesis is active, the chest/body glow responds to the speaking state and the mouth pulses at reported speech boundaries where the browser supports them. Speech is user initiated and has a stop action; there is no microphone capture. WebGL/import failure, context loss, reduced-motion/low-data conditions, and supported fallback paths must not make the site's text or primary controls inaccessible.

The fallback SVGs are illustrations, not described as live 3D. Real-time rendering depends on the user's browser and the external Three.js module load.

## Engineering retained and extended

- Vanilla JavaScript and native ES modules; no React or Vue migration was introduced.
- Existing Three.js scene manager with capped pixel ratio, adaptive timing, resize/visibility controls, camera presets, reduced-effects mode, optional procedural Web Audio, PNG capture, and a GLSL-displaced instanced-particle option.
- Existing immersive module layer under `assets/js/immersive/` for event dispatch, scene management, controls, audio, assets, pools, shaders, and particles.
- CSS-sized canvas layout, responsive breakpoints, safe-area-aware floating controls, focus states, theme tokens, and reduced-motion styling.
- Service-worker cache version and asset references updated to V51.

High particle mode is a capacity option, not an asserted 100,000-particle benchmark or guaranteed 60/120 FPS. The full advanced blueprint is not claimed as complete: CSM, HDRI/PMREM, a complete production post-processing chain, Rapier/Cannon physics, and a fully authored GLTF/Rive content pipeline still require implementation or verification. See `MASTER-PROMPT-COVERAGE.md` and `MASTER-3D-APPLICATION-BLUEPRINT.md` in the local release archive.

## Entry points

- `index.html` — company homepage and compact DVNM Bot experience.
- `about.html`, `products.html`, `services.html`, `work.html`, `contact.html`, `install.html`, `support.html` — core company journeys.
- `demos/business.html`, `demos/shop.html`, `demos/portfolio.html`, `demos/learning.html`, `demos/technology.html` — five distinct sample experiences.
- `assets/css/davonium-v51-studio.css` — V51 visual system.
- `assets/js/dvnm-robot-3d.js` — small real-time Three.js DVNM Bot.
- `assets/js/site.js` — shared UI, theme, speech and event coordination.
- `assets/js/immersive/` — modular immersive-engine support layer.
- `sw.js`, `manifest.webmanifest`, `_headers`, `_redirects`, `wrangler.jsonc` — PWA, headers, route and deployment configuration.

## One-command Windows release

Save `Davonium-Technologies-V51-Complete-Redesign.zip` in your Windows Downloads folder, then paste the one-line command from `PUBLISH-ONE-COMMAND.txt` into Windows PowerShell 5.1 or later. It extracts to a timestamped directory and starts `DEPLOY-DAVONIUM-V51.ps1`.

The publisher checks the existing remote `main` SHA, clones into a clean temporary directory, excludes local-only files and deployment helpers, checks common credential patterns, requests exact `PUSH` approval, creates a backup branch, uses a normal non-force push, and verifies the resulting remote SHA. If no repository-based Cloudflare deploy workflow is detected, a separate optional Worker deployment requires two `DEPLOY` confirmations and Cloudflare account verification. It does not change DNS, rewrite Git history, or claim success simply because a subprocess started. External Git-to-Cloudflare integrations must still be checked in the Cloudflare dashboard.

`directory.md`, this private QA/coverage material, the original Davonium redesign brief (`LOCAL-DELIVERABLES/DAVONIUM-MASTER-REDESIGN-BRIEF-ORIGINAL.md`) and the 3D blueprint transcription (`LOCAL-DELIVERABLES/MASTER-3D-APPLICATION-BLUEPRINT-TRANSCRIPTION.md`), ZIPs and deployment script are local-delivery artifacts and are excluded from the public push. Removing an already-tracked private file from the latest revision does not erase older public Git history.

## QA status — read before publishing

`V51-QA-REPORT.json` records the static checks and limitations observed for this package. Current source audit: 73 HTML pages, 3,472 local references, 333 fragment checks, no unresolved references/fragments, no duplicate-ID pages, no CSS parser errors, no JavaScript syntax errors or missing relative imports, valid SVG/XML, and V51 stylesheet linked on all HTML pages. These are source-level checks, not proof of visual correctness.

Chromium navigation was blocked by administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`), so browser rendering, actual shader compilation, screen-size screenshots, bot click/reopen stress tests, voice quality, and physical mobile-device behavior are not verified. Native Windows PowerShell execution, live GitHub verification and production deployment have not been run in this environment. Review the V51 QA report and remaining requirements before approving release.

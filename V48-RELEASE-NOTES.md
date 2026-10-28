# V48 release notes — Davonium Technologies

## Visual and UX changes
- Added the V48 shared typography and theme layer across all current HTML routes.
- Light and dark modes now use distinct surfaces, scene lighting and orbit treatments; copy and content stay the same.
- Added clearly bounded desktop/mobile layout rules for the assistant, welcome, content cards, Docs and certificate output.
- Added an Inter font import with resilient system fallbacks; the exact A&S Tech font could not be verified from accessible source code.

## Interaction/runtime changes
- Kept a single welcome owner; removed the duplicate legacy full-screen intro call while retaining the typed headline.
- Corrected a missing `baseX`/`baseZ` destructuring in the Three.js page-scene animation loop.
- Consolidated Creative and Skills controls into one control group across all five demo pages.
- Scene buttons now dispatch to the real Three.js scene controller as well as updating their accessible selected state; Skills modes also expand the relevant sample curriculum sections.
- Fixed DVNM Biz and DVNM Skills theme selector names so the actual body classes receive their visual treatment.
- Kept the hard-surface DVNM Bot and one opt-in speaking toggle; no separate Stop button is added.

## Content, security and deployment
- Services page correctly names five core demo experiences and includes scoped business-system/workflow and reporting/integration services.
- Included an editable local business proposal (Markdown and DOCX) in `LOCAL-DELIVERABLES/`; the publishing script excludes it.
- Added local-only `directory.md` and explicit publishing exclusions for it, local proposal files, old deployment scripts and common secret patterns.
- Publisher checks remote `main`, creates a backup branch before the normal push, verifies exact remote SHA, and offers a separate approved Worker deploy through `npx.cmd`.
- Updated `sw.js` cache name to V48 and CSP for Google Fonts and locally generated image blob URLs.

## Validation performed
- 73 HTML pages parsed; all 73 contain the V48 CSS and JS entry points.
- 3,385 local HTML href/src references resolved; 331 same-page fragment links tested; no unresolved local references or fragment targets.
- No duplicate HTML IDs.
- 8 CSS files parsed with no reported CSS parser errors.
- 9 JavaScript files passed `node --check`.
- `sitemap.xml`, `manifest.webmanifest`, and `wrangler.jsonc` parsed successfully.
- Five demo routes exist and use the shared scene-control layer.
- Local ZIP integrity to be checked after final packaging.

## Not verified in this environment
- Native Windows PowerShell parser/runtime execution (not installed here).
- Full browser screenshots/interactive browser QA (local headless Chromium timed out).
- Physical mobile/tablet device testing.
- GitHub remote push, Worker deploy, live CSS-marker confirmation, or CDN cache purge from this environment.
- Exact font-family on `astechltd.netlify.app`; Inter is a considered approximation, not an exact font identification.

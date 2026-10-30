# Davonium Technologies — V58 Signal Experience

V58 extends V57 with a continuous starfield, translucent section cards, complete hero typography, 18 unique service-gallery images, dedicated photo-story galleries for all five demos, animated project transitions, a full-screen image lightbox, DVNM Bot speech controls, and an improved guarded PowerShell publisher. See `DESIGN-DIRECTION-V58.md`, `V58-RELEASE-NOTES.md` and `V58-QA-REPORT.json`.

## Previous release — V57 Signal Studio

V57 introduced the site-wide star-sky base, photo-led service cards, five independent demo routes, the icon-only header, a single WhatsApp floating action, the matched DVNM Bot portrait and five A4 QR flyers. See `V57-RELEASE-NOTES.md` and `V57-QA-REPORT.json`.

# Davonium Technologies — V56 Signal Architecture

V56 is a V55-based visual and experience refinement. It preserves the existing multi-page website, five core demos, product statuses, documentation library, PWA, support and legal routes, certificate experiences, and approved Davonium brand assets.

## Preview V56 locally (historical)

1. Extract the V56 ZIP.
2. Open PowerShell in the extracted `davonium_v56` folder.
3. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREVIEW-V56.ps1
```

4. Open the local preview URL printed in PowerShell. Stop the server with `Ctrl+C`.

Node.js is required for the included lightweight static preview server; no npm packages need to be installed. This is a local preview only; it does not deploy or publish the site.

## Main V56 changes

- New Signal Architecture visual system: graphite/cyan dark mode and porcelain/cyan light mode.
- Homepage hero uses the approved transparent DVNM Bot cutout against a Davonium-specific architectural portal composition.
- Optional desktop WebGL architecture scene; CSS and approved artwork remain the fallback. The 3D layer pauses when off-screen or when the tab is hidden and is skipped for reduced-motion, mobile/low-power and Save-Data contexts.
- Demo Studio cards now use the existing original DVNM demo artwork instead of generic placeholder windows.
- Homepage services preview expanded to reflect the actual service catalogue.
- Added a concise four-stage delivery process.
- Shared design tokens and responsive refinements added to the existing HTML routes.
- Work-page description made more precise about what the procedural robot renderer actually does.
- PWA service-worker cache name and core assets refreshed for V56.

## Important

- No customer results, testimonials, certifications, awards, performance scores or commercial launch statuses have been invented.
- Product statuses and route destinations are retained from the V55 source.
- The homepage robot is an approved transparent artwork. A separate real-time 3D architectural scene is an optional progressive enhancement; the character artwork is not described as a live 3D model.
- The standalone enterprise HTML concept was not merged because it contained nonfunctional demo/search controls and an enquiry flow that displayed success without a real submission backend.
- This ZIP has not been pushed to GitHub or deployed to Cloudflare. Do not publish without checking the repository's current remote state and explicitly approving `PUSH`.

See `DESIGN-DIRECTION-V56.md`, `V56-RELEASE-NOTES.md` and `V56-QA-REPORT.json` for details.

## V58 Preview and publishing

## Preview V58 locally

1. Extract the ZIP.
2. Open PowerShell in the extracted `davonium_v58` folder.
3. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREVIEW-V58.ps1
```

4. Open the local preview URL printed in PowerShell. The preview is local only and does not deploy the website.

## Publish V58 to the existing GitHub clone

Use the PowerShell command in `PUBLISH-V58-ONE-COMMAND.txt`. It expects the existing Davonium Git clone under the user's profile, creates a backup branch, prepares a commit and asks for `PUSH` before writing to `origin/main`. It does not deploy the Cloudflare production site.

See `DESIGN-DIRECTION-V58.md`, `V58-RELEASE-NOTES.md` and `V58-QA-REPORT.json` for the V58 design, scope and verification record.

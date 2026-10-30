# Davonium Technologies V62 — Glass Constellation

V62 is a focused integration repair and visual finish over the existing Davonium multi-page project.

## What changed

- Removed opaque section-sized background slabs across the public website, documentation, certificate and five demo pages so the shared starfield remains visible.
- Preserved individual content cards as translucent glass surfaces; large quote/CTA bands and section headers are now transparent page content.
- Increased star density and visibility and strengthened twinkle, drift and sparkle glints.
- Rebuilt the desktop homepage hero grid to use the laptop canvas: wider copy column and a full-width right-side architectural stage for the same standing DVNM Bot artwork.
- Kept tablet/mobile stacking and full robot image visibility.
- Kept dark as the first-visit theme and retained the separate light/dark theme toggle.
- Added a header voice shortcut for the existing DVNM Bot, a current-page explanation topic and a working "Open this section" link for every selected Bot topic.
- Made the standing Robot mouth/chest animation follow active browser speech more visibly.
- Kept the current sticky company header and return-to-Studio route on the demo pages.
- Rotated the PWA cache to V62 and added the new CSS/JS assets to the offline core.
- Added a guarded Windows PowerShell 5.1 publishing script. It protects private files, backs up interrupted working-tree changes before reset, treats staged deletions correctly, fetches `origin/main`, never force-pushes and requires the exact `PUSH` approval.

## Preserved

The Davonium brand mark, approved robot assets, current primary navigation, product names and status wording, services, existing routes, five independent demo identities, printable flyers, QR codes, certificates, documentation, footer and PWA are retained.

## Verification

See `V62-QA-REPORT.json` for the static audit and local HTTP checks. Real-browser screenshot testing, physical Android/iOS testing and Lighthouse/Web Vitals are not claimed as passed.

## Deployment

The ZIP is a source release. `PUBLISH-V62.ps1` can prepare and push a commit to the existing GitHub repository after explicit approval. It does not publish to the production host automatically; the hosting provider's deployment status must be checked separately.

## Final transparency and desktop correction

- Legacy V29 alternating section washes and the V56 solid quote/CTA surfaces are overridden at the final V62 cascade. Section canvases are transparent, while individual cards, list steps, notices and the QR panel keep a translucent glass surface.
- The About page text column no longer receives an unintended glass card. The DVNM Bot portrait remains an individual glass card.
- The existing QR/share area is the visual benchmark for all pages: visible starfield behind transparent section canvases, with only content cards surfaced.
- The desktop hero uses a wider right-hand robot/orbit stage and three small illuminated status labels; tablet and mobile retain a centred stacked composition.
- Starfield density and sparkle brightness have been increased. The fixed canvas is visible behind every route and pauses when the tab is hidden; reduced-motion preference remains respected.
- On matching routes, the Bot's relevant topic reads the current page content and provides an open-page link. Mouth/chest motion responds to browser speech activity and word-boundary pulses.

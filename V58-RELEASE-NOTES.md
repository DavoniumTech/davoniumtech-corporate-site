# Davonium Technologies — V58 Signal Experience Release Notes

**Release:** V58 Signal Experience  
**Date:** 30 October 2026  
**Source:** V57 Signal Studio  
**Release type:** Site-wide visual, content and interaction refinement

## Main improvements

1. **Continuous atmospheric background** — introduced a denser, higher-contrast vector star field that stays fixed behind every route and scroll section. Section shells and content cards are now translucent, allowing the star field to remain visible through the interface in dark and light modes.
2. **Section-as-card system** — page sections use a consistent glass/editorial panel with rounded edges, restrained borders and no unnecessary shadows. The background remains visible through the panels.
3. **Homepage hierarchy** — corrected hero typography so `Digital products, engineered for impact.` can wrap fully instead of clipping the second phrase at desktop widths. The copy is more declarative and company-level. Navigation now uses `Work`.
4. **Service image galleries** — all six primary homepage service cards now contain three different photographic-style images (18 unique images across the six cards). The Services page has its own aligned image sets for the six core disciplines, plus separate imagery for secondary service areas.
5. **Mobile image framing** — demo previews, service galleries and individual demo story images preserve the complete image with responsive `contain` framing rather than cropping the subject.
6. **Five demo identities** — each individual demo receives three dedicated story images, a distinct accent system, a consistent corporate header and a top-level `Back to Demo Studio` arrow. Existing demo routes are preserved.
7. **Motion and navigation** — cross-document View Transitions are enabled where supported, with a brief fallback curtain elsewhere. Demo image previews navigate directly; service and story imagery opens in an animated, keyboard-accessible lightbox.
8. **DVNM Bot voice** — added an explicit spoken-introduction button, a voice selector for available English device voices, a stop state and a live status message. Playback is user-triggered only. The floating robot launcher remains absent; WhatsApp is the sole floating contact action.
9. **Bot visual consistency** — retained the head crop matched to the standing DVNM Bot artwork and removed shadow/filter treatment from the character image and related containers.
10. **Demo language** — removed prominent `DVNM Sample Demonstration` notice banners and improved the public-facing titles. Small factual disclosures remain for illustrative catalogue data, enquiry previews and learning progress.
11. **PWA** — refreshed the service-worker cache name and added the V58 CSS, interaction script and star field to the core cache list.
12. **Release workflow** — added an ASCII-only Windows PowerShell 5.1 publisher that reuses the existing clone, checks remote main, creates a local backup branch, excludes local publisher/preview helpers and private files, and requires an explicit `PUSH` approval before writing to GitHub.

## New assets

- 12 demo-story photographic-style images.
- 6 additional service images.
- 12 service-gallery images.
- A vector starfield asset.
- V58 CSS and JavaScript interaction modules.

## Content and integrity notes

- The existing five demo routes, documentation library, products, legal pages, PWA entry points, QR flyers and product status descriptions are retained.
- Photo-style artwork is original generated illustration; it is not represented as a real client photograph or a screenshot of a shipped product.
- Catalogue pricing, demonstration forms and course progress remain illustrative where no production transaction or data backend exists.
- The new voice control depends on browser/device speech synthesis and is not guaranteed to sound identical on every device.
- No GitHub push or production deployment is performed by this release package.


## QA report

See `V58-QA-REPORT.json` for static audit counts and explicit browser/device/deployment limitations.

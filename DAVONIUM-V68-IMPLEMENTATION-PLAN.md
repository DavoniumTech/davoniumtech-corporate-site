# V68 Implementation Map and Review Checklist

## Implemented in the current review candidate

- [x] Audited the owner-supplied ZIP before editing; retained the original source archive separately.
- [x] Established new shared corporate tokens and presentation rules.
- [x] Re-composed the corporate homepage hero and product-stage area.
- [x] Refined the homepage's eight demo cards and added an accessible Demo Studio category filter.
- [x] Added separate demo art direction for all eight demo destinations.
- [x] Replaced the old generic workspace renderer on all five owner-preview routes with product-specific workspace modules.
- [x] Preserved existing route destinations, product links, QR and certificate assets, DVNM Bot source assets, PWA structure, theme bootstrap and static hosting configuration.
- [x] Rotated the service-worker cache and precached the new active assets.
- [x] Corrected nested documentation stylesheet paths and cleaned invalid excess closing tags found in the supplied HTML.
- [x] Completed local-reference, anchor, parser, syntax, metadata and route smoke checks.

## Required before public release

- [ ] Open the homepage at 360px, 390px, 768px, 1024px, 1440px and 1920px widths; inspect both light and dark themes.
- [ ] Inspect all eight demo routes at mobile and desktop widths; check each one has the intended distinct visual identity and no overflow.
- [ ] Exercise all five workspace flows: navigation, search, sort, add/edit/remove/reset, collapse and notification feedback.
- [ ] Verify all legacy actions: mobile menu, theme toggle, forms, pricing/project builder, product links, QR routes, certificates, DVNM Bot speech/launcher, install flow and offline fallback.
- [ ] Test with keyboard only; check focus visibility, heading order, labels, status announcements, zoom and reduced motion.
- [ ] Run Lighthouse/PageSpeed and, where available, verify Core Web Vitals on real hardware/network conditions.
- [ ] Inspect the final diff against the exact current GitHub base before publishing.
- [ ] Obtain explicit owner approval for GitHub publishing and any production deployment.

## Risk notes

- The supplied ZIP has no `.git` metadata and already contains earlier V68 files; its reconstructed Git tree was verified to exactly match GitHub `main` and `v68-multicolor-ui` commit `c2312478f1b155dc6184c4c3b63412b22841a846` (tree `b788015d11394e4e27c96059c82f4aaaa21b9b69`).
- Browser-based visual validation is not available in this current build environment, so the visual review checklist remains open.
- The homepage, demo and workspace additions are CSS/vanilla JS layers on the existing architecture; final cascade and interaction behavior must be verified in a real browser.
- Sample workspace data is in-memory only. Do not represent it as saved production data.

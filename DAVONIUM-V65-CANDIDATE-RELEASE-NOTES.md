# Davonium Technologies — V65 Candidate Release Notes

Date: 2026-11-03

## Scope

This candidate is based on the user-uploaded `davoniumtech-corporate-site-v64(1).zip`. It is a focused refinement, not a complete corporate-site redesign.

## Changes

### Five standalone demo experiences
- Replaced the corporate header inside DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills and DVNM Digital with a compact, demo-specific navigation bar.
- Added a persistent `Exit demo` action in each demo header and a return-to-Demo-Studio link in each demo footer.
- Added a responsive collapsible navigation menu with keyboard Escape handling and close-on-navigation/outside-click behaviour.
- Removed the repeated corporate footer from the five demo pages.
- Added isolated demo styling with separate identities: pure-white business, warm orange/ivory commerce, dark violet creative, emerald/mint learning and indigo/electric-blue technology.
- Added a local interactive DVNM Skills knowledge-check quiz with immediate explanatory feedback.
- Added DVNM Market catalogue search, category filtering, price sorting, removable bag line items and a clear-bag action.
- Corrected the shop's initial bag total to `$0` so it matches the illustrative USD catalogue prices.
- Kept the new theme rules under demo-page classes so they do not intentionally restyle the corporate homepage.
- Removed the duplicate in-hero Back to Demo Studio link to avoid competing exit controls.

### Content and company identity
- Updated the homepage headline casing to `Digital Products, Engineered For Impact.`
- Expanded the DAVONIUM name explanation in the visible About identity section.
- Confirmed the existing corporate footer already contains icon-only SVG links for WhatsApp, Instagram, Facebook and Google Maps with accessible labels.
- Corrected the WhatsApp number shown on the Contact page and in the generated contact link label to match the user's supplied WhatsApp destination (`+234 707 260 4426`). The previous displayed text (`+234 803 207 6924`) did not match its actual `wa.me` destination.
- Confirmed the existing homepage QR image already includes the Davonium D logo at its centre. The QR asset was left unchanged.

### Content Security Policy
- Moved the inline theme-preference bootstrap across the HTML site into the same-origin external file `assets/js/theme-init.js` (including the homepage, demo pages, About, legal and documentation pages).
- This avoids the specific inline-script execution violation shown in the supplied screenshot without adding `unsafe-inline` to `script-src`.
- The existing CSP header was not weakened.

### PWA
- Rotated the service-worker cache name to V65 and added the new theme, demo JavaScript and standalone demo stylesheet to the core cache list. Updated the `site.js` asset version after the contact-label correction.

## Important limitations / verification status

- This ZIP is derived from the uploaded V64 archive. The handoff reports a later V65 GitHub commit, but the live remote branch could not be authoritatively compared from this workspace. Do not publish this archive over `origin/main` until a local Git fetch and comparison confirms it is not a downgrade.
- Static source checks can verify the externalisation and markup. A real browser run against the deployed response headers is still required to confirm the live CSP console is clear.
- Visual layout, responsive screenshots, DVNM Bot mouth timing, and all interactions should still be checked in a browser at desktop, tablet and mobile sizes.
- The sample contact form remains a front-end demonstration unless a real, authorised server-side form integration is configured.
- SEO ranking is not guaranteed by this release.


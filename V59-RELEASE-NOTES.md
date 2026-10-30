# Davonium Technologies V59 — Final Signal Finish

Date: 30 October 2026
Base: V58 Signal Experience

## Design and experience
- Dark mode is the universal first-visit default on desktop, tablet and mobile. A visitor's explicit light/dark choice is remembered on that device.
- Homepage headline is stable and permanently readable: “Digital products, engineered for impact.” The laptop hero composition is centred and balanced.
- Manrope editorial typography is applied to normal headings and content while existing button styling is preserved.
- The site-wide starfield is brighter and denser, with clearly recognisable sparkle stars as well as small points. The six homepage service galleries each contain three distinct, non-repeated images (18 service images total).
- Section wrappers are transparent; individual content cards retain their own glass surfaces and spacing.
- Ready2Go Learning, Marvel Chat and Davonium Nexus cards no longer display illustrative photographs. Their product icons and truthful statuses remain.
- A complete company footer is standardised across corporate pages, all documentation pages, the Demo Studio, every demo, legal pages and the certificate page. Support email, telephone and WhatsApp links are clickable.
- WhatsApp sits at the lower-right corner. A circular DVNM Bot head control sits directly above it and uses the same head crop taken from the standing robot artwork.
- DVNM Bot opens an accessible guide card. Visitors can read the introduction, navigate to key areas, select an available English device voice, and explicitly start/stop speech. There is no automatic voice playback or first-visit popup.
- Both legacy title-splitting routines and the first-visit prelude are disabled on the homepage. The complete headline renders immediately and remains stable.
- The certificate page and high-resolution certificate artwork have been re-art-directed. The certificate remains clearly labelled as a non-official showcase record, not an accredited qualification.
- Certificate flyer cards are valid independent download cards with previews and separate PDF/JPG actions.

## Existing features retained
- Existing 73 HTML routes and five core demo destinations.
- Existing products, product statuses, documentation catalogue, QR codes, A4 demo flyers, PWA/offline and certificate actions.
- Existing header mark and company identity.

## Validation note
Static source checks are recorded in V59-QA-REPORT.json. Browser/device visual checks and Lighthouse are not claimed unless performed in the user's environment.

## Publishing
Use PUBLISH-V59.ps1 with the existing clean DavoniumTech/davoniumtech-corporate-site clone. The script creates a local backup, checks the origin, excludes private/local files, prepares one commit, rechecks origin/main and requires the exact word PUSH before uploading. It does not deploy the live hosting service.

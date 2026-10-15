# Changelog

## System appearance and Ready2Go branding — 2026-10-15
- The website follows the visitor’s operating-system light/dark preference on first use and updates when that preference changes.
- Only a deliberate theme choice is saved; legacy values written automatically by the previous version are ignored. Visitors can cycle back to system appearance with the theme control.
- Replaced the provisional Ready2Go card mark with the actual R2G app icon sourced from the Ready2Go Learning project.
- Added the Ready2Go icon to its documentation listing and product guide, and advanced the service-worker cache version.


## Final website refresh — 2026-10-15
- Reworked home-page messaging around students, everyday users, and small businesses.
- Updated Marvel Chat to “Built · active development,” reflecting an initial product build while remaining transparent about ongoing development.
- Removed the unwanted Gmail address and the extra tagline strip above the header.
- Restored the exact existing D logo and icon files from the original website ZIP.
- Added the 1200 x 630 Open Graph image and Twitter large-image cards.
- Corrected internal routing so it can be deployed at a custom domain root or the existing GitHub Pages project path.
- Rebuilt service-worker routing to cache existing local pages and documentation for offline reopening.
- Kept policy pages marked as drafts and removed blanket first-visit install modals.

## 2026-10-15 — Product family and install experience

- Added distinct, lightweight product marks for Ready2Go Learning, Marvel Chat, and Davonium Nexus.
- Refined the homepage product cards and added a visible company-site install guide panel.
- Set Davonium Nexus to “In development” consistently with the current product status.
- Added a first-visit, dismissible PWA invitation on the homepage and improved keyboard handling.
- Added `llms.txt`, product-list structured data, and a cache-version update for new assets.
- Updated the company README and Windows CMD deployment guide to target `DavoniumTech/davoniumtech-corporate-site`.

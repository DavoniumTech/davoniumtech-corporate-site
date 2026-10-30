# Davonium Technologies — V56 Release Notes

**Prepared:** 30 October 2026  
**Foundation:** Davonium V55 HeroMatch archive  
**Release direction:** Signal Architecture

## Implemented in this package

- Added `assets/css/davonium-v56-system.css` and linked it after the prior visual system on the HTML routes.
- Refined the site palette into graphite/cyan dark mode and porcelain/cyan light mode.
- Reworked the homepage hero around the existing approved transparent DVNM Bot cutout and a Davonium-specific portal composition.
- Added `assets/js/davonium-v56-hero-scene.js`, an optional Three.js architectural portal scene. It is skipped for reduced motion, Save-Data, mobile/low-power contexts, and unavailable WebGL; it pauses when off-screen or when the document is hidden.
- Removed the old persistent full-screen V53 scroll scene and developer 3D controls from the homepage to keep the first impression focused and lighter. The original files remain available for other routes/rollback.
- Replaced five generic demo preview windows with the existing original DVNM demo artwork.
- Expanded homepage service discovery to match capabilities already described on `/services`.
- Added the four-stage delivery process to the homepage.
- Refined Work page copy so it describes the procedural robot renderer more precisely.
- Refreshed service-worker cache identity and added V56 core assets.
- Added local preview and guarded Windows PowerShell deployment scripts.
- Included the generated concept image as an art-direction reference, not as the built site.

## Preserved

- The original Davonium D brand icon and product icons.
- Existing direct routes and compatibility routes.
- Five core demos and their actual HTML pages.
- Existing product status wording and links.
- Documentation guide library, PWA/install and offline behaviour, QR asset, certificates, contact paths, WhatsApp and legal pages.
- Existing site content except the specific homepage/Work copy and layout refinements described above.

## Not claimed

- No full-body GLB character model was created.
- No server-side enquiry backend was added; the existing contact implementation is preserved and should be checked against the actual receiving service before being represented as live submission.
- No browser matrix, physical-device testing, Lighthouse run, production deployment or Git push is claimed.
- The Three.js CDN and browser WebGL availability remain external conditions; the hero has an approved static artwork/CSS fallback.

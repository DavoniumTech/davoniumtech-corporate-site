# Davonium Technologies — V70 Corporate Homepage Redesign

**Target branch:** main  
**Design reference:** Owner-supplied Davonium Technologies campaign image  
**Scope:** Public homepage visual redesign and PWA stylesheet cache update

## Visual direction

- Deep navy hero background with restrained circuit-grid texture.
- Bright cyan emphasis, clear large-format typography and simple calls to action.
- Silver ribbon paths to create movement without adding heavy 3D or framework dependencies.
- Existing DVNM Bot cutout as the main brand character.
- CSS-built mobile website preview and the existing real Davonium website QR asset.
- Dedicated Business Launch Kit call-to-action linking to the existing service page.

## Preserved

- Existing navigation routes and public pages.
- Demo Studio and all eight demo destinations.
- Products and their current truthful development-status descriptions.
- Business Launch Kit content and project-builder path.
- Existing service descriptions and image gallery.
- Website QR asset, DVNM Bot audio controls, PWA manifest, and other site features.
- Existing Supabase enquiry integration and database configuration; this release does not change credentials or database policies.
- Existing admin code remains untouched by this homepage visual release.

## Files changed

- index.html — updated release metadata, SEO title/description, homepage hero composition, and stylesheet link.
- assets/css/davonium-v70-home.css — responsive homepage art direction.
- sw.js — V70 cache namespace and homepage stylesheet precache.
- README.md — release overview.

## Validation

- Verify all hero asset paths exist in the repository.
- Verify the homepage stylesheet is linked after previous homepage styles.
- Verify sw.js includes the new stylesheet and uses a new cache namespace.
- Verify the homepage's original Demo Studio and section IDs remain present.
- Verify the release is pushed directly to main.

## Deployment gate

GitHub main is the production source for the connected static Cloudflare Pages site. GitHub source verification does not itself prove Cloudflare deployment or real-device rendering. After the Pages deployment completes, check the live homepage on desktop and mobile, test navigation/menu, Business Launch Kit links, Demo Studio cards, DVNM Bot controls and PWA install/offline behaviour.

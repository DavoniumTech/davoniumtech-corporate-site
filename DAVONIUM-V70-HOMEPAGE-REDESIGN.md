# Davonium Technologies — V70 Full Corporate Website Transformation

**Production branch:** `main`  
**Production source:** `DavoniumTech/davoniumtech-corporate-site`  
**Visual reference:** Owner-supplied Davonium Technologies campaign artwork  
**Scope:** Full public corporate website design-system alignment and brand/content corrections.

## Delivered in V70

### Visual system
- Reworked the homepage hero around the approved navy, silver and cyan art direction.
- Introduced a consistent corporate site shell across the existing core page family.
- Unified page hero treatments, typography hierarchy, navigation, buttons, section surfaces, cards, forms and footer styling.
- Added responsive handling for phone, tablet and desktop layouts, plus reduced-motion handling.
- Applied the shared design system to page families that already load the common corporate stylesheet, including demos, workspaces, documentation and legal routes.

### Public corporate pages
- Home: new hero scene, DVNM Bot, mobile website preview, QR visual and Business Launch Kit CTA.
- About: explicit Digital Solutions and Commercial Software Products divisions.
- Services: client-service positioning and the corrected eight-demo reference.
- Products: Ready2Go Learning, Marvel Chat and DVNM TradeFlow, with honest development labels.
- Work: honest development portfolio; no invented clients or results.
- Pricing: quote-led package scope retained; unapproved price figures are not published.
- Business Launch Kit: connected to the shared visual shell and main navigation.
- Contact and Project Builder: existing enquiry fields and backend integration preserved.
- Support and Install: brought into the same corporate visual system.

### Product architecture and content integrity
- DVNM TradeFlow is presented as a separate Davonium-owned wholesale/distribution software initiative.
- Davonium Nexus is clearly labelled as an internal company operating system/command centre, not a public customer SaaS.
- Ready2Go Learning and Marvel Chat retain their existing development-status disclosures.
- The website does not claim unverified customers, case-study outcomes, ratings, or performance figures.

### Preserved
- Existing routes and page content.
- Eight independent Demo Studio experiences.
- Five workspace previews and their sample-data boundaries.
- Documentation and legal content.
- Supabase enquiry submission integration.
- DVNM Bot artwork and interaction controls.
- QR artwork, manifest, service worker, offline route and install flow.

## Files and implementation notes

- `index.html`: homepage hero and product-family copy.
- `assets/css/davonium-v70-home.css`: homepage-specific art direction.
- `assets/css/davonium-v68-premium-system.css`: shared V70 site-wide design system appended for existing page families.
- `sw.js`: V70 cache namespace and homepage stylesheet precache.
- Corporate content pages: About, Services, Products, Work, Pricing, Business Launch Kit, Contact, Support, Project Builder and Install.
- Main navigation: Business Launch Kit link added to the corporate and main entry-page navigation.

## Verification boundary

GitHub main-branch source was checked for the V70 stylesheet, required home assets, preserved homepage sections, page-family navigation additions and company product-boundary copy. This is source verification, not a visual browser test. Cloudflare deployment identity, real-device rendering, the working contact form, enquiry persistence and the separate admin login still require live checks before being declared passed.

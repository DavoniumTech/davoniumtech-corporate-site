# Davonium Technologies V67 — Commercial launch foundation

Build date: 2026-11-19
Input: Latest user-supplied Davonium Technologies V66 source ZIP.
Scope: Commercial experience foundation, interactive workspace previews, guided project brief, and lightweight visual refinement.

## Implemented

- Added `/pricing.html` with five structured service packages, scope descriptions, exclusions, demo links, FAQs and an NGN/USD quotation-preference selector. Numeric prices remain unpublished because they have not been approved.
- Added a central pricing configuration at `assets/data/dvnm-v67-pricing.js`. All NGN/USD numeric amounts are `null` pending approval; no exchange-rate conversion or invented public pricing is used.
- Added `/project-builder.html`, a client-side guided project brief that recommends a starting package and matching public demo/workspace. It only prepares an email or WhatsApp draft after explicit visitor action.
- Added five interactive sample workspace previews under `/workspaces/`: Biz, Market, Creative, Skills and Digital, sharing one reusable dashboard framework and central sample data configuration. Changes are page-session-only; no backend, authentication, real payment processing or production CMS is implied.
- Added a workspace directory and connected the workspace previews from the existing Demo Studio.
- Added a shared responsive demo-preview route with Desktop, Tablet and Mobile viewport controls for all five existing public demos; each demo and its Demo Studio workspace card links to the relevant preview.
- Added Pricing navigation links and homepage/service entry points.
- Added contact-form prefill support for package/project-builder links while preserving the existing honest email-client submission workflow.
- Reduced the two V67 SVG starfields to 112 and 128 subtle dots respectively, with all star diameters capped below 2 CSS pixels. The original V66 starfields are retained as `v58-starfield-v66.svg` and `v59-starfield-v66.svg`.
- Disabled the redundant V61 animated canvas starfield from V67 runtime bundles. The static SVG texture now provides the backdrop without generating hundreds of glowing particles per page.
- Created content-hashed V67 CSS and runtime bundles; retained V66 bundles for rollback.
- Rotated the PWA cache to V67 and added the new commercial pages, styles, configuration and scripts to the core cache.
- Added pricing, builder, workspace and responsive demo-preview URLs to the sitemap.

## Preserved

- Existing V66 pages, product pages, demos, documentation, bot assets, icons, photography, existing CSS/JS source assets and deployment configuration.
- Existing V66 CSS/runtime bundles are retained as rollback assets.
- No production deployment, Git push, database, authentication, payment integration or backend service was introduced.

## Responsive preview security

The global frame-blocking policy remains active across the site. Only the five public demo documents embedded by the responsive preview receive same-origin framing permission; this is configured with Cloudflare Pages `_headers` header-detachment rules. The preview does not allow third-party framing.

## Important limitations / pending approval

- Final package amounts, USD amounts, delivery timelines, revisions and support commitments need owner approval before numeric rates are published. The pricing configuration deliberately leaves rates unset.
- The new workspaces are front-end-only demonstrations with sample data, not production CMS products.
- The existing contact workflow still prepares an email in the visitor's configured email application; this build does not add a server-side enquiry endpoint.
- Live PageSpeed/Lighthouse/Core Web Vitals scores were not available from this local source-only build. Run tests after deployment.
- Visual/browser QA should be completed on real mobile devices and desktop browsers before production deployment.

## Local validation performed

- Source HTML and JS structural checks.
- New pages and assets verified to exist.
- Internal relative target and sitemap checks.
- JavaScript syntax checks where Node.js is available.
- CSS and asset size comparisons for the starfield assets.

## Deployment

Do not deploy automatically. Back up the current production commit/files first, then test the V67 ZIP locally. Deploy to the existing Cloudflare Pages project only after the owner approves the package structure and any production changes.

## Rollback

Restore the original V66 ZIP/commit and its matching `sw.js`. V66 content-hashed CSS/runtime files remain included in this archive.

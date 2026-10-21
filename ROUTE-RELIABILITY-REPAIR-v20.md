# Davonium Technologies route and section reliability repair — v20

## What was found

- The public repository contains the demo file `demos/business.html`, but earlier site links and DVNM Bot answers also use clean URLs such as `about`, `products`, and `docs/guides/seo-discovery` while the site is made of static `.html` files.
- Static asset hosting does not automatically guarantee that every extensionless URL maps to an adjacent `.html` file. Internal links, canonical URLs, and sitemap locations are now aligned to actual static paths.
- Previous service-worker navigation handling could return `Response.error()` if a request failed and no offline cache was available. Browsers can display that as a generic `ERR_FAILED`. It now returns a clear offline fallback instead and supports an extensionless-to-`.html` navigation fallback.
- `sw.js` has a new cache name, and its response headers ask browsers to revalidate the worker script. The DVNM Bot CSS URL is versioned to v20.

## Files preserved

This release is based on the prior website. It preserves company pages, all seven sample demonstrations, the DVNM Bot welcome and voice controls, QR images, certificate PDF, documentation, and existing branding. It does not change product business logic or add a backend.

## Checks performed locally

- Every HTML local link/asset reference is audited against the included file tree.
- Canonical links and sitemap locations are checked against actual published HTML files.
- DVNM Bot CSS is checked to ensure it begins as CSS and includes the welcome overlay selector.
- The service worker is checked for syntax and for removal of `Response.error()`.
- Desktop and narrow-screen browser checks are run against a local static server.

## Deployment caveat

GitHub accepts source code; it does not itself prove the Cloudflare Worker has deployed the same files. After the push, confirm a new deployment in Cloudflare Dashboard → Workers & Pages → the service for `davoniumtech-corporate-site` → Deployments. If the new deployment did not run, redeploy from the correct repository and branch (`main`) with the repository root as the static assets directory. Do not change the existing project or domain configuration blindly.

## Live verification

The current browser report is a Chrome `ERR_FAILED` for `/demos/business.html`. This release removes the service worker's generic `Response.error()` fallback and improves the route compatibility surface, but the final live URL still has to be rechecked after Cloudflare publishes the commit. The source file existing in GitHub alone cannot establish that the live asset deployment is current.

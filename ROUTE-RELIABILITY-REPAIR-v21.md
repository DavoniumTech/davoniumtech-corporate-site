# Davonium Technologies route, robot and responsive reliability repair — v21

## Root cause corrected
The prior `_redirects` file mapped clean HTML routes such as `/demos/business` to `/demos/business.html`, while Cloudflare HTML handling with `auto-trailing-slash` redirects `.html` page URLs back to their extensionless canonical route. This opposing configuration created the observed `ERR_TOO_MANY_REDIRECTS`. The v21 `_redirects` file intentionally contains no active path rules; Cloudflare's built-in HTML handling is the single routing policy.

## Improvements
- Updated page links, canonical URLs, sitemap entries, and structured URL references to the extensionless canonical routes where their files exist.
- Added a versioned full-body 3D DVNM Bot illustration with glowing chest branding and legs to the homepage, welcome dialog, and compact website assistant.
- Added subtle whole-robot speaking movement and a speaking mode that hides written answer content while the robot speaks; Cancel Speech remains visible.
- Reduced voice selection to one logical option named DVNM Voice. The browser selects one compatible installed English voice and falls back to the device default. Different devices may render different physical voices.
- Expanded worldwide audience positioning for the sample demonstrations and broadened footer copy to cover software, apps, digital products, websites, tools and technology services.
- Added a route reliability guide, a restrained theme transition, improved footer wrapping, and service-worker cache version v21.

## Acceptance caveats
Local structural checks validate source routes, assets, anchors, canonical URLs, sitemap, JavaScript syntax and zip integrity. They do not guarantee that every physical device or host deployment behaves identically. After pushing, confirm Cloudflare deployment and test the published URLs and speech on real devices.

# V47 Typography & Proposal Addendum

Date: 28 October 2026

- Added a consistent Inter-based sans-serif layer inspired by the clean agency typography on https://astechltd.netlify.app/.
- The reference's CSS font family was not exposed in the accessible text extraction; Inter is a visual match, not a claimed exact source-font identification.
- Loaded Inter explicitly with system fallbacks so browser rendering is consistent where the font CDN is available.
- Applied the family across main pages, demo pages, documentation, the assistant, forms, and certificate UI; code/serial fields keep a monospace stack.
- Rotated the PWA cache name to refresh cached resources and precached the new typography layer.
- Updated the restrictive security header only for the Google Fonts CSS/font hosts required by the Inter web-font link; the local system font stack remains the fallback.
- Added `LOCAL-DELIVERABLES/` to `.assetsignore` as well as `.gitignore` and the publisher copy exclusions, so the proposal is not deployed as a public static asset.
- Added a reusable Davonium Digital Presence & Operations proposal, using high-level offer architecture ideas from Hestek Solutions while avoiding its unverified metrics/testimonials/prices.
- Proposal files live in LOCAL-DELIVERABLES and are excluded from the public website deployment.

Checks performed: ZIP source extraction; font CSS presence; HTML stylesheet injection counts; JSON/XML/JavaScript checks are still required before deployment. Native PowerShell execution and real-device visual checks were not available in this environment.

- Updated the Windows publisher release label and made post-push read-back errors visible; a successful push followed by failed read-back advises checking GitHub and not blindly retrying. Native PowerShell execution was unavailable here, so this script still requires a Windows dry run before use.

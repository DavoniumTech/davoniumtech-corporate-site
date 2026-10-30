# Davonium Technologies V61 - Signal Constellation

V61 is a refinement release based on V60. It preserves the existing website routes, content, brand mark, standing DVNM Bot, products, five demo experiences, docs, footer, QR assets, certificates and PWA structure.

## Changes
- Continuous, denser animated canvas starfield on every updated HTML route, with visible twinkle, brighter glints and slow drift.
- Transparent section backgrounds and individually surfaced glass cards in dark and light themes.
- New desktop/laptop hero composition with left-aligned full headline and the existing Bot/D monument on the right; responsive tablet and phone stacking.
- Refined display typography, spacing, status motion, header scale and a more translucent theme-aware sticky header.
- Light mode is a separate porcelain environment; dark remains first-visit default and theme preference remains selectable.
- Added a clear Back to Demo Studio arrow on each of the five core demo pages.
- DVNM Bot volume slider and topic-specific spoken introductions for Company, Services, Products, Demo Studio, Work, and Documentation/Support.
- Speech boundary mouth pulses and active-speech chest illumination; includes a low-motion fallback for device voices that do not emit word boundary events.
- Short internal page transition; respects reduced-motion settings.
- Updated service-worker cache name and precache references.
- Added Windows PowerShell 5.1 publisher with checksum-friendly workflow, repository safety checks, backup branch, private-file exclusions, explicit PUSH approval and remote SHA verification.

## Verification status
Static route/reference checks, CSS parsing, JavaScript syntax checks, local HTTP smoke tests and ZIP CRC verification are recorded in V61-QA-REPORT.json. A headless browser screenshot run and physical-device tests could not be completed in the packaging environment; do not treat those as passed.

## Deployment
GitHub publication and production hosting deployment are separate actions. The publisher will not force-push and will not deploy to Cloudflare or any other hosting provider.

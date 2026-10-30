# Davonium Technologies — V61 Signal Constellation

V61 is the final refinement of the existing Davonium multi-page website. It preserves the current public routes, official logo, approved standing DVNM Bot, five demo experiences, product status copy, documentation, footer, PWA, QR assets, certificate and printable flyers.

## What changed in V61

- A continuous, denser animated starfield spans all pages and remains visible through transparent section wrappers, cards and a more translucent navigation header.
- The homepage uses a balanced desktop split composition: the full headline and company statement on the left, the existing DVNM Bot and Davonium D architecture on the right, with a larger orbital scene to use the available laptop width.
- Dark mode is the first-visit default. The separate porcelain light theme remains available and is remembered after a visitor changes it.
- Calligraphic display headings use Cormorant Garamond; body copy uses Manrope for legibility. Existing button styling is retained.
- Cards have independent translucent surfaces; the five demo experiences keep their own identity, page structure and routes, with a clear return-to-Studio link.
- DVNM Bot includes a topic-based spoken company guide, visible volume control, boundary-driven mouth animation and chest illumination while speaking. Audio only starts after a visitor action.
- Internal page transitions are short and respect reduced-motion preferences.
- The service-worker cache is versioned to V61.

## Preview locally

Extract the ZIP and run this from the extracted `davonium_v61` folder in Windows PowerShell 5.1:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREVIEW-V61.ps1
```

The script opens a local static preview. It does not publish or deploy anything.

## Publish to GitHub

Use `PUBLISH-V61.ps1` with the existing clean clone of `DavoniumTech/davoniumtech-corporate-site`. The publisher fetches `origin/main`, creates a local backup branch, copies the website while excluding local publishing helpers and private files, prepares one commit, checks that the remote parent has not moved, and requires the exact word `PUSH` before uploading. It never force-pushes and never deploys the production website.

## Verification status

See `V61-QA-REPORT.json`. Static route/reference checks, CSS parsing, JavaScript syntax checks, local HTTP smoke tests and ZIP CRC verification are recorded there. Real browser screenshots, physical-device checks and Lighthouse/Web Vitals were not completed in the packaging environment; they are not claimed as passed.

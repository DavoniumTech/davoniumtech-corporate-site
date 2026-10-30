# Davonium Technologies — V62 Glass Constellation

V62 is a transparent-section and studio-layout refinement of the existing Davonium multi-page website. It preserves the current routes, official brand mark, standing DVNM Bot, five independent demos, product statuses, documentation, footer, QR assets, certificates, flyers and PWA.

## V62 highlights

- The QR/share section's clear outer canvas is now the standard throughout the website: section wrappers are transparent and the same starfield remains visible behind About, Services, Products, Work, Contact, Documentation, the certificate and all five demo experiences.
- Individual useful cards retain a translucent glass finish. Large section slabs, quote bands and CTA bands no longer hide the background.
- The star canvas is denser and brighter, with more visible twinkle, drift and sparkle glints. It pauses when the document is hidden and respects reduced-motion preferences.
- The laptop hero uses a wide two-column studio composition, with larger headline copy on the left and the full standing DVNM Bot/architectural stage on the right. Tablet and mobile layouts stack responsively.
- Dark is the first-visit default; visitors can explicitly switch to the separate light theme.
- The existing DVNM Bot gains a header audio shortcut, current-page explanation, working topic-to-section links, and more visible mouth/chest animation while speaking. Audio begins only after a visitor action.
- Existing company navigation and return-to-Studio links remain available on the demo pages.
- The PWA cache has been rotated to V62.

## Local preview

Extract the ZIP, open Windows PowerShell 5.1 in the extracted `davonium_v62` folder, and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREVIEW-V62.ps1
```

Then open `http://localhost:8080/`. The local preview does not publish or deploy the website.

## GitHub publishing

Use `PUBLISH-V62.ps1` with the existing clean clone of `DavoniumTech/davoniumtech-corporate-site`. The publisher fetches `origin/main`, creates a local backup, copies the website while excluding local tools and private files, checks staged additions/modifications (safe helper deletions are allowed), prepares one commit, checks that the remote parent has not moved and requires the exact word `PUSH` before uploading. If a previous V61 attempt left uncommitted changes, the script backs up a patch and any untracked files and asks for `BACKUP-AND-RESET` before resetting the interrupted working tree. It never force-pushes and never deploys production.

## Verification status

See `V62-QA-REPORT.json`. Static route/reference checks, CSS parsing, JavaScript syntax checks, local HTTP smoke tests and ZIP CRC verification are recorded there. Real browser screenshots, physical-device tests and Lighthouse/Web Vitals are not claimed as passed.


## V62 visual system

V62 applies the QR/share section transparency model throughout the site: section canvases stay clear, genuine content cards receive individual glass surfaces, and the shared animated starfield remains visible behind the page. The homepage uses a balanced wide desktop hero with the approved standing DVNM Bot artwork. The Bot topic controls now read the actual page when the selected company topic matches the current route.

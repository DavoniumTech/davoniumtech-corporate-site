# Davonium Technologies - V59 Final Signal Finish

V59 is the final polish pass over the existing Davonium multi-page website. It preserves the existing public routes, products, documentation, Demo Studio experiences, PWA support, flyers and certificate workflows while applying a consistent dark-first identity and a complete company footer across every HTML page.

## Main changes

- Dark mode is the first-visit default on all devices. A visitor's explicit theme choice is saved locally and respected on later visits.
- The homepage displays the complete, stable headline: **Digital products, engineered for impact.** The older letter-by-letter headline split and blocking first-visit prelude are disabled on the homepage.
- Manrope is used for headings and normal reading copy. Existing button styles are retained.
- The starfield is denser and includes recognizable sparkle stars. Page sections remain transparent so the sky continues behind individual glass cards.
- Ready2Go Learning, Marvel Chat and Davonium Nexus retain their approved product icons, copy and development statuses, without illustrative product photographs.
- A complete company footer is present on all 73 HTML routes. Support email, telephone and WhatsApp details are clickable.
- A circular DVNM Bot head control uses the head crop from the approved standing robot artwork. Its guide card has quick links and a user-activated speech control; it does not autoplay or open automatically. WhatsApp remains at the lower-right corner.
- The certificate preview and high-resolution share image are refined, and the five flyer cards have independent PDF/JPG download links.

## Preview locally

1. Extract the archive.
2. Open Windows PowerShell in the extracted `davonium_v59` folder.
3. Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\PREVIEW-V59.ps1
```

4. Open the local address printed by the preview server. Press `Ctrl+C` to stop it.

Node.js is required for this local preview server; no npm dependencies need to be installed.

## Publish to GitHub

Use `PUBLISH-V59.ps1` with the existing clean clone of `DavoniumTech/davoniumtech-corporate-site`. The script verifies the repository and remote `main`, creates a local backup branch, copies the release, excludes publishing helpers and private files, prepares a commit, and asks for the exact word `PUSH` before uploading. It never force-pushes and does not deploy the production website.

A copy-paste Windows PowerShell command is included in this conversation's release handover and in `PUBLISH-V59-ONE-COMMAND.txt`.

## Verification and limitations

See `V59-QA-REPORT.json`. Static source and archive checks passed. Real browser visual checks, physical Android/iPhone checks, Web Vitals/Lighthouse and production deployment were not completed in this environment. Speech synthesis also depends on voices exposed by each visitor's browser/device.

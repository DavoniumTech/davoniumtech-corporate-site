# Davonium Technologies — V46 website release

This is a static website release for `DavoniumTech/davoniumtech-corporate-site`, intended for `www.davoniumtech.com`.

## What changed in V46

- Homepage, first-visit welcome, and Our Work share the same articulated, angular white-and-cyan DVNM Bot model rendered in real time by Three.js. The balloon-shaped head approach has been replaced by a hard-surface helmet, visor, separate illuminated eyes, jaw, side armour, chest core, articulated arms and legs.
- The two old concept pictures were removed from the Our Work page and the release source. The welcome, homepage and Work page use the same live 3D character, with a vector fallback if WebGL or the Three.js CDN is unavailable.
- The floating control is a compact head-only DVNM Bot launcher above WhatsApp. The assistant panel has one speech toggle; while speaking, it changes to “Stop speaking” instead of creating a second stop button.
- The first visit has a skippable, session-scoped greeting and a letter-by-letter title. Audio never starts automatically; the visitor must activate speech.
- Light and dark themes keep the same content but use distinct surfaces, motion directions, and character lighting. Dark mode uses crisp solid surfaces rather than a blurred/foggy overlay.
- The welcome panel and floating assistant have bounded scrolling and small-screen layouts. The documentation hub and existing guide pages are retained with their stylesheet and navigation references.
- The showcase certificate remains editable and supports download, print/Save as PDF, and native share where the browser supports it. It is clearly labelled as a non-official demo showcase, not a qualification or claim of client work.
- The service-worker cache now includes the local 3D loader and CSS so the local renderer assets can be cached after a successful install. Three.js itself is still fetched from jsDelivr and falls back to vector art if unavailable.

## Main files

- `index.html`: company homepage and shared 3D DVNM Bot host
- `work.html`: Our Work page with the shared robot scene instead of the two concept pictures
- `assets/js/site.js`: navigation, themes, accessible visitor guide, opt-in browser speech, and PWA behavior
- `assets/js/dvnm-robot-3d.js`: lightweight, procedurally modelled Three.js character and animation loop
- `assets/css/dvnm-robot-3d.css`: canvas and fallback styling
- `assets/css/dvnm-final-v45.css`: responsive V46 theme, intro, and showcase refinements
- `demos/`: demo experiences and shareable showcase certificate
- `docs/`: public documentation and guide library
- `sw.js`: versioned offline cache
- `directory.md`: local-only project map. It is included in this ZIP for your own reference and excluded from the public commit.
- `DEPLOY-DAVONIUM-V46.ps1`: guarded publisher. It is excluded from public website files.

## Publish on Windows

Save `Davonium-Technologies-V46-Final-Release.zip` in Downloads, open Windows PowerShell, then paste the single command supplied in this conversation. The command extracts to a new timestamped folder and invokes the included `DEPLOY-DAVONIUM-V46.ps1` script.

The publisher verifies the target repository, makes a clean clone of `main`, filters local-only maps and common credential files, checks staged paths and likely secret patterns, shows the staged summary, asks for the exact word `PUSH`, pushes a backup branch, then pushes without force and verifies the remote commit. It does not edit a separate local Git checkout. Git for Windows and authenticated push permission are required.

## Privacy, security, and limitations

`directory.md` is local-only and is never copied into the public website commit. Removing a formerly published file cannot erase old Git history; if private information was ever committed publicly, rotate it and review repository history. Do not put API keys, passwords, service-account keys, or certificates into browser files.

Static verification passed for HTML links/IDs, JavaScript syntax, CSS syntax, SVG XML, JSON, and XML. This environment does not provide Windows PowerShell, so native execution of the publisher could not be tested here; it has been written with Windows PowerShell 5.1-compatible syntax and checked for balanced delimiters and UTF-8 BOM/CRLF encoding. A headless-browser screenshot attempt stalled, and no physical Android/iOS/tablet test or GitHub push is claimed. Review the staged output and test the live site on your own devices after deployment.

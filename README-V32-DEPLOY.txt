DAVONIUM TECHNOLOGIES V32 — COMPLETE WEBSITE PACKAGE

THIS IS THE FULL WEBSITE SOURCE, NOT A CSS PATCH.
It includes the company pages, seven demo pages, documentation, legal pages, images, QR codes, product icons, PWA files, service worker, V32 theme stylesheet, and the supplied full-body DVNM robot layers.

DEPLOY ON WINDOWS 10
1. Download Davonium-Technologies-V32-FULL-WEBSITE-20261022.zip.
2. Right-click it and choose Extract All. Keep the folder name davoniumtech-corporate-site-v32.
3. Open the extracted ZIP folder in File Explorer, click the address bar, type CMD and press Enter. Then run:

   DEPLOY-V32-WINDOWS.cmd

The launcher passes the source folder as "%~dp0." (with a final dot, not a trailing backslash) to avoid Windows PowerShell path-quoting errors. The branch check also strips invisible whitespace/BOM/terminal control characters before checking that the branch is main.

4. The command checks that your existing clone is the expected GitHub repo on main, and stops if it detects uncommitted work. It fetches/pulls with --ff-only, saves a local backup and a remote backup branch, copies the full site without mirror-delete, exports a full website ZIP and SHA-256 file, then asks before committing/pushing to main.
5. Type Y only after reviewing its summary if you want to push. Type N to keep the update local.

EXPECTED EXISTING REPOSITORY:
%USERPROFILE%\Downloads\davoniumtech-corporate-site-deploy
https://github.com/DavoniumTech/davoniumtech-corporate-site.git

VISUAL TESTS AFTER DEPLOYMENT
Check the homepage, all seven /demos/ pages, desktop, 390px, 360px, and 320px widths, light/dark mode, mobile menu, robot launcher, voice list, speech mouth motion, chest glow, WhatsApp button, and PWA cache refresh.

ROBOT / VOICE LIMITS
DVNM Bot is a layered 2D image rig based on the supplied transparent full-body artwork. The separate head layer enables small head turns/nods; speech uses browser-provided voices and word-boundary mouth pulses where available. Arms and legs stay visible in the artwork; this is not a real-time 3D skeletal walk simulation, and perfect phoneme-level lip sync or identical voices cannot be guaranteed across browsers/devices.

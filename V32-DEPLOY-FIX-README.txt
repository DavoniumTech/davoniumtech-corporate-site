DAVONIUM TECHNOLOGIES V32 — COMPLETE WEBSITE / FIXED WINDOWS DEPLOYMENT

This ZIP contains the complete website source, not just a patch. It includes all existing pages, seven demos, documentation, legal pages, media assets, robot art, PWA files, and a corrected Windows deployment launcher.

WINDOWS 10 STEPS
1. Download this ZIP and click Extract All. Keep the extracted folder.
2. Open that extracted folder. Click the File Explorer address bar, type CMD, and press Enter.
3. At the CMD prompt inside that extracted folder run exactly:

   DEPLOY-V32-WINDOWS.cmd

The script targets your existing repository at:
%USERPROFILE%\Downloads\davoniumtech-corporate-site-deploy

Before applying files it checks for the expected repository, main branch, and a clean working tree. It fetches origin/main with fast-forward only, creates a local backup and a remote backup branch, copies all files without mirror-deleting, exports a full-site ZIP and SHA-256 checksum, then asks before commit and push. Type Y only if the script's summary and Git checks are acceptable.

The launcher passes source path as %%~dp0. to avoid Windows cmd quoting issues with a path ending in a backslash. The PowerShell script canonicalizes the source directory and normalizes invisible output characters when checking the branch. No force-push, git reset, or git clean is used.

After successful push, check GitHub main and wait for Cloudflare Pages/Workers deployment. Hard-refresh the live site; test desktop and narrow phones, light/dark themes, robot launcher, speech, demo navigation, and WhatsApp controls.

ROBOT LIMITATION
The supplied artwork is a layered 2D figure. Head nod/turn and face/chest glow are animated, but full independent skeletal walking and guaranteed phoneme-perfect lip sync are not features of a flat 2D image rig.

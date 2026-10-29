# V43 Release Notes — Three.js DVNM Bot and Deployment Fix

## User-visible changes
- Replace the hero bot and on-page robot previews with actual articulated Three.js canvas scenes built from procedural 3D geometry.
- Animate blinking, head attention, arm movements, antenna and chest-core glow, and mouth movement while browser speech is active; visitors can also trigger a brief wave by interacting with the character stage.
- Lazy-load Three.js near visible canvases and tune rendering for low-power/mobile devices; fall back when WebGL or the CDN fails.
- Remove the automatic first-visit welcome overlay so it does not cover the primary page.
- Keep the current identity icon and written content, improve copy consistency to five primary demos, and keep the light/dark themes.
- Give the main hero character a dedicated responsive 3D stage and live status chip.

## Publish safety
- The previous ZIP's CMD runner referenced a missing `Deploy-V42.ps1`; V43 contains matching `DEPLOY-DAVONIUM-V43.cmd` and `Deploy-Davonium-V43.ps1` files.
- Deployment uses a clean clone, a private local source backup, a remote safety branch of the original main, `git diff --cached --check`, ignored-file cleanup, approval text `PUSH`, a normal non-force push, and remote SHA verification.
- `directory.md` is included in the ZIP for local use but excluded from the commit; deployment scripts are also local-only.

## Known constraints
- Three.js is lazy-loaded from jsDelivr; a network-blocked or unsupported WebGL browser uses the included static fallback artwork.
- Voice uses the browser's Speech Synthesis implementation, not a hosted neural voice; lip movement is animated during speech but is not phoneme-accurate lip-sync.
- The local release has not been pushed to GitHub from this environment. The automated Chromium screenshot attempt stalled, so visual browser acceptance is still outstanding. Run the publish script using the account with repository push permission, then verify Pages/Cloudflare deployment and test real phones.

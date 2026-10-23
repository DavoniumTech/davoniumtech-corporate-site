# Davonium Technologies V38 — complete website

## Deploy
1. Download `Davonium-Technologies-V38-FULL-WEBSITE-20261023.zip` into your Downloads folder.
2. In Command Prompt, run the V38 extract-and-deploy one-liner supplied with this release, or extract the ZIP and double-click `DEPLOY-V38-WINDOWS.cmd`.
3. Review all safety checks. Type `Y` only when the script asks to push V38 to the official `main` branch.
4. Wait for `SUCCESS: V38 commit is verified on GitHub main.`
5. Check Cloudflare deployment and refresh the live site with Ctrl+F5.

## V38 improvements
- Welcome overlay is robot-only visually. Tap the robot to hear the full existing intro script; the script and topic text remain in the site source.
- Hand-authored transparent SVG robot with relaxed arms, dark face screen, black pupils, no baked-in background or floor shadow, and animated mouth/chest/head during speech.
- Cleaner indigo/navy theme with high-contrast surfaces and restrained glowing star details.
- Larger mobile calls to action, more legible bot controls, outside-click/tap close behaviour, and responsive panel boundaries.
- Reduced fixed-background repainting and consolidated CSS into one active stylesheet.
- Seven demo palettes and all previous/all/next navigation retained.

## Testing note
Static checks are included in `V38-QA-REPORT.json`. Direct live-domain retrieval and physical-device visual testing were not available during this build, so re-check the deployed site on a narrow phone after Cloudflare publishes it.

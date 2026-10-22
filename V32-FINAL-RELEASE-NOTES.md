# Davonium Technologies V32 — full website release

This package is a complete static website source archive, not a patch. It is based on the uploaded V31 project and keeps the existing website sections, seven demo pages, documentation, legal pages, icons, QR codes, product pages, PWA manifest, service worker, and offline page.

## Main updates
- The floating assistant and homepage preview now use the supplied transparent full-body DVNM art so arms, hands, legs and the `DVNM` chest are visible.
- A separately masked head layer permits small visual turns and nods. The on-screen face reacts to speech word-boundary events where supported and falls back to CSS mouth movement otherwise.
- The chest aura brightens while speech is active; a page click triggers a small attentive response.
- The device voice picker is populated when browser voices are exposed; voice choice persists locally. Audio is still only played after the visitor requests it.
- The old midnight direction is restored in dark mode with thinner borders, clearer translucency and less blur; light mode sections cycle through light white, mint, gray, beige, violet, indigo and rose tints.
- Mobile navigation and floating controls are constrained for very small phones; the robot remains above the WhatsApp button.
- One new guide documents voice, appearance, accessibility, caching and known limits.

## Honest motion limits
This is a lightweight 2D website character, not an independently simulated 3D model. The head is layered separately, while arms and legs remain part of the full-body picture. The body has a walk-like bob during speech but no physically simulated independent walk cycle. Lip movement is speech-timed, not guaranteed phoneme-perfect. Voice quality depends on the visitor's browser and device.

## After deployment
Test 320px, 360px and 390px phones, tablet and desktop. Check the theme toggle, seven demo routes, mobile menu, bot launcher, speech, head response, chest glow, WhatsApp click, and install/offline behaviour. A service-worker cache may need one refresh/reopen before V32 assets appear.


## Deployment script reliability fix

The Windows launcher now passes the source directory as `%~dp0.` to avoid the trailing-backslash/quoted-argument issue. The PowerShell deployment script resolves the source using `Get-Item` and normalizes invisible branch-output characters before validating `main`. It retains the existing no-force-push and backup checks.

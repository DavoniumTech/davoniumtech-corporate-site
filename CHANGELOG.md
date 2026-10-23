# V37 — October 23, 2026

- Consolidated cumulative release CSS into a single versioned V37 stylesheet for fewer render-blocking CSS requests.
- Replaced the previous arm-pose/opaque robot layers with lightweight transparent SVG layers integrated into the page, assistant, and welcome overlay. Arms rest at the sides; face shows dark pupils and a mouth animation that uses transform (not a height override that could block animation).
- Restored speech nod and chest glow while keeping the figure stable during scrolling; removed fixed background attachment across sections.
- Refined bright/ink-indigo themes, star accents, hero hierarchy, CTA touch sizing, mobile bot panel dimensions and font sizing.
- Updated cache version and deployment script with repo backups, confirmation, non-force push, remote commit verification.

## V35 — deployment path repair, compact intro and faster cache strategy (2026-10-23)
- Fixed the Windows `Resolve-Path` failure: the CMD no longer passes a quoted `%~dp0` path ending with a backslash; the PowerShell launcher also normalizes source paths defensively.
- Shortened the homepage introduction and made the first CTA lead to the seven-demo studio.
- Deferred the below-the-fold QR and full-size bot artwork instead of requesting them at high priority during initial page load.
- Removed remaining CSS drop-shadow/aura and backdrop blur from the primary robot display and bot panel surfaces.
- Added a new cache-busted V35 stylesheet and changed the service-worker cache name so existing installations can replace V34 assets on update.
- Configured long-lived caching for versioned CSS/JS and unique design-concept images while HTML and `sw.js` revalidate/no-store, so visitors can receive releases without waiting for a long HTML cache.
- Kept the existing seven demo pages and their distinct themes/navigation; retained the two already-shared concept images in the Our Work gallery.

## V34 — concept image integration and bot tap-away dismissal (2026-10-23)
- Integrated two previously shared website/robot concept images as optimized WebP assets in a responsive gallery on the Our Work page. Both are labelled as design concepts, not screenshots of the current live site.
- Added immediate tap/click-outside dismissal to DVNM Bot while preserving interactions inside the panel and launcher; Escape and the close button still work.
- Capped the speaking-panel height and tightened its controls on mobile, including narrow screens down to 320px.
- Added a V34 cache-busting stylesheet and updated the PWA cache name to prevent old behavior from being retained offline.
- Added the single current Windows deployment workflow: `DEPLOY-V34-WINDOWS.cmd` and `Deploy-V34.ps1`.
- The existing DVNM robot artwork itself was not redrawn in this code-only integration; the gallery presents the supplied concept artwork separately.

# Changelog

## V33 — clear UI, global service scope, and distinct demo experiences (2026-10-23)
- Replaces fog-like gradients and broad blur with clearer section colors, crisp card surfaces, and lower-cost rendering.
- Broadens corporate positioning to websites, web apps, Android/mobile apps, and software for individuals and organisations of all sizes worldwide.
- Adds seven distinct light/dark demo palettes plus persistent previous/next/all-demo navigation.
- Re-aligns the DVNM face overlay for normally open cyan eyes and blinking, removes body/floor shadows, and keeps the speaking panel compact.
- Adds global digital engineering documentation and neutral sample pricing.


## v30 — visual, sticky-header and DVNM speech repair (2026-10-22)
- Fixed the late CSS override that had stopped the corporate header sticking to the top of the viewport.
- Added a gentle white / mint / lilac / sand / mist-grey section rhythm, with translucent dark-mode surfaces.
- Switched the homepage bot stage back to the connected CSS-built robot with neutral lens eyes instead of the smiling background cut-out.
- Calmed idle/speaking gestures and made the DVNM chest plate glow with a restrained multicolour effect while speech is active.
- Increased the initial speech volume to 72% and added recovery when a device speech engine starts but stalls before completing a chunk.
- Tuned the floating assistant and response panel for compact mobile viewports and refreshed service-worker cache versions.

# Release v28 — Final CSS DVNM Bot and Demo Studio polish
- Rebuilt DVNM Bot as a single connected CSS character; removed the sliced image-layer rig.
- Added joined head/torso/arm/hand/hip/leg geometry, natural lens blinking, mild head turns, teacher-style gestures and connected alternating leg motion.
- Mouth animation and chest-logo glow respond to the existing browser speech state; the browser still supplies the voice.
- Improved the light palette and layered midnight-violet dark palette across the corporate site and sample demos.
- Added the corresponding illustrated visual to each of the seven individual sample demo pages and subtle perspective/float motion.
- Removed the seven-card navigator from individual demo pages; all seven cards remain on the dedicated Demo Studio index only.
- Bumped script/style/service-worker cache identifiers to v28 and removed obsolete segmented robot assets from the package.
- Final pass adds more pronounced perspective hover, soft illustration halos, a cleaned theme cache reference, and fixes duplicate theme-toggle title attributes.
- Motion honours prefers-reduced-motion.

# Release v27 — CSS Bot Motion and Illustrated Demo Studio

- Added a CSS-jointed rig using the existing DVNM Bot art: gentle head turns/nods, alternating arm gestures, subtle leg-step illusion, glowing chest and floating star accents.
- The mouth and eyelids retain the existing speech/blink overlays. No sound starts automatically.
- Added seven custom cartoon-style SVG illustrations to the demo cards.
- Added a horizontally browsable navigator linking all seven sample demos on every demo detail page.
- Refined dark Demo Studio surfaces to a brighter midnight-violet palette and added gentle hover/ambient animation.
- Honours `prefers-reduced-motion`; service-worker cache version is v27.

These sample websites are demonstrations, not claims of completed customer engagements.


## V32 — Full-body DVNM Bot and final visual polish (22 October 2026)

- Promoted the supplied transparent full-body DVNM robot illustration to the active assistant and homepage preview. The artwork visibly includes its arms, hands, legs and glowing chest wordmark.
- Added a separate masked head image with subtle idle turns and speech nods, a custom cyan face display, tap-aware gaze reaction, and chest glow pulsing during speech.
- Enabled the native device speech-voice selector where supported and persisted the user's choice; speech remains opt-in.
- Restored the earlier midnight palette while reducing card blur and making translucent glass surfaces more legible. Added visibly distinct pale white, mint, gray, beige, violet, indigo and rose section tones.
- Constrained the mobile assistant and its panel so the robot launcher sits above the WhatsApp button, with separate touch targets and safe-area padding.
- Added the DVNM Bot motion/voice/accessibility guide and updated the PWA cache name for V32.
- The robot remains a lightweight image rig rather than a full 3D model; arms and legs do not independently perform a physically simulated walk cycle.


## V36 — mobile-first UI and robot animation polish (2026-10-23)

- Promoted the existing DVNM layered robot art into the first viewport and shortened the lead sentence.
- Replaced the hazy charcoal dark theme with deep ink-navy and clear, opaque panel surfaces.
- Added low-intensity light points and section glints without heavy blur or scroll-shaking floats.
- Improved the face overlay with cyan iris lenses, visible black pupils, regular blinking, and a higher-contrast mouth opening/closing while the voice is active.
- Changed the first-visit welcome to a robot-first interface with “Hear introduction” and “Explore website” controls; speech remains user-initiated.
- Refined assistant card sizing/type and enlarged primary touch controls for mobile, retaining topic answers, speech controls, outside-tap close, and Escape close.
- Applied seven per-demo accent palettes for both theme modes; rotated the PWA cache and asset version references.
- Fixed deployment release files so CMD calls `Deploy-V36.ps1` without a path argument.

### V36 follow-up QA corrections
- Replaced damaged raster robot layers with lightweight transparent SVG layers authored in the site source; arms rest at the sides and no floor shadow is drawn.
- Aligned visible dark pupils and speech mouth overlays; removed an `!important` mouth-height cascade conflict that could suppress the mouth keyframes.
- Changed the star field from fixed to scroll-attached background to reduce mobile scroll repaint/jank.
- Applied separate brand accents to homepage demo preview cards as well as each demo page.


# V38 — October 23, 2026

- Robot-first welcome overlay hides the text wall while retaining the full introduction script for click-to-speak and preserving all topic responses.
- New transparent SVG mascot layers with relaxed arms, black pupils, no shadow or backdrop, and more visible mouth/chest/head speech activity.
- Improved small-screen assistant readability, dismissal positioning, button size, and stable scrolling by avoiding fixed backgrounds.
- Versioned all core CSS/JS/robot paths and rotated the service-worker cache.

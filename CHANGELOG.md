# Release v26 — DVNM Bot panel interaction, clean visor, chest glow, and brighter demo dark mode
- Refined the dark glass visor geometry so it fully covers the source artwork's curved closed-eye marks and uses clean circular optical lenses with a natural blink overlay.
- Repositioned and strengthened the chest aura so it illuminates the existing DVNM chest insignia rather than the lower torso; glow is more visible while speech is active.
- Kept the assistant panel fixed to the viewport independently of the narrow floating launcher, with a higher stacking level, mobile-safe dimensions, scroll handling, and usable close/question/voice controls.
- Applied a brighter midnight-violet/blue palette across the seven demo websites. Cards, forms, filters, sections, and footers now use clearer surfaces, gentler ambient gradients, and readable light text instead of near-black backgrounds.
- Bumped stylesheet, cutout asset and service-worker versions to prevent clients from reusing the previous cached release.
- Preserved the existing 71-page website, original images, certificate PDFs, QR codes, site navigation and backend-free demo interactions.

Known visual limitation: the supplied robot artwork still has its original outward-arm pose. No replacement robot image was generated or substituted. The previous no-generation arm-edit experiment produced visibly artificial replacement limbs and was deliberately not shipped. A polished, anatomically coherent hands-down pose remains a separate artwork change.

# Release v25 — DVNM Bot panel repair, natural lens eyes, and refined dark theme
- Fixed the floating assistant panel width. It is now sized independently of the narrow robot launcher, uses a viewport-safe fixed position, and retains working topic, voice, and close controls on desktop and mobile.
- Fixed click targets and panel interactivity while preserving the transparent floating launcher and the existing site navigation.
- Added a clean glass visor overlay so the original curved eye marks are hidden; the overlay lenses blink naturally and gaze subtly without the appearance of tears.
- Strengthened the DVNM chest aura while speaking and extended the speaking state to the floating robot launcher.
- Refined dark mode into a brighter midnight-violet palette with teal/purple ambient light, clearer surfaces, softer shadows, and gentle theme transitions.
- Bumped bot asset/style references and service-worker cache to v25 so deployments do not reuse the previous panel CSS.
- The robot art source remains the existing full-body DVNM illustration. The source illustration's outward arm pose is retained in this patch; no new generated artwork was used.

# Release v24 — Standalone full-body DVNM Bot
- Reused the existing branded DVNM robot artwork and made a transparent-background cutout asset for natural, full-body presentation; no new character artwork was generated.
- Replaced the old floating launcher made from CSS head/body pieces with the existing full-body robot image. The launcher itself has no card, square, border, pill, or background panel.
- Removed the rectangular photo frame around the homepage robot preview and removed the visible image frame in the welcome/assistant robot displays while preserving their layout and speech controls.
- Preserved blinking eyes, the speech-reactive mouth, speaking chest glow, keyboard focus, reduced-motion handling, and existing written guidance.
- Bumped CSS/cache-busting versions and the service-worker cache to v24 so browsers can fetch the updated robot asset rather than reusing v23.
- Kept the certificate preview/downloads, seven sample websites, QR destinations, shared light/dark demo themes, site content and navigation unchanged.
- Live Cloudflare visual checks remain required after deployment.

# Release v23 — Certificate preview, shared demo theme, and transparent DVNM Bot launcher

- We corrected the v22 deployment guard: it now checks the actual `@keyframes dvnm-natural-blink` definition instead of incorrectly requiring a `.dvnm-natural-blink` class.
- We redesigned the DVNM floating launch control as one transparent robot silhouette without a rectangular or pill-shaped container. It remains keyboard accessible and fixed above the bottom safe area.
- We added a stronger speaking-state chest aura so the existing DVNM chest mark glows more prominently while the robot speaks.
- We made the same light/dark theme tokens apply across all seven sample sites, including hard-coded demo cards, products, events, panels, filters and QR sections.
- We added a polished in-page certificate preview, a separate one-page showcase certificate PDF, and a distinct eight-page directory PDF with all seven QR codes. The certificate page includes print/save and direct download controls.
- We regenerated the homepage and demo QR codes to point to canonical share URLs.
- We expanded the showcase guide and bot documentation.

Certificate status: this is a non-official portfolio showcase record, not an accreditation, qualification, licence, audit, or personal skills certificate.

# Release v22 — DVNM Bot expression refinement

- Refined the existing 3D DVNM Bot so its face has clearly open illuminated eyes with gentle blink intervals and a distinct mouth animation that opens and closes while the browser speech engine is active.
- Kept the confident full-body stance, leg details, glowing DVNM chest mark, responsive placement, and existing speech/cancel controls.
- Applied the same face rig to the homepage preview, first-visit welcome, and floating assistant panel so the expression stays consistent across the site.
- Added a short documentation section explaining visual speech cues, reduced-motion behaviour, and the fact that mouth motion follows speech activity rather than exact phonemes.
- Updated bot asset versions and the service-worker cache so browsers can load the revised expression code.
- Preserved existing page layouts, route policy, seven sample demonstrations, QR codes, certificate PDF, product content, and documentation library.

# Release v21 — Final route and DVNM Bot reliability repair

- Removed the opposing extensionless-to-`.html` redirect rules that caused `ERR_TOO_MANY_REDIRECTS` under Cloudflare `auto-trailing-slash` handling.
- Normalised internal links, canonical URLs, sitemap entries, and sample QR codes to clean page URLs.
- Added a compressed full-body DVNM Bot illustration with legs and glowing DVNM chest branding on the homepage, welcome, and visitor guide.
- During speech, the assistant now focuses on the animated robot and a clear Cancel Speech control rather than showing the answer transcript.
- Exposed one logical voice option, DVNM Voice, which uses compatible device voice support and fallback; physical voices vary by browser and operating system.
- Updated the service-worker cache to v21, added route-reliability documentation, broadened worldwide service copy, and refined footer and theme transitions.
- Kept all seven sample demonstrations, per-demo QR images, printable showcase PDF, documentation, and existing product/status pages.

# Release v20 — Static route and service-worker reliability

- Fixed internal page links to point at the actual static `.html` files.
- Added Cloudflare Static Assets `_redirects` compatibility paths for older clean URLs and directory indexes.
- Updated canonical page URLs and the XML sitemap to actual page URLs.
- Updated DVNM Bot answer links to explicit files.
- Replaced service-worker `Response.error()` navigation failure with a readable offline fallback, and added extensionless route recovery.
- Rotated the service-worker cache to v20, versioned DVNM Bot CSS to `?v=20`, and added no-cache headers for `sw.js`.
- Preserved visual branding, all seven DVNM sample websites, QR images, certificate PDF, and the documentation library.


## v19 — DVNM Bot stylesheet repair (21 October 2026)

- Restored `assets/css/dvnm-bot.css` as a stylesheet. The previous release accidentally shipped JavaScript content at this CSS path, causing the welcome dialog, robot panel, buttons, layout, and spacing to appear unstyled.
- Reapplied the welcome-dialog, mobile layout, robot glow, chest branding, and voice-control styles.
- Added `?v=19` to stylesheet links and bumped the service-worker cache to reduce the chance of browsers reusing the broken CSS response.
- Kept the existing site pages, seven DVNM sample demonstrations, QR assets, and certificate PDF.
- Validation required: visual checks on a real phone and desktop after deployment; built-in browser speech still depends on voices provided by each operating system/browser.

# Release notes — 15 October 2026

- Rewrote remaining public guidance in Davonium Technologies’ own voice and removed unnecessary descriptions of internal implementation choices.
- Improved consistency between guide titles, page summaries, product status, and the machine-readable public information index.
- Refined the WhatsApp action so the floating control consistently displays the recognisable WhatsApp mark with an accessible label.
- Added a public security contact file and retained conservative browser security headers.
- Expanded offline pre-caching for the documentation visitors are most likely to need.
- Kept the preferred `www` domain, canonical public URLs, sitemap, and AI Search crawler preference aligned.
- Documented the required permanent redirect for the bare domain and the difference between a crawl request and confirmed indexing.

## 21 October 2026 — DVNM Bot and Demo Studio

- Added a responsive animated DVNM Bot visitor guide with opt-in browser speech, curated navigation questions, and reduced-motion support.
- Added the initial seven DVNM sample website demonstrations and a searchable-friendly Demo Studio index; the collection was expanded to seven DVNM-branded sample demonstrations in the 21 October 2026 final refinement.
- Generated a branded QR PNG for https://www.davoniumtech.com/ and added a homepage download action.
- Expanded public documentation with DVNM Bot and Demo Studio guides.
- Removed direct public Ready2Go app links from the corporate homepage, Products page, and Work page; status now states under development. Full subdomain access restrictions still need hosting/Cloudflare configuration.
- Updated the service-worker cache key, sitemap, navigation, and project documentation.


## 2026-10-21 — Mobile and voice refinement

- Expanded Demo Studio from five to seven original sample demonstrations, including a Davonium-branded technology-company showcase and a community events sample demonstration.
- Promoted the website QR code to the first scroll beneath the homepage hero.
- Hardened DVNM Bot speech startup against cancel-on-idle interruptions and added default-voice fallback messaging.
- Enhanced robot lens/core glow and hologram effects with reduced-motion support.
- Added global phone/tablet/landscape overflow protection and responsive panel sizing.
- Added mobile-first website quality and speech/accessibility documentation; updated sitemap and service-worker cache version.


## 2026-10-21 — DVNM Nigeria demo, QR, and voice refinement

- Replaced unrelated fictitious demo names with seven DVNM family sample demonstrations and Nigeria-relevant SME, creator, learning, product, technology, and work-community use cases.
- Added unique scannable QR images and responsive QR panels to each demo page plus a directory QR.
- Added certificate information page, printable non-official demo showcase PDF, and detailed documentation.
- Tuned browser speech to a softer output level and a more neutral rate/pitch, using the best available English voice on the device and keeping written fallbacks.
- Updated discoverability metadata, sitemap, and service-worker cache.

## 21 October 2026 — Welcome, voice and sample presentation

- Added the first-visit DVNM Bot welcome card with optional session-only name, introduction, and skip controls.
- Expanded guided answers to ten readable lines per topic and added adjustable voice, volume, and pace settings.
- Updated the animated robot chest mark from a single letter to a luminous DVNM badge.
- Marked each of the seven demo pages as a sample website demonstration.
- Published a detailed guide covering onboarding, voice choice, privacy, accessibility, and offline limitations.

## 21 October 2026 — DVNM welcome, voice, sample-journey and documentation refinement

- Made the first-visit welcome more personalised, with an optional in-session visitor name, a detailed introduction, Meet and Skip controls.
- Reduced default spoken volume to 25%, gently slowed the pace, and prefer an installed local English voice when possible to reduce start-up delay.
- Enhanced robot hardware detail, the glowing DVNM chest plate, voice-reactive lighting, and reduced-motion behaviour.
- Expanded all seven DVNM sample pages with tailored visitor journeys and practical FAQs; kept sample wording explicit and avoided claiming client deployments.
- Added the DVNM sample planning guide and refreshed PWA cache routes.


## v17 — DVNM Bot welcome, voice and sample-showcase refinement (21 October 2026)

- Added a fuller first-visit DVNM Bot welcome with a visible introduction, optional current-visit name, Meet/Skip controls, and no automatic speech playback.
- Added voice and volume selection to the welcome itself, with a quieter 15% default volume and 0.86× starting pace. Device-installed voices remain device-dependent.
- Refined the robot's DVNM chest insignia, scan lighting, optical details, and mechanical hardware animations, while respecting reduced-motion preferences.
- Expanded release guidance for all seven DVNM sample website journeys; each remains explicitly labelled as a sample rather than a claimed client project.
- Added a detailed release acceptance checklist to the documentation directory and service-worker cache.
- Updated offline guidance to distinguish cached pages/assets from connected services, live submissions, and device-dependent voice output.


## v18 — DVNM Bot personalised welcome and mobile voice resilience (21 October 2026)

- Made the welcome voice quieter by default (15%), slowed the initial pace to 0.86×, and exposed device-voice, volume, and pace settings before the visitor listens.
- Improved mobile synthesis reliability by speaking detailed introductions in short, sentence-sized utterances and trying the device default voice if a selected voice is interrupted or does not start.
- Kept spoken output opt-in; welcome text, written answers, navigation links, Stop voice, Skip, and reduced-motion support remain available.
- Added more detailed release acceptance documentation and refreshed the service-worker cache key so returning visitors can receive the updated welcome.
- Marked the PDF as binary in Git attributes to avoid treating PDF-internal syntax as source text during whitespace checks.

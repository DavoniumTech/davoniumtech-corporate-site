## v30 — visual, header, and DVNM speech repair (22 October 2026)
- Restored the sticky glass header; fixed the late CSS rule that had reset it to relative positioning.
- Added restrained white, mint, lilac, sand, and mist-gray section tones with a transparent, readable dark theme.
- Unified the homepage preview and assistant around the CSS-built DVNM Bot: neutral lens eyes, connected body styling, soft idle motion, and a brighter multicolour DVNM chest reactor only while speech is active.
- Reduced oversized/overactive robot movement, hid decorative stars, and tightened floating assistant placement for small phone viewports.
- Increased the default browser voice volume from 15% to 72% and added a post-start speech watchdog for mobile engines that stall before `onend`.
- Bumped static asset cache versions and updated the service-worker cache so deployed devices can pick up the visual and voice repairs.

# Davonium Technologies — corporate website

> Useful technology, built for real needs.

## v28 — Final CSS bot and Demo Studio lock-down (21 October 2026)
- The visitor guide is rebuilt as one CSS-drawn humanoid character with connected head, torso, arms, hands, legs and feet; it no longer depends on sliced robot artwork.
- Circular cyan lens eyes blink naturally without tear-like eye streaks. The head turns gently, the mouth opens while speech is active, the DVNM chest mark glows, and subtle arm/leg gestures create a lightweight teaching motion.
- The assistant remains speech-on-demand and keeps keyboard, mobile and reduced-motion behavior. CSS motion is illustrative, not a physics-based or true 3D simulation.
- Light mode uses layered pastel colour; dark mode uses a brighter midnight-violet palette with more readable raised panels. The seven original locally stored SVG illustrations have gentle perspective, glow and floating motion.
- The seven demo cards appear together only in the Demo Studio directory; each individual demonstration page has its own focused content and its own hero illustration.
- All 71 HTML pages, local references, anchors, sitemap targets, CSS delimiters, JavaScript syntax and SVG XML are checked before packaging. Live desktop/mobile and Cloudflare deployment checks remain a post-deployment step.


Davonium Technologies creates practical digital products and modern website experiences. This repository contains the existing multi-page company site, shared CSS/JavaScript, a public documentation library, installable PWA support, and the DVNM Bot + Demo Studio additions.

## v24 — Standalone DVNM Bot artwork (21 October 2026)
- The floating DVNM Bot is now rendered from the existing full-body robot artwork using a transparent cutout asset, rather than the former miniature CSS robot made of separate boxed pieces.
- The homepage preview, first-visit welcome, and assistant panel use a frameless robot presentation with the same speech-state glow and expression overlays.
- The original source artwork remains in `assets/images/dvnm-bot-3d.webp`; the isolated transparent version is `assets/images/dvnm-bot-cutout.webp`.
- Service-worker and asset query versions are bumped to v24 to avoid stale cached art. Certificate, demo, QR, theme, and navigation functionality is preserved.

## New in this release (21 October 2026)

### DVNM Bot — animated visitor guide
- A 3D illustrated full-body robot character with glowing DVNM chest branding, legs, gentle floating and speaking-state animation.
- Curated clickable questions for company information, products, services, demo websites, documentation, and contact.
- Optional spoken answers using the browser/device speech synthesis API. Audio never starts automatically.
- Mouth animation activates during speech; visual timing follows speech activity approximately and is not phoneme-level lip-sync.
- Keyboard-friendly controls, written fallback answers, Escape-to-close, and reduced-motion support.
- No external AI provider, audio service, API key, or visitor-data transfer is required by the current implementation.

### Seven DVNM sample website demonstrations
The `/demos/` directory contains seven original DVNM sample website demonstrations:
1. DVNM Biz sample business website (`demos/business.html`)
2. DVNM Growth sample marketing website (`demos/marketing.html`)
3. DVNM Market sample website (`demos/shop.html`) with an in-memory sample basket only
4. DVNM Creative sample website (`demos/portfolio.html`) with project filtering
5. DVNM Skills sample website (`demos/learning.html`) with expandable topic details
6. DVNM Digital sample website (`demos/technology.html`) for the Davonium brand
7. DVNM Connect sample website (`demos/community.html`) for work and skills community events

These are sample website demonstrations created by Davonium Technologies, not client case studies. Sample brands, prices, and copy are fictional. Demo forms do not send or store data; the shop does not process payments, accounts, orders, taxes, shipping, or inventory.

### QR code
`assets/images/davonium-website-qr.png` is an offline-generated QR code to `https://www.davoniumtech.com/`. The homepage presents it with a download link for print use.

### Ready2Go Learning visibility
The corporate homepage, product listing, and work page no longer link directly to the Ready2Go app host. The site describes the product as under development and directs readers to its company-authored status guide. This is a website-level entry-point change; it does not by itself restrict direct access to a separately hosted subdomain. To fully block that host, configure a Cloudflare Access rule, redirect, or hosting/deployment restriction for `ready2go.davoniumtech.com` and verify it independently before calling the product private.

## Existing company pages
- Home: https://www.davoniumtech.com/
- About: https://www.davoniumtech.com/about
- Products: https://www.davoniumtech.com/products
- Services: https://www.davoniumtech.com/services
- Our work: https://www.davoniumtech.com/work
- Demo Studio: https://www.davoniumtech.com/demos/
- Documentation: https://www.davoniumtech.com/docs/
- Contact: https://www.davoniumtech.com/contact
- Support: https://www.davoniumtech.com/support
- Installation help: https://www.davoniumtech.com/install

## Development and deployment
This is a static HTML/CSS/JavaScript project with a service worker. No Node build step is required for the new features. Deploy the full root of this folder through the existing Cloudflare/GitHub integration after testing a preview. Avoid `robocopy /MIR` when updating an existing working tree; make a backup branch and inspect the staged diff first.

See `DEPLOY-WINDOWS-CMD.txt` for the careful Windows CMD update workflow and `docs/guides/dvnm-bot` / `docs/guides/website-demo-studio` for feature documentation.

## Quality notes
- Search metadata and JSON-LD describe company-owned pages; sitemap includes the demo index and new public guides.
- Demos are marked `noindex` individually to keep fictional sample content out of search results; the Studio index is public.
- Reduced-motion preferences are respected for decorative animations.
- Speech output is opt-in and uses device voices, which vary by browser and installed language packs.
- A successful Git push does not guarantee Cloudflare has deployed the newest build. Verify deployment status and test the public site on desktop and mobile.

## Contact
Email: support@davoniumtech.com
WhatsApp: https://wa.me/2348032076924


## October 2026 mobile, voice, and Demo Studio refinement

- Demo Studio now includes seven original sample demonstrations: local business, marketing, online shop, creative portfolio, learning product, a Davonium-branded technology showcase, and a fictional community/events hub.
- The homepage QR code is surfaced immediately after the hero and links to the company homepage; the PNG remains available for print use.
- DVNM Bot speech startup avoids cancelling an idle browser speech engine, prefers available English voices, tries the platform default once after a named-voice failure, and preserves written answers on interruption.
- Robot motion and lighting have been enhanced with a brighter faceplate, lens glow, chest core, hologram floor, and safe reduced-motion handling.
- Device-fit overrides address narrow phone widths, landscape screens, touch targets, scroll overflow, and short-height assistant panels.
- Added mobile-first quality and speech/accessibility guides.

The speech engine still depends on browser and operating-system support; web code cannot guarantee audio on every device. Demo forms and sample RSVPs do not send or store information.


## 21 October 2026 — DVNM Nigeria demo and QR showcase release

- Renamed the seven sample website demonstrations to the Davonium-owned DVNM family: DVNM Biz, DVNM Growth, DVNM Market, DVNM Creative, DVNM Skills, DVNM Digital, and DVNM Connect.
- Reworked sample content for small businesses and organisations worldwide, independent workers, product makers, creators, job seekers, learners, and community skills sessions.
- Added a unique QR PNG and an on-page QR sharing section to each demo; added a directory QR code.
- Added a printable, non-official sample demonstration showcase record PDF and a page that clearly describes its limitations.
- Reduced native speech volume and tuned rate/pitch; prioritised Nigerian English if the device provides it and retained written answer/link fallbacks.
- Added detailed company-voice documentation on demo scope, QR safety, mobile tests, SEO foundations, privacy boundaries, and certificate limitations.

Browser-native voice remains dependent on the operating system and browser. A device that lacks speech synthesis, a usable voice pack, or audio output may not speak; written answers stay available. All demo forms, carts, and event RSVP controls remain non-production demonstrations.


### Seven DVNM-branded demonstration websites

Our Demo Studio contains DVNM Biz, DVNM Growth, DVNM Market, DVNM Creative, DVNM Skills, DVNM Digital, and DVNM Connect. The sample demonstrations are framed for businesses, organisations, professionals, learners, technology teams, and community groups worldwide. Every sample demonstration page has its own QR code; the directory has a separate QR code. The printable sample demonstration showcase PDF is intentionally non-official and not an accredited certificate.


## 21 October 2026 — DVNM welcome and voice release

- Added a first-visit DVNM Bot welcome banner with Meet/Skip controls and an optional in-session visitor name.
- Expanded all six guided answers to ten detailed lines, with clear links to relevant company pages.
- Added installed-device voice selection, a quieter default speech level, adjustable volume, and adjustable speaking pace.
- Updated the robot with a glowing DVNM chest plate and enhanced mechanical lighting details.
- Clarified sample website wording and inserted a sample notice on each of the seven demo pages.
- Added the DVNM welcome, voice and privacy guide; updated sitemap, documentation index, and service-worker offline pre-cache.
- The welcome remains silent unless a visitor explicitly requests spoken output. Speech and offline behaviour remain dependent on device and browser support.


## DVNM Bot and Demo Studio release checklist

See [`docs/guides/dvnm-bot-interaction-checklist.html`](docs/guides/dvnm-bot-interaction-checklist.html) for visitor welcome, voice, mobile, seven sample journeys, QR, offline, privacy, SEO, and release-verification checks. The combined sample showcase PDF and QR images remain inside the website repository under `docs/media/` and `assets/images/`.

## Route reliability release v20

Internal links now point to actual static HTML files, the sitemap/canonical paths match files in the repository, and `_redirects` preserves older extensionless URLs on Cloudflare Workers Static Assets. The service worker uses a new cache version and an accessible offline fallback rather than returning a generic network error for failed page navigation.

After pushing, confirm that Cloudflare publishes the new deployment. The source repository contains `demos/business.html`, but a GitHub file existing does not prove that the live Worker has deployed it. See `ROUTE-RELIABILITY-REPAIR-v20.md`.

## DVNM Bot expression refinement v22

Our team refined the DVNM Bot face with open illuminated eyes, natural blink intervals, and a mouth that opens and closes while spoken output is active. The same expression rig is used on the homepage preview, welcome experience, and visitor guide. Visual speech motion follows speech activity approximately, while reduced-motion preferences and the Stop/Cancel Speech control remain in place.


## Certificate preview and shared demo theme v23

Our team now presents the DVNM Demo Studio showcase certificate directly on the certificate page, with a dedicated single-page PDF download and a separate QR directory PDF. The same page includes print/save controls and a mobile-friendly embedded directory preview. All sample sites use shared light/dark preferences and include a transparent, fixed DVNM Bot launcher without a card-shaped background. Speaking state adds a brighter chest glow, while speech remains controlled by the visitor and can be cancelled at any time.

## v28 final visual update

DVNM Bot is now a cohesive CSS-built character with connected arms, hands, legs and head joints. It uses CSS gradients and perspective rather than segmented source-art images. The seven sample demo pages each feature their own illustration; the full seven-card directory is shown only at `/demos/`. The voice remains browser-native, and the animated mouth responds to active speech rather than phoneme-level lip synchronization.

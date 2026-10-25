# Davonium Technologies V39 release notes

Date: 25 October 2026

## User-facing changes
- Reference-inspired cinematic cobalt/navy hero with a small SVG city/network backdrop and subtle stars, with no fixed background effect.
- Worldwide positioning that covers websites, web/mobile applications, software systems and digital products.
- The seven image-led demo cards move directly below the hero and use the existing distinct demo artwork and individual accent identities. Accessible previous/next controls scroll the demo rail.
- Homepage hero and first-visit welcome use a lightweight feathered WebP crop of the existing supplied reference scene; visible dark pupils, eyelids, a speech-animated mouth and chest glow are layered over the robot. The compact floating assistant keeps transparent SVG artwork. The hero scene has no separate floor-shadow or blur effect.
- Mobile navigation, CTAs, assistant controls, and demo rail are adjusted for narrow phone widths. Bot panel uses a solid high-contrast surface; the existing outside-tap close handler is preserved.
- Service worker cache name and asset query versions are advanced; large concept mockups are no longer in the core pre-cache list.

## Validation
Static HTML target/anchor/ID checks, XML/SVG parse checks, JS syntax checks, CSS parse checks, sitemap XML, and ZIP integrity are run during package creation. These checks cannot guarantee identical layout or animation on every mobile browser. The live-domain fetch returned Cache miss and browser automation was blocked by the environment, so the released source has not been visually verified on a physical phone. The public website could not be fetched from the available web runtime while preparing the release; deploy first, then test on a real phone and desktop.

## Deployment
Download the full V39 ZIP, extract it using the one-line CMD launcher, and run `DEPLOY-V39-WINDOWS.cmd`. It confirms the official repository, checks working tree, makes local and remote backups, refuses force push, and verifies the remote `main` commit. Cloudflare must complete its build after GitHub receives the commit.

- Consolidated the shared base and DVNM Bot CSS into one versioned stylesheet, reducing one render-blocking CSS request per page; demo pages retain their separate demo stylesheet.

- Uses a feathered WebP crop of the existing global-solutions reference image for the homepage and first-visit mascot; no standalone image-generation job was used.

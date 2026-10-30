# Davonium Technologies — V62 Glass Constellation

## Creative direction

V62 uses the Davonium website's own QR/share section as the reference for the relationship between the background and content: the starfield is the continuous environment, section wrappers remain transparent, and only actual content cards receive a restrained glass surface.

The release preserves the Davonium D mark, approved standing DVNM Bot, current navigation, page routes, product names/statuses, five independent demo identities, QR artwork, print flyers, certificate, documentation and PWA architecture.

## Main corrections

- Transparent section wrappers across corporate, documentation, certificate and demo routes. Legacy `.section.tint`, `.section.soft`, `.pagehero`, `.demo-hero` and other coloured slabs no longer cover the shared starfield.
- Individual glass treatment is reserved for useful cards, QR surfaces, product cards, service cards, process steps, documentation tiles and demo content.
- The existing animated star canvas is denser and brighter, with stronger twinkle, drift and cross-shaped glints. The star canvas remains behind page content and below the sticky navigation.
- The homepage hero uses a wide desktop composition, with a wider editorial text column and a full-width orbital/robot stage on the right. The standing DVNM Bot artwork is unchanged; it is larger and positioned on the stage floor.
- Tablet and mobile layouts stack the hero, keep the full robot artwork visible, and preserve the current mobile navigation.
- Existing theme behaviour is retained: dark is the first-visit default; visitors can explicitly switch to the separate light theme.
- A header audio shortcut opens the existing DVNM Bot panel. Tapping the existing Bot head reads the current page after the visitor action. Bot topics now provide a direct link to the matching company section, and the page-summary topic reads the page currently being viewed.
- The approved robot face and body are retained. Mouth and chest overlays animate while speech is active; no replacement mascot or redesigned Bot is introduced.
- Demo pages keep their individual identity and shared company navigation/return-to-Studio control.

## Visual references studied

- Davonium's own QR/share section is the treatment reference for the full-page background and glass hierarchy.
- A&S Tech's public site informed the clear desktop hero composition, service discovery and portfolio structure.
- Lusion's official studio site informed the distinction between visual storytelling, a curated body of work, and technically restrained interaction. Davonium's identity and wording remain original.
- The uploaded enterprise HTML informed the layered Three.js scene and glass-card hierarchy only; its incomplete search, enquiry and demo behaviours were not carried over.

## Performance and access

The starfield remains a single fixed canvas rather than a separate canvas per section. It pauses while the document is hidden and respects `prefers-reduced-motion`. All content remains readable if the canvas is unavailable. Bot audio is initiated only by a visitor action and uses the browser's available speech synthesis voice.

# Davonium Technologies — V58 Signal Experience

## Design thesis
V58 extends Signal Architecture into a consistent site-wide environment: an atmospheric star field, translucent editorial surfaces, controlled cyan/violet signal lighting, confident corporate language, and visual continuity between the corporate site and five independent demo experiences.

## Visual system
- A single fixed vector star field sits behind all routes and scroll sections, rather than appearing only in the homepage hero.
- Main section wrappers use translucent glass surfaces so stars remain visible through cards and content panels in both dark and light themes.
- Dark mode uses graphite, deep navy, cyan signal points and restrained violet. Light mode uses porcelain surfaces, soft blue/cyan accents and a darker, legible star pattern.
- The approved Davonium D mark and standing DVNM Bot artwork remain the brand assets. The V58 Bot head control is not a second floating mascot.
- Bot/character imagery has no drop shadow or heavy filter treatment.

## Content direction
- Corporate navigation uses the concise `Work` label instead of `Our work`.
- Homepage language is declarative and company-level, avoiding overly personal or conversational prompts.
- The complete headline remains `Digital products, engineered for impact.` and is allowed to wrap rather than clip at desktop widths.
- Product status claims remain unchanged and are not embellished.

## Service imagery
- The six primary homepage service cards each contain three distinct photo-style visual assets.
- The 18 images are unique across the six-card service gallery; reporting/integration imagery is not reused from the mobile-app set.
- Thumbnail activation opens a focused image lightbox. Full source images remain visible on narrow screens with `object-fit: contain`.

## Demo Studio and five independent experiences
- DVNM Biz, DVNM Market, DVNM Creative, DVNM Skills and DVNM Digital retain their existing direct routes.
- Each individual experience has three dedicated story images, a distinct accent palette, its own content and interaction structure, and a persistent `Back to Demo Studio` arrow in the shared company header.
- Demo preview images are direct links. Native cross-document View Transitions provide a composed page transition where supported; a short overlay fallback is used where native navigation transitions are unavailable.
- Demo story images and service galleries open in an accessible animated lightbox.
- Prominent `sample demonstration` banners are removed. Small, factual footer notes remain where prices, forms, course data or product entries are illustrative, to avoid implying live transactions or customer records.

## DVNM Bot voice
- The floating baby-head launcher remains removed. WhatsApp remains the single floating contact shortcut.
- The homepage DVNM Bot section includes a clear, user-triggered `Hear DVNM Bot introduction` control, a device-provided English voice selector and a stop state.
- Speech uses browser speech synthesis. Voice availability and quality depend on the visitor's device/browser; no speech is played automatically.
- The visible bot head uses the crop matched to the same standing DVNM Bot artwork.

## Accessibility and resilience
- The skip-to-main link remains visually hidden during normal browsing and appears on keyboard focus, preserving keyboard accessibility without adding a visible banner over the design.
- All new galleries and lightbox controls are keyboard-operable and announce meaningful names.
- The star field is decorative and pointer-transparent. Reduced-motion preferences disable the drifting/twinkle and transition animations.
- Core text, links and forms remain usable without WebGL or browser speech synthesis.

# Davonium Technologies — v31 visual and voice repair

This is an in-place visual release based on the current corporate-site project. Existing routes, documentation, products, sample websites, contact paths, install support and PWA structure are retained.

## Visual direction
- Uses the previous Davonium website's midnight base (`#070a1d`) with violet, cyan and green glows.
- In light mode, uses translucent white with soft mint, lilac, beige and mist-grey section transitions.
- In dark mode, surfaces are transparent midnight glass with restrained luminous accents, blur and inner highlights.
- Preserves responsive navigation and sticky header behavior.

## DVNM Bot
- The page preview, floating guide and welcome character continue to use the existing CSS-built robot, not an unrelated smiling cut-out.
- The fixed chest text remains `DVNM`. The reactor aura and chest plate glow more brightly while speech is active.
- Word-boundary events trigger timed mouth pulses when the browser reports them. Other browsers use a fast CSS animation while speech is active.
- Voice is still supplied by the visitor's browser/device Speech Synthesis implementation. Exact phoneme-level lip sync cannot be guaranteed by that API across all devices.

## Validation
- JavaScript syntax checked with Node.
- HTML local-reference scan: 71 pages, zero missing local targets after the stylesheet version update.
- CSS parsing and XML checks included in the release check.
- Automated Chromium screenshots were blocked by the environment's browser restrictions; perform a final live browser check at 320px, 360px, 390px, tablet and desktop widths after publishing.

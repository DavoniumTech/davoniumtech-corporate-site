# Davonium Technologies — corporate website

> Useful technology, built for real needs.

Davonium Technologies creates practical digital products and modern website experiences. This repository contains the existing multi-page company site, shared CSS/JavaScript, a public documentation library, installable PWA support, and the DVNM Bot + Demo Studio additions.

## New in this release (21 October 2026)

### DVNM Bot — animated visitor guide
- A friendly CSS-drawn robot character with gentle floating, blinking, waving, glow, and speaking-mouth animation.
- Curated clickable questions for company information, products, services, demo websites, documentation, and contact.
- Optional spoken answers using the browser/device speech synthesis API. Audio never starts automatically.
- Mouth animation activates during speech; visual timing follows speech activity approximately and is not phoneme-level lip-sync.
- Keyboard-friendly controls, written fallback answers, Escape-to-close, and reduced-motion support.
- No external AI provider, audio service, API key, or visitor-data transfer is required by the current implementation.

### Five in-site website demonstrations
The `/demos/` directory contains five fictional, original concepts:
1. Local business website (`demos/business.html`)
2. Marketing landing page (`demos/marketing.html`)
3. Online storefront prototype (`demos/shop.html`) with an in-memory sample basket only
4. Creative portfolio (`demos/portfolio.html`) with project filtering
5. Education product landing page (`demos/learning.html`) with expandable topic details

These are front-end concepts, not client case studies. Sample brands, prices, and copy are fictional. Demo forms do not send or store data; the shop does not process payments, accounts, orders, taxes, shipping, or inventory.

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

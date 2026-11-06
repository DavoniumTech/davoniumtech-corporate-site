# Davonium Technologies — V66 Performance & SEO Foundation

This repository root is the static website document root. It contains the corporate website, company and product pages, documentation, five independent Demo Studio experiences, images and icons, PWA files, Cloudflare Pages configuration, redirects, and security headers.

## Deployment

- Production domain: `https://www.davoniumtech.com/`
- GitHub production branch: `main`
- Cloudflare Pages project root: `/`
- Build command: none (static HTML/CSS/JavaScript site)
- Keep the previous production commit or ZIP as a rollback point before deploying a new release.
- Test the deployed preview before promoting changes to `main`.
- Do not put access tokens, private keys, passwords, or `.env` files in the public repository.

## V66 release

V66 is a performance and technical SEO foundation pass. It preserves the approved dark navy / blue / cyan corporate identity and existing navigation, product information, demo experiences, and PWA behaviour. The local CSS and deferred JavaScript stacks are bundled in their original cascade/execution order, the three Google Fonts stylesheet requests are consolidated, and large editorial photos are optimized as WebP. The PWA cache name is rotated so the updated bundles can be cached cleanly.

See `DAVONIUM-V66-PERFORMANCE-SEO-RELEASE-NOTES.md` for the detailed changes, measurements, verification notes, and post-deployment checklist.

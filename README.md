# Davonium Technologies - V63 Studio Finish

This repository root is the static website document root. It contains `index.html`, the company pages, documentation, five Demo Studio experiences, assets, PWA files, Cloudflare Pages configuration, and redirects/headers.

## Deployment

- Cloudflare Pages should deploy from the connected GitHub production branch (`main`) with the project root set to `/` and no build command for this static site.
- The included `PUBLISH-V63.ps1` (in the release ZIP, outside the public site folder) is a local Windows PowerShell helper. Do not put publisher scripts in the public website root.
- No secrets, tokens, private keys, or `.env` files belong in this repository.

## Release notes

V63 moves the approved full-body DVNM Bot into the right-hand desktop hero field, retains the centered responsive layout on smaller screens, makes mobile navigation solid and legible, makes the site footer opaque, and adds a five-image visual mosaic to the Demo Studio landing page. The existing V62 performance strategy and routes are retained.

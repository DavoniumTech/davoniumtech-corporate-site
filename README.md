# Davonium Technologies — V68 Premium Multicolour UI Review Candidate

This repository root is the static website document root. It contains the corporate website, company and product pages, documentation, eight independent Demo Studio experiences and five owner-workspace previews, images and icons, PWA files, Cloudflare Pages configuration, redirects, and security headers.

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


## V67 commercial launch foundation

See `DAVONIUM-V67-RELEASE-NOTES.md` for the pricing page, guided project builder, five sample workspace previews, lightweight starfield and deployment limitations.


## V68 — Premium multicolour experience (review candidate)

The current V68 review candidate builds on the owner-supplied archive, whose reconstructed Git tree was verified against the existing V68 `main` commit `c2312478f1b155dc6184c4c3b63412b22841a846`. It introduces a new corporate homepage composition, a shared visual system, eight independently art-directed demo routes, five product-specific sample workspaces, and an accessible Demo Studio filter. It remains front-end only. The source archive already contained earlier V68 styling and demo files; see `DAVONIUM-V68-UI-AUDIT.md` for the source-provenance note and the actual changes in this revision.

This candidate has passed the static source checks and local HTTP route checks listed in `DAVONIUM-V68-QA-REPORT.md`. Browser-based visual, manual interaction, real-device and live PageSpeed checks remain release gates. **This package has not been published to GitHub or deployed to Cloudflare.** Do not deploy it until the owner reviews the package and explicitly approves publication.

See `DAVONIUM-V68-RELEASE-NOTES.md`, `DAVONIUM-V68-IMPLEMENTATION-PLAN.md` and `DAVONIUM-V68-DEPLOYMENT-GUIDE.md` for scope and next checks.

 
## V70 — Corporate homepage redesign

V70 establishes a new owner-directed homepage art direction based on the supplied Davonium campaign reference: deep navy, silver ribbon movement, restrained cyan highlights, a prominent DVNM Bot presentation, a mobile website preview and a direct Business Launch Kit pathway. The existing corporate routes, Demo Studio destinations, QR asset, product status content, service content, DVNM Bot interaction, PWA and backend integrations are preserved. The redesign is scoped to the public homepage; it does not claim that the admin authentication issue has been resolved. The service-worker cache namespace is rotated to make the new homepage stylesheet available after deployment.

Release validation: source-level checks and GitHub main-branch verification are recorded in the V70 delivery summary. Live Cloudflare deployment and manual browser/device visual QA must still be confirmed after Pages publishes the updated main branch.

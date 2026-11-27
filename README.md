# Davonium Technologies — Corporate Website (V71)

## Production source

- Public domain: https://www.davoniumtech.com/
- GitHub repository: https://github.com/DavoniumTech/davoniumtech-corporate-site
- Production branch: main
- Hosting target: Cloudflare Pages
- Document root: /
- Build command: none; static HTML, CSS and JavaScript.
- Last source release: V71, 27 November 2026.

A successful GitHub push updates the website source. It does not by itself prove Cloudflare Pages has deployed the commit or that the public domain is serving the new files. Verify the deployed commit in Cloudflare Pages and then perform real-browser/device checks before announcing a release.

## Company structure

Davonium Technologies operates two distinct divisions:

1. Digital Solutions — client services including corporate websites, landing pages, web applications, mobile apps, custom software, business systems, workflow automation, digital presence and delivery support.
2. Commercial Software Products — software products owned and developed by Davonium Technologies, with their own roadmaps and customer environments.

### Product boundaries

- Ready2Go Learning: a learning and exam-preparation product in development.
- Marvel Chat: a communication product with an initial build and active development.
- DVNM TradeFlow: a separate wholesale and distribution software initiative, with its own product architecture, database, deployments and customer environment.
- Davonium Nexus: Davonium's private internal operating system and company command centre. It is not a public customer-facing SaaS and is separate from TradeFlow.

Keep status labels honest. Do not publish unapproved prices, release dates, customer results, testimonials, performance claims or features that have not been tested.

## V71 implementation

### Corporate site and visual system

- A homepage art direction based on the owner-supplied navy, silver and cyan campaign reference.
- A shared site design layer for the principal corporate pages, Demo Studio, workspaces, documentation and legal page families.
- Responsive page headers, typography, cards, buttons, forms, content sections and footers.
- A versioned shared stylesheet: assets/css/davonium-v71-site.css.
- The homepage also retains its own V70 composition stylesheet: assets/css/davonium-v70-home.css.

Existing content, routes and unique demo identities have been retained rather than replaced by blank templates.

### Public page families

- Corporate: Home, About, Services, Products, Pricing, Work, Contact, Support and Install.
- Business Launch Kit: an industry-tailored online-presence and launch-material service.
- Guided Project Builder: a structured project brief and enquiry handoff.
- Demo Studio: eight independent experiences — Biz, Market, Creative, Skills, Digital, Growth, Connect and Showcase.
- DVNM Forge: five local workspace builders — Biz, Market, Creative, Skills and Digital.
- Knowledge Centre: 220 static, searchable definitions across ten topic groups.
- Insights: six original practical articles covering digital presence, Business Launch Kit scope, QR codes, website planning, demo-versus-production boundaries and product-release planning.
- Documentation and legal pages: product guides, engineering guides, privacy, cookies and terms.

### DVNM Forge local workspace behaviour

The five workspaces share a browser-local engine supporting:

- Create, read, update and delete of workspace records.
- Local autosave in localStorage.
- Undo and redo history.
- Image uploads stored in browser IndexedDB, with a local media library.
- JSON import and export.
- ZIP export containing workspace JSON, a README and uploaded media.
- Attribution: Built with DVNM Forge by Davonium Technologies.

Data boundary: these are local-first workspace builders. They do not connect to Supabase, Firebase, a cloud account, live customer records, live payments or production business systems. Workspace data is stored in the current browser/device. Export the JSON or ZIP before clearing browser data or changing devices. Do not put real customer or confidential data into these sample workspaces.

### PWA and asset delivery

The web manifest, service worker, offline page, installation route, QR artwork and selected precached pages remain part of the site.

Current service-worker cache namespace:
davonium-site-v71-content-20261127-r2

The shared stylesheet and new Knowledge Centre/Insights pages are included in the service-worker precache list. The cache namespace is rotated when release assets change to reduce stale-PWA behaviour.

### Enquiries, Supabase and private administration

The public enquiry browser configuration uses a Supabase publishable key. The _headers Content Security Policy allows the exact project origin:
https://jaswikaaecfgqrxooubv.supabase.co

Never place a Supabase service-role key, secret key, database password, mail-provider secret or other privileged credential in public assets.

The contact and Project Builder clients call the submit-enquiry Edge Function. Their successful live submission and persistence still require browser-level end-to-end verification. The private Admin Lead Desk is a separate authenticated application; its previous browser “Failed to fetch” sign-in issue has not been declared resolved or production-tested by this V71 visual/content release. Do not weaken RLS or expose private lead data.

## Source validation

A GitHub Actions workflow, .github/workflows/validate-main.yml, runs on pushes to main. It checks:

- JavaScript syntax for the Forge engine, Knowledge Centre search and service worker.
- Required corporate routes, eight demo routes and five workspace routes.
- Presence of Forge autosave, IndexedDB media, undo/redo, JSON import/export, ZIP export and attribution markers.
- Presence of the versioned V71 CSS and service-worker cache key.
- 220 glossary terms and six Insights articles.
- Knowledge Centre and Insights sitemap entries.
- Resource navigation across principal pages, documentation guides, demos and workspaces.
- All nine CSP policy entries for the exact Supabase project origin.

The last confirmed successful run at the time of this README revision should be checked from the latest Actions tab. The workflow is re-run after every main-branch push; do not assume a new commit has already passed.

## Release checks still required

The following are not proven by source inspection or GitHub Actions alone:

1. Confirm Cloudflare Pages deployed the latest main commit and the custom domain is serving it.
2. Open the homepage and every principal corporate route on an actual phone and desktop.
3. Check navigation, menu behaviour, text wrapping, images, forms, buttons, footer and social-share previews.
4. Test all eight demos and all five Forge workspaces in a browser.
5. Test Forge persistence after reload, media upload, undo/redo, JSON import/export and unzip the generated ZIP to verify its contents.
6. Submit a real low-risk enquiry and confirm it is saved in Supabase and appears only in authorised views.
7. Test private Admin authentication separately; verify invitation, redirect, sign-in and lead permissions without exposing private data.
8. Check PWA install, update and offline behaviour on a real device.
9. Review live performance, accessibility and Core Web Vitals before claiming performance targets.

## Social sharing and advertising

The site exposes social links and share actions, page titles, canonical URLs, Open Graph/Twitter metadata and a sitemap. This does not set up Meta Business Manager, advertising accounts, campaigns, billing, audience targeting or ad spend. Review actual Facebook/Instagram link previews after Cloudflare deploys the current commit; do not advertise routes that have not been confirmed live.

## Operating rule

Keep production source on main as requested. Record direct commits, run validation, verify the hosting deployment, and test the real public pages. Never describe a source-only update as a completed live deployment.

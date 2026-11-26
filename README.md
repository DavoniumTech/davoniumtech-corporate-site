# Davonium Technologies — Corporate Website (V70)

The repository root is the static website document root for the Davonium Technologies public corporate website.

## Production

- Website: https://www.davoniumtech.com/
- Production branch: `main`
- Hosting: Cloudflare Pages
- Root directory: `/`
- Build command: none (static HTML, CSS and JavaScript)
- The connected Pages project should publish commits from `main`.

## V70 site-wide design direction

V70 carries the owner-approved visual direction across the corporate website: deep navy, silver-toned motion and surfaces, white typography, restrained cyan highlights, clear calls to action, and a calmer information hierarchy. The homepage has a dedicated new hero composition with DVNM Bot, an illustrative mobile site preview and a Business Launch Kit pathway. The shared V70 design rules also apply to the existing About, Services, Products, Pricing, Work, Business Launch Kit, Contact, Support, Project Builder, Install, Demo Studio, workspace, documentation and legal page families through the shared corporate stylesheet.

The redesign is progressive: it preserves existing page content, page routes, enquiry form behaviour, PWA features, DVNM Bot controls, QR assets, and the independent identities of the eight demo experiences. It does not replace functioning features with static mockups.

## Company structure and product boundaries

Davonium Technologies operates two distinct divisions:

1. **Digital Solutions** — client services including websites, web applications, mobile apps, custom software, business systems, automation, digital presence and delivery support.
2. **Commercial Software Products** — Davonium-owned software products with their own product goals, roadmaps and customer environments.

Product boundaries shown in public company content:

- Ready2Go Learning — learning and exam-preparation product in development.
- Marvel Chat — communication product with an initial build and active development.
- DVNM TradeFlow — separate wholesale and distribution software initiative in development, with its own product architecture, database, deployments and customer environment.
- Davonium Nexus — Davonium's private internal operating system and command centre. It is not presented as a customer-facing SaaS product and is separate from TradeFlow.

Product availability and feature status must remain truthful. Do not publish release dates, customer outcomes, testimonials, performance figures or pricing that have not been approved and verified.

## Public site map

- Corporate: Home, About, Services, Products, Pricing, Work, Contact, Support, Install.
- Business Launch Kit: industry-tailored online presence and launch materials.
- Guided Project Builder: structured enquiry brief and contact handoff.
- Demo Studio: eight independent demonstration experiences — business, commerce, creative, learning, technology, marketing, community and showcase.
- Workspaces: five illustrative product-specific workspace previews.
- Documentation and legal pages: product guides, engineering guides, privacy, cookies and terms.

Demo and workspace sample data must continue to be labelled as illustrative/local-only where applicable. It must not be represented as customer records or live production business operations.

## Backend and form boundaries

The contact form and guided project enquiry use the configured Supabase project and the `submit-enquiry` Edge Function for enquiry persistence. The browser configuration uses a publishable key only. Never place service-role keys, Supabase secret keys, database passwords, mail-provider secrets or other credentials in public repository files.

The private Admin Lead Desk is a separate authenticated area. This V70 public-site visual release does not claim to resolve or validate the outstanding browser sign-in issue. Do not weaken row-level security or expose private lead data to make a visual change.

## Pricing and Business Launch Kit

Public package prices remain unapproved and are intentionally shown as quote-led until Davonium approves the figures and scope. Keep inclusions, exclusions, revisions, hosting/domain costs and ongoing service boundaries clear.

## PWA and site quality

Preserve the web manifest, service worker, offline page, installation route, QR artwork, route redirects, security headers, theme control and accessible mobile navigation. Rotate the cache namespace when shared assets change so visitors can receive the latest stylesheet and scripts.

## Deployment and release verification

A GitHub commit on `main` is the source update; it does not, by itself, prove Cloudflare Pages has deployed the commit. After a release:

1. Confirm the Cloudflare Pages deployment corresponds to the latest `main` commit.
2. Open the homepage and every principal corporate route on desktop and mobile.
3. Test menu navigation, CTA destinations, the Business Launch Kit, project builder, contact submission, support links and product status links.
4. Check all eight demo destinations, workspace previews, documentation, legal routes and 404/offline behaviour.
5. Test the PWA install prompt and service-worker cache update.
6. Confirm forms persist enquiries and never expose private records.
7. Record any browser/device failures rather than claiming untested functionality as production-ready.

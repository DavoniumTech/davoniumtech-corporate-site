# Davonium Technologies — V72 Conversion-First Redesign Brief

**Prepared:** 28 November 2026  
**Status:** Working implementation brief; not approved for production deployment  
**Production baseline:** `main` at `54f139a3bf014c87a79807e23f5d4ce59dcac842` (V71)  
**Design branch:** `redesign/conversion-first-20261128`  
**Safety backup:** `backup/pre-redesign-v71-20261128`

## 1. Objective

Turn the corporate website into a clear, credible, conversion-focused front door for Davonium Technologies. A new visitor should quickly understand what the company builds, see relevant examples, understand how to engage, and contact the team without friction.

This is not a blank rebuild. Preserve verified company information, the brand identity, useful product and demo experiences, and working technical foundations. Replace or simplify the parts that create confusion, unnecessary scrolling, or unverified promises.

**Primary outcome:** qualified project enquiries from businesses and organisations.

**Secondary outcomes:** product discovery, credible technical reputation, repeat visits to useful resources, and international enquiries where the project is a fit.

## 2. Source baseline and guardrails

The connected public repository is `DavoniumTech/davoniumtech-corporate-site`. The current default branch is `main`. The current README identifies V71, dated 27 November 2026, as the latest source release.

V71 is a static HTML/CSS/JavaScript website hosted through Cloudflare Pages, with a Supabase Edge Function for public enquiries. It includes eight Demo Studio experiences, five DVNM Forge workspaces, a PWA, Knowledge Centre and Insights pages.

**Do not:**
- Push redesign work directly to `main` before preview and acceptance checks.
- delete existing routes or content without mapping redirects and preserving useful search value;
- claim a demonstration is a production application or that sample records are real customer data;
- fabricate testimonials, client logos, project outcomes, statistics, performance results, or launch dates;
- publish prices, delivery times, payment options, or features until the owner approves them;
- expose Supabase service-role/secret keys, weaken RLS, or expose private lead records;
- state that a GitHub check proves the live site was deployed or browser-tested.

The current main branch is not protected. Keep work on the dedicated redesign branch and use a Cloudflare preview or other isolated preview before release.

## 3. Brand and visual direction

Keep Davonium recognisable:
- Primary identity: deep navy, silver, white and cyan.
- Atmosphere: premium, precise, calm, modern, technology-led; restrained light effects and subtle star/signal details rather than excessive glow.
- Typography: one coherent type system with deliberate hierarchy and readable body copy.
- Layout: strong editorial composition, generous spacing, disciplined cards, clear content widths, predictable alignment.
- Motion: purposeful and restrained; obey `prefers-reduced-motion`.
- Themes: dark default with a fully readable optional light theme, persisted across pages.
- DVNM Bot: preserve approved full-body white/satin-silver/cyan artwork in a deliberate showcase. Do not turn it into an overlapping floating chat head or let it obscure the headline, CTA or mobile content. Audio must be user initiated; mouth animation must be tied to genuine speech.
- Footer social links: icons with accessible labels; keep contact information separately readable.

The goal is a coherent corporate visual system, not a different unrelated style on every corporate page. Independent Demo Studio products may retain distinct visual identities.

## 4. Information architecture

### Primary navigation

Reduce the current 12-link primary navigation to a compact set, for example:
1. Solutions
2. Products
3. Work / Demo Studio
4. About
5. Contact

Use one unmistakable primary CTA such as **Start a project** or **Request a quote**. Move Install, Knowledge Centre, Insights, detailed documentation, policies and secondary resources into contextual links and the footer. Do not hide important customer paths behind ambiguous labels.

### Corporate page roles

- **Home:** concise company proposition, key services, selected examples, product status, trust signals and repeated project CTA.
- **Solutions / Services:** organise offerings by customer problem and business outcome, not a long undifferentiated catalogue.
- **Pricing:** approved starting prices or transparent “quote required” categories, clear inclusions/exclusions, and direct quote links.
- **Work:** real client case studies only when evidence and permission exist; separately label Davonium-owned demos and internal product work.
- **Products:** clear product audience, purpose, status and next step.
- **About:** the company, practical principles, who it serves, how work is delivered, and accurate company/contact details.
- **Contact:** short, reliable enquiry route, WhatsApp and email alternatives, privacy explanation, and clear confirmation/error states.
- **Demo Studio:** a dedicated catalogue for all eight independent demos.
- **DVNM Forge:** five separate local/sample workspaces, clearly labelled as browser-local and not connected to live customer records.
- **Resources:** retain useful documentation, glossary and original articles, but keep them secondary to commercial conversion.

## 5. Homepage conversion sequence

The homepage should answer five questions quickly: What does Davonium do? Who is it for? What can it build? Why should I trust it? What do I do next?

Recommended page sequence:
1. **Hero:** a clear customer-facing proposition, concise supporting copy, primary project CTA and secondary exploration CTA. Preserve the approved brand promise, including “Digital Products, Engineered for Impact.” and “Useful Technology, Built with Care.” where they add clarity.
2. **Capability summary:** three or four grouped offers, each linked to the right service detail.
3. **Selected demonstrations:** feature a small number of representative examples on the homepage; link to the full eight-experience Demo Studio rather than placing every detail on the homepage.
4. **Why Davonium / delivery approach:** practical differentiators such as clear scope, accessible responsive engineering, careful testing, documentation and support—only where these are genuinely delivered.
5. **Products:** show the current product family with honest development labels and separate product boundaries.
6. **Proof / work:** real evidence where available; otherwise label internal products and demonstrations accurately.
7. **Final project CTA:** short invitation to describe the project, with WhatsApp as an alternative.
8. **Compact footer:** company, services, resources, policies and social/contact details.

Keep the long-form technical resources and all eight full demos available on their own pages. The homepage should not need to explain every company initiative in full.

## 6. Services and offers

Group the current service catalogue into customer-friendly pillars:
- **Websites and digital presence:** corporate websites, landing pages, product sites, catalogues, PWA experiences and SEO foundations.
- **Custom software and applications:** web applications, portals, dashboards, mobile application experiences and business systems.
- **Workflow automation and integrations:** operational workflows, APIs, reporting, notifications and data connections.

Keep documentation, interface refinement, deployment, maintenance and technical SEO as supporting capabilities or add-ons rather than making all ten existing categories compete equally for attention.

Each main service should explain:
- the customer problem it solves;
- who it suits;
- concrete deliverables;
- what is excluded or requires separate scope;
- a relevant demonstration, clearly labelled as a demonstration;
- how to start a discussion.

The Business Launch Kit remains a practical, industry-tailored offer. State its deliverables and exclusions plainly.

## 7. Pricing and commercial clarity

The current five package records are present, but `priceNGN` and `priceUSD` are `null` for all packages. The page correctly says that prices are awaiting approval. The currency selector changes the preferred quotation currency; it must not be presented as a live exchange-rate converter.

Before publishing numeric prices, obtain owner approval for:
- package names and starting amounts/ranges;
- included page counts, design scope and revisions;
- domain, hosting, email, maintenance, printing and third-party costs;
- CMS, payment integration, booking, custom backend and app-store scope;
- deposit/milestone rules, delivery assumptions and quote validity.

A quote should document deliverables, dependencies, exclusions, revision allowance, expected schedule, payment milestones and handover. Use “from” prices only when the stated scope is genuinely achievable at that price. Keep custom projects quote-led.

## 8. Lead capture and Supabase

The current contact and Project Builder clients call the `submit-enquiry` Supabase Edge Function using a browser publishable key. The function checks allowed origin, input bounds, a honeypot, required consent, rate limiting and inserts into `leads`, then attempts activity and notification inserts. Email notifications are optional and depend on separately configured Resend secrets.

**Critical acceptance checks before promoting the form as live:**
1. Confirm the deployed Edge Function has the expected environment variables and rate-limit RPC.
2. Submit a harmless test enquiry from the deployed custom domain.
3. Confirm the lead record is saved exactly once.
4. Confirm lead activity and notification records are created and inspect failures rather than assuming they succeeded.
5. Confirm only authorised administrators can read the lead and related records.
6. Confirm the owner receives the intended notification (in-app and/or email) if configured.
7. Confirm invalid submissions show a useful error; do not show success unless the server confirms saving.
8. Confirm the form works on a real Android phone and desktop browser.

The contact client currently refuses to submit until a cookie preference has been saved, even though optional analytics and marketing scripts are currently not installed. This is unnecessary friction for a person trying to contact the company. Review the consent logic so that required privacy consent for the enquiry is handled directly by the form, and optional analytics/marketing consent never blocks a basic enquiry.

Add source attribution to enquiries: landing page, referrer, UTM source/medium/campaign and enquiry channel, without collecting unnecessary personal data. The Edge Function already has fields for several attribution values; ensure the browser clients actually send them.

Keep a visible alternative route to WhatsApp and the company email if the form is unavailable. Do not silently discard failed submissions.

## 9. Admin lead handling

The private Admin Lead Desk is separate from the public site. Its V71 documentation says the previous browser “Failed to fetch” sign-in issue has not been declared resolved or production-tested.

Test this separately from public form submission:
- Supabase Auth endpoint reachability from a normal mobile browser;
- login, session refresh, logout and redirect behaviour;
- active admin membership verification;
- RLS read access to leads, notifications and activity;
- safe status changes and activity notes;
- no anonymous/private data leakage.

Do not weaken RLS or use a service-role key in browser code to make the dashboard “work”. If the Admin Lead Desk is not reliable, temporarily use an authorised existing owner workflow while fixing it safely.

## 10. Analytics and growth measurement

There are currently no analytics or marketing trackers installed according to the README. Begin with privacy-conscious, low-overhead measurement. Cloudflare Web Analytics is a candidate for aggregate page and performance insights; it is described by Cloudflare as privacy-first and not collecting visitors’ personal data. Confirm the actual account configuration and privacy notice before enabling.

Measure meaningful actions, not just page views:
- project CTA clicks;
- WhatsApp clicks;
- contact form starts and successful submissions;
- Project Builder completions;
- demo visits;
- product enquiries.

Do not count a click as a completed lead. The saved enquiry record is the conversion source of truth. Review Search Console queries, indexing, landing pages and Core Web Vitals. Avoid claims of SEO ranking or traffic growth until measured.

## 11. SEO, content and discoverability

Current strengths include canonical URLs, page metadata, JSON-LD organisation/site/product descriptions, robots.txt and a sitemap. Keep these foundations and improve accuracy.

Audit findings:
- The homepage metadata declares V70 even though the repository README identifies V71. Synchronise the release metadata deliberately.
- The sitemap currently contains 79 URLs; the Business Launch Kit HTML route is not listed. Check all public canonical routes and ensure route/index-page URL normalisation is correct.
- Several sitemap `lastmod` entries remain 3 November 2026 even though the site has subsequently changed. Update only pages whose content materially changed; do not bulk-update dates as a freshness signal.
- Preserve useful URLs and use redirects for any intentional route changes.
- Give every priority landing page a unique, descriptive title, meta description, one clear H1, meaningful internal links, relevant alt text and accurate Organization/Service/Product structured data.
- Retain the 220-term Knowledge Centre and six Insights articles only where the content is useful, accurate and original. Consolidate thin or repetitive material rather than expanding the page count to chase rankings.
- Use the verified Search Console property to inspect indexing, sitemap processing, search queries, page experience and manual actions.

Search visibility is not guaranteed by a redesign. Google's guidance prioritises useful, original, people-first content and a satisfying page experience.

## 12. Performance, accessibility and security

There is not yet a verified live PageSpeed or real-device Core Web Vitals result in the repository. Do not claim a speed score or target is achieved until measured.

Measure the key pages on mobile and desktop. Use Google's good Core Web Vitals targets as engineering goals:
- LCP within 2.5 seconds;
- INP below 200 milliseconds;
- CLS below 0.1.

Review the layered historical CSS/JS system before removing anything. The homepage currently loads multiple versioned style layers, and the repository has many legacy versioned CSS files; this is maintainability risk, not proof by itself of a slow page. Simplify duplicate work carefully and confirm every route still renders.

Accessibility acceptance:
- keyboard operation for navigation, dialogs, forms, filters and demos;
- visible focus indicators and sensible heading order;
- labels and helpful inline validation for all form fields;
- adequate contrast and no clipped text at narrow widths;
- reduced-motion behaviour;
- meaningful alt text and accessible icon labels;
- no important content hidden behind hover-only interactions.

Security acceptance:
- retain a restrictive script CSP and exact Supabase `connect-src`;
- current `style-src` still allows `'unsafe-inline'`; inventory and migrate inline styles before considering its removal;
- never expose privileged Supabase credentials;
- preserve origin validation, rate limiting, honeypot and server-side validation;
- do not cache private admin/auth pages or lead data in the service worker.

## 13. Product and demo boundaries

Keep product statuses explicit:
- Ready2Go Learning — in development; do not publish a launch promise or public entry route until approved.
- Marvel Chat — initial build / active development; link only to a stable public experience and describe its maturity honestly.
- DVNM TradeFlow — distinct wholesale/distribution commercial product initiative with its own architecture and customer environment.
- Davonium Nexus — private internal company command centre; not a public customer SaaS offering.

Keep the eight independent demos: Biz, Market, Creative, Skills, Digital, Growth, Connect and Showcase. Preserve their different purposes and visual identities. Clearly identify them as demonstrations.

Keep five DVNM Forge workspaces: Biz, Market, Creative, Skills and Digital. Their current data is stored in the browser/device through local storage and IndexedDB; they are not cloud workspaces or production customer systems. State this before users enter them and on relevant export/import screens.

## 14. Release acceptance checklist

### Source and deployment
- [ ] Work remains on the redesign branch until reviewed.
- [ ] Main branch is unchanged by redesign commits.
- [ ] GitHub Actions static validation passes on the candidate commit.
- [ ] Cloudflare preview deploy is identified and checked.
- [ ] The production deployment commit is verified before announcement.

### Commercial journey
- [ ] Homepage explains the company and primary service offer quickly.
- [ ] Primary CTA is obvious on desktop and mobile.
- [ ] Pricing text and any numeric amounts are owner-approved.
- [ ] Contact form succeeds and records a real test enquiry.
- [ ] Failed form submission has a useful fallback and no false success.
- [ ] Project Builder passes a full test from beginning to saved enquiry.
- [ ] WhatsApp and email actions open the right destination.

### Content, routes and products
- [ ] No important existing route is silently lost.
- [ ] All eight demos load and navigate independently.
- [ ] All five Forge workspaces load and explain local-only behaviour.
- [ ] Product status is current and not exaggerated.
- [ ] Case studies contain only verifiable work and approved proof.
- [ ] Sitemap, canonical URLs, metadata and redirects are checked.

### Quality
- [ ] Mobile viewport checks on a real Android device.
- [ ] Desktop viewport and keyboard checks.
- [ ] No clipped headings, broken images, horizontal overflow or overlapping controls.
- [ ] Reduced-motion and theme controls work.
- [ ] Browser console and network errors reviewed.
- [ ] PageSpeed/Core Web Vitals measured; no unverified performance claims.
- [ ] Private admin authentication and RLS tested separately.

## 15. Access, backend and deployment verification

The GitHub connection can read and write to the corporate repository; the V71 backup and redesign branches exist. The Supabase connection is now active and the website's configured project has been inspected.

The two shared ChatGPT conversation URLs supplied for the earlier website plan could not be retrieved as readable transcripts in this session. Their exact approved decisions must be incorporated before treating the design brief as a complete transcription of that plan. The AI discussion link is intentionally out of scope for this phase.

Cloudflare account/deployment access is still not connected. The production Pages deployment and preview URL must be verified separately.

### Supabase audit — 28 November 2026

The website's public browser configuration points to project ref `jaswikaaecfgqrxooubv`, whose current Supabase project name is **`davonium-corporate-staging`**, region `eu-west-1`, database PostgreSQL 17.12, status `ACTIVE_HEALTHY`. The deployed website therefore sends public enquiries to a project explicitly named staging. Before announcing the site or changing any credentials, confirm that this is intentionally the live lead destination. Do not silently replace it; switching projects requires a production data, backup, Auth, function, redirect and DNS/configuration plan.

Verified backend facts:
- The deployed `submit-enquiry` Edge Function is ACTIVE, version 1, with `verify_jwt=false`. The deployed source retrieved from Supabase matches the repository's `supabase/functions/submit-enquiry/index.ts`.
- This function is intentionally public because a visitor does not need an account to enquire. Its handler still enforces allowed browser origins, POST-only behaviour, a 16 KB request size limit, required fields, privacy consent, a honeypot and a database-backed IP-hash rate limiter. The limiter permits up to five requests per 15-minute window and removes old records after 30 days. Origin checks/CORS are not authentication because non-browser clients can forge an Origin header; server-side validation and rate limiting remain essential.
- Public tables `admin_users`, `leads`, `lead_activities`, `customers`, `projects`, `project_milestones`, and `notifications` all have RLS enabled. The policies inspected use `auth.uid()` and an active `admin_users` membership, with role-specific access for leads, activity, customers and project operations. No anonymous SELECT grant was found for these tables.
- Supabase Auth contains one user with a confirmed email, a recorded sign-in, no active ban, and one active `owner` membership in `admin_users`. This verifies the membership record exists, but it does not replace a fresh browser login test.
- The current database reports zero rows in `leads`, `lead_activities`, and `notifications`. The available recent Edge log window showed no invocation of `submit-enquiry`. Consequently, a live end-to-end public form submission has **not** been verified.
- The private `enquiry_rate_limits` table has RLS disabled, and Supabase's security advisor labels this critical. Additional privilege checks show `anon` and `authenticated` lack USAGE on schema `private` and have no direct table privileges; `service_role` has the required table privileges. The `consume_enquiry_rate_limit(text)` function is SECURITY INVOKER, has an empty search path, and execute privilege is restricted to `service_role`. This materially reduces direct API exposure compared with the advisor's generic warning, but RLS remains recommended defense-in-depth. **Do not auto-apply** the advisor's SQL. Supabase explicitly warns that enabling RLS without a deliberate policy can block access; review the service-role execution model and then decide whether to apply `ALTER TABLE private.enquiry_rate_limits ENABLE ROW LEVEL SECURITY;`.
- The security advisor also reports **Leaked Password Protection Disabled**. Enable Supabase Auth's compromised-password protection after reviewing the Auth settings and the impact on future sign-ups/password changes.
- The performance advisor lists 12 unused indexes. This is a newly created staging project with very little traffic; do not drop indexes based on this early observation.
- Two migrations are recorded in Supabase (`20261125231258` / `20261126120000_launch_platform_foundation`, and `20261125233416` / `20261126124500_role_scoped_access_and_security`), but the Git repository currently contains no SQL migration files. Export/version the database schema and RLS definitions into the source repository before ongoing production maintenance.

### Edge Function behaviour that needs correction

The current handler checks the primary `leads` insert, but does not check the returned errors from the `lead_activities` and `notifications` inserts. It returns a successful enquiry response even if either side-effect insert fails. The Resend notification is optional; the code also does not inspect the HTTP response's `ok` status. The next implementation should make the lead record the durable source of truth, check/log every side effect, and provide a dependable owner notification/retry path. Prefer a transaction-backed database operation for related records if they must always be created together. Do not tell a visitor an email was sent unless the provider confirms it.

The function's use of `SUPABASE_SERVICE_ROLE_KEY` is server-side only in the deployed Edge Function source; no service-role key is present in the public browser configuration. The connector did not expose Edge Function secrets for inspection, so the presence/configuration of optional Resend secrets has not been verified.

### Required live verification

1. Submit one clearly labelled test enquiry from the actual custom domain, after confirming this staging project's intended role.
2. Confirm exactly one lead row is created; confirm matching activity and notification rows.
3. Confirm the owner receives the agreed notification; verify Resend delivery only if the email secrets are configured.
4. Confirm the admin lead desk can sign in in a fresh desktop and Android browser, verify the active owner membership, read the lead, and update its status.
5. Confirm anonymous API requests cannot read or modify lead records.
6. Remove any test lead/activity/notification through the authorised admin workflow after the test, or clearly retain it as a labelled QA record.
7. Confirm rate limiting and CORS behaviour without relying on forged-origin checks as the only anti-abuse control.

## 16. Next implementation order

1. Import the owner-approved decisions from the two earlier website planning chats.
2. Lock homepage copy, navigation and commercial offers.
3. Build the shared corporate design system and conversion-first homepage.
4. Align Services, Pricing, Work, Products and Contact pages with the new journey.
5. Remove enquiry friction and add attribution while retaining server-side validation.
6. Review navigation, resource placement, product/demo boundaries and responsive layouts.
7. Update metadata, sitemap, cache strategy and accessible states.
8. Run source validation, browser QA and real form/admin tests.
9. Review the preview with the owner, then merge/publish only after acceptance.

**Release rule:** a redesigned source branch is not the same thing as a published, tested website. Announce the new corporate site only after the candidate has passed the checks above.

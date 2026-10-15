# Davonium Technologies

**Useful technology, built for real needs.**

We are Davonium Technologies, an independent technology company developing digital products for students and everyday users and building practical websites and web tools for small businesses. This repository contains our public company website, product information, support routes, and documentation.

## What we publish

- **Company information:** who we are, how we work, and how to contact us.
- **Products:** Ready2Go Learning, Marvel Chat, and Davonium Nexus, with current public status.
- **Services and work:** website and web-tool delivery, scope, and handoff information.
- **Public documentation:** standalone guides covering products, web engineering, PWA installation, offline behaviour, privacy, security, search discovery, and support.
- **Installable website:** a browser-controlled Progressive Web App experience on compatible devices.

## Current product status

- **Ready2Go Learning — In development.** We are building a learning and exam-practice experience for JAMB candidates and students.
- **Marvel Chat — Built; active development.** The initial product build exists; testing, refinement, and ongoing development continue.
- **Davonium Nexus — In development.** We are building a workspace for clearer project visibility, deliverables, and client handoff.

These labels reflect current status and do not promise that unfinished features are generally available. We update the public pages when a verified release changes a product’s status.

## How this website works

We publish standalone HTML pages styled by shared CSS and enhanced with vanilla JavaScript. The source does not require Node.js, npm, React, Vite, or a build step. Core content and routes are present in HTML; the documentation search is a client-side filter over ordinary links.

The theme follows the visitor’s system appearance until the visitor explicitly chooses light or dark mode. We use modest scroll reveals, respect reduced-motion preferences, and provide fallbacks for optional browser features.

## Installation and offline behaviour

On compatible browsers, you can install our website as a Progressive Web App. Installation and icon shaping are controlled by the browser and operating system; this website is not a native Android APK. The service worker caches essential files first and pages after successful visits. Cached pages can sometimes reopen offline, while first-time uncached routes and external product links still need a connection.

## Search and AI discovery

We maintain page-specific titles and summaries, self-referencing canonical URLs, visible crawlable links, appropriate structured data, `robots.txt`, `sitemap.xml`, `llms.txt`, and `llms-full.txt`. We permit relevant public crawlers, including OAI-SearchBot for ChatGPT search discovery. These signals help services understand our public content but do not guarantee crawling, indexing, ranking, citation, or inclusion in a generated answer.

## Public routes

- Website: https://www.davoniumtech.com/
- Products: https://www.davoniumtech.com/products
- Documentation: https://www.davoniumtech.com/docs/
- Search and indexing guide: https://www.davoniumtech.com/docs/guides/seo-discovery
- AI discovery guide: https://www.davoniumtech.com/docs/guides/ai-discovery
- Public machine-readable overview: https://www.davoniumtech.com/llms.txt
- Expanded public guide: https://www.davoniumtech.com/llms-full.txt
- Contact: https://www.davoniumtech.com/contact
- Support: support@davoniumtech.com
- Repository: https://github.com/DavoniumTech/davoniumtech-corporate-site

## Deployment

We deploy the site root as the Workers Static Assets directory using `wrangler.jsonc`. Our Cloudflare configuration uses `auto-trailing-slash` HTML handling and a custom 404 page. Internal links use the corresponding clean routes. `DEPLOY-WINDOWS-CMD.txt` contains the Windows CMD release workflow.

We review the repository, actual deployment result, direct page routes, mobile layout, install behaviour, documentation search, and offline recovery before treating a release as complete. A successful Git push is not, by itself, confirmation that production deployment succeeded.

## Privacy and policy status

Our privacy, terms, and browser-storage pages remain draft policy text. We will treat them as final only after checking them against the actual production data flows and applicable legal requirements. The contact form prepares an email in the visitor’s email application; it does not create a server-side support ticket.

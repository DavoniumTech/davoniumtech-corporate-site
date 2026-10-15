# Davonium Technologies

**Useful technology, built for real needs.**

Davonium Technologies is an independent technology company building digital products for students and everyday users, while helping small businesses present their work clearly online. This repository contains the company website: our profile, product information, services, support routes, and public documentation.

## What visitors can find here

- **Company:** who we are, how we work, and how to contact the team.
- **Products:** current information on Ready2Go Learning, Marvel Chat, and Davonium Nexus, with each product’s development status stated plainly.
- **Services:** responsive website design and development, web-app experiences, and practical discovery foundations.
- **Support and documentation:** guides for visitors, customers, and project collaborators.
- **Installable website:** on compatible devices, a visitor can add the company website to the home screen or apps list.

## Product status

- **Ready2Go Learning — In development.** A learning and exam-practice product for JAMB candidates and students.
- **Marvel Chat — Built; active development.** The initial product build exists; work continues on refinement, testing, and reliability.
- **Davonium Nexus — In development.** A workspace being built to make project progress, deliverables, and customer handoff easier to follow.

These labels describe the current stage of work. They are not a promise that every feature is complete or available to every visitor. The Ready2Go Learning icon in company product cards and its documentation guide is sourced from the Ready2Go Learning app project.

## Website technology

The site uses standard HTML, CSS, and vanilla JavaScript. It does not require Node.js, npm, a framework, or a compilation step. The code is designed to remain understandable and straightforward to maintain.

The website includes responsive layouts, a mobile navigation menu, system-default light/dark appearance with an optional saved visitor choice (the theme control can return to system appearance), accessible focus styling, a documentation search helper, page metadata, structured data, an XML sitemap, a social-preview image, and a service worker for caching selected content after an online visit.

### Installation

This site is a **Progressive Web App (PWA)**, not an Android APK or a native app-store package. On compatible devices, visitors can use the browser’s install option or follow the instructions on `install.html`. The browser and operating system decide whether to show an install prompt.

Offline access is limited to pages and assets that have been cached successfully. Product links, email handoff, and other online services may still require an internet connection.

## Contact

For general enquiries, use the contact page or email **support@davoniumtech.com**. The static contact form opens a prepared message in the visitor’s email application; it does not create a server-side support ticket.

Website: https://www.davoniumtech.com/

## Deployment

Follow `DEPLOY-WINDOWS-CMD.txt` for the Windows Command Prompt workflow. The documented GitHub repository for this company site is: `https://github.com/DavoniumTech/davoniumtech-corporate-site`. Confirm the Git remote before copying files, use a separate update branch, inspect the change summary, and review the preview before merging into the production branch.

Do not copy this site into the Ready2Go Learning or Marvel Chat repositories. A product site has its own routes, assets, and deployment configuration.

## Search and AI discovery

The site provides crawlable page links, meaningful page titles and descriptions, canonical URLs, structured data, `robots.txt`, `sitemap.xml`, and a concise `llms.txt` summary. These give search engines and compatible AI retrieval systems clearer public information about the company and products. They cannot force a system to crawl, index, mention, or recommend the site. Keep product descriptions current and make sure the production domain is reachable.

## Review before release

Privacy, terms, and browser-storage policy pages are working drafts and should be checked against actual production behaviour and applicable legal requirements before they are presented as final legal advice. Verify product links and all phone/contact details before publishing.

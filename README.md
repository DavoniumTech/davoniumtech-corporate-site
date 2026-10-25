# Davonium Technologies Website - V41 Deployment Hotfix

Complete static website source for [www.davoniumtech.com](https://www.davoniumtech.com/). This package retains the company site, products, services, documentation, PWA files, and all seven independent DVNM sample website experiences.

## V40 visual and usability release (site content preserved in V41)

- One consolidated V40 design-system stylesheet, loaded after the functional page styles.
- Explicit light and deep multi-tone dark palettes with readable foregrounds, colourful section tints, restrained glowing star points, and a transparent city-grid hero scene.
- Responsive navigation and touch-friendly actions down to 320px wide screens.
- Robot uses transparent SVG body/head layers in a relaxed arms-down pose, a dark face display with visible pupils, eye blink, mouth motion while speech is active, head nod, and chest glow. The floating shortcut is a compact avatar; opening it gives the topic/voice card.
- Seven independent demo themes: DVNM Biz, Growth, Market, Creative, Skills, Digital, and Connect. Each has navigation to previous/next and the complete directory.
- Seven separate, downloadable showcase PDFs with a unique colour identity and QR route. They describe sample design demonstrations and explicitly do not claim accreditation or commissioned client work.
- New service worker cache name `davonium-site-v40-contrast-colourful-mobile-20261025`; versioned CSS/JS URLs are updated, and HTML requests revalidate.
- No external font library, animation library, or large JavaScript framework is required.

## Deploy on Windows

1. Download the complete ZIP and extract it into a new folder.
2. Double-click `DEPLOY-V41-WINDOWS.cmd`, or run it from Command Prompt. Keep `Deploy-V41.ps1` next to the CMD file.
3. The script checks the site source, uses only the expected GitHub remote and `main` branch, reuses only a clean checkout (otherwise cloning to a new folder), creates local and remote backups, stages the whole site, and asks you to type `Y` before commit/push. It never force-pushes. Git whitespace validation treats CRLF line endings correctly and excludes generated PDF certificates from text whitespace checks; PDF presence is verified separately.
4. Check the `SUCCESS: V41 commit is verified on GitHub main.` message, then check Cloudflare Pages/Workers deployment status. Refresh the published site using `Ctrl+F5`. A previously installed PWA may update after the new service worker activates.

## Sample website certificate PDFs

Individual PDFs are located in `demos/certificates/`. Each demo page links to its own PDF. These documents confirm only the existence of an illustrative website demonstration; they are not professional qualifications, accreditation, client endorsements, or proof of commissioned deliveries.

## Quality checks

This package is checked for local HTML references and anchors, HTML IDs, script syntax, stylesheet parsing, SVG XML, sitemap validity, service-worker cache version, and deployment script references. A real-device interaction test and a live Cloudflare deployment check require the deployed site and device; static checks do not substitute for those.

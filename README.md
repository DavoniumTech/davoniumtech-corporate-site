# Davonium Technologies website and PWA

**Canonical website:** https://www.davoniumtech.com/  
**Support:** support@davoniumtech.com  
**Gmail:** davoniumtech@gmail.com  
**Phone:** +234 707 260 4426  
**WhatsApp:** +234 803 207 6924

## Included

- Responsive company pages: Home, About, Products, Services, Our Work, Contact, Support, and Install.
- 38 standalone documentation guides with real HTML URLs and client-side filtering that does not hide the underlying links from crawlers.
- Page-specific titles, descriptions, canonicals, Open Graph/Twitter metadata, Organization/WebSite JSON-LD, robots.txt, and sitemap.xml.
- PWA manifest, 192px/512px icons, service worker, offline fallback, custom 404 page, and a first-visit optional installation invitation.
- Responsive mobile navigation, light/dark themes, focus styling, reduced-motion support, and a contact form that prepares an email instead of pretending to create a ticket.

## PWA install behaviour

The website shows a first-visit installation invitation. The Install button invokes a browser-native prompt only when that browser has exposed one. Otherwise it explains manual installation steps. Visitors can dismiss the invitation and continue browsing. Websites cannot force-install themselves; the browser and operating system control installation and confirmation.

## Deploy on Cloudflare Pages

This is a static HTML/CSS/JavaScript site. No Node, npm, React, Vite, or build command is needed. In the existing `davoniumtech-corporate-site` Cloudflare Pages project, ensure the production output is the folder containing `index.html`. This version assumes deployment at the domain root `https://www.davoniumtech.com/`, not a nested `/ChatGPT/` path.

## Windows CMD / GitHub

1. Download this ZIP and extract it to `%USERPROFILE%\Downloads\davoniumtech-website-upgrade`.
2. Open CMD and go to your existing corporate website clone (change the path if your folder is elsewhere).
3. Check the remote before copying anything. It must be the corporate website repository, not Ready2Go Learning or Marvel Chat.

```bat
cd /d "%USERPROFILE%\Downloads\davoniumtech-corporate-site"
git status
git remote -v
git switch -c website-refresh-2026
robocopy "%USERPROFILE%\Downloads\davoniumtech-website-upgrade" "%USERPROFILE%\Downloads\davoniumtech-corporate-site" /E /XD .git
git status
git add .
git diff --cached --stat
git commit -m "Upgrade Davonium Technologies website and PWA"
git push -u origin website-refresh-2026
```

Do not use `robocopy /MIR`; it can delete destination files. If Robocopy reports exit code 8 or higher, stop and review the error. After pushing, review the GitHub branch and Cloudflare preview. Merge into the configured production branch only after checking the preview and confirming which branch Cloudflare deploys.

## Search Console steps

1. Verify ownership of the domain `davoniumtech.com` in Google Search Console.
2. Confirm that `https://www.davoniumtech.com/robots.txt` and `https://www.davoniumtech.com/sitemap.xml` load successfully after deployment.
3. Submit `sitemap.xml` in Search Console and use URL Inspection for important pages.
4. Check for broken links, wrong canonical URLs, blocked pages, noindex directives, and failed routes.
5. Keep writing genuinely useful content and connecting related guides. Sitemap submission and metadata help discovery but cannot guarantee that a page will be indexed quickly or rank in a particular position.

## Review before production

- Privacy, terms, and cookies/browser-storage pages are **drafts** and require review against real production practices and qualified legal review.
- The contact form prepares an email using `mailto:`; it has no server endpoint or ticket database.
- Product statuses are conservative: Ready2Go Learning and Marvel Chat are in development; Davonium Nexus is planned. Update them when the facts change.
- This is the company site PWA. Each product site needs its own correctly scoped PWA setup if it is also to be installable.

# Davonium Technologies — Final Website Refresh

This package updates the existing Davonium Technologies company website while preserving the original Davonium D brand mark and icon set from the source project. It is a static site built with HTML, CSS, and vanilla JavaScript. No Node.js, npm, React, or build command is required.

## Included

- Company pages: Home, About, Products, Services, Our Work, Contact, Support, Install.
- A documentation hub and standalone guide pages with ordinary crawlable links. Search filtering works in JavaScript; the guide links and page content remain in the HTML.
- Responsive light/dark themes, compact mobile header, mobile navigation, keyboard focus styling, contact links, and a non-forced PWA install path.
- Corrected original brand assets, a dedicated 1200 x 630 social preview image, Open Graph metadata, and Twitter `summary_large_image` cards.
- A service worker that precaches the shipped HTML, assets, and documentation for offline reopening after a successful online visit and service-worker installation.
- Root-relative metadata and relative navigation that work at `https://www.davoniumtech.com/` and at GitHub Pages project path `https://davoniumtech.github.io/davoniumtech-website/`.
- The old personal email address has been removed from the public site. Public email contact is `support@davoniumtech.com`.

## Product status wording

- **Ready2Go Learning:** in development; aimed at JAMB candidates and students.
- **Marvel Chat:** initial product build complete; active development and refinement continue. Its live product site is the source of truth for current access and features.
- **Davonium Nexus:** planned concept.

Do not describe a prototype or in-progress capability as generally available unless that status has been confirmed. The privacy, terms, and storage policy pages are visibly labelled as drafts and still require a check against actual production practices.

## Test locally on Windows

1. Extract the ZIP to a folder such as `%USERPROFILE%\Downloads\davonium-technologies-final-website`.
2. Open `index.html` directly for a quick visual check. For testing service workers/offline installation, use VS Code with the Live Server extension; browser `file://` restrictions can prevent those features.
3. Test navigation, light/dark toggle, documentation search, product links, contact form preparation, install page, and mobile layout at 320, 360, 390, 430, 768, 1024, and 1366 pixels.
4. To test offline, first load the site over HTTP, wait for the service worker to activate, visit key pages while online, and then switch to offline mode. Some external links and the `mailto:` contact handoff still need a network or a configured email app.

## Deploy to GitHub Pages or Cloudflare Pages

Use the same package in the repository that serves the company website. Make a new branch and preview before merging to the branch configured for production. Do not copy this package into the Ready2Go Learning or Marvel Chat repository.

### Windows CMD commands

Replace the two example folder paths below with the actual folders on your PC. Extract this ZIP first. In the existing company website Git clone, verify the remote and clean working tree before copying: 

```bat
cd /d "%USERPROFILE%\Downloads\davoniumtech-corporate-site"
git status
git remote -v
git switch -c website-final-refresh-2026
robocopy "%USERPROFILE%\Downloads\davonium-technologies-final-website" "." /E /XD .git
git status
git add .
git diff --cached --stat
git commit -m "Refresh Davonium Technologies company website"
git push -u origin website-final-refresh-2026
```

If your actual local clone uses another folder name, change the first `cd` path. Confirm `git remote -v` points to the company site repository before copying. Do not use `robocopy /MIR`; it can delete existing files. If Robocopy returns exit code 8 or higher, stop and inspect the error.

After pushing, check the branch preview. Merge the branch only after verifying the published preview and confirming the correct production branch in GitHub Pages or Cloudflare Pages. If your host publishes from `main`, a separate branch will not update production until you merge it.

## Google indexing

- `robots.txt` permits crawling; key pages have `index,follow` metadata and canonical URLs pointing to `https://www.davoniumtech.com/`.
- `sitemap.xml` lists the custom-domain URLs. Use it as the sitemap for the canonical site.
- In Google Search Console, verify ownership of `davoniumtech.com`, submit `https://www.davoniumtech.com/sitemap.xml`, and use URL Inspection for the homepage, products, services, and contact page.
- Sitemap submission improves discovery but does not guarantee indexing or rankings. Keep the custom domain as the canonical public address, rather than trying to make the GitHub Pages preview and custom domain compete as separate versions.

## Security guidance

This static website deliberately does not block every visitor behind a 30-second challenge. That type of blanket interstitial harms accessibility and can interfere with search crawling. If the site is on Cloudflare, use HTTPS, standard security headers, rate controls, and a Managed Challenge only for suspicious traffic or protected endpoints. A static HTML site does not have a login or database endpoint to secure in the same way as a dynamic application.

## Honest feature boundaries

The contact form prepares an email through the visitor's email application; it does not store submissions in a server-side ticket system. The install prompt is browser-controlled and optional. Offline pages and assets are cached after a successful online visit; first-time offline visits cannot fetch content that the device has never cached.

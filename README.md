# Davonium Technologies — Corporate Website v2

A responsive, multi-page company website for Davonium Technologies, built with plain HTML, CSS and JavaScript. No React, build tool, npm or Node.js is required.

## Included
- Home, About, Products, Services, Our Work, Documentation and Contact pages.
- Privacy, Terms, Security Reporting and Accessibility pages, plus a 404 page.
- Existing Davonium D logo/icon assets supplied in the original website archive.
- Light and dark themes with a remembered user preference.
- Responsive keyboard-accessible navigation, escape-to-close mobile menu and reduced-motion support.
- Installable PWA manifest and service worker.
- Basic SEO metadata, canonical links, Open Graph/Twitter metadata, JSON-LD Organisation/WebSite data, sitemap.xml, robots.txt and llms.txt.
- Business contact information and an unusual WhatsApp contact dock.

## Brand/contact details
- Website domain intended: https://davoniumtech.com/ (and optionally www.davoniumtech.com as an alias).
- Ready2Go Learning: https://ready2go.davoniumtech.com/
- Marvel Chat preview: https://marvelchat.davoniumtech.com/
- Support email to configure: support@davoniumtech.com
- Existing fallback email: davoniumtechnologies@gmail.com
- Business phone: +234 707 260 4426
- WhatsApp: +234 803 207 6924

## Important before public launch
1. Activate `support@davoniumtech.com` through Cloudflare Email Routing or a mailbox provider. The page includes the existing Gmail inbox as fallback until then.
2. Verify the root domain and existing DNS records before attaching `davoniumtech.com` and `www.davoniumtech.com` to a new Pages project. Do not delete records used by Ready2Go, Marvel Chat, mail, or other services.
3. Review the privacy, terms and security page text for legal accuracy and actual operational practice. They are practical initial drafts, not a legal opinion.
4. Test on Android and desktop, including keyboard navigation, theme toggle, offline navigation and all external links.
5. Set up Google Search Console, verify domain ownership, and submit `https://davoniumtech.com/sitemap.xml`. Search indexing is not automatic or guaranteed; the sitemap and SEO tags improve discovery but do not promise ranking.
6. Confirm the company's legal name/registered details before adding claims about registration, addresses, awards, customers or client results. This site intentionally avoids unsupported claims.

## Git + Cloudflare Pages deployment

For copy/paste commands tailored for Windows CMD, open `DEPLOY-CMD-GUIDE.txt`.
Keep the current repository as a backup until the new site is tested. Recommended new repository: `DavoniumTech/davoniumtech-corporate-site`.

### Windows CMD
Download this ZIP and extract it to `C:\Users\YOUR-USER\davoniumtech-corporate-site` (substitute your actual Windows username). Then open CMD in the extracted folder and run:

```bat
git init
git add .
git commit -m "Launch Davonium Technologies corporate website refresh"
git branch -M main
git remote add origin https://github.com/DavoniumTech/davoniumtech-corporate-site.git
git push -u origin main
```

Create the empty GitHub repo with that name first. Leave README/license/gitignore unchecked. If this repo already exists, use its actual URL.

### Cloudflare Pages
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git.
2. Connect the repo above.
3. Production branch: `main`. Framework preset: None. Build command: `exit 0` (or leave blank if accepted). Build output directory: `.`. Root directory: `/` or blank.
4. Deploy and test the provided `*.pages.dev` URL first.
5. Only after confirming it works, go to Pages project → Custom domains and add `davoniumtech.com`. Add `www.davoniumtech.com` as an additional domain if desired, then choose a canonical host and configure a redirect. Follow Cloudflare's DNS prompts and preserve existing records.

### Subsequent updates
```bat
git add .
git commit -m "Update corporate website"
git push
```
Cloudflare Pages can automatically deploy changes pushed to the connected Git branch.

## Local smoke test (optional)
```bat
py -m http.server 8000
```
Open `http://localhost:8000`. PWA service workers normally require localhost or HTTPS.

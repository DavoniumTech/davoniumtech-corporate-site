# Davonium Technologies V66 — Performance & SEO foundation

Build date: 2026-11-06  
Input: V65 source ZIP supplied in this conversation  
Scope: Performance and technical maintenance pass. This release intentionally preserves the current corporate visual direction, navigation, product descriptions, demo experiences, PWA behaviour, and security posture.

## Changes made

- Consolidated each page's local CSS stack into one versioned stylesheet per existing cascade combination. The source stylesheets are concatenated in their original order; this preserves selector precedence while reducing the homepage from 22 local CSS requests to 1, and the common documentation pages from 16 to 1.
- Consolidated each page's deferred JavaScript files into one versioned runtime bundle per original script sequence. Source order is preserved. The homepage now loads 1 deferred local runtime bundle instead of 6 script files; common documentation pages load 1 instead of 9. The source files are self-contained IIFEs; no `document.currentScript` references or script-relative module imports were found in the page-loaded scripts.
- Combined the three repeated Google Fonts stylesheets into one request for Inter, Manrope, and Cormorant Garamond, with one preconnect hint per font host. `display=swap` is enabled.
- Re-encoded the eight large photography WebP images with a 1,200-pixel maximum dimension and WebP quality 82, retaining their filenames and subject matter. Files were only replaced when the new file was smaller.
- Rotated the PWA service-worker cache to V66 and added the new homepage CSS and runtime bundles to the core cache list.
- Updated page release metadata to V66.
- Standardized the approved brand wording to “Digital Products, Engineered for Impact.” and “Useful Technology, Built with Care.” across the HTML pages.

## Build measurements

- HTML pages updated: 73
- Unique CSS cascade combinations: 8; each page now has one local stylesheet request.
- Homepage CSS: 22 requests / 743,537 source bytes consolidated into one 744,959-byte bundle (142,914 bytes when locally gzip-compressed for comparison).
- Common documentation CSS: 16 requests / 674,935 source bytes consolidated into one 675,964-byte bundle (129,210 bytes when locally gzip-compressed for comparison).
- Unique JavaScript sequences: 5; each page now has one deferred local runtime request.
- Homepage runtime: 6 files / 70,211 source bytes consolidated into one 70,605-byte bundle.
- Common documentation runtime: 9 files / 185,211 source bytes consolidated into one 185,781-byte bundle.
- Google Fonts stylesheet requests per page reduced from 3 to 1, with preconnect to the two font hosts.
- Photography files saved: 935,546 bytes across 8 files.

The bundles preserve the existing CSS and script order; bundling reduces request count, not the underlying amount of page CSS/JS that needs to be downloaded and parsed. These are source/build measurements, not a measured Lighthouse/PageSpeed score. Real Core Web Vitals must be measured after deployment using PageSpeed Insights and Search Console field data.

## SEO audit notes from supplied source and Search Console screenshots

- The supplied XML sitemap contains 66 unique URLs, all using `https://www.davoniumtech.com/`; each URL maps to a source HTML page.
- All HTML pages have a title, robots metadata, and a canonical link in the supplied source.
- The Search Console category “Alternative page with proper canonical tag” (62 URLs) is usually expected for non-canonical versions if the canonical target is correct.
- “Page with redirect” (28 URLs) is not automatically an error. Sitemap entries and internal links should point directly to the final canonical destination.
- The source intentionally marks the legal pages, offline/404 pages, and two retired demo aliases (`/demos/marketing` and `/demos/community`) as noindex. Keep those exclusions unless the business explicitly decides to publish the retired aliases as separate experiences. The nine Search Console URLs should be checked against this list before changing any directive.
- The two “Duplicate without user-selected canonical” examples and four “Crawled - currently not indexed” examples need URL-level inspection in Search Console before a safe SEO correction can be chosen. The retired demo aliases already declare the intended Biz/Skills canonical targets in the supplied source, but we must compare the report examples rather than assume they are the two affected URLs. No SEO categories were guessed at or mass-changed in this build.

## Before deploying

1. Keep a copy of the current production ZIP/commit so rollback is easy.
2. Deploy the V66 files to the existing production branch/root; do not create a second website or change the domain configuration.
3. Test the homepage, mobile menu, product pages, all five demos, contact flow, documentation, and install/offline behaviour.
4. Run PageSpeed Insights on the homepage and one important inner page on mobile and desktop. Target good Core Web Vitals: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at the 75th percentile.
5. In Search Console, inspect the two duplicate URLs and the four crawled-not-indexed URLs; do not request indexing for every excluded URL.
6. After a successful live test, request indexing for the homepage and the important canonical product/service pages only.

## Rollback

Restore the previous V65 production files/commit. V66 uses content-hashed asset filenames and a new service-worker cache name, so old asset files can remain present during rollback without name collisions.

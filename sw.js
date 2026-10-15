/* Davonium Technologies PWA cache. Relative routing supports www.davoniumtech.com and GitHub Pages project paths. */
const CACHE_NAME = 'davonium-site-v6-system-theme-r2g-brand-20261015';
const ROUTES = ["404.html","about.html","assets/css/styles.css","assets/icons/apple-touch-icon.png","assets/icons/favicon-32.png","assets/icons/icon-192.png","assets/icons/icon-512.png","assets/icons/products/ready2go.svg","assets/icons/products/marvel-chat.svg","assets/icons/products/davonium-nexus.svg","assets/images/davonium-d-icon.png","assets/js/site.js","assets/social/davonium-social-preview.png","contact.html","docs/guides/accessibility.html","docs/guides/analytics-and-measurement.html","docs/guides/architecture-map.html","docs/guides/browser-compatibility.html","docs/guides/company-overview.html","docs/guides/content-standards.html","docs/guides/cookies-and-storage.html","docs/guides/customer-handoff.html","docs/guides/davonium-nexus.html","docs/guides/deployment-maintenance.html","docs/guides/documentation-maintenance.html","docs/guides/error-pages.html","docs/guides/faq.html","docs/guides/getting-started.html","docs/guides/glossary.html","docs/guides/marvel-chat.html","docs/guides/navigation-search.html","docs/guides/offline-first.html","docs/guides/performance.html","docs/guides/privacy-data.html","docs/guides/privacy-notice-guide.html","docs/guides/product-status.html","docs/guides/project-process.html","docs/guides/pwa-installation.html","docs/guides/ready2go-learning.html","docs/guides/release-notes.html","docs/guides/security-basics.html","docs/guides/security-reporting.html","docs/guides/seo-discovery.html","docs/guides/service-scope.html","docs/guides/services-guide.html","docs/guides/static-vs-dynamic.html","docs/guides/support-escalation.html","docs/guides/support-guide.html","docs/guides/technical-seo-checklist.html","docs/guides/web-app-engineering.html","docs/guides/website-delivery.html","docs/guides/website-forms.html","docs/index.html","index.html","install.html","llms.txt","legal/cookies.html","legal/privacy.html","legal/terms.html","manifest.webmanifest","offline.html","products.html","robots.txt","services.html","sitemap.xml","support.html","sw.js","work.html"];
const BASE_URL = new URL('./', self.registration.scope);
const routeUrl = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;
const PRECACHE_URLS = [BASE_URL.href, ...ROUTES.map(routeUrl)];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('davonium-site-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_URL.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
      return response;
    }).catch(async () => await caches.match(request) || await caches.match(routeUrl('offline.html')) || await caches.match(routeUrl('index.html')) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  })));
});

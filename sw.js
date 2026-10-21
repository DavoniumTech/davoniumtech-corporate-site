/* Davonium Technologies PWA service worker — reliable root routing and progressive cache. */
const CACHE_NAME = 'davonium-site-v19-dvnm-css-repair-20261021';
const BASE_URL = new URL('./', self.registration.scope);
const routeUrl = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;
const CORE = [
  BASE_URL.href,
  routeUrl('offline.html'),
  routeUrl('install'),
  routeUrl('products'),
  routeUrl('about'),
  routeUrl('contact'),
  routeUrl('services'),
  routeUrl('support'),
  routeUrl('docs/'),
  routeUrl('demos/'),
  routeUrl('docs/guides/dvnm-demo-studio-qr-certificate'),
  routeUrl('demos/certificate.html'),
  routeUrl('demos/technology.html'),
  routeUrl('demos/community.html'),
  routeUrl('docs/guides/mobile-first-quality'),
  routeUrl('docs/guides/speech-and-accessibility'),
  routeUrl('docs/guides/dvnm-welcome-and-voice'),
  routeUrl('docs/guides/dvnm-sample-website-planning'),
  routeUrl('docs/guides/dvnm-bot-interaction-checklist'),
  routeUrl('demos/business.html'),
  routeUrl('demos/marketing.html'),
  routeUrl('demos/shop.html'),
  routeUrl('demos/portfolio.html'),
  routeUrl('demos/learning.html'),
  routeUrl('demos/technology.html'),
  routeUrl('demos/community.html'),
  routeUrl('docs/media/Davonium-Demo-Studio-Concept-Certificate-and-QR-Directory.pdf'),
  routeUrl('assets/css/dvnm-bot.css?v=19'),
  routeUrl('demos/demos.css'),
  routeUrl('demos/demos.js'),
  routeUrl('assets/images/davonium-website-qr.png'),
  routeUrl('assets/images/qr-dvnm-demo-studio.png'),
  routeUrl('assets/images/qr-dvnm-connect.png'),
  routeUrl('assets/images/qr-dvnm-digital.png'),
  routeUrl('assets/images/qr-dvnm-skills.png'),
  routeUrl('assets/images/qr-dvnm-creative.png'),
  routeUrl('assets/images/qr-dvnm-market.png'),
  routeUrl('assets/images/qr-dvnm-growth.png'),
  routeUrl('assets/images/qr-dvnm-biz.png'),
  routeUrl('assets/css/styles.css'),
  routeUrl('assets/js/site.js'),
  routeUrl('manifest.webmanifest'),
  routeUrl('assets/icons/favicon-32.png'),
  routeUrl('assets/icons/icon-192-rounded.png'),
  routeUrl('assets/images/davonium-d-icon.webp'),
  routeUrl('assets/icons/products/ready2go.svg'),
  routeUrl('assets/icons/products/marvel-chat.svg'),
  routeUrl('assets/icons/products/davonium-nexus.svg')
];
const homePath = new URL('./', BASE_URL).pathname;
const explicitIndexPath = new URL('index.html', BASE_URL).pathname;
const isHomeRequest = (url) => url.pathname === homePath || url.pathname === explicitIndexPath;
async function remember(cache, key, response) {
  if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
    try { await cache.put(key, response.clone()); } catch (_) {}
  }
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each core asset independently so a single optional file cannot cancel the worker install.
    await Promise.allSettled(CORE.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) await remember(cache, url, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('davonium-site-') && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_URL.pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      // Both / and /index.html resolve through the same root document cache entry.
      if (isHomeRequest(url)) {
        const cachedHome = await cache.match(BASE_URL.href);
        const refreshHome = fetch(BASE_URL.href).then(async response => {
          await remember(cache, BASE_URL.href, response);
          return response;
        });
        if (cachedHome) {
          event.waitUntil(refreshHome.catch(() => {}));
          return cachedHome;
        }
        try { return await refreshHome; }
        catch (_) { return await cache.match(routeUrl('offline.html')) || Response.error(); }
      }
      const cached = await cache.match(request);
      const refresh = fetch(request).then(async response => {
        await remember(cache, request, response);
        return response;
      });
      if (cached) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
      }
      try { return await refresh; }
      catch (_) { return await cache.match(routeUrl('offline.html')) || await cache.match(BASE_URL.href) || Response.error(); }
    })());
    return;
  }
  // Static assets: cache-first for repeat visits, network-first only when the asset is not cached.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      await remember(cache, request, response);
      return response;
    } catch (_) { return Response.error(); }
  })());
});

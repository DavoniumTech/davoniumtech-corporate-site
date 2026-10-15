/* Davonium Technologies PWA service worker — minimal install cache, cache-on-visit for the rest. */
const CACHE_NAME = 'davonium-site-v7-fast-install-20261015';
const BASE_URL = new URL('./', self.registration.scope);
const routeUrl = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;
const CORE = [
  BASE_URL.href,
  routeUrl('index.html'),
  routeUrl('offline.html'),
  routeUrl('install.html'),
  routeUrl('products.html'),
  routeUrl('assets/css/styles.css'),
  routeUrl('assets/js/site.js'),
  routeUrl('manifest.webmanifest'),
  routeUrl('assets/icons/favicon-32.png'),
  routeUrl('assets/images/davonium-d-icon.webp'),
  routeUrl('assets/icons/products/ready2go.svg'),
  routeUrl('assets/icons/products/marvel-chat.svg'),
  routeUrl('assets/icons/products/davonium-nexus.svg')
];
const remember = async (cache, request, response) => {
  if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
    try { await cache.put(request, response.clone()); } catch (_) {}
  }
};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
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
      const cached = await cache.match(request) || (url.pathname === BASE_URL.pathname ? await cache.match(BASE_URL.href) : null);
      const refresh = fetch(request).then(async response => { await remember(cache, request, response); return response; });
      if (cached) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
      }
      try { return await refresh; }
      catch (_) { return await cache.match(routeUrl('offline.html')) || await cache.match(routeUrl('index.html')) || Response.error(); }
    })());
    return;
  }
  // Static assets use cache-first for speed; misses are fetched and cached on first use.
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

const CACHE_NAME = 'davonium-site-v2-20261014';
const APP_SHELL = [
  '/', '/index.html', '/about.html', '/products.html', '/services.html', '/portfolio.html',
  '/docs.html', '/contact.html', '/privacy.html', '/terms.html', '/security.html',
  '/accessibility.html', '/404.html', '/css/styles.css', '/js/main.js', '/manifest.webmanifest',
  '/assets/icons/favicon-32.png', '/assets/icons/apple-touch-icon.png',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png', '/assets/images/davonium-d-icon.png',
  '/assets/images/davonium-social-card.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('davonium-site-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  })));
});

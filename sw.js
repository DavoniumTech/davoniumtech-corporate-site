/* Davonium Technologies PWA service worker - V63 studio finish. */
const CACHE_NAME = 'davonium-site-v63-studio-20261030';
const BASE_URL = new URL('./', self.registration.scope);
const routeUrl = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;
const CORE = [
  routeUrl(""),
  routeUrl("offline.html"),
  routeUrl("manifest.webmanifest"),
  routeUrl("assets/css/styles.css?v=56"),
  routeUrl("assets/css/dvnm-bot.css?v=56"),
  routeUrl("assets/css/davonium-v62-glass-constellation.css?v=62"),
  routeUrl("assets/css/davonium-v63-studio-finish.css?v=63"),
  routeUrl("assets/js/site.js?v=60"),
  routeUrl("assets/js/davonium-v62-experience.js?v=62"),
  routeUrl("assets/images/davonium-d-icon.webp"),
  routeUrl("assets/images/dvnm-bot-cutout.webp")
];
const homePath = BASE_URL.pathname;
const explicitIndexPath = new URL('index.html', BASE_URL).pathname;
const isHomeRequest = (url) => url.pathname === homePath || url.pathname === explicitIndexPath;
async function remember(cache, key, response) {
  if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
    try { await cache.put(key, response.clone()); } catch (_) {}
  }
}
function offlineResponse() {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Connection unavailable · Davonium Technologies</title><style>body{margin:0;padding:24px;font:16px/1.6 system-ui,sans-serif;color:#211b3a;background:#f7f5ff;display:grid;min-height:100vh;place-items:center;box-sizing:border-box}.card{max-width:560px;padding:clamp(22px,5vw,40px);background:white;border:1px solid #e5def8;border-radius:24px;box-shadow:0 20px 70px #24145a18}a{color:#6144df;font-weight:700}</style><main class="card"><p>DAVONIUM TECHNOLOGIES</p><h1>This page is temporarily unavailable.</h1><p>Your browser could not reach the page just now. Check your connection, then try again. Cached pages may still be available on this device.</p><p><a href="${BASE_URL.href}">Return to the Davonium homepage</a></p><p><button type="button" onclick="location.reload()">Try again</button></p></main></html>`, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '30' }
  });
}
function extensionlessCandidate(url) {
  const path = url.pathname;
  if (!path || path === '/' || path.endsWith('/') || /\.[A-Za-z0-9]{1,8}$/.test(path)) return null;
  const u = new URL(url.href); u.pathname = path + '.html'; return u.href;
}
function indexCandidate(url) {
  if (!url.pathname.endsWith('/')) return null;
  return new URL('index.html', url.href).href;
}
async function readNavigation(request, url, cache) {
  try {
    let response = await fetch(request, { cache: 'no-store' });
    if (response.status === 404) {
      const fallback = extensionlessCandidate(url) || indexCandidate(url);
      if (fallback) {
        try {
          const alternative = await fetch(fallback, { cache: 'no-store' });
          if (alternative.ok) { await remember(cache, fallback, alternative); return alternative; }
        } catch (_) {}
      }
    }
    await remember(cache, request, response);
    return response;
  } catch (_) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await cache.match(routeUrl('offline.html'));
    if (offline) return offline;
    return offlineResponse();
  }
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE.map(async url => {
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
      if (isHomeRequest(url)) {
        const cachedHome = await cache.match(BASE_URL.href);
        const refreshHome = fetch(BASE_URL.href, { cache: 'no-store' }).then(async response => {
          await remember(cache, BASE_URL.href, response); return response;
        });
        if (cachedHome) { event.waitUntil(refreshHome.catch(() => {})); return cachedHome; }
        try {
          const response = await refreshHome;
          if (response.status === 404) return await cache.match(routeUrl('offline.html')) || offlineResponse();
          return response;
        } catch (_) { return await cache.match(routeUrl('offline.html')) || offlineResponse(); }
      }
      return readNavigation(request, url, cache);
    })());
    return;
  }
  // Cache-first for assets is safe after versioned cache rotation; failed requests return safe responses.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      await remember(cache, request, response);
      return response;
    } catch (_) {
      return new Response('', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  })());
});

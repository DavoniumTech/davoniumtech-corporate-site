/* Davonium Technologies PWA service worker — V46 shared 3D DVNM Bot, compact guide, docs and shareable showcase certificate. */
const CACHE_NAME = 'davonium-site-v46-final-20261026';
const BASE_URL = new URL('./', self.registration.scope);
const routeUrl = (path) => new URL(path.replace(/^\/+/, ''), BASE_URL).href;
const CORE = [
  routeUrl("demos/certificate.html"),

  routeUrl(""),
  routeUrl("offline"),
  routeUrl("assets/css/dvnm-bot.css?v=46"),
  routeUrl("assets/js/dvnm-final-v45.js?v=46"),
  routeUrl("assets/css/dvnm-final-v45.css?v=46"),
  routeUrl("assets/images/dvnm-robot-fallback-v46.svg"),
  routeUrl("assets/js/dvnm-robot-3d.js?v=46"),
  routeUrl("assets/css/dvnm-robot-3d.css?v=46"),
  routeUrl("assets/images/dvnm-bot-head-v46.svg"),
  routeUrl("demos/certificate-share.js?v=46"),
  routeUrl("assets/css/dvnm-immersive-v44.css?v=46"),
  routeUrl("install"),
  routeUrl("products"),
  routeUrl("about"),
  routeUrl("contact"),
  routeUrl("services"),
  routeUrl("support"),
  routeUrl("work"),
  routeUrl("docs/"),
  routeUrl("docs/guides/global-digital-engineering"),
  routeUrl("demos/"),
  routeUrl("docs/guides/dvnm-demo-studio-qr-certificate"),
  routeUrl("demos/certificate"),
  routeUrl("demos/technology"),
  routeUrl("demos/community"),
  routeUrl("docs/guides/mobile-first-quality"),
  routeUrl("docs/guides/speech-and-accessibility"),
  routeUrl("docs/guides/dvnm-welcome-and-voice"),
  routeUrl("docs/guides/dvnm-bot-motion-voice-accessibility"),
  routeUrl("docs/guides/dvnm-sample-website-planning"),
  routeUrl("docs/guides/dvnm-bot-interaction-checklist"),
  routeUrl("demos/business"),
  routeUrl("demos/marketing"),
  routeUrl("demos/shop"),
  routeUrl("demos/portfolio"),
  routeUrl("demos/learning"),
  routeUrl("docs/media/Davonium-Demo-Studio-Concept-Certificate-and-QR-Directory.pdf"),
  routeUrl("docs/media/Davonium-DVNM-Showcase-Certificate.pdf"),
  routeUrl("demos/demos.css?v=46"),
  routeUrl("demos/demos.js?v=46"),
  routeUrl("assets/js/site.js?v=46"),
  routeUrl("assets/js/certificate-print.js?v=46"),
  routeUrl("assets/images/demo-art/dvnm-biz.svg"),
  routeUrl("assets/images/demo-art/dvnm-growth.svg"),
  routeUrl("assets/images/demo-art/dvnm-market.svg"),
  routeUrl("assets/images/demo-art/dvnm-creative.svg"),
  routeUrl("assets/images/demo-art/dvnm-skills.svg"),
  routeUrl("assets/images/demo-art/dvnm-digital.svg"),
  routeUrl("assets/images/demo-art/dvnm-connect.svg"),
  routeUrl("assets/images/davonium-website-qr.png"),
  routeUrl("assets/images/qr-dvnm-demo-studio.png"),
  routeUrl("assets/images/qr-dvnm-connect.png"),
  routeUrl("assets/images/qr-dvnm-digital.png"),
  routeUrl("assets/images/qr-dvnm-skills.png"),
  routeUrl("assets/images/qr-dvnm-creative.png"),
  routeUrl("assets/images/qr-dvnm-market.png"),
  routeUrl("assets/images/qr-dvnm-growth.png"),
  routeUrl("assets/images/qr-dvnm-biz.png"),
  routeUrl("assets/css/site-refresh-v40.css?v=46"),
  routeUrl("assets/images/dvnm-bot-body-v40.svg?v=46"),
  routeUrl("assets/images/dvnm-bot-head-v40.svg?v=46"),
  routeUrl("assets/images/dvnm-bot-head-avatar-v40.svg?v=46"),
  routeUrl("assets/images/dvnm-city-skyline-light-v40.svg"),
  routeUrl("assets/images/dvnm-city-skyline-dark-v40.svg"),
  routeUrl("assets/css/styles.css?v=46"),
  routeUrl("manifest.webmanifest"),
  routeUrl("assets/icons/favicon-32.png"),
  routeUrl("assets/icons/icon-192-rounded.png"),
  routeUrl("assets/images/davonium-d-icon.webp"),
  routeUrl("assets/icons/products/ready2go.svg"),
  routeUrl("assets/icons/products/marvel-chat.svg"),
  routeUrl("assets/icons/products/davonium-nexus.svg")
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
    const offline = await cache.match(routeUrl('offline'));
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
          if (response.status === 404) return await cache.match(routeUrl('offline')) || offlineResponse();
          return response;
        } catch (_) { return await cache.match(routeUrl('offline')) || offlineResponse(); }
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

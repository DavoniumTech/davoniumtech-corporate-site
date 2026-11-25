// Davonium V69 progressive web app worker — public resources only, no form data or API responses.
const CACHE_PREFIX="davonium-public-v69";
const CORE_CACHE=CACHE_PREFIX+"-core";
const PAGE_CACHE=CACHE_PREFIX+"-pages";
const CORE=["./offline.html","./manifest.webmanifest","./assets/icons/favicon-32.png","./assets/icons/apple-touch-icon.png"];
self.addEventListener("install",event=>{event.waitUntil((async()=>{const c=await caches.open(CORE_CACHE);await c.addAll(CORE);await self.skipWaiting()})())});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("davonium-")&&!k.startsWith(CACHE_PREFIX)).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener("fetch",event=>{
 const req=event.request; if(req.method!=="GET")return;
 const url=new URL(req.url); if(url.origin!==self.location.origin)return;
 // Never cache API, authentication, form submissions, or admin dashboard pages.
 if(url.pathname.includes("/functions/v1/")||url.pathname.startsWith("/admin")||url.pathname.includes("/auth/"))return;
 if(req.headers.get("accept")?.includes("text/html")){
   event.respondWith((async()=>{try{const fresh=await fetch(req);if(fresh.ok){const c=await caches.open(PAGE_CACHE);c.put(req,fresh.clone());}return fresh}catch{const cached=await caches.match(req);return cached||caches.match("./offline.html")}})());return;
 }
 event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;try{const fresh=await fetch(req);if(fresh.ok&&fresh.type!=="opaque"){const c=await caches.open(CORE_CACHE);c.put(req,fresh.clone())}return fresh}catch{return cached||Response.error()}})());
});

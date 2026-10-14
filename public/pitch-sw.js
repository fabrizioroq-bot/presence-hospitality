// Offline cache for the sales pitch (/dashboard/pitch). Registered by the pitch shell with that scope;
// cleared and unregistered by the login page (sign-out or expired session).
// - Hashed build files, fonts, point clouds and brand files: cache first (their URLs change per build).
// - The pitch page: network first (4 s timeout), cached copy when offline. Redirects are never cached.
// The cached page keeps its own Content-Security-Policy header, so its nonce still matches.
const CACHE = "pitch-v1";
const PAGE = "/dashboard/pitch";
const TIMEOUT_MS = 4000;

const isAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/hologram/") || url.pathname.startsWith("/brand/"));

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function cachePut(request, response) {
  if (!response || !response.ok || response.redirected || response.type === "opaqueredirect") return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
}

async function pageNetworkFirst(request) {
  const key = new Request(PAGE);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
    ]);
    await cachePut(key, response.clone());
    return response;
  } catch {
    const cached = await caches.match(key);
    return cached ?? Response.error();
  }
}

async function assetCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await cachePut(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate" && url.pathname === PAGE) event.respondWith(pageNetworkFirst(request));
  else if (isAsset(url)) event.respondWith(assetCacheFirst(request));
});

self.addEventListener("message", (event) => {
  const { type, urls } = event.data ?? {};
  if (type === "warm" && Array.isArray(urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        await Promise.all(
          urls.map(async (u) => {
            const url = new URL(u, self.location.origin);
            const key = url.pathname === PAGE ? new Request(PAGE) : new Request(url.href);
            if (url.origin !== self.location.origin || (await cache.match(key))) return;
            try {
              await cachePut(key, await fetch(url.href, { credentials: "same-origin" }));
            } catch {
              // Offline or blocked: this file stays uncached; the next warm-up retries it.
            }
          }),
        );
        event.source?.postMessage({ type: "warmed" });
      })(),
    );
  } else if (type === "clear") {
    event.waitUntil(caches.delete(CACHE).then(() => self.registration.unregister()));
  }
});

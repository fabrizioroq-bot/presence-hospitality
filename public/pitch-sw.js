// Offline cache for the sales pitch (/dashboard/pitch). Registered by the pitch shell with that scope;
// cleared and unregistered by the login page (sign-out or expired session).
// - Hashed build files, fonts, point clouds, brand files and media clips: cache first.
// - The pitch page: network first (4 s timeout), cached copy when offline. Redirects are never cached.
// The cached page keeps its own Content-Security-Policy header, so its nonce still matches.
const CACHE = "pitch-v1";
const PAGE = "/dashboard/pitch";
const TIMEOUT_MS = 4000;

const isAsset = (url) =>
  url.origin === self.location.origin &&
  ["/_next/static/", "/hologram/", "/brand/", "/media/"].some((prefix) => url.pathname.startsWith(prefix));

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

async function cachePut(request, response) {
  // Only complete responses: redirects aren't cached, and video Range replies (206) can't be (the
  // warm-up fetches clips whole instead).
  if (!response || response.status !== 200 || response.redirected || response.type === "opaqueredirect") return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response);
}

// One cache entry per language version (?lang=nl); other query parameters are ignored.
const pageKey = (url) => new Request(url.searchParams.get("lang") === "nl" ? `${PAGE}?lang=nl` : PAGE);

async function pageNetworkFirst(request) {
  const key = pageKey(new URL(request.url));
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
            const key = url.pathname === PAGE ? pageKey(url) : new Request(url.href);
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

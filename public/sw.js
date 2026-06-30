/// <reference lib="webworker" />

const CACHE_NAME = "yks-planner-v2";
const ASSETS = [
  "/plan",
  "/manifest.json",
];

// Only cache whitelisted static assets, not all GET requests
const CACHEABLE_EXTENSIONS = [".js", ".css", ".woff2", ".woff", ".ttf", ".png", ".ico", ".svg", ".webp"];

function isCacheable(url) {
  // Always cache items in the ASSETS list
  const pathname = new URL(url).pathname;
  if (ASSETS.includes(pathname)) return true;
  // Cache static assets by extension
  return CACHEABLE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests for whitelisted resources
  if (event.request.method !== "GET" || !isCacheable(event.request.url)) {
    return; // Let the browser handle non-cacheable requests normally
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(() => caches.match(event.request).then((r) => r || new Response("Offline", { status: 503 })))
  );
});


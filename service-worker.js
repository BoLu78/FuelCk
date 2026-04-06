const CACHE_NAME = "rampcheck-v7.0";
const OFFLINE_FALLBACK_URL = "./index.html";
const APP_FILES = [
  "./",
  "./?v=7.0",
  "./index.html",
  "./app.js",
  "./app.js?v=7.0",
  "./manifest.json",
  "./manifest.json?v=7.0",
  "./service-worker.js",
  "./assets/tripinfo-logo-neos.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_FILES.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (
          await cache.match(OFFLINE_FALLBACK_URL)
        ) || await cache.match("./");
      })
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      const networkResponsePromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      });

      if (cachedResponse) {
        event.waitUntil(networkResponsePromise.catch(() => {}));
        return cachedResponse;
      }

      try {
        return await networkResponsePromise;
      } catch {
        return (
          await cache.match(OFFLINE_FALLBACK_URL)
        ) || await cache.match("./");
      }
    })()
  );
});

const CACHE_NAME = "rampcheck-v8.6";
const OFFLINE_FALLBACK_URL = "./index.html";
const APP_FILES = [
  "./",
  "./?v=8.6",
  "./index.html",
  "./app.js",
  "./app.js?v=8.6",
  "./manifest.json",
  "./manifest.json?v=8.6",
  "./service-worker.js",
  "./assets/logo-lb.png",
  "./assets/tripinfo-logo-neos.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

async function matchOfflineShell(cache) {
  return (
    await cache.match(OFFLINE_FALLBACK_URL)
  ) || (
    await cache.match("./")
  ) || await cache.match("./?v=8.6");
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    APP_FILES.map(async (url) => {
      const request = new Request(url, { cache: "reload" });
      const response = await fetch(request);

      if (!response || !response.ok) {
        throw new Error(`Failed to cache ${url}`);
      }

      await cache.put(request, response);
    })
  );

  const hasOfflineShell = await matchOfflineShell(cache);
  const hasAppScript = (await cache.match("./app.js?v=8.6")) || await cache.match("./app.js");

  if (!hasOfflineShell || !hasAppScript) {
    throw new Error("Core app shell is unavailable for offline use.");
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell());
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
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);

          if (networkResponse && networkResponse.ok) {
            await cache.put(OFFLINE_FALLBACK_URL, networkResponse.clone());
          }

          return networkResponse;
        } catch {
          return (await matchOfflineShell(cache)) || Response.error();
        }
      })()
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
        return Response.error();
      }
    })()
  );
});

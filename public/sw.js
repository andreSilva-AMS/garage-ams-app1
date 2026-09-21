const CACHE_NAME = "receptcar-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
  );
});

// Réseau en priorité (toujours la version à jour), avec repli sur le cache
// si la connexion est instable — utile pour une tablette de réception. Si la
// page demandée n'a jamais été mise en cache (ex. premier lancement hors
// ligne), on affiche une page de secours propre plutôt que l'erreur du
// navigateur.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
        return Response.error();
      }),
  );
});

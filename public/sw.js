const CACHE_NAME = "receptcar-v3";
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
//
// Deux garde-fous ajoutés après un signalement de connexion très lente (30s
// à 1 min, par intermittence, sur tablette) :
// 1. On n'intercepte que les requêtes vers notre propre origine. Sans ce
//    filtre, le Service Worker interceptait aussi les appels vers Supabase
//    (auth, données, fichiers), ce qui n'a jamais été l'intention de cette
//    fonctionnalité "hors ligne" (pensée pour l'app elle-même). Un simple
//    aléa réseau sur un de ces appels suffisait à bloquer toute la page.
// 2. Un délai maximal (8s) sur le fetch : au-delà, on bascule sur le cache
//    plutôt que de rester en attente indéfiniment (certains réseaux mobiles
//    n'abandonnent une connexion qui ne répond pas qu'après 30-60s).
const FETCH_TIMEOUT_MS = 8000;

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        const response = await fetch(event.request, { signal: controller.signal });
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
        return Response.error();
      } finally {
        clearTimeout(timeout);
      }
    })(),
  );
});

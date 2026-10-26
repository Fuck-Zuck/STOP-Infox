// 1. Incrémente cette version à chaque modification du code (ex: v2, v3, etc.)
const CACHE_NAME = 'accueil-pwa-v2.4.55';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Phase d'installation : Mettre en cache les nouveaux fichiers
self.addEventListener('install', (event) => {
  // Force le nouveau Service Worker à devenir actif immédiatement
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Phase d'activation : Supprimer les anciens caches obsolètes (ex: v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache :', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle immédiat des pages ouvertes
  );
});

// Interception des requêtes : Réseau d'abord, fallback sur le cache si hors-ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si le réseau répond, on met à jour le cache à la volée
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de panne de réseau (hors-ligne), on utilise le cache
        return caches.match(event.request);
      })
  );
});

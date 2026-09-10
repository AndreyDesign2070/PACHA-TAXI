// Service Worker for PACHA Transporte Ejecutivo PWA
const CACHE_NAME = 'pacha-cache-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase, analytics, or external API requests
  if (url.origin !== self.location.origin) return;

  // 1. Navigation requests (HTML document): Network-First
  // Guarantees users always see the latest Netlify deployment
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback only for navigation
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 2. Static Assets (JS / CSS / images): Stale-While-Revalidate or Network-First
  // Never fallback to HTML for script/style requests!
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch((err) => {
          // If network fails and no cached response, do NOT return HTML!
          if (!cachedResponse) {
            throw err;
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});


// Basic Service Worker for PWA Installation Requirements (Network First)
const CACHE_NAME = 'math-rockstar-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always attempt network fetch first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});


// Jesse Math Rockstar - Enterprise Service Worker with Push API & Background Notification Handler
const CACHE_NAME = 'jesse-math-rockstar-v3';

// Assets to cache for offline resilience
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});

// Push API Notification Listener (Background Push Events)
self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 Jesse Math Rockstar Alert',
    body: 'Keep your streak alive with today\'s math practice challenge!',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'general-notification',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      data.icon = payload.icon || data.icon;
      data.badge = payload.badge || data.badge;
      data.tag = payload.tag || 'jesse-math-push';
      data.data = payload.data || { url: '/' };
    } catch (e) {
      const textPayload = event.data.text();
      if (textPayload) {
        data.body = textPayload;
      }
    }
  }

  // Handle specific notification categories (Streak Reminders, Assignment Alerts, etc.)
  if (data.tag === 'streakReminders') {
    data.title = data.title || '🔥 Streak Warning: Keep It Alive!';
  } else if (data.tag === 'deadlines' || data.tag === 'gradingAlerts') {
    data.title = data.title || '⏰ Assignment & Homework Alert';
  } else if (data.tag === 'classUpdates') {
    data.title = data.title || '📢 Live Class Announcement';
  } else if (data.tag === 'dailyChallenges') {
    data.title = data.title || '💡 Daily Challenge Ready!';
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open_app', title: 'Open App 🚀' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

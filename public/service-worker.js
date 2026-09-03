// Jesse Math FC - Enterprise Service Worker with Push API, FCM/Firestore Background Sync & Rich Lock Screen Notifications
const CACHE_NAME = 'jesse-math-rockstar-v4';

// Assets to cache for offline resilience
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png'
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

// Listen for messages from client app (e.g. triggering background notifications or sync)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
      badge: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      renotify: true,
      timestamp: Date.now(),
      ...options
    });
  }
});

// Push API & Firestore/FCM Background Notification Listener
self.addEventListener('push', (event) => {
  let notificationData = {
    title: '🔥 Jesse Math FC Alert',
    body: 'Keep your streak alive with today\'s math practice challenge!',
    icon: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
    badge: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
    tag: 'general-notification',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      // Support FCM / Firestore message structures (`notification` or `data` fields)
      const raw = payload.notification || payload.data || payload;
      notificationData.title = raw.title || notificationData.title;
      notificationData.body = raw.body || raw.message || notificationData.body;
      notificationData.icon = raw.icon || notificationData.icon;
      notificationData.badge = raw.badge || notificationData.badge;
      notificationData.tag = raw.tag || raw.category || 'jesse-math-push';
      notificationData.data = raw.data || { url: raw.url || '/' };
    } catch (e) {
      const textPayload = event.data.text();
      if (textPayload) {
        notificationData.body = textPayload;
      }
    }
  }

  // Handle rich customized tags & emergency/progress types for lock screen & home screen
  const tag = notificationData.tag;
  if (tag === 'streakReminders' || tag === 'emergency') {
    notificationData.title = notificationData.title || '🚨 URGENT: Streak & Progress Warning!';
  } else if (tag === 'deadlines') {
    notificationData.title = notificationData.title || '⏰ Assignment & Homework Deadline';
  } else if (tag === 'praiseAndRewards') {
    notificationData.title = notificationData.title || '🏆 Reward & Badge Unlocked!';
  } else if (tag === 'classUpdates') {
    notificationData.title = notificationData.title || '📢 Live Class & Teacher Announcement';
  } else if (tag === 'peerUpdates') {
    notificationData.title = notificationData.title || '⚡ Leaderboard & Multiplayer Duel Alert';
  } else if (tag === 'dailyChallenges') {
    notificationData.title = notificationData.title || '💡 Daily Challenge Ready!';
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    vibrate: [300, 100, 300, 100, 300], // Distinct vibration pattern for lock screen
    requireInteraction: true,           // Stays on lock screen / notification center until interacted
    renotify: true,
    timestamp: Date.now(),
    actions: [
      { action: 'open_app', title: '🚀 Open App & Solve' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification Click Handler (Home Screen / Lock Screen interaction)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find an existing open window and focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // If no window open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

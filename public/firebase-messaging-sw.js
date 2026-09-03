importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAlDrGsdzlB4kpcqHT65Y6r8VxatkO8Sv0",
  authDomain: "jesse-math-rockstar.firebaseapp.com",
  databaseURL: "https://jesse-math-rockstar-default-rtdb.firebaseio.com",
  projectId: "jesse-math-rockstar",
  storageBucket: "jesse-math-rockstar.firebasestorage.app",
  messagingSenderId: "461112227439",
  appId: "1:461112227439:web:a106ade74c039e16a97f9a"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Jesse Math FC Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update!',
    icon: 'https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fvk11iy6n5ppdp0j4nm46.png',
    data: {
      url: '/?tab=homework'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/?tab=homework';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('jesse-math') && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

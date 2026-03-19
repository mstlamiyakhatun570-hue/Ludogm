// Combined Service Worker: PWA offline + Firebase messaging

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase init
firebase.initializeApp({
  apiKey: "AIzaSyCWwLBxLh9AKUMXSD8ggNmMnJ37BAwCquk",
  authDomain: "tournament-a877c.firebaseapp.com",
  projectId: "tournament-a877c",
  storageBucket: "tournament-a877c.firebasestorage.app",
  messagingSenderId: "585409221109",
  appId: "1:585409221109:web:7c77fc5283238f439550bc"
});

const messaging = firebase.messaging();

// ===== PWA OFFLINE CACHE =====
const CACHE_NAME = 'tournament-guru-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(() => Promise.resolve())
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API & external requests
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) return;

  // Navigation - network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});

// ===== FIREBASE PUSH NOTIFICATIONS =====
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'Tournament Guru 🏆';
  const body = payload.notification?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [300, 100, 300],
    requireInteraction: true,
    tag: 'tg-notification',
    data: { url: '/' }
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});

// Service Worker for Push Notifications & PWA Offline Support - Sprint 7 & 8

const CACHE_NAME = 'swipejob-v1';
const RUNTIME_CACHE = 'swipejob-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );
    })
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            // Cache successful responses for jobs and profiles
            if (response.ok && (url.pathname.includes('/jobs') || url.pathname.includes('/profile'))) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(request))
      })
    );
    return;
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
  );
});

self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    tag: data.tag || 'notification',
    data: {
      url: data.data?.url || '/'
    },
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If a window is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.vapidPublicKey
    })
    .then(function(subscription) {
      // Send the new subscription to the server
      return fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    })
  );
});

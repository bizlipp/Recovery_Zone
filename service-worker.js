// Service Worker for Kidney Fix-It Plan
const CACHE_NAME = 'kidney-plan-v1';
const ASSETS = [
  './',
  './index.html',
  './Kplan.css',
  './Kplan.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            // Open the cache and store the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache Google Analytics or other external API requests
                if (!event.request.url.includes('google-analytics.com') &&
                    event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          });
      })
      .catch(() => {
        // If both cache and network fail, show a generic fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});

// Handle offline/online status changes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'NETWORK_STATUS') {
    if (event.data.online) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({
          type: 'ONLINE'
        }));
      });
    } else {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({
          type: 'OFFLINE'
        }));
      });
    }
  }
}); 
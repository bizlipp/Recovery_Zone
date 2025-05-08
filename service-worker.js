const CACHE_NAME = 'kidney-plan-v2';
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.error('Cache install failed:', err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME)
          .map(cache => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'NETWORK_STATUS') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({
        type: event.data.online ? 'ONLINE' : 'OFFLINE'
      }));
    });
  }
});
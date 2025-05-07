/**
 * Kidney Fix-It Plan - Service Worker
 * Handles offline caching and network status monitoring
 */

const CACHE_NAME = 'kidney-plan-v2'; // Bump cache version
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

// Additional assets that should be cached but aren't critical for initial load
const SECONDARY_ASSETS = [
  // Add any sound files or additional resources
  'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and main assets');
        return cache.addAll(ASSETS)
          .then(() => {
            // Try to cache secondary assets but don't block installation if they fail
            return cache.addAll(SECONDARY_ASSETS).catch(err => {
              console.warn('Secondary assets failed to cache:', err);
              // Continue with installation even if secondary assets fail
              return Promise.resolve();
            });
          });
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
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
          console.log('Deleting outdated cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker now active, controlling clients');
      return self.clients.claim();
    })
  );
});

// Helper function for network-first strategy with timeout
const timeoutNetworkFirst = async (request, timeout = 3000) => {
  // Create a timeout promise
  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => resolve(new Response('Network timeout')), timeout);
  });

  try {
    // Try network first with timeout
    const networkPromise = fetch(request.clone());
    const race = await Promise.race([networkPromise, timeoutPromise]);
    
    // If we got a valid response from the network
    if (race instanceof Response && race.status === 200) {
      const response = race.clone();
      
      // Cache the response if it's valid and not an analytics or external API request
      if (!request.url.includes('google-analytics.com') && 
          request.url.startsWith(self.location.origin)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      
      return response;
    }
    
    // If network failed or timed out, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If both network and cache failed and it's an HTML request, serve fallback
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('./index.html');
    }
    
    // Otherwise return the network response (even if it failed)
    return race;
  } catch (error) {
    console.error('Network-first fetch failed:', error);
    
    // Try cache as backup
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If cache also fails for HTML, use fallback
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('./index.html');
    }
    
    // Otherwise throw the error
    throw error;
  }
};

// Fetch event - improved implementation with better strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
      !event.request.url.startsWith('https://assets.mixkit.co')) {
    return;
  }
  
  // For HTML navigation requests, use network-first with timeout & fallback
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(timeoutNetworkFirst(event.request));
    return;
  }
  
  // For CSS/JS/assets, use cache-first strategy
  if (event.request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff2|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return the response
          if (response) {
            return response;
          }
          
          // Clone the request
          const fetchRequest = event.request.clone();
          
          // Make network request
          return fetch(fetchRequest).then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to cache it
            const responseToCache = response.clone();
            
            // Open the cache and store the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }).catch(() => {
            // If network fails, return fallback if available
            if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
              return new Response('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" font-size="12" text-anchor="middle">Image</text></svg>', 
                { headers: { 'Content-Type': 'image/svg+xml' } });
            }
          });
        })
    );
    return;
  }
  
  // For all other requests, use network-first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If this is a valid response that could be cached
        if (response && response.status === 200 && response.type === 'basic') {
          // Clone the response 
          const responseToCache = response.clone();
          
          // Store in cache if not analytics
          if (!event.request.url.includes('google-analytics.com')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If cache fails for HTML requests, return index
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
            
            // Otherwise let the error propagate
            return new Response('Network and cache both failed', {status: 503});
          });
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
  } else if (event.data && event.data.type === 'SKIP_WAITING') {
    // Allow for manual updates
    self.skipWaiting();
  }
});

// Listen for app updates
self.addEventListener('updatefound', () => {
  const newWorker = self.registration.installing;
  
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && self.clients.matchAll) {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({
          type: 'UPDATE_AVAILABLE'
        }));
      });
    }
  });
}); 
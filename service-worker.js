/**
 * Kidney Fix-It Plan - Service Worker
 * Handles offline caching and network status monitoring
 * Version 3.0
 */

const CACHE_NAME = 'kidney-plan-v3'; // Updated cache version
const API_CACHE_NAME = 'kidney-plan-api-v1'; // Separate cache for API responses
const STATIC_CACHE_NAME = 'kidney-plan-static-v1'; // Static resources cache

// Core assets that must be cached for the app to function
const CORE_ASSETS = [
  './',
  './index.html',
  './Kplan.css',
  './Kplan.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/offline.html' // Dedicated offline page
];

// Additional assets for enhanced experience
const SECONDARY_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-interface-option-select-2573.mp3'
];

// Install event - cache assets and create dedicated offline page if needed
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching core static assets');
        return cache.addAll(CORE_ASSETS);
      }),
      
      // Cache secondary assets in a separate promise to prevent blocking installation
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching secondary assets');
        return cache.addAll(SECONDARY_ASSETS).catch(err => {
          console.warn('Secondary assets failed to cache completely:', err);
          // Continue with installation even if secondary assets fail
          return Promise.resolve();
        });
      }),
      
      // Create a basic offline page if it doesn't exist
      createOfflinePage()
    ])
    .then(() => self.skipWaiting())
    .catch(error => {
      console.error('Pre-caching failed:', error);
    })
  );
});

// Function to create a basic offline page if it doesn't exist
async function createOfflinePage() {
  const offlinePagePath = './assets/offline.html';
  const offlinePageContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Kidney Fix-It Plan</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f5f5f5;
          color: #333;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
          text-align: center;
        }
        .offline-container {
          max-width: 500px;
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #0e766e; }
        p { line-height: 1.6; }
        .icon { font-size: 48px; color: #0e766e; margin-bottom: 20px; }
        .button {
          background: #0e766e;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: bold;
          margin-top: 20px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">⚠️</div>
        <h1>You're Offline</h1>
        <p>You appear to be offline, and we can't load the Kidney Fix-It Plan app.</p>
        <p>Your progress is saved locally, and the app will be available when you reconnect.</p>
        <button class="button" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;
  
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const existingResponse = await cache.match(offlinePagePath);
    
    if (!existingResponse) {
      // If offline page doesn't exist yet, create it
      const response = new Response(offlinePageContent, {
        headers: { 'Content-Type': 'text/html' }
      });
      await cache.put(offlinePagePath, response);
      console.log('Created offline page');
    }
  } catch (error) {
    console.error('Failed to create offline page:', error);
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return (
            cacheName !== CACHE_NAME && 
            cacheName !== API_CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME
          );
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

// Helper function for adaptive network-first strategy with timeout
const adaptiveNetworkFirst = async (request, options = {}) => {
  const { timeout = 3000, cacheName = CACHE_NAME, cacheDuration = 86400000 } = options;
  
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
      const responseToCache = race.clone();
      
      // Cache the response if it's valid and not an analytics or external API request
      if (!request.url.includes('google-analytics.com') && 
          !request.url.includes('www.google-analytics.com') &&
          !request.url.includes('api.mixpanel.com')) {
        
        const cache = await caches.open(cacheName);
        
        // If this is an API request with API cache name, add expiration metadata
        if (cacheName === API_CACHE_NAME) {
          const expirationTime = Date.now() + cacheDuration;
          const headers = new Headers(responseToCache.headers);
          headers.append('sw-cache-expiration', expirationTime);
          
          const modifiedResponse = new Response(await responseToCache.blob(), {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          });
          
          cache.put(request, modifiedResponse);
        } else {
          cache.put(request, responseToCache.clone());
        }
      }
      
      return responseToCache;
    }
    
    // If network failed or timed out, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check expiration for API responses
      if (cacheName === API_CACHE_NAME) {
        const expirationTimeStr = cachedResponse.headers.get('sw-cache-expiration');
        if (expirationTimeStr) {
          const expirationTime = parseInt(expirationTimeStr, 10);
          
          // If cache has expired, try to refresh in background but return cached response
          if (Date.now() > expirationTime) {
            refreshCacheInBackground(request);
          }
        }
      }
      
      return cachedResponse;
    }
    
    // If both network and cache failed and it's an HTML request, serve offline fallback
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('./assets/offline.html') || caches.match('./index.html');
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
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('./assets/offline.html') || caches.match('./index.html');
    }
    
    // Otherwise throw the error
    throw error;
  }
};

// Helper function to refresh cache in background (without blocking)
function refreshCacheInBackground(request) {
  setTimeout(() => {
    fetch(request.clone())
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(API_CACHE_NAME).then(cache => {
            // Add expiration metadata
            const expirationTime = Date.now() + 86400000; // 24 hours
            const headers = new Headers(clone.headers);
            headers.append('sw-cache-expiration', expirationTime);
            
            const modifiedResponse = new Response(clone.body, {
              status: clone.status,
              statusText: clone.statusText,
              headers: headers
            });
            
            cache.put(request, modifiedResponse);
          });
        }
      })
      .catch(err => {
        console.log('Background refresh failed:', err);
        // This is non-blocking, so we just log the error
      });
  }, 0);
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip irrelevant cross-origin requests that we don't need to handle
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://cdnjs.cloudflare.com') &&
      !event.request.url.startsWith('https://assets.mixkit.co')) {
    return;
  }
  
  // For navigation requests, use network-first with timeout & fallback
  if (event.request.mode === 'navigate' || 
      (event.request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(adaptiveNetworkFirst(event.request, {
      timeout: 4000,
      cacheName: STATIC_CACHE_NAME
    }));
    return;
  }
  
  // For CSS/JS files, use cache-first with network fallback
  if (event.request.url.match(/\.(css|js)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Refresh cache in background
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(STATIC_CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });
                }
              })
              .catch(() => {
                console.log('Background refresh failed, but using cached version');
              });
            
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
    return;
  }
  
  // For images, fonts and media, use cache-first strategy
  if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|woff2|mp3|webp|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Otherwise fetch from network
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response to cache it
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // Return SVG placeholder for images
              if (event.request.url.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
                return new Response(
                  `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="#f5f5f5"/>
                    <text x="50%" y="50%" font-size="24" text-anchor="middle" fill="#999">Image</text>
                  </svg>`, 
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              
              // For audio, return empty response
              if (event.request.url.match(/\.(mp3)$/)) {
                return new Response('', { status: 200 });
              }
            });
        })
    );
    return;
  }
  
  // For all other requests, use network-first with cache fallback
  event.respondWith(adaptiveNetworkFirst(event.request));
});

// Periodic cleanup of expired caches
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCache());
  }
});

// Also attempt cleanup on activation
async function cleanupExpiredCache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const expirationTimeStr = response?.headers.get('sw-cache-expiration');
      
      if (expirationTimeStr) {
        const expirationTime = parseInt(expirationTimeStr, 10);
        if (Date.now() > expirationTime) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

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

// Notify clients about updates
self.addEventListener('updatefound', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE'
      });
    });
  });
}); 
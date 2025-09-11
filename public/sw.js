const CACHE_NAME = 'crypto-tracker-v2';
// Only cache static assets that we know exist and won't change
const urlsToCache = [
  '/manifest.json',
  '/cryptocurrency.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching safe assets only');
        // Only cache assets we're sure exist
        return cache.addAll(urlsToCache.filter(url => url !== '/'));
      })
      .catch(err => {
        console.warn('Service Worker: Failed to cache some assets:', err);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - be very careful not to interfere with JS modules
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NEVER cache or interfere with:
  // - JavaScript modules (.js, .jsx, .mjs files)
  // - API requests
  // - Hot reload/dev requests
  if (
    url.pathname.includes('/assets/') || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.mjs') || 
    url.pathname.endsWith('.jsx') || 
    url.pathname.includes('/api/') ||
    url.hostname.includes('api.') ||
    url.search.includes('hot') ||
    event.request.method !== 'GET'
  ) {
    // Let these requests go directly to network
    return;
  }
  
  // Only handle safe requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }
        
        // For navigation requests, ensure we get the latest
        if (event.request.mode === 'navigate') {
          return fetch(event.request).catch(() => {
            // Fallback to index.html for navigation
            return caches.match('/');
          });
        }
        
        return fetch(event.request);
      })
      .catch(err => {
        console.warn('Service Worker: Fetch failed:', err);
        return fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

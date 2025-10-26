// Service Worker for Fitness Tracker PWA
// Version 1.0.0

const CACHE_NAME = 'fitness-tracker-v1';
const RUNTIME_CACHE = 'fitness-tracker-runtime-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/dashboard',
  '/offline',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching app shell');
      return cache.addAll(PRECACHE_ASSETS).catch((error) => {
        console.error('[ServiceWorker] Precache failed:', error);
        // Don't fail the install if precaching fails
        return Promise.resolve();
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache first, network fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default: try network first
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Clone the response before caching
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineCache = await caches.open(CACHE_NAME);
      const offlinePage = await offlineCache.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }

    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[ServiceWorker] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Background sync (for future implementation)
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // This will be implemented when offline data queuing is added
  console.log('[ServiceWorker] Syncing offline data...');
  return Promise.resolve();
}
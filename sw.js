/* Service Worker - basic offline support (PWA) */
const CACHE_NAME = 'lugosidomotor-v2';

const PRECACHE_PATHS = [
  './',
  'index.html',
  'portfolio.html',
  'cv.html',
  'offline.html',
  'manifest.json',
  'styles/main.css',
  'styles/cv.css',
  'scripts/main.js',
  'images/profile.jpg',
  'images/profile-260.jpg',
  'images/profile-160.jpg',
  'favicon/favicon.svg',
  'favicon/favicon-16.png',
  'favicon/favicon-32.png',
  'favicon/apple-touch-icon.png',
  'favicon/icon-192.png',
  'favicon/icon-512.png'
];

const PRECACHE_URLS = PRECACHE_PATHS.map((p) =>
  new URL(p, self.registration.scope).toString()
);

const OFFLINE_URL = new URL('offline.html', self.registration.scope).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Don't fail the whole install if a single asset is missing.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigations: network-first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Assets: cache-first, then network (and cache)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});



const CACHE_NAME = 'livegame-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/schedule.html',
  '/watch.html',
  '/css/style.css',
  '/css/watch.css',
  '/js/home.js',
  '/js/schedule.js',
  '/js/player.js',
  '/js/chat.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests; let others pass through.
  if (event.request.method !== 'GET') return;

  const reqUrl = new URL(event.request.url);
  const isSameOrigin = reqUrl.origin === self.location.origin;

  event.respondWith((async () => {
    try {
      // Always try network first.
      return await fetch(event.request);
    } catch (err) {
      // For same-origin files, fallback to cache if available.
      if (isSameOrigin) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
      }
      // Ensure a valid Response is always returned.
      return Response.error();
    }
  })());
});

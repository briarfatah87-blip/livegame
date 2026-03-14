const CACHE_NAME = 'livegame-cache-v2';
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
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

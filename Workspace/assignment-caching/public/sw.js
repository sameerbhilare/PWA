var CACHE_STATIC_DATA = 'static-v2';
var CACHE_DYNAMIC_DATA = 'dynamic-v2';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_STATIC_DATA).then((cache) => {
      console.log('[Service Worker] Precaching App Shell.');
      cache.addAll([
        '/',
        '/index.html',
        '/src/js/main.js',
        '/src/js/material.min.js',
        '/src/js/promise.js',
        '/src/js/fetch.js',
        '/src/css/app.css',
        '/src/css/main.css',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');

  caches.keys().then((keySet) => {
    return Promise.all(
      keySet.map((key) => {
        if (key !== CACHE_STATIC_DATA && key !== CACHE_DYNAMIC_DATA) {
          console.log('[Service Worker] Removing cache - ', key);
          return caches.delete(key);
        }
      })
    );
  });

  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Retuning from cache.', event.request.url);
        return cachedResponse;
      } else {
        console.log('[Service Worker] Fetching from server.', event.request.url);
        return fetch(event.request)
          .then((fetchedRespose) => {
            return caches.open(CACHE_DYNAMIC_DATA).then((cache) => {
              // dynamic cache
              cache.put(event.request.url, fetchedRespose.clone());
              return fetchedRespose;
            });
          })
          .catch((err) => {});
      }
    })
  );
});

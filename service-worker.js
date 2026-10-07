/* Tanganyika – Sky Wings Academy — Service Worker
   Developed by Rasul A. Mngazija
   Strategy: network-first for HTML (always check for updates),
             cache-first for assets (fast, offline-friendly). */

const CACHE_NAME = 'tsa-sky-wings-v2';

const CORE = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.png',
  './assets/secondary-logo.png',
  './assets/signature_neha.png',
  './assets/signature_rasul.png',
  './assets/footer1.png',
  './assets/footer2.png',
  './assets/footer3.png'
];

/* Install: pre-cache the app shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(
        CORE.map(url => cache.add(url).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

/* Activate: clean up old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch: network-first for HTML, cache-first for everything else */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate'
              || url.pathname.endsWith('.html')
              || url.pathname.endsWith('/');

  if (isHTML) {
    /* ALWAYS try the network first — so updates are picked up immediately */
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy).catch(() => {}));
          return response;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
  } else {
    /* Cache-first for images, CSS, JS, etc. */
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy).catch(() => {}));
          return response;
        }).catch(() => caches.match('./index.html'));
      })
    );
  }
});

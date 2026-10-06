/* Tanganyika – Sky Wings Academy — Service Worker
   Developed by Rasul A. Mngazija */

const CACHE_NAME = 'tsa-sky-wings-v1';
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
  './assets/footer3.png',
 ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy).catch(() => {}));
        return response;
      })
      .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
  );
});
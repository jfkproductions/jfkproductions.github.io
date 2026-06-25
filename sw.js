/* Kraai Du Toit — PWA service worker (offline shell + installability) */
const CACHE = 'kraai-pwa-v1';
const CORE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/kraai-logo-white.png',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/photos/portrait-hero.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin requests; let YouTube/Spotify/fonts/CDN go straight to network.
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('/index.html')))
  );
});

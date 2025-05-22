const CACHE = 'link-legend-v1';
const CORE = [
  '/',
  '/play',
  '/styles/main.css',      // add or remove as needed
  '/scripts/app.js',       // if you externalize code
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Pass through POSTs and API calls
  if (req.method !== 'GET' || req.url.includes('/api/')) return;

  event.respondWith(
    caches.match(req).then(res => res || fetch(req).then(netRes => {
      // Update cache in background
      const copy = netRes.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return netRes;
    }))
  );
});

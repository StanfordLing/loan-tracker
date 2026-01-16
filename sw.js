const cacheName = 'loantracker-cache-v4';
const filesToCache = [
  './index.html',
  './reset.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(filesToCache)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keyList => Promise.all(keyList.map(key => {
    if (key !== cacheName) return caches.delete(key);
  }))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

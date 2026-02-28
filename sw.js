const CACHE_NAME = 'lich-be-yeu-v5';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];



// Cài đặt Service Worker và lưu trữ file offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Ép Service Worker mới kích hoạt ngay lập tức
});

// Phục vụ file khi không có mạng
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
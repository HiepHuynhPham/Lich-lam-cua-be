const CACHE_NAME = 'lich-be-yeu-v16'; // Mỗi lần push code bạn nhớ tăng số này lên (v12, v13...)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// 1. Cài đặt và ép kích hoạt ngay (Skip Waiting)
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Đang tải tài nguyên mới...');
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Dọn dẹp Cache cũ (Rất quan trọng để máy bé nhận bản mới)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Đang xóa bản cũ: ' + cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Phục vụ file offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
const CACHE_NAME = 'hiragana-learning-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './stroke-data.js',
  './icon-192.png',
  './icon-512.png',
  './images/kanata.png',
  './images/eki.png',
  './images/sunflower.png',
  './images/softcream.png',
  './images/hanabi.png',
  './images/yama.png',
  './images/nori.png',
  './images/hoikuen.png',
  './images/fumikiri.png',
  './images/kotoha.png',
  './images/maguro.png',
  './images/tsuki.png',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時にキャッシュから応答、なければネットワークから取得
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return response;
      });
    })
  );
});

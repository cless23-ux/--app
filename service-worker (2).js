const CACHE_NAME = 'materials-app-shell-v3';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// 앱 화면(껍데기)만 오프라인 캐싱. 실제 데이터(API) 요청은 항상 네트워크로 보내서
// 최신 재고/이력 정보를 받아오도록 함.
self.addEventListener('fetch', function (event) {
  const url = event.request.url;
  const isApiCall = url.indexOf('script.google.com') !== -1;

  if (isApiCall) {
    return; // API 요청은 서비스워커가 가로채지 않고 그대로 네트워크로
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});

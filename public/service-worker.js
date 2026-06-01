self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', () => {
  // Простой кеш, который позволит приложению работать оффлайн
});
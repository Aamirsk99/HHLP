/* Offline cache for The Prime Fit (installed web app on iPhone / Android). */
const CACHE = 'primefit-v11';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'js/foodnames.js', 'js/ingredients.js', 'js/recipes.js', 'js/fooddb.js', 'js/i18n.js', 'js/icons.js',
  'js/planner.js', 'js/store.js', 'js/app.js', 'vendor/pdfjs/pdf.min.js', 'vendor/pdfjs/pdf.worker.min.js',
  'img/logo.jpg', 'img/icon-192.png', 'img/icon-512.png',
  // Clinic admin (admin/), part of the same app.
  'admin/', 'admin/index.html', 'admin/manifest.webmanifest', 'admin/css/admin.css', 'admin/js/core.js', 'admin/js/export.js', 'admin/js/app.js',
  'admin/vendor/jspdf.umd.min.js', 'admin/vendor/jspdf.plugin.autotable.min.js', 'admin/vendor/xlsx.mini.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first so updates arrive quickly; fall back to the cache when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});

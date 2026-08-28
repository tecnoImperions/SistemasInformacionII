const CACHE_NAME = 'turnoya-v1';
const ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.log("SW: Fallo al precargar recursos:", err));
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Fetch Event - Network first, fallback to cache for offline capabilities
self.addEventListener('fetch', (e) => {
  // Ignorar peticiones de Supabase o APIs externas para no interferir con llamadas de red reales
  if (e.request.url.includes('supabase.co') || e.request.url.includes('emailjs.com') || e.request.url.includes('api.resend.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Clonar y almacenar en cache si es un recurso local y es una peticion GET exitosa
        if (e.request.method === 'GET' && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const cacheCopy = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, cacheCopy);
          });
        }
        return res;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});

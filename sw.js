// ═══════════════════════════════════════════════
// SERVICE WORKER — Smart Börsen Ticker
// Version wird bei jedem Update erhöht →
// Browser erkennt Änderung, löscht alten Cache,
// lädt neue Version automatisch
// ═══════════════════════════════════════════════
const VERSION = 'v2.5.1';
const CACHE_NAME = `boersen-ticker-${VERSION}`;

// Dateien die gecached werden sollen
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ── INSTALL: neuen Cache befüllen ──────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Einzeln cachen — wenn icon fehlt, kein Absturz
      return Promise.allSettled(
        CACHE_FILES.map(file =>
          cache.add(file).catch(() => {/* Datei fehlt — ignorieren */})
        )
      );
    })
  );
  // Sofort übernehmen ohne auf Tab-Close zu warten
  self.skipWaiting();
});

// ── ACTIVATE: alte Caches löschen ─────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('boersen-ticker-') && key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Alter Cache gelöscht:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-first, Netz als Fallback ──────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API-Requests niemals cachen (Yahoo, Finnhub etc.)
  if (
    url.hostname.includes('yahoo') ||
    url.hostname.includes('finnhub') ||
    url.hostname.includes('twelvedata') ||
    url.hostname.includes('alphavantage') ||
    url.hostname.includes('allorigins') ||
    url.hostname.includes('corsproxy') ||
    url.hostname.includes('codetabs') ||
    url.hostname.includes('fonts.googleapis') ||
    url.hostname.includes('rss2json')
  ) {
    event.respondWith(fetch(event.request).catch(() => new Response('', {status: 503})));
    return;
  }

  // App-Dateien: Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Nur gültige Antworten cachen
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      }).catch(() => cached || new Response('Offline', {status: 503}));
    })
  );
});

// ── SKIP_WAITING Nachricht empfangen ──────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

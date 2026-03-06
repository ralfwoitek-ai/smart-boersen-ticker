// Smart Börsen Ticker – Service Worker
// Caching-Strategie: Cache-First für App-Shell, Network-First für API-Daten

const CACHE_NAME  = 'boersen-ticker-v1';
const CACHE_URLS  = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap',
];

// ── Install: App-Shell cachen ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: Alte Caches löschen ─────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Strategie je nach Request-Typ ──────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API-Requests: immer vom Netz (kein Cache)
  if (
    url.hostname.includes('yahoo') ||
    url.hostname.includes('finnhub') ||
    url.hostname.includes('twelvedata') ||
    url.hostname.includes('alphavantage') ||
    url.hostname.includes('allorigins')
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Google Fonts: Cache-First
  if (url.hostname.includes('fonts.googleapis') || url.hostname.includes('fonts.gstatic')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // App-Shell: Cache-First, Fallback auf index.html
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// ── Background Sync (optional) ────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-market-data') {
    // Zukünftig: Background-Fetch für Push-Notifications
  }
});

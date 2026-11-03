// برنامه‌ی روزانه — سرویس‌ورکر (نسخه‌ی ۴): کار کردن کامل بدون اینترنت
const CACHE = 'tasks-fa-v4';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const FONT_CSS = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css';
const FONT_HOSTS = ['cdn.jsdelivr.net'];

// Download the Persian font once so it also works offline. Never blocks install if the network/CDN is unavailable.
async function precacheFont(cache) {
  try {
    const res = await fetch(FONT_CSS);
    if (!res.ok) return;
    await cache.put(FONT_CSS, res.clone());
    const css = await res.text();
    const base = FONT_CSS.slice(0, FONT_CSS.lastIndexOf('/') + 1);
    const urls = [...css.matchAll(/url\(([^)]+)\)/g)]
      .map(m => m[1].replace(/["']/g, '').trim())
      .filter(u => /\.(woff2?|ttf)(\?|$)/i.test(u))
      .map(u => new URL(u, base).href);
    await Promise.all([...new Set(urls)].slice(0, 10).map(u =>
      fetch(u).then(r => { if (r.ok) return cache.put(u, r); }).catch(() => {})
    ));
  } catch (e) { /* offline or blocked: system font is used */ }
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(CORE);
      await precacheFont(cache);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(ms, p) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !FONT_HOSTS.includes(url.hostname)) return;

  e.respondWith(caches.open(CACHE).then(cache => {
    if (same) {
      // network first (updates appear immediately), but fall back fast to the cache when offline or the network is slow/filtered
      return withTimeout(3500, fetch(req)).then(res => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() =>
        cache.match(req, { ignoreSearch: true }).then(hit => hit || cache.match('./index.html'))
      );
    }
    // fonts: cache first, refresh in the background
    return cache.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    });
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow('./index.html');
    })
  );
});

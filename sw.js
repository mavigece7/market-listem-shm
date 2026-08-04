const ONBELLEK_ADI = "market-listem-v1";

const YEREL_DOSYALAR = [
  "./",
  "./index.html",
  "./app.jsx",
  "./icons.jsx",
  "./storage-polyfill.js",
  "./sync-drive.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

// CDN'den yüklenen (React, Babel vb.) dosyaları da önbelleğe alıp
// internet olmadığında da uygulamanın açılmasını sağlıyoruz.
const CDN_DOSYALAR = [
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://cdn.tailwindcss.com",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(ONBELLEK_ADI).then(async (onbellek) => {
      await onbellek.addAll(YEREL_DOSYALAR);
      // CDN dosyaları başarısız olursa kurulumu engellemesin
      await Promise.all(
        CDN_DOSYALAR.map((url) =>
          fetch(url, { mode: "no-cors" })
            .then((r) => onbellek.put(url, r))
            .catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((isimler) =>
      Promise.all(isimler.filter((n) => n !== ONBELLEK_ADI).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((yanit) => {
      if (yanit) return yanit;
      return fetch(e.request)
        .then((agYaniti) => {
          const kopya = agYaniti.clone();
          caches.open(ONBELLEK_ADI).then((onbellek) => onbellek.put(e.request, kopya));
          return agYaniti;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

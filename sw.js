// v2: CDN dosyalarını (React, Babel, Tailwind) artık önbelleğe zorla almaya
// çalışmıyoruz — bu, "opaque response" hatasına ve React'in hiç yüklenmemesine
// yol açıyordu. Şimdi sadece KENDİ sitemizden (aynı origin) gelen istekleri
// önbelleğe alıyoruz; CDN, font, tarayıcı eklentisi vb. her şeyi olduğu gibi
// tarayıcıya bırakıyoruz.
const ONBELLEK_ADI = "market-listem-v2";

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

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(ONBELLEK_ADI)
      .then((onbellek) => onbellek.addAll(YEREL_DOSYALAR))
      .catch(() => {})
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
  const istek = e.request;
  if (istek.method !== "GET") return;

  let url;
  try {
    url = new URL(istek.url);
  } catch (err) {
    return;
  }

  // Sadece aynı origin'den (kendi sitemiz) gelen istekleri ele alıyoruz.
  // CDN (unpkg, tailwind, google vb.) ve tarayıcı eklentisi istekleri
  // (chrome-extension://) service worker'a hiç uğramadan normal şekilde gider.
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(istek).then((onbellekYaniti) => {
      if (onbellekYaniti) return onbellekYaniti;
      return fetch(istek)
        .then((agYaniti) => {
          if (agYaniti && agYaniti.ok) {
            const kopya = agYaniti.clone();
            caches.open(ONBELLEK_ADI).then((onbellek) => onbellek.put(istek, kopya));
          }
          return agYaniti;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

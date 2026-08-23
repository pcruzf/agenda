/* Permite abrir la agenda sin conexión.
   Si cambiás index.html, subí también este archivo con un CACHE nuevo
   (por ejemplo "agenda-v3") para que el celular tome la versión nueva. */
const CACHE = "agenda-v23";
const BASE = [ "./", "./index.html", "./tablero.html", "./manifest.json",
               "./icon-180.png", "./icon-192.png", "./icon-512.png" ];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  /* Solo se borran las versiones viejas de ESTE prefijo. Antes borraba todo lo
     demás del dominio, así que producción y una copia de prueba en otra
     carpeta se destruían el caché mutuamente. */
  const PREFIJO = CACHE.split("-")[0] + "-";
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks
        .filter(k => k.indexOf(PREFIJO) === 0 && k !== CACHE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Google y la API de Drive nunca se guardan en caché.
  if (url.origin !== location.origin) return;
  if (e.request.method !== "GET") return;

  // Red primero, con la copia guardada como respaldo.
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

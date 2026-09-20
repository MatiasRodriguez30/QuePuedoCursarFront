// Service worker de la PWA.
//
// Estrategias:
//   - Assets con hash en el nombre (/assets/*): cache-first. El contenido de
//     una URL hasheada nunca cambia, así que sirve desde cache y no toca la
//     red. Es lo que permite que la app abra al instante y offline.
//   - Navegaciones (el HTML): network-first con fallback al último HTML
//     cacheado, para no quedar sirviendo un index viejo que apunte a assets
//     que ya no existen, pero seguir abriendo sin conexión.
//   - Todo lo demás (API, WebSocket, fuentes): pasa derecho a la red. Las
//     respuestas del backend son por usuario y cambian en tiempo real; su
//     cacheo lo maneja la app en localStorage, no el service worker.

const CACHE = 'qpc-v1'
const SHELL = ['/', '/manifest.json', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).catch(() => { /* la app funciona igual sin precache */ })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(c => c !== CACHE).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  )
})

function esAssetHasheado(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/assets/')
}

async function cacheFirst(request) {
  const cacheado = await caches.match(request)
  if (cacheado) return cacheado
  const respuesta = await fetch(request)
  if (respuesta.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, respuesta.clone())
  }
  return respuesta
}

async function networkFirst(request) {
  try {
    const respuesta = await fetch(request)
    if (respuesta.ok) {
      const cache = await caches.open(CACHE)
      cache.put(request, respuesta.clone())
    }
    return respuesta
  } catch (err) {
    const cacheado = await caches.match(request) || await caches.match('/')
    if (cacheado) return cacheado
    throw err
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (esAssetHasheado(url)) {
    event.respondWith(cacheFirst(request))
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  }
})

// Service worker mínimo: sólo existe para que el navegador permita instalar
// la app (ícono en pantalla de inicio, abre sin barra de navegador). No
// cachea nada todavía (eso es una mejora aparte, a futuro) — cada pedido
// sigue yendo a la red igual que sin service worker.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})

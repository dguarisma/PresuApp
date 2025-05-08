// Nombre del caché
const CACHE_NAME = "gastos-app-v1"

// Recursos para cachear inicialmente
const urlsToCache = [
  "/",
  "/docs",
  "/budget/new",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Estrategia de caché: Network First, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en el caché
        if (event.request.method === "GET" && response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar desde el caché
        return caches.match(event.request)
      }),
  )
})

// Manejo de notificaciones push
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Manejo de clic en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})

// Sincronización en segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-budgets") {
    event.waitUntil(syncBudgets())
  }
})

// Función para sincronizar presupuestos cuando se recupera la conexión
async function syncBudgets() {
  // Aquí iría la lógica para sincronizar datos pendientes
  // cuando se recupera la conexión a internet
  console.log("Sincronizando datos...")
}

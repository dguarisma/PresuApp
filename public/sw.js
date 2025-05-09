// Nombre de la caché
const CACHE_NAME = "presuapp-v1"

// Archivos a cachear inicialmente
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/register-sw.js",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  // Añadir aquí otros recursos estáticos importantes
]

// Instalar el Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...")

  // Esperar hasta que la promesa se resuelva
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Abriendo caché")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("Service Worker: Recursos iniciales cacheados")
        return self.skipWaiting()
      }),
  )
})

// Activar el Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activando...")

  // Limpiar cachés antiguas
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Eliminando caché antigua", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Ahora está activo y controlando la página")
        return self.clients.claim()
      }),
  )
})

// Estrategia de caché: Network first, falling back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si la red falla, intentar desde la caché
        return caches.match(event.request)
      }),
  )
})

// Agregar este manejador de eventos para notificaciones push
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url || "/",
      },
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Manejar clics en las notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Navegar a la URL especificada en la notificación
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
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

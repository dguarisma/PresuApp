// Registrar el Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registrado con éxito:", registration.scope)
      })
      .catch((error) => {
        console.log("Error al registrar el Service Worker:", error)
      })
  })
}

// Verificar si la app ya está instalada
function checkIfInstalled() {
  // Para navegadores modernos
  if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("La aplicación está instalada (display-mode: standalone)")
    return true
  }

  // Para iOS Safari
  if (navigator.standalone === true) {
    console.log("La aplicación está instalada (iOS standalone)")
    return true
  }

  return false
}

// Solicitar permiso para notificaciones
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Función para mostrar una notificación
function showNotification(title, options = {}) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body: options.body || "",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        ...options,
      })
    })
  }
}

// Verificar estado de conexión
function updateOnlineStatus() {
  const statusElement = document.getElementById("connection-status")
  if (statusElement) {
    if (navigator.onLine) {
      statusElement.textContent = "En línea"
      statusElement.classList.remove("text-red-500")
      statusElement.classList.add("text-green-500")
    } else {
      statusElement.textContent = "Sin conexión"
      statusElement.classList.remove("text-green-500")
      statusElement.classList.add("text-red-500")
    }
  }
}

// Eventos para detectar cambios en la conexión
window.addEventListener("online", updateOnlineStatus)
window.addEventListener("offline", updateOnlineStatus)

// Detectar si es iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

// Mostrar instrucciones para iOS
function showIOSInstallInstructions() {
  if (isIOS() && !checkIfInstalled()) {
    console.log("Mostrando instrucciones de instalación para iOS")
    // Aquí podrías mostrar un elemento UI con instrucciones
    // o disparar un evento personalizado que el componente React pueda escuchar
    window.dispatchEvent(new CustomEvent("showIOSInstallPrompt"))
  }
}

// Exponer funciones globalmente
window.pwa = {
  requestNotificationPermission,
  showNotification,
  checkIfInstalled,
  isIOS,
  showIOSInstallInstructions,
}

// Verificar si debemos mostrar instrucciones para iOS
// Esperar un poco para que la página se cargue completamente
setTimeout(() => {
  if (isIOS() && !checkIfInstalled()) {
    // Solo mostrar después de que el usuario haya interactuado con la página por un tiempo
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
    if (!hasVisitedBefore) {
      localStorage.setItem("hasVisitedBefore", "true")
    } else {
      showIOSInstallInstructions()
    }
  }
}, 3000)

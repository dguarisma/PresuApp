"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Verificar si es la primera carga de la sesión
    const hasLoaded = sessionStorage.getItem("appHasLoaded")

    if (!hasLoaded) {
      // Es la primera carga, mostrar la pantalla de carga
      setVisible(true)

      // Marcar que la app ya se ha cargado en esta sesión
      sessionStorage.setItem("appHasLoaded", "true")

      // Ocultar después de 2.5 segundos
      const timer = setTimeout(() => {
        setVisible(false)
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [])

  // Si no es visible, no renderizar nada
  if (!visible) return null

  return (
    <div className={`splash-screen ${!visible ? "hidden" : ""}`}>
      <div className="splash-logo">
        <Image src="/logo.png" alt="PresuApp Logo" width={120} height={120} priority />
      </div>
      <div className="mt-8 w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-progress"></div>
      </div>
      <p className="mt-4 text-muted-foreground">Cargando...</p>
    </div>
  )
}

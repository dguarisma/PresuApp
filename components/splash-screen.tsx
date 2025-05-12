"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Verificar si es la primera carga de la sesión
    const hasLoaded = sessionStorage.getItem("appHasLoaded")

    if (hasLoaded) {
      setShow(false)
      return
    }

    // Marcar que la app ya ha cargado en esta sesión
    sessionStorage.setItem("appHasLoaded", "true")

    const timer = setTimeout(() => {
      setShow(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500">
      <div className="flex flex-col items-center">
        <div className="animate-bounce mb-4">
          <Image src="/logo.png" alt="PresuApp Logo" width={80} height={80} priority />
        </div>
        <h1 className="text-2xl font-bold text-primary animate-pulse">PresuApp</h1>
      </div>
    </div>
  )
}

"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function StatusBar() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Verificar si la app está en modo standalone
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")

    setIsStandalone(isInStandaloneMode)
  }, [])

  // No renderizar nada durante SSR o si no está en modo standalone
  if (!mounted || !isStandalone) return null

  return (
    <div
      className="status-bar"
      style={{
        backgroundColor: resolvedTheme === "dark" ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
      }}
    />
  )
}

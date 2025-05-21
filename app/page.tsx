"use client"

import { useEffect, useState, Suspense } from "react"
import BudgetList from "@/components/budget-list"
import { ModeToggle } from "@/components/mode-toggle"
import { PWAInstaller } from "@/components/pwa-installer"
import { useTranslation } from "@/contexts/translation-context"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { DataPrefetcher } from "@/components/data-prefetcher"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function Home() {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState(false)
  const [key, setKey] = useState(Date.now()) // Añadimos un key para forzar re-renderizado
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Marcar como cargado después de un pequeño retraso para asegurar que la splash screen se muestre
    const timer = setTimeout(() => {
      setLoaded(true)
    }, 300)

    // Verificar estado de conexión
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Forzar una recarga de la página cuando se vuelve a ella
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Forzar una actualización del componente
        setIsOffline(navigator.onLine ? false : true)
        setKey(Date.now()) // Forzar re-renderizado al volver a la página
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearTimeout(timer)
    }
  }, [])

  // Function to handle the floating action button click
  const handleCreateBudgetClick = () => {
    // Dispatch a custom event that BudgetList will listen for
    const event = new CustomEvent("openCreateBudgetDialog")
    window.dispatchEvent(event)
  }

  return (
    <div className="min-h-full bg-background">
      {/* Componente invisible para precargar datos */}
      <DataPrefetcher />

      {isOffline && (
        <div className="offline-indicator" role="alert" aria-live="assertive">
          <span>{t("app.offlineMode")}</span>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 flex flex-col min-h-[100vh]">
        <header className="flex justify-center items-center py-4 mb-4 fade-in-up">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="PresuApp Logo" className="h-16 mb-2" />
            <p className="text-sm text-muted-foreground mt-1">{t("app.slogan")}</p>
          </div>
          <div className="absolute right-4 top-4">
            <ModeToggle />
          </div>
        </header>
        <PWAInstaller />
        <main className="flex-1">
          <main className="container mx-auto py-6 max-w-5xl">
            <div className="stagger-item stagger-delay-1">
              <Suspense fallback={<SkeletonLoader type="list" />}>
                <BudgetList key={key} /> {/* Usamos key para forzar re-renderizado */}
              </Suspense>
            </div>
          </main>
        </main>
      </div>
      {/* Floating Action Button */}
      <Button
        onClick={handleCreateBudgetClick}
        className="fixed bottom-28 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-teal-500 hover:bg-teal-600 text-white"
        aria-label="Add new budget"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}

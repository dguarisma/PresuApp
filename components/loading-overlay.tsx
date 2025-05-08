"use client"

import { createContext, useContext, useState, type ReactNode, useRef, useEffect } from "react"
import { useTranslation } from "@/hooks/use-translations"

// Crear contexto para el estado de carga global
interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// Proveedor del contexto de carga
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoadingState] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()

  // Función mejorada para establecer el estado de carga
  const setIsLoading = (loading: boolean) => {
    // Limpiar cualquier timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Si estamos activando la carga, establecer un timeout de seguridad
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        console.log("Timeout de seguridad activado - desactivando carga")
        setIsLoadingState(false)
      }, 500) // 500ms como máximo de carga (reducido de 5000ms)
    }

    setIsLoadingState(loading)
  }

  // Limpiar el timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium">{t("common.loading")}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

// Hook para usar el contexto de carga
export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading debe ser usado dentro de un LoadingProvider")
  }
  return context
}

"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

export function LoadingOverlay() {
  return (
    <div className="flex items-center justify-center w-full h-40">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

export default LoadingProvider

"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Tipo para las funciones de precarga de datos
type PrefetchFunction = () => Promise<any>

// Mapa de rutas a funciones de precarga
const prefetchMap: Record<string, PrefetchFunction[]> = {
  // Ejemplo: precargar datos para la página principal
  "/": [
    // Aquí irían las funciones para precargar datos específicos
    // Por ejemplo, obtener la lista de presupuestos
    async () => {
      try {
        // Simulación de precarga de datos
        const localStorageData = localStorage.getItem("budgets")
        if (localStorageData) {
          // Procesar datos si es necesario
          return JSON.parse(localStorageData)
        }
      } catch (error) {
        console.error("Error prefetching data:", error)
      }
    },
  ],
  // Otras rutas pueden tener sus propias funciones de precarga
}

// Patrones de ruta para coincidencias parciales
const patternPrefetchMap: Record<string, PrefetchFunction[]> = {
  "/budget/": [
    // Precargar datos comunes para todas las páginas de presupuesto
    async () => {
      try {
        // Simulación de precarga de datos
        const localStorageData = localStorage.getItem("categories")
        if (localStorageData) {
          return JSON.parse(localStorageData)
        }
      } catch (error) {
        console.error("Error prefetching pattern data:", error)
      }
    },
  ],
}

export function useDataPrefetcher() {
  const currentPath = usePathname()
  const prefetchedData = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Función para ejecutar la precarga de datos
    const prefetchData = async () => {
      // Verificar coincidencias exactas
      const exactMatchFunctions = prefetchMap[currentPath]
      if (exactMatchFunctions) {
        for (const prefetchFn of exactMatchFunctions) {
          const cacheKey = `${currentPath}-${prefetchFn.toString().slice(0, 20)}`
          if (!prefetchedData.current.has(cacheKey)) {
            prefetchedData.current.add(cacheKey)
            await prefetchFn()
          }
        }
      }

      // Verificar coincidencias de patrón
      for (const [pattern, functions] of Object.entries(patternPrefetchMap)) {
        if (currentPath.includes(pattern)) {
          for (const prefetchFn of functions) {
            const cacheKey = `${pattern}-${prefetchFn.toString().slice(0, 20)}`
            if (!prefetchedData.current.has(cacheKey)) {
              prefetchedData.current.add(cacheKey)
              await prefetchFn()
            }
          }
        }
      }
    }

    prefetchData()
  }, [currentPath])
}

"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

// Definir las rutas comunes que queremos precargar
const commonRoutes = ["/", "/opciones", "/configuracion", "/accesibilidad", "/alertas", "/metas-ahorro"]

// Definir patrones de rutas relacionadas
const relatedRoutePatterns: Record<string, string[]> = {
  "/budget/": ["/budget/new"],
  "/budget/[id]": ["/analysis", "/metas"],
}

export function useRoutePrefetcher() {
  const router = useRouter()
  const currentPath = usePathname()
  const prefetchedRoutes = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Función para precargar una ruta si no ha sido precargada ya
    const prefetchRoute = (route: string) => {
      if (!prefetchedRoutes.current.has(route)) {
        router.prefetch(route)
        prefetchedRoutes.current.add(route)
      }
    }

    // Precargar rutas comunes
    commonRoutes.forEach(prefetchRoute)

    // Precargar rutas relacionadas basadas en la ruta actual
    for (const [pattern, relatedRoutes] of Object.entries(relatedRoutePatterns)) {
      if (currentPath.includes(pattern)) {
        // Si estamos en una ruta que coincide con el patrón, precargar las rutas relacionadas
        relatedRoutes.forEach((relatedRoute) => {
          // Si el patrón incluye [id], reemplazarlo con el ID actual
          if (pattern.includes("[id]") && currentPath.includes("/budget/")) {
            const id = currentPath.split("/")[2] // Extraer el ID de la URL actual
            const fullRoute = `/budget/${id}${relatedRoute}`
            prefetchRoute(fullRoute)
          } else {
            prefetchRoute(pattern + relatedRoute)
          }
        })
      }
    }

    // Precargar rutas específicas basadas en la ruta actual
    if (currentPath === "/") {
      // En la página principal, precargar la página de nuevo presupuesto
      prefetchRoute("/budget/new")
    } else if (currentPath.startsWith("/budget/") && !currentPath.includes("/new")) {
      // En la página de un presupuesto, precargar análisis y metas
      const id = currentPath.split("/")[2]
      prefetchRoute(`/budget/${id}/analysis`)
      prefetchRoute(`/budget/${id}/metas`)
    }
  }, [currentPath, router])
}

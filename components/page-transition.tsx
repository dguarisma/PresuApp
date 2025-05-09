"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, useRef, type ReactNode } from "react"
import { useTheme } from "next-themes"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitioning, setTransitioning] = useState(false)
  const previousPathRef = useRef<string | null>(null)
  const { resolvedTheme } = useTheme()

  // Referencia al contenedor para aplicar estilos de fondo
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Solo activar la transición si no es la primera carga y la ruta ha cambiado
    if (previousPathRef.current && previousPathRef.current !== pathname) {
      // Iniciar transición
      setTransitioning(true)

      // Mantener el contenido actual visible durante un breve período
      const timer = setTimeout(() => {
        // Actualizar el contenido mientras está invisible
        setDisplayChildren(children)

        // Esperar un poco para asegurar que el nuevo contenido esté listo
        setTimeout(() => {
          // Mostrar el nuevo contenido
          setTransitioning(false)
        }, 50)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      // Primera carga, simplemente mostrar el contenido
      setDisplayChildren(children)
      previousPathRef.current = pathname
    }
  }, [pathname, children])

  // Actualizar la referencia de la ruta actual
  useEffect(() => {
    previousPathRef.current = pathname
  }, [pathname])

  // Aplicar el color de fondo adecuado según el tema
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.backgroundColor =
        resolvedTheme === "dark"
          ? "hsl(222.2 84% 4.9%)" // Color de fondo oscuro
          : "hsl(0 0% 100%)" // Color de fondo claro
    }
  }, [resolvedTheme])

  return (
    <div
      ref={containerRef}
      className={`transition-opacity duration-300 min-h-screen ${transitioning ? "opacity-0" : "opacity-100"}`}
    >
      {displayChildren}
    </div>
  )
}

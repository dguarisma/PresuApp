"use client"

import { useState, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const threshold = 80 // Distancia mínima para activar la actualización

  useEffect(() => {
    let startY = 0
    let currentY = 0

    const handleTouchStart = (e: TouchEvent) => {
      // Solo activar si estamos en la parte superior de la página
      if (window.scrollY <= 0) {
        startY = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)

      // Aplicar resistencia para que no se pueda tirar infinitamente
      const resistedDistance = Math.min(distance * 0.4, threshold * 1.5)

      setPullDistance(resistedDistance)

      // Prevenir el scroll normal si estamos tirando hacia abajo
      if (distance > 0 && window.scrollY <= 0) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (pullDistance >= threshold) {
        // Activar la actualización
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }

      // Resetear el estado
      setPullDistance(0)
      setIsPulling(false)
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: false })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, pullDistance, onRefresh, threshold])

  return (
    <div className="relative">
      <div
        className={cn("pull-indicator", (pullDistance > 0 || isRefreshing) && "visible")}
        style={{
          transform: isRefreshing ? "translateY(0)" : `translateY(${pullDistance - 50}px)`,
        }}
      >
        <div className="pull-spinner" />
      </div>

      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}

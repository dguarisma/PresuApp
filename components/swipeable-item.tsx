"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useSwipeGesture } from "@/hooks/use-swipe-gesture"
import { Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SwipeableItemProps {
  onEdit?: () => void
  onDelete?: () => void
  children: React.ReactNode
  className?: string
  deleteText?: string
  editText?: string
  threshold?: number
  preventScroll?: boolean
}

export function SwipeableItem({
  onEdit,
  onDelete,
  children,
  className,
  deleteText = "Eliminar",
  editText = "Editar",
  threshold = 80,
  preventScroll = false,
}: SwipeableItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const { swiping, swipeDistance, direction } = useSwipeGesture(
    itemRef,
    {
      onSwipeLeft: () => {
        setIsRevealed(true)
      },
      onSwipeRight: () => {
        setIsRevealed(false)
      },
      onSwipeEnd: () => {
        // Si el deslizamiento no fue suficiente, volver al estado original
        if (Math.abs(swipeDistance) < threshold) {
          setIsRevealed(false)
        }
      },
    },
    { threshold, preventScroll },
  )

  // Calcular la transformación basada en el deslizamiento
  const getTransform = () => {
    if (isRevealed && !swiping) {
      // Si está revelado y no se está deslizando, mostrar completamente
      return `translateX(${onEdit && onDelete ? -160 : -80}px)`
    }

    if (swiping && direction === "left") {
      // Limitar el deslizamiento a la izquierda al ancho de los botones
      const maxDistance = onEdit && onDelete ? 160 : 80
      const distance = Math.min(Math.abs(swipeDistance), maxDistance)
      return `translateX(${-distance}px)`
    }

    if (swiping && direction === "right" && isRevealed) {
      // Si ya está revelado y desliza a la derecha, cerrar gradualmente
      const maxDistance = onEdit && onDelete ? 160 : 80
      const distance = maxDistance + swipeDistance
      return `translateX(${-Math.max(0, distance)}px)`
    }

    return "translateX(0)"
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRevealed(false)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit()
      setIsRevealed(false)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete()
      setIsRevealed(false)
    }
  }

  return (
    <div className={cn("relative overflow-hidden touch-pan-y", className)} onClick={handleReset}>
      {/* Acciones de deslizamiento */}
      <div
        className="absolute inset-y-0 right-0 flex h-full"
        style={{
          width: onEdit && onDelete ? "160px" : "80px",
        }}
      >
        {onEdit && (
          <button onClick={handleEdit} className="flex items-center justify-center bg-blue-500 text-white w-20 h-full">
            <div className="flex flex-col items-center">
              <Edit className="h-5 w-5 mb-1" />
              <span className="text-xs">{editText}</span>
            </div>
          </button>
        )}
        {onDelete && (
          <button onClick={handleDelete} className="flex items-center justify-center bg-red-500 text-white w-20 h-full">
            <div className="flex flex-col items-center">
              <Trash2 className="h-5 w-5 mb-1" />
              <span className="text-xs">{deleteText}</span>
            </div>
          </button>
        )}
      </div>

      {/* Contenido principal */}
      <div
        ref={itemRef}
        className="relative bg-background transition-transform touch-pan-y"
        style={{
          transform: getTransform(),
          transition: swiping ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  )
}

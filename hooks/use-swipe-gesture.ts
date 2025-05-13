"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
}

interface SwipeOptions {
  threshold?: number
  preventDefaultTouchmove?: boolean
  preventScroll?: boolean
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {},
) {
  const { threshold = 50, preventDefaultTouchmove = true, preventScroll = false } = options
  const [swiping, setSwiping] = useState(false)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)

  const startX = useRef<number | null>(null)
  const currentX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const isVerticalScroll = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      currentX.current = e.touches[0].clientX
      isVerticalScroll.current = false
      setSwiping(true)
      setSwipeDistance(0)
      setDirection(null)

      if (handlers.onSwipeStart) {
        handlers.onSwipeStart()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return

      const currentTouchX = e.touches[0].clientX
      const currentTouchY = e.touches[0].clientY

      // Determine if this is primarily a vertical scroll
      if (!isVerticalScroll.current) {
        const deltaX = Math.abs(currentTouchX - startX.current)
        const deltaY = Math.abs(currentTouchY - startY.current)

        // If vertical movement is greater than horizontal, mark as vertical scroll
        if (deltaY > deltaX && deltaY > 10) {
          isVerticalScroll.current = true
        }
      }

      // If this is a vertical scroll, don't handle the swipe
      if (isVerticalScroll.current) return

      // Prevent default to avoid page scrolling during horizontal swipe
      if (preventDefaultTouchmove || (preventScroll && !isVerticalScroll.current)) {
        e.preventDefault()
      }

      currentX.current = currentTouchX
      const distance = currentTouchX - startX.current
      setSwipeDistance(distance)

      if (distance > 0) {
        setDirection("right")
      } else if (distance < 0) {
        setDirection("left")
      } else {
        setDirection(null)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || currentX.current === null) return

      const distance = currentX.current - startX.current

      if (!isVerticalScroll.current) {
        if (Math.abs(distance) >= threshold) {
          if (distance > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight()
          } else if (distance < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft()
          }
        }
      }

      startX.current = null
      currentX.current = null
      startY.current = null
      isVerticalScroll.current = false
      setSwiping(false)
      setSwipeDistance(0)

      if (handlers.onSwipeEnd) {
        handlers.onSwipeEnd()
      }
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: true })
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchmove })
    element.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [elementRef, handlers, threshold, preventDefaultTouchmove, preventScroll])

  return { swiping, swipeDistance, direction }
}

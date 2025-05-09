"use client"

import { useRoutePrefetcher } from "@/hooks/use-route-prefetcher"

export function RoutePrefetcher() {
  // Este componente no renderiza nada visible, solo ejecuta el hook
  useRoutePrefetcher()
  return null
}

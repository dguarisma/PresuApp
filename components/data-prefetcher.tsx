"use client"

import { useDataPrefetcher } from "@/hooks/use-data-prefetcher"

export function DataPrefetcher() {
  // Este componente no renderiza nada visible, solo ejecuta el hook
  useDataPrefetcher()
  return null
}

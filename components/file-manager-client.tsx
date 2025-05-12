"use client"

import dynamic from "next/dynamic"

// Importar FileManagerOptimized dinámicamente con SSR desactivado
const FileManagerOptimized = dynamic(() => import("@/components/file-manager-optimized"), { ssr: false })

export default function FileManagerClient() {
  return <FileManagerOptimized />
}

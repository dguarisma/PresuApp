"use client"

import dynamic from "next/dynamic"

// Importar FileManager dinámicamente con SSR desactivado
const FileManager = dynamic(() => import("@/components/file-manager"), { ssr: false })

export default function FileManagerClient() {
  return <FileManager />
}

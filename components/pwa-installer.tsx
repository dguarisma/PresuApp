"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PWAInstallerProps {
  inMenu?: boolean
}

export function PWAInstaller({ inMenu = false }: PWAInstallerProps) {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar si la app ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Detectar cuando se completa la instalación
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setIsInstallable(false)
      toast({
        title: "Instalación completada",
        description: "PresuApp se ha instalado correctamente.",
      })
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [toast])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostrar el prompt de instalación
    deferredPrompt.prompt()

    // Esperar a que el usuario responda al prompt
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === "accepted") {
      toast({
        title: "Instalando PresuApp",
        description: "La aplicación se está instalando en tu dispositivo.",
      })
    }

    // Limpiar el prompt guardado
    setDeferredPrompt(null)
  }

  if (!isInstallable || isInstalled) return null

  if (inMenu) {
    return (
      <Button variant="default" size="sm" className="w-full" onClick={handleInstall}>
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Instalar aplicación
      </Button>
    )
  }

  return (
    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleInstall}>
      <Download className="h-4 w-4" />
      <span className="sr-only">Instalar aplicación</span>
    </Button>
  )
}

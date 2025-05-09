"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface PWAInstallerProps {
  inMenu?: boolean
}

export function PWAInstaller({ inMenu = false }: PWAInstallerProps) {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)

  useEffect(() => {
    // Detectar si es iOS (Safari)
    const isIOSDevice = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    }

    setIsIOS(isIOSDevice())

    // Verificar si la app ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true)
    }

    // Verificar si ya se mostró el banner de instalación
    const hasShownInstallPrompt = localStorage.getItem("hasShownInstallPrompt")

    // Capturar el evento beforeinstallprompt (funciona en Chrome, Edge, Opera, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que Chrome muestre el prompt automáticamente
      e.preventDefault()
      // Guardar el evento para usarlo más tarde
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      console.log("PWA es instalable: evento beforeinstallprompt capturado")

      // Mostrar banner de instalación si no se ha mostrado antes
      if (!hasShownInstallPrompt) {
        setTimeout(() => {
          setShowInstallDialog(true)
          localStorage.setItem("hasShownInstallPrompt", "true")
        }, 3000) // Mostrar después de 3 segundos
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Si es iOS y no se ha mostrado el banner antes, mostrar después de un tiempo
    if (isIOSDevice() && !hasShownInstallPrompt && !isInstalled) {
      setTimeout(() => {
        setShowInstallDialog(true)
        localStorage.setItem("hasShownInstallPrompt", "true")
      }, 3000) // Mostrar después de 3 segundos
    }

    // Detectar cuando se completa la instalación
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setShowInstallBanner(false)
      setShowInstallDialog(false)
      console.log("PWA instalada correctamente")
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
    if (isIOS) {
      // En iOS, mostrar instrucciones para instalar
      setShowIOSInstructions(true)
      toast({
        title: "Instalar en iOS",
        description: "Toca 'Compartir' y luego 'Añadir a pantalla de inicio'",
        duration: 5000,
      })
      return
    }

    if (!deferredPrompt) {
      console.log("No hay prompt de instalación disponible")
      return
    }

    try {
      // Mostrar el prompt de instalación
      await deferredPrompt.prompt()

      // Esperar a que el usuario responda al prompt
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("Usuario aceptó la instalación")
        toast({
          title: "Instalando PresuApp",
          description: "La aplicación se está instalando en tu dispositivo.",
        })
      } else {
        console.log("Usuario rechazó la instalación")
      }

      // Limpiar el prompt guardado
      setDeferredPrompt(null)
      setShowInstallBanner(false)
      setShowInstallDialog(false)
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error)
      toast({
        title: "Error",
        description: "No se pudo instalar la aplicación. Inténtalo más tarde.",
        variant: "destructive",
      })
    }
  }

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    // Guardar preferencia para no mostrar de nuevo por un tiempo
    localStorage.setItem("installBannerDismissed", Date.now().toString())
  }

  // Si está instalada, no mostrar nada
  if (isInstalled) return null

  // Si estamos en el menú, mostrar el botón de instalación
  if (inMenu) {
    return (
      <>
        <Button variant="default" size="sm" className="w-full" onClick={handleInstall}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {isIOS ? "Instalar en iOS" : "Instalar aplicación"}
        </Button>

        {showIOSInstructions && isIOS && (
          <div className="mt-2 text-xs p-2 bg-muted rounded-md">
            <p>Para instalar en iOS:</p>
            <ol className="list-decimal pl-4 mt-1">
              <li>Toca el botón Compartir</li>
              <li>Desplázate y toca "Añadir a pantalla de inicio"</li>
              <li>Toca "Añadir" en la parte superior derecha</li>
            </ol>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Botón de instalación normal */}
      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={handleInstall}>
        <Download className="h-4 w-4" />
        <span className="sr-only">Instalar aplicación</span>
      </Button>

      {/* Banner de instalación */}
      {showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg flex items-center justify-between z-50">
          <div className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            <span>Instala PresuApp para una mejor experiencia</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall}>
              Instalar
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissInstallBanner}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Diálogo de instalación */}
      <AlertDialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Instalar PresuApp</AlertDialogTitle>
            <AlertDialogDescription>
              Instala PresuApp en tu dispositivo para acceder rápidamente y disfrutar de una experiencia completa,
              incluso sin conexión a internet.
              {isIOS && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <p className="font-medium">Para instalar en iOS:</p>
                  <ol className="list-decimal pl-4 mt-1">
                    <li>Toca el botón Compartir</li>
                    <li>Desplázate y toca "Añadir a pantalla de inicio"</li>
                    <li>Toca "Añadir" en la parte superior derecha</li>
                  </ol>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ahora no</AlertDialogCancel>
            <AlertDialogAction onClick={handleInstall}>{isIOS ? "Entendido" : "Instalar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Instrucciones de iOS */}
      {showIOSInstructions && isIOS && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md text-xs w-48 z-50">
          <p>Para instalar en iOS:</p>
          <ol className="list-decimal pl-4 mt-1">
            <li>Toca el botón Compartir</li>
            <li>Desplázate y toca "Añadir a pantalla de inicio"</li>
            <li>Toca "Añadir" en la parte superior derecha</li>
          </ol>
        </div>
      )}
    </>
  )
}

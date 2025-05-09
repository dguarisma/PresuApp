"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translations"

export function NotificationTest() {
  const { toast } = useToast()
  const { t } = useTranslation()

  const sendTestNotification = () => {
    // Verificar si las notificaciones están disponibles
    if (!("Notification" in window)) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta notificaciones",
        variant: "destructive",
      })
      return
    }

    // Verificar permiso
    if (Notification.permission === "granted") {
      // Enviar notificación de prueba
      const notification = new Notification("Notificación de prueba", {
        body: "Esta es una notificación de prueba para verificar que funcionan correctamente",
        icon: "/logo.png",
      })

      // Mostrar toast de confirmación
      toast({
        title: "Notificación enviada",
        description: "Se ha enviado una notificación de prueba",
      })
    } else if (Notification.permission !== "denied") {
      // Solicitar permiso
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendTestNotification()
        } else {
          toast({
            title: "Permiso denegado",
            description: "Debes permitir notificaciones para recibir alertas",
            variant: "destructive",
          })
        }
      })
    } else {
      toast({
        title: "Permiso denegado",
        description: "Has bloqueado las notificaciones. Cambia la configuración en tu navegador para permitirlas.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={sendTestNotification} className="mt-4">
      Enviar notificación de prueba
    </Button>
  )
}

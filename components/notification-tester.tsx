"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translations"
import { sendNotification, requestNotificationPermission } from "@/services/notification-service"

export function NotificationTester() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const [title, setTitle] = useState("PresuApp")
  const [message, setMessage] = useState("Esta es una notificación de prueba")
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null)

  // Verificar el estado del permiso al cargar el componente
  useState(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission)
    } else {
      setPermissionStatus("not-supported")
    }
  })

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermissionStatus("granted")
      toast({
        title: "Permiso concedido",
        description: "Ahora puedes recibir notificaciones",
      })
    } else {
      setPermissionStatus(Notification.permission)
      toast({
        title: "Permiso denegado",
        description: "No podrás recibir notificaciones hasta que concedas el permiso",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = async () => {
    if (permissionStatus !== "granted") {
      toast({
        title: "Permiso requerido",
        description: "Necesitas conceder permiso para enviar notificaciones",
        variant: "destructive",
      })
      return
    }

    const sent = await sendNotification(title, {
      body: message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
    })

    if (sent) {
      toast({
        title: "Notificación enviada",
        description: "La notificación de prueba ha sido enviada correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación",
        variant: "destructive",
      })
    }
  }

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case "granted":
        return "Concedido"
      case "denied":
        return "Denegado"
      case "default":
        return "No decidido"
      case "not-supported":
        return "No soportado"
      default:
        return "Desconocido"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Prueba de Notificaciones</CardTitle>
        <CardDescription>Verifica que las notificaciones funcionen correctamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="permission-status">Estado del permiso</Label>
          <div
            id="permission-status"
            className={`p-2 rounded text-sm ${
              permissionStatus === "granted"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : permissionStatus === "denied"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {getPermissionStatusText()}
          </div>
        </div>

        {permissionStatus !== "granted" && permissionStatus !== "not-supported" && (
          <Button onClick={handleRequestPermission} className="w-full">
            Solicitar Permiso
          </Button>
        )}

        {permissionStatus === "granted" && (
          <>
            <div className="space-y-1">
              <Label htmlFor="notification-title">Título</Label>
              <Input
                id="notification-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la notificación"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notification-message">Mensaje</Label>
              <Input
                id="notification-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensaje de la notificación"
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {permissionStatus === "granted" && (
          <Button onClick={handleSendNotification} className="w-full">
            Enviar Notificación de Prueba
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

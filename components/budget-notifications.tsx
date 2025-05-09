"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translations"

interface BudgetNotificationsProps {
  budgetId: string
  budgetName: string
  totalBudget: number
  inMenu?: boolean
}

export function BudgetNotifications({ budgetId, budgetName, totalBudget, inMenu = false }: BudgetNotificationsProps) {
  const { toast } = useToast()
  const { t } = useTranslation()
  // Asegurarse de que totalBudget sea un número válido y mayor que cero
  const validTotalBudget = typeof totalBudget === "number" && !isNaN(totalBudget) && totalBudget > 0 ? totalBudget : 100

  // Calcular el umbral predeterminado (80% del presupuesto total)
  const defaultThreshold = Math.round(validTotalBudget * 0.8)

  const [threshold, setThreshold] = useState<number>(defaultThreshold)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  // Cargar configuración guardada
  useEffect(() => {
    // Verificar si los permisos de notificación están concedidos
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionGranted(Notification.permission === "granted")
    }

    // Cargar configuración guardada del localStorage
    try {
      const savedConfig = localStorage.getItem(`notification_config_${budgetId}`)
      if (savedConfig) {
        const config = JSON.parse(savedConfig)
        setNotificationsEnabled(config.enabled)

        // Asegurarse de que el umbral cargado sea un número válido
        const savedThreshold = Number(config.threshold)
        if (!isNaN(savedThreshold) && savedThreshold > 0) {
          setThreshold(savedThreshold)
        } else {
          setThreshold(defaultThreshold)
        }
      } else {
        // Valor predeterminado: 80% del presupuesto
        setThreshold(defaultThreshold)
      }
    } catch (error) {
      console.error("Error al cargar configuración de notificaciones:", error)
      setThreshold(defaultThreshold)
    }
  }, [budgetId, defaultThreshold])

  const handleSaveNotifications = async () => {
    // Solicitar permiso si no está concedido y las notificaciones están habilitadas
    if (notificationsEnabled && !permissionGranted) {
      try {
        const permission = await Notification.requestPermission()
        setPermissionGranted(permission === "granted")

        if (permission !== "granted") {
          toast({
            title: t("notifications.permissionDenied.title") || "Permiso denegado",
            description:
              t("notifications.permissionDenied.description") || "Debes permitir notificaciones para recibir alertas",
            variant: "destructive",
          })
          setNotificationsEnabled(false)
          return
        }
      } catch (error) {
        console.error("Error al solicitar permiso:", error)
        toast({
          title: "Error",
          description: "No se pudo solicitar permiso para notificaciones",
          variant: "destructive",
        })
        return
      }
    }

    // Asegurarse de que el umbral sea un número válido
    const validThreshold = !isNaN(threshold) && threshold > 0 ? threshold : defaultThreshold

    // Guardar configuración en localStorage
    try {
      const config = {
        budgetId,
        enabled: notificationsEnabled,
        threshold: validThreshold,
        lastChecked: new Date().toISOString(),
      }

      localStorage.setItem(`notification_config_${budgetId}`, JSON.stringify(config))

      toast({
        title: t("notifications.alertsConfigured.title") || "Alertas configuradas",
        description: notificationsEnabled
          ? t("notifications.alertsConfigured.enabledDesc", { threshold: validThreshold.toFixed(2) }) ||
            `Te notificaremos cuando el gasto supere $${validThreshold.toFixed(2)}`
          : t("notifications.alertsConfigured.disabledDesc") || "Las alertas han sido desactivadas",
      })
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        title: t("notifications.error") || "Error",
        description: t("notifications.savingError") || "No se pudo guardar la configuración",
        variant: "destructive",
      })
    }

    setOpen(false)
  }

  // Manejar cambios en el umbral con validación
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Si el valor está vacío, permitirlo temporalmente para facilitar la edición
    if (value === "") {
      setThreshold(0)
      return
    }

    const numValue = Number(value)
    if (!isNaN(numValue)) {
      setThreshold(numValue)
    }
  }

  if (inMenu) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled" className="text-xs">
            {t("notifications.enableAlerts") || "Activar alertas"}
          </Label>
          <Switch id="notifications-enabled" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        </div>
        {notificationsEnabled && (
          <div className="mt-2">
            <Label htmlFor="threshold" className="text-xs">
              {t("notifications.alertThreshold") || "Umbral de alerta"}
            </Label>
            <Input
              id="threshold"
              type="number"
              value={threshold || ""}
              onChange={handleThresholdChange}
              className="mt-1 h-8 text-sm"
              min="0"
              step="1"
            />
            <Button size="sm" className="w-full mt-2 h-8" onClick={handleSaveNotifications}>
              {t("common.save") || "Guardar"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
        <span>{t("notifications.configureAlerts") || "Configurar alertas"}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("notifications.configureAlertsFor", { name: budgetName }) || `Configurar alertas para ${budgetName}`}
            </DialogTitle>
            <DialogDescription>
              {t("notifications.configureAlertsDescription") ||
                "Configura alertas para recibir notificaciones cuando tus gastos superen cierto umbral."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-dialog" className="text-right">
                {t("notifications.enableAlerts") || "Activar alertas"}
              </Label>
              <Switch
                id="notifications-dialog"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            {notificationsEnabled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="threshold-dialog" className="text-right col-span-1">
                  {t("notifications.threshold") || "Umbral"}
                </Label>
                <Input
                  id="threshold-dialog"
                  type="number"
                  value={threshold || ""}
                  onChange={handleThresholdChange}
                  className="col-span-3"
                  min="0"
                  step="1"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveNotifications}>
              {t("common.save") || "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

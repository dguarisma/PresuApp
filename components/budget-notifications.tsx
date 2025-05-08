"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface BudgetNotificationsProps {
  budgetId: string
  budgetName: string
  totalBudget: number
  inMenu?: boolean
}

export function BudgetNotifications({ budgetId, budgetName, totalBudget, inMenu = false }: BudgetNotificationsProps) {
  const { toast } = useToast()
  const [threshold, setThreshold] = useState(totalBudget * 0.8)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSaveNotifications = () => {
    // Aquí iría la lógica para guardar las notificaciones
    // Por ahora solo mostramos un toast
    toast({
      title: "Alertas configuradas",
      description: `Te notificaremos cuando el gasto supere ${threshold.toFixed(2)}`,
    })
    setOpen(false)
  }

  if (inMenu) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled" className="text-xs">
            Activar alertas
          </Label>
          <Switch id="notifications-enabled" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
        </div>
        {notificationsEnabled && (
          <div className="mt-2">
            <Label htmlFor="threshold" className="text-xs">
              Umbral de alerta
            </Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number.parseFloat(e.target.value))}
              className="mt-1 h-8 text-sm"
            />
            <Button size="sm" className="w-full mt-2 h-8" onClick={handleSaveNotifications}>
              Guardar configuración
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>Configurar alertas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar alertas para {budgetName}</DialogTitle>
          <DialogDescription>
            Configura alertas para recibir notificaciones cuando tus gastos superen cierto umbral.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-dialog" className="text-right">
              Activar alertas
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
                Umbral
              </Label>
              <Input
                id="threshold-dialog"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number.parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveNotifications}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

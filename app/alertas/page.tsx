"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, BellOff } from "lucide-react"
import { useTranslation } from "@/hooks/use-translations"
import { BudgetNotifications } from "@/components/budget-notifications"
import db from "@/lib/db"
import { requestNotificationPermission } from "@/services/notification-service"
import { useToast } from "@/hooks/use-toast"

export default function AlertasPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<string>("default")

  useEffect(() => {
    // Cargar presupuestos
    const loadBudgets = () => {
      try {
        const budgetsData = db.getBudgets()

        // Obtener datos adicionales para cada presupuesto
        const budgetsWithData = budgetsData.map((budget) => {
          const budgetData = db.getBudgetData(budget.id)
          return {
            ...budget,
            amount: budgetData.amount || 0,
          }
        })

        setBudgets(budgetsWithData)
      } catch (error) {
        console.error("Error al cargar presupuestos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Verificar estado de permisos
    const checkPermission = () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission)
      }
    }

    loadBudgets()
    checkPermission()
  }, [])

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermissionStatus(granted ? "granted" : "denied")

    if (granted) {
      toast({
        title: t("notifications.permissionGranted.title"),
        description: t("notifications.permissionGranted.description"),
      })
    } else {
      toast({
        title: t("notifications.permissionDenied.title"),
        description: t("notifications.permissionDenied.description"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t("notifications.budgetAlerts")}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("notifications.notificationPermissions")}</CardTitle>
          <CardDescription>{t("notifications.permissionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {t("notifications.currentStatus")}:
                <span
                  className={`ml-2 ${
                    permissionStatus === "granted"
                      ? "text-green-500"
                      : permissionStatus === "denied"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }`}
                >
                  {permissionStatus === "granted"
                    ? t("notifications.granted")
                    : permissionStatus === "denied"
                      ? t("notifications.denied")
                      : t("notifications.notRequested")}
                </span>
              </p>
            </div>
            {permissionStatus !== "granted" && (
              <Button onClick={handleRequestPermission}>
                <Bell className="h-4 w-4 mr-2" />
                {t("notifications.requestPermission")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">{t("notifications.configureBudgetAlerts")}</h2>

      {isLoading ? (
        <p>{t("common.loading")}...</p>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">{t("notifications.noBudgetsFound")}</p>
            <p className="text-muted-foreground mb-4">{t("notifications.createBudgetFirst")}</p>
            <Button onClick={() => router.push("/")}>{t("budget.createNewBudget")}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle>{budget.name}</CardTitle>
                <CardDescription>
                  {t("budget.totalBudget")}: ${budget.amount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetNotifications budgetId={budget.id} budgetName={budget.name} totalBudget={budget.amount} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

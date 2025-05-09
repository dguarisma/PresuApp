"use client"

// services/notification-service.ts
import type { Budget } from "@/types/expense"

export interface BudgetNotificationConfig {
  budgetId: string
  enabled: boolean
  threshold: number
  lastNotified?: string // Fecha de la última notificación enviada
}

const BUDGET_NOTIFICATIONS_KEY = "budgetNotifications"

export function getBudgetNotificationConfig(budgetId: string): BudgetNotificationConfig | null {
  try {
    const settings = getBudgetNotificationSettings()
    return settings[budgetId] || null
  } catch (error) {
    console.error("Error getting budget notification config:", error)
    return null
  }
}

export function saveBudgetNotificationConfig(config: BudgetNotificationConfig): boolean {
  try {
    const settings = getBudgetNotificationSettings()
    settings[config.budgetId] = config
    localStorage.setItem(BUDGET_NOTIFICATIONS_KEY, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving budget notification config:", error)
    return false
  }
}

function getBudgetNotificationSettings(): { [budgetId: string]: BudgetNotificationConfig } {
  try {
    const settings = localStorage.getItem(BUDGET_NOTIFICATIONS_KEY)
    return settings ? JSON.parse(settings) : {}
  } catch (error) {
    console.error("Error getting budget notification settings:", error)
    return {}
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Función para enviar una notificación
export async function sendNotification(title: string, options: NotificationOptions): Promise<boolean> {
  if (!("Notification" in window)) {
    return false
  }

  if (Notification.permission !== "granted") {
    const permission = await requestNotificationPermission()
    if (!permission) return false
  }

  try {
    const notification = new Notification(title, options)

    // Manejar clic en la notificación
    notification.onclick = () => {
      window.focus()
      if (options.data?.url) {
        window.location.href = options.data.url
      }
      notification.close()
    }

    return true
  } catch (error) {
    console.error("Error al enviar notificación:", error)
    return false
  }
}

// Verificar si un presupuesto ha superado su umbral y enviar notificación
export async function checkBudgetThreshold(
  budget: Budget,
  currentSpent: number,
  t: (key: string, replacements?: Record<string, string | number>) => string,
): Promise<boolean> {
  const config = getBudgetNotificationConfig(budget.id)

  // Si no hay configuración o no está habilitada, no hacer nada
  if (!config || !config.enabled) return false

  // Calcular el porcentaje gastado
  const percentSpent = (currentSpent / budget.amount) * 100

  // Si el gasto supera el umbral, enviar notificación
  if (percentSpent >= config.threshold) {
    // Evitar enviar notificaciones repetidas en el mismo día
    const today = new Date().toISOString().split("T")[0]
    if (config.lastNotified === today) return false

    // Actualizar la fecha de última notificación
    config.lastNotified = today
    saveBudgetNotificationConfig(config)

    // Enviar la notificación
    return await sendNotification(t("notifications.budgetAlert.title"), {
      body: t("notifications.budgetAlert.body", {
        name: budget.name,
        percent: Math.round(percentSpent),
        threshold: config.threshold,
      }),
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      data: {
        url: `/budget/${budget.id}`,
      },
    })
  }

  return false
}

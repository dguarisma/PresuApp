"use client"

import { useEffect } from "react"
import { useTranslation } from "@/hooks/use-translations"
import { checkBudgetThreshold } from "@/services/notification-service"
import type { Budget } from "@/types/expense"

interface NotificationCheckerProps {
  budgets: Budget[]
  expenses: Record<string, number> // Mapa de budgetId -> monto gastado
}

export function NotificationChecker({ budgets, expenses }: NotificationCheckerProps) {
  const { t } = useTranslation()

  useEffect(() => {
    // Verificar notificaciones al cargar el componente
    const checkNotifications = async () => {
      for (const budget of budgets) {
        const spent = expenses[budget.id] || 0
        await checkBudgetThreshold(budget, spent, t)
      }
    }

    checkNotifications()

    // Configurar verificación periódica (cada 30 minutos)
    const intervalId = setInterval(checkNotifications, 30 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [budgets, expenses, t])

  // Este componente no renderiza nada visible
  return null
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/hooks/use-translations"
import { useCurrency } from "@/hooks/use-currency"
import { getTotalMinimumPayments } from "@/lib/db-debt"
import { getTotalIncome } from "@/lib/db-income"

interface BudgetSummaryWithDebtsProps {
  budgetId: string
  budgetAmount: number
  totalSpent: number
}

export function BudgetSummaryWithDebts({ budgetId, budgetAmount, totalSpent }: BudgetSummaryWithDebtsProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()
  const [totalMinimumPayments, setTotalMinimumPayments] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)

  useEffect(() => {
    // Obtener los pagos mínimos de deudas para este presupuesto
    const minimumPayments = getTotalMinimumPayments(budgetId)
    setTotalMinimumPayments(minimumPayments)

    // Obtener ingresos totales para este presupuesto
    const income = getTotalIncome(budgetId)
    setTotalIncome(income)
  }, [budgetId])

  // Calcular el total gastado incluyendo pagos de deudas
  const totalWithDebtPayments = totalSpent + totalMinimumPayments

  // Calcular el presupuesto restante después de gastos y pagos de deudas
  const remaining = budgetAmount - totalWithDebtPayments

  // Calcular el porcentaje gastado
  const percentSpent = budgetAmount > 0 ? (totalWithDebtPayments / budgetAmount) * 100 : 0
  const percentSpentCapped = Math.min(percentSpent, 100)

  // Determinar el color de la barra de progreso basado en el porcentaje gastado
  const getProgressColor = () => {
    if (percentSpent >= 100) return "bg-red-500"
    if (percentSpent >= 85) return "bg-amber-500"
    return "bg-emerald-500"
  }

  // Calcular el porcentaje de ingresos gastados
  const percentOfIncome = totalIncome > 0 ? (totalWithDebtPayments / totalIncome) * 100 : 0

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t("budget.summary")}</h3>
            <span className="text-sm text-muted-foreground">
              {percentOfIncome > 0 && <>{t("budget.percentOfIncome", { percent: percentOfIncome.toFixed(0) })}</>}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("budget.total")}</span>
              <span className="font-medium">{formatCurrency(budgetAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span>{t("budget.spent")}</span>
              <span className="font-medium">{formatCurrency(totalSpent)}</span>
            </div>

            <div className="flex justify-between text-amber-600">
              <span>{t("debt.minimumPayments")}</span>
              <span className="font-medium">{formatCurrency(totalMinimumPayments)}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-medium">
              <span>{t("budget.remaining")}</span>
              <span className={remaining < 0 ? "text-red-500" : "text-emerald-500"}>{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t("budget.percentSpent")}</span>
              <span>{percentSpent.toFixed(0)}%</span>
            </div>
            <Progress value={percentSpentCapped} className="h-2" indicatorClassName={getProgressColor()} />
          </div>

          {totalMinimumPayments > 0 && (
            <div className="text-sm text-muted-foreground">
              <p>{t("debt.includedInBudget")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

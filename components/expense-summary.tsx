"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/contexts/translation-context"
import { useCurrency } from "@/hooks/use-currency"

interface ExpenseSummaryProps {
  budget: number
  totalSpent: number
  remaining: number
  totalIncome?: number
}

export default function ExpenseSummary({ budget, totalSpent, remaining, totalIncome }: ExpenseSummaryProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()

  // Calcular el porcentaje gastado del presupuesto
  const percentSpent = budget > 0 ? (totalSpent / budget) * 100 : 0

  // Calcular el porcentaje de ingresos gastados (si hay ingresos)
  const percentOfIncome = totalIncome && totalIncome > 0 ? (totalSpent / totalIncome) * 100 : null

  // Determinar el color de la barra de progreso
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500"
    if (percent >= 75) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("budget.summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("budget.spent")}</span>
            <span className="font-medium">{formatCurrency(totalSpent)}</span>
          </div>
          <Progress value={percentSpent} className={`h-2 ${getProgressColor(percentSpent)}`} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("budget.remaining")}</span>
          <span className={`text-xl font-bold ${remaining < 0 ? "text-red-500" : ""}`}>
            {formatCurrency(remaining)}
          </span>
        </div>

        {percentOfIncome !== null && (
          <div className="pt-2 border-t border-border/50 mt-4">
            <div className="text-sm text-muted-foreground mb-2">{t("budget.percentOfIncome")}</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("budget.spent")}</span>
                <span className="font-medium">{percentOfIncome.toFixed(1)}%</span>
              </div>
              <Progress value={percentOfIncome} className={`h-2 ${getProgressColor(percentOfIncome)}`} />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {percentOfIncome <= 100 ? (
                <span>{t("budget.savingPercent", { percent: (100 - percentOfIncome).toFixed(1) })}</span>
              ) : (
                <span className="text-red-500">
                  {t("budget.overspendingPercent", { percent: (percentOfIncome - 100).toFixed(1) })}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

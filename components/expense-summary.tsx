import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Wallet, TrendingDown } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"
import { useTranslation } from "@/hooks/use-translations"

interface ExpenseSummaryProps {
  budget: number
  totalSpent: number
  remaining: number
}

export default function ExpenseSummary({ budget, totalSpent, remaining }: ExpenseSummaryProps) {
  // Usar el hook de moneda
  const { formatCurrency, symbol } = useCurrency()
  // Usar el hook de traducción
  const { t } = useTranslation()

  // Calcular el porcentaje gastado
  const percentSpent = budget > 0 ? (totalSpent / budget) * 100 : 0

  // Determinar el color de la barra de progreso
  const getProgressColor = () => {
    if (percentSpent >= 90) return "bg-red-500"
    if (percentSpent >= 70) return "bg-yellow-500"
    return "bg-emerald-500" // Usar emerald-500 que corresponde a #10b981
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <PieChart className="h-5 w-5 mr-1 text-primary" />
          {t("budget.summary")}
        </CardTitle>
        <CardDescription>{t("budget.summaryDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground">
              <Wallet className="h-4 w-4 mr-1.5" />
              {t("budget.spent")}:
            </span>
            <span className="text-lg font-medium">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-muted-foreground">
              <TrendingDown className="h-4 w-4 mr-1.5" />
              {t("budget.remaining")}:
            </span>
            <span className={`text-lg font-medium ${remaining < 0 ? "text-red-500" : ""}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs">
            <span>{t("budget.progress")}</span>
            <span
              className={`font-medium ${percentSpent >= 90 ? "text-red-500" : percentSpent >= 70 ? "text-yellow-500" : "text-emerald-500"}`}
            >
              {percentSpent.toFixed(1)}%
            </span>
          </div>
          <Progress value={percentSpent} className="h-2.5 bg-muted" indicatorClassName={getProgressColor()} />
          <p className="text-xs text-muted-foreground pt-1">
            {percentSpent >= 90
              ? t("budget.progressAlertHigh")
              : percentSpent >= 70
                ? t("budget.progressAlertMedium")
                : t("budget.progressAlertLow")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { format, parseISO, addMonths, subMonths, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import { TrendingUp, Calculator } from "lucide-react"
import type { PredictionConfig } from "@/types/expense"
import db from "@/lib/db"
import { useTranslation } from "@/hooks/use-translations"
import { formatCurrency } from "@/lib/utils"

interface ExpensePredictionProps {
  budgetId: string
}

export function ExpensePrediction({ budgetId }: ExpensePredictionProps) {
  const { t, language } = useTranslation()
  const locale = language === "es" ? es : enUS

  const [predictionConfig, setPredictionConfig] = useState<PredictionConfig>({
    months: 3,
    basedOn: "last3months",
  })
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [predictionData, setPredictionData] = useState<any[]>([])
  const [combinedData, setCombinedData] = useState<any[]>([])

  // Cargar datos históricos y generar predicciones
  useEffect(() => {
    const today = new Date()
    let startDate: Date

    // Determinar el período histórico según la configuración
    switch (predictionConfig.basedOn) {
      case "last3months":
        startDate = subMonths(startOfMonth(today), 3)
        break
      case "last6months":
        startDate = subMonths(startOfMonth(today), 6)
        break
      case "lastyear":
        startDate = subMonths(startOfMonth(today), 12)
        break
      case "average":
        // Usar todos los datos disponibles
        startDate = new Date(2000, 0, 1) // Fecha muy antigua para incluir todo
        break
      default:
        startDate = subMonths(startOfMonth(today), 3)
    }

    // Obtener gastos históricos
    const expenses = db.filterExpenses(budgetId, {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: today.toISOString(),
      },
    })

    // Agrupar gastos por mes
    const monthlyExpenses: Record<string, number> = {}

    expenses.forEach((expense) => {
      const expenseDate = parseISO(expense.date)
      const monthKey = format(expenseDate, "yyyy-MM")

      monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount
    })

    // Convertir a array para el gráfico
    const historicalDataArray = Object.entries(monthlyExpenses).map(([month, amount]) => ({
      month,
      formattedMonth: format(parseISO(`${month}-01`), "MMMM yyyy", { locale }),
      amount,
      type: "historical",
    }))

    setHistoricalData(historicalDataArray)

    // Generar predicciones
    generatePredictions(historicalDataArray, predictionConfig.months)
  }, [budgetId, predictionConfig, language])

  const generatePredictions = (historicalData: any[], months: number) => {
    if (historicalData.length === 0) {
      setPredictionData([])
      setCombinedData([])
      return
    }

    // Calcular el promedio de gastos históricos
    const totalHistorical = historicalData.reduce((sum, item) => sum + item.amount, 0)
    const avgAmount = totalHistorical / historicalData.length

    // Calcular la tendencia (pendiente)
    let slope = 0
    if (historicalData.length > 1) {
      const xValues = historicalData.map((_, i) => i)
      const yValues = historicalData.map((item) => item.amount)
      const n = historicalData.length

      const sumX = xValues.reduce((sum, x) => sum + x, 0)
      const sumY = yValues.reduce((sum, y) => sum + y, 0)
      const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
      const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    }

    // Generar predicciones para los próximos meses
    const lastHistoricalDate = parseISO(`${historicalData[historicalData.length - 1].month}-01`)
    const predictions = []

    for (let i = 1; i <= months; i++) {
      const predictionDate = addMonths(lastHistoricalDate, i)
      const monthKey = format(predictionDate, "yyyy-MM")

      // Calcular el valor predicho (promedio + tendencia)
      const predictedAmount = Math.max(0, avgAmount + slope * (historicalData.length + i - 1))

      predictions.push({
        month: monthKey,
        formattedMonth: format(predictionDate, "MMMM yyyy", { locale }),
        amount: Number(predictedAmount.toFixed(2)),
        type: "prediction",
      })
    }

    setPredictionData(predictions)
    setCombinedData([...historicalData, ...predictions])
  }

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value)
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3">
          <CardTitle className="text-xl">{t("prediction.title")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={predictionConfig.basedOn}
              onValueChange={(value: any) => setPredictionConfig({ ...predictionConfig, basedOn: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("prediction.basedOn")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last3months">{t("prediction.last3months")}</SelectItem>
                <SelectItem value="last6months">{t("prediction.last6months")}</SelectItem>
                <SelectItem value="lastyear">{t("prediction.lastyear")}</SelectItem>
                <SelectItem value="average">{t("prediction.average")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={predictionConfig.months.toString()}
              onValueChange={(value) => setPredictionConfig({ ...predictionConfig, months: Number.parseInt(value) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("prediction.monthsToPredict")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("prediction.oneMonth")}</SelectItem>
                <SelectItem value="3">{t("prediction.threeMonths")}</SelectItem>
                <SelectItem value="6">{t("prediction.sixMonths")}</SelectItem>
                <SelectItem value="12">{t("prediction.twelveMonths")}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto">
              <Calculator className="h-4 w-4 mr-2" />
              {t("prediction.recalculate")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {combinedData.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-muted/30 border-dashed">
            <p className="text-muted-foreground">{t("prediction.noData")}</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedMonth" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
                <ReferenceLine
                  x={historicalData[historicalData.length - 1]?.formattedMonth}
                  stroke="#888"
                  strokeDasharray="3 3"
                  label={{ value: language === "es" ? "Actual / Predicción" : "Actual / Prediction", position: "top" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name={language === "es" ? "Gastos" : "Expenses"}
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    return payload.type === "prediction" ? (
                      <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="#10b981" viewBox="0 0 10 10">
                        <circle cx="5" cy="5" r="5" fillOpacity={0.5} />
                      </svg>
                    ) : (
                      <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="#10b981" viewBox="0 0 10 10">
                        <circle cx="5" cy="5" r="5" />
                      </svg>
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md bg-muted/10">
                <h3 className="text-lg font-medium mb-1">{t("prediction.historicalAverage")}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(historicalData.reduce((sum, item) => sum + item.amount, 0) / historicalData.length)}
                </p>
              </div>

              <div className="p-4 border rounded-md bg-muted/10">
                <h3 className="text-lg font-medium mb-1">{t("prediction.predictedAverage")}</h3>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(predictionData.reduce((sum, item) => sum + item.amount, 0) / predictionData.length)}
                </p>
              </div>

              <div className="p-4 border rounded-md bg-muted/10">
                <h3 className="text-lg font-medium mb-1">{t("prediction.trend")}</h3>
                <div className="flex items-center">
                  <TrendingUp
                    className={`h-6 w-6 mr-2 ${
                      predictionData[predictionData.length - 1]?.amount >
                      historicalData[historicalData.length - 1]?.amount
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  />
                  <p className="text-2xl font-bold">
                    {predictionData[predictionData.length - 1]?.amount >
                    historicalData[historicalData.length - 1]?.amount
                      ? t("prediction.ascending")
                      : t("prediction.descending")}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

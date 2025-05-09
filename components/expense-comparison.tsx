"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { ArrowRightLeft } from "lucide-react"
import type { ExpenseItem, DateRange } from "@/types/expense"
import db from "@/lib/db"
import { useTranslation } from "@/hooks/use-translations"

interface ExpenseComparisonProps {
  budgetId: string
}

export function ExpenseComparison({ budgetId }: ExpenseComparisonProps) {
  const { t, language } = useTranslation()
  const [period1, setPeriod1] = useState<string>("thisMonth")
  const [period2, setPeriod2] = useState<string>("lastMonth")
  const [period1Data, setPeriod1Data] = useState<any[]>([])
  const [period2Data, setPeriod2Data] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])

  useEffect(() => {
    // Obtener datos para ambos períodos
    const dateRange1 = getDateRangeForPeriod(period1)
    const dateRange2 = getDateRangeForPeriod(period2)

    const expenses1 = db.filterExpenses(budgetId, { dateRange: dateRange1 })
    const expenses2 = db.filterExpenses(budgetId, { dateRange: dateRange2 })

    // Procesar datos para el período 1
    const period1CategoryData = processCategoryData(expenses1)
    setPeriod1Data(period1CategoryData)

    // Procesar datos para el período 2
    const period2CategoryData = processCategoryData(expenses2)
    setPeriod2Data(period2CategoryData)

    // Generar datos de comparación
    generateComparisonData(period1CategoryData, period2CategoryData, getPeriodLabel(period1), getPeriodLabel(period2))
  }, [budgetId, period1, period2, language])

  const getDateRangeForPeriod = (period: string): DateRange => {
    const today = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
      case "thisMonth":
        startDate = startOfMonth(today)
        endDate = endOfMonth(today)
        break
      case "lastMonth":
        startDate = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1))
        endDate = endOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1))
        break
      case "twoMonthsAgo":
        startDate = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 2, 1))
        endDate = endOfMonth(new Date(today.getFullYear(), today.getMonth() - 2, 1))
        break
      case "threeMonthsAgo":
        startDate = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 3, 1))
        endDate = endOfMonth(new Date(today.getFullYear(), today.getMonth() - 3, 1))
        break
      case "sixMonthsAgo":
        startDate = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 6, 1))
        endDate = endOfMonth(new Date(today.getFullYear(), today.getMonth() - 6, 1))
        break
      case "oneYearAgo":
        startDate = startOfMonth(new Date(today.getFullYear() - 1, today.getMonth(), 1))
        endDate = endOfMonth(new Date(today.getFullYear() - 1, today.getMonth(), 1))
        break
      default:
        startDate = startOfMonth(today)
        endDate = endOfMonth(today)
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }
  }

  const getPeriodLabel = (period: string): string => {
    const today = new Date()
    const locale = language === "es" ? es : enUS

    switch (period) {
      case "thisMonth":
        return format(today, "MMM yyyy", { locale })
      case "lastMonth":
        return format(new Date(today.getFullYear(), today.getMonth() - 1, 1), "MMM yyyy", { locale })
      case "twoMonthsAgo":
        return format(new Date(today.getFullYear(), today.getMonth() - 2, 1), "MMM yyyy", { locale })
      case "threeMonthsAgo":
        return format(new Date(today.getFullYear(), today.getMonth() - 3, 1), "MMM yyyy", { locale })
      case "sixMonthsAgo":
        return format(new Date(today.getFullYear(), today.getMonth() - 6, 1), "MMM yyyy", { locale })
      case "oneYearAgo":
        return format(new Date(today.getFullYear() - 1, today.getMonth(), 1), "MMM yyyy", { locale })
      default:
        return t("comparison.period")
    }
  }

  const processCategoryData = (expenses: ExpenseItem[]) => {
    // Agrupar gastos por categoría
    const categoryMap: Record<string, number> = {}

    expenses.forEach((expense) => {
      // Aquí deberíamos tener la categoría del gasto, pero como no la tenemos en el objeto ExpenseItem,
      // usaremos una categoría genérica para este ejemplo
      const categoryName = "General"
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + expense.amount
    })

    // Convertir a array para el gráfico
    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }))
  }

  const generateComparisonData = (data1: any[], data2: any[], label1: string, label2: string) => {
    // Obtener todas las categorías únicas
    const allCategories = new Set([...data1.map((item) => item.category), ...data2.map((item) => item.category)])

    // Crear datos de comparación
    const comparison = Array.from(allCategories).map((category) => {
      const item1 = data1.find((item) => item.category === category)
      const item2 = data2.find((item) => item.category === category)

      return {
        category,
        [label1]: item1 ? item1.amount : 0,
        [label2]: item2 ? item2.amount : 0,
      }
    })

    setComparisonData(comparison)
  }

  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // Calcular totales para cada período
  const total1 = period1Data.reduce((sum, item) => sum + item.amount, 0)
  const total2 = period2Data.reduce((sum, item) => sum + item.amount, 0)
  const difference = total1 - total2
  const percentChange = total2 !== 0 ? ((total1 - total2) / total2) * 100 : 0

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg sm:text-xl">{t("comparison.title")}</CardTitle>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Select value={period1} onValueChange={setPeriod1} className="w-full max-w-[150px]">
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("comparison.period1")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">{t("comparison.thisMonth")}</SelectItem>
                  <SelectItem value="lastMonth">{t("comparison.lastMonth")}</SelectItem>
                  <SelectItem value="twoMonthsAgo">{t("comparison.twoMonthsAgo")}</SelectItem>
                  <SelectItem value="threeMonthsAgo">{t("comparison.threeMonthsAgo")}</SelectItem>
                  <SelectItem value="sixMonthsAgo">{t("comparison.sixMonthsAgo")}</SelectItem>
                  <SelectItem value="oneYearAgo">{t("comparison.oneYearAgo")}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center w-8 h-8">
                <ArrowRightLeft className="h-4 w-4" />
              </div>

              <Select value={period2} onValueChange={setPeriod2} className="w-full max-w-[150px]">
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={t("comparison.period2")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">{t("comparison.thisMonth")}</SelectItem>
                  <SelectItem value="lastMonth">{t("comparison.lastMonth")}</SelectItem>
                  <SelectItem value="twoMonthsAgo">{t("comparison.twoMonthsAgo")}</SelectItem>
                  <SelectItem value="threeMonthsAgo">{t("comparison.threeMonthsAgo")}</SelectItem>
                  <SelectItem value="sixMonthsAgo">{t("comparison.sixMonthsAgo")}</SelectItem>
                  <SelectItem value="oneYearAgo">{t("comparison.oneYearAgo")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Card className="bg-muted/10 shadow-none">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{getPeriodLabel(period1)}</p>
                <p className="text-lg sm:text-xl font-bold">${total1.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/10 shadow-none">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{getPeriodLabel(period2)}</p>
                <p className="text-lg sm:text-xl font-bold">${total2.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`${difference > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-green-50 dark:bg-green-950/20"} shadow-none`}
          >
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{t("comparison.difference")}</p>
                <p className={`text-lg sm:text-xl font-bold ${difference > 0 ? "text-red-500" : "text-green-500"}`}>
                  {difference > 0 ? "+" : ""}
                  {difference.toFixed(2)}
                  <span className="text-xs">
                    ({percentChange > 0 ? "+" : ""}
                    {percentChange.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {comparisonData.length === 0 ? (
          <div className="text-center p-4 border rounded-lg bg-muted/30 border-dashed">
            <p className="text-sm text-muted-foreground">{t("comparison.noData")}</p>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ strokeWidth: 1 }} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={{ strokeWidth: 1 }} width={30} />
                <Tooltip formatter={formatTooltipValue} contentStyle={{ fontSize: 12 }} labelStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} iconSize={8} />
                <Bar dataKey={getPeriodLabel(period1)} fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey={getPeriodLabel(period2)} fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

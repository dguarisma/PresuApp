"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isSameWeek,
} from "date-fns"
import { es } from "date-fns/locale"
import type { ExpenseItem } from "@/types/expense"
import { TrendingUp, BarChart3, PieChart } from "lucide-react"
import { useTranslation } from "@/hooks/use-translations"
import { useCurrency } from "@/hooks/use-currency"

interface TrendAnalysisProps {
  expenses: ExpenseItem[]
  dateRange: { startDate: string; endDate: string }
}

export function TrendAnalysis({ expenses, dateRange }: TrendAnalysisProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState("daily")
  const [dailyData, setDailyData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  useEffect(() => {
    if (!expenses.length) return

    const startDate = parseISO(dateRange.startDate)
    const endDate = parseISO(dateRange.endDate)

    // Generar datos diarios
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const dailyExpenses = days.map((day) => {
      const dayExpenses = expenses.filter((expense) => isSameDay(parseISO(expense.date), day))

      return {
        date: format(day, "yyyy-MM-dd"),
        formattedDate: format(day, "dd MMM", { locale: es }),
        total: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: dayExpenses.length,
      }
    })

    setDailyData(dailyExpenses)

    // Generar datos semanales
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }, // Semana comienza el lunes
    )

    const weeklyExpenses = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const weekExpenses = expenses.filter((expense) => {
        const expenseDate = parseISO(expense.date)
        return (
          isSameWeek(expenseDate, weekStart, { weekStartsOn: 1 }) && expenseDate >= startDate && expenseDate <= endDate
        )
      })

      return {
        date: format(weekStart, "yyyy-MM-dd"),
        formattedDate: `${format(weekStart, "dd MMM", { locale: es })} - ${format(weekEnd, "dd MMM", { locale: es })}`,
        total: weekExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: weekExpenses.length,
      }
    })

    setWeeklyData(weeklyExpenses)

    // Generar datos mensuales
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    const monthlyExpenses = months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = parseISO(expense.date)
        return isSameMonth(expenseDate, month) && expenseDate >= startDate && expenseDate <= endDate
      })

      return {
        date: format(month, "yyyy-MM"),
        formattedDate: format(month, "MMMM yyyy", { locale: es }),
        total: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: monthExpenses.length,
      }
    })

    setMonthlyData(monthlyExpenses)
  }, [expenses, dateRange])

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("trends.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("trends.daily")}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("trends.weekly")}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              {t("trends.monthly")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="pt-2">
            {dailyData.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">{t("trends.noDataDaily")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formattedDate" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  <Bar dataKey="total" name={t("trends.totalExpense")} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="pt-2">
            {weeklyData.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">{t("trends.noDataWeekly")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formattedDate" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name={t("trends.totalExpense")}
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="pt-2">
            {monthlyData.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">{t("trends.noDataMonthly")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="formattedDate" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name={t("trends.totalExpense")}
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

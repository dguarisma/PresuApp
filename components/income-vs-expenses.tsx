"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import db from "@/lib/db"
import incomeDB from "@/lib/db-income"
import { useTranslation } from "@/hooks/use-translations"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

interface IncomeVsExpensesProps {
  budgetId: string
  months?: number
}

export default function IncomeVsExpenses({ budgetId, months = 6 }: IncomeVsExpensesProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [netCashFlow, setNetCashFlow] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    // Generar datos para los últimos X meses
    const data = []
    const now = new Date()
    let totalInc = 0
    let totalExp = 0

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      // Obtener ingresos del mes
      const monthIncome = incomeDB.getTotalIncome(budgetId, start, end)

      // Obtener gastos del mes (simulado - necesitarías implementar esta función)
      const budgetData = db.getBudgetData(budgetId)
      const monthExpenses = budgetData.categories.reduce((total, category) => {
        return (
          total +
          category.items
            .filter((item) => {
              const itemDate = new Date(item.date)
              return itemDate >= start && itemDate <= end
            })
            .reduce((sum, item) => sum + item.amount, 0)
        )
      }, 0)

      totalInc += monthIncome
      totalExp += monthExpenses

      data.push({
        name: format(date, "MMM", { locale: es }),
        income: monthIncome,
        expenses: monthExpenses,
        balance: monthIncome - monthExpenses,
      })
    }

    setChartData(data)
    setTotalIncome(totalInc)
    setTotalExpenses(totalExp)
    setNetCashFlow(totalInc - totalExp)
    setSavingsRate(totalInc > 0 ? ((totalInc - totalExp) / totalInc) * 100 : 0)
  }, [budgetId, months])

  return (
    <Card className="border border-border/50 shadow-md overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-bold">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          {t("dashboard.incomeVsExpenses")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("dashboard.lastMonths", { count: months })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("income.total")}</p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("expenses.total")}</p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-0 shadow-sm ${netCashFlow >= 0 ? "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20" : "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("dashboard.netCashFlow")}</p>
                  <h3
                    className={`text-2xl font-bold tracking-tight ${netCashFlow >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    ${netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <div className="flex items-center mt-1 space-x-1">
                    <div
                      className={`px-2 py-0.5 text-xs rounded-full ${netCashFlow >= 0 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}
                    >
                      {t("dashboard.savingsRate")}: {savingsRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div
                  className={`h-10 w-10 rounded-full ${netCashFlow >= 0 ? "bg-blue-100 dark:bg-blue-900/50" : "bg-amber-100 dark:bg-amber-900/50"} flex items-center justify-center`}
                >
                  <TrendingUp
                    className={`h-5 w-5 ${netCashFlow >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 h-[300px] bg-card rounded-lg p-4 border border-border/50">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => <span style={{ color: "#6b7280", fontSize: "12px" }}>{value}</span>}
              />
              <Bar
                dataKey="income"
                name={t("income.title")}
                fill="url(#incomeGradient)"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="expenses"
                name={t("expenses.title")}
                fill="url(#expenseGradient)"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

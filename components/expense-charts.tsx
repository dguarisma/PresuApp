"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Category } from "@/types/expense"
import { PieChartIcon as ChartPie, BarChart3 } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

interface ExpenseChartsProps {
  categories: Category[]
  totalBudget: number
  totalSpent: number
}

export default function ExpenseCharts({ categories, totalBudget, totalSpent }: ExpenseChartsProps) {
  const [activeTab, setActiveTab] = useState("distribution")
  const { t } = useTranslation()

  // Preparar datos para el gráfico de distribución
  const distributionData = categories
    .map((category) => {
      const amount = category.items.reduce((sum, item) => sum + item.amount, 0)
      return {
        name: category.name,
        value: amount,
      }
    })
    .filter((item) => item.value > 0)

  // Preparar datos para el gráfico de presupuesto
  const budgetData = [
    { name: t("charts.spent"), value: totalSpent },
    { name: t("charts.remaining"), value: Math.max(0, totalBudget - totalSpent) },
  ]

  // Colores para los gráficos - Paleta diversa para categorías
  const CATEGORY_COLORS = [
    "#10b981", // Verde (color principal)
    "#3b82f6", // Azul
    "#f97316", // Naranja
    "#8b5cf6", // Púrpura
    "#ec4899", // Rosa
    "#06b6d4", // Cian
    "#f59e0b", // Ámbar
    "#6366f1", // Índigo
    "#14b8a6", // Verde azulado
    "#d946ef", // Fucsia
    "#84cc16", // Lima
  ]

  // Preparar datos para el gráfico de barras
  const barData = categories
    .map((category) => {
      const amount = category.items.reduce((sum, item) => sum + item.amount, 0)
      return {
        name: category.name,
        amount,
      }
    })
    .filter((item) => item.amount > 0)

  // Formatear valores para los tooltips
  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // Formatear etiquetas para el gráfico de pastel
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Generar colores para las barras del gráfico de barras
  const getBarColor = (index: number) => {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{t("charts.title")}</CardTitle>
        <CardDescription>{t("charts.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="distribution" className="flex items-center">
              <ChartPie className="h-4 w-4 mr-2" />
              {t("charts.distribution")}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("charts.budget")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="pt-2 animate-in">
            {distributionData.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">{t("charts.noDataDistribution")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Bar dataKey="amount" name={t("charts.amount")} radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="budget" className="pt-2 animate-in">
            {totalBudget === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">{t("charts.noBudget")}</p>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" /> {/* Rojo para gastado */}
                      <Cell fill="#10b981" /> {/* Verde para restante */}
                    </Pie>
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

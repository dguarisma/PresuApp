"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Category } from "@/types/expense"
import { PieChartIcon as ChartPie, BarChart3 } from "lucide-react"

interface ExpenseChartsProps {
  categories: Category[]
  totalBudget: number
  totalSpent: number
}

export default function ExpenseCharts({ categories, totalBudget, totalSpent }: ExpenseChartsProps) {
  const [activeTab, setActiveTab] = useState("distribution")

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
    { name: "Gastado", value: totalSpent },
    { name: "Restante", value: Math.max(0, totalBudget - totalSpent) },
  ]

  // Colores para los gráficos - Tonos de verde
  const COLORS = [
    "#10b981", // Verde principal
    "#34d399",
    "#6ee7b7",
    "#a7f3d0",
    "#059669",
    "#047857",
    "#065f46",
    "#064e3b",
    "#22c55e",
    "#16a34a",
    "#15803d",
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

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Gráficos</CardTitle>
        <CardDescription>Visualización de tus gastos y presupuesto</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="distribution" className="flex items-center">
              <ChartPie className="h-4 w-4 mr-2" />
              Distribución
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Presupuesto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="pt-2 animate-in">
            {distributionData.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">
                  No hay datos suficientes para mostrar el gráfico. Agrega gastos a tus categorías.
                </p>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      <Bar dataKey="amount" name="Monto" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="budget" className="pt-2 animate-in">
            {totalBudget === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">Establece un presupuesto para ver el gráfico.</p>
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
                      <Cell fill="#ef4444" />
                      <Cell fill="#10b981" />
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

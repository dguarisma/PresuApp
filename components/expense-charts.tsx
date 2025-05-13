"\"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { useTranslations } from "@/hooks/use-translations"
import { useCurrency } from "@/hooks/use-currency"

interface ExpenseChartsProps {
  categories: {
    id: string
    name: string
    items: { amount: number }[]
    color: string
  }[]
  totalBudget: number
  totalSpent: number
}

export default function ExpenseCharts({ categories, totalBudget, totalSpent }: ExpenseChartsProps) {
  const t = useTranslations()
  const { formatCurrency } = useCurrency()
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const data = categories.map((category) => ({
      name: category.name,
      value: category.items.reduce((sum, item) => sum + item.amount, 0),
      fill: category.color,
    }))
    setChartData(data)
  }, [categories])

  // Si no hay datos, mostrar mensaje
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.charts.distribution}</CardTitle>
          <CardDescription>{t.charts.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium">{t.charts.noDataDistribution}</h3>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si solo hay una categoría, mostrar mensaje especial
  const isSingleCategory = chartData.length === 1

  // Calcular el total
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  // Función para renderizar etiquetas personalizadas
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
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
        className="font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSingleCategory ? t.charts.singleCategoryTitle : t.charts.distribution}</CardTitle>
        <CardDescription>
          {isSingleCategory ? t.charts.singleCategoryDescription : t.charts.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

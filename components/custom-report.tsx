"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { FileText, Save, BarChart3, LineChartIcon, PieChartIcon } from "lucide-react"
import type { ExpenseItem, FilterOptions, ReportConfig, DateRange, Category } from "@/types/expense"
import db from "@/lib/db"
import { useTranslation } from "@/hooks/use-translations"

interface CustomReportProps {
  budgetId: string
  categories: Category[]
}

export function CustomReport({ budgetId, categories }: CustomReportProps) {
  const { t } = useTranslation()

  const [reportName, setReportName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    }
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [searchText, setSearchText] = useState("")
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month" | "category" | "tag">("category")
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")

  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseItem[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [savedReports, setSavedReports] = useState<ReportConfig[]>([])
  const [selectedReport, setSelectedReport] = useState<string>("")

  // Cargar etiquetas disponibles
  useEffect(() => {
    setAvailableTags(db.getAllTags())
    setSavedReports(db.getSavedReports())
  }, [])

  // Aplicar filtros y generar datos para el gráfico
  useEffect(() => {
    const filters: FilterOptions = {
      dateRange,
      searchText: searchText || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      minAmount: minAmount ? Number.parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? Number.parseFloat(maxAmount) : undefined,
    }

    const expenses = db.filterExpenses(budgetId, filters)
    setFilteredExpenses(expenses)

    // Generar datos para el gráfico según el agrupamiento seleccionado
    generateChartData(expenses, groupBy)
  }, [budgetId, dateRange, selectedCategories, selectedTags, minAmount, maxAmount, searchText, groupBy])

  const generateChartData = (expenses: ExpenseItem[], groupingType: string) => {
    if (!expenses.length) {
      setChartData([])
      return
    }

    let data: any[] = []

    switch (groupingType) {
      case "day":
        // Agrupar por día
        const byDay = expenses.reduce((acc: Record<string, number>, expense) => {
          const day = format(parseISO(expense.date), "yyyy-MM-dd")
          acc[day] = (acc[day] || 0) + expense.amount
          return acc
        }, {})

        data = Object.entries(byDay).map(([day, amount]) => ({
          name: format(parseISO(day), "dd MMM", { locale: es }),
          value: amount,
        }))
        break

      case "week":
        // Agrupar por semana
        const byWeek = expenses.reduce((acc: Record<string, number>, expense) => {
          const week = format(parseISO(expense.date), "w-yyyy")
          acc[week] = (acc[week] || 0) + expense.amount
          return acc
        }, {})

        data = Object.entries(byWeek).map(([week, amount]) => {
          const [weekNum, year] = week.split("-")
          return {
            name: `${t("reports.week")} ${weekNum}, ${year}`,
            value: amount,
          }
        })
        break

      case "month":
        // Agrupar por mes
        const byMonth = expenses.reduce((acc: Record<string, number>, expense) => {
          const month = format(parseISO(expense.date), "yyyy-MM")
          acc[month] = (acc[month] || 0) + expense.amount
          return acc
        }, {})

        data = Object.entries(byMonth).map(([month, amount]) => ({
          name: format(parseISO(`${month}-01`), "MMMM yyyy", { locale: es }),
          value: amount,
        }))
        break

      case "category":
        // Agrupar por categoría
        const byCategory: Record<string, number> = {}

        categories.forEach((category) => {
          const categoryExpenses = expenses.filter((expense) => category.items.some((item) => item.id === expense.id))

          if (categoryExpenses.length > 0) {
            const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            byCategory[category.name] = total
          }
        })

        data = Object.entries(byCategory).map(([category, amount]) => ({
          name: category,
          value: amount,
        }))
        break

      case "tag":
        // Agrupar por etiqueta
        const byTag: Record<string, number> = {}

        expenses.forEach((expense) => {
          if (expense.tags && expense.tags.length > 0) {
            expense.tags.forEach((tag) => {
              byTag[tag] = (byTag[tag] || 0) + expense.amount
            })
          } else {
            byTag[t("reports.noTagsAvailable")] = (byTag[t("reports.noTagsAvailable")] || 0) + expense.amount
          }
        })

        data = Object.entries(byTag).map(([tag, amount]) => ({
          name: tag,
          value: amount,
        }))
        break
    }

    // Ordenar datos por valor (de mayor a menor)
    data.sort((a, b) => b.value - a.value)

    setChartData(data)
  }

  const handleSaveReport = () => {
    if (!reportName.trim()) return

    const report: ReportConfig = {
      id: Date.now().toString(),
      name: reportName.trim(),
      filters: {
        dateRange,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        minAmount: minAmount ? Number.parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? Number.parseFloat(maxAmount) : undefined,
        searchText: searchText || undefined,
      },
      groupBy,
      chartType,
    }

    db.saveReport(report)
    setSavedReports(db.getSavedReports())
    setSelectedReport(report.id)
  }

  const handleLoadReport = (reportId: string) => {
    if (!reportId) return

    const report = savedReports.find((r) => r.id === reportId)
    if (!report) return

    setReportName(report.name)
    setDateRange(report.filters.dateRange || dateRange)
    setSelectedCategories(report.filters.categories || [])
    setSelectedTags(report.filters.tags || [])
    setMinAmount(report.filters.minAmount?.toString() || "")
    setMaxAmount(report.filters.maxAmount?.toString() || "")
    setSearchText(report.filters.searchText || "")
    setGroupBy(report.groupBy)
    setChartType(report.chartType)
  }

  const handleDeleteReport = (reportId: string) => {
    if (db.deleteReport(reportId)) {
      setSavedReports(db.getSavedReports())
      if (selectedReport === reportId) {
        setSelectedReport("")
      }
    }
  }

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center p-6 border rounded-lg bg-muted/30 border-dashed h-[200px]">
          <p className="text-muted-foreground text-center">{t("reports.noData")}</p>
        </div>
      )
    }

    const COLORS = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#6366f1",
    ]

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" name={t("expenses.amount")} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="value" name={t("expenses.amount")} stroke="#10b981" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{t("reports.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sección de carga/guardado de reportes */}
        <div className="space-y-3">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="report-name">{t("reports.reportName")}</Label>
            <Input
              id="report-name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder={t("reports.reportNamePlaceholder")}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>{t("reports.loadReport")}</Label>
            <div className="flex flex-col space-y-2">
              <Select value={selectedReport} onValueChange={handleLoadReport}>
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.loadReportPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {savedReports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteReport(selectedReport)}
                disabled={!selectedReport}
              >
                {t("reports.delete")}
              </Button>
            </div>
          </div>
        </div>

        {/* Sección de filtros */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-medium">{t("reports.filters")}</h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t("reports.dateRange")}</Label>
              <Select defaultValue="custom">
                <SelectTrigger>
                  <SelectValue placeholder={t("dateRange.selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t("dateRange.custom")}</SelectItem>
                  <SelectItem value="month">{t("dateRange.thisMonth")}</SelectItem>
                  <SelectItem value="lastMonth">{t("dateRange.lastMonth")}</SelectItem>
                  <SelectItem value="year">{t("dateRange.thisYear")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <DateRangeFilter onChange={setDateRange} initialDateRange={dateRange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-text">{t("reports.searchText")}</Label>
              <Input
                id="search-text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("reports.searchTextPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="min-amount">{t("reports.minAmount")}</Label>
                <Input
                  id="min-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-amount">{t("reports.maxAmount")}</Label>
                <Input
                  id="max-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder={t("reports.maxAmountPlaceholder")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección de categorías */}
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-medium">{t("reports.categories")}</h3>
          <ScrollArea className="h-[150px] border rounded-md p-4">
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("reports.noCategoriesAvailable")}</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sección de etiquetas */}
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-medium">{t("reports.tags")}</h3>
          <ScrollArea className="h-[150px] border rounded-md p-4">
            <div className="space-y-2">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTags([...selectedTags, tag])
                        } else {
                          setSelectedTags(selectedTags.filter((t) => t !== tag))
                        }
                      }}
                    />
                    <Label htmlFor={`tag-${tag}`} className="cursor-pointer">
                      {tag}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("reports.noTagsAvailable")}</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sección de visualización */}
        <div className="space-y-3 pt-2">
          <h3 className="text-lg font-medium">{t("reports.visualization")}</h3>

          <div className="space-y-2">
            <Label htmlFor="group-by">{t("reports.groupBy")}</Label>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger id="group-by">
                <SelectValue placeholder={t("reports.groupBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t("reports.day")}</SelectItem>
                <SelectItem value="week">{t("reports.week")}</SelectItem>
                <SelectItem value="month">{t("reports.month")}</SelectItem>
                <SelectItem value="category">{t("reports.category")}</SelectItem>
                <SelectItem value="tag">{t("reports.tag")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("reports.chartType")}</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={chartType === "bar" ? "default" : "outline"}
                className="w-full"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("reports.bar")}
              </Button>
              <Button
                type="button"
                variant={chartType === "line" ? "default" : "outline"}
                className="w-full"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-4 w-4 mr-2" />
                {t("reports.line")}
              </Button>
              <Button
                type="button"
                variant={chartType === "pie" ? "default" : "outline"}
                className="w-full"
                onClick={() => setChartType("pie")}
              >
                <PieChartIcon className="h-4 w-4 mr-2" />
                {t("reports.pie")}
              </Button>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <Button className="w-full mt-4" onClick={handleSaveReport} disabled={!reportName.trim()}>
          <Save className="h-4 w-4 mr-2" />
          {t("reports.saveReport")}
        </Button>

        {/* Resultados */}
        <div className="pt-4">
          {renderChart()}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <FileText className="h-4 w-4 inline mr-1" />
              {t("reports.expensesFound", {
                count: filteredExpenses.length,
                amount: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2),
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

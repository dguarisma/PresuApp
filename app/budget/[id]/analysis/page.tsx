"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Calendar, TrendingUp, FileText, ArrowRightLeft, Calculator } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { DateRangeFilter } from "@/components/date-range-filter"
import { ExpenseCalendar } from "@/components/expense-calendar"
import { TrendAnalysis } from "@/components/trend-analysis"
import { CustomReport } from "@/components/custom-report"
import { ExpensePrediction } from "@/components/expense-prediction"
import { ExpenseComparison } from "@/components/expense-comparison"
import type { ExpenseItem, DateRange } from "@/types/expense"
import db from "@/lib/db"
import Link from "next/link"

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const budgetId = params.id as string

  const [activeTab, setActiveTab] = useState("calendar")
  const [budgetName, setBudgetName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    }
  })
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<ExpenseItem[]>([])

  useEffect(() => {
    // Cargar nombre del presupuesto
    const budget = db.getBudget(budgetId)
    if (budget) {
      setBudgetName(budget.name)
    }

    // Cargar categorías
    const budgetData = db.getBudgetData(budgetId)
    setCategories(budgetData.categories)

    // Cargar gastos iniciales
    const initialExpenses = db.getExpensesByDateRange(budgetId, dateRange)
    setExpenses(initialExpenses)
  }, [budgetId])

  // Actualizar gastos cuando cambia el rango de fechas
  useEffect(() => {
    const filteredExpenses = db.getExpensesByDateRange(budgetId, dateRange)
    setExpenses(filteredExpenses)
  }, [budgetId, dateRange])

  const handleSearchResults = (results: ExpenseItem[]) => {
    setSearchResults(results)
    setActiveTab("search")
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <div className="flex justify-center py-2">
        <Link href="/">
          <img src="/logo.png" alt="PresuApp Logo" className="h-10" />
        </Link>
      </div>

      <header className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/budget/${budgetId}`)}
            className="rounded-full h-9 w-9 p-0"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">Análisis de Gastos</h1>
          </div>
          <ModeToggle />
        </div>

        <div className="mb-4">
          <DateRangeFilter onChange={setDateRange} initialDateRange={dateRange} />
        </div>
      </header>

      <main className="px-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="calendar" className="flex items-center justify-center py-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Calendario</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center justify-center py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span>Tendencias</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center justify-center py-2">
              <FileText className="h-4 w-4 mr-2" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="comparison" className="flex items-center justify-center py-2">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              <span>Comparación</span>
            </TabsTrigger>
            <TabsTrigger value="prediction" className="flex items-center justify-center py-2">
              <Calculator className="h-4 w-4 mr-2" />
              <span>Predicción</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center justify-center py-2">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Resultados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <ExpenseCalendar expenses={expenses} />
          </TabsContent>

          <TabsContent value="trends" className="mt-0">
            <TrendAnalysis expenses={expenses} dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <CustomReport budgetId={budgetId} categories={categories} />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            <ExpenseComparison budgetId={budgetId} />
          </TabsContent>

          <TabsContent value="prediction" className="mt-0">
            <ExpensePrediction budgetId={budgetId} />
          </TabsContent>

          <TabsContent value="search" className="mt-0">
            {searchResults.length === 0 ? (
              <div className="text-center p-6 border rounded-lg bg-muted/30 border-dashed">
                <p className="text-muted-foreground">Realiza una búsqueda para ver los resultados aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Resultados de búsqueda</h2>
                <p className="text-muted-foreground text-sm">
                  Se encontraron {searchResults.length} gastos por un total de $
                  {searchResults.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.map((expense) => (
                    <div key={expense.id} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{expense.name}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                          {expense.tags && expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {expense.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

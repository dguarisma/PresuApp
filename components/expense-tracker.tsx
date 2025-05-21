"use client"

import { useState, useEffect } from "react"
import BudgetForm from "./budget-form"
import ExpenseSummary from "./expense-summary"
import CategoryList from "./category-list"
import AddCategoryForm from "./add-category-form"
import ExpenseCharts from "./expense-charts"
import type { ExpenseItem, BudgetData } from "@/types/expense"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import db from "@/lib/db"
import { useTranslation } from "@/hooks/use-translations"
import IncomeVsExpenses from "@/components/income-vs-expenses"
import incomeDB from "@/lib/db-income"

interface ExpenseTrackerProps {
  budgetId: string
}

export default function ExpenseTracker({ budgetId }: ExpenseTrackerProps) {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    amount: 0,
    categories: [],
  })
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { t } = useTranslation()
  const [totalIncome, setTotalIncome] = useState<number>(0)

  // Cargar datos del presupuesto
  useEffect(() => {
    const budgetData = db.getBudgetData(budgetId)
    setBudgetData(budgetData)
    setIsLoading(false)
  }, [budgetId])

  // Cargar ingresos totales
  useEffect(() => {
    const income = incomeDB.getTotalIncome(budgetId)
    setTotalIncome(income)
  }, [budgetId])

  // Calcular el total gastado cuando cambian las categorías
  useEffect(() => {
    const newTotal = budgetData.categories.reduce((total, category) => {
      const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0)
      return total + categoryTotal
    }, 0)
    setTotalSpent(newTotal)
  }, [budgetData.categories])

  // Manejar el cambio de presupuesto
  const handleBudgetChange = (newBudget: number) => {
    const updatedData = db.setBudgetAmount(budgetId, newBudget)
    setBudgetData(updatedData)
  }

  // Agregar una nueva categoría
  const handleAddCategory = (categoryName: string) => {
    const newCategory = db.addCategory(budgetId, categoryName)
    setBudgetData(db.getBudgetData(budgetId))
  }

  // Agregar un nuevo item a una categoría
  const handleAddItem = (categoryId: string, item: ExpenseItem) => {
    db.addExpense(budgetId, categoryId, {
      name: item.name,
      amount: item.amount,
      date: item.date || new Date().toISOString(),
    })
    setBudgetData(db.getBudgetData(budgetId))
  }

  // Eliminar un item
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    db.deleteExpense(budgetId, categoryId, itemId)
    setBudgetData(db.getBudgetData(budgetId))
  }

  // Eliminar una categoría
  const handleDeleteCategory = (categoryId: string) => {
    console.log("Eliminando categoría con ID:", categoryId)
    db.deleteCategory(budgetId, categoryId)
    setBudgetData(db.getBudgetData(budgetId))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-28">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="categories">{t("categories.categoryTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-in">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <BudgetForm budget={budgetData.amount} budgetId={budgetId} onBudgetChange={handleBudgetChange} />
              <ExpenseSummary
                budget={budgetData.amount}
                totalSpent={totalSpent}
                remaining={budgetData.amount - totalSpent}
                totalIncome={totalIncome}
              />
            </div>
            <div>
              <ExpenseCharts
                categories={budgetData.categories}
                totalBudget={budgetData.amount}
                totalSpent={totalSpent}
              />
            </div>
          </div>

          <div className="mt-6">
            <IncomeVsExpenses budgetId={budgetId} />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="animate-in">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <AddCategoryForm onAddCategory={handleAddCategory} />
            </div>
            <div>
              <CategoryList
                categories={budgetData.categories}
                onAddItem={handleAddItem}
                onDeleteItem={handleDeleteItem}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

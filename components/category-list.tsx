"use client"

import type React from "react"

import { useState } from "react"
import type { Category, ExpenseItem } from "@/types/expense"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Receipt } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

// Importar el componente SwipeableItem
import { SwipeableItem } from "@/components/swipeable-item"

interface CategoryListProps {
  categories: Category[]
  onAddItem: (categoryId: string, item: ExpenseItem) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
  onDeleteCategory: (categoryId: string) => void
}

export default function CategoryList({ categories, onAddItem, onDeleteItem, onDeleteCategory }: CategoryListProps) {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Función específica para manejar la eliminación de una categoría
  const handleDeleteCategory = (categoryId: string) => {
    console.log("Eliminando categoría específica con ID:", categoryId)
    onDeleteCategory(categoryId)
    if (activeCategory === categoryId) {
      setActiveCategory(null)
    }
  }

  const toggleCategoryForm = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="space-y-6">
      {categories.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
          <p className="text-muted-foreground">{t("categories.noCategories")}</p>
        </div>
      ) : (
        categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            onDeleteCategory={handleDeleteCategory}
            isFormActive={activeCategory === category.id}
            onToggleForm={() => toggleCategoryForm(category.id)}
          />
        ))
      )}
    </div>
  )
}

interface CategoryCardProps {
  category: Category
  onAddItem: (categoryId: string, item: ExpenseItem) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
  onDeleteCategory: (categoryId: string) => void
  isFormActive: boolean
  onToggleForm: () => void
}

// Reemplazar la función CategoryCard para usar SwipeableItem
function CategoryCard({
  category,
  onAddItem,
  onDeleteItem,
  onDeleteCategory,
  isFormActive,
  onToggleForm,
}: CategoryCardProps) {
  const { t } = useTranslation()
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(newItemAmount)
    if (newItemName.trim() && !isNaN(amount) && amount > 0) {
      setIsSubmitting(true)
      onAddItem(category.id, {
        id: "", // Se asignará en el componente padre
        name: newItemName.trim(),
        amount,
        date: new Date().toISOString(), // Añadir fecha
      })
      setNewItemName("")
      setNewItemAmount("")
      setTimeout(() => {
        setIsSubmitting(false)
        onToggleForm() // Close the form after submission
      }, 300)
    }
  }

  // Calcular el total de la categoría
  const categoryTotal = category.items.reduce((sum, item) => sum + item.amount, 0)

  // Función específica para manejar la eliminación de esta categoría
  const handleDeleteThisCategory = () => {
    console.log("Eliminando categoría con ID específico:", category.id)
    onDeleteCategory(category.id)
  }

  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">{category.name}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteThisCategory}
          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("categories.deleteCategory")}</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Formulario para agregar items - solo se muestra cuando isFormActive es true */}
        {isFormActive && (
          <div className="p-4 bg-muted/10 border-b border-border/30">
            <form onSubmit={handleAddItem} className="flex flex-col space-y-3">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={t("expenses.expenseName")}
                className="w-full"
                disabled={isSubmitting}
              />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !newItemName.trim() || !newItemAmount}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  {t("expenses.addExpense")}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de items */}
        <div className="px-4 py-2">
          {category.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-muted-foreground/50 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">{t("expenses.noExpenses")}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{t("expenses.addExpensePrompt")}</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 py-2">
              {category.items.map((item) => (
                <SwipeableItem
                  key={item.id}
                  onDelete={() => onDeleteItem(category.id, item.id)}
                  deleteText={t("actions.delete")}
                  className="mb-1"
                >
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-muted/20 transition-colors text-sm">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="font-medium whitespace-nowrap text-primary">${item.amount.toFixed(2)}</span>
                  </div>
                </SwipeableItem>
              ))}
            </div>
          )}
        </div>

        {category.items.length > 0 && (
          <div className="flex justify-between py-2 px-4 font-medium border-t border-border/30 bg-muted/10 text-sm">
            <span>
              {t("budget.total")} {category.name}:
            </span>
            <span className="text-primary font-semibold">${categoryTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Floating Action Button */}
        <Button
          onClick={onToggleForm}
          className="absolute bottom-28 right-4 z-10 rounded-full w-10 h-10 shadow-md bg-teal-500 hover:bg-teal-600 text-white"
          aria-label={isFormActive ? t("actions.close") : t("expenses.addExpense")}
        >
          {isFormActive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

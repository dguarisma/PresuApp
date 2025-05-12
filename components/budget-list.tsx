"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Budget {
  id: string
  name: string
  createdAt: string
}

interface BudgetListProps {
  onClose?: () => void
  onBudgetSelected?: (budgetId: string) => void
}

export function BudgetList({ onClose, onBudgetSelected }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar presupuestos
    const loadBudgets = () => {
      try {
        const budgetsJson = localStorage.getItem("budgets")
        const storedBudgets = budgetsJson ? JSON.parse(budgetsJson) : []
        setBudgets(storedBudgets)
      } catch (error) {
        console.error("Error al cargar presupuestos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgets()
  }, [])

  const handleBudgetClick = (budgetId: string) => {
    onBudgetSelected?.(budgetId)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select a Budget</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        ) : budgets.length === 0 ? (
          <p>No budgets available.</p>
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <Button key={budget.id} variant="outline" className="w-full" onClick={() => handleBudgetClick(budget.id)}>
                {budget.name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

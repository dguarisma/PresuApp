"use client"

import { useEffect, useState } from "react"
import { NotificationChecker } from "@/components/notification-checker"
import type { Budget } from "@/types/expense"

export function NotificationProvider() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Record<string, number>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Cargar presupuestos y gastos del localStorage
    try {
      // Cargar presupuestos
      const budgetsData = localStorage.getItem("budgets")
      const loadedBudgets: Budget[] = budgetsData ? JSON.parse(budgetsData) : []
      setBudgets(loadedBudgets)

      // Cargar gastos y calcular totales por presupuesto
      const expensesData = localStorage.getItem("expenses")
      const loadedExpenses = expensesData ? JSON.parse(expensesData) : {}

      // Calcular gastos totales por presupuesto
      const expenseTotals: Record<string, number> = {}

      // Iterar sobre cada presupuesto
      loadedBudgets.forEach((budget) => {
        // Obtener gastos para este presupuesto
        const budgetExpenses = loadedExpenses[budget.id] || []

        // Sumar todos los gastos
        const total = budgetExpenses.reduce((sum: number, expense: any) => {
          return sum + (Number.parseFloat(expense.amount) || 0)
        }, 0)

        // Guardar el total
        expenseTotals[budget.id] = total
      })

      setExpenses(expenseTotals)
      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading budgets and expenses:", error)
      setIsLoaded(true) // Marcar como cargado incluso en caso de error
    }
  }, [])

  // No renderizar nada hasta que los datos estén cargados
  if (!isLoaded) return null

  // Si no hay presupuestos, no hay nada que verificar
  if (budgets.length === 0) return null

  return <NotificationChecker budgets={budgets} expenses={expenses} />
}

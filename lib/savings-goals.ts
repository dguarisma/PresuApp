import { v4 as uuidv4 } from "uuid"
import type { SavingsGoal } from "@/types/savings-goal"

// Prefijo para las claves de localStorage
const STORAGE_PREFIX = "savings_goals_"

// Obtener todas las metas de ahorro
export function getAllSavingsGoals(): SavingsGoal[] {
  try {
    const goalsJson = localStorage.getItem("savings_goals")
    return goalsJson ? JSON.parse(goalsJson) : []
  } catch (error) {
    console.error("Error al cargar metas de ahorro:", error)
    return []
  }
}

// Obtener metas de ahorro por ID de presupuesto
export function getSavingsGoalsByBudget(budgetId: string): SavingsGoal[] {
  try {
    const allGoals = getAllSavingsGoals()
    return allGoals.filter((goal) => goal.budgetId === budgetId)
  } catch (error) {
    console.error(`Error al cargar metas para el presupuesto ${budgetId}:`, error)
    return []
  }
}

// Obtener una meta de ahorro por ID
export function getSavingsGoalById(goalId: string): SavingsGoal | null {
  try {
    const allGoals = getAllSavingsGoals()
    return allGoals.find((goal) => goal.id === goalId) || null
  } catch (error) {
    console.error(`Error al cargar meta de ahorro ${goalId}:`, error)
    return null
  }
}

// Crear una nueva meta de ahorro
export function createSavingsGoal(goalData: Omit<SavingsGoal, "id" | "isCompleted">): SavingsGoal {
  try {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: uuidv4(),
      isCompleted: false,
    }

    const allGoals = getAllSavingsGoals()
    allGoals.push(newGoal)

    localStorage.setItem("savings_goals", JSON.stringify(allGoals))
    return newGoal
  } catch (error) {
    console.error("Error al crear meta de ahorro:", error)
    throw new Error("No se pudo crear la meta de ahorro")
  }
}

// Actualizar una meta de ahorro existente
export function updateSavingsGoal(goalId: string, updatedData: Partial<SavingsGoal>): SavingsGoal {
  try {
    const allGoals = getAllSavingsGoals()
    const goalIndex = allGoals.findIndex((goal) => goal.id === goalId)

    if (goalIndex === -1) {
      throw new Error(`Meta de ahorro con ID ${goalId} no encontrada`)
    }

    // Actualizar los campos proporcionados
    const updatedGoal = {
      ...allGoals[goalIndex],
      ...updatedData,
    }

    // Verificar si la meta está completada
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount && !updatedGoal.isCompleted) {
      updatedGoal.isCompleted = true
    }

    allGoals[goalIndex] = updatedGoal
    localStorage.setItem("savings_goals", JSON.stringify(allGoals))

    return updatedGoal
  } catch (error) {
    console.error(`Error al actualizar meta de ahorro ${goalId}:`, error)
    throw new Error("No se pudo actualizar la meta de ahorro")
  }
}

// Eliminar una meta de ahorro
export function deleteSavingsGoal(goalId: string): boolean {
  try {
    const allGoals = getAllSavingsGoals()
    const filteredGoals = allGoals.filter((goal) => goal.id !== goalId)

    if (filteredGoals.length === allGoals.length) {
      return false // No se encontró la meta para eliminar
    }

    localStorage.setItem("savings_goals", JSON.stringify(filteredGoals))
    return true
  } catch (error) {
    console.error(`Error al eliminar meta de ahorro ${goalId}:`, error)
    return false
  }
}

// Actualizar el progreso de una meta de ahorro
export function updateSavingsGoalProgress(goalId: string, newAmount: number): SavingsGoal | null {
  try {
    const goal = getSavingsGoalById(goalId)
    if (!goal) return null

    return updateSavingsGoal(goalId, {
      currentAmount: newAmount,
      isCompleted: newAmount >= goal.targetAmount,
    })
  } catch (error) {
    console.error(`Error al actualizar progreso de meta ${goalId}:`, error)
    return null
  }
}

// Obtener el progreso de una meta como porcentaje
export function getSavingsGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) return 0
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  return Math.min(progress, 100) // Limitar a 100% máximo
}

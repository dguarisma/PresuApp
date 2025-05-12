"use client"

import type { IncomeItem, IncomeSource, IncomeData } from "@/types/income"
import { generateUUID } from "@/lib/uuid"

// Prefijos para las claves en localStorage
const INCOME_DATA_PREFIX = "income_"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Funciones para gestionar ingresos
const incomeDB = {
  // Obtener todos los datos de ingresos para un presupuesto
  getIncomeData: (budgetId: string): IncomeData => {
    try {
      if (!isBrowser) {
        return { sources: [], items: [] }
      }

      const dataJson = localStorage.getItem(`${INCOME_DATA_PREFIX}${budgetId}`)
      return dataJson ? JSON.parse(dataJson) : { sources: [], items: [] }
    } catch (error) {
      console.error(`Error al obtener datos de ingresos del presupuesto ${budgetId}:`, error)
      return { sources: [], items: [] }
    }
  },

  // Guardar datos de ingresos
  saveIncomeData: (budgetId: string, data: IncomeData): void => {
    try {
      if (!isBrowser) return
      localStorage.setItem(`${INCOME_DATA_PREFIX}${budgetId}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error al guardar datos de ingresos del presupuesto ${budgetId}:`, error)
    }
  },

  // Añadir una fuente de ingresos
  addIncomeSource: (budgetId: string, name: string): IncomeSource => {
    try {
      if (!isBrowser) {
        throw new Error("No se puede añadir fuente de ingresos fuera del navegador")
      }

      const incomeData = incomeDB.getIncomeData(budgetId)
      const newSource: IncomeSource = {
        id: generateUUID(),
        name: name.trim(),
      }

      const updatedData = {
        ...incomeData,
        sources: [...incomeData.sources, newSource],
      }

      incomeDB.saveIncomeData(budgetId, updatedData)
      return newSource
    } catch (error) {
      console.error(`Error al añadir fuente de ingresos a presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir la fuente de ingresos")
    }
  },

  // Eliminar una fuente de ingresos
  deleteIncomeSource: (budgetId: string, sourceId: string): boolean => {
    try {
      if (!isBrowser) return false

      const incomeData = incomeDB.getIncomeData(budgetId)

      // Eliminar la fuente
      const updatedSources = incomeData.sources.filter((source) => source.id !== sourceId)

      // Eliminar también los ingresos asociados a esta fuente
      const updatedItems = incomeData.items.filter((item) => item.sourceId !== sourceId)

      incomeDB.saveIncomeData(budgetId, {
        sources: updatedSources,
        items: updatedItems,
      })

      return true
    } catch (error) {
      console.error(`Error al eliminar fuente de ingresos ${sourceId}:`, error)
      return false
    }
  },

  // Añadir un ingreso
  addIncome: (budgetId: string, income: Omit<IncomeItem, "id">): IncomeItem => {
    try {
      if (!isBrowser) {
        throw new Error("No se puede añadir ingreso fuera del navegador")
      }

      const incomeData = incomeDB.getIncomeData(budgetId)

      const newIncome: IncomeItem = {
        id: generateUUID(),
        ...income,
        date: income.date || new Date().toISOString(),
        tags: income.tags || [],
      }

      const updatedData = {
        ...incomeData,
        items: [...incomeData.items, newIncome],
      }

      incomeDB.saveIncomeData(budgetId, updatedData)
      return newIncome
    } catch (error) {
      console.error(`Error al añadir ingreso a presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir el ingreso")
    }
  },

  // Actualizar un ingreso
  updateIncome: (budgetId: string, incomeId: string, data: Partial<IncomeItem>): IncomeItem | null => {
    try {
      if (!isBrowser) return null

      const incomeData = incomeDB.getIncomeData(budgetId)
      const incomeIndex = incomeData.items.findIndex((item) => item.id === incomeId)

      if (incomeIndex === -1) return null

      const updatedIncome = {
        ...incomeData.items[incomeIndex],
        ...data,
      }

      const updatedItems = [...incomeData.items]
      updatedItems[incomeIndex] = updatedIncome

      incomeDB.saveIncomeData(budgetId, {
        ...incomeData,
        items: updatedItems,
      })

      return updatedIncome
    } catch (error) {
      console.error(`Error al actualizar ingreso ${incomeId}:`, error)
      return null
    }
  },

  // Eliminar un ingreso
  deleteIncome: (budgetId: string, incomeId: string): boolean => {
    try {
      if (!isBrowser) return false

      const incomeData = incomeDB.getIncomeData(budgetId)
      const updatedItems = incomeData.items.filter((item) => item.id !== incomeId)

      incomeDB.saveIncomeData(budgetId, {
        ...incomeData,
        items: updatedItems,
      })

      return true
    } catch (error) {
      console.error(`Error al eliminar ingreso ${incomeId}:`, error)
      return false
    }
  },

  // Obtener el total de ingresos para un período
  getTotalIncome: (budgetId: string): number => {
    try {
      if (!isBrowser) return 0

      const incomeData = incomeDB.getIncomeData(budgetId)
      return incomeData.items.reduce((total, item) => total + item.amount, 0)
    } catch (error) {
      console.error(`Error al calcular total de ingresos para presupuesto ${budgetId}:`, error)
      return 0
    }
  },

  // Añadir esta función al objeto incomeDB
  getAllIncomes: (): IncomeItem[] => {
    if (!isBrowser) return []

    // Obtener todas las claves de localStorage que empiezan con el prefijo de ingresos
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(INCOME_DATA_PREFIX))

    // Obtener todos los ingresos de todos los presupuestos
    const allIncomes: IncomeItem[] = []
    keys.forEach((key) => {
      try {
        const budgetId = key.replace(INCOME_DATA_PREFIX, "")
        const incomeData = incomeDB.getIncomeData(budgetId)
        allIncomes.push(...incomeData.items)
      } catch (error) {
        console.error(`Error al obtener ingresos de ${key}:`, error)
      }
    })

    return allIncomes
  },
}

export const getTotalIncome = incomeDB.getTotalIncome
export const getAllIncomes = incomeDB.getAllIncomes
export default incomeDB

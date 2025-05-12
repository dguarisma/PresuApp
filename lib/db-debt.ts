import type { DebtItem, DebtData } from "@/types/debt"
import { generateUUID } from "@/lib/uuid"

// Prefijos para las claves en localStorage
const DEBT_DATA_PREFIX = "debt_"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Funciones para gestionar deudas
export const debtDB = {
  // Obtener todos los datos de deudas para un presupuesto
  getDebtData: (budgetId: string): DebtData => {
    try {
      if (!isBrowser) {
        return { items: [] }
      }

      const dataJson = localStorage.getItem(`${DEBT_DATA_PREFIX}${budgetId}`)
      return dataJson ? JSON.parse(dataJson) : { items: [] }
    } catch (error) {
      console.error(`Error al obtener datos de deudas del presupuesto ${budgetId}:`, error)
      return { items: [] }
    }
  },

  // Guardar datos de deudas
  saveDebtData: (budgetId: string, data: DebtData): void => {
    try {
      if (!isBrowser) return
      localStorage.setItem(`${DEBT_DATA_PREFIX}${budgetId}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Error al guardar datos de deudas del presupuesto ${budgetId}:`, error)
    }
  },

  // Añadir una deuda
  addDebt: (budgetId: string, debt: Omit<DebtItem, "id">): DebtItem => {
    try {
      if (!isBrowser) {
        throw new Error("No se puede añadir deuda fuera del navegador")
      }

      const debtData = debtDB.getDebtData(budgetId)

      const newDebt: DebtItem = {
        id: generateUUID(),
        ...debt,
      }

      const updatedData = {
        ...debtData,
        items: [...debtData.items, newDebt],
      }

      debtDB.saveDebtData(budgetId, updatedData)
      return newDebt
    } catch (error) {
      console.error(`Error al añadir deuda a presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir la deuda")
    }
  },

  // Actualizar una deuda
  updateDebt: (budgetId: string, debtId: string, data: Partial<DebtItem>): DebtItem | null => {
    try {
      if (!isBrowser) return null

      const debtData = debtDB.getDebtData(budgetId)
      const debtIndex = debtData.items.findIndex((item) => item.id === debtId)

      if (debtIndex === -1) return null

      const updatedDebt = {
        ...debtData.items[debtIndex],
        ...data,
      }

      const updatedItems = [...debtData.items]
      updatedItems[debtIndex] = updatedDebt

      debtDB.saveDebtData(budgetId, {
        ...debtData,
        items: updatedItems,
      })

      return updatedDebt
    } catch (error) {
      console.error(`Error al actualizar deuda ${debtId}:`, error)
      return null
    }
  },

  // Eliminar una deuda
  deleteDebt: (budgetId: string, debtId: string): boolean => {
    try {
      if (!isBrowser) return false

      const debtData = debtDB.getDebtData(budgetId)
      const updatedItems = debtData.items.filter((item) => item.id !== debtId)

      debtDB.saveDebtData(budgetId, {
        ...debtData,
        items: updatedItems,
      })

      return true
    } catch (error) {
      console.error(`Error al eliminar deuda ${debtId}:`, error)
      return false
    }
  },

  // Obtener el total de deudas
  getTotalDebt: (budgetId: string): number => {
    try {
      if (!isBrowser) return 0

      const debtData = debtDB.getDebtData(budgetId)
      return debtData.items.reduce((total, item) => total + item.amount, 0)
    } catch (error) {
      console.error(`Error al calcular total de deudas para presupuesto ${budgetId}:`, error)
      return 0
    }
  },

  // Obtener el total de pagos mínimos mensuales
  getTotalMinimumPayments: (budgetId: string): number => {
    try {
      if (!isBrowser) return 0

      const debtData = debtDB.getDebtData(budgetId)
      return debtData.items.reduce((total, item) => total + item.minimumPayment, 0)
    } catch (error) {
      console.error(`Error al calcular pagos mínimos para presupuesto ${budgetId}:`, error)
      return 0
    }
  },

  // Obtener todas las deudas (global)
  getAllDebts: (): DebtItem[] => {
    if (!isBrowser) return []

    // Obtener todas las claves de localStorage que empiezan con el prefijo de deudas
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(DEBT_DATA_PREFIX))

    // Obtener todas las deudas de todos los presupuestos
    const allDebts: DebtItem[] = []
    keys.forEach((key) => {
      try {
        const budgetId = key.replace(DEBT_DATA_PREFIX, "")
        const debtData = debtDB.getDebtData(budgetId)
        allDebts.push(...debtData.items)
      } catch (error) {
        console.error(`Error al obtener deudas de ${key}:`, error)
      }
    })

    return allDebts
  },
}

// Exportar funciones individuales para facilitar su uso
export const getDebtData = debtDB.getDebtData
export const saveDebtData = debtDB.saveDebtData
export const addDebt = debtDB.addDebt
export const updateDebt = debtDB.updateDebt
export const deleteDebt = debtDB.deleteDebt
export const getTotalDebt = debtDB.getTotalDebt
export const getTotalMinimumPayments = debtDB.getTotalMinimumPayments
export const getAllDebts = debtDB.getAllDebts

export default debtDB

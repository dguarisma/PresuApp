"use client"

import { useState, useEffect, useCallback } from "react"
import db from "@/lib/db-optimized"

/**
 * Hook personalizado para cargar datos de manera optimizada
 * @param loadFn Función que carga los datos
 * @param dependencies Dependencias para recargar los datos
 */
export function useOptimizedData<T>(
  loadFn: () => T,
  dependencies: any[] = [],
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  reload: () => void
} {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Función para cargar datos
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = loadFn()
      setData(result)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar datos"))
    } finally {
      setIsLoading(false)
    }
  }, [loadFn])

  // Función para recargar datos manualmente
  const reload = useCallback(() => {
    loadData()
  }, [loadData])

  // Cargar datos al montar el componente o cuando cambien las dependencias
  useEffect(() => {
    loadData()
  }, [...dependencies, loadData])

  return { data, isLoading, error, reload }
}

/**
 * Hook para cargar presupuestos de manera optimizada
 */
export function useOptimizedBudgets() {
  // Precargar datos al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      db.preloadData()
    }
  }, [])

  return useOptimizedData(() => db.getAllBudgets(), [])
}

/**
 * Hook para cargar datos de un presupuesto específico
 */
export function useOptimizedBudgetData(budgetId: string | null) {
  return useOptimizedData(() => (budgetId ? db.getBudgetData(budgetId) : { amount: 0, categories: [] }), [budgetId])
}

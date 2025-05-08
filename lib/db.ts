import type {
  Budget,
  BudgetData,
  Category,
  ExpenseItem,
  FilterOptions,
  DateRange,
  ReportConfig,
  SubCategory,
} from "@/types/expense"
import { parseISO, isWithinInterval } from "date-fns"
import { generateUUID } from "@/lib/uuid"

// Prefijo para las claves en localStorage
const BUDGET_LIST_KEY = "budgets"
const BUDGET_DATA_PREFIX = "budget_"
const TAGS_KEY = "tags"
const REPORTS_KEY = "reports"

// Interfaz para las funciones de la base de datos
interface DB {
  // Funciones para gestionar presupuestos
  getAllBudgets: () => Budget[]
  getBudget: (id: string) => Budget | null
  createBudget: (name: string) => Budget
  updateBudget: (id: string, data: Partial<Budget>) => Budget | null
  deleteBudget: (id: string) => boolean

  // Funciones para gestionar datos de presupuestos
  getBudgetData: (budgetId: string) => BudgetData
  updateBudgetData: (budgetId: string, data: Partial<BudgetData>) => BudgetData
  setBudgetAmount: (budgetId: string, amount: number) => BudgetData

  // Funciones para gestionar categorías
  addCategory: (budgetId: string, name: string) => Category
  updateCategory: (budgetId: string, categoryId: number, data: Partial<Category>) => Category | null
  deleteCategory: (budgetId: string, categoryId: number) => boolean

  // Funciones para gestionar subcategorías
  addSubCategory: (budgetId: string, categoryId: string, name: string) => SubCategory
  updateSubCategory: (
    budgetId: string,
    categoryId: number,
    subCategoryId: number,
    data: Partial<SubCategory>,
  ) => SubCategory | null
  deleteSubCategory: (budgetId: string, categoryId: number, subCategoryId: number) => boolean

  // Funciones para gestionar gastos
  addExpense: (
    budgetId: string,
    categoryId: string,
    expense: Omit<ExpenseItem, "id">,
    subCategoryId?: string,
  ) => ExpenseItem
  updateExpense: (
    budgetId: string,
    categoryId: number,
    expenseId: number,
    data: Partial<ExpenseItem>,
    subCategoryId?: number,
  ) => ExpenseItem | null
  deleteExpense: (budgetId: string, categoryId: number, expenseId: number, subCategoryId?: number) => boolean

  // Funciones para filtrar y buscar gastos
  getExpensesByDateRange: (budgetId: string, dateRange: DateRange) => ExpenseItem[]
  filterExpenses: (budgetId: string, filters: FilterOptions) => ExpenseItem[]

  // Funciones para gestionar etiquetas
  getAllTags: () => string[]
  addTag: (tag: string) => void

  // Funciones para gestionar reportes
  getSavedReports: () => ReportConfig[]
  saveReport: (report: ReportConfig) => void
  deleteReport: (reportId: string) => boolean

  // Función para inicializar datos de ejemplo
  initializeExampleData: () => void
}

// Implementación de la base de datos
const db: DB = {
  // Funciones para gestionar presupuestos
  getAllBudgets: () => {
    try {
      const budgetsJson = localStorage.getItem(BUDGET_LIST_KEY)
      if (!budgetsJson) {
        return []
      }

      const parsedBudgets = JSON.parse(budgetsJson)
      if (!Array.isArray(parsedBudgets)) {
        console.warn("El formato de presupuestos almacenados no es un array, inicializando vacío")
        return []
      }

      return parsedBudgets
    } catch (error) {
      console.error("Error al obtener presupuestos:", error)
      return []
    }
  },

  getBudget: (id: string) => {
    try {
      const budgets = db.getAllBudgets()
      return budgets.find((budget) => budget.id === id) || null
    } catch (error) {
      console.error(`Error al obtener presupuesto ${id}:`, error)
      return null
    }
  },

  createBudget: (name: string) => {
    try {
      const budgets = db.getAllBudgets()
      const newBudget: Budget = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      }

      // Guardar en la lista de presupuestos
      const updatedBudgets = [...budgets, newBudget]
      localStorage.setItem(BUDGET_LIST_KEY, JSON.stringify(updatedBudgets))

      // Crear estructura de datos vacía para el presupuesto
      const emptyData: BudgetData = {
        amount: 0,
        categories: [],
      }
      localStorage.setItem(`${BUDGET_DATA_PREFIX}${newBudget.id}`, JSON.stringify(emptyData))

      // Verificar que se guardó correctamente
      const savedBudgets = localStorage.getItem(BUDGET_LIST_KEY)
      if (!savedBudgets || !JSON.parse(savedBudgets).some((b: Budget) => b.id === newBudget.id)) {
        throw new Error("No se pudo guardar el presupuesto")
      }

      return newBudget
    } catch (error) {
      console.error(`Error al crear presupuesto ${name}:`, error)
      throw new Error("No se pudo crear el presupuesto")
    }
  },

  updateBudget: (id: string, data: Partial<Budget>) => {
    try {
      const budgets = db.getAllBudgets()
      const index = budgets.findIndex((budget) => budget.id === id)

      if (index === -1) return null

      const updatedBudget = { ...budgets[index], ...data }
      budgets[index] = updatedBudget

      localStorage.setItem(BUDGET_LIST_KEY, JSON.stringify(budgets))
      return updatedBudget
    } catch (error) {
      console.error(`Error al actualizar presupuesto ${id}:`, error)
      return null
    }
  },

  deleteBudget: (id: string) => {
    try {
      console.log("Eliminando presupuesto con ID:", id)

      // Verificar que el presupuesto existe antes de intentar eliminarlo
      const budgets = db.getAllBudgets()
      const budgetExists = budgets.some((budget) => budget.id === id)

      if (!budgetExists) {
        console.error("Presupuesto no encontrado para eliminar:", id)
        return false
      }

      // Filtrar el presupuesto a eliminar
      const filteredBudgets = budgets.filter((budget) => budget.id !== id)

      // Guardar la lista actualizada
      localStorage.setItem(BUDGET_LIST_KEY, JSON.stringify(filteredBudgets))

      // Eliminar los datos del presupuesto
      localStorage.removeItem(`${BUDGET_DATA_PREFIX}${id}`)

      // Verificar que se haya eliminado correctamente
      const updatedBudgets = JSON.parse(localStorage.getItem(BUDGET_LIST_KEY) || "[]")
      const wasDeleted = !updatedBudgets.some((budget: Budget) => budget.id === id)

      console.log("¿Presupuesto eliminado correctamente?", wasDeleted)

      return wasDeleted
    } catch (error) {
      console.error(`Error al eliminar presupuesto ${id}:`, error)
      return false
    }
  },

  // Funciones para gestionar datos de presupuestos
  getBudgetData: (budgetId: string) => {
    try {
      const dataJson = localStorage.getItem(`${BUDGET_DATA_PREFIX}${budgetId}`)
      const data = dataJson ? JSON.parse(dataJson) : { amount: 0, categories: [] }

      // Asegurarse de que cada categoría tenga un array de subcategorías
      if (data.categories) {
        data.categories = data.categories.map((category: Category) => ({
          ...category,
          subCategories: category.subCategories || [],
        }))
      }

      return data
    } catch (error) {
      console.error(`Error al obtener datos del presupuesto ${budgetId}:`, error)
      return { amount: 0, categories: [] }
    }
  },

  updateBudgetData: (budgetId: string, data: Partial<BudgetData>) => {
    try {
      const currentData = db.getBudgetData(budgetId)
      const updatedData = { ...currentData, ...data }

      localStorage.setItem(`${BUDGET_DATA_PREFIX}${budgetId}`, JSON.stringify(updatedData))
      return updatedData
    } catch (error) {
      console.error(`Error al actualizar datos del presupuesto ${budgetId}:`, error)
      throw new Error("No se pudieron actualizar los datos del presupuesto")
    }
  },

  setBudgetAmount: (budgetId: string, amount: number) => {
    return db.updateBudgetData(budgetId, { amount })
  },

  // Funciones para gestionar categorías
  addCategory: (budgetId: string, name: string) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const newCategory: Category = {
        id: generateUUID(), // Usar UUID en lugar de timestamp
        name: name.trim(),
        items: [],
        subCategories: [],
      }

      const updatedData = {
        ...budgetData,
        categories: [...budgetData.categories, newCategory],
      }

      localStorage.setItem(`${BUDGET_DATA_PREFIX}${budgetId}`, JSON.stringify(updatedData))
      return newCategory
    } catch (error) {
      console.error(`Error al añadir categoría a presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir la categoría")
    }
  },

  updateCategory: (budgetId: string, categoryId: number, data: Partial<Category>) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) return null

      const updatedCategory = { ...budgetData.categories[categoryIndex], ...data }
      const updatedCategories = [...budgetData.categories]
      updatedCategories[categoryIndex] = updatedCategory

      db.updateBudgetData(budgetId, { categories: updatedCategories })
      return updatedCategory
    } catch (error) {
      console.error(`Error al actualizar categoría ${categoryId} en presupuesto ${budgetId}:`, error)
      return null
    }
  },

  deleteCategory: (budgetId: string, categoryId: number) => {
    try {
      // Obtener los datos actuales del presupuesto
      const dataJson = localStorage.getItem(`budget_${budgetId}`)
      if (!dataJson) return null

      const budgetData = JSON.parse(dataJson)

      // Filtrar para mantener solo las categorías que NO coinciden con el ID a eliminar
      budgetData.categories = budgetData.categories.filter((category: any) => category.id !== categoryId)

      // Guardar los datos actualizados
      localStorage.setItem(`budget_${budgetId}`, JSON.stringify(budgetData))

      return budgetData
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      return null
    }
  },

  // Funciones para gestionar subcategorías
  addSubCategory: (budgetId: string, categoryId: string, name: string) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) throw new Error("Categoría no encontrada")

      const newSubCategory: SubCategory = {
        id: generateUUID(), // Usar UUID en lugar de timestamp
        name: name.trim(),
        items: [],
      }

      const category = budgetData.categories[categoryIndex]
      const updatedSubCategories = [...(category.subCategories || []), newSubCategory]

      const updatedCategory = {
        ...category,
        subCategories: updatedSubCategories,
      }

      const updatedCategories = [...budgetData.categories]
      updatedCategories[categoryIndex] = updatedCategory

      db.updateBudgetData(budgetId, { categories: updatedCategories })
      return newSubCategory
    } catch (error) {
      console.error(`Error al añadir subcategoría a categoría ${categoryId} en presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir la subcategoría")
    }
  },

  updateSubCategory: (budgetId: string, categoryId: number, subCategoryId: number, data: Partial<SubCategory>) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) return null

      const category = budgetData.categories[categoryIndex]
      const subCategoryIndex = category.subCategories?.findIndex((subCat) => subCat.id === subCategoryId) ?? -1

      if (subCategoryIndex === -1) return null

      const updatedSubCategory = { ...category.subCategories[subCategoryIndex], ...data }
      const updatedSubCategories = [...category.subCategories]
      updatedSubCategories[subCategoryIndex] = updatedSubCategory

      const updatedCategory = {
        ...category,
        subCategories: updatedSubCategories,
      }

      const updatedCategories = [...budgetData.categories]
      updatedCategories[categoryIndex] = updatedCategory

      db.updateBudgetData(budgetId, { categories: updatedCategories })
      return updatedSubCategory
    } catch (error) {
      console.error(
        `Error al actualizar subcategoría ${subCategoryId} en categoría ${categoryId} de presupuesto ${budgetId}:`,
        error,
      )
      return null
    }
  },

  deleteSubCategory: (budgetId: string, categoryId: number, subCategoryId: number) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) return false

      const category = budgetData.categories[categoryIndex]

      if (!category.subCategories) return false

      const updatedSubCategories = category.subCategories.filter((subCat) => subCat.id !== subCategoryId)

      const updatedCategory = {
        ...category,
        subCategories: updatedSubCategories,
      }

      const updatedCategories = [...budgetData.categories]
      updatedCategories[categoryIndex] = updatedCategory

      db.updateBudgetData(budgetId, { categories: updatedCategories })
      return true
    } catch (error) {
      console.error(
        `Error al eliminar subcategoría ${subCategoryId} en categoría ${categoryId} de presupuesto ${budgetId}:`,
        error,
      )
      return false
    }
  },

  // Funciones para gestionar gastos
  addExpense: (budgetId: string, categoryId: string, expense: Omit<ExpenseItem, "id">, subCategoryId?: string) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) throw new Error("Categoría no encontrada")

      const newExpense: ExpenseItem = {
        id: generateUUID(), // Usar UUID en lugar de timestamp
        ...expense,
        date: expense.date || new Date().toISOString(),
        tags: expense.tags || [],
      }

      // Si se especifica una subcategoría, añadir el gasto a ella
      if (subCategoryId) {
        const category = budgetData.categories[categoryIndex]
        const subCategoryIndex = category.subCategories?.findIndex((subCat) => subCat.id === subCategoryId) ?? -1

        if (subCategoryIndex === -1) throw new Error("Subcategoría no encontrada")

        const updatedSubCategory = {
          ...category.subCategories[subCategoryIndex],
          items: [...category.subCategories[subCategoryIndex].items, newExpense],
        }

        const updatedSubCategories = [...category.subCategories]
        updatedSubCategories[subCategoryIndex] = updatedSubCategory

        const updatedCategory = {
          ...category,
          subCategories: updatedSubCategories,
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      } else {
        // Añadir el gasto directamente a la categoría
        const updatedCategory = {
          ...budgetData.categories[categoryIndex],
          items: [...budgetData.categories[categoryIndex].items, newExpense],
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      }

      // Añadir etiquetas al almacén global de etiquetas
      if (newExpense.tags && newExpense.tags.length > 0) {
        newExpense.tags.forEach((tag) => db.addTag(tag))
      }

      return newExpense
    } catch (error) {
      console.error(`Error al añadir gasto a categoría ${categoryId} en presupuesto ${budgetId}:`, error)
      throw new Error("No se pudo añadir el gasto")
    }
  },

  updateExpense: (
    budgetId: string,
    categoryId: number,
    expenseId: number,
    data: Partial<ExpenseItem>,
    subCategoryId?: number,
  ) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) return null

      let updatedExpense: ExpenseItem | null = null

      if (subCategoryId) {
        // Actualizar gasto en subcategoría
        const category = budgetData.categories[categoryIndex]
        const subCategoryIndex = category.subCategories?.findIndex((subCat) => subCat.id === subCategoryId) ?? -1

        if (subCategoryIndex === -1) return null

        const subCategory = category.subCategories[subCategoryIndex]
        const expenseIndex = subCategory.items.findIndex((item) => item.id === expenseId)

        if (expenseIndex === -1) return null

        updatedExpense = {
          ...subCategory.items[expenseIndex],
          ...data,
        }

        const updatedItems = [...subCategory.items]
        updatedItems[expenseIndex] = updatedExpense

        const updatedSubCategory = {
          ...subCategory,
          items: updatedItems,
        }

        const updatedSubCategories = [...category.subCategories]
        updatedSubCategories[subCategoryIndex] = updatedSubCategory

        const updatedCategory = {
          ...category,
          subCategories: updatedSubCategories,
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      } else {
        // Actualizar gasto en categoría
        const expenseIndex = budgetData.categories[categoryIndex].items.findIndex((item) => item.id === expenseId)

        if (expenseIndex === -1) return null

        updatedExpense = {
          ...budgetData.categories[categoryIndex].items[expenseIndex],
          ...data,
        }

        const updatedItems = [...budgetData.categories[categoryIndex].items]
        updatedItems[expenseIndex] = updatedExpense

        const updatedCategory = {
          ...budgetData.categories[categoryIndex],
          items: updatedItems,
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      }

      // Añadir nuevas etiquetas al almacén global
      if (updatedExpense && updatedExpense.tags && updatedExpense.tags.length > 0) {
        updatedExpense.tags.forEach((tag) => db.addTag(tag))
      }

      return updatedExpense
    } catch (error) {
      console.error(
        `Error al actualizar gasto ${expenseId} en categoría ${categoryId} de presupuesto ${budgetId}:`,
        error,
      )
      return null
    }
  },

  deleteExpense: (budgetId: string, categoryId: number, expenseId: number, subCategoryId?: number) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const categoryIndex = budgetData.categories.findIndex((cat) => cat.id === categoryId)

      if (categoryIndex === -1) return false

      if (subCategoryId) {
        // Eliminar gasto de subcategoría
        const category = budgetData.categories[categoryIndex]
        const subCategoryIndex = category.subCategories?.findIndex((subCat) => subCat.id === subCategoryId) ?? -1

        if (subCategoryIndex === -1) return false

        const updatedItems = category.subCategories[subCategoryIndex].items.filter((item) => item.id !== expenseId)

        const updatedSubCategory = {
          ...category.subCategories[subCategoryIndex],
          items: updatedItems,
        }

        const updatedSubCategories = [...category.subCategories]
        updatedSubCategories[subCategoryIndex] = updatedSubCategory

        const updatedCategory = {
          ...category,
          subCategories: updatedSubCategories,
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      } else {
        // Eliminar gasto de categoría
        const updatedItems = budgetData.categories[categoryIndex].items.filter((item) => item.id !== expenseId)

        const updatedCategory = {
          ...budgetData.categories[categoryIndex],
          items: updatedItems,
        }

        const updatedCategories = [...budgetData.categories]
        updatedCategories[categoryIndex] = updatedCategory

        db.updateBudgetData(budgetId, { categories: updatedCategories })
      }

      return true
    } catch (error) {
      console.error(
        `Error al eliminar gasto ${expenseId} en categoría ${categoryId} de presupuesto ${budgetId}:`,
        error,
      )
      return false
    }
  },

  // Funciones para filtrar y buscar gastos
  getExpensesByDateRange: (budgetId: string, dateRange: DateRange) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      const startDate = parseISO(dateRange.startDate)
      const endDate = parseISO(dateRange.endDate)

      const allExpenses: ExpenseItem[] = []

      // Recopilar gastos de todas las categorías y subcategorías
      budgetData.categories.forEach((category) => {
        // Gastos de la categoría
        category.items.forEach((item) => {
          if (item.date) {
            const itemDate = parseISO(item.date)
            if (isWithinInterval(itemDate, { start: startDate, end: endDate })) {
              allExpenses.push(item)
            }
          }
        })

        // Gastos de las subcategorías
        if (category.subCategories) {
          category.subCategories.forEach((subCategory) => {
            subCategory.items.forEach((item) => {
              if (item.date) {
                const itemDate = parseISO(item.date)
                if (isWithinInterval(itemDate, { start: startDate, end: endDate })) {
                  allExpenses.push({
                    ...item,
                    subCategoryId: subCategory.id,
                  })
                }
              }
            })
          })
        }
      })

      return allExpenses
    } catch (error) {
      console.error(`Error al obtener gastos por rango de fechas en presupuesto ${budgetId}:`, error)
      return []
    }
  },

  filterExpenses: (budgetId: string, filters: FilterOptions) => {
    try {
      const budgetData = db.getBudgetData(budgetId)
      let allExpenses: ExpenseItem[] = []

      // Recopilar todos los gastos
      budgetData.categories.forEach((category) => {
        // Filtrar por categoría si es necesario
        if (filters.categories && !filters.categories.includes(category.id)) {
          return
        }

        // Gastos de la categoría
        category.items.forEach((item) => {
          allExpenses.push(item)
        })

        // Gastos de las subcategorías
        if (category.subCategories) {
          category.subCategories.forEach((subCategory) => {
            subCategory.items.forEach((item) => {
              allExpenses.push({
                ...item,
                subCategoryId: subCategory.id,
              })
            })
          })
        }
      })

      // Aplicar filtros
      if (filters.dateRange) {
        const startDate = parseISO(filters.dateRange.startDate)
        const endDate = parseISO(filters.dateRange.endDate)

        allExpenses = allExpenses.filter((item) => {
          if (!item.date) return false
          const itemDate = parseISO(item.date)
          return isWithinInterval(itemDate, { start: startDate, end: endDate })
        })
      }

      if (filters.tags && filters.tags.length > 0) {
        allExpenses = allExpenses.filter((item) => {
          if (!item.tags || item.tags.length === 0) return false
          return filters.tags!.some((tag) => item.tags!.includes(tag))
        })
      }

      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        allExpenses = allExpenses.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.notes && item.notes.toLowerCase().includes(searchLower)),
        )
      }

      if (filters.minAmount !== undefined) {
        allExpenses = allExpenses.filter((item) => item.amount >= filters.minAmount!)
      }

      if (filters.maxAmount !== undefined) {
        allExpenses = allExpenses.filter((item) => item.amount <= filters.maxAmount!)
      }

      return allExpenses
    } catch (error) {
      console.error(`Error al filtrar gastos en presupuesto ${budgetId}:`, error)
      return []
    }
  },

  // Funciones para gestionar etiquetas
  getAllTags: () => {
    try {
      const tagsJson = localStorage.getItem(TAGS_KEY)
      return tagsJson ? JSON.parse(tagsJson) : []
    } catch (error) {
      console.error("Error al obtener etiquetas:", error)
      return []
    }
  },

  addTag: (tag: string) => {
    try {
      const tags = db.getAllTags()
      if (!tags.includes(tag)) {
        localStorage.setItem(TAGS_KEY, JSON.stringify([...tags, tag]))
      }
    } catch (error) {
      console.error(`Error al añadir etiqueta ${tag}:`, error)
    }
  },

  // Funciones para gestionar reportes
  getSavedReports: () => {
    try {
      const reportsJson = localStorage.getItem(REPORTS_KEY)
      return reportsJson ? JSON.parse(reportsJson) : []
    } catch (error) {
      console.error("Error al obtener reportes guardados:", error)
      return []
    }
  },

  saveReport: (report: ReportConfig) => {
    try {
      const reports = db.getSavedReports()
      const existingIndex = reports.findIndex((r) => r.id === report.id)

      if (existingIndex >= 0) {
        // Actualizar reporte existente
        reports[existingIndex] = report
      } else {
        // Añadir nuevo reporte
        reports.push(report)
      }

      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
    } catch (error) {
      console.error(`Error al guardar reporte ${report.name}:`, error)
    }
  },

  deleteReport: (reportId: string) => {
    try {
      const reports = db.getSavedReports()
      const updatedReports = reports.filter((report) => report.id !== reportId)

      localStorage.setItem(REPORTS_KEY, JSON.stringify(updatedReports))
      return true
    } catch (error) {
      console.error(`Error al eliminar reporte ${reportId}:`, error)
      return false
    }
  },

  // Función para inicializar datos de ejemplo
  initializeExampleData: () => {
    // No hacer nada - los presupuestos de ejemplo han sido desactivados
    console.log("Inicialización de datos de ejemplo desactivada")
  },
}

export default db

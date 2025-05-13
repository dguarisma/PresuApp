/**
 * Servicio para gestionar el almacenamiento de archivos locales
 * Permite exportar e importar datos de la aplicación como archivos JSON
 */

import db from "@/lib/db"
import type { Budget, BudgetData } from "@/types/expense"
import type { SavingsGoal } from "@/types/savings-goal"
import { getSavingsGoals } from "@/lib/savings-goals"
import userProfileService from "@/services/user-profile-service"

// Interfaz para los datos completos de la aplicación
interface AppData {
  budgets: Budget[]
  budgetData: Record<string, BudgetData>
  tags: string[]
  reports: any[]
  savingsGoals: SavingsGoal[]
  settings: Record<string, any>
  userProfile?: {
    id: string
    name: string
    email?: string
  }
  version: string
}

// Clase para gestionar el almacenamiento de archivos
class FileStorageService {
  // Versión actual del formato de datos
  private version = "1.0.0"

  // Comprueba si la API de sistema de archivos está disponible
  public isFileSystemAccessSupported(): boolean {
    return "showSaveFilePicker" in window
  }

  // Exporta todos los datos de la aplicación a un archivo JSON
  public async exportAllData(): Promise<void> {
    try {
      // Recopilar todos los datos
      const data: AppData = await this.collectAllData()

      // Convertir a JSON
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `presuapp-backup-${new Date().toISOString().split("T")[0]}.json`,
            types: [
              {
                description: "Archivo JSON",
                accept: { "application/json": [".json"] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo para navegadores que no soportan File System Access API
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `presuapp-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al exportar datos:", error)
      throw new Error("No se pudieron exportar los datos")
    }
  }

  // Exporta un presupuesto específico a un archivo JSON
  public async exportBudget(budgetId: string): Promise<void> {
    try {
      const budget = db.getBudget(budgetId)
      if (!budget) {
        throw new Error("Presupuesto no encontrado")
      }

      const budgetData = db.getBudgetData(budgetId)
      const data = {
        budget,
        budgetData,
        version: this.version,
        exportDate: new Date().toISOString(),
      }

      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })

      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `presupuesto-${budget.name.replace(/\s+/g, "-").toLowerCase()}.json`,
            types: [
              {
                description: "Archivo JSON",
                accept: { "application/json": [".json"] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `presupuesto-${budget.name.replace(/\s+/g, "-").toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al exportar presupuesto:", error)
      throw new Error("No se pudo exportar el presupuesto")
    }
  }

  // Importa datos desde un archivo JSON
  public async importData(): Promise<{ success: boolean; message: string }> {
    try {
      let fileContent: string | null = null

      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const [fileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: "Archivos JSON",
                accept: { "application/json": [".json"] },
              },
            ],
            multiple: false,
          })
          const file = await fileHandle.getFile()
          fileContent = await file.text()
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo para navegadores que no soportan File System Access API
      if (!fileContent) {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "application/json"

        const filePromise = new Promise<string>((resolve, reject) => {
          input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (!file) {
              reject(new Error("No se seleccionó ningún archivo"))
              return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
              resolve(e.target?.result as string)
            }
            reader.onerror = () => {
              reject(new Error("Error al leer el archivo"))
            }
            reader.readAsText(file)
          }
        })

        input.click()
        fileContent = await filePromise
      }

      // Procesar el contenido del archivo
      if (!fileContent) {
        return { success: false, message: "No se pudo leer el archivo" }
      }

      const data = JSON.parse(fileContent)

      // Verificar la versión del archivo
      if (!data.version) {
        return { success: false, message: "Formato de archivo no válido" }
      }

      // Importar los datos según el tipo de archivo
      if (data.budgets && Array.isArray(data.budgets)) {
        // Es un backup completo
        await this.importFullBackup(data)
        return { success: true, message: "Datos importados correctamente" }
      } else if (data.budget && data.budgetData) {
        // Es un presupuesto individual
        await this.importSingleBudget(data)
        return { success: true, message: "Presupuesto importado correctamente" }
      } else if (data.profile && data.data) {
        // Es un perfil de usuario
        const newProfile = userProfileService.createProfile(data.profile.name, data.profile.email, data.profile.avatar)
        userProfileService.importProfileData(newProfile.id, data.data)
        return { success: true, message: "Perfil importado correctamente" }
      }

      return { success: false, message: "Formato de archivo no reconocido" }
    } catch (error) {
      console.error("Error al importar datos:", error)
      return { success: false, message: "Error al importar datos" }
    }
  }

  // Recopila todos los datos de la aplicación
  private async collectAllData(): Promise<AppData> {
    // Obtener todos los presupuestos
    const budgets = db.getAllBudgets()

    // Obtener los datos de cada presupuesto
    const budgetData: Record<string, BudgetData> = {}
    for (const budget of budgets) {
      budgetData[budget.id] = db.getBudgetData(budget.id)
    }

    // Obtener etiquetas y reportes
    const tags = db.getAllTags()
    const reports = db.getSavedReports()

    // Obtener metas de ahorro
    const savingsGoals = getSavingsGoals()

    // Obtener configuración
    const settings = this.getSettings()

    // Obtener perfil de usuario activo
    const activeProfile = userProfileService.getActiveProfile()
    const userProfile = activeProfile
      ? {
          id: activeProfile.id,
          name: activeProfile.name,
          email: activeProfile.email,
        }
      : undefined

    return {
      budgets,
      budgetData,
      tags,
      reports,
      savingsGoals,
      settings,
      userProfile,
      version: this.version,
    }
  }

  // Obtiene la configuración de la aplicación desde localStorage
  private getSettings(): Record<string, any> {
    const settings: Record<string, any> = {}

    // Recopilar configuraciones conocidas
    const knownSettings = ["language", "currency", "theme", "fontSize", "highContrast", "notifications", "autoBackup"]

    for (const key of knownSettings) {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          settings[key] = JSON.parse(value)
        } catch {
          settings[key] = value
        }
      }
    }

    return settings
  }

  // Importa un backup completo
  private async importFullBackup(data: AppData): Promise<void> {
    // Importar presupuestos
    localStorage.setItem("budgets", JSON.stringify(data.budgets))

    // Importar datos de presupuestos
    for (const budgetId in data.budgetData) {
      localStorage.setItem(`budget_${budgetId}`, JSON.stringify(data.budgetData[budgetId]))
    }

    // Importar etiquetas
    localStorage.setItem("tags", JSON.stringify(data.tags))

    // Importar reportes
    localStorage.setItem("reports", JSON.stringify(data.reports))

    // Importar metas de ahorro
    localStorage.setItem("savingsGoals", JSON.stringify(data.savingsGoals))

    // Importar configuración
    for (const key in data.settings) {
      localStorage.setItem(key, JSON.stringify(data.settings[key]))
    }
  }

  // Importa un presupuesto individual
  private async importSingleBudget(data: { budget: Budget; budgetData: BudgetData }): Promise<void> {
    // Obtener presupuestos actuales
    const budgets = db.getAllBudgets()

    // Verificar si ya existe un presupuesto con el mismo ID
    const existingIndex = budgets.findIndex((b) => b.id === data.budget.id)

    if (existingIndex >= 0) {
      // Generar un nuevo ID para evitar conflictos
      const newId = Date.now().toString()
      data.budget.id = newId
      data.budget.name += " (Importado)"
    }

    // Añadir el presupuesto a la lista
    budgets.push(data.budget)
    localStorage.setItem("budgets", JSON.stringify(budgets))

    // Guardar los datos del presupuesto
    localStorage.setItem(`budget_${data.budget.id}`, JSON.stringify(data.budgetData))
  }

  // Crea un archivo de texto con el contenido proporcionado
  public async createTextFile(content: string, filename: string): Promise<void> {
    try {
      const blob = new Blob([content], { type: "text/plain" })

      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "Archivo de texto",
                accept: { "text/plain": [".txt"] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al crear archivo de texto:", error)
      throw new Error("No se pudo crear el archivo de texto")
    }
  }

  // Crea un archivo CSV con los datos proporcionados
  public async createCSVFile(data: any[][], filename: string): Promise<void> {
    try {
      // Convertir los datos a formato CSV
      const csvContent = data
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })

      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "Archivo CSV",
                accept: { "text/csv": [".csv"] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al crear archivo CSV:", error)
      throw new Error("No se pudo crear el archivo CSV")
    }
  }

  // Crea un archivo PDF con el contenido proporcionado
  public async createPDFFile(content: Blob, filename: string): Promise<void> {
    try {
      // Usar la API de sistema de archivos si está disponible
      if (this.isFileSystemAccessSupported()) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "Archivo PDF",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(content)
          await writable.close()
          return
        } catch (err) {
          console.log("Error al usar File System Access API, usando método alternativo", err)
          // Si el usuario cancela o hay un error, usar el método alternativo
        }
      }

      // Método alternativo
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error al crear archivo PDF:", error)
      throw new Error("No se pudo crear el archivo PDF")
    }
  }
}

// Exportar una instancia del servicio
const fileStorageService = new FileStorageService()
export default fileStorageService

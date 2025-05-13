"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileSpreadsheet } from "lucide-react"
import { CSVImport } from "@/components/csv-import-responsive"
import { useLanguage } from "@/hooks/use-language"
import { csvImportTranslations } from "@/lib/translations/csv-import"
import db from "@/lib/db"
import { useToast } from "@/hooks/use-toast"
import { generateUUID } from "@/lib/uuid"

interface BudgetCSVImportProps {
  budgetId: string
  onImportComplete?: () => void
}

export function BudgetCSVImport({ budgetId, onImportComplete }: BudgetCSVImportProps) {
  const [open, setOpen] = useState(false)
  const { language } = useLanguage()
  const t = csvImportTranslations[language as keyof typeof csvImportTranslations] || csvImportTranslations.es
  const { toast } = useToast()

  const handleImport = (data: any[]) => {
    try {
      // Contador para seguir cuántos elementos se importaron correctamente
      let importedCount = 0

      // Procesar cada elemento importado
      data.forEach((item) => {
        // Verificar que tengamos al menos categoría y monto
        if (item.category && item.amount) {
          // Convertir el monto a número
          const amount = Number.parseFloat(item.amount.replace(/,/g, "."))

          if (!isNaN(amount)) {
            // Buscar o crear la categoría
            let categoryId = ""
            const budgetData = db.getBudgetData(budgetId)

            // Buscar si la categoría ya existe
            const existingCategory = budgetData.categories.find(
              (cat) => cat.name.toLowerCase() === item.category.toLowerCase(),
            )

            if (existingCategory) {
              categoryId = existingCategory.id
            } else {
              // Crear nueva categoría
              const newCategory = db.addCategory(budgetId, item.category)
              categoryId = newCategory.id
            }

            // Crear el gasto
            if (categoryId) {
              db.addExpense(budgetId, categoryId, {
                id: generateUUID(),
                name: item.description || t.importedExpense || "Gasto importado",
                amount: amount,
                date: item.date || new Date().toISOString(),
                notes: item.notes || "",
                tags: item.tags ? item.tags.split(",").map((tag: string) => tag.trim()) : [],
              })

              importedCount++
            }
          }
        }
      })

      // Mostrar mensaje de éxito
      toast({
        title: t.importSuccess || "Importación exitosa",
        description: `${importedCount} ${t.importedRows || "gastos importados correctamente"}`,
      })

      // Cerrar el diálogo
      setOpen(false)

      // Llamar a onImportComplete para actualizar la UI
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error("Error al procesar datos importados:", error)
      toast({
        title: t.importError || "Error de importación",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-full" onClick={() => setOpen(true)}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t.importButton || "Importar CSV"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t.title || "Importar transacciones desde CSV"}</DialogTitle>
          <DialogDescription>
            {t.dialogDescription || "Sigue los pasos para importar tus transacciones desde un archivo CSV"}
          </DialogDescription>
        </DialogHeader>
        <CSVImport
          isOpen={open}
          onClose={() => setOpen(false)}
          onImport={handleImport}
          fields={{
            date: t.date || "Fecha",
            amount: t.amount || "Importe",
            category: t.category || "Categoría",
            description: t.description || "Descripción",
            notes: t.notes || "Notas",
            tags: t.tags || "Etiquetas",
          }}
          budgetId={budgetId}
          type="expense"
        />
      </DialogContent>
    </Dialog>
  )
}

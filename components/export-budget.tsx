"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Check, Download } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AdvancedExport } from "@/components/advanced-export"
import db from "@/lib/db"

interface ExportBudgetProps {
  budgetId: string
  budgetName: string
}

export function ExportBudget({ budgetId, budgetName }: ExportBudgetProps) {
  const [exportSuccess, setExportSuccess] = useState(false)

  // Función para exportar a CSV (Excel)
  const exportToCSV = () => {
    try {
      // Obtener datos del presupuesto
      const budgetData = db.getBudgetData(budgetId)

      // Crear cabeceras del CSV
      let csvContent = "Categoría,Concepto,Monto\n"

      // Añadir datos de cada categoría
      budgetData.categories.forEach((category) => {
        if (category.items.length === 0) {
          csvContent += `"${category.name}","Sin gastos",0\n`
        } else {
          category.items.forEach((item) => {
            csvContent += `"${category.name}","${item.name}",${item.amount}\n`
          })
        }
      })

      // Añadir resumen
      csvContent += "\nResumen\n"

      const totalSpent = budgetData.categories.reduce((total, category) => {
        return total + category.items.reduce((sum, item) => sum + item.amount, 0)
      }, 0)

      csvContent += `"Presupuesto total",,${budgetData.amount}\n`
      csvContent += `"Total gastado",,${totalSpent}\n`
      csvContent += `"Restante",,${budgetData.amount - totalSpent}\n`

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `Presupuesto_${budgetName.replace(/\s+/g, "_")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Mostrar mensaje de éxito
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2000)
    } catch (error) {
      console.error("Error al exportar a CSV:", error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={exportToCSV}>
        {exportSuccess ? <Check className="h-4 w-4 text-green-500" /> : <FileSpreadsheet className="h-4 w-4" />}
        <span>{exportSuccess ? "¡Exportado!" : "Exportar a Excel"}</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Exportación avanzada</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <AdvancedExport budgetId={budgetId} budgetName={budgetName} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

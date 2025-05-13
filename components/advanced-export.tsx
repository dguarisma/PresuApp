"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileSpreadsheet, FileIcon as FilePdf, FileJson, Download, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import db from "@/lib/db"
import fileStorageService from "@/services/file-storage-service"
import { format } from "date-fns"
import { useTranslations } from "@/hooks/use-translations"
import { useCurrency } from "@/hooks/use-currency"
import type { Category, ExpenseItem } from "@/types/expense"

interface AdvancedExportProps {
  budgetId: string
  budgetName: string
}

export function AdvancedExport({ budgetId, budgetName }: AdvancedExportProps) {
  const { toast } = useToast()
  const t = useTranslations()
  const { currency, formatCurrency } = useCurrency()

  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf" | "json">("csv")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)

  // Columnas disponibles para exportar
  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    amount: true,
    date: true,
    category: true,
    subcategory: true,
    tags: true,
    notes: true,
    recurring: false,
    receipt: false,
  })

  // Opciones de agrupación
  const [groupBy, setGroupBy] = useState<"none" | "category" | "date" | "tag">("none")

  // Opciones de estilo para PDF
  const [pdfOptions, setPdfOptions] = useState({
    orientation: "portrait",
    pageSize: "a4",
    includeHeader: true,
    includeFooter: true,
    includePageNumbers: true,
    colorScheme: "default",
  })

  // Función para exportar datos
  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Obtener datos del presupuesto
      const budgetData = db.getBudgetData(budgetId)

      // Recopilar todos los gastos
      const expenses: any[] = []

      budgetData.categories.forEach((category: Category) => {
        // Gastos de la categoría
        category.items.forEach((item: ExpenseItem) => {
          expenses.push({
            ...item,
            categoryName: category.name,
            subCategoryName: "",
          })
        })

        // Gastos de subcategorías
        category.subCategories.forEach((subCategory) => {
          subCategory.items.forEach((item) => {
            expenses.push({
              ...item,
              categoryName: category.name,
              subCategoryName: subCategory.name,
            })
          })
        })
      })

      // Filtrar columnas según selección
      const filteredExpenses = expenses.map((expense) => {
        const filteredExpense: any = {}

        if (selectedColumns.name) filteredExpense.name = expense.name
        if (selectedColumns.amount) filteredExpense.amount = expense.amount
        if (selectedColumns.date)
          filteredExpense.date = expense.date ? format(new Date(expense.date), "yyyy-MM-dd") : ""
        if (selectedColumns.category) filteredExpense.category = expense.categoryName
        if (selectedColumns.subcategory) filteredExpense.subcategory = expense.subCategoryName
        if (selectedColumns.tags) filteredExpense.tags = expense.tags ? expense.tags.join(", ") : ""
        if (selectedColumns.notes) filteredExpense.notes = expense.notes || ""
        if (selectedColumns.recurring) filteredExpense.recurring = expense.isRecurring ? "Sí" : "No"
        if (selectedColumns.receipt) filteredExpense.receipt = expense.receiptUrl ? "Sí" : "No"

        return filteredExpense
      })

      // Agrupar datos si es necesario
      let processedData = filteredExpenses

      if (groupBy !== "none") {
        const groupedData: Record<string, any[]> = {}

        filteredExpenses.forEach((expense) => {
          let groupKey = ""

          switch (groupBy) {
            case "category":
              groupKey = expense.category || "Sin categoría"
              break
            case "date":
              groupKey = expense.date ? format(new Date(expense.date), "yyyy-MM") : "Sin fecha"
              break
            case "tag":
              if (expense.tags && expense.tags.length > 0) {
                const tags = expense.tags.split(", ")
                tags.forEach((tag: string) => {
                  if (!groupedData[tag]) groupedData[tag] = []
                  groupedData[tag].push(expense)
                })
                return
              } else {
                groupKey = "Sin etiquetas"
              }
              break
          }

          if (!groupedData[groupKey]) groupedData[groupKey] = []
          groupedData[groupKey].push(expense)
        })

        // Convertir grupos a formato plano para exportación
        processedData = []
        Object.entries(groupedData).forEach(([group, items]) => {
          // Añadir encabezado de grupo
          processedData.push({
            name: `== ${group} ==`,
            amount: items.reduce((sum, item) => sum + (Number.parseFloat(item.amount) || 0), 0),
            date: "",
            category: "",
            subcategory: "",
            tags: "",
            notes: `Total: ${items.length} elementos`,
          })

          // Añadir elementos del grupo
          processedData.push(...items)
        })
      }

      // Generar resumen si está seleccionado
      if (includeSummary) {
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const categorySummary: Record<string, number> = {}

        expenses.forEach((expense) => {
          const category = expense.categoryName || "Sin categoría"
          categorySummary[category] = (categorySummary[category] || 0) + expense.amount
        })

        const summaryData = [
          { name: "=== RESUMEN ===", amount: "", date: "", category: "", subcategory: "", tags: "", notes: "" },
          {
            name: "Presupuesto total",
            amount: budgetData.amount,
            date: "",
            category: "",
            subcategory: "",
            tags: "",
            notes: "",
          },
          { name: "Total gastado", amount: totalAmount, date: "", category: "", subcategory: "", tags: "", notes: "" },
          {
            name: "Restante",
            amount: budgetData.amount - totalAmount,
            date: "",
            category: "",
            subcategory: "",
            tags: "",
            notes: "",
          },
          { name: "=== POR CATEGORÍA ===", amount: "", date: "", category: "", subcategory: "", tags: "", notes: "" },
          ...Object.entries(categorySummary).map(([category, amount]) => ({
            name: category,
            amount,
            date: "",
            category: "",
            subcategory: "",
            tags: "",
            notes: `${((amount / totalAmount) * 100).toFixed(1)}%`,
          })),
        ]

        // Añadir resumen al principio
        processedData = [...summaryData, ...processedData]
      }

      // Exportar según el formato seleccionado
      switch (exportFormat) {
        case "csv":
          await exportToCSV(processedData)
          break
        case "excel":
          await exportToExcel(processedData)
          break
        case "pdf":
          await exportToPDF(processedData)
          break
        case "json":
          await exportToJSON(processedData)
          break
      }

      toast({
        title: t.fileManager.exportSuccess,
        description: t.fileManager.exportSuccessDesc,
      })
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        title: t.fileManager.exportError,
        description: t.fileManager.exportErrorDesc,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Exportar a CSV
  const exportToCSV = async (data: any[]) => {
    // Crear cabeceras CSV
    const headers = Object.keys(selectedColumns)
      .filter((key) => selectedColumns[key as keyof typeof selectedColumns])
      .map((key) => {
        switch (key) {
          case "name":
            return t.expenses.name
          case "amount":
            return t.expenses.amount
          case "date":
            return t.expenses.date
          case "category":
            return t.expenses.category
          case "subcategory":
            return t.expenses.subcategory
          case "tags":
            return t.expenses.tags
          case "notes":
            return t.expenses.notes
          case "recurring":
            return t.expenses.recurring
          case "receipt":
            return t.expenses.receipt
          default:
            return key
        }
      })

    // Crear filas de datos
    const rows = data.map((item) => {
      return Object.keys(selectedColumns)
        .filter((key) => selectedColumns[key as keyof typeof selectedColumns])
        .map((key) => {
          const value = item[key]
          return value !== undefined ? value : ""
        })
    })

    // Añadir cabeceras al principio
    const csvData = [headers, ...rows]

    // Exportar a CSV
    await fileStorageService.createCSVFile(csvData, `presupuesto-${budgetName.replace(/\s+/g, "-").toLowerCase()}.csv`)
  }

  // Exportar a Excel (XLSX)
  const exportToExcel = async (data: any[]) => {
    // Simulamos la exportación a Excel
    // En una implementación real, usaríamos una biblioteca como ExcelJS
    toast({
      title: "Exportación a Excel",
      description: "Esta funcionalidad requiere la biblioteca ExcelJS que se implementará en la próxima actualización.",
      variant: "default",
    })

    // Exportamos a CSV como alternativa temporal
    await exportToCSV(data)
  }

  // Exportar a PDF
  const exportToPDF = async (data: any[]) => {
    // Simulamos la exportación a PDF
    // En una implementación real, usaríamos una biblioteca como jsPDF
    toast({
      title: "Exportación a PDF",
      description: "Esta funcionalidad requiere la biblioteca jsPDF que se implementará en la próxima actualización.",
      variant: "default",
    })

    // Exportamos a CSV como alternativa temporal
    await exportToCSV(data)
  }

  // Exportar a JSON
  const exportToJSON = async (data: any[]) => {
    const jsonData = {
      budget: {
        id: budgetId,
        name: budgetName,
        exportDate: new Date().toISOString(),
      },
      summary: includeSummary
        ? {
            totalBudget: db.getBudgetData(budgetId).amount,
            totalSpent: data.reduce((sum, item) => {
              if (item.name === "Total gastado") return sum
              return typeof item.amount === "number" ? sum + item.amount : sum
            }, 0),
          }
        : undefined,
      expenses: data.filter((item) => !item.name.startsWith("===")),
    }

    const jsonString = JSON.stringify(jsonData, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })

    // Usar el servicio de almacenamiento de archivos
    if (fileStorageService.isFileSystemAccessSupported()) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `presupuesto-${budgetName.replace(/\s+/g, "-").toLowerCase()}.json`,
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
      }
    }

    // Método alternativo
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `presupuesto-${budgetName.replace(/\s+/g, "-").toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Función para manejar cambios en las columnas seleccionadas
  const handleColumnChange = (column: keyof typeof selectedColumns, checked: boolean) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [column]: checked,
    }))
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Download className="mr-2 h-5 w-5" />
          {t.fileManager.advancedExport}
        </CardTitle>
        <CardDescription>{t.fileManager.advancedExportDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="format">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format">{t.fileManager.format}</TabsTrigger>
            <TabsTrigger value="columns">{t.fileManager.columns}</TabsTrigger>
            <TabsTrigger value="options">{t.fileManager.options}</TabsTrigger>
          </TabsList>

          {/* Pestaña de formato */}
          <TabsContent value="format" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label>{t.fileManager.selectFormat}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
                  <Button
                    type="button"
                    variant={exportFormat === "csv" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setExportFormat("csv")}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant={exportFormat === "excel" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setExportFormat("excel")}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    type="button"
                    variant={exportFormat === "pdf" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setExportFormat("pdf")}
                  >
                    <FilePdf className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant={exportFormat === "json" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setExportFormat("json")}
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>

              {exportFormat === "pdf" && (
                <div className="space-y-3 pt-2">
                  <Label>{t.fileManager.pdfOptions}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">{t.fileManager.orientation}</Label>
                      <Select
                        value={pdfOptions.orientation}
                        onValueChange={(value) => setPdfOptions({ ...pdfOptions, orientation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.fileManager.selectOrientation} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">{t.fileManager.portrait}</SelectItem>
                          <SelectItem value="landscape">{t.fileManager.landscape}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">{t.fileManager.pageSize}</Label>
                      <Select
                        value={pdfOptions.pageSize}
                        onValueChange={(value) => setPdfOptions({ ...pdfOptions, pageSize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.fileManager.selectPageSize} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-header"
                        checked={pdfOptions.includeHeader}
                        onCheckedChange={(checked) =>
                          setPdfOptions({ ...pdfOptions, includeHeader: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-header">{t.fileManager.includeHeader}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-footer"
                        checked={pdfOptions.includeFooter}
                        onCheckedChange={(checked) =>
                          setPdfOptions({ ...pdfOptions, includeFooter: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-footer">{t.fileManager.includeFooter}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-page-numbers"
                        checked={pdfOptions.includePageNumbers}
                        onCheckedChange={(checked) =>
                          setPdfOptions({ ...pdfOptions, includePageNumbers: checked as boolean })
                        }
                      />
                      <Label htmlFor="include-page-numbers">{t.fileManager.includePageNumbers}</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pestaña de columnas */}
          <TabsContent value="columns" className="space-y-4 pt-4">
            <ScrollArea className="h-[200px] border rounded-md p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-name"
                    checked={selectedColumns.name}
                    onCheckedChange={(checked) => handleColumnChange("name", checked as boolean)}
                  />
                  <Label htmlFor="col-name">{t.expenses.name}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-amount"
                    checked={selectedColumns.amount}
                    onCheckedChange={(checked) => handleColumnChange("amount", checked as boolean)}
                  />
                  <Label htmlFor="col-amount">{t.expenses.amount}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-date"
                    checked={selectedColumns.date}
                    onCheckedChange={(checked) => handleColumnChange("date", checked as boolean)}
                  />
                  <Label htmlFor="col-date">{t.expenses.date}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-category"
                    checked={selectedColumns.category}
                    onCheckedChange={(checked) => handleColumnChange("category", checked as boolean)}
                  />
                  <Label htmlFor="col-category">{t.expenses.category}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-subcategory"
                    checked={selectedColumns.subcategory}
                    onCheckedChange={(checked) => handleColumnChange("subcategory", checked as boolean)}
                  />
                  <Label htmlFor="col-subcategory">{t.expenses.subcategory}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-tags"
                    checked={selectedColumns.tags}
                    onCheckedChange={(checked) => handleColumnChange("tags", checked as boolean)}
                  />
                  <Label htmlFor="col-tags">{t.expenses.tags}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-notes"
                    checked={selectedColumns.notes}
                    onCheckedChange={(checked) => handleColumnChange("notes", checked as boolean)}
                  />
                  <Label htmlFor="col-notes">{t.expenses.notes}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-recurring"
                    checked={selectedColumns.recurring}
                    onCheckedChange={(checked) => handleColumnChange("recurring", checked as boolean)}
                  />
                  <Label htmlFor="col-recurring">{t.expenses.recurring}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="col-receipt"
                    checked={selectedColumns.receipt}
                    onCheckedChange={(checked) => handleColumnChange("receipt", checked as boolean)}
                  />
                  <Label htmlFor="col-receipt">{t.expenses.receipt}</Label>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Pestaña de opciones */}
          <TabsContent value="options" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label>{t.fileManager.groupBy}</Label>
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t.fileManager.selectGrouping} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t.fileManager.noGrouping}</SelectItem>
                    <SelectItem value="category">{t.expenses.category}</SelectItem>
                    <SelectItem value="date">{t.expenses.date}</SelectItem>
                    <SelectItem value="tag">{t.expenses.tags}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                  />
                  <Label htmlFor="include-summary">{t.fileManager.includeSummary}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label htmlFor="include-charts">{t.fileManager.includeCharts}</Label>
                </div>
              </div>

              {includeCharts && (
                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{t.fileManager.chartOptions}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.fileManager.chartOptionsDesc}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <Button onClick={handleExport} disabled={isExporting} className="w-full mt-2">
          <Download className="mr-2 h-4 w-4" />
          {isExporting
            ? t.fileManager.exporting
            : t.fileManager.exportAs.replace("{format}", exportFormat.toUpperCase())}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useRef } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { FileSpreadsheet, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/hooks/use-translations"
import db from "@/lib/db"
import incomeDB from "@/lib/db-income"
import { generateUUID } from "@/lib/uuid"
import { format, parse, isValid } from "date-fns"
import { es, enUS } from "date-fns/locale"

interface CSVImportProps {
  budgetId: string
  onImportComplete?: () => void
  type?: "expense" | "income" // Nuevo prop para determinar el tipo de importación
}

interface CSVRow {
  [key: string]: string
}

interface ColumnMapping {
  name: string | null
  amount: string | null
  date: string | null
  category: string | null
  subcategory: string | null
  tags: string | null
  notes: string | null
  // Campos específicos para ingresos
  source?: string | null
  isRecurring?: string | null
  frequency?: string | null
  interval?: string | null
  endDate?: string | null
}

interface ImportPreview {
  name: string
  amount: number
  date: string
  category: string
  subcategory: string
  tags: string[]
  notes: string
  // Campos específicos para ingresos
  source?: string
  isRecurring?: boolean
  frequency?: string
  interval?: number
  endDate?: string
  valid: boolean
  errors: string[]
}

export function CSVImport({ budgetId, onImportComplete, type = "expense" }: CSVImportProps) {
  const { toast } = useToast()
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fallbacks para traducciones
  const csvT = t.csvImport || {
    title: "Import CSV",
    description: "Import your transactions from a CSV file",
    upload: "Upload",
    mapping: "Mapping",
    preview: "Preview",
    importing: "Importing...",
    selectFile: "Select CSV file",
    fileRequirements: "The file must be in CSV format",
    delimiter: "Delimiter",
    selectDelimiter: "Select delimiter",
    comma: "Comma (,)",
    semicolon: "Semicolon (;)",
    tab: "Tab",
    hasHeaderRow: "File has header row",
    mappingHelp: "Map columns",
    mappingHelpDesc: "Select which columns correspond to each field",
    selectColumn: "Select column",
    notMapped: "Not mapped",
    dateFormat: "Date format",
    selectDateFormat: "Select date format",
    subcategory: "Subcategory",
    previewTitle: "Data preview",
    rowsFound: "{count} rows found",
    moreRows: "... and {count} more rows",
    validationErrors: "Validation errors",
    validationErrorsDesc: "Some rows have errors",
    confirmImport: "Confirm import",
    confirmImportDesc: "Are you sure you want to import {count} transactions?",
    import: "Import",
    cancel: "Cancel",
    noPreview: "No preview available",
    noPreviewDesc: "Complete the previous steps to see a preview",
    importComplete: "Import completed",
    importCompleteDesc: "{success} of {total} transactions imported. {failed} failed.",
    importError: "Import error",
    importErrorDesc: "An error occurred during import",
    errorReading: "Error reading file",
    errorReadingDesc: "Could not read the CSV file",
    invalidAmount: "Invalid amount",
    invalidDate: "Invalid date",
    missingName: "Missing name",
    missingAmount: "Missing amount",
    missingDate: "Missing date",
    defaultCategory: "Imported",
    // Campos específicos para ingresos
    incomeTitle: "Importar ingresos desde CSV",
    incomeDialogDescription: "Sigue los pasos para importar tus ingresos desde un archivo CSV",
    importIncomeButton: "Importar ingresos CSV",
    source: "Fuente",
    isRecurring: "Es recurrente",
    frequency: "Frecuencia",
    interval: "Intervalo",
    endDate: "Fecha de finalización",
    missingSource: "Falta la fuente",
  }

  // Estados para el proceso de importación
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [csvData, setCSVData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: null,
    amount: null,
    date: null,
    category: null,
    subcategory: null,
    tags: null,
    notes: null,
    // Campos específicos para ingresos
    source: null,
    isRecurring: null,
    frequency: null,
    interval: null,
    endDate: null,
  })
  const [dateFormat, setDateFormat] = useState<string>("yyyy-MM-dd")
  const [delimiter, setDelimiter] = useState<string>(",")
  const [hasHeaderRow, setHasHeaderRow] = useState<boolean>(true)
  const [previewData, setPreviewData] = useState<ImportPreview[]>([])
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing">("upload")
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
  })

  // Opciones de formato de fecha
  const dateFormatOptions = [
    { value: "yyyy-MM-dd", label: "YYYY-MM-DD (2023-12-31)" },
    { value: "dd/MM/yyyy", label: "DD/MM/YYYY (31/12/2023)" },
    { value: "MM/dd/yyyy", label: "MM/DD/YYYY (12/31/2023)" },
    { value: "dd.MM.yyyy", label: "DD.MM.YYYY (31.12.2023)" },
    { value: "dd-MM-yyyy", label: "DD-MM-YYYY (31-12-2023)" },
  ]

  // Opciones de delimitador
  const delimiterOptions = [
    { value: ",", label: csvT.comma },
    { value: ";", label: csvT.semicolon },
    { value: "\t", label: csvT.tab },
  ]

  // Función para manejar la selección de archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)

    try {
      const text = await file.text()
      const { data, headers } = parseCSV(text, delimiter, hasHeaderRow)

      setCSVData(data)
      setHeaders(headers)

      // Intentar mapear automáticamente las columnas
      const autoMapping = autoMapColumns(headers)
      setColumnMapping(autoMapping)

      setStep("mapping")
    } catch (error) {
      console.error("Error al leer el archivo CSV:", error)
      toast({
        title: csvT.errorReading,
        description: csvT.errorReadingDesc,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Función para analizar el CSV
  const parseCSV = (text: string, delimiter: string, hasHeader: boolean): { data: CSVRow[]; headers: string[] } => {
    // Dividir por líneas
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "")

    if (lines.length === 0) {
      throw new Error("El archivo CSV está vacío")
    }

    // Obtener encabezados
    let headers: string[]
    let startRow = 0

    if (hasHeader) {
      headers = parseCSVLine(lines[0], delimiter)
      startRow = 1
    } else {
      // Si no hay encabezado, crear encabezados genéricos
      const firstLine = parseCSVLine(lines[0], delimiter)
      headers = firstLine.map((_, index) => `Column ${index + 1}`)
    }

    // Procesar datos
    const data: CSVRow[] = []
    for (let i = startRow; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter)

      // Omitir líneas vacías o con menos valores que encabezados
      if (values.length === 0) continue

      const row: CSVRow = {}
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = j < values.length ? values[j] : ""
      }
      data.push(row)
    }

    return { data, headers }
  }

  // Función para analizar una línea de CSV (maneja comillas y escapes)
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        // Si hay comillas dobles consecutivas dentro de un campo entre comillas, es un escape
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // Saltar la siguiente comilla
        } else {
          // Alternar el estado de inQuotes
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        // Fin del campo
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    // Añadir el último campo
    result.push(current)

    return result
  }

  // Función para mapear automáticamente las columnas
  const autoMapColumns = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {
      name: null,
      amount: null,
      date: null,
      category: null,
      subcategory: null,
      tags: null,
      notes: null,
      // Campos específicos para ingresos
      source: null,
      isRecurring: null,
      frequency: null,
      interval: null,
      endDate: null,
    }

    // Patrones para buscar en los encabezados
    const patterns = {
      name: /nombre|concepto|descripci[oó]n|description|concept|item|detail/i,
      amount: /monto|importe|cantidad|amount|value|sum|price|cost/i,
      date: /fecha|date|day|d[ií]a/i,
      category: /categor[ií]a|category|type|tipo/i,
      subcategory: /subcategor[ií]a|subcategory|subtype|subtipo/i,
      tags: /etiquetas|tags|labels|marcadores/i,
      notes: /notas|notes|comentarios|comments|observaciones|remarks/i,
      // Patrones específicos para ingresos
      source: /fuente|source|origen|from/i,
      isRecurring: /recurrente|recurring|periodic/i,
      frequency: /frecuencia|frequency/i,
      interval: /intervalo|interval/i,
      endDate: /fecha.*fin|end.*date/i,
    }

    // Buscar coincidencias en los encabezados
    for (const header of headers) {
      for (const [field, pattern] of Object.entries(patterns)) {
        if (pattern.test(header) && mapping[field as keyof ColumnMapping] === null) {
          mapping[field as keyof ColumnMapping] = header
          break
        }
      }
    }

    return mapping
  }

  // Función para actualizar el mapeo de columnas
  const handleColumnMappingChange = (field: keyof ColumnMapping, value: string | null) => {
    setColumnMapping((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para cambiar el delimitador
  const handleDelimiterChange = (value: string) => {
    setDelimiter(value)

    // Re-analizar el CSV con el nuevo delimitador
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0]
      file
        .text()
        .then((text) => {
          const { data, headers } = parseCSV(text, value, hasHeaderRow)
          setCSVData(data)
          setHeaders(headers)

          // Reiniciar el mapeo de columnas
          const autoMapping = autoMapColumns(headers)
          setColumnMapping(autoMapping)
        })
        .catch((error) => {
          console.error("Error al re-analizar el CSV:", error)
        })
    }
  }

  // Función para generar la vista previa de los datos
  const generatePreview = () => {
    if (csvData.length === 0) return

    const preview: ImportPreview[] = csvData.map((row) => {
      const item: ImportPreview = {
        name: "",
        amount: 0,
        date: "",
        category: "",
        subcategory: "",
        tags: [],
        notes: "",
        // Campos específicos para ingresos
        source: type === "income" ? "" : undefined,
        isRecurring: type === "income" ? false : undefined,
        frequency: type === "income" ? "monthly" : undefined,
        interval: type === "income" ? 1 : undefined,
        endDate: type === "income" ? undefined : undefined,
        valid: true,
        errors: [],
      }

      // Mapear los campos según la configuración
      if (columnMapping.name && row[columnMapping.name]) {
        item.name = row[columnMapping.name].trim()
      }

      if (columnMapping.amount && row[columnMapping.amount]) {
        // Limpiar el valor y convertirlo a número
        const cleanAmount = row[columnMapping.amount]
          .replace(/[^\d.,-]/g, "") // Eliminar todo excepto dígitos, puntos, comas y signo negativo
          .replace(",", ".") // Convertir comas a puntos para el formato numérico

        const amount = Number.parseFloat(cleanAmount)
        if (!isNaN(amount)) {
          item.amount = amount
        } else {
          item.valid = false
          item.errors.push(csvT.invalidAmount)
        }
      }

      if (columnMapping.date && row[columnMapping.date]) {
        try {
          const dateValue = row[columnMapping.date].trim()
          const parsedDate = parse(dateValue, dateFormat, new Date(), {
            locale: t.currentLanguage === "es" ? es : enUS,
          })

          if (isValid(parsedDate)) {
            item.date = format(parsedDate, "yyyy-MM-dd")
          } else {
            item.valid = false
            item.errors.push(csvT.invalidDate)
          }
        } catch (error) {
          item.valid = false
          item.errors.push(csvT.invalidDate)
        }
      }

      if (columnMapping.category && row[columnMapping.category]) {
        item.category = row[columnMapping.category].trim()
      }

      if (columnMapping.subcategory && row[columnMapping.subcategory]) {
        item.subcategory = row[columnMapping.subcategory].trim()
      }

      if (columnMapping.tags && row[columnMapping.tags]) {
        // Dividir las etiquetas por comas o punto y coma
        const tagString = row[columnMapping.tags].trim()
        if (tagString) {
          item.tags = tagString
            .split(/[,;]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        }
      }

      if (columnMapping.notes && row[columnMapping.notes]) {
        item.notes = row[columnMapping.notes].trim()
      }

      // Campos específicos para ingresos
      if (type === "income") {
        if (columnMapping.source && row[columnMapping.source]) {
          item.source = row[columnMapping.source].trim()
        }

        if (columnMapping.isRecurring && row[columnMapping.isRecurring]) {
          const value = row[columnMapping.isRecurring].trim().toLowerCase()
          item.isRecurring = value === "true" || value === "yes" || value === "1" || value === "si" || value === "sí"
        }

        if (columnMapping.frequency && row[columnMapping.frequency]) {
          const value = row[columnMapping.frequency].trim().toLowerCase()
          if (["daily", "weekly", "monthly", "yearly", "diario", "semanal", "mensual", "anual"].includes(value)) {
            // Mapear valores en español a inglés
            if (value === "diario") item.frequency = "daily"
            else if (value === "semanal") item.frequency = "weekly"
            else if (value === "mensual") item.frequency = "monthly"
            else if (value === "anual") item.frequency = "yearly"
            else item.frequency = value as any
          }
        }

        if (columnMapping.interval && row[columnMapping.interval]) {
          const value = Number.parseInt(row[columnMapping.interval].trim())
          if (!isNaN(value) && value > 0) {
            item.interval = value
          }
        }

        if (columnMapping.endDate && row[columnMapping.endDate]) {
          try {
            const dateValue = row[columnMapping.endDate].trim()
            const parsedDate = parse(dateValue, dateFormat, new Date(), {
              locale: t.currentLanguage === "es" ? es : enUS,
            })

            if (isValid(parsedDate)) {
              item.endDate = format(parsedDate, "yyyy-MM-dd")
            }
          } catch (error) {
            // No es un error crítico, simplemente no se establece la fecha de fin
          }
        }
      }

      // Validar campos obligatorios
      if (!item.name) {
        item.valid = false
        item.errors.push(csvT.missingName)
      }

      if (item.amount === 0) {
        item.valid = false
        item.errors.push(csvT.missingAmount)
      }

      if (!item.date) {
        item.valid = false
        item.errors.push(csvT.missingDate)
      }

      // Validaciones específicas para ingresos
      if (type === "income" && !item.source) {
        item.valid = false
        item.errors.push(csvT.missingSource)
      }

      return item
    })

    setPreviewData(preview)
    setStep("preview")
  }

  // Función para importar los datos
  const importData = async () => {
    setStep("importing")
    setIsLoading(true)

    try {
      const validItems = previewData.filter((item) => item.valid)
      let successCount = 0
      let failedCount = 0

      if (type === "expense") {
        // Importar gastos
        const budgetData = db.getBudgetData(budgetId)

        // Obtener o crear categorías
        const categoryMap = new Map<string, string>() // Nombre de categoría -> ID de categoría
        const subcategoryMap = new Map<string, Map<string, string>>() // ID de categoría -> (Nombre de subcategoría -> ID de subcategoría)

        // Mapear categorías existentes
        budgetData.categories.forEach((category) => {
          categoryMap.set(category.name.toLowerCase(), category.id)

          const subMap = new Map<string, string>()
          category.subCategories.forEach((sub) => {
            subMap.set(sub.name.toLowerCase(), sub.id)
          })
          subcategoryMap.set(category.id, subMap)
        })

        // Procesar cada elemento
        for (const item of validItems) {
          try {
            // Buscar o crear categoría
            let categoryId: string
            if (item.category) {
              const categoryLower = item.category.toLowerCase()
              if (categoryMap.has(categoryLower)) {
                categoryId = categoryMap.get(categoryLower)!
              } else {
                // Crear nueva categoría
                categoryId = generateUUID()
                budgetData.categories.push({
                  id: categoryId,
                  name: item.category,
                  items: [],
                  subCategories: [],
                })
                categoryMap.set(categoryLower, categoryId)
                subcategoryMap.set(categoryId, new Map<string, string>())
              }
            } else {
              // Si no hay categoría, usar la primera disponible o crear una genérica
              if (budgetData.categories.length > 0) {
                categoryId = budgetData.categories[0].id
              } else {
                categoryId = generateUUID()
                budgetData.categories.push({
                  id: categoryId,
                  name: csvT.defaultCategory,
                  items: [],
                  subCategories: [],
                })
                categoryMap.set(csvT.defaultCategory.toLowerCase(), categoryId)
                subcategoryMap.set(categoryId, new Map<string, string>())
              }
            }

            // Buscar o crear subcategoría si es necesario
            let subcategoryId: string | undefined
            if (item.subcategory) {
              const subMap = subcategoryMap.get(categoryId)!
              const subcategoryLower = item.subcategory.toLowerCase()

              if (subMap.has(subcategoryLower)) {
                subcategoryId = subMap.get(subcategoryLower)
              } else {
                // Crear nueva subcategoría
                subcategoryId = generateUUID()
                const category = budgetData.categories.find((c) => c.id === categoryId)!
                category.subCategories.push({
                  id: subcategoryId,
                  name: item.subcategory,
                  items: [],
                })
                subMap.set(subcategoryLower, subcategoryId)
              }
            }

            // Crear el gasto
            const expense = {
              id: generateUUID(),
              name: item.name,
              amount: item.amount,
              date: item.date,
              tags: item.tags,
              notes: item.notes || undefined,
              subCategoryId: subcategoryId,
            }

            // Añadir el gasto a la categoría o subcategoría correspondiente
            if (subcategoryId) {
              const category = budgetData.categories.find((c) => c.id === categoryId)!
              const subcategory = category.subCategories.find((s) => s.id === subcategoryId)!
              subcategory.items.push(expense)
            } else {
              const category = budgetData.categories.find((c) => c.id === categoryId)!
              category.items.push(expense)
            }

            // Registrar etiquetas globales
            if (item.tags && item.tags.length > 0) {
              const existingTags = db.getAllTags()
              const newTags = item.tags.filter((tag) => !existingTags.includes(tag))
              if (newTags.length > 0) {
                db.saveTags([...existingTags, ...newTags])
              }
            }

            successCount++
          } catch (error) {
            console.error("Error al importar elemento:", error, item)
            failedCount++
          }
        }

        // Guardar los cambios
        db.saveBudgetData(budgetId, budgetData)
      } else {
        // Importar ingresos
        const incomeData = incomeDB.getIncomeData(budgetId)

        // Mapear fuentes de ingresos existentes
        const sourceMap = new Map<string, string>() // Nombre de fuente -> ID de fuente
        incomeData.sources.forEach((source) => {
          sourceMap.set(source.name.toLowerCase(), source.id)
        })

        // Procesar cada elemento
        for (const item of validItems) {
          try {
            // Buscar o crear fuente de ingreso
            let sourceId: string
            const sourceName = item.source || csvT.defaultCategory

            const sourceLower = sourceName.toLowerCase()
            if (sourceMap.has(sourceLower)) {
              sourceId = sourceMap.get(sourceLower)!
            } else {
              // Crear nueva fuente
              const newSource = incomeDB.addIncomeSource(budgetId, sourceName)
              sourceId = newSource.id
              sourceMap.set(sourceLower, sourceId)
            }

            // Configurar recurrencia si está habilitada
            let recurringConfig = undefined
            if (item.isRecurring) {
              recurringConfig = {
                frequency: item.frequency || "monthly",
                interval: item.interval || 1,
                endDate: item.endDate,
              }
            }

            // Crear el ingreso
            const income = {
              sourceId,
              sourceName,
              amount: item.amount,
              date: item.date,
              tags: item.tags,
              notes: item.notes || undefined,
              isRecurring: !!item.isRecurring,
              recurringConfig,
            }

            // Añadir el ingreso
            incomeDB.addIncome(budgetId, income)

            successCount++
          } catch (error) {
            console.error("Error al importar ingreso:", error, item)
            failedCount++
          }
        }
      }

      // Actualizar estadísticas
      setImportStats({
        total: validItems.length,
        success: successCount,
        failed: failedCount,
      })

      toast({
        title: csvT.importComplete,
        description: csvT.importCompleteDesc
          .replace("{total}", validItems.length.toString())
          .replace("{success}", successCount.toString())
          .replace("{failed}", failedCount.toString()),
        variant: successCount > 0 ? "default" : "destructive",
      })

      // Notificar que la importación ha finalizado
      if (onImportComplete) {
        onImportComplete()
      }

      // Reiniciar el proceso si todo fue exitoso
      if (failedCount === 0) {
        resetImport()
      }
    } catch (error) {
      console.error("Error durante la importación:", error)
      toast({
        title: csvT.importError,
        description: csvT.importErrorDesc,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para reiniciar el proceso de importación
  const resetImport = () => {
    setFileName("")
    setCSVData([])
    setHeaders([])
    setColumnMapping({
      name: null,
      amount: null,
      date: null,
      category: null,
      subcategory: null,
      tags: null,
      notes: null,
      // Campos específicos para ingresos
      source: null,
      isRecurring: null,
      frequency: null,
      interval: null,
      endDate: null,
    })
    setDateFormat("yyyy-MM-dd")
    setDelimiter(",")
    setHasHeaderRow(true)
    setPreviewData([])
    setStep("upload")
    setImportStats({
      total: 0,
      success: 0,
      failed: 0,
    })
  }

  // Título y descripción según el tipo
  const title = type === "expense" ? csvT.title : csvT.incomeTitle || "Importar ingresos desde CSV"
  const description =
    type === "expense" ? csvT.description : csvT.incomeDialogDescription || "Importa tus ingresos desde un archivo CSV"

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={step} value={step} onValueChange={(value) => setStep(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={step !== "upload"}>
              {csvT.upload}
            </TabsTrigger>
            <TabsTrigger value="mapping" disabled={step !== "mapping"}>
              {csvT.mapping}
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={step !== "preview" && step !== "importing"}>
              {csvT.preview}
            </TabsTrigger>
          </TabsList>

          {/* Paso 1: Subir archivo */}
          <TabsContent value="upload" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="csv-file">{csvT.selectFile}</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  ref={fileInputRef}
                />
                <p className="text-sm text-muted-foreground">{csvT.fileRequirements}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="delimiter">{csvT.delimiter}</Label>
                <Select value={delimiter} onValueChange={handleDelimiterChange} disabled={isLoading}>
                  <SelectTrigger id="delimiter">
                    <SelectValue placeholder={csvT.selectDelimiter} />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-header"
                  checked={hasHeaderRow}
                  onCheckedChange={(checked) => setHasHeaderRow(!!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="has-header" className="cursor-pointer">
                  {csvT.hasHeaderRow}
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Paso 2: Mapeo de columnas */}
          <TabsContent value="mapping" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{csvT.mappingHelp}</span>
                </div>
                <p className="text-xs text-muted-foreground">{csvT.mappingHelpDesc}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Campos comunes */}
                <div className="grid gap-2">
                  <Label htmlFor="name-column">
                    {type === "expense" ? t.expenses?.name || "Nombre" : t.income?.name || "Nombre"} *
                  </Label>
                  <Select
                    value={columnMapping.name || ""}
                    onValueChange={(value) => handleColumnMappingChange("name", value || null)}
                  >
                    <SelectTrigger id="name-column">
                      <SelectValue placeholder={csvT.selectColumn} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount-column">{t.expenses?.amount || "Monto"} *</Label>
                  <Select
                    value={columnMapping.amount || ""}
                    onValueChange={(value) => handleColumnMappingChange("amount", value || null)}
                  >
                    <SelectTrigger id="amount-column">
                      <SelectValue placeholder={csvT.selectColumn} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date-column">{t.expenses?.date || "Fecha"} *</Label>
                  <Select
                    value={columnMapping.date || ""}
                    onValueChange={(value) => handleColumnMappingChange("date", value || null)}
                  >
                    <SelectTrigger id="date-column">
                      <SelectValue placeholder={csvT.selectColumn} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date-format">{csvT.dateFormat}</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder={csvT.selectDateFormat} />
                    </SelectTrigger>
                    <SelectContent>
                      {dateFormatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="col-span-2 my-2" />

                {/* Campos específicos según el tipo */}
                {type === "expense" ? (
                  // Campos para gastos
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="category-column">{t.expenses?.category || "Categoría"}</Label>
                      <Select
                        value={columnMapping.category || ""}
                        onValueChange={(value) => handleColumnMappingChange("category", value || null)}
                      >
                        <SelectTrigger id="category-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subcategory-column">{csvT.subcategory}</Label>
                      <Select
                        value={columnMapping.subcategory || ""}
                        onValueChange={(value) => handleColumnMappingChange("subcategory", value || null)}
                      >
                        <SelectTrigger id="subcategory-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  // Campos para ingresos
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="source-column">{csvT.source} *</Label>
                      <Select
                        value={columnMapping.source || ""}
                        onValueChange={(value) => handleColumnMappingChange("source", value || null)}
                      >
                        <SelectTrigger id="source-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="is-recurring-column">{csvT.isRecurring}</Label>
                      <Select
                        value={columnMapping.isRecurring || ""}
                        onValueChange={(value) => handleColumnMappingChange("isRecurring", value || null)}
                      >
                        <SelectTrigger id="is-recurring-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="frequency-column">{csvT.frequency}</Label>
                      <Select
                        value={columnMapping.frequency || ""}
                        onValueChange={(value) => handleColumnMappingChange("frequency", value || null)}
                      >
                        <SelectTrigger id="frequency-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="interval-column">{csvT.interval}</Label>
                      <Select
                        value={columnMapping.interval || ""}
                        onValueChange={(value) => handleColumnMappingChange("interval", value || null)}
                      >
                        <SelectTrigger id="interval-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="end-date-column">{csvT.endDate}</Label>
                      <Select
                        value={columnMapping.endDate || ""}
                        onValueChange={(value) => handleColumnMappingChange("endDate", value || null)}
                      >
                        <SelectTrigger id="end-date-column">
                          <SelectValue placeholder={csvT.selectColumn} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Separator className="col-span-2 my-2" />

                {/* Campos opcionales comunes */}
                <div className="grid gap-2">
                  <Label htmlFor="tags-column">{t.expenses?.tags || "Etiquetas"}</Label>
                  <Select
                    value={columnMapping.tags || ""}
                    onValueChange={(value) => handleColumnMappingChange("tags", value || null)}
                  >
                    <SelectTrigger id="tags-column">
                      <SelectValue placeholder={csvT.selectColumn} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes-column">{t.expenses?.notes || "Notas"}</Label>
                  <Select
                    value={columnMapping.notes || ""}
                    onValueChange={(value) => handleColumnMappingChange("notes", value || null)}
                  >
                    <SelectTrigger id="notes-column">
                      <SelectValue placeholder={csvT.selectColumn} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_mapped">{csvT.notMapped}</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  onClick={generatePreview}
                  disabled={!columnMapping.name || !columnMapping.amount || !columnMapping.date || isLoading}
                >
                  {csvT.preview}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Paso 3: Vista previa */}
          <TabsContent value="preview" className="space-y-4 pt-4">
            {previewData.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-1">{csvT.previewTitle}</h3>
                  <p className="text-xs text-muted-foreground">
                    {csvT.rowsFound.replace("{count}", previewData.length.toString())}
                  </p>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left">{t.expenses?.name || "Nombre"}</th>
                        <th className="px-4 py-2 text-left">{t.expenses?.amount || "Monto"}</th>
                        <th className="px-4 py-2 text-left">{t.expenses?.date || "Fecha"}</th>
                        {type === "expense" ? (
                          <th className="px-4 py-2 text-left">{t.expenses?.category || "Categoría"}</th>
                        ) : (
                          <th className="px-4 py-2 text-left">{csvT.source}</th>
                        )}
                        <th className="px-4 py-2 text-left">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2">{item.amount.toFixed(2)}</td>
                          <td className="px-4 py-2">{item.date}</td>
                          {type === "expense" ? (
                            <td className="px-4 py-2">{item.category || "-"}</td>
                          ) : (
                            <td className="px-4 py-2">{item.source || "-"}</td>
                          )}
                          <td className="px-4 py-2">
                            {item.valid ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {previewData.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {csvT.moreRows.replace("{count}", (previewData.length - 5).toString())}
                  </p>
                )}

                {/* Errores de validación */}
                {previewData.some((item) => !item.valid) && (
                  <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <h3 className="text-sm font-medium mb-1 text-destructive">{csvT.validationErrors}</h3>
                    <p className="text-xs text-muted-foreground">{csvT.validationErrorsDesc}</p>
                    <ul className="mt-2 text-xs space-y-1">
                      {previewData
                        .filter((item) => !item.valid)
                        .slice(0, 3)
                        .map((item, index) => (
                          <li key={index} className="text-destructive">
                            {item.name}: {item.errors.join(", ")}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/90"
                    onClick={() => setStep("mapping")}
                    disabled={isLoading}
                  >
                    {csvT.cancel}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    onClick={importData}
                    disabled={previewData.filter((item) => item.valid).length === 0 || isLoading}
                  >
                    {isLoading ? csvT.importing : csvT.import}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">{csvT.noPreview}</h3>
                <p className="text-sm text-muted-foreground">{csvT.noPreviewDesc}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

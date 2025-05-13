"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { csvImportTranslations } from "@/lib/translations/csv-import"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingOverlay } from "@/components/loading-overlay"

interface CSVImportProps {
  onImport: (data: any[]) => void
  isOpen?: boolean
  onClose?: () => void
  fields?: { [key: string]: string }
  dateFormat?: string
  budgetId?: string
  type?: string
}

export function CSVImport({
  onImport,
  isOpen = true,
  onClose = () => {},
  fields = {},
  dateFormat = "DD/MM/YYYY",
  budgetId,
  type,
}: CSVImportProps) {
  const { language } = useLanguage()
  const t = csvImportTranslations[language as keyof typeof csvImportTranslations] || csvImportTranslations.es

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [mapping, setMapping] = useState<{ [key: string]: string }>({})
  const [activeTab, setActiveTab] = useState("preview")
  const [skipFirstRow, setSkipFirstRow] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const defaultFields = {
    date: t.date || "Fecha",
    amount: t.amount || "Importe",
    category: t.category || "Categoría",
    description: t.description || "Descripción",
    notes: t.notes || "Notas",
    tags: t.tags || "Etiquetas",
    ...fields,
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile)
      parseCSV(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim() !== "")
      const parsedData = lines.map((line) => {
        // Handle both comma and semicolon delimiters
        const delimiter = line.includes(";") ? ";" : ","
        return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""))
      })

      setPreview(parsedData)

      // Initialize mapping with empty values
      if (parsedData.length > 0) {
        const initialMapping: { [key: string]: string } = {}
        parsedData[0].forEach((header, index) => {
          initialMapping[index.toString()] = ""
        })
        setMapping(initialMapping)
      }

      setActiveTab("preview")
    }
    reader.readAsText(file)
  }

  const handleMappingChange = (columnIndex: string, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [columnIndex]: value,
    }))
  }

  const handleImport = () => {
    if (!file || preview.length === 0) {
      toast({
        title: t.importError || "Error de importación",
        description: t.noFileSelected || "No se ha seleccionado ningún archivo",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      const startRow = skipFirstRow ? 1 : 0
      const importedData = preview.slice(startRow).map((row) => {
        const item: { [key: string]: any } = {}

        // Si tenemos budgetId, lo añadimos a cada elemento
        if (budgetId) {
          item.budgetId = budgetId
        }

        // Si tenemos type, lo añadimos a cada elemento
        if (type) {
          item.type = type
        }

        Object.entries(mapping).forEach(([columnIndex, fieldName]) => {
          if (fieldName && fieldName !== "ignore" && row[Number.parseInt(columnIndex)]) {
            item[fieldName] = row[Number.parseInt(columnIndex)]
          }
        })

        return item
      })

      // Validar que tengamos al menos categoría y monto
      const validData = importedData.filter((item) => {
        if (!item.category) {
          console.warn("Falta categoría en un elemento", item)
          return false
        }
        if (!item.amount) {
          console.warn("Falta monto en un elemento", item)
          return false
        }
        return true
      })

      // Llamamos a la función onImport con los datos procesados
      if (typeof onImport === "function") {
        onImport(validData)
      } else {
        console.error("onImport is not a function", onImport)
        toast({
          title: t.importError || "Error de importación",
          description: "Error interno: el manejador de importación no es válido",
          variant: "destructive",
        })
      }

      // Reset state
      setFile(null)
      setPreview([])
      setMapping({})
      setActiveTab("preview")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: t.importError || "Error de importación",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const headers = Object.values(defaultFields).join(",")
    const csvContent = `${headers}\n`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "import_template.csv")
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="w-full max-h-[70vh] flex flex-col relative">
      {isProcessing && <LoadingOverlay message={t.processingData || "Procesando datos..."} />}

      {!file ? (
        <div
          className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-64"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p className="mb-4 text-center">{t.dragDrop || "Arrastra y suelta un archivo CSV aquí"}</p>
          <p className="mb-4 text-center text-sm text-muted-foreground">{t.or || "o"}</p>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <Button onClick={() => fileInputRef.current?.click()}>{t.browse || "Examinar"}</Button>
          <div className="mt-6">
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              {t.downloadTemplate || "Descargar plantilla"}
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">{t.preview || "Vista previa"}</TabsTrigger>
            <TabsTrigger value="mapping">{t.mapping || "Mapeo"}</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <div className="flex items-center mb-4">
              <Checkbox
                id="skipFirstRow"
                checked={skipFirstRow}
                onCheckedChange={(checked) => setSkipFirstRow(checked as boolean)}
              />
              <Label htmlFor="skipFirstRow" className="ml-2">
                {t.skipFirstRow || "Omitir primera fila (encabezados)"}
              </Label>
            </div>

            <ScrollArea className="h-[40vh] border rounded-md">
              <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 bg-muted">#</th>
                      {preview[0]?.map((_, index) => (
                        <th key={index} className="border px-2 py-1 bg-muted">
                          {index}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 && skipFirstRow ? "bg-muted/50" : ""}>
                        <td className="border px-2 py-1">{rowIndex}</td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="border px-2 py-1 truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="mapping" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[40vh]">
              <div className="space-y-4 p-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {t.selectMapping || "Selecciona el mapeo de columnas"}
                </p>

                {preview[0]?.map((header, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
                    <div className="flex flex-col">
                      <Label className="mb-1">{t.sourceColumn || "Columna de origen"}</Label>
                      <div className="p-2 border rounded-md bg-muted/30">
                        <span className="font-mono">{header}</span>
                        <span className="text-muted-foreground ml-2">
                          ({t.row || "Fila"} 0, {t.column || "Columna"} {index})
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1">{t.targetField || "Campo destino"}</Label>
                      <Select
                        value={mapping[index.toString()] || ""}
                        onValueChange={(value) => handleMappingChange(index.toString(), value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectField || "Seleccionar campo"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ignore">-- {t.ignore || "Ignorar"} --</SelectItem>
                          {Object.entries(defaultFields).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onClose}>
          {t.cancel || "Cancelar"}
        </Button>
        <div className="flex gap-2">
          {file && activeTab === "mapping" && (
            <Button variant="outline" onClick={() => setActiveTab("preview")}>
              {t.back || "Atrás"}
            </Button>
          )}
          {file && activeTab === "preview" && (
            <Button onClick={() => setActiveTab("mapping")}>{t.next || "Siguiente"}</Button>
          )}
          {file && activeTab === "mapping" && <Button onClick={handleImport}>{t.import || "Importar"}</Button>}
        </div>
      </div>
    </div>
  )
}

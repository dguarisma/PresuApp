"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CSVImport } from "./csv-import-responsive"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { csvImportTranslations } from "@/lib/translations/csv-import"

interface IncomeCSVImportProps {
  onImport: (data: any[]) => void
  budgetId?: string
}

export function IncomeCSVImport({ onImport, budgetId }: IncomeCSVImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = csvImportTranslations[language as keyof typeof csvImportTranslations] || csvImportTranslations.es

  const handleImport = (data: any[]) => {
    try {
      // Process the data as needed for income
      const processedData = data.map((item) => ({
        ...item,
        budgetId,
        amount: Number.parseFloat(item.amount) || 0,
        // Add any other necessary transformations
      }))

      onImport(processedData)
      setIsOpen(false)
    } catch (error) {
      console.error("Error processing import data:", error)
      toast({
        title: t.importError,
        description: String(error),
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {t.title}
      </Button>

      <CSVImport
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onImport={handleImport}
        fields={{
          date: t.date,
          amount: t.amount,
          source: "Fuente",
          description: t.description,
          notes: t.notes,
          recurring: "Recurrente",
        }}
      />
    </>
  )
}

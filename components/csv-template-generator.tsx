"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { csvImportTranslations } from "@/lib/translations/csv-import"

interface CSVTemplateGeneratorProps {
  type: "expense" | "income"
}

export function CSVTemplateGenerator({ type }: CSVTemplateGeneratorProps) {
  const { language } = useLanguage()
  const t = csvImportTranslations[language as keyof typeof csvImportTranslations] || csvImportTranslations.es

  const generateTemplate = () => {
    let headers: string[]

    if (type === "expense") {
      headers = [t.date, t.amount, t.category, t.description, t.notes, t.tags]
    } else {
      headers = [t.date, t.amount, "Fuente", t.description, t.notes, "Recurrente"]
    }

    const csvContent = `${headers.join(",")}\n`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${type}_template.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={generateTemplate} size="sm">
      {t.downloadTemplate}
    </Button>
  )
}

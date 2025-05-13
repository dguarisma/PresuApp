"use client"

import FileManagerClient from "@/components/file-manager-client"
import { CSVImport } from "@/components/csv-import"
import { CSVTemplateGenerator } from "@/components/csv-template-generator"
import { useTranslations } from "@/hooks/use-translations"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function FilesPage() {
  const t = useTranslations()
  const { toast } = useToast()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleImportComplete = () => {
    toast({
      title: t.csvImport.importComplete,
      description: t.csvImport.importCompleteDesc
        .replace("{total}", "")
        .replace("{success}", "")
        .replace("{failed}", ""),
    })
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4">{t.fileManager.title}</h1>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t.csvImport.title}</h2>
          <CSVTemplateGenerator />
        </div>
        <CSVImport budgetId="" onImportComplete={handleImportComplete} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{t.fileManager.savedFiles}</h2>
        <FileManagerClient key={refreshKey} />
      </div>
    </div>
  )
}

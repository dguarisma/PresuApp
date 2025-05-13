"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import IncomeManager from "@/components/income-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translations"
import { IncomeCSVImport } from "@/components/income-csv-import"

export default function IncomePage() {
  const params = useParams()
  const router = useRouter()
  const budgetId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return (
    <div className="min-h-full">
      <div className="p-4 flex flex-col min-h-[100vh]">
        <div className="flex justify-center py-2 mb-2">
          <Link href="/">
            <img src="/logo.png" alt="PresuApp Logo" className="h-10" />
          </Link>
        </div>

        <header className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full mr-1"
                onClick={() => router.push(`/budget/${budgetId}`)}
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold ml-2">{t("income.title")}</h1>
            </div>
          </div>

          {/* Añadir el botón de importación CSV */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            <IncomeCSVImport budgetId={budgetId} onImportComplete={() => setIsLoading(false)} />
          </div>
        </header>

        <main>
          <IncomeManager budgetId={budgetId} onIncomeChange={() => setIsLoading(false)} />
        </main>
      </div>
    </div>
  )
}

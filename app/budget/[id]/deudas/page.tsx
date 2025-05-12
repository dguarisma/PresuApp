"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import db from "@/lib/db"
import DebtManager from "@/components/debt-manager"
import { useTranslation } from "@/hooks/use-translations"
import Link from "next/link"

export default function DebtPage() {
  const params = useParams()
  const router = useRouter()
  const budgetId = params.id as string
  const [budgetName, setBudgetName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    // Cargar el nombre del presupuesto
    const currentBudget = db.getBudget(budgetId)
    if (currentBudget) {
      setBudgetName(currentBudget.name)
    }
    setIsLoading(false)
  }, [budgetId])

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
              {isLoading ? (
                <Skeleton className="h-8 w-48 ml-2" />
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <h1 className="text-xl font-bold truncate">
                    {budgetName} - {t("debt.title")}
                  </h1>
                </div>
              )}
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1">
          <DebtManager budgetId={budgetId} />
        </main>
      </div>
    </div>
  )
}

"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SavingsGoalsList } from "@/components/savings-goals-list"
import { useTranslation } from "@/contexts/translation-context"
import Link from "next/link"

export default function BudgetSavingsGoalsPage() {
  const { t } = useTranslation()
  const params = useParams()
  const budgetId = params.id as string

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href={`/budget/${budgetId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t("savingsGoals.budgetGoalsTitle")}</h1>
      </div>

      <SavingsGoalsList budgetId={budgetId} />
    </div>
  )
}

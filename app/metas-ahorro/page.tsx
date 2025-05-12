"use client"

import { SavingsGoalsList } from "@/components/savings-goals-list"
import { useTranslation } from "@/contexts/translation-context"
import { PageHeader } from "@/components/page-header"
import { Target } from "lucide-react"

export default function SavingsGoalsPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-3 py-3 max-w-md">
      <PageHeader title={t("savingsGoals.title")} icon={<Target className="h-6 w-6 text-primary" />} />
      <SavingsGoalsList />
    </div>
  )
}

"use client"

import { SavingsGoalsList } from "@/components/savings-goals-list"
import { useTranslation } from "@/contexts/translation-context"
import { PageHeader } from "@/components/page-header"
import { Target } from "lucide-react"

export default function SavingsGoalsPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col min-h-[100vh] pb-20">
      <PageHeader title={t("savingsGoals.title")} icon={<Target className="h-6 w-6 text-primary" />} />
      <div className="mt-4 flex-1">
        <SavingsGoalsList />
      </div>
    </div>
  )
}

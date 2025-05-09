"use client"

import { SavingsGoalsList } from "@/components/savings-goals-list"
import { useTranslation } from "@/contexts/translation-context"

export default function SavingsGoalsPage() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-3 py-3 max-w-md">
      <SavingsGoalsList />
    </div>
  )
}

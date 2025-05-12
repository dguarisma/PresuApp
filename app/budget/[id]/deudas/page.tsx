"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DebtManagerGlobal from "@/components/debt-manager-global"
import { PageHeader } from "@/components/page-header"
import { CreditCard } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { BudgetDebtSelector } from "@/components/budget-debt-selector"
import db from "@/lib/db"

export default function BudgetDebtsPage() {
  const params = useParams()
  const budgetId = params.id as string
  const { t } = useLanguage()
  const [budget, setBudget] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (budgetId) {
      const budgetData = db.getBudget(budgetId)
      setBudget(budgetData)
    }
  }, [budgetId])

  const handleDebtChange = () => {
    // Actualizar el refreshKey para forzar la recarga del selector de deudas
    setRefreshKey((prev) => prev + 1)
  }

  if (!budget) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="p-4 pb-20">
      <PageHeader
        title={`${budget.name} - ${t("debt.title")}`}
        icon={<CreditCard className="h-6 w-6 text-primary" />}
      />

      {/* Selector de deudas para el presupuesto */}
      <div className="mb-6">
        <BudgetDebtSelector budgetId={budgetId} refreshKey={refreshKey} onDebtSelectionChange={handleDebtChange} />
      </div>

      {/* Gestor de deudas */}
      <DebtManagerGlobal budgetId={budgetId} onDebtChange={handleDebtChange} />
    </div>
  )
}

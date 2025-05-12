"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DollarSign, CreditCard } from "lucide-react"
import { useTranslation } from "@/hooks/use-translations"
import { useCurrency } from "@/hooks/use-currency"
import { getAllDebts } from "@/lib/db-debt"
import db from "@/lib/db"
import type { Debt } from "@/types/debt"

interface BudgetDebtSelectorProps {
  budgetId: string
  refreshKey?: number
  onDebtSelectionChange?: () => void
}

export function BudgetDebtSelector({ budgetId, refreshKey = 0, onDebtSelectionChange }: BudgetDebtSelectorProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()
  const [globalDebts, setGlobalDebts] = useState<Debt[]>([])
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar deudas globales y seleccionadas
  useEffect(() => {
    loadDebts()
  }, [budgetId, refreshKey])

  const loadDebts = async () => {
    try {
      setIsLoading(true)
      // Obtener todas las deudas globales
      const allDebts = getAllDebts()
      setGlobalDebts(allDebts)

      // Obtener las deudas asociadas al presupuesto
      const budget = db.getBudget(budgetId)
      const associatedDebtIds = budget?.associatedDebtIds || []
      setSelectedDebtIds(associatedDebtIds)
    } catch (error) {
      console.error("Error al cargar deudas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDebtSelection = (debtId: string) => {
    setSelectedDebtIds((prev) => {
      if (prev.includes(debtId)) {
        return prev.filter((id) => id !== debtId)
      } else {
        return [...prev, debtId]
      }
    })
  }

  const handleSelectAll = () => {
    if (globalDebts.length === selectedDebtIds.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSelectedDebtIds([])
    } else {
      // Si no todas están seleccionadas, seleccionar todas
      setSelectedDebtIds(globalDebts.map((debt) => debt.id))
    }
  }

  const saveSelection = () => {
    try {
      // Guardar las deudas seleccionadas en el presupuesto
      db.updateBudget(budgetId, {
        associatedDebtIds: selectedDebtIds,
      })

      if (onDebtSelectionChange) {
        onDebtSelectionChange()
      }
    } catch (error) {
      console.error("Error al guardar la selección de deudas:", error)
    }
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  if (isLoading) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-20">
            <div className="animate-pulse text-muted-foreground">{t("common.loading")}...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (globalDebts.length === 0) {
    return null // No mostrar el selector si no hay deudas globales
  }

  return (
    <Card className="border border-border/40 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t("debt.selectForBudget")}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={toggleVisibility}>
            {isVisible ? t("actions.hide") : t("actions.show")}
          </Button>
        </div>

        {isVisible && (
          <>
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {t("debt.availableGlobalDebts")} ({globalDebts.length})
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {globalDebts.length === selectedDebtIds.length ? t("actions.deselectAll") : t("actions.selectAll")}
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {globalDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/10 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`debt-${debt.id}`}
                        checked={selectedDebtIds.includes(debt.id)}
                        onCheckedChange={() => toggleDebtSelection(debt.id)}
                      />
                      <div className="flex items-center gap-2">
                        <div className="bg-muted/30 p-1 rounded-full">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <label htmlFor={`debt-${debt.id}`} className="text-sm font-medium cursor-pointer">
                          {debt.name}
                        </label>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(debt.amount)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={saveSelection}>{t("actions.save")}</Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

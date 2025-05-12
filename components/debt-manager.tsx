"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { DebtForm } from "@/components/debt-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTranslation } from "@/hooks/use-translations"
import debtDB from "@/lib/db-debt"
import db from "@/lib/db"
import type { DebtItem } from "@/types/debt"

interface DebtManagerProps {
  budgetId: string
  onDebtChange?: () => void
  showOnlyAssociated?: boolean
}

export function DebtManager({ budgetId, onDebtChange, showOnlyAssociated = false }: DebtManagerProps) {
  const [debts, setDebts] = useState<DebtItem[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [totalDebt, setTotalDebt] = useState(0)
  const [totalMinimumPayments, setTotalMinimumPayments] = useState(0)
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    loadDebts()
    calculateFinancialMetrics()
  }, [budgetId, activeTab])

  const loadDebts = () => {
    try {
      const debtData = debtDB.getDebtData(budgetId)
      let filteredDebts = [...debtData.items]

      if (showOnlyAssociated) {
        const budget = db.getBudget(budgetId)
        const associatedDebtIds = budget?.associatedDebtIds || []

        // Si estamos en modo "solo asociados", filtramos por las deudas asociadas
        const allDebts = debtDB.getAllDebts ? debtDB.getAllDebts() : []
        filteredDebts = allDebts.filter((debt) => associatedDebtIds.includes(debt.id))
      }

      // Aplicar filtro por tipo si no es "all"
      if (activeTab !== "all") {
        filteredDebts = filteredDebts.filter((debt) => debt.type === activeTab)
      }

      setDebts(filteredDebts)
      setTotalDebt(debtDB.getTotalDebt(budgetId))
      setTotalMinimumPayments(debtDB.getTotalMinimumPayments(budgetId))
    } catch (error) {
      console.error("Error al cargar deudas:", error)
    }
  }

  const calculateFinancialMetrics = () => {
    try {
      // Obtener ingresos mensuales del presupuesto
      const budget = db.getBudget(budgetId)
      let monthlyIncomeTotal = 0

      if (budget && budget.associatedIncomeIds) {
        const incomeDB = require("@/lib/db-income")
        const allIncomes = incomeDB.getAllIncomes ? incomeDB.getAllIncomes() : []

        // Filtrar solo los ingresos asociados a este presupuesto
        const budgetIncomes = allIncomes.filter((income) => budget.associatedIncomeIds.includes(income.id))

        // Sumar todos los ingresos
        monthlyIncomeTotal = budgetIncomes.reduce((sum, income) => sum + income.amount, 0)
      }

      setMonthlyIncome(monthlyIncomeTotal)

      // Calcular ratio deuda/ingreso
      if (monthlyIncomeTotal > 0) {
        const ratio = (totalMinimumPayments / monthlyIncomeTotal) * 100
        setDebtToIncomeRatio(ratio)
      } else {
        setDebtToIncomeRatio(0)
      }
    } catch (error) {
      console.error("Error al calcular métricas financieras:", error)
    }
  }

  const handleSaveDebt = (debtData: Omit<DebtItem, "id">) => {
    try {
      if (editingDebt) {
        // Actualizar deuda existente
        debtDB.updateDebt(budgetId, editingDebt.id, debtData)
      } else {
        // Añadir nueva deuda
        const newDebt = debtDB.addDebt(budgetId, debtData)

        // Si estamos en modo "solo asociados", asociar automáticamente la nueva deuda
        if (showOnlyAssociated) {
          const budget = db.getBudget(budgetId)
          const associatedDebtIds = budget?.associatedDebtIds || []

          if (!associatedDebtIds.includes(newDebt.id)) {
            db.updateBudget(budgetId, {
              associatedDebtIds: [...associatedDebtIds, newDebt.id],
            })
          }
        }
      }

      setIsFormOpen(false)
      setEditingDebt(null)
      loadDebts()
      calculateFinancialMetrics()

      // Notificar al componente padre que hubo un cambio
      if (onDebtChange) {
        onDebtChange()
      }
    } catch (error) {
      console.error("Error al guardar deuda:", error)
    }
  }

  const handleEditDebt = (debt: DebtItem) => {
    setEditingDebt(debt)
    setIsFormOpen(true)
  }

  const handleDeleteDebt = (debtId: string) => {
    try {
      debtDB.deleteDebt(budgetId, debtId)
      loadDebts()
      calculateFinancialMetrics()

      // Notificar al componente padre que hubo un cambio
      if (onDebtChange) {
        onDebtChange()
      }
    } catch (error) {
      console.error("Error al eliminar deuda:", error)
    }
  }

  const getDebtTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      creditCard: t("debt.types.creditCard"),
      loan: t("debt.types.loan"),
      mortgage: t("debt.types.mortgage"),
      personal: t("debt.types.personal"),
      other: t("debt.types.other"),
    }
    return types[type] || type
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("debt.debts")}</h2>
        <Button
          onClick={() => {
            setEditingDebt(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("debt.addDebt")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-primary text-2xl mr-2">$</span>
            {t("debt.debtSummary")}
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("debt.totalDebt")}:</span>
              <span className="text-2xl font-bold">${totalDebt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("debt.monthlyPayments")}:</span>
              <span className="text-2xl font-bold">${totalMinimumPayments.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-primary text-2xl mr-2">%</span>
            {t("debt.debtToIncomeRatio")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{t("debt.debtToIncomeRatioDescription")}</p>

          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  debtToIncomeRatio > 40 ? "bg-red-500" : debtToIncomeRatio > 30 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(debtToIncomeRatio, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0%</span>
              <span className="text-xs text-muted-foreground">50%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("debt.ratio")}</span>
              <span className="font-bold">{debtToIncomeRatio.toFixed(1)}%</span>
            </div>

            {debtToIncomeRatio === 0 && monthlyIncome === 0 && (
              <p className="text-sm text-muted-foreground">{t("debt.insufficientDataForRatio")}</p>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("debt.monthlyPayments")}</span>
              <span>${totalMinimumPayments.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("income.monthlyIncome")}</span>
              <span>${monthlyIncome.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="creditCard">{t("debt.types.creditCard")}</TabsTrigger>
          <TabsTrigger value="loan">{t("debt.types.loan")}</TabsTrigger>
          <TabsTrigger value="mortgage">{t("debt.types.mortgage")}</TabsTrigger>
          <TabsTrigger value="personal">{t("debt.types.personal")}</TabsTrigger>
          <TabsTrigger value="other">{t("debt.types.other")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {debts.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">{t("debt.noDebtsRegistered")}</p>
              <Button
                onClick={() => {
                  setEditingDebt(null)
                  setIsFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("debt.addFirstDebt")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="bg-white dark:bg-gray-950 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{debt.name}</h3>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {getDebtTypeLabel(debt.type)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${debt.amount.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {debt.interestRate > 0 && `${debt.interestRate}% ${t("debt.interest")}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("debt.minimumPayment")}</p>
                      <p className="font-medium">${debt.minimumPayment.toFixed(2)}</p>
                    </div>
                    {debt.dueDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t("debt.dueDate")}</p>
                        <p className="font-medium">{new Date(debt.dueDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {debt.notes && <p className="text-sm mb-4">{debt.notes}</p>}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditDebt(debt)}>
                      {t("actions.edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDebt(debt.id)}>
                      {t("actions.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingDebt ? t("debt.editDebt") : t("debt.addDebt")}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <DebtForm
              initialData={editingDebt || undefined}
              onSave={handleSaveDebt}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DollarSign, Check } from "lucide-react"
import { useTranslation } from "@/hooks/use-translations"
import { useToast } from "@/hooks/use-toast"
import type { IncomeItem } from "@/types/income"
import incomeDB from "@/lib/db-income"

interface BudgetIncomeSelectorProps {
  budgetId: string
  refreshKey?: number
  onUseIncomeChange?: (useIncome: boolean, totalIncome: number) => void
}

export default function BudgetIncomeSelector({ budgetId, refreshKey, onUseIncomeChange }: BudgetIncomeSelectorProps) {
  const [globalIncomes, setGlobalIncomes] = useState<IncomeItem[]>([])
  const [budgetIncomes, setBudgetIncomes] = useState<IncomeItem[]>([])
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([])
  const [showSelector, setShowSelector] = useState(false)
  // Estado eliminado: useIncomeAsBudget
  const [totalIncome, setTotalIncome] = useState(0)
  const { t } = useTranslation()
  const { toast } = useToast()

  // Cargar ingresos globales y del presupuesto
  useEffect(() => {
    loadIncomes()
  }, [budgetId, refreshKey])

  // Calcular el total de ingresos seleccionados
  useEffect(() => {
    const GLOBAL_INCOME_ID = "global_income"
    const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    const budgetIncomeData = incomeDB.getIncomeData(budgetId)

    // Combinar todos los ingresos disponibles
    const allIncomes = [...globalIncomeData.items, ...budgetIncomeData.items]

    // Calcular el total de los ingresos seleccionados
    const total = selectedIncomes.reduce((sum, incomeId) => {
      const income = allIncomes.find((item) => item.id === incomeId)
      return sum + (income?.amount || 0)
    }, 0)

    setTotalIncome(total)

    // Notificar al componente padre sobre el cambio
    if (onUseIncomeChange) {
      onUseIncomeChange(false, total)
    }
  }, [selectedIncomes, budgetId, onUseIncomeChange])

  const loadIncomes = () => {
    const GLOBAL_INCOME_ID = "global_income"
    const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    const budgetIncomeData = incomeDB.getIncomeData(budgetId)

    // Obtener IDs de ingresos ya asociados al presupuesto
    const budgetIncomeIds = new Set(budgetIncomeData.items.map((item) => item.id))

    // Filtrar ingresos globales que no están en el presupuesto
    const availableGlobalIncomes = globalIncomeData.items.filter((income) => !budgetIncomeIds.has(income.id))

    setGlobalIncomes(availableGlobalIncomes)
    setBudgetIncomes(budgetIncomeData.items)

    // Inicializar selección con los ingresos ya asociados
    const budgetIncomeIdsArray = budgetIncomeData.items.map((item) => item.id)
    setSelectedIncomes(budgetIncomeIdsArray)

    // Activar automáticamente la opción si hay ingresos guardados
    // if (budgetIncomeData.items.length > 0) {
    //   setUseIncomeAsBudget(true);
    //   setShowSelector(true);

    //   // Notificar al componente padre sobre el cambio
    //   if (onUseIncomeChange) {
    //     const total = budgetIncomeData.items.reduce((sum, income) => sum + income.amount, 0);
    //     onUseIncomeChange(true, total);
    //   }
    // }
  }

  const handleToggleIncome = (incomeId: string) => {
    setSelectedIncomes((prev) => (prev.includes(incomeId) ? prev.filter((id) => id !== incomeId) : [...prev, incomeId]))
  }

  const handleSelectAll = () => {
    const allIds = globalIncomes.map((income) => income.id)
    setSelectedIncomes((prev) => {
      const currentSet = new Set(prev)
      const allSelected = allIds.every((id) => currentSet.has(id))

      if (allSelected) {
        // Si todos están seleccionados, quitar los globales de la selección
        return prev.filter((id) => !allIds.includes(id))
      } else {
        // Si no todos están seleccionados, añadir todos
        return [...new Set([...prev, ...allIds])]
      }
    })
  }

  const handleSaveSelection = () => {
    const GLOBAL_INCOME_ID = "global_income"
    const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)

    // Obtener todos los ingresos globales
    const allGlobalIncomes = globalIncomeData.items

    // Limpiar ingresos actuales del presupuesto
    incomeDB.removeAllIncomes(budgetId)

    // Añadir los ingresos seleccionados al presupuesto
    selectedIncomes.forEach((incomeId) => {
      const income = allGlobalIncomes.find((item) => item.id === incomeId)
      if (income) {
        incomeDB.addIncomeWithId(budgetId, income)
      }
    })

    // Recargar datos
    loadIncomes()

    toast({
      title: t("income.updated") || "Ingresos actualizados",
      description: t("income.budgetIncomesUpdated") || "Los ingresos del presupuesto han sido actualizados",
      variant: "default",
    })
  }

  // const handleUseIncomeToggle = (checked: boolean) => {
  //   setUseIncomeAsBudget(checked)

  //   // Si se desactiva, desmarcar todos los ingresos
  //   if (!checked) {
  //     setSelectedIncomes([])

  //     // Limpiar ingresos del presupuesto
  //     incomeDB.removeAllIncomes(budgetId)

  //     // Recargar datos
  //     loadIncomes()

  //     toast({
  //       title: t("income.updated") || "Ingresos actualizados",
  //       description: t("budget.incomeDisabled") || "Se ha desactivado el uso de ingresos como presupuesto",
  //       variant: "default",
  //     })
  //   }
  // }

  // Si no hay ingresos globales disponibles y no hay ingresos en el presupuesto, no mostrar el selector
  if (globalIncomes.length === 0 && budgetIncomes.length === 0) {
    return null
  }

  return (
    <Card className="border shadow-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-primary" />
            <span className="text-sm font-medium">
              {t("income.selectForBudget") || "Seleccionar ingresos para este presupuesto"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSelector(!showSelector)}>
            {showSelector ? t("actions.hide") || "Ocultar" : t("actions.show") || "Mostrar"}
          </Button>
        </CardTitle>
      </CardHeader>

      {showSelector && (
        <CardContent>
          <div className="space-y-4">
            {/* <div className="flex items-center space-x-2 pb-3 border-b">
              <Switch id="use-income" checked={useIncomeAsBudget} onCheckedChange={handleUseIncomeToggle} />
              <label htmlFor="use-income" className="text-sm font-medium cursor-pointer">
                {t("budget.useIncome") || "Usar ingresos como presupuesto"}
              </label>
            </div> */}

            {selectedIncomes.length > 0 && (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-sm font-medium">
                  {t("budget.totalIncomeAvailable") || "Ingresos totales disponibles"}:
                  <span className="font-bold ml-2">${totalIncome.toFixed(2)}</span>
                </p>
              </div>
            )}

            {budgetIncomes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  {t("income.currentBudgetIncomes") || "Ingresos actuales del presupuesto"}
                  <Badge className="ml-2" variant="outline">
                    {budgetIncomes.length}
                  </Badge>
                </h3>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {budgetIncomes.map((income) => (
                    <div key={income.id} className="flex items-center space-x-2 p-2 border-b last:border-0">
                      <Checkbox
                        id={`budget-income-${income.id}`}
                        checked={selectedIncomes.includes(income.id)}
                        onCheckedChange={() => handleToggleIncome(income.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`budget-income-${income.id}`}
                          className="text-sm font-medium cursor-pointer flex justify-between"
                        >
                          <div className="truncate">
                            <span>{income.sourceName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(income.date), "dd/MM/yy", { locale: es })}
                            </span>
                          </div>
                          <span className="font-bold">${income.amount.toFixed(2)}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {globalIncomes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    {t("income.availableGlobalIncomes") || "Ingresos globales disponibles"}
                    <Badge className="ml-2" variant="outline">
                      {globalIncomes.length}
                    </Badge>
                  </h3>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={handleSelectAll}>
                    {globalIncomes.every((income) => selectedIncomes.includes(income.id))
                      ? t("actions.deselectAll") || "Deseleccionar todos"
                      : t("actions.selectAll") || "Seleccionar todos"}
                  </Button>
                </div>

                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {globalIncomes.map((income) => (
                    <div key={income.id} className="flex items-center space-x-2 p-2 border-b last:border-0">
                      <Checkbox
                        id={`global-income-${income.id}`}
                        checked={selectedIncomes.includes(income.id)}
                        onCheckedChange={() => handleToggleIncome(income.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`global-income-${income.id}`}
                          className="text-sm font-medium cursor-pointer flex justify-between"
                        >
                          <div className="truncate">
                            <span>{income.sourceName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(income.date), "dd/MM/yy", { locale: es })}
                            </span>
                          </div>
                          <span className="font-bold">${income.amount.toFixed(2)}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveSelection}>{t("actions.save") || "Guardar selección"}</Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

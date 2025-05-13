"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, RefreshCw } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import incomeDB from "@/lib/db-income"
import { useCurrency } from "@/hooks/use-currency"

interface BudgetFormProps {
  budget: number
  budgetId: string
  onBudgetChange: (budget: number) => void
}

export default function BudgetForm({ budget, budgetId, onBudgetChange }: BudgetFormProps) {
  const { t } = useTranslation()
  const [inputBudget, setInputBudget] = useState(budget.toString())
  const [isEditing, setIsEditing] = useState(budget === 0)
  const [useIncome, setUseIncome] = useState(false)
  const [useIncomeAsBudget, setUseIncomeAsBudget] = useState(false)
  const [totalIncome, setTotalIncome] = useState(0)
  const { formatCurrency } = useCurrency()

  // Cargar ingresos totales
  useEffect(() => {
    const income = incomeDB.getTotalIncome(budgetId)
    setTotalIncome(income)
  }, [budgetId])

  useEffect(() => {
    setInputBudget(budget.toString())
  }, [budget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newBudget = Number.parseFloat(inputBudget)
    if (!isNaN(newBudget) && newBudget >= 0) {
      onBudgetChange(newBudget)
      setIsEditing(false)
    }
  }

  const handleUseIncome = () => {
    setUseIncome(!useIncome)
    if (!useIncome) {
      // Si activamos "usar ingresos", establecemos el presupuesto igual a los ingresos
      setInputBudget(totalIncome.toString())
      onBudgetChange(totalIncome)
    }
  }

  const refreshIncome = () => {
    const income = incomeDB.getTotalIncome(budgetId)
    setTotalIncome(income)
    if (useIncome) {
      setInputBudget(income.toString())
      onBudgetChange(income)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement handleInputChange function
  }

  const [formData, setFormData] = useState({ budget: budget })

  const handleUseIncomeChange = (useIncome: boolean, total: number) => {
    setUseIncomeAsBudget(useIncome)
    setTotalIncome(total)

    if (useIncome) {
      // Si se activa, usar el total de ingresos como presupuesto
      setFormData((prev) => ({
        ...prev,
        budget: total,
      }))
    }
  }

  const BudgetIncomeSelector = ({
    budgetId,
    onUseIncomeChange,
  }: { budgetId: string; onUseIncomeChange: (useIncome: boolean, total: number) => void }) => {
    return <div>{/* Implement BudgetIncomeSelector component */}</div>
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <DollarSign className="h-5 w-5 mr-1 text-primary" />
          {t("budget.budget")}
        </CardTitle>
        <CardDescription>{t("budget.setBudgetAmount")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-base text-muted-foreground">$</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputBudget}
                  onChange={(e) => setInputBudget(e.target.value)}
                  placeholder={t("budget.enterBudget")}
                  className="pl-8 text-base py-2"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Switch id="use-income" checked={useIncome} onCheckedChange={handleUseIncome} />
              <Label htmlFor="use-income" className="cursor-pointer">
                {t("budget.useIncome")}
              </Label>
              {useIncome && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8"
                  onClick={refreshIncome}
                  title={t("budget.refreshIncome")}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {useIncome && (
              <div className="text-sm text-muted-foreground">
                {t("budget.totalIncomeAvailable")}: ${totalIncome.toFixed(2)}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {t("actions.save")}
              </Button>
              {budget > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setInputBudget(budget.toString())
                    setIsEditing(false)
                  }}
                >
                  {t("actions.cancel")}
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("budget.amount")}:</span>
              <span className="text-2xl font-bold">{formatCurrency(budget)}</span>
            </div>
            {useIncome && (
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{t("budget.basedOnIncome")}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={refreshIncome}
                  title={t("budget.refreshIncome")}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
              {t("budget.editBudget")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

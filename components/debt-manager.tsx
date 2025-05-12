"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Trash2, Edit, CreditCard, Calendar, DollarSign, Percent } from "lucide-react"
import type { DebtItem } from "@/types/debt"
import debtDB from "@/lib/db-debt"
import incomeDB from "@/lib/db-income"
import { DebtForm } from "@/components/debt-form"
import { useTranslation } from "@/hooks/use-translations"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface DebtManagerProps {
  budgetId: string
}

export default function DebtManager({ budgetId }: DebtManagerProps) {
  const [debtItems, setDebtItems] = useState<DebtItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [totalDebt, setTotalDebt] = useState(0)
  const [totalMinimumPayments, setTotalMinimumPayments] = useState(0)
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState(0)
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const { t } = useTranslation()

  // Cargar datos de deudas e ingresos
  useEffect(() => {
    loadDebtData()
    calculateMonthlyIncome()
  }, [budgetId])

  // Calcular ratio de endeudamiento cuando cambian los datos
  useEffect(() => {
    if (monthlyIncome > 0) {
      setDebtToIncomeRatio((totalMinimumPayments / monthlyIncome) * 100)
    } else {
      setDebtToIncomeRatio(0)
    }
  }, [totalMinimumPayments, monthlyIncome])

  const loadDebtData = () => {
    const debtData = debtDB.getDebtData(budgetId)
    setDebtItems(debtData.items)
    setTotalDebt(debtDB.getTotalDebt(budgetId))
    setTotalMinimumPayments(debtDB.getTotalMinimumPayments(budgetId))
  }

  const calculateMonthlyIncome = () => {
    // Obtener todos los ingresos
    const incomeData = incomeDB.getIncomeData(budgetId)

    // Calcular ingresos mensuales (simplificado)
    // En una implementación real, se debería considerar la frecuencia de cada ingreso
    const totalIncome = incomeData.items.reduce((total, item) => {
      if (item.isRecurring && item.recurringConfig) {
        // Convertir a mensual según la frecuencia
        switch (item.recurringConfig.frequency) {
          case "daily":
            return total + (item.amount * 30) / item.recurringConfig.interval
          case "weekly":
            return total + (item.amount * 4) / item.recurringConfig.interval
          case "monthly":
            return total + item.amount / item.recurringConfig.interval
          case "yearly":
            return total + item.amount / (12 * item.recurringConfig.interval)
          default:
            return total + item.amount
        }
      } else {
        // Para ingresos no recurrentes, asumimos que son mensuales
        return total + item.amount
      }
    }, 0)

    setMonthlyIncome(totalIncome)
  }

  const handleAddDebt = (debt: Omit<DebtItem, "id">) => {
    debtDB.addDebt(budgetId, debt)
    loadDebtData()
    setIsAddDialogOpen(false)
  }

  const handleUpdateDebt = (debt: Omit<DebtItem, "id">) => {
    if (editingDebt) {
      debtDB.updateDebt(budgetId, editingDebt.id, debt)
      loadDebtData()
      setEditingDebt(null)
    }
  }

  const handleDeleteDebt = (debtId: string) => {
    debtDB.deleteDebt(budgetId, debtId)
    loadDebtData()
  }

  // Filtrar deudas por pestaña activa
  const filteredDebts = activeTab === "all" ? debtItems : debtItems.filter((item) => item.type === activeTab)

  // Ordenar deudas por monto (mayor a menor)
  const sortedDebts = [...filteredDebts].sort((a, b) => b.amount - a.amount)

  // Determinar el color del ratio de endeudamiento
  const getDebtRatioColor = () => {
    if (debtToIncomeRatio >= 50) return "bg-red-500"
    if (debtToIncomeRatio >= 30) return "bg-amber-500"
    if (debtToIncomeRatio > 0) return "bg-emerald-500"
    return "bg-gray-300"
  }

  // Determinar el mensaje del ratio de endeudamiento
  const getDebtRatioMessage = () => {
    if (debtToIncomeRatio >= 50) return t("debt.ratioHigh")
    if (debtToIncomeRatio >= 30) return t("debt.ratioMedium")
    if (debtToIncomeRatio > 0) return t("debt.ratioLow")
    return t("debt.ratioNone")
  }

  // Obtener el ícono según el tipo de deuda
  const getDebtTypeIcon = (type: DebtItem["type"]) => {
    switch (type) {
      case "credit_card":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case "loan":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "mortgage":
        return <DollarSign className="h-5 w-5 text-purple-500" />
      case "personal":
        return <DollarSign className="h-5 w-5 text-orange-500" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("debt.title")}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("debt.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("debt.addNew")}</DialogTitle>
            </DialogHeader>
            <DebtForm budgetId={budgetId} onSubmit={handleAddDebt} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-5 w-5 mr-1 text-primary" />
              {t("debt.summary")}
            </CardTitle>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">{t("debt.total")}:</span>
              <span className="text-2xl font-bold">${totalDebt.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">{t("debt.monthlyPayments")}:</span>
              <span className="text-lg font-medium">${totalMinimumPayments.toFixed(2)}</span>
            </div>
          </CardHeader>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Percent className="h-5 w-5 mr-1 text-primary" />
              {t("debt.debtToIncomeRatio")}
            </CardTitle>
            <CardDescription>{t("debt.debtToIncomeDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("debt.ratio")}</span>
                <span className="font-medium">{debtToIncomeRatio.toFixed(1)}%</span>
              </div>
              <Progress value={debtToIncomeRatio} max={100} className={`h-2 ${getDebtRatioColor()}`} />
              <p className="text-xs text-muted-foreground">{getDebtRatioMessage()}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{t("debt.monthlyPayments")}</span>
                <span>${totalMinimumPayments.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>{t("income.monthlyIncome")}</span>
                <span>${monthlyIncome.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 overflow-auto">
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="credit_card">{t("debt.types.creditCard")}</TabsTrigger>
          <TabsTrigger value="loan">{t("debt.types.loan")}</TabsTrigger>
          <TabsTrigger value="mortgage">{t("debt.types.mortgage")}</TabsTrigger>
          <TabsTrigger value="personal">{t("debt.types.personal")}</TabsTrigger>
          <TabsTrigger value="other">{t("debt.types.other")}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {sortedDebts.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
              <p className="text-muted-foreground">
                {activeTab === "all"
                  ? t("debt.noDebt")
                  : t("debt.noDebtOfType", { type: t(`debt.types.${activeTab}`) })}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("debt.addFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDebts.map((debt) => (
                <Card key={debt.id} className="overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/20">
                    <div className="flex items-center">
                      <div className="mr-4">{getDebtTypeIcon(debt.type)}</div>
                      <div>
                        <h3 className="font-medium">{debt.name}</h3>
                        <p className="text-sm text-muted-foreground">{t(`debt.types.${debt.type}`)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">${debt.amount.toFixed(2)}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDebt(debt)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("actions.edit")}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{t("debt.edit")}</DialogTitle>
                          </DialogHeader>
                          {editingDebt && (
                            <DebtForm
                              budgetId={budgetId}
                              onSubmit={handleUpdateDebt}
                              onCancel={() => setEditingDebt(null)}
                              initialData={editingDebt}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t("actions.delete")}</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("debt.confirmDelete")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("debt.deleteWarning")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDebt(debt.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {t("actions.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("debt.interestRate")}</p>
                        <p className="font-medium">{debt.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("debt.minimumPayment")}</p>
                        <p className="font-medium">${debt.minimumPayment.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {debt.startDate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("debt.startDate")}: {format(new Date(debt.startDate), "PP", { locale: es })}
                        </Badge>
                      )}
                      {debt.endDate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("debt.endDate")}: {format(new Date(debt.endDate), "PP", { locale: es })}
                        </Badge>
                      )}
                      {debt.isRecurring && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {t("debt.recurring")}
                        </Badge>
                      )}
                      {debt.paymentDate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("debt.paymentDate")}: {format(new Date(debt.paymentDate), "PP", { locale: es })}
                        </Badge>
                      )}
                    </div>

                    {debt.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">{t("common.notes")}:</h4>
                        <p className="text-sm text-muted-foreground">{debt.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

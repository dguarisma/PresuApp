"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DebtFormGlobal } from "@/components/debt-form-global"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import {
  Plus,
  CreditCard,
  AlertTriangle,
  Home,
  DollarSign,
  User,
  MoreHorizontal,
  PiggyBank,
  TrendingDown,
  ArrowUpRight,
  Calculator,
} from "lucide-react"
import { getAllDebts, deleteDebt } from "@/lib/db-debt"
import { getAllIncomes } from "@/lib/db-income"
import type { Debt } from "@/types/debt"
import type { Income } from "@/types/income"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { JSX } from "react"
import Link from "next/link"
import db from "@/lib/db"

interface DebtManagerGlobalProps {
  budgetId?: string
  onDebtChange?: () => void
}

export function DebtManagerGlobal({ budgetId, onDebtChange }: DebtManagerGlobalProps) {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [debts, setDebts] = useState<Debt[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(true)

  useEffect(() => {
    loadDebts()
    loadIncomes()
  }, [budgetId])

  const loadDebts = async () => {
    try {
      let allDebts = await getAllDebts()

      // Si hay un budgetId, filtrar solo las deudas asociadas a ese presupuesto
      if (budgetId) {
        const budget = db.getBudget(budgetId)
        const associatedDebtIds = budget?.associatedDebtIds || []

        if (associatedDebtIds.length > 0) {
          allDebts = allDebts.filter((debt) => associatedDebtIds.includes(debt.id))
        }
      }

      setDebts(allDebts)
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("debt.loadError"),
        variant: "destructive",
      })
    }
  }

  const loadIncomes = async () => {
    try {
      if (budgetId) {
        // Si hay un budgetId, cargar solo los ingresos asociados a ese presupuesto
        const budget = db.getBudget(budgetId)
        const associatedIncomeIds = budget?.associatedIncomeIds || []

        if (associatedIncomeIds.length > 0) {
          const allIncomes = await getAllIncomes()
          const filteredIncomes = allIncomes.filter((income) => associatedIncomeIds.includes(income.id))
          setIncomes(filteredIncomes)
        } else {
          setIncomes([])
        }
      } else {
        // Si no hay budgetId, cargar todos los ingresos
        const allIncomes = await getAllIncomes()
        setIncomes(allIncomes)
      }
    } catch (error) {
      console.error("Error loading incomes:", error)
    }
  }

  const handleSaveDebt = () => {
    setShowForm(false)
    setEditingDebt(null)
    loadDebts()
    toast({
      title: editingDebt ? t("debt.updated") : t("debt.added"),
      description: editingDebt ? t("debt.updateSuccess") : t("debt.addSuccess"),
    })

    if (onDebtChange) {
      onDebtChange()
    }
  }

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt)
    setShowForm(true)
  }

  const confirmDeleteDebt = (id: string) => {
    setDebtToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return

    try {
      await deleteDebt(budgetId || "global", debtToDelete)

      // Si estamos en un presupuesto específico, también eliminar la asociación
      if (budgetId) {
        const budget = db.getBudget(budgetId)
        if (budget && budget.associatedDebtIds) {
          const updatedAssociatedDebtIds = budget.associatedDebtIds.filter((id) => id !== debtToDelete)
          db.updateBudget(budgetId, { associatedDebtIds: updatedAssociatedDebtIds })
        }
      }

      loadDebts()
      toast({
        title: t("debt.deleted"),
        description: t("debt.deleteSuccess"),
      })

      if (onDebtChange) {
        onDebtChange()
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("debt.deleteError"),
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDebtToDelete(null)
    }
  }

  const getTotalDebtAmount = () => {
    return debts.reduce((total, debt) => total + debt.amount, 0)
  }

  const getTotalMonthlyPayment = () => {
    return debts.reduce((total, debt) => total + (debt.minimumPayment || 0), 0)
  }

  const getTotalMonthlyIncome = () => {
    return incomes.filter((income) => income.isRecurring).reduce((total, income) => total + income.amount, 0)
  }

  const getDebtToIncomeRatio = () => {
    const monthlyPayments = getTotalMonthlyPayment()
    const monthlyIncome = getTotalMonthlyIncome()
    if (monthlyIncome === 0) return 0
    return (monthlyPayments / monthlyIncome) * 100
  }

  const getDebtRatioStatus = () => {
    const ratio = getDebtToIncomeRatio()
    if (ratio > 40) return "danger"
    if (ratio > 30) return "warning"
    if (ratio > 20) return "caution"
    return "healthy"
  }

  const getDebtRatioMessage = () => {
    const ratio = getDebtToIncomeRatio()
    if (ratio === 0) return t("debt.ratioNone")

    const status = getDebtRatioStatus()
    switch (status) {
      case "danger":
        return t("debt.ratioHigh")
      case "warning":
        return t("debt.ratioHigh")
      case "caution":
        return t("debt.ratioMedium")
      case "healthy":
        return t("debt.ratioLow")
      default:
        return t("debt.ratioNone")
    }
  }

  const getDebtsByType = (type: string) => {
    if (type === "all") return debts
    return debts.filter((debt) => debt.type === type)
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-red-500"
      case "warning":
        return "bg-orange-500"
      case "caution":
        return "bg-yellow-500"
      case "healthy":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const getDebtTypeIcon = (type: string) => {
    switch (type) {
      case "creditCard":
        return <CreditCard className="h-5 w-5 text-blue-500" />
      case "loan":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "mortgage":
        return <Home className="h-5 w-5 text-purple-500" />
      case "personal":
        return <User className="h-5 w-5 text-orange-500" />
      default:
        return <MoreHorizontal className="h-5 w-5 text-gray-500" />
    }
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
  }

  return (
    <div className="space-y-4">
      {showForm ? (
        <DebtFormGlobal
          onSave={handleSaveDebt}
          onCancel={() => {
            setShowForm(false)
            setEditingDebt(null)
          }}
          editingDebt={editingDebt}
          budgetId={budgetId}
        />
      ) : (
        <>
          {/* Botón flotante para añadir deuda */}
          <Button
            onClick={() => setShowForm(true)}
            className="fixed bottom-20 right-4 z-10 rounded-full w-14 h-14 shadow-lg bg-teal-500 hover:bg-teal-600 text-white"
            aria-label={t("debt.addNew")}
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Herramientas de deuda */}
          <Link href="/deudas/herramientas">
            <Button
              variant="outline"
              className="fixed bottom-36 right-4 z-10 rounded-full w-14 h-14 shadow-lg border-teal-500 text-teal-500"
              aria-label={t("debt.tools")}
            >
              <Calculator className="h-6 w-6" />
            </Button>
          </Link>

          {/* Resumen financiero */}
          <Card className="shadow-sm border border-border/40 overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4 cursor-pointer" onClick={toggleSummary}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <PiggyBank className="h-5 w-5 mr-2 text-teal-500" />
                  Resumen financiero
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {showSummary ? <TrendingDown className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>

            {showSummary && (
              <CardContent className="px-4 pb-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{t("debt.totalDebt")}</div>
                    <div className="text-xl font-bold">{formatCurrency(getTotalDebtAmount())}</div>
                    <div className="text-xs text-muted-foreground mt-2">{t("debt.monthlyPayments")}</div>
                    <div className="text-base font-medium">{formatCurrency(getTotalMonthlyPayment())}</div>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">{t("debt.debtToIncomeRatio")}</div>
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold">{getDebtToIncomeRatio().toFixed(1)}%</span>
                      {getDebtToIncomeRatio() > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            getDebtRatioStatus() === "danger"
                              ? "bg-red-100 text-red-800"
                              : getDebtRatioStatus() === "warning"
                                ? "bg-orange-100 text-orange-800"
                                : getDebtRatioStatus() === "caution"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getDebtRatioStatus() === "danger"
                            ? "Alto"
                            : getDebtRatioStatus() === "warning"
                              ? "Precaución"
                              : getDebtRatioStatus() === "caution"
                                ? "Moderado"
                                : "Saludable"}
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <Progress
                        value={getDebtToIncomeRatio()}
                        max={50}
                        className={`h-2 ${getProgressColor(getDebtRatioStatus())}`}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>{t("income.monthlyIncome")}</span>
                      <span>{formatCurrency(getTotalMonthlyIncome())}</span>
                    </div>
                  </div>
                </div>

                {getDebtToIncomeRatio() > 20 && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-amber-800">{getDebtRatioMessage()}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Pestañas de tipos de deuda */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <div className="bg-white sticky top-0 z-10 pb-2">
              <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 bg-muted/30 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
                >
                  <span className="h-3.5 w-3.5 flex items-center justify-center">•</span>
                  <span>{t("common.all")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="creditCard"
                  className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{t("debt.types.credit_card")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="loan"
                  className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{t("debt.types.loan")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="mortgage"
                  className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>{t("debt.types.mortgage")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{t("debt.types.personal")}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-2">
              {debts.length === 0 ? (
                <EmptyDebtState onAddClick={() => setShowForm(true)} />
              ) : (
                <DebtList
                  debts={getDebtsByType(activeTab)}
                  onEdit={handleEditDebt}
                  onDelete={confirmDeleteDebt}
                  formatCurrency={formatCurrency}
                  t={t}
                  getDebtTypeIcon={getDebtTypeIcon}
                />
              )}
            </TabsContent>

            {["creditCard", "loan", "mortgage", "personal", "other"].map((type) => (
              <TabsContent key={type} value={type} className="mt-2">
                {getDebtsByType(type).length === 0 ? (
                  <EmptyDebtState
                    onAddClick={() => setShowForm(true)}
                    message={`No hay deudas de tipo ${
                      type === "creditCard"
                        ? "tarjeta de crédito"
                        : type === "loan"
                          ? "préstamo"
                          : type === "mortgage"
                            ? "hipoteca"
                            : type === "personal"
                              ? "personal"
                              : "otro"
                    }`}
                  />
                ) : (
                  <DebtList
                    debts={getDebtsByType(type)}
                    onEdit={handleEditDebt}
                    onDelete={confirmDeleteDebt}
                    formatCurrency={formatCurrency}
                    t={t}
                    getDebtTypeIcon={getDebtTypeIcon}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Diálogo de confirmación para eliminar */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("debt.confirmDelete")}</AlertDialogTitle>
                <AlertDialogDescription>{t("debt.deleteWarning")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDebt} className="bg-red-500 hover:bg-red-600 text-white">
                  {t("actions.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

// Componente para estado vacío
function EmptyDebtState({ onAddClick, message = "debt.noDebt" }: { onAddClick: () => void; message?: string }) {
  const { t } = useLanguage()

  return (
    <div className="text-center py-8 px-4 border border-dashed rounded-xl bg-muted/10">
      <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm mb-4">{t(message)}</p>
      <Button onClick={onAddClick} variant="outline" className="mx-auto flex items-center border-dashed">
        <Plus className="h-4 w-4 mr-1" />
        <span>{t("debt.addFirst")}</span>
      </Button>
    </div>
  )
}

// Componente para lista de deudas
function DebtList({
  debts,
  onEdit,
  onDelete,
  formatCurrency,
  t,
  getDebtTypeIcon,
}: {
  debts: Debt[]
  onEdit: (debt: Debt) => void
  onDelete: (id: string) => void
  formatCurrency: (amount: number) => string
  t: (key: string, options?: any) => string
  getDebtTypeIcon: (type: string) => JSX.Element
}) {
  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <Card key={debt.id} className="overflow-hidden border border-border/40">
          <div className="p-3">
            <div className="flex items-start gap-3">
              <div className="bg-muted/30 p-2 rounded-full">{getDebtTypeIcon(debt.type)}</div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm">{debt.name}</h3>
                    <p className="text-xs text-muted-foreground">{t(`debt.types.${debt.type}`)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">{formatCurrency(debt.amount)}</p>
                    {debt.interestRate > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {debt.interestRate}% {t("debt.interest")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">{t("debt.minimumPayment")}: </span>
                      <span className="font-medium">{formatCurrency(debt.minimumPayment || 0)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(debt)}
                        className="h-7 text-xs px-2 rounded-md"
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(debt.id)}
                        className="h-7 text-xs px-2 rounded-md bg-red-500 hover:bg-red-600"
                      >
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default DebtManagerGlobal

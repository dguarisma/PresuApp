"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Trash2, Edit, DollarSign, RefreshCw } from "lucide-react"
import type { IncomeItem, IncomeSource } from "@/types/income"
import incomeDB from "@/lib/db-income"
import { IncomeForm } from "@/components/income-form"
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
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface IncomeManagerProps {
  budgetId: string
  onIncomeChange?: () => void
}

export default function IncomeManager({ budgetId, onIncomeChange }: IncomeManagerProps) {
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [totalIncome, setTotalIncome] = useState(0)
  const { t } = useTranslation()

  // Estados para ingresos globales
  const [globalIncomes, setGlobalIncomes] = useState<IncomeItem[]>([])
  const [showGlobalIncomes, setShowGlobalIncomes] = useState(false)
  const [selectedGlobalIncomes, setSelectedGlobalIncomes] = useState<string[]>([])
  const [isGlobalIncome, setIsGlobalIncome] = useState(false)

  // Cargar datos de ingresos
  useEffect(() => {
    loadIncomeData()

    // Cargar ingresos globales
    const GLOBAL_INCOME_ID = "global_income"
    const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)

    // Filtrar ingresos globales que no estén ya en este presupuesto
    // (comparando por sourceId, amount y date para identificar duplicados)
    const budgetIncomeData = incomeDB.getIncomeData(budgetId)
    const filteredGlobalIncomes = globalIncomeData.items.filter((globalIncome) => {
      return !budgetIncomeData.items.some(
        (budgetIncome) =>
          budgetIncome.sourceId === globalIncome.sourceId &&
          budgetIncome.amount === globalIncome.amount &&
          budgetIncome.date === globalIncome.date,
      )
    })

    setGlobalIncomes(filteredGlobalIncomes)
  }, [budgetId])

  const loadIncomeData = () => {
    const incomeData = incomeDB.getIncomeData(budgetId)
    setIncomeItems(incomeData.items)
    setIncomeSources(incomeData.sources)
    setTotalIncome(incomeDB.getTotalIncome(budgetId))
  }

  const handleAddIncome = (income: Omit<IncomeItem, "id">) => {
    // Si es un ingreso global, añadirlo también a los ingresos globales
    if (isGlobalIncome) {
      const GLOBAL_INCOME_ID = "global_income"
      incomeDB.addIncome(GLOBAL_INCOME_ID, income)
    }

    // Añadir al presupuesto actual
    incomeDB.addIncome(budgetId, income)
    loadIncomeData()
    setIsAddDialogOpen(false)

    // Notificar al componente padre sobre el cambio
    if (onIncomeChange) {
      onIncomeChange()
    }

    // Recargar ingresos globales
    const GLOBAL_INCOME_ID = "global_income"
    const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    setGlobalIncomes(globalIncomeData.items)
  }

  const handleUpdateIncome = (income: Omit<IncomeItem, "id">) => {
    if (editingIncome) {
      incomeDB.updateIncome(budgetId, editingIncome.id, income)
      loadIncomeData()
      setEditingIncome(null)

      // Notificar al componente padre sobre el cambio
      if (onIncomeChange) {
        onIncomeChange()
      }
    }
  }

  const handleDeleteIncome = (incomeId: string) => {
    incomeDB.deleteIncome(budgetId, incomeId)
    loadIncomeData()
    toast({
      title: t("income.deleted") || "Income deleted",
      description: t("income.deleteSourceSuccess") || "Income source has been deleted successfully",
      variant: "default",
    })

    // Notificar al componente padre sobre el cambio
    if (onIncomeChange) {
      onIncomeChange()
    }
  }

  const handleDeleteSource = (sourceId: string) => {
    incomeDB.deleteIncomeSource(budgetId, sourceId)
    loadIncomeData()
  }

  // Función para importar ingresos globales seleccionados
  const handleImportGlobalIncomes = () => {
    if (selectedGlobalIncomes.length > 0) {
      const GLOBAL_INCOME_ID = "global_income"
      const globalIncomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)

      selectedGlobalIncomes.forEach((incomeId) => {
        const income = globalIncomeData.items.find((item) => item.id === incomeId)
        if (income) {
          // Añadir el ingreso al presupuesto actual
          incomeDB.addIncome(budgetId, {
            sourceId: income.sourceId,
            sourceName: income.sourceName,
            amount: income.amount,
            date: income.date,
            isRecurring: income.isRecurring,
            recurringConfig: income.recurringConfig,
            notes: income.notes,
            tags: income.tags,
          })
        }
      })

      // Recargar datos
      loadIncomeData()
      setSelectedGlobalIncomes([])
      setShowGlobalIncomes(false)

      toast({
        title: t("income.imported") || "Ingresos importados",
        description: t("income.importSuccess") || "Los ingresos seleccionados han sido importados correctamente",
        variant: "default",
      })

      // Notificar al componente padre sobre el cambio
      if (onIncomeChange) {
        onIncomeChange()
      }
    }
  }

  // Función para manejar la selección de ingresos globales
  const handleToggleGlobalIncome = (incomeId: string) => {
    setSelectedGlobalIncomes((prev) =>
      prev.includes(incomeId) ? prev.filter((id) => id !== incomeId) : [...prev, incomeId],
    )
  }

  // Filtrar ingresos por pestaña activa
  const filteredIncomes =
    activeTab === "all"
      ? incomeItems
      : activeTab === "recurring"
        ? incomeItems.filter((item) => item.isRecurring)
        : incomeItems.filter((item) => item.sourceId === activeTab)

  // Ordenar ingresos por fecha (más recientes primero)
  const sortedIncomes = [...filteredIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("income.title")}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("income.addNew")}
        </Button>
      </div>

      {isAddDialogOpen && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("income.addNew")}</DialogTitle>
            </DialogHeader>
            <div className="mb-4 pb-4 border-b">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="global-income"
                  checked={isGlobalIncome}
                  onCheckedChange={() => setIsGlobalIncome(!isGlobalIncome)}
                />
                <label htmlFor="global-income" className="text-sm cursor-pointer">
                  {t("income.registerAsGlobal") || "Registrar como ingreso global"}
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {t("income.globalIncomeDescription") ||
                  "Los ingresos globales estarán disponibles para todos los presupuestos"}
              </p>
            </div>
            <IncomeForm budgetId={budgetId} onSubmit={handleAddIncome} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl">
            <DollarSign className="h-5 w-5 mr-1 text-primary" />
            {t("income.summary")}
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-muted-foreground">{t("income.total")}:</span>
            <span className="text-2xl font-bold">${totalIncome.toFixed(2)}</span>
          </div>
        </CardHeader>
      </Card>

      {globalIncomes.length > 0 && (
        <div className="mt-4">
          <div
            className="flex items-center justify-between cursor-pointer p-2 border rounded-md"
            onClick={() => setShowGlobalIncomes(!showGlobalIncomes)}
          >
            <h3 className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-primary" />
              {t("income.availableGlobalIncomes") || "Ingresos globales disponibles"}
              <Badge className="ml-2" variant="outline">
                {globalIncomes.length}
              </Badge>
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {showGlobalIncomes ? "-" : "+"}
            </Button>
          </div>

          {showGlobalIncomes && (
            <Card className="mt-2 border border-border/50">
              <CardContent className="p-4">
                {globalIncomes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {t("income.noGlobalIncomesAvailable") || "No hay ingresos globales disponibles"}
                  </p>
                ) : (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t("income.selectToImport") || "Selecciona los ingresos a importar"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          if (selectedGlobalIncomes.length === globalIncomes.length) {
                            setSelectedGlobalIncomes([])
                          } else {
                            setSelectedGlobalIncomes(globalIncomes.map((income) => income.id))
                          }
                        }}
                      >
                        {selectedGlobalIncomes.length === globalIncomes.length
                          ? t("actions.deselectAll") || "Deseleccionar todos"
                          : t("actions.selectAll") || "Seleccionar todos"}
                      </Button>
                    </div>

                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      {globalIncomes.map((income) => (
                        <div key={income.id} className="flex items-center space-x-2 p-2 border-b last:border-0">
                          <Checkbox
                            id={`global-income-${income.id}`}
                            checked={selectedGlobalIncomes.includes(income.id)}
                            onCheckedChange={() => handleToggleGlobalIncome(income.id)}
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

                    {selectedGlobalIncomes.length > 0 && (
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm">
                          <span>{t("income.selectedIncomes") || "Seleccionados"}: </span>
                          <span className="font-bold">{selectedGlobalIncomes.length}</span>
                        </div>
                        <Button onClick={handleImportGlobalIncomes} size="sm">
                          {t("income.importSelected") || "Importar seleccionados"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 overflow-auto">
          <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="recurring">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            {t("common.recurring")}
          </TabsTrigger>
          {incomeSources.map((source) => (
            <TabsTrigger key={source.id} value={source.id}>
              {source.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {sortedIncomes.length === 0 ? (
            <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
              <p className="text-muted-foreground">
                {activeTab === "all"
                  ? t("income.noIncome")
                  : activeTab === "recurring"
                    ? t("income.noRecurringIncome")
                    : t("income.noIncomeInSource")}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("income.addFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedIncomes.map((income) => (
                <Card key={income.id} className="overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-muted/20">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{income.sourceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(income.date), "PPP", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">${income.amount.toFixed(2)}</span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingIncome(income)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("actions.edit")}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{t("income.edit")}</DialogTitle>
                          </DialogHeader>
                          {editingIncome && (
                            <IncomeForm
                              budgetId={budgetId}
                              onSubmit={handleUpdateIncome}
                              onCancel={() => setEditingIncome(null)}
                              initialData={editingIncome}
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
                            <AlertDialogTitle>{t("income.confirmDelete")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("income.deleteWarning")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteIncome(income.id)}
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
                    {income.isRecurring && (
                      <div className="mb-3 p-2 bg-muted/30 rounded-md text-sm">
                        <RefreshCw className="h-3.5 w-3.5 inline mr-1" />
                        <span>
                          {income.recurringConfig?.frequency === "daily" &&
                            `${t("frequency.every")} ${income.recurringConfig.interval} ${t("period.days")}`}
                          {income.recurringConfig?.frequency === "weekly" &&
                            `${t("frequency.every")} ${income.recurringConfig.interval} ${t("period.weeks")}`}
                          {income.recurringConfig?.frequency === "monthly" &&
                            `${t("frequency.every")} ${income.recurringConfig.interval} ${t("period.months")}`}
                          {income.recurringConfig?.frequency === "yearly" &&
                            `${t("frequency.every")} ${income.recurringConfig.interval} ${t("period.years")}`}
                          {income.recurringConfig?.endDate &&
                            ` ${t("common.until")} ${format(new Date(income.recurringConfig.endDate), "PPP", { locale: es })}`}
                        </span>
                      </div>
                    )}
                    {income.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">{t("common.notes")}:</h4>
                        <p className="text-sm text-muted-foreground">{income.notes}</p>
                      </div>
                    )}
                    {income.tags && income.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {income.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-muted rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {activeTab !== "all" && activeTab !== "recurring" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("income.deleteSource")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("income.confirmDeleteSource")}</AlertDialogTitle>
              <AlertDialogDescription>{t("income.deleteSourceWarning")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteSource(activeTab)}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t("actions.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

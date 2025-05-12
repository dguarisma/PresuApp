"use client"

import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, RefreshCw, DollarSign, TrendingUp, ArrowUpRight, TrendingDown } from "lucide-react"
import type { IncomeItem, IncomeSource } from "@/types/income"
import incomeDB from "@/lib/db-income"
import { IncomeFormGlobal } from "@/components/income-form-global"
import { useTranslation } from "@/hooks/use-translations"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
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

// Constante para el ID global de ingresos
export const GLOBAL_INCOME_ID = "global_income"

interface IncomeManagerProps {
  onIncomeChange?: () => void
}

export function IncomeManager(props: IncomeManagerProps) {
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteSourceDialogOpen, setIsDeleteSourceDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null)
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null)
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [totalIncome, setTotalIncome] = useState(0)
  const [showSummary, setShowSummary] = useState(true)
  const { t } = useTranslation()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()

  // Cargar datos de ingresos
  useEffect(() => {
    loadIncomeData()
  }, [])

  const loadIncomeData = () => {
    const incomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    setIncomeItems(incomeData.items)
    setIncomeSources(incomeData.sources)
    setTotalIncome(incomeDB.getTotalIncome(GLOBAL_INCOME_ID))
  }

  const handleAddIncome = (income: Omit<IncomeItem, "id">) => {
    try {
      incomeDB.addIncome(GLOBAL_INCOME_ID, income)
      loadIncomeData()
      setIsAddDialogOpen(false)
      toast({
        title: t("income.addedSuccessfully") || "Ingreso añadido",
        description: t("income.incomeAdded") || "El ingreso ha sido añadido correctamente",
      })
      if (props.onIncomeChange) {
        props.onIncomeChange()
      }
    } catch (error) {
      console.error("Error al añadir ingreso:", error)
      toast({
        title: t("common.error") || "Error",
        description: t("income.addError") || "No se pudo añadir el ingreso",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (income: IncomeItem) => {
    setEditingIncome(income)
    setIsEditDialogOpen(true)
  }

  const handleUpdateIncome = (income: Omit<IncomeItem, "id">) => {
    try {
      if (editingIncome) {
        incomeDB.updateIncome(GLOBAL_INCOME_ID, editingIncome.id, income)
        loadIncomeData()
        setEditingIncome(null)
        setIsEditDialogOpen(false)
        toast({
          title: t("income.updatedSuccessfully") || "Ingreso actualizado",
          description: t("income.incomeUpdated") || "El ingreso ha sido actualizado correctamente",
        })
        if (props.onIncomeChange) {
          props.onIncomeChange()
        }
      }
    } catch (error) {
      console.error("Error al actualizar ingreso:", error)
      toast({
        title: t("common.error") || "Error",
        description: t("income.updateError") || "No se pudo actualizar el ingreso",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (incomeId: string) => {
    setDeletingIncomeId(incomeId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteIncome = () => {
    try {
      if (deletingIncomeId) {
        incomeDB.deleteIncome(GLOBAL_INCOME_ID, deletingIncomeId)
        loadIncomeData()
        setDeletingIncomeId(null)
        setIsDeleteDialogOpen(false)
        toast({
          title: t("income.deleted") || "Income deleted",
          description: t("income.deleteSourceSuccess") || "Income source has been deleted successfully",
          variant: "default",
        })
        if (props.onIncomeChange) {
          props.onIncomeChange()
        }
      }
    } catch (error) {
      console.error("Error al eliminar ingreso:", error)
      toast({
        title: t("common.error") || "Error",
        description: t("income.deleteError") || "No se pudo eliminar el ingreso",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSourceClick = (sourceId: string) => {
    setDeletingSourceId(sourceId)
    setIsDeleteSourceDialogOpen(true)
  }

  const handleDeleteSource = () => {
    try {
      if (deletingSourceId) {
        incomeDB.deleteIncomeSource(GLOBAL_INCOME_ID, deletingSourceId)
        loadIncomeData()
        setActiveTab("all") // Volver a la pestaña "Todos" después de eliminar
        setDeletingSourceId(null)
        setIsDeleteSourceDialogOpen(false)
        toast({
          title: t("income.sourceDeletedSuccessfully") || "Fuente eliminada",
          description: t("income.sourceDeleted") || "La fuente de ingresos ha sido eliminada correctamente",
        })
      }
    } catch (error) {
      console.error("Error al eliminar fuente:", error)
      toast({
        title: t("common.error") || "Error",
        description: t("income.deleteSourceError") || "No se pudo eliminar la fuente de ingresos",
        variant: "destructive",
      })
    }
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
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

  // Verificar si la fuente actual existe
  const currentSourceExists =
    activeTab !== "all" && activeTab !== "recurring" && incomeSources.some((source) => source.id === activeTab)

  // Calcular ingresos recurrentes mensuales
  const getMonthlyRecurringIncome = () => {
    return incomeItems
      .filter((item) => item.isRecurring)
      .reduce((total, income) => {
        // Simplificado para mostrar solo el total
        return total + income.amount
      }, 0)
  }

  return (
    <div className="space-y-4">
      {/* Botón flotante para añadir ingreso */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-20 right-4 z-10 rounded-full w-14 h-14 shadow-lg bg-teal-500 hover:bg-teal-600 text-white"
        aria-label={t("income.addNew") || "Añadir ingreso"}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Resumen financiero */}
      <Card className="shadow-sm border border-border/40 overflow-hidden">
        <CardHeader className="pb-2 px-4 pt-4 cursor-pointer" onClick={toggleSummary}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-teal-500" />
              {t("income.summary") || "Resumen de ingresos"}
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
                <div className="text-xs text-muted-foreground mb-1">{t("income.total") || "Total de ingresos"}</div>
                <div className="text-xl font-bold">{formatCurrency(totalIncome)}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {t("income.monthlyIncome") || "Ingresos mensuales"}
                </div>
                <div className="text-base font-medium">{formatCurrency(getMonthlyRecurringIncome())}</div>
              </div>

              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{t("income.sources") || "Fuentes de ingreso"}</div>
                <div className="text-xl font-bold">{incomeSources.length}</div>
                <div className="mt-2">
                  <Progress value={incomeSources.length * 10} max={100} className="h-2 bg-teal-500" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{t("income.activeIncome") || "Ingresos activos"}</span>
                  <span>{incomeItems.length}</span>
                </div>
              </div>
            </div>

            {incomeItems.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  {t("income.summaryTip") ||
                    "Consejo: Diversificar tus fuentes de ingresos puede ayudarte a tener mayor estabilidad financiera."}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Pestañas de tipos de ingreso */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <div className="bg-white sticky top-0 z-10 pb-2">
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 bg-muted/30 rounded-xl">
            <TabsTrigger
              value="all"
              className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
            >
              <span className="h-3.5 w-3.5 flex items-center justify-center">•</span>
              <span>{t("common.all") || "Todos"}</span>
            </TabsTrigger>
            <TabsTrigger
              value="recurring"
              className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t("common.recurring") || "Recurrentes"}</span>
            </TabsTrigger>
            {incomeSources.map((source) => (
              <TabsTrigger
                key={source.id}
                value={source.id}
                className="flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg data-[state=active]:bg-background"
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>{source.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-2">
          {!currentSourceExists && activeTab !== "all" && activeTab !== "recurring" ? (
            // Si la fuente seleccionada ya no existe, mostrar mensaje y redirigir
            <div className="text-center p-6 border rounded-lg bg-muted/30 border-dashed">
              <p className="text-sm text-muted-foreground">
                {t("income.sourceNotExist") || "Esta fuente de ingresos ya no existe."}
              </p>
              <Button variant="outline" className="mt-4 text-sm h-9" onClick={() => setActiveTab("all")}>
                {t("income.backToAll") || "Volver a todos los ingresos"}
              </Button>
            </div>
          ) : sortedIncomes.length === 0 ? (
            <EmptyIncomeState
              onAddClick={() => setIsAddDialogOpen(true)}
              message={
                activeTab === "all"
                  ? t("income.noIncome") || "No hay ingresos registrados"
                  : activeTab === "recurring"
                    ? t("income.noRecurringIncome") || "No hay ingresos recurrentes"
                    : t("income.noIncomeInSource") || "No hay ingresos en esta fuente"
              }
            />
          ) : (
            <div className="space-y-3">
              {sortedIncomes.map((income) => (
                <Card key={income.id} className="overflow-hidden border border-border/40">
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted/30 p-2 rounded-full">
                        <DollarSign className="h-5 w-5 text-teal-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{income.sourceName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(income.date), "PPP", { locale: es })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-base">{formatCurrency(income.amount)}</p>
                          </div>
                        </div>

                        {income.isRecurring && (
                          <div className="mt-2 p-1.5 bg-muted/30 rounded-md text-xs inline-flex items-center">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            <span>
                              {income.recurringConfig?.frequency === "daily" &&
                                `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.days") || "día(s)"}`}
                              {income.recurringConfig?.frequency === "weekly" &&
                                `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.weeks") || "semana(s)"}`}
                              {income.recurringConfig?.frequency === "monthly" &&
                                `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.months") || "mes(es)"}`}
                              {income.recurringConfig?.frequency === "yearly" &&
                                `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.years") || "año(s)"}`}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-border/30">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-1.5">
                              {income.tags &&
                                income.tags.length > 0 &&
                                income.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="px-1.5 py-0.5 bg-muted rounded-md text-xs">
                                    {tag}
                                  </span>
                                ))}
                              {income.tags && income.tags.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-muted rounded-md text-xs">
                                  +{income.tags.length - 2}
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(income)}
                                className="h-7 text-xs px-2 rounded-md"
                              >
                                {t("common.edit") || "Editar"}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(income.id)}
                                className="h-7 text-xs px-2 rounded-md bg-red-500 hover:bg-red-600"
                              >
                                {t("common.delete") || "Eliminar"}
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
          )}
        </TabsContent>
      </Tabs>

      {activeTab !== "all" && activeTab !== "recurring" && currentSourceExists && (
        <Button
          variant="destructive"
          className="w-full h-10 bg-red-500 hover:bg-red-600 text-white text-sm"
          onClick={() => handleDeleteSourceClick(activeTab)}
        >
          {t("income.deleteSource") || "Eliminar esta fuente"}
        </Button>
      )}

      {/* Diálogo de añadir/editar ingreso */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-[500px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{t("income.addNew") || "Añadir ingreso"}</DialogTitle>
          </DialogHeader>
          <IncomeFormGlobal onSubmit={handleAddIncome} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[92vw] sm:max-w-[500px] p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{t("income.edit") || "Editar ingreso"}</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <IncomeFormGlobal
              onSubmit={handleUpdateIncome}
              onCancel={() => {
                setEditingIncome(null)
                setIsEditDialogOpen(false)
              }}
              initialData={editingIncome}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar ingreso */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[92vw] sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {t("income.confirmDelete") || "¿Eliminar este ingreso?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t("income.deleteWarning") ||
                "Esta acción no se puede deshacer. El ingreso será eliminado permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-sm"
              onClick={() => {
                setDeletingIncomeId(null)
                setIsDeleteDialogOpen(false)
              }}
            >
              {t("actions.cancel") || "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIncome} className="bg-red-500 hover:bg-red-600 text-white text-sm">
              {t("actions.delete") || "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminar fuente */}
      <AlertDialog open={isDeleteSourceDialogOpen} onOpenChange={setIsDeleteSourceDialogOpen}>
        <AlertDialogContent className="max-w-[92vw] sm:max-w-[500px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {t("income.confirmDeleteSource") || "¿Eliminar esta fuente de ingresos?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {t("income.deleteSourceWarning") ||
                "Esta acción eliminará la fuente y todos los ingresos asociados. No se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-sm"
              onClick={() => {
                setDeletingSourceId(null)
                setIsDeleteSourceDialogOpen(false)
              }}
            >
              {t("actions.cancel") || "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSource} className="bg-red-500 hover:bg-red-600 text-white text-sm">
              {t("actions.delete") || "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Componente para estado vacío
function EmptyIncomeState({ onAddClick, message = "income.noIncome" }: { onAddClick: () => void; message?: string }) {
  const { t } = useTranslation()

  return (
    <div className="text-center py-8 px-4 border border-dashed rounded-xl bg-muted/10">
      <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <DollarSign className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm mb-4">{message}</p>
      <Button onClick={onAddClick} variant="outline" className="mx-auto flex items-center border-dashed">
        <Plus className="h-4 w-4 mr-1" />
        <span>{t("income.addFirst") || "Añadir primer ingreso"}</span>
      </Button>
    </div>
  )
}

export default IncomeManager

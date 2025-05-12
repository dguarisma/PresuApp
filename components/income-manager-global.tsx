"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, RefreshCw } from "lucide-react"
import type { IncomeItem, IncomeSource } from "@/types/income"
import incomeDB from "@/lib/db-income"
import { IncomeFormGlobal } from "@/components/income-form-global"
import { useTranslation } from "@/hooks/use-translations"
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

// Constante para el ID global de ingresos
export const GLOBAL_INCOME_ID = "global_income"

export function IncomeManager() {
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
  const { t } = useTranslation()
  const { toast } = useToast()

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
        title: "Ingreso añadido",
        description: "El ingreso ha sido añadido correctamente",
      })
    } catch (error) {
      console.error("Error al añadir ingreso:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el ingreso",
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
          title: "Ingreso actualizado",
          description: "El ingreso ha sido actualizado correctamente",
        })
      }
    } catch (error) {
      console.error("Error al actualizar ingreso:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingreso",
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
          title: "Ingreso eliminado",
          description: "El ingreso ha sido eliminado correctamente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar ingreso:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso",
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
          title: "Fuente eliminada",
          description: "La fuente de ingresos ha sido eliminada correctamente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar fuente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la fuente de ingresos",
        variant: "destructive",
      })
    }
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("income.manageIncome") || "Administrar Ingresos"}</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white h-10 px-4 py-2 text-sm rounded-md flex items-center"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("income.addNew") || "Añadir ingreso"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[92vw] sm:max-w-[500px] p-4">
            <DialogHeader>
              <DialogTitle className="text-lg">{t("income.addNew") || "Añadir ingreso"}</DialogTitle>
            </DialogHeader>
            <IncomeFormGlobal onSubmit={handleAddIncome} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("income.total") || "Total de ingresos"}:</span>
            <span className="text-xl font-bold">${totalIncome.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-3 overflow-auto w-full h-10 p-1">
          <TabsTrigger value="all" className="text-sm">
            {t("common.all") || "Todos"}
          </TabsTrigger>
          <TabsTrigger value="recurring" className="text-sm">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            {t("common.recurring") || "Recurrentes"}
          </TabsTrigger>
          {incomeSources.map((source) => (
            <TabsTrigger key={source.id} value={source.id} className="text-sm">
              {source.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {!currentSourceExists && activeTab !== "all" && activeTab !== "recurring" ? (
            // Si la fuente seleccionada ya no existe, mostrar mensaje y redirigir
            <div className="text-center p-6 border rounded-lg bg-muted/30 border-dashed">
              <p className="text-sm text-muted-foreground">Esta fuente de ingresos ya no existe.</p>
              <Button variant="outline" className="mt-4 text-sm h-9" onClick={() => setActiveTab("all")}>
                Volver a todos los ingresos
              </Button>
            </div>
          ) : sortedIncomes.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-muted/30 border-dashed">
              <p className="text-sm text-muted-foreground">
                {activeTab === "all"
                  ? t("income.noIncome") || "No hay ingresos registrados"
                  : activeTab === "recurring"
                    ? t("income.noRecurringIncome") || "No hay ingresos recurrentes"
                    : t("income.noIncomeInSource") || "No hay ingresos en esta fuente"}
              </p>
              <Button variant="outline" className="mt-4 text-sm h-9" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t("income.addFirst") || "Añadir primer ingreso"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedIncomes.map((income) => (
                <Card key={income.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-base">{income.sourceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(income.date), "PPP", { locale: es })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${income.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {income.isRecurring && (
                      <div className="mb-3 p-2 bg-muted/30 rounded-md text-xs">
                        <RefreshCw className="h-3 w-3 inline mr-1" />
                        <span>
                          {income.recurringConfig?.frequency === "daily" &&
                            `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.days") || "día(s)"}`}
                          {income.recurringConfig?.frequency === "weekly" &&
                            `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.weeks") || "semana(s)"}`}
                          {income.recurringConfig?.frequency === "monthly" &&
                            `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.months") || "mes(es)"}`}
                          {income.recurringConfig?.frequency === "yearly" &&
                            `${t("frequency.every") || "Cada"} ${income.recurringConfig.interval} ${t("period.years") || "año(s)"}`}
                          {income.recurringConfig?.endDate &&
                            ` ${t("common.until") || "hasta"} ${format(new Date(income.recurringConfig.endDate), "PPP", { locale: es })}`}
                        </span>
                      </div>
                    )}

                    {income.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">{t("common.notes") || "Notas"}:</h4>
                        <p className="text-sm text-muted-foreground">{income.notes}</p>
                      </div>
                    )}

                    {income.tags && income.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {income.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 bg-muted rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        className="h-9 px-4 py-2 text-sm bg-white"
                        onClick={() => handleEditClick(income)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        className="h-9 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => handleDeleteClick(income.id)}
                      >
                        Eliminar
                      </Button>
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

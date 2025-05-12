"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Calendar, BarChart, Share2, AlertTriangle, FolderOpen } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
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
import { Input } from "@/components/ui/input"
import db from "@/lib/db"
import { useTranslation } from "@/contexts/translation-context"

interface Budget {
  id: string
  name: string
  createdAt: string
}

export default function BudgetList() {
  const router = useRouter()
  const { t, language } = useTranslation()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBudgetName, setNewBudgetName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isGlobalLoading, setIsGlobalLoading] = useState(false)

  // Cargar presupuestos
  const loadBudgets = () => {
    try {
      // Obtener directamente del localStorage para evitar cualquier problema con la capa db
      if (typeof window !== "undefined") {
        const budgetsJson = localStorage.getItem("budgets")
        const storedBudgets = budgetsJson ? JSON.parse(budgetsJson) : []
        console.log("Presupuestos cargados:", storedBudgets)
        setBudgets(storedBudgets)
      }
    } catch (error) {
      console.error("Error al cargar presupuestos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBudgets()

    // Agregar un listener para recargar cuando se vuelva a esta página
    const handleFocus = () => {
      loadBudgets()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus)

      return () => {
        window.removeEventListener("focus", handleFocus)
      }
    }
  }, [])

  // Función para crear un nuevo presupuesto
  const handleCreateBudget = () => {
    if (newBudgetName.trim()) {
      setIsCreating(true)
      setIsGlobalLoading(true) // Usar nuestro propio estado en lugar de depender del contexto

      try {
        // Crear nuevo presupuesto en la base de datos
        const newBudget = db.createBudget(newBudgetName.trim())

        // Inicializar con algunas categorías básicas
        db.addCategory(newBudget.id, t("categories.food"))
        db.addCategory(newBudget.id, t("categories.utilities"))
        db.addCategory(newBudget.id, t("categories.transportation"))

        // Cerrar el diálogo y limpiar el formulario
        setIsCreateDialogOpen(false)
        setNewBudgetName("")

        // Mostrar notificación de éxito
        toast({
          title: t("notifications.budgetCreated"),
          description: t("notifications.budgetCreatedDesc", { name: newBudgetName }),
          variant: "default",
        })

        // Redirigir directamente a la página del nuevo presupuesto
        router.push(`/budget/${newBudget.id}`)
      } catch (error) {
        console.error("Error al crear presupuesto:", error)
        toast({
          title: t("notifications.error"),
          description: t("notifications.budgetCreateError"),
          variant: "destructive",
        })
        setIsCreating(false)
        setIsGlobalLoading(false) // Desactivar el estado de carga en caso de error
      }
    }
  }

  // Función para mostrar el diálogo de confirmación
  const confirmDeleteBudget = (budget: Budget) => {
    setBudgetToDelete(budget)
    setIsDeleteDialogOpen(true)
  }

  // Función para ejecutar la eliminación
  const handleDeleteBudget = () => {
    if (!budgetToDelete) return

    setIsGlobalLoading(true) // Usar nuestro propio estado en lugar de depender del contexto

    try {
      // 1. Obtener la lista actual de presupuestos
      const budgetsJson = localStorage.getItem("budgets")
      const currentBudgets = budgetsJson ? JSON.parse(budgetsJson) : []

      // 2. Filtrar el presupuesto a eliminar
      const updatedBudgets = currentBudgets.filter((budget: Budget) => budget.id !== budgetToDelete.id)

      // 3. Guardar la lista actualizada
      localStorage.setItem("budgets", JSON.stringify(updatedBudgets))

      // 4. Eliminar los datos del presupuesto
      localStorage.removeItem(`budget_${budgetToDelete.id}`)

      // 5. Actualizar el estado local
      setBudgets(updatedBudgets)

      // 6. Mostrar notificación de éxito
      toast({
        title: t("notifications.budgetDeleted"),
        description: t("notifications.budgetDeletedDesc", { name: budgetToDelete.name }),
        variant: "default",
      })

      console.log("Presupuesto eliminado correctamente:", budgetToDelete.id)
    } catch (error) {
      console.error("Error al eliminar presupuesto:", error)
      toast({
        title: t("notifications.error"),
        description: t("notifications.budgetDeleteError"),
        variant: "destructive",
      })
    } finally {
      // Limpiar el estado
      setBudgetToDelete(null)
      setIsDeleteDialogOpen(false)
      setIsGlobalLoading(false) // Desactivar el estado de carga siempre
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Usar el idioma actual para formatear la fecha
    const locale = language === "en" ? "en-US" : "es-ES"
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Función para obtener un resumen del presupuesto
  const getBudgetSummary = (budgetId: string) => {
    try {
      if (typeof window === "undefined") {
        return {
          amount: 0,
          spent: 0,
          totalCategories: 0,
          categoriesWithItems: [],
          categoriesWithItemsCount: 0,
          hasItemsInCategories: false,
          isConfigured: false,
        }
      }

      const dataJson = localStorage.getItem(`budget_${budgetId}`)
      const budgetData = dataJson ? JSON.parse(dataJson) : { amount: 0, categories: [] }

      // Verificar categorías con gastos (que tengan items con monto > 0)
      const categoriesWithItems = budgetData.categories.filter((category: any) => {
        if (!category.items || category.items.length === 0) return false
        const categoryTotal = category.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        return categoryTotal > 0
      })

      // Calcular el total gastado
      const spent = budgetData.categories.reduce((total: number, category: any) => {
        return total + (category.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      }, 0)

      // Preparar categorías con gastos para mostrar
      const categoriesWithSpending = categoriesWithItems.map((category: any) => {
        const total = (category.items || []).reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
        return {
          name: category.name,
          total,
          items: category.items || [],
        }
      })

      return {
        amount: budgetData.amount || 0,
        spent,
        totalCategories: budgetData.categories.length,
        categoriesWithItems: categoriesWithSpending,
        categoriesWithItemsCount: categoriesWithItems.length,
        hasItemsInCategories: categoriesWithItems.length > 0,
        isConfigured: budgetData.amount > 0 || spent > 0,
      }
    } catch (error) {
      console.error("Error al obtener resumen del presupuesto:", error)
      return {
        amount: 0,
        spent: 0,
        totalCategories: 0,
        categoriesWithItems: [],
        categoriesWithItemsCount: 0,
        hasItemsInCategories: false,
        isConfigured: false,
      }
    }
  }

  // Función para compartir por WhatsApp
  const shareViaWhatsApp = (budget: Budget) => {
    try {
      // Obtener datos del presupuesto
      const dataJson = localStorage.getItem(`budget_${budget.id}`)
      const budgetData = dataJson ? JSON.parse(dataJson) : { amount: 0, categories: [] }

      // Calcular total gastado
      const totalSpent = budgetData.categories.reduce((total: number, category: any) => {
        return total + category.items.reduce((sum: number, item: any) => sum + item.amount, 0)
      }, 0)

      // Crear mensaje para WhatsApp
      let message = `📊 *${t("budget.title")}: ${budget.name}* 📊\n\n`
      message += `💰 *${t("budget.totalBudget")}:* $${budgetData.amount.toFixed(2)}\n`
      message += `💸 *${t("budget.totalSpent")}:* $${totalSpent.toFixed(2)}\n`
      message += `✅ *${t("budget.remaining")}:* $${(budgetData.amount - totalSpent).toFixed(2)}\n\n`

      // Añadir categorías principales
      message += `*${t("budget.mainCategories")}:*\n`

      const topCategories = budgetData.categories
        .map((category: any) => {
          const total = category.items.reduce((sum: number, item: any) => sum + item.amount, 0)
          return { name: category.name, total }
        })
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 3)

      topCategories.forEach((category: any) => {
        message += `- ${category.name}: $${category.total.toFixed(2)}\n`
      })

      // Codificar el mensaje para URL
      const encodedMessage = encodeURIComponent(message)

      // Crear URL de WhatsApp
      const whatsappURL = `https://wa.me/?text=${encodedMessage}`

      // Abrir en nueva ventana
      window.open(whatsappURL, "_blank")

      // Mostrar notificación de éxito
      toast({
        title: t("notifications.sharedSuccess"),
        description: t("notifications.sharedSuccessDesc"),
      })
    } catch (error) {
      console.error("Error al compartir por WhatsApp:", error)
      toast({
        title: t("notifications.error"),
        description: t("notifications.shareError"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("budget.myBudgets")}</h1>
          <p className="text-sm text-muted-foreground">{t("budget.manageYourBudgets")}</p>
        </div>

        <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t("budget.createNewBudget")}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("budget.createNewBudget")}</AlertDialogTitle>
              <AlertDialogDescription>{t("budget.createNewBudgetDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                placeholder={t("budget.budgetNamePlaceholder")}
                className="w-full"
                disabled={isCreating}
              />
              <p className="text-sm text-muted-foreground mt-2">{t("budget.budgetNameExamples")}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCreateBudget}
                disabled={isCreating || !newBudgetName.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isCreating ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("budget.creating")}
                  </span>
                ) : (
                  t("budget.createBudget")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="p-8 text-center bg-muted/30 border-dashed">
          <CardContent className="pt-8 pb-8 flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t("budget.noBudgets")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t("budget.createFirstBudget")}</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <PlusCircle className="h-5 w-5 mr-2" />
              {t("budget.createBudget")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {budgets.map((budget) => {
            const summary = getBudgetSummary(budget.id)
            return (
              <Card key={budget.id} className="overflow-hidden border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{budget.name}</CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground/70" />
                    {formatDate(budget.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-muted-foreground">{t("budget.budget")}:</span>
                      <span className="text-lg font-medium">
                        <span className="text-green-500">$</span> {summary.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-muted-foreground">{t("budget.spent")}:</span>
                      <span className="text-lg font-medium">
                        <span className="text-red-500">$</span> {summary.spent.toFixed(2)}
                      </span>
                    </div>

                    {summary.hasItemsInCategories && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base text-muted-foreground">{t("budget.categoriesWithExpenses")}:</span>
                          <span className="text-lg font-medium">{summary.categoriesWithItemsCount}</span>
                        </div>

                        <div className="mt-1 p-2 bg-muted/30 rounded-md">
                          <h4 className="text-sm font-medium flex items-center mb-1.5">
                            <FolderOpen className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {t("budget.categoriesWithExpenses")}:
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {summary.categoriesWithItems.map((cat: any, index: number) => (
                              <span key={index} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {cat.name} (${cat.total.toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {!summary.isConfigured && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start">
                          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{t("budget.needsConfiguration")}</span>
                        </p>
                      </div>
                    )}

                    {summary.amount > 0 && (
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span>{t("budget.progress")}</span>
                          <span>
                            {summary.amount > 0 ? Math.min(100, (summary.spent / summary.amount) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              summary.spent / summary.amount > 0.9
                                ? "bg-red-500"
                                : summary.spent / summary.amount > 0.7
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(100, (summary.spent / summary.amount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-2 pb-4">
                  <Button
                    variant="default"
                    onClick={() => router.push(`/budget/${budget.id}`)}
                    className="w-full bg-teal-600 hover:bg-teal-700 py-5 text-base"
                  >
                    {t("budget.viewBudget")}
                  </Button>
                  <div className="flex justify-between w-full">
                    <Button variant="outline" className="flex-1 mr-2" onClick={() => shareViaWhatsApp(budget)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("common.share")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => confirmDeleteBudget(budget)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Diálogo de confirmación para eliminar presupuesto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("budget.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription>{t("budget.deleteWarning", { name: budgetToDelete?.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudget}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

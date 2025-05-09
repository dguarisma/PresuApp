"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import ExpenseTracker from "@/components/expense-tracker"
import { Button } from "@/components/ui/button"
import { Edit, Save, BarChart2, Share2, FileSpreadsheet, ArrowLeft, Target } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import db from "@/lib/db"
import Link from "next/link"
import { useTranslation } from "@/hooks/use-translations"
import { BudgetNotifications } from "@/components/budget-notifications"

export default function BudgetPage() {
  const params = useParams()
  const router = useRouter()
  const budgetId = params.id as string
  const [budgetName, setBudgetName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [budgetAmount, setBudgetAmount] = useState(0)
  const [isOffline, setIsOffline] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Cargar el nombre del presupuesto
    const currentBudget = db.getBudget(budgetId)
    if (currentBudget) {
      setBudgetName(currentBudget.name)
      setEditedName(currentBudget.name)
    }

    // Cargar el monto del presupuesto
    const budgetData = db.getBudgetData(budgetId)
    setBudgetAmount(budgetData.amount)

    setIsLoading(false)

    // Verificar estado de conexión
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [budgetId])

  const handleSaveName = () => {
    if (editedName.trim()) {
      // Actualizar el nombre en la base de datos
      db.updateBudget(budgetId, { name: editedName.trim() })
      setBudgetName(editedName.trim())
      setIsEditing(false)
    }
  }

  const exportToCSV = () => {
    try {
      // Obtener datos del presupuesto
      const budgetData = db.getBudgetData(budgetId)

      // Crear cabeceras del CSV
      let csvContent = `${t("budget.category")},${t("budget.concept")},${t("budget.amount")}\n`

      // Añadir datos de cada categoría
      budgetData.categories.forEach((category) => {
        if (category.items.length === 0) {
          csvContent += `"${category.name}","${t("budget.noExpenses")}",0\n`
        } else {
          category.items.forEach((item) => {
            csvContent += `"${category.name}","${item.name}",${item.amount}\n`
          })
        }
      })

      // Añadir resumen
      csvContent += `\n${t("budget.summary")}\n`

      const totalSpent = budgetData.categories.reduce((total, category) => {
        return total + category.items.reduce((sum, item) => sum + item.amount, 0)
      }, 0)

      csvContent += `"${t("budget.totalBudget")}",,${budgetData.amount}\n`
      csvContent += `"${t("budget.totalSpent")}",,${totalSpent}\n`
      csvContent += `"${t("budget.remaining")}",,${budgetData.amount - totalSpent}\n`

      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${t("budget.title")}_${budgetName.replace(/\s+/g, "_")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(`${t("budget.exportError")}:`, error)
    }
  }

  return (
    <div className="min-h-full">
      {isOffline && (
        <div className="offline-indicator" role="alert" aria-live="assertive">
          <span>
            {t("app.offlineMode")} - {t("app.workingOffline")}
          </span>
        </div>
      )}

      <div className="p-4 flex flex-col min-h-[100vh]">
        <div className="flex justify-center py-2 mb-2">
          <Link href="/">
            <img src="/logo.png" alt="PresuApp Logo" className="h-10" />
          </Link>
        </div>

        <header className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full mr-1"
                onClick={() => router.push("/")}
                aria-label={t("common.back")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {isLoading ? (
                <Skeleton className="h-8 w-48 ml-2" />
              ) : isEditing ? (
                <div className="flex items-center gap-2 flex-1 ml-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-9 text-lg font-bold"
                    autoFocus
                    aria-label={t("budget.budgetNamePlaceholder")}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-7 w-7"
                    onClick={handleSaveName}
                    aria-label={t("common.save")}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <h1 className="text-xl font-bold truncate">{budgetName}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-7 w-7"
                    onClick={() => setIsEditing(true)}
                    aria-label={t("common.edit")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <ModeToggle />
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/budget/${budgetId}/analysis`)}
                className="flex items-center justify-center gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                <span>{t("budget.analysis")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2"
                onClick={exportToCSV}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{t("budget.exportToExcel")}</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  // Crear mensaje para compartir
                  const text = t("budget.shareMessage", { name: budgetName })
                  // Usar directamente WhatsApp sin intentar usar la Web Share API
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
                  window.open(whatsappUrl, "_blank")
                }}
              >
                <Share2 className="h-4 w-4 mr-1" />
                <span>{t("budget.shareWhatsApp")}</span>
              </Button>
              <Link
                href={`/budget/${params.id}/metas`}
                className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
              >
                <Target className="h-4 w-4 mr-2" />
                {t("savingsGoals.title")}
              </Link>

              {/* Añadir el componente de notificaciones aquí */}
              {!isLoading && (
                <BudgetNotifications budgetId={budgetId} budgetName={budgetName} totalBudget={budgetAmount} />
              )}
            </div>
          </div>
        </header>
        <main>
          <ExpenseTracker budgetId={budgetId} />
        </main>
      </div>
    </div>
  )
}

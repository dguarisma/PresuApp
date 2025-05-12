"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Plus, DollarSign } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import db from "@/lib/db"
import Link from "next/link"
import { useLoading } from "@/components/loading-overlay"
import { useTranslation } from "@/hooks/use-translations"
import { Checkbox } from "@/components/ui/checkbox"
import incomeDB from "@/lib/db-income"
import type { IncomeItem } from "@/types/income"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useCurrency } from "@/hooks/use-currency"

export default function NewBudgetPage() {
  const router = useRouter()
  const [budgetName, setBudgetName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setIsLoading } = useLoading()
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()

  // Estado para los ingresos globales
  const [globalIncomes, setGlobalIncomes] = useState<IncomeItem[]>([])
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([])
  const [showIncomes, setShowIncomes] = useState(false)

  // Cargar ingresos globales
  useEffect(() => {
    const GLOBAL_INCOME_ID = "global_income"
    const incomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    setGlobalIncomes(incomeData.items)
  }, [])

  const handleToggleIncome = (incomeId: string) => {
    setSelectedIncomes((prev) => (prev.includes(incomeId) ? prev.filter((id) => id !== incomeId) : [...prev, incomeId]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (budgetName.trim()) {
      setIsSubmitting(true)
      setIsLoading(true) // Activar el overlay de carga global

      try {
        // Crear nuevo presupuesto en la base de datos
        const newBudget = db.createBudget(budgetName.trim())

        // Inicializar categorías básicas en segundo plano
        setTimeout(() => {
          try {
            db.addCategory(newBudget.id, "Material")
            db.addCategory(newBudget.id, "Servicios")
            db.addCategory(newBudget.id, "Transporte")
          } catch (error) {
            console.error("Error al crear categorías iniciales:", error)
          }
        }, 0)

        // Copiar los ingresos seleccionados al nuevo presupuesto
        if (selectedIncomes.length > 0) {
          const GLOBAL_INCOME_ID = "global_income"
          const incomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)

          selectedIncomes.forEach((incomeId) => {
            const income = incomeData.items.find((item) => item.id === incomeId)
            if (income) {
              // Añadir el ingreso al nuevo presupuesto
              incomeDB.addIncome(newBudget.id, {
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
        }

        // Redirigir inmediatamente sin esperar a que se creen las categorías
        router.push(`/budget/${newBudget.id}`)

        // Desactivar el estado de carga después de un breve retraso
        // para permitir que comience la navegación (reducido a 200ms)
        setTimeout(() => {
          setIsLoading(false)
          setIsSubmitting(false)
        }, 200)
      } catch (error) {
        console.error("Error al crear presupuesto:", error)
        setIsSubmitting(false)
        setIsLoading(false) // Desactivar el overlay de carga global en caso de error
        alert("Hubo un error al crear el presupuesto. Inténtalo de nuevo.")
      }
    }
  }

  return (
    <div className="min-h-full">
      <div className="p-3 flex flex-col min-h-[100vh]">
        <div className="flex justify-end mb-2">
          <ModeToggle />
        </div>

        <div className="flex justify-center mb-4">
          <Link href="/">
            <img src="/logo.png" alt="PresuApp Logo" className="h-8" />
          </Link>
        </div>

        <header className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mr-2 rounded-full h-8 w-8 p-0"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">{t("budget.newBudget")}</h1>
        </header>

        <main className="flex-1">
          <Card className="w-full animate-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("budget.createNewBudget")}</CardTitle>
              <CardDescription className="text-xs">{t("budget.giveDescriptiveName")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Input
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    placeholder={t("budget.budgetName")}
                    className="text-sm py-4"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">{t("budget.examples")}</p>
                </div>

                {/* Sección de ingresos globales */}
                {globalIncomes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setShowIncomes(!showIncomes)}
                    >
                      <h3 className="text-sm font-medium flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-teal-500" />
                        {t("income.selectIncomes") || "Seleccionar ingresos existentes"}
                      </h3>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {showIncomes ? "-" : "+"}
                      </Button>
                    </div>

                    {showIncomes && (
                      <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                        {globalIncomes.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            {t("income.noGlobalIncomes") || "No hay ingresos registrados"}
                          </p>
                        ) : (
                          <>
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-muted-foreground">
                                {t("income.availableIncomes") || "Ingresos disponibles"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => {
                                  if (selectedIncomes.length === globalIncomes.length) {
                                    setSelectedIncomes([])
                                  } else {
                                    setSelectedIncomes(globalIncomes.map((income) => income.id))
                                  }
                                }}
                              >
                                {selectedIncomes.length === globalIncomes.length
                                  ? t("actions.deselectAll") || "Deseleccionar todos"
                                  : t("actions.selectAll") || "Seleccionar todos"}
                              </Button>
                            </div>

                            {globalIncomes.map((income) => (
                              <div key={income.id} className="flex items-center space-x-2 p-2 border-b last:border-0">
                                <Checkbox
                                  id={`income-${income.id}`}
                                  checked={selectedIncomes.includes(income.id)}
                                  onCheckedChange={() => handleToggleIncome(income.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={`income-${income.id}`}
                                    className="text-sm font-medium cursor-pointer flex justify-between"
                                  >
                                    <div className="truncate">
                                      <span>{income.sourceName}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {format(new Date(income.date), "dd/MM/yy", { locale: es })}
                                      </span>
                                    </div>
                                    <span className="font-bold">{formatCurrency(income.amount)}</span>
                                  </label>
                                </div>
                              </div>
                            ))}

                            {selectedIncomes.length > 0 && (
                              <div className="pt-2 border-t mt-2">
                                <div className="flex justify-between text-sm">
                                  <span>{t("income.selectedIncomes") || "Ingresos seleccionados"}:</span>
                                  <span className="font-bold">
                                    {formatCurrency(
                                      globalIncomes
                                        .filter((income) => selectedIncomes.includes(income.id))
                                        .reduce((sum, income) => sum + income.amount, 0),
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full py-4 text-sm" disabled={isSubmitting || !budgetName.trim()}>
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                      {t("common.creating")}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("budget.createBudget")}
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

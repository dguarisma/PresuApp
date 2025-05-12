"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import incomeDB from "@/lib/db-income"
import { useTranslation } from "@/hooks/use-translations"
import type { IncomeItem } from "@/types/income"

interface IncomeOpportunitiesProps {
  budgetId?: string
}

export function IncomeOpportunities({ budgetId = "global" }: IncomeOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<
    Array<{
      id: string
      type: "increase" | "recurring" | "diversify" | "optimize"
      title: string
      description: string
      impact: "high" | "medium" | "low"
      sourceId?: string
      sourceName?: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    analyzeIncomeOpportunities()
  }, [budgetId])

  const analyzeIncomeOpportunities = () => {
    setIsLoading(true)

    // Obtener datos de ingresos
    const incomeData = incomeDB.getIncomeData(budgetId)
    const detectedOpportunities = []

    // 1. Detectar fuentes de ingresos no recurrentes que podrían convertirse en recurrentes
    const nonRecurringSources = new Map<string, { count: number; total: number; items: IncomeItem[] }>()

    incomeData.items.forEach((item) => {
      if (!item.isRecurring) {
        if (!nonRecurringSources.has(item.sourceId)) {
          nonRecurringSources.set(item.sourceId, { count: 0, total: 0, items: [] })
        }
        const source = nonRecurringSources.get(item.sourceId)!
        source.count += 1
        source.total += item.amount
        source.items.push(item)
      }
    })

    // Si hay fuentes con múltiples ingresos no recurrentes, sugerir convertirlos en recurrentes
    nonRecurringSources.forEach((data, sourceId) => {
      if (data.count >= 3) {
        const source = incomeData.sources.find((s) => s.id === sourceId)
        if (source) {
          detectedOpportunities.push({
            id: `recurring-${sourceId}`,
            type: "recurring",
            title: t("opportunities.makeRecurring", { source: source.name }) || `Hacer recurrente: ${source.name}`,
            description:
              t("opportunities.makeRecurringDesc", {
                count: data.count,
                average: (data.total / data.count).toFixed(2),
              }) ||
              `Has registrado ${data.count} ingresos similares. Considera convertirlos en un ingreso recurrente con un promedio de $${(data.total / data.count).toFixed(2)}.`,
            impact: data.count >= 5 ? "high" : "medium",
            sourceId,
            sourceName: source.name,
          })
        }
      }
    })

    // 2. Detectar fuentes de ingresos con potencial de crecimiento
    // Agrupar ingresos recurrentes por fuente
    const recurringSources = new Map<string, IncomeItem[]>()

    incomeData.items
      .filter((item) => item.isRecurring)
      .forEach((item) => {
        if (!recurringSources.has(item.sourceId)) {
          recurringSources.set(item.sourceId, [])
        }
        recurringSources.get(item.sourceId)!.push(item)
      })

    // Analizar tendencias en ingresos recurrentes
    recurringSources.forEach((items, sourceId) => {
      if (items.length >= 2) {
        // Ordenar por fecha
        const sortedItems = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Verificar si hay estancamiento o disminución
        const firstAmount = sortedItems[0].amount
        const lastAmount = sortedItems[sortedItems.length - 1].amount

        if (lastAmount <= firstAmount) {
          const source = incomeData.sources.find((s) => s.id === sourceId)
          if (source) {
            detectedOpportunities.push({
              id: `increase-${sourceId}`,
              type: "increase",
              title: t("opportunities.increaseIncome", { source: source.name }) || `Aumentar: ${source.name}`,
              description:
                t("opportunities.increaseIncomeDesc") ||
                "Esta fuente de ingresos se ha estancado o disminuido. Considera formas de incrementarla.",
              impact: "high",
              sourceId,
              sourceName: source.name,
            })
          }
        }
      }
    })

    // 3. Detectar poca diversificación de ingresos
    if (incomeData.sources.length === 1 && incomeData.items.length >= 3) {
      detectedOpportunities.push({
        id: "diversify",
        type: "diversify",
        title: t("opportunities.diversifySources") || "Diversificar fuentes de ingresos",
        description:
          t("opportunities.diversifySourcesDesc") ||
          "Dependes principalmente de una sola fuente de ingresos. Considera diversificar para mayor estabilidad financiera.",
        impact: "medium",
      })
    }

    // 4. Detectar ingresos irregulares que podrían optimizarse
    const irregularSources = new Set<string>()

    // Identificar fuentes con patrones irregulares
    incomeData.items
      .filter((item) => item.isRecurring)
      .forEach((item) => {
        const sameSourceItems = incomeData.items.filter((i) => i.sourceId === item.sourceId && i.isRecurring)

        if (sameSourceItems.length >= 3) {
          // Calcular la variación en los montos
          const amounts = sameSourceItems.map((i) => i.amount)
          const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length
          const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
          const stdDev = Math.sqrt(variance)

          // Si la desviación estándar es alta en relación al promedio, es irregular
          if (stdDev / avg > 0.2) {
            irregularSources.add(item.sourceId)
          }
        }
      })

    // Añadir oportunidades para fuentes irregulares
    irregularSources.forEach((sourceId) => {
      const source = incomeData.sources.find((s) => s.id === sourceId)
      if (source) {
        detectedOpportunities.push({
          id: `optimize-${sourceId}`,
          type: "optimize",
          title: t("opportunities.optimizeIncome", { source: source.name }) || `Optimizar: ${source.name}`,
          description:
            t("opportunities.optimizeIncomeDesc") ||
            "Esta fuente muestra variaciones significativas. Busca formas de hacerla más estable y predecible.",
          impact: "medium",
          sourceId,
          sourceName: source.name,
        })
      }
    })

    setOpportunities(detectedOpportunities)
    setIsLoading(false)
  }

  // Obtener el ícono según el tipo de oportunidad
  const getOpportunityIcon = (type: string, impact: string) => {
    switch (type) {
      case "increase":
        return <TrendingUp className={`h-5 w-5 ${impact === "high" ? "text-green-500" : "text-green-400"}`} />
      case "recurring":
        return <RefreshCw className={`h-5 w-5 ${impact === "high" ? "text-blue-500" : "text-blue-400"}`} />
      case "diversify":
        return <AlertTriangle className={`h-5 w-5 ${impact === "high" ? "text-amber-500" : "text-amber-400"}`} />
      case "optimize":
        return <CheckCircle className={`h-5 w-5 ${impact === "high" ? "text-purple-500" : "text-purple-400"}`} />
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-500" />
    }
  }

  // Obtener el color de fondo según el impacto
  const getImpactBgColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-50 dark:bg-green-900/20"
      case "medium":
        return "bg-blue-50 dark:bg-blue-900/20"
      case "low":
        return "bg-gray-50 dark:bg-gray-900/20"
      default:
        return "bg-gray-50 dark:bg-gray-900/20"
    }
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <ArrowUpRight className="h-5 w-5 mr-1 text-primary" />
            {t("income.opportunities") || t("opportunities.title") || "Oportunidades de Ingresos"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={analyzeIncomeOpportunities} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            {t("opportunities.refresh") || "Actualizar"}
          </Button>
        </div>
        <CardDescription>
          {t("opportunities.description") || "Detectamos posibles formas de optimizar tus ingresos"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>{t("opportunities.noOpportunities") || "¡Todo se ve bien!"}</p>
            <p className="text-sm mt-1">
              {t("opportunities.noOpportunitiesDesc") ||
                "No hemos detectado oportunidades de mejora en tus ingresos actuales."}
            </p>
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className={`p-4 rounded-lg ${getImpactBgColor(opportunity.impact)} border border-border/30`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getOpportunityIcon(opportunity.type, opportunity.impact)}</div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{opportunity.title}</h3>
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant="outline"
                      className={
                        opportunity.impact === "high"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : opportunity.impact === "medium"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                      }
                    >
                      {t(`opportunities.impact.${opportunity.impact}`) ||
                        (opportunity.impact === "high"
                          ? "Alto impacto"
                          : opportunity.impact === "medium"
                            ? "Impacto medio"
                            : "Bajo impacto")}
                    </Badge>
                    {opportunity.sourceName && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {t("income.source") || "Fuente de ingreso"}: {opportunity.sourceName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default IncomeOpportunities

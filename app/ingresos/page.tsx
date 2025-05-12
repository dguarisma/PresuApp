"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IncomeManager } from "@/components/income-manager-global"
import { IncomeOpportunities } from "@/components/income-opportunities"
import { PageHeader } from "@/components/page-header"

export default function IngresosPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto px-4 pb-16">
      <PageHeader
        title={t("income.globalManagement") || "Gestión de Ingresos"}
        icon={<DollarSign className="h-6 w-6 text-primary" />}
      ></PageHeader>

      <div className="grid gap-5">
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <IncomeManager />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-lg font-semibold">
              {t("income.opportunities") || "Oportunidades de Ingreso"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeOpportunities />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

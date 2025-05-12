"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"
import { useLanguage } from "@/hooks/use-language"
import { Calculator, TrendingUp, Combine, BarChart3 } from "lucide-react"
import { DebtPayoffStrategy } from "@/components/debt-payoff-strategy"
import { AmortizationCalculator } from "@/components/amortization-calculator"
import { DebtConsolidationSimulator } from "@/components/debt-consolidation-simulator"
import { CompoundInterestCalculator } from "@/components/compound-interest-calculator"

export default function DebtToolsPage() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-full">
      <div className="p-4 flex flex-col min-h-[100vh] pb-20">
        <PageHeader title={t("debt.tools")} icon={<Calculator className="h-6 w-6 text-primary" />} />

        <main className="flex-1 mt-4">
          <Tabs defaultValue="payoff-strategy" className="w-full">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/30 rounded-xl mb-4">
              <TabsTrigger
                value="payoff-strategy"
                className="flex items-center gap-1.5 py-2 data-[state=active]:bg-background"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">{t("debt.payoffStrategy")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="amortization"
                className="flex items-center gap-1.5 py-2 data-[state=active]:bg-background"
              >
                <Calculator className="h-4 w-4" />
                <span className="text-xs">{t("debt.amortization")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="consolidation"
                className="flex items-center gap-1.5 py-2 data-[state=active]:bg-background"
              >
                <Combine className="h-4 w-4" />
                <span className="text-xs">{t("debt.consolidation")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="compound-interest"
                className="flex items-center gap-1.5 py-2 data-[state=active]:bg-background"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t("debt.compoundInterest")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payoff-strategy" className="mt-0">
              <DebtPayoffStrategy />
            </TabsContent>

            <TabsContent value="amortization" className="mt-0">
              <AmortizationCalculator />
            </TabsContent>

            <TabsContent value="consolidation" className="mt-0">
              <DebtConsolidationSimulator />
            </TabsContent>

            <TabsContent value="compound-interest" className="mt-0">
              <CompoundInterestCalculator />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

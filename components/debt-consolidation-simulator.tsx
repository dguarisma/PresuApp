"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { Combine, ArrowRight } from "lucide-react"
import { getAllDebts } from "@/lib/db-debt"
import type { Debt } from "@/types/debt"
import { useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export function DebtConsolidationSimulator() {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const [debts, setDebts] = useState<Debt[]>([])
  const [selectedDebts, setSelectedDebts] = useState<string[]>([])
  const [consolidationRate, setConsolidationRate] = useState("10")
  const [consolidationTerm, setConsolidationTerm] = useState("60")
  const [consolidationFee, setConsolidationFee] = useState("0")
  const [results, setResults] = useState<{
    currentMonthlyPayment: number
    newMonthlyPayment: number
    currentTotalInterest: number
    newTotalInterest: number
    currentPayoffMonths: number
    newPayoffMonths: number
    monthlySavings: number
    totalInterestDifference: number
    totalPaymentDifference: number
    isRecommended: boolean
  } | null>(null)

  useEffect(() => {
    loadDebts()
  }, [])

  const loadDebts = async () => {
    try {
      const allDebts = await getAllDebts()
      setDebts(allDebts)
    } catch (error) {
      console.error("Error loading debts:", error)
    }
  }

  const toggleDebtSelection = (debtId: string) => {
    setSelectedDebts((prev) => (prev.includes(debtId) ? prev.filter((id) => id !== debtId) : [...prev, debtId]))
  }

  const calculateConsolidation = () => {
    if (selectedDebts.length === 0) return

    const selectedDebtItems = debts.filter((debt) => selectedDebts.includes(debt.id))

    // Calculate current situation
    const totalBalance = selectedDebtItems.reduce((sum, debt) => sum + debt.amount, 0)
    const currentMonthlyPayment = selectedDebtItems.reduce((sum, debt) => sum + (debt.minimumPayment || 0), 0)

    // Calculate current payoff time and total interest (simplified)
    let currentTotalInterest = 0
    let maxMonths = 0

    for (const debt of selectedDebtItems) {
      if (!debt.minimumPayment || debt.minimumPayment <= 0) continue

      const monthlyRate = (debt.interestRate || 0) / 100 / 12
      let balance = debt.amount
      let months = 0
      let totalInterest = 0

      while (balance > 0 && months < 1000) {
        // Safety limit
        const interest = balance * monthlyRate
        totalInterest += interest
        balance = balance - debt.minimumPayment + interest
        months++

        if (balance <= 0) break
      }

      currentTotalInterest += totalInterest
      maxMonths = Math.max(maxMonths, months)
    }

    // Calculate consolidation
    const fee = Number.parseFloat(consolidationFee) || 0
    const consolidatedBalance = totalBalance + (totalBalance * fee) / 100
    const annualRate = Number.parseFloat(consolidationRate) || 0
    const monthlyRate = annualRate / 100 / 12
    const months = Number.parseInt(consolidationTerm) || 0

    // Calculate new monthly payment using amortization formula
    const newMonthlyPayment =
      (consolidatedBalance * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

    // Calculate total interest for consolidation
    const newTotalInterest = newMonthlyPayment * months - consolidatedBalance

    // Calculate differences
    const monthlySavings = currentMonthlyPayment - newMonthlyPayment
    const totalInterestDifference = currentTotalInterest - newTotalInterest
    const totalPaymentDifference = currentMonthlyPayment * maxMonths - newMonthlyPayment * months

    // Determine if consolidation is recommended
    const isRecommended = monthlySavings > 0 && totalInterestDifference > 0

    setResults({
      currentMonthlyPayment,
      newMonthlyPayment,
      currentTotalInterest,
      newTotalInterest,
      currentPayoffMonths: maxMonths,
      newPayoffMonths: months,
      monthlySavings,
      totalInterestDifference,
      totalPaymentDifference,
      isRecommended,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Combine className="h-5 w-5 text-primary" />
            {t("debt.consolidationSimulator")}
          </CardTitle>
          <CardDescription>{t("debt.consolidationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("debt.selectDebtsToConsolidate")}</Label>
              {debts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("debt.noDebtsFound")}</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {debts.map((debt) => (
                    <div key={debt.id} className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                      <Checkbox
                        id={`debt-${debt.id}`}
                        checked={selectedDebts.includes(debt.id)}
                        onCheckedChange={() => toggleDebtSelection(debt.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`debt-${debt.id}`} className="flex justify-between cursor-pointer">
                          <span className="font-medium">{debt.name}</span>
                          <span>{formatCurrency(debt.amount)}</span>
                        </Label>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {t("debt.interestRate")}: {debt.interestRate || 0}%
                          </span>
                          <span>
                            {t("debt.minimumPayment")}: {formatCurrency(debt.minimumPayment || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="consolidationRate">{t("debt.consolidationRate")}</Label>
                  <span className="text-sm font-medium">{consolidationRate}%</span>
                </div>
                <Slider
                  id="consolidationRate"
                  min={1}
                  max={30}
                  step={0.1}
                  value={[Number.parseFloat(consolidationRate)]}
                  onValueChange={(value) => setConsolidationRate(value[0].toString())}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="consolidationTerm">{t("debt.consolidationTerm")}</Label>
                  <span className="text-sm font-medium">
                    {consolidationTerm} {t("common.months")} ({(Number.parseInt(consolidationTerm) / 12).toFixed(1)}{" "}
                    {t("common.years")})
                  </span>
                </div>
                <Slider
                  id="consolidationTerm"
                  min={12}
                  max={120}
                  step={12}
                  value={[Number.parseInt(consolidationTerm)]}
                  onValueChange={(value) => setConsolidationTerm(value[0].toString())}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="consolidationFee">{t("debt.consolidationFee")}</Label>
                  <span className="text-sm font-medium">{consolidationFee}%</span>
                </div>
                <Slider
                  id="consolidationFee"
                  min={0}
                  max={10}
                  step={0.5}
                  value={[Number.parseFloat(consolidationFee)]}
                  onValueChange={(value) => setConsolidationFee(value[0].toString())}
                />
                <p className="text-xs text-muted-foreground">{t("debt.consolidationFeeDescription")}</p>
              </div>
            </div>

            <Button onClick={calculateConsolidation} className="w-full mt-2" disabled={selectedDebts.length === 0}>
              {t("debt.simulateConsolidation")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("debt.consolidationResults")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3">{t("debt.currentSituation")}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.monthlyPayment")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.currentMonthlyPayment)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.estimatedPayoffTime")}</div>
                    <div className="text-xl font-bold">
                      {Math.floor(results.currentPayoffMonths / 12)} {t("common.years")}{" "}
                      {results.currentPayoffMonths % 12} {t("common.months")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.totalInterest")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.currentTotalInterest)}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3">{t("debt.afterConsolidation")}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.monthlyPayment")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.newMonthlyPayment)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.estimatedPayoffTime")}</div>
                    <div className="text-xl font-bold">
                      {Math.floor(results.newPayoffMonths / 12)} {t("common.years")} {results.newPayoffMonths % 12}{" "}
                      {t("common.months")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.totalInterest")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.newTotalInterest)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/10 border border-border/40 rounded-lg">
              <h3 className="font-semibold mb-3">{t("debt.comparison")}</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t("debt.monthlySavings")}</span>
                  <span className={`font-medium ${results.monthlySavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {results.monthlySavings >= 0 ? "+" : ""}
                    {formatCurrency(results.monthlySavings)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("debt.totalInterestSavings")}</span>
                  <span
                    className={`font-medium ${results.totalInterestDifference >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {results.totalInterestDifference >= 0 ? "+" : ""}
                    {formatCurrency(results.totalInterestDifference)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>{t("debt.totalPaymentSavings")}</span>
                  <span
                    className={`font-medium ${results.totalPaymentDifference >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {results.totalPaymentDifference >= 0 ? "+" : ""}
                    {formatCurrency(results.totalPaymentDifference)}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-sm mb-2">{t("debt.recommendation")}</div>
                  <div
                    className={`p-3 rounded-lg ${
                      results.isRecommended
                        ? "bg-green-50 border border-green-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    {results.isRecommended ? (
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">{t("debt.consolidationRecommended")}</p>
                          <p className="text-xs text-green-700 mt-1">{t("debt.consolidationRecommendedReason")}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <ArrowRight className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">{t("debt.consolidationNotRecommended")}</p>
                          <p className="text-xs text-amber-700 mt-1">{t("debt.consolidationNotRecommendedReason")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { getAllDebts } from "@/lib/db-debt"
import type { Debt } from "@/types/debt"
import { ArrowDownAZ, Flame, Snowflake, Plus, Trash2 } from "lucide-react"

export function DebtPayoffStrategy() {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const [debts, setDebts] = useState<Debt[]>([])
  const [customDebts, setCustomDebts] = useState<
    Array<{
      id: string
      name: string
      balance: number
      interestRate: number
      minimumPayment: number
    }>
  >([])
  const [extraPayment, setExtraPayment] = useState(0)
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche")
  const [results, setResults] = useState<{
    avalanche: {
      totalInterest: number
      monthsToPayoff: number
      payoffOrder: string[]
    }
    snowball: {
      totalInterest: number
      monthsToPayoff: number
      payoffOrder: string[]
    }
  } | null>(null)
  const [useExistingDebts, setUseExistingDebts] = useState(true)
  const [newDebtName, setNewDebtName] = useState("")
  const [newDebtBalance, setNewDebtBalance] = useState("")
  const [newDebtInterest, setNewDebtInterest] = useState("")
  const [newDebtPayment, setNewDebtPayment] = useState("")

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

  const addCustomDebt = () => {
    if (!newDebtName || !newDebtBalance || !newDebtInterest || !newDebtPayment) return

    const newDebt = {
      id: Date.now().toString(),
      name: newDebtName,
      balance: Number.parseFloat(newDebtBalance),
      interestRate: Number.parseFloat(newDebtInterest),
      minimumPayment: Number.parseFloat(newDebtPayment),
    }

    setCustomDebts([...customDebts, newDebt])
    setNewDebtName("")
    setNewDebtBalance("")
    setNewDebtInterest("")
    setNewDebtPayment("")
  }

  const removeCustomDebt = (id: string) => {
    setCustomDebts(customDebts.filter((debt) => debt.id !== id))
  }

  const calculatePayoff = () => {
    // Get the debts to use for calculation
    const debtsToUse = useExistingDebts
      ? debts.map((debt) => ({
          id: debt.id,
          name: debt.name,
          balance: debt.amount,
          interestRate: debt.interestRate || 0,
          minimumPayment: debt.minimumPayment || 0,
        }))
      : customDebts

    if (debtsToUse.length === 0) return

    // Calculate avalanche strategy (highest interest first)
    const avalancheDebts = [...debtsToUse].sort((a, b) => b.interestRate - a.interestRate)
    const avalancheResult = simulatePayoff(avalancheDebts, extraPayment)

    // Calculate snowball strategy (lowest balance first)
    const snowballDebts = [...debtsToUse].sort((a, b) => a.balance - b.balance)
    const snowballResult = simulatePayoff(snowballDebts, extraPayment)

    setResults({
      avalanche: {
        totalInterest: avalancheResult.totalInterest,
        monthsToPayoff: avalancheResult.months,
        payoffOrder: avalancheResult.payoffOrder,
      },
      snowball: {
        totalInterest: snowballResult.totalInterest,
        monthsToPayoff: snowballResult.months,
        payoffOrder: snowballResult.payoffOrder,
      },
    })
  }

  const simulatePayoff = (sortedDebts: any[], extraPayment: number) => {
    const debts = sortedDebts.map((debt) => ({ ...debt }))
    let months = 0
    let totalInterest = 0
    const payoffOrder: string[] = []

    // Continue until all debts are paid off
    while (debts.some((debt) => debt.balance > 0)) {
      months++
      let remainingExtra = extraPayment

      // Pay minimum on all debts and calculate interest
      for (let i = 0; i < debts.length; i++) {
        if (debts[i].balance <= 0) continue

        // Calculate interest for this month
        const monthlyInterest = debts[i].balance * (debts[i].interestRate / 100 / 12)
        totalInterest += monthlyInterest
        debts[i].balance += monthlyInterest

        // Pay minimum payment
        const payment = Math.min(debts[i].balance, debts[i].minimumPayment)
        debts[i].balance -= payment
      }

      // Apply extra payment to the first debt in the list that's not paid off
      for (let i = 0; i < debts.length; i++) {
        if (debts[i].balance > 0 && remainingExtra > 0) {
          const payment = Math.min(debts[i].balance, remainingExtra)
          debts[i].balance -= payment
          remainingExtra -= payment

          // If debt is paid off, add to payoff order
          if (debts[i].balance <= 0 && !payoffOrder.includes(debts[i].name)) {
            payoffOrder.push(debts[i].name)
          }

          if (remainingExtra <= 0) break
        }
      }

      // Check for any newly paid off debts
      for (let i = 0; i < debts.length; i++) {
        if (debts[i].balance <= 0 && !payoffOrder.includes(debts[i].name)) {
          payoffOrder.push(debts[i].name)
        }
      }

      // Safety check to prevent infinite loops
      if (months > 600) break // 50 years max
    }

    return { months, totalInterest, payoffOrder }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ArrowDownAZ className="h-5 w-5 text-primary" />
            {t("debt.payoffStrategy") || "Debt Payoff Strategy"}
          </CardTitle>
          <CardDescription>
            {t("debt.payoffStrategyDescription") || "Compare different methods to pay off your debts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("debt.useExistingDebts") || "Use Existing Debts"}</Label>
              <RadioGroup
                value={useExistingDebts ? "existing" : "custom"}
                onValueChange={(v) => setUseExistingDebts(v === "existing")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing">{t("debt.existingDebts") || "Existing Debts"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">{t("debt.customDebts") || "Custom Debts"}</Label>
                </div>
              </RadioGroup>
            </div>

            {useExistingDebts ? (
              <div className="space-y-2">
                <Label>{t("debt.yourDebts") || "Your Debts"}</Label>
                {debts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("debt.noDebtsFound") || "No debts found"}</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {debts.map((debt) => (
                      <div key={debt.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium">{debt.name}</span>
                          <span>{formatCurrency(debt.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {t("debt.interestRate") || "Interest Rate"}: {debt.interestRate || 0}%
                          </span>
                          <span>
                            {t("debt.minimumPayment") || "Minimum Payment"}: {formatCurrency(debt.minimumPayment || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Label>{t("debt.customDebts") || "Custom Debts"}</Label>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customDebts.map((debt) => (
                    <div key={debt.id} className="p-3 bg-muted/30 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{debt.name}</span>
                          <span>{formatCurrency(debt.balance)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {t("debt.interestRate") || "Interest Rate"}: {debt.interestRate}%
                          </span>
                          <span>
                            {t("debt.minimumPayment") || "Minimum Payment"}: {formatCurrency(debt.minimumPayment)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomDebt(debt.id)}
                        className="h-8 w-8 ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="debtName" className="text-xs">
                      {t("debt.name") || "Name"}
                    </Label>
                    <Input
                      id="debtName"
                      value={newDebtName}
                      onChange={(e) => setNewDebtName(e.target.value)}
                      placeholder={t("debt.namePlaceholder") || "Debt name"}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="debtBalance" className="text-xs">
                      {t("debt.balance") || "Balance"}
                    </Label>
                    <Input
                      id="debtBalance"
                      type="number"
                      value={newDebtBalance}
                      onChange={(e) => setNewDebtBalance(e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="debtInterest" className="text-xs">
                      {t("debt.interestRate") || "Interest Rate"}
                    </Label>
                    <Input
                      id="debtInterest"
                      type="number"
                      value={newDebtInterest}
                      onChange={(e) => setNewDebtInterest(e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="debtPayment" className="text-xs">
                      {t("debt.minimumPayment") || "Minimum Payment"}
                    </Label>
                    <Input
                      id="debtPayment"
                      type="number"
                      value={newDebtPayment}
                      onChange={(e) => setNewDebtPayment(e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomDebt}
                  className="w-full flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("debt.addDebt") || "Add Debt"}</span>
                </Button>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="extraPayment">{t("debt.extraMonthlyPayment") || "Extra Monthly Payment"}</Label>
              <Input
                id="extraPayment"
                type="number"
                value={extraPayment || ""}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                placeholder="0.00"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                {t("debt.extraPaymentDescription") || "Additional amount to pay each month beyond the minimum payments"}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Label>{t("debt.payoffMethod") || "Payoff Method"}</Label>
              <RadioGroup
                value={strategy}
                onValueChange={(v) => setStrategy(v as "avalanche" | "snowball")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg">
                  <RadioGroupItem value="avalanche" id="avalanche" className="mt-1" />
                  <div>
                    <Label htmlFor="avalanche" className="flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-red-500" />
                      {t("debt.avalancheMethod") || "Avalanche Method"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("debt.avalancheDescription") ||
                        "Pay highest interest rate debts first to minimize interest costs"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg">
                  <RadioGroupItem value="snowball" id="snowball" className="mt-1" />
                  <div>
                    <Label htmlFor="snowball" className="flex items-center gap-1.5">
                      <Snowflake className="h-4 w-4 text-blue-500" />
                      {t("debt.snowballMethod") || "Snowball Method"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("debt.snowballDescription") || "Pay smallest balance debts first for psychological wins"}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={calculatePayoff}
              className="w-full"
              disabled={(useExistingDebts && debts.length === 0) || (!useExistingDebts && customDebts.length === 0)}
            >
              {t("debt.calculatePayoff") || "Calculate Payoff"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("debt.payoffResults") || "Payoff Results"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">{t("debt.avalancheMethod") || "Avalanche Method"}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.totalInterest") || "Total Interest"}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.avalanche.totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.timeToPayoff") || "Time to Payoff"}</div>
                    <div className="text-xl font-bold">
                      {Math.floor(results.avalanche.monthsToPayoff / 12)} {t("common.years") || "years"}{" "}
                      {results.avalanche.monthsToPayoff % 12} {t("common.months") || "months"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t("debt.payoffOrder") || "Payoff Order"}</div>
                    <ol className="list-decimal list-inside text-sm">
                      {results.avalanche.payoffOrder.map((debt, index) => (
                        <li key={index} className="mb-1">
                          {debt}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Snowflake className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">{t("debt.snowballMethod") || "Snowball Method"}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.totalInterest") || "Total Interest"}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.snowball.totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t("debt.timeToPayoff") || "Time to Payoff"}</div>
                    <div className="text-xl font-bold">
                      {Math.floor(results.snowball.monthsToPayoff / 12)} {t("common.years") || "years"}{" "}
                      {results.snowball.monthsToPayoff % 12} {t("common.months") || "months"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t("debt.payoffOrder") || "Payoff Order"}</div>
                    <ol className="list-decimal list-inside text-sm">
                      {results.snowball.payoffOrder.map((debt, index) => (
                        <li key={index} className="mb-1">
                          {debt}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/10 border border-border/40 rounded-lg">
              <h3 className="font-semibold mb-2">{t("debt.comparison") || "Comparison"}</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("debt.interestSavings") || "Interest Savings"}</span>
                    <span className="font-medium">
                      {formatCurrency(Math.abs(results.avalanche.totalInterest - results.snowball.totalInterest))}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {results.avalanche.totalInterest < results.snowball.totalInterest
                      ? t("debt.avalancheSavesMore") || "Avalanche method saves more interest"
                      : results.snowball.totalInterest < results.avalanche.totalInterest
                        ? t("debt.snowballSavesMore") || "Snowball method saves more interest"
                        : t("debt.methodsEqual") || "Both methods cost the same"}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t("debt.timeDifference") || "Time Difference"}</span>
                    <span className="font-medium">
                      {Math.abs(results.avalanche.monthsToPayoff - results.snowball.monthsToPayoff)}{" "}
                      {t("common.months") || "months"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {results.avalanche.monthsToPayoff < results.snowball.monthsToPayoff
                      ? t("debt.avalancheFaster") || "Avalanche method is faster"
                      : results.snowball.monthsToPayoff < results.avalanche.monthsToPayoff
                        ? t("debt.snowballFaster") || "Snowball method is faster"
                        : t("debt.sameTime") || "Both methods take the same time"}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-sm mb-2">{t("debt.recommendation") || "Recommendation"}</div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    {strategy === "avalanche" ? (
                      <div className="flex items-start gap-2">
                        <Flame className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {t("debt.avalancheRecommended") || "Avalanche Method Recommended"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("debt.avalancheRecommendationReason") ||
                              "This method will save you the most money in interest over time."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Snowflake className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {t("debt.snowballRecommended") || "Snowball Method Recommended"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("debt.snowballRecommendationReason") ||
                              "This method provides quick wins to keep you motivated."}
                          </p>
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

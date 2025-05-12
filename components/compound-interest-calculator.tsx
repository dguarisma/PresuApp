"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { TrendingUp } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CompoundInterestCalculator() {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const [initialAmount, setInitialAmount] = useState("")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [annualInterestRate, setAnnualInterestRate] = useState("")
  const [years, setYears] = useState("")
  const [compoundingFrequency, setCompoundingFrequency] = useState("monthly")
  const [contributionType, setContributionType] = useState("beginning")
  const [results, setResults] = useState<{
    finalBalance: number
    totalContributions: number
    totalInterest: number
    yearlyData: Array<{
      year: number
      balance: number
      contributions: number
      interest: number
    }>
  } | null>(null)

  const calculateCompoundInterest = () => {
    const principal = Number.parseFloat(initialAmount) || 0
    const monthlyDeposit = Number.parseFloat(monthlyContribution) || 0
    const rate = Number.parseFloat(annualInterestRate) / 100
    const numYears = Number.parseInt(years) || 0

    if (rate <= 0 || numYears <= 0) return

    let periodsPerYear = 1
    switch (compoundingFrequency) {
      case "daily":
        periodsPerYear = 365
        break
      case "weekly":
        periodsPerYear = 52
        break
      case "monthly":
        periodsPerYear = 12
        break
      case "quarterly":
        periodsPerYear = 4
        break
      case "semiannually":
        periodsPerYear = 2
        break
      case "annually":
        periodsPerYear = 1
        break
    }

    const totalPeriods = numYears * periodsPerYear
    const periodicRate = rate / periodsPerYear
    const periodicDeposit = monthlyDeposit * (12 / periodsPerYear)

    let balance = principal
    let totalContributions = principal
    let totalInterest = 0
    const yearlyData = []

    for (let period = 1; period <= totalPeriods; period++) {
      // Add contribution at the beginning of period if selected
      if (contributionType === "beginning") {
        balance += periodicDeposit
        totalContributions += periodicDeposit
      }

      // Calculate interest
      const interestEarned = balance * periodicRate
      balance += interestEarned
      totalInterest += interestEarned

      // Add contribution at the end of period if selected
      if (contributionType === "end") {
        balance += periodicDeposit
        totalContributions += periodicDeposit
      }

      // Store yearly data
      if (period % periodsPerYear === 0) {
        const year = period / periodsPerYear
        yearlyData.push({
          year,
          balance,
          contributions: totalContributions,
          interest: totalInterest,
        })
      }
    }

    setResults({
      finalBalance: balance,
      totalContributions,
      totalInterest,
      yearlyData,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {t("debt.compoundInterestCalculator")}
          </CardTitle>
          <CardDescription>{t("debt.compoundInterestDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialAmount">{t("debt.initialAmount")}</Label>
                <Input
                  id="initialAmount"
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">{t("debt.monthlyContribution")}</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualInterestRate">{t("debt.annualInterestRate")}</Label>
                <Input
                  id="annualInterestRate"
                  type="number"
                  value={annualInterestRate}
                  onChange={(e) => setAnnualInterestRate(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">{t("debt.investmentPeriod")}</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compoundingFrequency">{t("debt.compoundingFrequency")}</Label>
              <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                <SelectTrigger id="compoundingFrequency" className="h-10">
                  <SelectValue placeholder={t("debt.selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("debt.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("debt.weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("debt.monthly")}</SelectItem>
                  <SelectItem value="quarterly">{t("debt.quarterly")}</SelectItem>
                  <SelectItem value="semiannually">{t("debt.semiannually")}</SelectItem>
                  <SelectItem value="annually">{t("debt.annually")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("debt.contributionTiming")}</Label>
              <RadioGroup value={contributionType} onValueChange={setContributionType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginning" id="beginning" />
                  <Label htmlFor="beginning">{t("debt.beginningOfPeriod")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="end" id="end" />
                  <Label htmlFor="end">{t("debt.endOfPeriod")}</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={calculateCompoundInterest}
              className="w-full mt-2"
              disabled={!annualInterestRate || !years}
            >
              {t("debt.calculateInterest")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("debt.investmentResults")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">{t("debt.summary")}</TabsTrigger>
                <TabsTrigger value="yearly">{t("debt.yearlyBreakdown")}</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t("debt.finalBalance")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.finalBalance)}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t("debt.totalContributions")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.totalContributions)}</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t("debt.totalInterestEarned")}</div>
                    <div className="text-xl font-bold">{formatCurrency(results.totalInterest)}</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted/10 border border-border/40 rounded-lg">
                  <h3 className="font-medium mb-2">{t("debt.interestBreakdown")}</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 bg-primary/20 rounded-full"
                      style={{ width: `${(results.totalContributions / results.finalBalance) * 100}%` }}
                    ></div>
                    <div
                      className="h-4 bg-primary rounded-full"
                      style={{ width: `${(results.totalInterest / results.finalBalance) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary/20 rounded-full"></div>
                      <span>
                        {t("debt.contributions")}:{" "}
                        {((results.totalContributions / results.finalBalance) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span>
                        {t("debt.interest")}: {((results.totalInterest / results.finalBalance) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="pt-4">
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 text-sm font-medium">{t("debt.year")}</th>
                        <th className="text-right p-2 text-sm font-medium">{t("debt.balance")}</th>
                        <th className="text-right p-2 text-sm font-medium">{t("debt.contributions")}</th>
                        <th className="text-right p-2 text-sm font-medium">{t("debt.interest")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearlyData.map((data) => (
                        <tr key={data.year} className="border-t">
                          <td className="p-2">{data.year}</td>
                          <td className="p-2 text-right">{formatCurrency(data.balance)}</td>
                          <td className="p-2 text-right">{formatCurrency(data.contributions)}</td>
                          <td className="p-2 text-right">{formatCurrency(data.interest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

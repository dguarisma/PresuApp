"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { Calculator, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function AmortizationCalculator() {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [extraPayment, setExtraPayment] = useState("0")
  const [amortizationSchedule, setAmortizationSchedule] = useState<Array<{
    period: number
    payment: number
    principal: number
    interest: number
    extraPayment: number
    balance: number
  }> | null>(null)
  const [summary, setSummary] = useState<{
    totalPayments: number
    totalInterest: number
    monthsSaved: number
    interestSaved: number
  } | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const calculateAmortization = () => {
    const principal = Number.parseFloat(loanAmount)
    const annualRate = Number.parseFloat(interestRate) / 100
    const years = Number.parseFloat(loanTerm)
    const extra = Number.parseFloat(extraPayment) || 0

    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate <= 0 || years <= 0) {
      return
    }

    // Calculate payments based on frequency
    let periodsPerYear = 12 // Default monthly
    if (paymentFrequency === "biweekly") periodsPerYear = 26
    if (paymentFrequency === "weekly") periodsPerYear = 52

    const totalPeriods = Math.ceil(years * periodsPerYear)
    const periodicRate = annualRate / periodsPerYear

    // Calculate payment using the formula: P = (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
    const payment =
      (principal * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
      (Math.pow(1 + periodicRate, totalPeriods) - 1)

    // Calculate amortization schedule
    let balance = principal
    let period = 1
    const schedule = []
    let totalInterestWithExtra = 0
    let totalInterestWithoutExtra = 0
    let periodsWithoutExtra = totalPeriods

    // First calculate what the total interest would be without extra payments
    let tempBalance = principal
    for (let i = 1; i <= totalPeriods; i++) {
      const tempInterest = tempBalance * periodicRate
      const tempPrincipal = payment - tempInterest
      tempBalance -= tempPrincipal
      totalInterestWithoutExtra += tempInterest
      if (tempBalance <= 0) {
        periodsWithoutExtra = i
        break
      }
    }

    // Now calculate with extra payments
    while (balance > 0 && period <= totalPeriods * 1.5) {
      // Safety limit
      const interestPayment = balance * periodicRate
      const principalPayment = payment - interestPayment

      // Apply extra payment
      const actualExtraPayment = balance - principalPayment <= extra ? balance - principalPayment : extra

      // Update balance
      balance = balance - principalPayment - actualExtraPayment
      if (balance < 0) balance = 0

      totalInterestWithExtra += interestPayment

      schedule.push({
        period,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        extraPayment: actualExtraPayment,
        balance,
      })

      if (balance <= 0) break
      period++
    }

    setAmortizationSchedule(schedule)
    setSummary({
      totalPayments: schedule.length,
      totalInterest: totalInterestWithExtra,
      monthsSaved: periodsWithoutExtra - schedule.length,
      interestSaved: totalInterestWithoutExtra - totalInterestWithExtra,
    })
  }

  const exportToCSV = () => {
    if (!amortizationSchedule) return

    const headers = ["Period", "Payment", "Principal", "Interest", "Extra Payment", "Remaining Balance"]
    const csvContent = [
      headers.join(","),
      ...amortizationSchedule.map((row) =>
        [
          row.period,
          row.payment.toFixed(2),
          row.principal.toFixed(2),
          row.interest.toFixed(2),
          row.extraPayment.toFixed(2),
          row.balance.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "amortization_schedule.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t("debt.amortizationCalculator")}
          </CardTitle>
          <CardDescription>{t("debt.amortizationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">{t("debt.loanAmount")}</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">{t("debt.annualInterestRate")}</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="0.00"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanTerm">{t("debt.loanTermYears")}</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  placeholder="0"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentFrequency">{t("debt.paymentFrequency")}</Label>
                <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                  <SelectTrigger id="paymentFrequency" className="h-10">
                    <SelectValue placeholder={t("debt.selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("debt.monthly")}</SelectItem>
                    <SelectItem value="biweekly">{t("debt.biweekly")}</SelectItem>
                    <SelectItem value="weekly">{t("debt.weekly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="extraPayment">{t("debt.extraPayment")}</Label>
            <Input
              id="extraPayment"
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="0.00"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">{t("debt.extraPaymentAmortizationDescription")}</p>
          </div>

          <Button
            onClick={calculateAmortization}
            className="w-full mt-4"
            disabled={!loanAmount || !interestRate || !loanTerm}
          >
            {t("debt.calculateAmortization")}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("debt.loanSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">{t("debt.monthlyPayment")}</div>
                <div className="text-xl font-bold">{formatCurrency(amortizationSchedule?.[0]?.payment || 0)}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">{t("debt.totalInterest")}</div>
                <div className="text-xl font-bold">{formatCurrency(summary.totalInterest)}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">{t("debt.totalPayments")}</div>
                <div className="text-xl font-bold">{summary.totalPayments}</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">{t("debt.payoffDate")}</div>
                <div className="text-xl font-bold">
                  {new Date(Date.now() + summary.totalPayments * (30.44 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                </div>
              </div>
            </div>

            {Number.parseFloat(extraPayment) > 0 && summary.monthsSaved > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">{t("debt.savingsWithExtraPayments")}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>
                    <span className="text-green-600">{t("debt.timeSaved")}: </span>
                    <span className="font-medium">
                      {Math.floor(summary.monthsSaved / 12)} {t("common.years")} {summary.monthsSaved % 12}{" "}
                      {t("common.months")}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600">{t("debt.interestSaved")}: </span>
                    <span className="font-medium">{formatCurrency(summary.interestSaved)}</span>
                  </div>
                </div>
              </div>
            )}

            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t("debt.amortizationSchedule")}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8 text-xs">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {t("common.export")}
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent className="mt-2">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">{t("debt.period")}</TableHead>
                        <TableHead>{t("debt.payment")}</TableHead>
                        <TableHead>{t("debt.principal")}</TableHead>
                        <TableHead>{t("debt.interest")}</TableHead>
                        <TableHead>{t("debt.extraPayment")}</TableHead>
                        <TableHead>{t("debt.balance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amortizationSchedule?.slice(0, 100).map((row) => (
                        <TableRow key={row.period}>
                          <TableCell>{row.period}</TableCell>
                          <TableCell>{formatCurrency(row.payment)}</TableCell>
                          <TableCell>{formatCurrency(row.principal)}</TableCell>
                          <TableCell>{formatCurrency(row.interest)}</TableCell>
                          <TableCell>{formatCurrency(row.extraPayment)}</TableCell>
                          <TableCell>{formatCurrency(row.balance)}</TableCell>
                        </TableRow>
                      ))}
                      {(amortizationSchedule?.length || 0) > 100 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-4">
                            {t("debt.showingFirstPeriods", { count: 100, total: amortizationSchedule?.length })}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/hooks/use-language"
import { useCurrency } from "@/hooks/use-currency"
import { addDebt, updateDebt } from "@/lib/db-debt"
import type { Debt } from "@/types/debt"

interface DebtFormGlobalProps {
  onSave: () => void
  onCancel: () => void
  editingDebt?: Debt | null
}

export function DebtFormGlobal({ onSave, onCancel, editingDebt }: DebtFormGlobalProps) {
  const { t } = useLanguage()
  const { formatCurrency } = useCurrency()
  const [name, setName] = useState(editingDebt?.name || "")
  const [description, setDescription] = useState(editingDebt?.description || "")
  const [amount, setAmount] = useState(editingDebt?.amount?.toString() || "")
  const [interestRate, setInterestRate] = useState(editingDebt?.interestRate?.toString() || "")
  const [minimumPayment, setMinimumPayment] = useState(editingDebt?.minimumPayment?.toString() || "")
  const [dueDate, setDueDate] = useState(editingDebt?.dueDate || "")
  const [type, setType] = useState(editingDebt?.type || "creditCard")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t("debt.nameRequired")
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = t("debt.validAmount")
    }

    if (interestRate && (isNaN(Number(interestRate)) || Number(interestRate) < 0)) {
      newErrors.interestRate = t("debt.validInterest")
    }

    if (minimumPayment && (isNaN(Number(minimumPayment)) || Number(minimumPayment) < 0)) {
      newErrors.minimumPayment = t("debt.validPayment")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const debtData = {
        name,
        description,
        amount: Number(amount),
        interestRate: interestRate ? Number(interestRate) : undefined,
        minimumPayment: minimumPayment ? Number(minimumPayment) : 0,
        dueDate: dueDate || undefined,
        type,
      }

      if (editingDebt) {
        await updateDebt("global", editingDebt.id, debtData)
      } else {
        await addDebt("global", debtData)
      }

      onSave()
    } catch (error) {
      console.error("Error al guardar la deuda:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-sm border-0 sm:border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{editingDebt ? t("debt.edit") : t("debt.addNew")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t("debt.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("debt.namePlaceholder")}
              className={`${errors.name ? "border-red-500" : ""} h-10 rounded-lg`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("common.notes")}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("debt.notesPlaceholder")}
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              {t("debt.type")}
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder={t("debt.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creditCard">{t("debt.types.credit_card")}</SelectItem>
                <SelectItem value="loan">{t("debt.types.loan")}</SelectItem>
                <SelectItem value="mortgage">{t("debt.types.mortgage")}</SelectItem>
                <SelectItem value="other">{t("debt.types.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              {t("debt.amount")}
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`${errors.amount ? "border-red-500" : ""} h-10 rounded-lg`}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-sm font-medium">
              {t("debt.interestRate")}
            </Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="0.00"
              className={`${errors.interestRate ? "border-red-500" : ""} h-10 rounded-lg`}
            />
            {errors.interestRate && <p className="text-sm text-red-500">{errors.interestRate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPayment" className="text-sm font-medium">
              {t("debt.minimumPayment")}
            </Label>
            <Input
              id="minimumPayment"
              type="number"
              step="0.01"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              placeholder="0.00"
              className={`${errors.minimumPayment ? "border-red-500" : ""} h-10 rounded-lg`}
            />
            {errors.minimumPayment && <p className="text-sm text-red-500">{errors.minimumPayment}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              {t("debt.paymentDate")}
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-10 rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-10 rounded-lg">
              {isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default DebtFormGlobal

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"
import debtDB from "@/lib/db-debt"
import type { Debt } from "@/types/debt"
import db from "@/lib/db"
import { useCurrency } from "@/hooks/use-currency"

interface DebtFormGlobalProps {
  onSave: () => void
  onCancel: () => void
  editingDebt?: Debt | null
  budgetId?: string
}

export function DebtFormGlobal({ onSave, onCancel, editingDebt = null, budgetId }: DebtFormGlobalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { currency } = useCurrency()
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<string>("creditCard")
  const [interestRate, setInterestRate] = useState("")
  const [minimumPayment, setMinimumPayment] = useState("")
  const [notes, setNotes] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [paymentDate, setPaymentDate] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (editingDebt) {
      setName(editingDebt.name)
      setAmount(editingDebt.amount.toString())
      setType(editingDebt.type)
      setInterestRate(editingDebt.interestRate?.toString() || "")
      setMinimumPayment(editingDebt.minimumPayment?.toString() || "")
      setNotes(editingDebt.notes || "")
      setIsRecurring(editingDebt.isRecurring || false)
      setPaymentDate(editingDebt.paymentDate || "")
      setStartDate(editingDebt.startDate || "")
      setEndDate(editingDebt.endDate || "")
    }
  }, [editingDebt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: t("common.error"),
        description: t("debt.nameRequired"),
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: t("common.error"),
        description: t("debt.amountInvalid"),
        variant: "destructive",
      })
      return
    }

    try {
      const debtData: Omit<Debt, "id"> = {
        name: name.trim(),
        amount: Number(amount),
        type,
        interestRate: interestRate ? Number(interestRate) : 0,
        minimumPayment: minimumPayment ? Number(minimumPayment) : 0,
        notes: notes.trim(),
        isRecurring,
        paymentDate: paymentDate || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        createdAt: editingDebt?.createdAt || Date.now(),
        updatedAt: Date.now(),
      }

      if (editingDebt) {
        // Actualizar deuda existente
        debtDB.updateDebt(budgetId || "global", editingDebt.id, debtData)
      } else {
        // Crear nueva deuda
        const newDebt = debtDB.addDebt(budgetId || "global", debtData)

        // Si estamos en un presupuesto específico, asociar la deuda con ese presupuesto
        if (budgetId) {
          const budget = db.getBudget(budgetId)
          const associatedDebtIds = budget?.associatedDebtIds || []

          if (!associatedDebtIds.includes(newDebt.id)) {
            db.updateBudget(budgetId, {
              associatedDebtIds: [...associatedDebtIds, newDebt.id],
            })
          }
        }
      }

      onSave()
    } catch (error) {
      console.error("Error al guardar deuda:", error)
      toast({
        title: t("common.error"),
        description: t("debt.saveError"),
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target

    if (name === "name") {
      setName(value)
    } else if (name === "amount") {
      setAmount(value)
    } else if (name === "interestRate") {
      setInterestRate(value)
    } else if (name === "minimumPayment") {
      setMinimumPayment(value)
    } else if (name === "notes") {
      setNotes(value)
    } else if (name === "isRecurring") {
      setIsRecurring(checked)
    } else if (name === "paymentDate") {
      setPaymentDate(value)
    } else if (name === "startDate") {
      setStartDate(value)
    } else if (name === "endDate") {
      setEndDate(value)
    }
  }

  const debt = {
    name,
    amount,
    interestRate,
    minimumPayment,
    notes,
    isRecurring,
    paymentDate,
    startDate,
    endDate,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("debt.name")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("debt.namePlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">{t("debt.amount")}</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {currency}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t("debt.type")}</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue placeholder={t("debt.selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creditCard">{t("debt.types.credit_card")}</SelectItem>
              <SelectItem value="loan">{t("debt.types.loan")}</SelectItem>
              <SelectItem value="mortgage">{t("debt.types.mortgage")}</SelectItem>
              <SelectItem value="personal">{t("debt.types.personal")}</SelectItem>
              <SelectItem value="other">{t("debt.types.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interestRate">{t("debt.interestRate")}</Label>
          <Input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumPayment">{t("debt.minimumPayment")} *</Label>
          <div className="relative">
            <Input
              id="minimumPayment"
              name="minimumPayment"
              type="number"
              step="0.01"
              min="0"
              required
              value={debt.minimumPayment}
              onChange={handleChange}
              className="w-full pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {currency}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{t("debt.minimumPaymentDescription")}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
        <Label htmlFor="isRecurring">{t("debt.isRecurring")}</Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="paymentDate">{t("debt.paymentDate")}</Label>
          <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{t("debt.startDate")}</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t("debt.endDate")}</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("debt.notesPlaceholder")}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit">{editingDebt ? t("actions.update") : t("actions.save")}</Button>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DebtItem } from "@/types/debt"
import { useTranslation } from "@/hooks/use-translations"

interface DebtFormProps {
  budgetId: string
  onSubmit: (debt: Omit<DebtItem, "id">) => void
  onCancel?: () => void
  initialData?: Partial<DebtItem>
}

export function DebtForm({ budgetId, onSubmit, onCancel, initialData }: DebtFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [interestRate, setInterestRate] = useState(initialData?.interestRate?.toString() || "")
  const [minimumPayment, setMinimumPayment] = useState(initialData?.minimumPayment?.toString() || "")
  const [type, setType] = useState<DebtItem["type"]>(initialData?.type || "other")
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : new Date(),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  )
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    initialData?.paymentDate ? new Date(initialData.paymentDate) : undefined,
  )
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false)

  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const debtData: Omit<DebtItem, "id"> = {
      name: name.trim(),
      amount: Number(amount),
      interestRate: Number(interestRate),
      minimumPayment: Number(minimumPayment),
      type,
      startDate: startDate?.toISOString() || new Date().toISOString(),
      endDate: endDate?.toISOString(),
      paymentDate: paymentDate?.toISOString(),
      notes: notes || undefined,
      isRecurring,
    }

    onSubmit(debtData)
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
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">$</span>
            </div>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="pl-7"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">{t("debt.interestRate")}</Label>
          <div className="relative">
            <Input
              id="interestRate"
              type="number"
              min="0"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="0.00"
              className="pr-7"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimumPayment">{t("debt.minimumPayment")}</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">$</span>
            </div>
            <Input
              id="minimumPayment"
              type="number"
              min="0"
              step="0.01"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(e.target.value)}
              placeholder="0.00"
              className="pl-7"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t("debt.type")}</Label>
          <Select value={type} onValueChange={(value: DebtItem["type"]) => setType(value)}>
            <SelectTrigger id="type">
              <SelectValue placeholder={t("debt.selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">{t("debt.types.creditCard")}</SelectItem>
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
          <Label htmlFor="startDate">{t("debt.startDate")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: es }) : t("common.selectDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={es} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">{t("debt.endDate")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: es }) : t("common.selectDate")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={es} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="isRecurring" className="cursor-pointer">
            {t("debt.recurring")}
          </Label>
          <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
        </div>

        {isRecurring && (
          <div className="pt-2">
            <Label htmlFor="paymentDate">{t("debt.paymentDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="paymentDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !paymentDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: es }) : t("common.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus locale={es} />
              </PopoverContent>
            </Popover>
          </div>
        )}
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

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("actions.cancel")}
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            !name.trim() ||
            !amount ||
            isNaN(Number(amount)) ||
            Number(amount) <= 0 ||
            isNaN(Number(interestRate)) ||
            isNaN(Number(minimumPayment))
          }
        >
          {initialData?.id ? t("actions.update") : t("actions.save")}
        </Button>
      </div>
    </form>
  )
}

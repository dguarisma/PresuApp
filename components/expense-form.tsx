"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Tag, Plus, X, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { RecurringExpenseForm } from "@/components/recurring-expense-form"
import { ReceiptUploader } from "@/components/receipt-uploader"
import type { ExpenseItem } from "@/types/expense"
import db from "@/lib/db"
import { useCurrency } from "@/hooks/use-currency"
import { useTranslation } from "@/hooks/use-translations"

interface ExpenseFormProps {
  categoryId: string // Cambiado de number a string para UUID
  subCategoryId?: string // Cambiado de number a string para UUID
  onSubmit: (expense: Omit<ExpenseItem, "id">) => void
  onCancel?: () => void
  initialData?: Partial<ExpenseItem>
}

export function ExpenseForm({ categoryId, subCategoryId, onSubmit, onCancel, initialData }: ExpenseFormProps) {
  const { t } = useTranslation()

  const [name, setName] = useState(initialData?.name || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date())
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(initialData?.receiptUrl)
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false)
  const [recurringConfig, setRecurringConfig] = useState(initialData?.recurringConfig)

  // Cargar etiquetas disponibles
  useEffect(() => {
    setAvailableTags(db.getAllTags())
  }, [])

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")

      // Añadir a etiquetas globales si no existe
      if (!availableTags.includes(newTag.trim())) {
        db.addTag(newTag.trim())
        setAvailableTags([...availableTags, newTag.trim()])
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSelectTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const expenseData: Omit<ExpenseItem, "id"> = {
      name,
      amount: Number.parseFloat(amount),
      date: date?.toISOString() || new Date().toISOString(),
      tags,
      notes: notes || undefined,
      receiptUrl: receiptUrl || undefined,
      isRecurring,
      recurringConfig: isRecurring ? recurringConfig : undefined,
    }

    onSubmit(expenseData)
  }

  const handleRecurringSubmit = (data: Partial<ExpenseItem>) => {
    setName(data.name || "")
    setAmount(data.amount?.toString() || "")
    setIsRecurring(true)
    setRecurringConfig(data.recurringConfig)
  }

  const handleReceiptUpload = (file: File, dataUrl: string) => {
    // En una aplicación real, aquí subiríamos el archivo a un servidor
    // y obtendríamos una URL permanente. Para este ejemplo, usamos el dataUrl
    setReceiptUrl(dataUrl)
  }

  const handleExtractedData = (data: {
    name: string
    amount: number
    date: string
    notes?: string
  }) => {
    setName(data.name)
    setAmount(data.amount.toString())
    setDate(new Date(data.date))
    if (data.notes) {
      setNotes(data.notes)
    }
  }

  const { currency } = useCurrency()

  if (isRecurring && !recurringConfig) {
    return (
      <RecurringExpenseForm
        onSubmit={handleRecurringSubmit}
        initialData={{ name, amount: amount ? Number.parseFloat(amount) : undefined }}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("expense_name")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("expense_name_placeholder")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("amount")}</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground">{currency}</span>
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
        <Label htmlFor="date">{t("date")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : t("select_date")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t("tags")}</Label>
        <div className="flex space-x-2">
          <Input
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={t("add_tag")}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="px-3 py-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {availableTags.length > 0 && (
          <div className="mt-2">
            <Label className="text-sm">{t("available_tags")}</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availableTags
                .filter((tag) => !tags.includes(tag))
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handleSelectTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notes_placeholder")}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring" className="cursor-pointer">
            {t("recurring_expense")}
          </Label>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => {
              setIsRecurring(checked)
              if (checked && !recurringConfig) {
                setRecurringConfig({
                  frequency: "monthly",
                  interval: 1,
                })
              }
            }}
          />
        </div>

        {isRecurring && recurringConfig && (
          <div className="p-3 bg-muted/30 rounded-md">
            <p className="text-sm">
              <RefreshCw className="h-3.5 w-3.5 inline mr-1" />
              {recurringConfig.frequency === "daily" && t("every_n_days", { count: recurringConfig.interval })}
              {recurringConfig.frequency === "weekly" && t("every_n_weeks", { count: recurringConfig.interval })}
              {recurringConfig.frequency === "monthly" && t("every_n_months", { count: recurringConfig.interval })}
              {recurringConfig.frequency === "yearly" && t("every_n_years", { count: recurringConfig.interval })}
              {recurringConfig.endDate &&
                ` ${t("until")} ${format(new Date(recurringConfig.endDate), "PPP", { locale: es })}`}
            </p>
          </div>
        )}
      </div>

      <ReceiptUploader onUpload={handleReceiptUpload} initialUrl={receiptUrl} onExtractedData={handleExtractedData} />

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!name.trim() || !amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0}
        >
          {initialData?.id ? t("update") : t("save")} {t("expense").toLowerCase()}
        </Button>
      </div>
    </form>
  )
}

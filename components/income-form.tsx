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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Tag, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IncomeItem, IncomeSource } from "@/types/income"
import type { RecurringConfig } from "@/types/expense"
import db from "@/lib/db"
import incomeDB from "@/lib/db-income"
import { useTranslation } from "@/hooks/use-translations"
import { toast } from "@/components/ui/use-toast"

interface IncomeFormProps {
  budgetId: string
  onSubmit: (income: Omit<IncomeItem, "id">) => void
  onCancel?: () => void
  initialData?: Partial<IncomeItem>
}

export function IncomeForm({ budgetId, onSubmit, onCancel, initialData }: IncomeFormProps) {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [sourceId, setSourceId] = useState(initialData?.sourceId || "")
  const [newSourceName, setNewSourceName] = useState("")
  const [showNewSourceInput, setShowNewSourceInput] = useState(false)
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date())
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(initialData?.attachmentUrl)
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false)
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig | undefined>(initialData?.recurringConfig)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    initialData?.recurringConfig?.frequency || "monthly",
  )
  const [interval, setInterval] = useState(initialData?.recurringConfig?.interval?.toString() || "1")
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.recurringConfig?.endDate ? new Date(initialData.recurringConfig.endDate) : undefined,
  )

  const { t } = useTranslation()

  // Cargar fuentes de ingresos y etiquetas disponibles
  useEffect(() => {
    const incomeData = incomeDB.getIncomeData(budgetId)
    setSources(incomeData.sources)
    setAvailableTags(db.getAllTags())
  }, [budgetId])

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

  const handleAddSource = () => {
    if (newSourceName.trim()) {
      const newSource = incomeDB.addIncomeSource(budgetId, newSourceName.trim())
      setSources([...sources, newSource])
      setSourceId(newSource.id)
      setNewSourceName("")
      setShowNewSourceInput(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Si no hay fuente seleccionada y hay un nombre para nueva fuente, crearla
    let finalSourceId = sourceId
    let sourceName = ""

    if (!finalSourceId && newSourceName.trim()) {
      const newSource = incomeDB.addIncomeSource(budgetId, newSourceName.trim())
      finalSourceId = newSource.id
      sourceName = newSource.name
      setSources([...sources, newSource])
    } else if (finalSourceId) {
      const source = sources.find((s) => s.id === finalSourceId)
      sourceName = source ? source.name : ""
    }

    // Configurar recurrencia si está habilitada
    let finalRecurringConfig: RecurringConfig | undefined
    if (isRecurring) {
      finalRecurringConfig = {
        frequency,
        interval: Number.parseInt(interval) || 1,
        endDate: endDate?.toISOString(),
      }
    }

    const incomeData: Omit<IncomeItem, "id"> = {
      sourceId: finalSourceId,
      sourceName,
      amount: Number.parseFloat(amount),
      date: date?.toISOString() || new Date().toISOString(),
      tags,
      notes: notes || undefined,
      attachmentUrl: attachmentUrl || undefined,
      isRecurring,
      recurringConfig: finalRecurringConfig,
    }

    onSubmit(incomeData)

    toast({
      title: t("income.added") || "Income added",
      description: t("income.addSuccess") || "Income has been added successfully",
      variant: "default",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source">{t("income.source")}</Label>
        {!showNewSourceInput ? (
          <div className="flex space-x-2">
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger id="source" className="flex-1">
                <SelectValue placeholder={t("income.selectSource")} />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={() => setShowNewSourceInput(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t("income.newSource")}
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder={t("income.sourceName")}
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSource} disabled={!newSourceName.trim()}>
              {t("actions.add")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowNewSourceInput(false)}>
              {t("actions.cancel")}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("income.amount")}</Label>
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
        <Label htmlFor="date">{t("common.date")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : t("common.selectDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring" className="cursor-pointer">
            {t("income.recurring")}
          </Label>
          <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
        </div>

        {isRecurring && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">{t("common.frequency")}</Label>
                <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder={t("common.selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("frequency.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("frequency.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("frequency.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("frequency.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">{t("common.every")}</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-20"
                    required
                  />
                  <span className="text-muted-foreground">
                    {frequency === "daily" && t("period.days")}
                    {frequency === "weekly" && t("period.weeks")}
                    {frequency === "monthly" && t("period.months")}
                    {frequency === "yearly" && t("period.years")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t("common.endDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
              {endDate && (
                <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setEndDate(undefined)}>
                  {t("actions.removeEndDate")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t("common.tags")}</Label>
        <div className="flex space-x-2">
          <Input
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={t("common.addTag")}
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
            <Label className="text-sm">{t("common.availableTags")}</Label>
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
        <Label htmlFor="notes">{t("common.notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("income.notesPlaceholder")}
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
            !amount ||
            isNaN(Number.parseFloat(amount)) ||
            Number.parseFloat(amount) <= 0 ||
            (!sourceId && !newSourceName.trim())
          }
        >
          {initialData?.id ? t("actions.update") : t("actions.save")}
        </Button>
      </div>
    </form>
  )
}

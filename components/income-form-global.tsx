"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IncomeItem, IncomeSource } from "@/types/income"
import incomeDB from "@/lib/db-income"
import { useTranslation } from "@/hooks/use-translations"
import { GLOBAL_INCOME_ID } from "@/components/income-manager-global"

interface IncomeFormProps {
  initialData?: IncomeItem
  onSubmit: (data: Omit<IncomeItem, "id">) => void
  onCancel: () => void
}

export function IncomeFormGlobal({ initialData, onSubmit, onCancel }: IncomeFormProps) {
  const { t } = useTranslation()
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialData?.sourceId || "")
  const [newSourceName, setNewSourceName] = useState("")
  const [showNewSourceInput, setShowNewSourceInput] = useState(false)
  const [amount, setAmount] = useState(initialData?.amount.toString() || "")
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date())
  const [notes, setNotes] = useState(initialData?.notes || "")
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false)
  const [recurringFrequency, setRecurringFrequency] = useState(initialData?.recurringConfig?.frequency || "monthly")
  const [recurringInterval, setRecurringInterval] = useState(initialData?.recurringConfig?.interval.toString() || "1")
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(
    initialData?.recurringConfig?.endDate ? new Date(initialData.recurringConfig.endDate) : undefined,
  )
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState("")

  // Cargar fuentes de ingresos
  useEffect(() => {
    const incomeData = incomeDB.getIncomeData(GLOBAL_INCOME_ID)
    setSources(incomeData.sources)
  }, [])

  const handleAddSource = () => {
    if (newSourceName.trim()) {
      const newSource = incomeDB.addIncomeSource(GLOBAL_INCOME_ID, newSourceName)
      setSources((prev) => [...prev, newSource])
      setSelectedSourceId(newSource.id)
      setNewSourceName("")
      setShowNewSourceInput(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!selectedSourceId || !amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return
    }

    const selectedSource = sources.find((source) => source.id === selectedSourceId)

    const incomeData: Omit<IncomeItem, "id"> = {
      sourceId: selectedSourceId,
      sourceName: selectedSource?.name || "",
      amount: Number.parseFloat(amount),
      date: date.toISOString(),
      notes,
      isRecurring,
      recurringConfig: isRecurring
        ? {
            frequency: recurringFrequency as "daily" | "weekly" | "monthly" | "yearly",
            interval: Number.parseInt(recurringInterval) || 1,
            endDate: recurringEndDate?.toISOString(),
          }
        : undefined,
      tags,
    }

    onSubmit(incomeData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="source">{t("income.source")}</Label>
        {showNewSourceInput ? (
          <div className="flex gap-2">
            <Input
              id="newSource"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder={t("income.newSourcePlaceholder")}
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSource} disabled={!newSourceName.trim()}>
              {t("actions.add")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowNewSourceInput(false)
                setNewSourceName("")
              }}
            >
              {t("actions.cancel")}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
              <SelectTrigger className="flex-1">
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
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t("income.amount")}</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">{t("income.date")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : <span>{t("common.selectDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring">{t("income.recurring")}</Label>
          <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
        </div>
        {isRecurring && (
          <div className="pl-4 border-l-2 border-muted space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">{t("income.frequency")}</Label>
                <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="interval">{t("income.interval")}</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  value={recurringInterval}
                  onChange={(e) => setRecurringInterval(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("income.endDate")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !recurringEndDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurringEndDate ? (
                      format(recurringEndDate, "PPP", { locale: es })
                    ) : (
                      <span>{t("income.noEndDate")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-2 border-b">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setRecurringEndDate(undefined)}
                    >
                      {t("income.noEndDate")}
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={recurringEndDate}
                    onSelect={(date) => setRecurringEndDate(date)}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
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

      <div className="space-y-2">
        <Label>{t("common.tags")}</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">
                  {t("actions.remove")} {tag}
                </span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={t("common.addTag")}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddTag} disabled={!newTag.trim()}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">{t("actions.add")}</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit">{initialData ? t("actions.update") : t("actions.save")}</Button>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Target, Bookmark, DollarSign } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import type { SavingsGoal } from "@/types/savings-goal"
import { createSavingsGoal, updateSavingsGoal } from "@/lib/savings-goals"
import { useTranslation } from "@/contexts/translation-context"
import { useToast } from "@/hooks/use-toast"
import db from "@/lib/db"

interface SavingsGoalFormProps {
  budgetId?: string
  goalToEdit?: SavingsGoal | null
  onSuccess: () => void
  onCancel: () => void
}

export function SavingsGoalForm({ budgetId, goalToEdit, onSuccess, onCancel }: SavingsGoalFormProps) {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [targetDate, setTargetDate] = useState<Date>(new Date())
  const [category, setCategory] = useState("")
  const [color, setColor] = useState("#4f46e5") // Default color

  // Load categories
  useEffect(() => {
    if (budgetId) {
      try {
        const budgetData = db.getBudgetData(budgetId)
        const categoriesList = budgetData.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }))
        setCategories(categoriesList)
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
  }, [budgetId])

  // Load goal data if editing
  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name)
      setDescription(goalToEdit.description || "")
      setTargetAmount(goalToEdit.targetAmount.toString())
      setCurrentAmount(goalToEdit.currentAmount.toString())
      setStartDate(new Date(goalToEdit.startDate))
      setTargetDate(new Date(goalToEdit.targetDate))
      setCategory(goalToEdit.category || "")
      setColor(goalToEdit.color || "#4f46e5")
    } else {
      // Set default start date to today and target date to 3 months from now
      const today = new Date()
      const threeMonthsLater = new Date()
      threeMonthsLater.setMonth(today.getMonth() + 3)
      setStartDate(today)
      setTargetDate(threeMonthsLater)
    }
  }, [goalToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!name.trim()) {
        throw new Error(t("savingsGoals.nameRequired"))
      }

      // Fix: Ensure proper parsing of numeric values
      const targetAmountValue = Number.parseFloat(targetAmount)
      if (isNaN(targetAmountValue) || targetAmountValue <= 0) {
        throw new Error(t("savingsGoals.invalidTargetAmount"))
      }

      // Fix: Handle empty current amount properly
      let currentAmountValue = 0
      if (currentAmount && currentAmount.trim() !== "") {
        currentAmountValue = Number.parseFloat(currentAmount)
        if (isNaN(currentAmountValue) || currentAmountValue < 0) {
          throw new Error(t("savingsGoals.invalidCurrentAmount"))
        }
      }

      // Fix: Ensure proper comparison of numeric values
      if (currentAmountValue > targetAmountValue) {
        throw new Error(t("savingsGoals.currentExceedsTarget"))
      }

      if (targetDate < startDate) {
        throw new Error(t("savingsGoals.targetDateBeforeStart"))
      }

      // Prepare goal data
      const goalData = {
        name: name.trim(),
        description: description.trim(),
        targetAmount: targetAmountValue,
        currentAmount: currentAmountValue,
        startDate: startDate.toISOString(),
        targetDate: targetDate.toISOString(),
        category: category || undefined,
        color: color,
        budgetId: budgetId,
      }

      // Create or update goal
      if (goalToEdit) {
        updateSavingsGoal(goalToEdit.id, goalData)
        toast({
          title: t("savingsGoals.goalUpdated"),
          description: t("savingsGoals.goalUpdatedDesc"),
        })
      } else {
        createSavingsGoal(goalData)
        toast({
          title: t("savingsGoals.goalCreated"),
          description: t("savingsGoals.goalCreatedDesc"),
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving goal:", error)
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("savingsGoals.saveError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get locale for date picker
  const getLocale = () => {
    return language === "es" ? es : enUS
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {t("savingsGoals.goalName")} <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Bookmark className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("savingsGoals.goalNamePlaceholder")}
            className="pl-10 h-10 text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {t("savingsGoals.description")}
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("savingsGoals.descriptionPlaceholder")}
          rows={2}
          className="min-h-[60px] text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="targetAmount" className="text-sm font-medium">
            {t("savingsGoals.targetAmount")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0.00"
              className="pl-10 h-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount" className="text-sm font-medium">
            {t("savingsGoals.currentAmount")}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              className="pl-10 h-10 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium">
            {t("savingsGoals.startDate")} <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-10 text-sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                {startDate ? (
                  format(startDate, "PPP", { locale: getLocale() })
                ) : (
                  <span>{t("savingsGoals.selectDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
                locale={getLocale()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate" className="text-sm font-medium">
            {t("savingsGoals.targetDate")} <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="targetDate"
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-10 text-sm"
              >
                <Target className="mr-2 h-4 w-4 text-gray-500" />
                {targetDate ? (
                  format(targetDate, "PPP", { locale: getLocale() })
                ) : (
                  <span>{t("savingsGoals.selectDate")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={(date) => date && setTargetDate(date)}
                initialFocus
                locale={getLocale()}
                disabled={(date) => date < startDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-medium">
          {t("savingsGoals.category")}
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category" className="h-10 text-sm">
            <SelectValue placeholder={t("savingsGoals.selectCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("savingsGoals.noCategory")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color" className="text-sm font-medium">
          {t("savingsGoals.color")}
        </Label>
        <div className="flex items-center space-x-3">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <div
            className="flex-1 h-10 rounded-md border border-input"
            style={{ backgroundColor: color }}
            aria-label={t("savingsGoals.selectedColor")}
          />
        </div>
      </div>

      <div className="flex justify-between pt-3 mt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 h-10 text-sm">
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-4 py-2 h-10 text-sm">
          {isSubmitting ? t("savingsGoals.saving") : goalToEdit ? t("savingsGoals.update") : t("savingsGoals.create")}
        </Button>
      </div>
    </form>
  )
}

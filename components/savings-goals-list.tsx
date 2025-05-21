"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Target, CheckCircle, SortAsc, SortDesc, Plus } from "lucide-react"
import type { SavingsGoal, SavingsGoalFilters } from "@/types/savings-goal"
import { SavingsGoalCard } from "@/components/savings-goal-card"
import { SavingsGoalForm } from "@/components/savings-goal-form"
import { getAllSavingsGoals, getSavingsGoalsByBudget } from "@/lib/savings-goals"
import { useTranslation } from "@/contexts/translation-context"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCurrency } from "@/hooks/use-currency"
import { SwipeableItem } from "@/components/swipeable-item"

interface SavingsGoalsListProps {
  budgetId?: string
}

export function SavingsGoalsList({ budgetId }: SavingsGoalsListProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrency()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [filteredGoals, setFilteredGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null)
  const [filters, setFilters] = useState<SavingsGoalFilters>({
    showCompleted: true,
    sortBy: "targetDate",
    sortOrder: "asc",
  })

  // Load goals
  const loadGoals = () => {
    try {
      const loadedGoals = budgetId ? getSavingsGoalsByBudget(budgetId) : getAllSavingsGoals()
      setGoals(loadedGoals)
    } catch (error) {
      console.error("Error loading savings goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [budgetId])

  // Apply filters and search
  useEffect(() => {
    let result = [...goals]

    // Filter by completion status
    if (!filters.showCompleted) {
      result = result.filter((goal) => !goal.isCompleted)
    }

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (goal) =>
          goal.name.toLowerCase().includes(term) || (goal.description && goal.description.toLowerCase().includes(term)),
      )
    }

    // Sort results
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "targetDate":
          comparison = new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
          break
        case "progress":
          const progressA = (a.currentAmount / a.targetAmount) * 100
          const progressB = (b.currentAmount / b.targetAmount) * 100
          comparison = progressA - progressB
          break
        case "amount":
          comparison = a.targetAmount - b.targetAmount
          break
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredGoals(result)
  }, [goals, searchTerm, filters])

  const handleCreateGoal = () => {
    setGoalToEdit(null)
    setIsFormOpen(true)
  }

  const handleEditGoal = (goal: SavingsGoal) => {
    setGoalToEdit(goal)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    loadGoals()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const toggleSortOrder = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const getCompletedCount = () => {
    return goals.filter((goal) => goal.isCompleted).length
  }

  const getActiveCount = () => {
    return goals.filter((goal) => !goal.isCompleted).length
  }

  const getTotalSaved = () => {
    return goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  }

  const getTotalTarget = () => {
    return goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  }

  return (
    <div className="space-y-4 pb-28">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <h2 className="text-xl font-bold tracking-tight">{t("savingsGoals.title")}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{t("savingsGoals.description")}</p>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">{t("savingsGoals.activeGoals")}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold">{getActiveCount()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">{t("savingsGoals.totalSaved")}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold tabular-nums">{formatCurrency(getTotalSaved())}</div>
              <p className="text-xs text-muted-foreground">
                {t("savingsGoals.outOf")} <span className="tabular-nums">{formatCurrency(getTotalTarget())}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-base">{t("savingsGoals.completedGoals")}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold">{getCompletedCount()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col space-y-3">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("savingsGoals.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value as any }))}
            >
              <SelectTrigger className="w-full">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("savingsGoals.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{t("savingsGoals.sortByName")}</SelectItem>
                <SelectItem value="targetDate">{t("savingsGoals.sortByDate")}</SelectItem>
                <SelectItem value="progress">{t("savingsGoals.sortByProgress")}</SelectItem>
                <SelectItem value="amount">{t("savingsGoals.sortByAmount")}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleSortOrder} className="flex-shrink-0">
              {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              {t("savingsGoals.allGoals")} ({goals.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              <Target className="h-4 w-4 mr-1" />({getActiveCount()})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              <CheckCircle className="h-4 w-4 mr-1" />({getCompletedCount()})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : filteredGoals.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-base font-medium mb-2">{t("savingsGoals.noGoalsFound")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("savingsGoals.createYourFirstGoal")}</p>
                  <Button onClick={handleCreateGoal} className="bg-teal-500 hover:bg-teal-600 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("savingsGoals.createGoal")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 mt-3">
                {filteredGoals.map((goal) => (
                  <SwipeableItem key={goal.id} onEdit={() => handleEditGoal(goal)} editText={t("common.edit")}>
                    <SavingsGoalCard key={goal.id} goal={goal} onUpdate={loadGoals} onEdit={handleEditGoal} />
                  </SwipeableItem>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : filteredGoals.filter((goal) => !goal.isCompleted).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-base font-medium mb-2">{t("savingsGoals.noActiveGoals")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("savingsGoals.createActiveGoal")}</p>
                  <Button onClick={handleCreateGoal} className="bg-teal-500 hover:bg-teal-600 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("savingsGoals.createGoal")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 mt-3">
                {filteredGoals
                  .filter((goal) => !goal.isCompleted)
                  .map((goal) => (
                    <SwipeableItem key={goal.id} onEdit={() => handleEditGoal(goal)} editText={t("common.edit")}>
                      <SavingsGoalCard key={goal.id} goal={goal} onUpdate={loadGoals} onEdit={handleEditGoal} />
                    </SwipeableItem>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : filteredGoals.filter((goal) => goal.isCompleted).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-base font-medium mb-2">{t("savingsGoals.noCompletedGoals")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("savingsGoals.completeGoalsToSee")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 mt-3">
                {filteredGoals
                  .filter((goal) => goal.isCompleted)
                  .map((goal) => (
                    <SwipeableItem key={goal.id} onEdit={() => handleEditGoal(goal)} editText={t("common.edit")}>
                      <SavingsGoalCard key={goal.id} goal={goal} onUpdate={loadGoals} onEdit={handleEditGoal} />
                    </SwipeableItem>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleCreateGoal}
        className="fixed bottom-32 right-4 z-10 rounded-full w-14 h-14 shadow-lg bg-teal-500 hover:bg-teal-600 text-white"
        aria-label={t("savingsGoals.create")}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Sheet with improved scrolling */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 pt-6 flex flex-col">
          <div className="px-6">
            <SheetHeader className="mb-4">
              <SheetTitle>{goalToEdit ? t("savingsGoals.editGoal") : t("savingsGoals.createGoal")}</SheetTitle>
              <SheetDescription>
                {goalToEdit ? t("savingsGoals.editGoalDesc") : t("savingsGoals.createGoalDesc")}
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-8">
            <SavingsGoalForm
              budgetId={budgetId}
              goalToEdit={goalToEdit}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

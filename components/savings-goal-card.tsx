"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Trash2, PlusCircle, Calendar, Target, CheckCircle, AlertTriangle } from "lucide-react"
import type { SavingsGoal } from "@/types/savings-goal"
import { getSavingsGoalProgress, updateSavingsGoalProgress, deleteSavingsGoal } from "@/lib/savings-goals"
import { useTranslation } from "@/contexts/translation-context"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onUpdate: () => void
  onEdit: (goal: SavingsGoal) => void
}

export function SavingsGoalCard({ goal, onUpdate, onEdit }: SavingsGoalCardProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false)
  const [newAmount, setNewAmount] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const progress = getSavingsGoalProgress(goal)
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  const isCompleted = goal.isCompleted || progress >= 100

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getDaysRemaining = () => {
    const today = new Date()
    const targetDate = new Date(goal.targetDate)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()
  const isOverdue = daysRemaining < 0 && !isCompleted

  const handleAddProgress = () => {
    try {
      const amountValue = Number.parseFloat(newAmount)
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: t("savingsGoals.invalidAmount"),
          description: t("savingsGoals.enterPositiveAmount"),
          variant: "destructive",
        })
        return
      }

      const newTotal = goal.currentAmount + amountValue
      updateSavingsGoalProgress(goal.id, newTotal)

      toast({
        title: t("savingsGoals.progressUpdated"),
        description: t("savingsGoals.amountAdded", { amount: amountValue.toFixed(2) }),
      })

      setNewAmount("")
      setIsAddProgressOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Error al actualizar progreso:", error)
      toast({
        title: t("common.error"),
        description: t("savingsGoals.updateError"),
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const success = deleteSavingsGoal(goal.id)

      if (success) {
        toast({
          title: t("savingsGoals.goalDeleted"),
          description: t("savingsGoals.goalDeletedDesc"),
        })
        onUpdate()
      } else {
        throw new Error("Failed to delete")
      }
    } catch (error) {
      console.error("Error al eliminar meta:", error)
      toast({
        title: t("common.error"),
        description: t("savingsGoals.deleteError"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Determinar el color de la barra de progreso
  const getProgressColor = () => {
    if (isCompleted) return "bg-green-500"
    if (isOverdue) return "bg-red-500"
    if (progress > 75) return "bg-green-500"
    if (progress > 50) return "bg-blue-500"
    if (progress > 25) return "bg-yellow-500"
    return "bg-orange-500"
  }

  // Determinar el color de fondo de la tarjeta
  const getCardBackground = () => {
    if (isCompleted) return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
    if (isOverdue) return "bg-red-50/30 border-red-200 dark:bg-red-950/10 dark:border-red-900/50"
    return ""
  }

  return (
    <Card className={`w-full overflow-hidden ${getCardBackground()}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />}
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">{goal.name}</h3>
              {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
            </div>
          </div>
          <div className="flex space-x-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("savingsGoals.confirmDelete")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("savingsGoals.deleteWarning")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? t("common.deleting") : t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Target className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{t("savingsGoals.target")}: </span>
          </div>
          <span className="font-medium tabular-nums">{formatCurrency(goal.targetAmount)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{t("savingsGoals.targetDate")}: </span>
          </div>
          <span className="font-medium">{formatDate(goal.targetDate)}</span>
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("savingsGoals.timeRemaining")}: </span>
            <span className={`font-medium ${isOverdue ? "text-red-500" : ""}`}>
              {isOverdue
                ? t("savingsGoals.overdueDays", { days: Math.abs(daysRemaining) })
                : t("savingsGoals.daysRemaining", { days: daysRemaining })}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{t("savingsGoals.progress")}</span>
            <span className="tabular-nums">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-3" indicatorClassName={getProgressColor()} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium">{t("savingsGoals.saved")}</span>
          <span className="font-semibold tabular-nums">{formatCurrency(goal.currentAmount)}</span>
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("savingsGoals.remaining")}</span>
            <span className="font-semibold tabular-nums">{formatCurrency(remaining)}</span>
          </div>
        )}

        {isOverdue && !isCompleted && (
          <div className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-400">{t("savingsGoals.overdueWarning")}</span>
          </div>
        )}

        {isCompleted && (
          <div className="p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm text-green-600 dark:text-green-400">{t("savingsGoals.goalAchieved")}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-2">
        {!isCompleted && (
          <Sheet open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
            <SheetTrigger asChild>
              <Button className="w-full" variant="default">
                <PlusCircle className="h-4 w-4 mr-2" />
                {t("savingsGoals.addProgress")}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh]">
              <SheetHeader>
                <SheetTitle>{t("savingsGoals.addProgressTitle")}</SheetTitle>
                <SheetDescription>{t("savingsGoals.addProgressDesc")}</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t("savingsGoals.amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setIsAddProgressOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleAddProgress}>{t("savingsGoals.addAmount")}</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </CardFooter>
    </Card>
  )
}

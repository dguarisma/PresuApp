export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  startDate: string
  targetDate: string
  description?: string
  category?: string
  color?: string
  isCompleted: boolean
  budgetId?: string
}

export interface SavingsGoalFilters {
  showCompleted: boolean
  sortBy: "name" | "targetDate" | "progress" | "amount"
  sortOrder: "asc" | "desc"
}

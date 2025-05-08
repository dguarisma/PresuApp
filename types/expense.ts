export interface DateRange {
  startDate: string
  endDate: string
}

export interface RecurringConfig {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  endDate?: string
}

export interface ExpenseItem {
  id: string // Cambiado de number a string para UUID
  name: string
  amount: number
  date: string
  tags?: string[]
  notes?: string
  receiptUrl?: string
  isRecurring?: boolean
  recurringConfig?: RecurringConfig
  subCategoryId?: string // Cambiado de number a string para UUID
}

export interface SubCategory {
  id: string // Cambiado de number a string para UUID
  name: string
  items: ExpenseItem[]
}

export interface Category {
  id: string // Cambiado de number a string para UUID
  name: string
  items: ExpenseItem[]
  subCategories: SubCategory[]
}

export interface BudgetData {
  amount: number
  categories: Category[]
}

export interface Budget {
  id: string
  name: string
  createdAt: string
}

export interface FilterOptions {
  dateRange?: DateRange
  categories?: string[] // Cambiado de number[] a string[]
  tags?: string[]
  searchText?: string
  minAmount?: number
  maxAmount?: number
}

export interface ReportConfig {
  id: string
  name: string
  filters: FilterOptions
  groupBy: "day" | "week" | "month" | "category" | "tag"
  chartType: "bar" | "line" | "pie"
}

export interface PredictionConfig {
  months: number
  basedOn: "last3months" | "last6months" | "lastyear" | "average"
}

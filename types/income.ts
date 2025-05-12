import type { RecurringConfig } from "./expense"

export interface IncomeSource {
  id: string
  name: string
  color?: string
}

export interface IncomeItem {
  id: string
  sourceId: string
  sourceName: string
  amount: number
  date: string
  isRecurring?: boolean
  recurringConfig?: RecurringConfig
  notes?: string
  tags?: string[]
  attachmentUrl?: string
}

export interface IncomeData {
  sources: IncomeSource[]
  items: IncomeItem[]
}

export type Income = IncomeItem

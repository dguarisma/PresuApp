export interface DebtItem {
  id: string
  name: string
  amount: number
  type: string
  interestRate: number
  minimumPayment: number
  startDate?: string
  dueDate?: string
  notes?: string
  isRecurring?: boolean
}

export interface DebtData {
  items: DebtItem[]
}

export type Debt = DebtItem

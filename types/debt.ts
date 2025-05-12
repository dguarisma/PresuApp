export interface DebtItem {
  id: string
  name: string
  description: string
  amount: number
  interestRate?: number
  minimumPayment?: number
  dueDate?: string
  type: string
}

export interface DebtData {
  items: DebtItem[]
}

// Alias para compatibilidad con componentes existentes
export type Debt = DebtItem

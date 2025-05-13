import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCurrency(value: number, currencyCode = "USD", locale = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(value)
  } catch (error) {
    console.error("Error formatting currency:", error)
    return `$${value.toFixed(2)}`
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

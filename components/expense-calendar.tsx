"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ExpenseItem } from "@/types/expense"

interface ExpenseCalendarProps {
  expenses: ExpenseItem[]
}

export function ExpenseCalendar({ expenses }: ExpenseCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Obtener el primer día del mes y el último día del mes
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Obtener el día de la semana del primer día del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // Calcular días del mes anterior para completar la primera semana
  const daysFromPrevMonth = adjustedFirstDayOfWeek

  // Calcular total de días a mostrar (incluye días del mes anterior y siguiente)
  const totalDays = daysFromPrevMonth + lastDayOfMonth.getDate()
  const totalWeeks = Math.ceil(totalDays / 7)

  // Generar array de días para el calendario
  const calendarDays = []

  // Días del mes anterior
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
  const prevMonthDays = prevMonth.getDate()

  for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
    calendarDays.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i),
      isCurrentMonth: false,
    })
  }

  // Días del mes actual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      isCurrentMonth: true,
    })
  }

  // Días del mes siguiente
  const remainingDays = 7 * totalWeeks - calendarDays.length
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i),
      isCurrentMonth: false,
    })
  }

  // Agrupar gastos por fecha
  const expensesByDate = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.date)
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

      if (!acc[dateKey]) {
        acc[dateKey] = []
      }

      acc[dateKey].push(expense)
      return acc
    },
    {} as Record<string, ExpenseItem[]>,
  )

  // Calcular la intensidad de gastos para cada día
  const getExpenseIntensity = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const dayExpenses = expensesByDate[dateKey] || []

    if (dayExpenses.length === 0) return 0

    const totalAmount = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    // Escala logarítmica para la intensidad (1-10)
    return Math.min(10, Math.ceil(Math.log(totalAmount + 1) / Math.log(1.5)))
  }

  // Navegar al mes anterior
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Formatear nombre del mes
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("es", { month: "long", year: "numeric" })
  }

  // Formatear día de la semana
  const weekDays = ["lu", "ma", "mi", "ju", "vi", "sá", "do"]

  // Obtener gastos del día seleccionado
  const selectedDateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
  const selectedDateExpenses = expensesByDate[selectedDateKey] || []
  const totalExpensesAmount = selectedDateExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Formatear fecha seleccionada
  const formatSelectedDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    return date.toLocaleDateString("es", options)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Calendario de gastos</h2>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium capitalize">{formatMonth(currentDate)}</h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const intensity = getExpenseIntensity(day.date)
          const isSelected =
            selectedDate.getDate() === day.date.getDate() &&
            selectedDate.getMonth() === day.date.getMonth() &&
            selectedDate.getFullYear() === day.date.getFullYear()

          return (
            <Button
              key={index}
              variant="ghost"
              className={`h-10 p-0 ${!day.isCurrentMonth ? "text-muted-foreground opacity-50" : ""} ${isSelected ? "bg-primary/10 font-bold" : ""}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {day.date.getDate()}
                {intensity > 0 && (
                  <div
                    className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-500`}
                    style={{ opacity: intensity / 10 }}
                  />
                )}
              </div>
            </Button>
          )
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">{formatSelectedDate(selectedDate)}</h3>

          {selectedDateExpenses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Total: ${totalExpensesAmount.toFixed(2)}</p>

              {selectedDateExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                  <span className="font-medium">${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No hay gastos en esta fecha</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-background border mr-1"></div>
          <span>Pocos gastos</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-teal-500 mr-1"></div>
          <span>Muchos gastos</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExpenseItem } from "@/types/expense"

interface RecurringExpenseFormProps {
  onSubmit: (data: Partial<ExpenseItem>) => void
  initialData?: Partial<ExpenseItem>
}

export function RecurringExpenseForm({ onSubmit, initialData }: RecurringExpenseFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    initialData?.recurringConfig?.frequency || "monthly",
  )
  const [interval, setInterval] = useState(initialData?.recurringConfig?.interval?.toString() || "1")
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.recurringConfig?.endDate ? new Date(initialData.recurringConfig.endDate) : undefined,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const recurringConfig = {
      frequency,
      interval: Number.parseInt(interval) || 1,
      endDate: endDate?.toISOString(),
    }

    onSubmit({
      name,
      amount: Number.parseFloat(amount),
      isRecurring: true,
      recurringConfig,
      date: new Date().toISOString(), // Fecha inicial
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del gasto recurrente</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Suscripción Netflix"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-muted-foreground">$</span>
          </div>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-7"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frecuencia</Label>
          <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diaria</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Cada</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="interval"
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-20"
              required
            />
            <span className="text-muted-foreground">
              {frequency === "daily" && "día(s)"}
              {frequency === "weekly" && "semana(s)"}
              {frequency === "monthly" && "mes(es)"}
              {frequency === "yearly" && "año(s)"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Fecha de finalización (opcional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={es} />
          </PopoverContent>
        </Popover>
        {endDate && (
          <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setEndDate(undefined)}>
            Eliminar fecha de finalización
          </Button>
        )}
      </div>

      <Button type="submit" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Guardar gasto recurrente
      </Button>
    </form>
  )
}

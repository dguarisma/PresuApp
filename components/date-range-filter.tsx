"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { DateRange } from "@/types/expense"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangeFilterProps {
  onChange: (dateRange: DateRange) => void
  initialDateRange?: DateRange
}

export function DateRangeFilter({ onChange, initialDateRange }: DateRangeFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (initialDateRange) return initialDateRange

    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    }
  })

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // Convertir strings ISO a objetos Date para el calendario
  const startDate = dateRange.startDate ? new Date(dateRange.startDate) : undefined
  const endDate = dateRange.endDate ? new Date(dateRange.endDate) : undefined

  useEffect(() => {
    onChange(dateRange)
  }, [dateRange, onChange])

  const handlePresetChange = (value: string) => {
    const today = new Date()
    let start: Date
    let end: Date = new Date(today)

    switch (value) {
      case "today":
        start = new Date(today)
        break
      case "yesterday":
        start = new Date(today)
        start.setDate(start.getDate() - 1)
        end = new Date(start)
        break
      case "thisWeek":
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay())
        break
      case "lastWeek":
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay() - 7)
        end = new Date(start)
        end.setDate(end.getDate() + 6)
        break
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case "thisQuarter":
        const quarter = Math.floor(today.getMonth() / 3)
        start = new Date(today.getFullYear(), quarter * 3, 1)
        end = new Date(today.getFullYear(), (quarter + 1) * 3, 0)
        break
      case "lastQuarter":
        const lastQuarter = Math.floor(today.getMonth() / 3) - 1
        const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear()
        const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter
        start = new Date(year, adjustedQuarter * 3, 1)
        end = new Date(year, (adjustedQuarter + 1) * 3, 0)
        break
      case "thisYear":
        start = new Date(today.getFullYear(), 0, 1)
        end = new Date(today.getFullYear(), 11, 31)
        break
      case "lastYear":
        start = new Date(today.getFullYear() - 1, 0, 1)
        end = new Date(today.getFullYear() - 1, 11, 31)
        break
      default:
        return
    }

    setDateRange({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="yesterday">Ayer</SelectItem>
          <SelectItem value="thisWeek">Esta semana</SelectItem>
          <SelectItem value="lastWeek">Semana pasada</SelectItem>
          <SelectItem value="thisMonth">Este mes</SelectItem>
          <SelectItem value="lastMonth">Mes pasado</SelectItem>
          <SelectItem value="thisQuarter">Este trimestre</SelectItem>
          <SelectItem value="lastQuarter">Trimestre pasado</SelectItem>
          <SelectItem value="thisYear">Este año</SelectItem>
          <SelectItem value="lastYear">Año pasado</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.startDate && dateRange.endDate ? (
              <span className="truncate">
                {format(new Date(dateRange.startDate), "dd/MM/yyyy", { locale: es })} -{" "}
                {format(new Date(dateRange.endDate), "dd/MM/yyyy", { locale: es })}
              </span>
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={startDate}
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({
                  startDate: range.from.toISOString(),
                  endDate: range.to.toISOString(),
                })
                setIsCalendarOpen(false)
              }
            }}
            numberOfMonths={1}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

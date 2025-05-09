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

// Importar el hook de traducción
import { useTranslation } from "@/hooks/use-translations"

interface DateRangeFilterProps {
  onChange: (dateRange: DateRange) => void
  initialDateRange?: DateRange
}

export function DateRangeFilter({ onChange, initialDateRange }: DateRangeFilterProps) {
  // Dentro del componente DateRangeFilter, añadir:
  const { t } = useTranslation()
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
          {/* Reemplazar "Seleccionar período" con: */}
          <SelectValue placeholder={t("dateRange.selectPeriod")} />
        </SelectTrigger>
        <SelectContent>
          {/* Reemplazar los nombres de los períodos predefinidos: */}
          <SelectItem value="today">{t("dateRange.today")}</SelectItem>
          <SelectItem value="yesterday">{t("dateRange.yesterday")}</SelectItem>
          <SelectItem value="thisWeek">{t("dateRange.thisWeek")}</SelectItem>
          <SelectItem value="lastWeek">{t("dateRange.lastWeek")}</SelectItem>
          <SelectItem value="thisMonth">{t("dateRange.thisMonth")}</SelectItem>
          <SelectItem value="lastMonth">{t("dateRange.lastMonth")}</SelectItem>
          <SelectItem value="thisQuarter">{t("dateRange.thisQuarter")}</SelectItem>
          <SelectItem value="lastQuarter">{t("dateRange.lastQuarter")}</SelectItem>
          <SelectItem value="thisYear">{t("dateRange.thisYear")}</SelectItem>
          <SelectItem value="lastYear">{t("dateRange.lastYear")}</SelectItem>
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
              // Reemplazar "Seleccionar fechas" con:
              <span>{t("dateRange.selectDates")}</span>
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

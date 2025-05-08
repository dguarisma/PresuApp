"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Tag, Calendar, DollarSign } from "lucide-react"
import type { ExpenseItem, FilterOptions, DateRange, Category } from "@/types/expense"
import db from "@/lib/db"

interface AdvancedSearchProps {
  budgetId: string
  categories: Category[]
  onSearchResults: (results: ExpenseItem[]) => void
}

export function AdvancedSearch({ budgetId, categories, onSearchResults }: AdvancedSearchProps) {
  const [searchText, setSearchText] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    }
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [results, setResults] = useState<ExpenseItem[]>([])

  useEffect(() => {
    setAvailableTags(db.getAllTags())
  }, [])

  const handleSearch = () => {
    const filters: FilterOptions = {
      searchText: searchText || undefined,
      dateRange,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      minAmount: minAmount ? Number.parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? Number.parseFloat(maxAmount) : undefined,
    }

    const searchResults = db.filterExpenses(budgetId, filters)
    setResults(searchResults)
    onSearchResults(searchResults)
  }

  const handleClearFilters = () => {
    setSearchText("")
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    setDateRange({
      startDate: firstDayOfMonth.toISOString(),
      endDate: lastDayOfMonth.toISOString(),
    })
    setSelectedCategories([])
    setSelectedTags([])
    setMinAmount("")
    setMaxAmount("")
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Búsqueda avanzada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar gastos por nombre o notas"
              className="pl-9"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rango de fechas
                </Label>
                <DateRangeFilter onChange={setDateRange} initialDateRange={dateRange} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Rango de montos
                </Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="Mínimo"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Máximo"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categorías</Label>
                <ScrollArea className="h-[150px] border rounded-md p-4">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`search-category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.id])
                            } else {
                              setSelectedCategories(selectedCategories.filter((id) => id !== category.id))
                            }
                          }}
                        />
                        <Label htmlFor={`search-category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Etiquetas
                </Label>
                <ScrollArea className="h-[150px] border rounded-md p-4">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay etiquetas disponibles.</p>
                    ) : (
                      availableTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm text-muted-foreground">
            {results.length} resultados encontrados por un total de $
            {results.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign } from "lucide-react"

interface BudgetFormProps {
  budget: number
  onBudgetChange: (budget: number) => void
}

export default function BudgetForm({ budget, onBudgetChange }: BudgetFormProps) {
  const [inputBudget, setInputBudget] = useState(budget.toString())
  const [isEditing, setIsEditing] = useState(budget === 0)

  useEffect(() => {
    setInputBudget(budget.toString())
  }, [budget])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newBudget = Number.parseFloat(inputBudget)
    if (!isNaN(newBudget) && newBudget >= 0) {
      onBudgetChange(newBudget)
      setIsEditing(false)
    }
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <DollarSign className="h-5 w-5 mr-1 text-primary" />
          Presupuesto
        </CardTitle>
        <CardDescription>Establece el monto total de tu presupuesto</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-base text-muted-foreground">$</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputBudget}
                  onChange={(e) => setInputBudget(e.target.value)}
                  placeholder="Ingresa tu presupuesto"
                  className="pl-8 text-base py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Guardar
              </Button>
              {budget > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setInputBudget(budget.toString())
                    setIsEditing(false)
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <span className="text-2xl font-bold">${budget.toFixed(2)}</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
              Editar Presupuesto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

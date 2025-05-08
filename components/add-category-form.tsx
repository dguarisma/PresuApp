"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderPlus } from "lucide-react"

interface AddCategoryFormProps {
  onAddCategory: (name: string) => void
}

export default function AddCategoryForm({ onAddCategory }: AddCategoryFormProps) {
  const [categoryName, setCategoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (categoryName.trim()) {
      setIsSubmitting(true)
      onAddCategory(categoryName.trim())
      setCategoryName("")
      setTimeout(() => setIsSubmitting(false), 300)
    }
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <FolderPlus className="h-5 w-5 mr-2 text-primary" />
          Categorías
        </CardTitle>
        <p className="text-sm text-muted-foreground">Crea categorías para organizar tus gastos</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Ejemplos: Comida, Servicios, Transporte</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={!categoryName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Agregando...
              </span>
            ) : (
              "Agregar Categoría"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, FolderPlus, Trash2, Plus, DollarSign } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Category, SubCategory } from "@/types/expense"
import db from "@/lib/db"

interface SubcategoryManagerProps {
  budgetId: string
  category: Category
  onUpdate: () => void
}

export function SubcategoryManager({ budgetId, category, onUpdate }: SubcategoryManagerProps) {
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemAmount, setNewItemAmount] = useState("")
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim()) {
      setIsSubmitting(true)
      try {
        db.addSubCategory(budgetId, category.id, newSubcategoryName.trim())
        setNewSubcategoryName("")
        onUpdate()
      } catch (error) {
        console.error("Error al añadir subcategoría:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDeleteSubcategory = (subCategoryId: string) => {
    try {
      db.deleteSubCategory(budgetId, category.id, subCategoryId)
      onUpdate()
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error)
    }
  }

  const handleAddItem = (subCategoryId: string) => {
    const amount = Number.parseFloat(newItemAmount)
    if (newItemName.trim() && !isNaN(amount) && amount > 0) {
      setIsSubmitting(true)
      try {
        db.addExpense(
          budgetId,
          category.id,
          {
            name: newItemName.trim(),
            amount,
            date: new Date().toISOString(),
            tags: [],
          },
          subCategoryId,
        )
        setNewItemName("")
        setNewItemAmount("")
        onUpdate()
      } catch (error) {
        console.error("Error al añadir gasto:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleDeleteItem = (subCategoryId: string, itemId: string) => {
    try {
      db.deleteExpense(budgetId, category.id, itemId, subCategoryId)
      onUpdate()
    } catch (error) {
      console.error("Error al eliminar gasto:", error)
    }
  }

  // Calcular el total de una subcategoría
  const getSubcategoryTotal = (subCategory: SubCategory) => {
    return subCategory.items.reduce((sum, item) => sum + item.amount, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          Subcategorías de {category.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            placeholder="Nombre de la subcategoría"
            disabled={isSubmitting}
          />
          <Button onClick={handleAddSubcategory} disabled={isSubmitting || !newSubcategoryName.trim()}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>

        {category.subCategories.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/30 border-dashed">
            <p className="text-muted-foreground">No hay subcategorías. Añade una para organizar mejor tus gastos.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {category.subCategories.map((subCategory) => (
              <AccordionItem key={subCategory.id} value={subCategory.id.toString()}>
                <AccordionTrigger className="hover:bg-muted/30 px-3 rounded-md">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{subCategory.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-muted-foreground">
                        {subCategory.items.length} gastos
                      </span>
                      <span className="font-medium">${getSubcategoryTotal(subCategory).toFixed(2)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Gastos en {subCategory.name}</h4>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar subcategoría
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta subcategoría?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará la subcategoría "{subCategory.name}" y
                              todos sus gastos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubcategory(subCategory.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="space-y-2">
                      {subCategory.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-muted-foreground/50 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-sm text-muted-foreground">No hay gastos en esta subcategoría.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {subCategory.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 px-3 border-b last:border-0 hover:bg-muted/30 rounded-md transition-colors"
                            >
                              <span className="font-medium truncate">{item.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium whitespace-nowrap">
                                  <DollarSign className="h-3.5 w-3.5 inline mr-0.5 text-muted-foreground" />
                                  {item.amount.toFixed(2)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(subCategory.id, item.id)}
                                  className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-full"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Eliminar item</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium mb-2">Añadir nuevo gasto</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Nombre del gasto"
                          className="flex-1"
                          disabled={isSubmitting}
                          onFocus={() => setActiveSubcategory(subCategory.id)}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              newItemName.trim() &&
                              newItemAmount &&
                              activeSubcategory === subCategory.id
                            ) {
                              e.preventDefault()
                              handleAddItem(subCategory.id)
                            }
                          }}
                        />
                        <div className="relative w-24">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-muted-foreground">$</span>
                          </div>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={newItemAmount}
                            onChange={(e) => setNewItemAmount(e.target.value)}
                            placeholder="0.00"
                            className="pl-7 w-full"
                            disabled={isSubmitting}
                            onFocus={() => setActiveSubcategory(subCategory.id)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                newItemName.trim() &&
                                newItemAmount &&
                                activeSubcategory === subCategory.id
                              ) {
                                e.preventDefault()
                                handleAddItem(subCategory.id)
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => handleAddItem(subCategory.id)}
                          disabled={
                            isSubmitting ||
                            !newItemName.trim() ||
                            !newItemAmount ||
                            activeSubcategory !== subCategory.id
                          }
                          size="icon"
                          className="h-10 w-10 rounded-full flex-shrink-0"
                        >
                          <Plus className="h-5 w-5" />
                          <span className="sr-only">Agregar gasto</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

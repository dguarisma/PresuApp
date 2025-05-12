"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Download, Upload, Database, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import fileStorageService from "@/services/file-storage-service"
import { useToast } from "@/hooks/use-toast"
import db from "@/lib/db-optimized"
import { format } from "date-fns"
import { useTranslations } from "@/hooks/use-translations"
import { useOptimizedBudgets } from "@/hooks/use-optimized-data"

export default function FileManagerOptimized() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const { data: budgets, isLoading, error, reload } = useOptimizedBudgets()
  const t = useTranslations()

  const handleExportAll = async () => {
    try {
      setIsExporting(true)
      await fileStorageService.exportAllData()
      toast({
        title: t.fileManager.exportSuccess,
        description: t.fileManager.exportAllSuccess,
      })
    } catch (error) {
      toast({
        title: t.fileManager.exportError,
        description: t.fileManager.exportErrorDesc,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportBudget = async (budgetId: string) => {
    try {
      setIsExporting(true)
      await fileStorageService.exportBudget(budgetId)
      toast({
        title: t.fileManager.exportSuccess,
        description: t.fileManager.exportBudgetSuccess,
      })
    } catch (error) {
      toast({
        title: t.fileManager.exportError,
        description: t.fileManager.exportErrorDesc,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const result = await fileStorageService.importData()

      if (result.success) {
        toast({
          title: t.fileManager.importSuccess,
          description: result.message,
        })
        // Recargar los datos en lugar de recargar la página
        reload()
      } else {
        toast({
          title: t.fileManager.importError,
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t.fileManager.importError,
        description: t.fileManager.importErrorDesc,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const exportBudgetToCSV = async (budgetId: string) => {
    try {
      const budget = db.getBudget(budgetId)
      if (!budget) return

      const budgetData = db.getBudgetData(budgetId)

      // Recopilar todos los gastos
      const expenses: any[] = []

      budgetData.categories.forEach((category) => {
        // Gastos de la categoría
        category.items.forEach((item) => {
          expenses.push({
            ...item,
            categoryName: category.name,
            subCategoryName: "",
          })
        })

        // Gastos de subcategorías
        category.subCategories.forEach((subCategory) => {
          subCategory.items.forEach((item) => {
            expenses.push({
              ...item,
              categoryName: category.name,
              subCategoryName: subCategory.name,
            })
          })
        })
      })

      // Crear cabeceras CSV
      const headers = [
        t.fileManager.csvHeaders.name,
        t.fileManager.csvHeaders.amount,
        t.fileManager.csvHeaders.date,
        t.fileManager.csvHeaders.category,
        t.fileManager.csvHeaders.subCategory,
        t.fileManager.csvHeaders.tags,
        t.fileManager.csvHeaders.notes,
      ]

      // Crear filas de datos
      const rows = expenses.map((expense) => [
        expense.name,
        expense.amount,
        expense.date ? format(new Date(expense.date), "yyyy-MM-dd") : "",
        expense.categoryName,
        expense.subCategoryName,
        expense.tags ? expense.tags.join(", ") : "",
        expense.notes || "",
      ])

      // Añadir cabeceras al principio
      const csvData = [headers, ...rows]

      // Exportar a CSV
      await fileStorageService.createCSVFile(
        csvData,
        `presupuesto-${budget.name.replace(/\s+/g, "-").toLowerCase()}.csv`,
      )

      toast({
        title: t.fileManager.exportSuccess,
        description: t.fileManager.exportCSVSuccess,
      })
    } catch (error) {
      toast({
        title: t.fileManager.exportError,
        description: t.fileManager.exportCSVErrorDesc,
        variant: "destructive",
      })
    }
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </CardContent>
      </Card>
    )
  }

  // Mostrar error si ocurre
  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-destructive mb-4">{t.common.error}</p>
          <Button onClick={reload}>{t.common.retry}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{t.fileManager.title}</CardTitle>
        <CardDescription>{t.fileManager.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">{t.fileManager.export}</TabsTrigger>
            <TabsTrigger value="import">{t.fileManager.import}</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    {t.fileManager.exportAll}
                  </CardTitle>
                  <CardDescription>{t.fileManager.exportAllDesc}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleExportAll} disabled={isExporting} className="w-full">
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.fileManager.exporting}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t.fileManager.exportAllBtn}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {budgets && budgets.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileJson className="mr-2 h-5 w-5" />
                      {t.fileManager.exportBudget}
                    </CardTitle>
                    <CardDescription>{t.fileManager.exportBudgetDesc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {budgets.map((budget) => (
                        <div key={budget.id} className="flex justify-between items-center">
                          <span>{budget.name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportBudgetToCSV(budget.id)}
                              title={t.fileManager.exportCSV}
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportBudget(budget.id)}
                              title={t.fileManager.exportJSON}
                            >
                              <FileJson className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="import" className="pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  {t.fileManager.importData}
                </CardTitle>
                <CardDescription>{t.fileManager.importDesc}</CardDescription>
              </CardHeader>
              <CardFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={isImporting}>
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.fileManager.importing}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {t.fileManager.importBtn}
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.fileManager.importConfirmTitle}</AlertDialogTitle>
                      <AlertDialogDescription>{t.fileManager.importConfirmDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleImport}>{t.fileManager.importConfirm}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

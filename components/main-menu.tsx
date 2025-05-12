"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  PlusCircle,
  BarChart3,
  DollarSign,
  CreditCard,
  Settings,
  FileText,
  PiggyBank,
  Bell,
  Accessibility,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"
import { BudgetList } from "@/components/budget-list"

export function MainMenu() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [showBudgetList, setShowBudgetList] = useState(false)

  const handleNewBudget = () => {
    router.push("/budget/new")
  }

  const handleOpenBudget = () => {
    setShowBudgetList(true)
  }

  const handleCloseBudgetList = () => {
    setShowBudgetList(false)
  }

  const handleBudgetSelected = (budgetId: string) => {
    setShowBudgetList(false)
    router.push(`/budget/${budgetId}`)
  }

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-2"
          onClick={handleNewBudget}
        >
          <PlusCircle className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">{t("budget.new")}</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center justify-center gap-2 border-2"
          onClick={handleOpenBudget}
        >
          <BarChart3 className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium">{t("budget.open")}</span>
        </Button>
      </div>

      <h2 className="text-lg font-semibold mb-3">{t("menu.globalFeatures")}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/ingresos" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <DollarSign className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium text-center">{t("income.manage")}</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/deudas" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <CreditCard className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium text-center">{t("debt.manage")}</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/metas-ahorro" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <PiggyBank className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium text-center">{t("savingsGoals.title")}</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/alertas" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Bell className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium text-center">{t("notifications.title")}</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-3">{t("menu.settings")}</h2>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/configuracion" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6 text-gray-500" />
              <span className="text-sm font-medium text-center">{t("settings.title")}</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/accesibilidad" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Accessibility className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium text-center">{t("accessibility.title")}</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/archivos" passHref>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-indigo-500" />
              <span className="text-sm font-medium text-center">{t("files.manage")}</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {showBudgetList && <BudgetList onClose={handleCloseBudgetList} onBudgetSelected={handleBudgetSelected} />}
    </div>
  )
}

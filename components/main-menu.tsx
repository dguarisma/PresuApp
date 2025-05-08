"use client"
import { Button } from "@/components/ui/button"
import { Accessibility, Settings, Bell, Home } from "lucide-react"
import Link from "next/link"
import { BudgetNotifications } from "@/components/budget-notifications"
import { useLanguage } from "@/hooks/use-language"

interface MainMenuProps {
  budgetId?: string
  budgetName?: string
  totalBudget?: number
}

export function MainMenu({ budgetId, budgetName, totalBudget }: MainMenuProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <img src="/logo.png" alt="PresuApp Logo" className="h-12 w-12" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-center mb-6">PresuApp</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("menu.navigation")}</h3>
          <Button variant="outline" size="sm" asChild className="justify-start">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              <span>{t("menu.home")}</span>
            </Link>
          </Button>
        </div>

        {budgetId && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("menu.budgetOptions")}</h3>
            <div className="px-2 py-1">
              <h4 className="text-xs font-medium mb-2 flex items-center">
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                {t("menu.alerts")}
              </h4>
              <BudgetNotifications
                budgetId={budgetId}
                budgetName={budgetName || ""}
                totalBudget={totalBudget || 0}
                inMenu={true}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{t("menu.settings")}</h3>
          <Button variant="outline" size="sm" asChild className="justify-start">
            <Link href="/configuracion">
              <Accessibility className="h-4 w-4 mr-2" />
              <span>{t("menu.accessibility")}</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="justify-start">
            <Link href="/opciones">
              <Settings className="h-4 w-4 mr-2" />
              <span>{t("menu.appOptions")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { AppSettings } from "@/components/app-settings"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { PWAInstaller } from "@/components/pwa-installer"
import { useLanguage } from "@/hooks/use-language"
import { Menu, Home, Settings, Bell, ChevronDown, ChevronUp, Info } from "lucide-react"

export function MainMenu() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [showBudgetOptions, setShowBudgetOptions] = useState(false)
  const [showAppOptions, setShowAppOptions] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={handleClose} className="flex items-center gap-2">
                <img src="/logo.png" alt="PresuApp Logo" className="h-8 w-8" />
                <span className="font-bold text-lg">PresuApp</span>
              </Link>
              <ModeToggle />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("app.slogan")}</p>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <div className="px-2">
              <h3 className="px-2 text-xs font-medium text-muted-foreground mb-1">{t("menu.navigation")}</h3>
              <div className="space-y-1">
                <Link href="/" onClick={handleClose}>
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${isActive("/") ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {t("menu.home")}
                  </Button>
                </Link>

                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setShowBudgetOptions(!showBudgetOptions)}
                  >
                    <span className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      {t("menu.alerts")}
                    </span>
                    {showBudgetOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {showBudgetOptions && <div className="ml-4 mt-1 space-y-1">{/* Opciones de presupuesto */}</div>}
                </div>
              </div>
            </div>

            <div className="px-2 mt-4">
              <h3 className="px-2 text-xs font-medium text-muted-foreground mb-1">{t("menu.appOptions")}</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => setShowAppOptions(!showAppOptions)}
                >
                  <span className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    {t("menu.settings")}
                  </span>
                  {showAppOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {showAppOptions && (
                  <div className="ml-4 mt-1 space-y-1">
                    <div className="rounded-md border p-2">
                      <h4 className="text-xs font-medium mb-2">{t("settings.title")}</h4>
                      <AppSettings inMenu={true} />
                    </div>

                    <div className="rounded-md border p-2 mt-2">
                      <h4 className="text-xs font-medium mb-2">{t("accessibility.title")}</h4>
                      <AccessibilityControls inMenu={true} />
                    </div>

                    <div className="rounded-md border p-2 mt-2">
                      <h4 className="text-xs font-medium mb-2">{t("settings.installApp")}</h4>
                      <PWAInstaller inMenu={true} />
                    </div>
                  </div>
                )}

                <Link href="/docs" onClick={handleClose}>
                  <Button
                    variant={isActive("/docs") ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start ${isActive("/docs") ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {t("settings.about")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 border-t mt-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">PresuApp © 2023</span>
                <span className="text-xs text-muted-foreground">{t("menu.copyright")}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

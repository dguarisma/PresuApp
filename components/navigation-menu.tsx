"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, DollarSign, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

export function NavigationMenu() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // No mostrar en la página de splash o en rutas específicas
  if (pathname === "/splash") return null

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive("/") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.home")}</span>
          </div>
        </Link>

        <Link href="/ingresos" className="flex flex-col items-center justify-center w-full h-full">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive("/ingresos") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.income")}</span>
          </div>
        </Link>

        <Link href="/deudas" className="flex flex-col items-center justify-center w-full h-full">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive("/deudas") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.debts")}</span>
          </div>
        </Link>

        <Link href="/configuracion" className="flex flex-col items-center justify-center w-full h-full">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive("/configuracion") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">{t("nav.settings")}</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}

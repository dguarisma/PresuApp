"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, Accessibility, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/hooks/use-language"

export function NavigationMenu() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  // Para asegurar que el componente se renderice correctamente en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <NavItem
          href="/"
          icon={<Home className="h-5 w-5" />}
          label={t("menu.home")}
          isActive={pathname === "/" || pathname.startsWith("/budget")}
        />

        <NavItem
          href="/configuracion"
          icon={<Accessibility className="h-5 w-5" />}
          label={t("menu.accessibility")}
          isActive={pathname === "/configuracion"}
        />

        <NavItem
          href="/metas-ahorro"
          icon={<Target className="h-5 w-5" />}
          label={t("menu.goals")}
          isActive={pathname === "/metas-ahorro" || pathname.includes("/metas")}
        />

        <NavItem
          href="/opciones"
          icon={<Settings className="h-5 w-5" />}
          label={t("menu.settings")}
          isActive={pathname === "/opciones"}
        />
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center py-3 px-6 transition-colors",
        isActive ? "text-emerald-500" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <div className={cn("p-2 rounded-full transition-colors", isActive ? "bg-emerald-500/10" : "")}>{icon}</div>
      <span className="text-[10px] font-medium mt-0.5">{label}</span>
    </Link>
  )
}

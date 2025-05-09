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
    <div className="fixed bottom-0 left-0 right-0 z-50 nav-glass shadow-lg">
      {/* Línea de indicador de "home" para simular iOS */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-muted rounded-full" />

      <div className="max-w-md mx-auto flex items-center justify-between px-2">
        <NavItem
          href="/"
          icon={<Home className="h-6 w-6" />}
          label={t("menu.home")}
          isActive={pathname === "/" || pathname.startsWith("/budget")}
        />

        <NavItem
          href="/configuracion"
          icon={<Accessibility className="h-6 w-6" />}
          label={t("menu.accessibility")}
          isActive={pathname === "/configuracion"}
        />

        <NavItem
          href="/metas-ahorro"
          icon={<Target className="h-6 w-6" />}
          label={t("menu.goals")}
          isActive={pathname === "/metas-ahorro" || pathname.includes("/metas")}
        />

        <NavItem
          href="/opciones"
          icon={<Settings className="h-6 w-6" />}
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
        "flex flex-col items-center justify-center py-3 px-4 transition-all duration-200 relative touch-effect",
        isActive ? "text-teal-600 scale-110" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          isActive ? "bg-teal-600/15 shadow-[0_0_8px_rgba(13,148,136,0.4)]" : "hover:bg-muted/50",
        )}
      >
        {icon}
      </div>
      <span className={cn("text-[10px] font-medium mt-1 transition-all duration-200", isActive ? "font-semibold" : "")}>
        {label}
      </span>

      {/* Indicador de elemento activo */}
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-teal-600 rounded-full" />
      )}
    </Link>
  )
}

"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { Home, Settings, Target, Accessibility, DollarSign, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"

export function NavigationMenu() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Para asegurar que el componente se renderice correctamente en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 shadow-lg">
      <div className="grid grid-cols-6 h-16 max-w-screen-lg mx-auto">
        <NavItem
          href="/"
          icon={<Home className="h-5 w-5" />}
          label="Inicio"
          isActive={
            isActive("/") &&
            !isActive("/accesibilidad") &&
            !isActive("/metas-ahorro") &&
            !isActive("/opciones") &&
            !isActive("/ingresos") &&
            !isActive("/deudas")
          }
        />

        <NavItem
          href="/ingresos"
          icon={<DollarSign className="h-5 w-5" />}
          label="Ingresos"
          isActive={isActive("/ingresos")}
        />

        <NavItem
          href="/metas-ahorro"
          icon={<Target className="h-5 w-5" />}
          label="Metas"
          isActive={isActive("/metas-ahorro")}
        />

        <NavItem
          href="/deudas"
          icon={<CreditCard className="h-5 w-5" />}
          label="Deudas"
          isActive={isActive("/deudas")}
        />

        <NavItem
          href="/accesibilidad"
          icon={<Accessibility className="h-5 w-5" />}
          label="Accesibilidad"
          isActive={isActive("/accesibilidad")}
        />

        <NavItem
          href="/opciones"
          icon={<Settings className="h-5 w-5" />}
          label="Ajustes"
          isActive={isActive("/opciones")}
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
      className={`flex flex-col items-center justify-center py-2 transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
    >
      <div
        className={`p-1.5 rounded-full transition-all duration-200 ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium mt-1 truncate max-w-[90%] text-center">{label}</span>

      {isActive && <span className="absolute bottom-0.5 h-1 w-6 bg-primary rounded-full" />}
    </Link>
  )
}

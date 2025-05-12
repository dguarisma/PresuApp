"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface PageHeaderProps {
  title: string
  icon?: ReactNode
  showBackButton?: boolean
  backUrl?: string
  children?: ReactNode
}

export function PageHeader({ title, icon, showBackButton = true, backUrl = "/", children }: PageHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <header className="flex flex-col gap-3 py-4">
      <div className="flex justify-center py-2 mb-2">
        <Link href="/">
          <img src="/logo.png" alt="PresuApp Logo" className="h-10" />
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full mr-1"
              onClick={handleBack}
              aria-label={t("common.back")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold ml-2 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h1>
        </div>
        <ModeToggle />
      </div>

      {children}
    </header>
  )
}

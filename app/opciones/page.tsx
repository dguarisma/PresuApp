"use client"

import { useState, useEffect } from "react"
import { AppSettings } from "@/components/app-settings"
import { Toaster } from "@/components/ui/toaster"
import { ModeToggle } from "@/components/mode-toggle"
import { useLanguage } from "@/hooks/use-language"

export default function OpcionesPage() {
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 flex flex-col min-h-[calc(100vh-4rem)]">
        <header className="flex justify-between items-center py-4 mb-4">
          <h1 className="text-xl font-bold">{t("settings.title")}</h1>
          <ModeToggle />
        </header>

        <main className="flex-1">
          <AppSettings inMenu={false} />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

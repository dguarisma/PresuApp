"use client"

import { useState, useEffect } from "react"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { Toaster } from "@/components/ui/toaster"
import { useLanguage } from "@/hooks/use-language"
import { PageHeader } from "@/components/page-header"
import { Settings } from "lucide-react"

export default function ConfiguracionPage() {
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
        <PageHeader title={t("accessibility.title")} icon={<Settings className="h-6 w-6 text-primary" />} />

        <main className="flex-1">
          <AccessibilityControls inMenu={false} />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

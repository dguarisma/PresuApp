"use client"

import { useState, useEffect } from "react"
import DebtManagerGlobal from "@/components/debt-manager-global"
import { useLanguage } from "@/hooks/use-language"
import { PageHeader } from "@/components/page-header"
import { CreditCard } from "lucide-react"

export default function DebtGlobalPage() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-full">
      <div className="p-4 flex flex-col min-h-[100vh] pb-20">
        <PageHeader title={t("debt.title")} icon={<CreditCard className="h-6 w-6 text-primary" />} />

        <main className="flex-1">
          <DebtManagerGlobal />
        </main>
      </div>
    </div>
  )
}

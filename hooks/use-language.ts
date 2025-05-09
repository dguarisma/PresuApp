"use client"

import { useTranslation } from "@/contexts/translation-context"

export function useLanguage() {
  return useTranslation()
}

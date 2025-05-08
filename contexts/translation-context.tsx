"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getTranslation, getAvailableLanguages, type Language } from "@/lib/translations"

interface TranslationContextType {
  t: (key: string, replacements?: Record<string, string | number>) => string
  language: Language
  setLanguage: (lang: Language) => void
  availableLanguages: Language[]
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")
  const availableLanguages = getAvailableLanguages()

  // Cargar el idioma guardado al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [availableLanguages])

  // Guardar el idioma cuando cambie
  useEffect(() => {
    localStorage.setItem("language", language)
    // Actualizar el atributo lang del documento HTML
    document.documentElement.lang = language
  }, [language])

  // Función para obtener traducciones
  const t = (key: string, replacements?: Record<string, string | number>) => {
    return getTranslation(language, key, replacements)
  }

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, availableLanguages }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

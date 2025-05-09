"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { getTranslation, getAvailableLanguages, type Language } from "@/lib/translations/index"

// Definir la interfaz del contexto
interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => boolean
  t: (key: string, replacements?: Record<string, string | number>) => string
  availableLanguages: Language[]
  isLoaded: boolean
}

// Crear el contexto con un valor predeterminado
const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Evento personalizado para cambios de idioma
const LANGUAGE_CHANGE_EVENT = "languageChange"

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Memoizar la lista de idiomas disponibles para evitar recreaciones
  const availableLanguages = useMemo(() => getAvailableLanguages(), [])

  // Cargar el idioma desde localStorage al inicio
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language | null
      if (savedLanguage && availableLanguages.includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading language from localStorage:", error)
      setIsLoaded(true)
    }
  }, [availableLanguages])

  // Función para cambiar el idioma
  const setLanguage = (newLanguage: Language): boolean => {
    try {
      if (!availableLanguages.includes(newLanguage)) {
        console.error(`Language ${newLanguage} is not available`)
        return false
      }

      // Guardar en localStorage
      localStorage.setItem("language", newLanguage)

      // Actualizar el estado
      setLanguageState(newLanguage)

      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: { language: newLanguage } }))

      return true
    } catch (error) {
      console.error("Error setting language:", error)
      return false
    }
  }

  // Memoizar la función de traducción para evitar recreaciones
  const t = useMemo(
    () =>
      (key: string, replacements?: Record<string, string | number>): string => {
        return getTranslation(language, key, replacements)
      },
    [language],
  )

  // Escuchar cambios de idioma de otros componentes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { language: newLanguage } = event.detail
      if (newLanguage !== language) {
        setLanguageState(newLanguage)
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener)
    }
  }, [language])

  // Memoizar el valor del contexto para evitar recreaciones innecesarias
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages,
      isLoaded,
    }),
    [language, t, availableLanguages, isLoaded],
  )

  return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>
}

// Hook personalizado para usar el contexto
export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { getTranslation, getAvailableLanguages, type Language } from "@/lib/translations"

// Evento personalizado para cambios de idioma
const LANGUAGE_CHANGE_EVENT = "languageChange"

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("es")
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Cargar el idioma desde localStorage al inicio
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("language") as Language | null
      if (savedLanguage && getAvailableLanguages().includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
      setIsLoaded(true)
    } catch (error) {
      console.error("Error loading language from localStorage:", error)
      setIsLoaded(true)
    }
  }, [])

  // Función para cambiar el idioma
  const setLanguage = useCallback((newLanguage: Language) => {
    try {
      const availableLanguages = getAvailableLanguages()

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
  }, [])

  // Función para obtener una traducción
  const t = useCallback(
    (key: string, replacements?: Record<string, any>): string => {
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

  return {
    language,
    setLanguage,
    t,
    isLoaded,
    availableLanguages: getAvailableLanguages(),
  }
}

"\"use client"

import { useState, useEffect, useCallback } from "react"
import { getTranslation, type Language } from "@/lib/translations"

export function useTranslations() {
  const [language, setLanguage] = useState<Language>("es")

  useEffect(() => {
    // Cargar el idioma desde localStorage
    try {
      const settings = localStorage.getItem("presuapp-settings")
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        if (parsedSettings.language && (parsedSettings.language === "es" || parsedSettings.language === "en")) {
          setLanguage(parsedSettings.language)
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración de idioma:", error)
    }

    // Escuchar cambios de idioma
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.language) {
        setLanguage(event.detail.language)
      }
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as EventListener)
    }
  }, [])

  // Función para traducir textos
  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      // Use the getTranslation function from lib/translations
      const translation = getTranslation(language, key, replacements)

      // If the translation is the same as the key, it means it wasn't found
      return translation
    },
    [language],
  )

  return {
    language,
    t,
  }
}

export const useTranslation = useTranslations
;("")

import { en } from "./en"
import { es } from "./es"

export type Language = "en" | "es"

const translations = {
  en,
  es,
}

export function getAvailableLanguages(): Language[] {
  return Object.keys(translations) as Language[]
}

export function getTranslation(
  language: Language,
  key: string,
  replacements?: Record<string, string | number>,
): string {
  try {
    // Dividir la clave por puntos para acceder a objetos anidados
    const keys = key.split(".")

    // Iniciar con el objeto de traducción completo para el idioma seleccionado
    let value: any = translations[language]

    // Navegar por la estructura de objetos siguiendo las claves
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Si no se encuentra la clave, intentar con el idioma por defecto (es)
        if (language !== "es") {
          return getTranslation("es", key, replacements)
        }
        // Si tampoco existe en el idioma por defecto, devolver la clave
        return key
      }
    }

    // Si el valor final es un objeto y no una cadena, mostrar advertencia
    if (typeof value === "object") {
      console.warn(`La clave ${key} apunta a un objeto, no a una cadena de texto`)
      return key
    }

    // Si el valor es una cadena, aplicar reemplazos si existen
    if (typeof value === "string" && replacements) {
      return Object.entries(replacements).reduce((text, [placeholder, replacement]) => {
        return text.replace(new RegExp(`\\{${placeholder}\\}`, "g"), String(replacement))
      }, value)
    }

    return value || key
  } catch (error) {
    console.error(`Error al obtener traducción para ${key}:`, error)
    return key
  }
}

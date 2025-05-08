import { es } from "./es"
import { en } from "./en"

export const translations = {
  es,
  en,
}

export type Language = "es" | "en"
export type TranslationKey = keyof typeof es

export function getTranslation(lang: Language, key: string): any {
  const keys = key.split(".")
  let translation: any = translations[lang]

  for (const k of keys) {
    if (translation && translation[k]) {
      translation = translation[k]
    } else {
      // Si no se encuentra la traducción, devolver la clave
      return key
    }
  }

  return translation
}

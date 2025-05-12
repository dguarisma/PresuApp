/**
 * Servicio de caché en memoria para optimizar acceso a localStorage
 */
class CacheService {
  private cache: Map<string, any> = new Map()
  private expiryTimes: Map<string, number> = new Map()
  private defaultTTL: number = 5 * 60 * 1000 // 5 minutos por defecto

  /**
   * Obtiene un valor de la caché o de localStorage si no está en caché
   */
  get<T>(key: string, fallbackFn?: () => T, ttl?: number): T | null {
    // Si está en caché y no ha expirado, devolver de caché
    if (this.cache.has(key)) {
      const expiryTime = this.expiryTimes.get(key) || 0
      if (expiryTime > Date.now()) {
        return this.cache.get(key) as T
      }
      // Si ha expirado, eliminar de la caché
      this.cache.delete(key)
      this.expiryTimes.delete(key)
    }

    // Si no está en caché o ha expirado, intentar obtener de localStorage
    try {
      // Si se proporciona una función de fallback, usarla
      if (fallbackFn) {
        const value = fallbackFn()
        this.set(key, value, ttl)
        return value
      }

      // Si no hay función de fallback, intentar obtener de localStorage
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key)
        if (item) {
          const value = JSON.parse(item) as T
          this.set(key, value, ttl)
          return value
        }
      }
    } catch (error) {
      console.error(`Error al obtener ${key} de localStorage:`, error)
    }

    return null
  }

  /**
   * Guarda un valor en la caché y en localStorage
   */
  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    try {
      // Guardar en caché
      this.cache.set(key, value)
      this.expiryTimes.set(key, Date.now() + ttl)

      // Guardar en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error)
    }
  }

  /**
   * Elimina un valor de la caché y de localStorage
   */
  remove(key: string): void {
    try {
      // Eliminar de caché
      this.cache.delete(key)
      this.expiryTimes.delete(key)

      // Eliminar de localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error al eliminar ${key} de localStorage:`, error)
    }
  }

  /**
   * Limpia toda la caché
   */
  clear(): void {
    this.cache.clear()
    this.expiryTimes.clear()
  }

  /**
   * Actualiza un valor en la caché y en localStorage si ya existe
   */
  update<T>(key: string, updateFn: (currentValue: T | null) => T): T | null {
    try {
      // Obtener valor actual
      const currentValue = this.get<T>(key)

      // Actualizar valor
      const newValue = updateFn(currentValue)

      // Guardar nuevo valor
      this.set(key, newValue)

      return newValue
    } catch (error) {
      console.error(`Error al actualizar ${key}:`, error)
      return null
    }
  }

  /**
   * Precarga múltiples claves de localStorage a la caché
   */
  preloadKeys(keys: string[]): void {
    if (typeof window === "undefined") return

    keys.forEach((key) => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          const value = JSON.parse(item)
          this.cache.set(key, value)
          this.expiryTimes.set(key, Date.now() + this.defaultTTL)
        }
      } catch (error) {
        console.error(`Error al precargar ${key}:`, error)
      }
    })
  }
}

// Exportar una instancia única del servicio
const cacheService = new CacheService()
export default cacheService

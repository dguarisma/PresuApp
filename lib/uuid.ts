/**
 * Genera un UUID v4 (Identificador Único Universal)
 * Esta implementación es compatible con navegadores modernos y entornos Node.js
 */
export function generateUUID(): string {
  // Usar crypto.randomUUID() si está disponible (navegadores modernos)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Implementación alternativa para compatibilidad
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

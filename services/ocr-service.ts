import { createWorker } from "tesseract.js"

export interface OCRResult {
  text: string
  extractedData: {
    amount?: number
    date?: string
    merchant?: string
    items?: Array<{
      description?: string
      price?: number
      quantity?: number
    }>
  }
  confidence: number
}

export async function processReceiptImage(imageData: string): Promise<OCRResult> {
  try {
    // Crear un worker de Tesseract
    const worker = await createWorker("spa+eng")

    // Procesar la imagen
    const { data } = await worker.recognize(imageData)

    // Terminar el worker
    await worker.terminate()

    // Extraer datos del texto reconocido
    const extractedData = extractDataFromText(data.text)

    return {
      text: data.text,
      extractedData,
      confidence: data.confidence,
    }
  } catch (error) {
    console.error("Error en OCR:", error)
    throw new Error("No se pudo procesar la imagen del recibo")
  }
}

function extractDataFromText(text: string) {
  const result: OCRResult["extractedData"] = {}

  // Extraer el monto total (buscar patrones como "TOTAL: $123.45")
  const amountMatch =
    text.match(/(?:total|importe|monto|suma)(?:\s*:?\s*\$?\s*)(\d+[.,]\d{2})/i) || text.match(/\$\s*(\d+[.,]\d{2})/i)

  if (amountMatch && amountMatch[1]) {
    result.amount = Number.parseFloat(amountMatch[1].replace(",", "."))
  }

  // Extraer la fecha (varios formatos comunes)
  const dateMatch = text.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0")
    const month = dateMatch[2].padStart(2, "0")
    const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]
    result.date = `${year}-${month}-${day}`
  }

  // Extraer el comerciante (normalmente en las primeras líneas)
  const lines = text.split("\n").filter((line) => line.trim().length > 0)
  if (lines.length > 0) {
    // Asumimos que el nombre del comerciante está en las primeras líneas
    // y suele ser más corto que una dirección completa
    const potentialMerchants = lines.slice(0, 3).filter(
      (line) =>
        line.length > 2 &&
        line.length < 30 &&
        !line.match(/^\d/) && // No comienza con un número
        !line.match(/fecha|date|ticket|factura|recibo/i), // No es una etiqueta
    )

    if (potentialMerchants.length > 0) {
      result.merchant = potentialMerchants[0].trim()
    }
  }

  // Intentar extraer elementos individuales (más complejo)
  const itemsSection = findItemsSection(text)
  if (itemsSection) {
    result.items = parseItemsFromText(itemsSection)
  }

  return result
}

function findItemsSection(text: string): string | null {
  // Buscar sección que podría contener elementos (entre "ARTÍCULOS" y "TOTAL" por ejemplo)
  const itemsSectionMatch = text.match(/(?:articulos|items|productos|descripcion).*?(?=total|subtotal|importe|suma)/is)
  return itemsSectionMatch ? itemsSectionMatch[0] : null
}

function parseItemsFromText(itemsText: string): Array<{ description?: string; price?: number; quantity?: number }> {
  const items: Array<{ description?: string; price?: number; quantity?: number }> = []

  // Dividir por líneas y buscar patrones como "1 x Producto $10.99"
  const lines = itemsText.split("\n").filter((line) => line.trim().length > 0)

  for (const line of lines) {
    // Buscar patrones de precio
    const priceMatch = line.match(/\$?\s*(\d+[.,]\d{2})/)

    // Buscar patrones de cantidad
    const quantityMatch = line.match(/(\d+)\s*(?:x|unid|pza|u)/i)

    if (priceMatch) {
      const price = Number.parseFloat(priceMatch[1].replace(",", "."))

      // Extraer descripción (todo lo que está antes del precio)
      let description = line.substring(0, priceMatch.index).trim()

      // Si hay una cantidad, quitarla de la descripción
      if (quantityMatch && description.includes(quantityMatch[0])) {
        description = description.replace(quantityMatch[0], "").trim()
      }

      items.push({
        description: description || undefined,
        price,
        quantity: quantityMatch ? Number.parseInt(quantityMatch[1]) : undefined,
      })
    }
  }

  return items
}

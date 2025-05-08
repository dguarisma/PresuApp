"use client"

import { useState, useEffect } from "react"

interface CurrencyInfo {
  code: string
  symbol: string
  decimals: number
  name?: string
}

export function useCurrency() {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    code: "USD",
    symbol: "$",
    decimals: 2,
    name: "Dólar estadounidense",
  })

  useEffect(() => {
    // Cargar la configuración de moneda desde localStorage
    const loadCurrencySettings = () => {
      try {
        const settings = localStorage.getItem("presuapp-settings")
        if (settings) {
          const parsedSettings = JSON.parse(settings)
          if (parsedSettings.currencyInfo) {
            setCurrencyInfo(parsedSettings.currencyInfo)
          } else if (parsedSettings.currency) {
            // Si solo existe el código de moneda pero no la info completa
            const code = parsedSettings.currency
            let symbol = "$"
            let decimals = 2

            // Asignar valores predeterminados según el código
            if (code === "EUR") {
              symbol = "€"
            } else if (code === "CLP" || code === "PYG") {
              decimals = 0
            }

            setCurrencyInfo({
              code,
              symbol,
              decimals,
              name: code,
            })
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración de moneda:", error)
      }
    }

    // Cargar configuración inicial
    loadCurrencySettings()

    // Escuchar cambios de moneda
    const handleCurrencyChange = (event: CustomEvent) => {
      if (event.detail) {
        setCurrencyInfo(event.detail)
      }
    }

    window.addEventListener("currencyChange", handleCurrencyChange as EventListener)

    return () => {
      window.removeEventListener("currencyChange", handleCurrencyChange as EventListener)
    }
  }, [])

  // Función para formatear valores monetarios según la moneda actual
  const formatCurrency = (value: number): string => {
    try {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currencyInfo.code,
        minimumFractionDigits: currencyInfo.decimals,
        maximumFractionDigits: currencyInfo.decimals,
      }).format(value)
    } catch (error) {
      // Fallback en caso de error
      return `${currencyInfo.symbol}${value.toFixed(currencyInfo.decimals)}`
    }
  }

  // Versión simplificada para mostrar solo el valor con el formato correcto
  const formatAmount = (value: number): string => {
    return value.toFixed(currencyInfo.decimals)
  }

  return {
    currencyInfo,
    formatCurrency,
    formatAmount,
    symbol: currencyInfo.symbol,
    code: currencyInfo.code,
    decimals: currencyInfo.decimals,
  }
}

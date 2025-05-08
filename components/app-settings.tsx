"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Trash2, RefreshCw, Database, Moon, BellRing, Languages, DollarSign, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Definir interfaz para monedas
interface Currency {
  code: string
  name: string
  symbol: string
  decimals: number
}

// Lista completa de monedas de Latinoamérica y Estados Unidos
const currencies: Currency[] = [
  { code: "USD", name: "Dólar estadounidense", symbol: "$", decimals: 2 },
  { code: "MXN", name: "Peso mexicano", symbol: "$", decimals: 2 },
  { code: "ARS", name: "Peso argentino", symbol: "$", decimals: 2 },
  { code: "BOB", name: "Boliviano", symbol: "Bs.", decimals: 2 },
  { code: "BRL", name: "Real brasileño", symbol: "R$", decimals: 2 },
  { code: "CLP", name: "Peso chileno", symbol: "$", decimals: 0 },
  { code: "COP", name: "Peso colombiano", symbol: "$", decimals: 2 },
  { code: "CRC", name: "Colón costarricense", symbol: "₡", decimals: 2 },
  { code: "CUP", name: "Peso cubano", symbol: "$", decimals: 2 },
  { code: "DOP", name: "Peso dominicano", symbol: "RD$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GTQ", name: "Quetzal guatemalteco", symbol: "Q", decimals: 2 },
  { code: "HNL", name: "Lempira hondureño", symbol: "L", decimals: 2 },
  { code: "NIO", name: "Córdoba nicaragüense", symbol: "C$", decimals: 2 },
  { code: "PAB", name: "Balboa panameño", symbol: "B/.", decimals: 2 },
  { code: "PEN", name: "Sol peruano", symbol: "S/", decimals: 2 },
  { code: "PYG", name: "Guaraní paraguayo", symbol: "₲", decimals: 0 },
  { code: "SVC", name: "Colón salvadoreño", symbol: "₡", decimals: 2 },
  { code: "UYU", name: "Peso uruguayo", symbol: "$", decimals: 2 },
  { code: "VES", name: "Bolívar soberano venezolano", symbol: "Bs.", decimals: 2 },
]

// Idiomas disponibles
const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
]

interface AppSettingsProps {
  inMenu?: boolean
}

export function AppSettings({ inMenu = false }: AppSettingsProps) {
  const { toast } = useToast()
  const { language, setLanguage, t, isLoaded } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [currency, setCurrency] = useState("USD")
  const [darkMode, setDarkMode] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    // Cargar configuraciones guardadas
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("presuapp-settings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setNotificationsEnabled(settings.notifications || false)
          setCurrency(settings.currency || "USD")
          setDarkMode(settings.darkMode || false)
          setOfflineMode(settings.offlineMode || false)
        }
      } catch (error) {
        console.error("Error al cargar configuraciones:", error)
      }
    }

    loadSettings()

    // Verificar si la app ya está instalada
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Detectar cuando se completa la instalación
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setIsInstallable(false)
      toast({
        title: t("notifications.installComplete"),
        description: t("notifications.installCompleteDesc"),
      })
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [toast, t])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostrar el prompt de instalación
    deferredPrompt.prompt()

    // Esperar a que el usuario responda al prompt
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === "accepted") {
      toast({
        title: t("notifications.installing"),
        description: t("notifications.installingDesc"),
      })
    }

    // Limpiar el prompt guardado
    setDeferredPrompt(null)
  }

  const saveSettings = (key: string, value: any, silent = false) => {
    try {
      // Obtener configuraciones actuales
      const savedSettings = localStorage.getItem("presuapp-settings") || "{}"
      const settings = JSON.parse(savedSettings)

      // Actualizar configuración
      settings[key] = value

      // Guardar configuraciones
      localStorage.setItem("presuapp-settings", JSON.stringify(settings))

      // Mostrar notificación solo si no está en modo silencioso
      if (!silent) {
        toast({
          title: t("notifications.settingsSaved"),
          description: t("notifications.settingsSavedDesc"),
        })
      }
    } catch (error) {
      console.error("Error al guardar configuraciones:", error)
      if (!silent) {
        toast({
          title: t("notifications.error"),
          description: "No se pudo guardar la configuración.",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleNotifications = async (checked: boolean) => {
    setNotificationsEnabled(checked)
    saveSettings("notifications", checked)

    if (checked) {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          toast({
            title: t("notifications.error"),
            description: "No se pudo habilitar las notificaciones.",
            variant: "destructive",
          })
          setNotificationsEnabled(false)
          saveSettings("notifications", false)
        }
      } catch (error) {
        console.error("Error al solicitar permisos:", error)
        setNotificationsEnabled(false)
        saveSettings("notifications", false)
      }
    }
  }

  const handleChangeCurrency = (value: string) => {
    try {
      // Obtener la moneda anterior y la nueva
      const oldCurrency = currency
      const newCurrency = value

      // Obtener información de ambas monedas
      const oldCurrencyInfo = currencies.find((c) => c.code === oldCurrency)
      const newCurrencyInfo = currencies.find((c) => c.code === newCurrency)

      if (!oldCurrencyInfo || !newCurrencyInfo) {
        throw new Error("Información de moneda no encontrada")
      }

      // Actualizar el estado local
      setCurrency(newCurrency)

      // Preparar todas las configuraciones a guardar de una vez
      const savedSettings = localStorage.getItem("presuapp-settings") || "{}"
      const settings = JSON.parse(savedSettings)

      // Actualizar todas las configuraciones relacionadas con la moneda
      settings.currency = newCurrency
      settings.currencyInfo = {
        code: newCurrencyInfo.code,
        symbol: newCurrencyInfo.symbol,
        decimals: newCurrencyInfo.decimals,
        name: newCurrencyInfo.name,
      }

      // Guardar todas las configuraciones de una sola vez
      localStorage.setItem("presuapp-settings", JSON.stringify(settings))

      // Aplicar la moneda a nivel global para que toda la app la use
      window.dispatchEvent(
        new CustomEvent("currencyChange", {
          detail: {
            currency: newCurrencyInfo.code,
            symbol: newCurrencyInfo.symbol,
            decimals: newCurrencyInfo.decimals,
          },
        }),
      )

      // Mostrar una única notificación
      toast({
        title: t("notifications.currencyUpdated"),
        description: t("notifications.currencyUpdatedDesc", {
          name: newCurrencyInfo.name,
          symbol: newCurrencyInfo.symbol,
        }),
      })
    } catch (error) {
      console.error("Error al cambiar moneda:", error)
      toast({
        title: t("notifications.error"),
        description: "No se pudo cambiar la moneda. Inténtalo de nuevo.",
        variant: "destructive",
      })

      // Restaurar el valor anterior
      setCurrency(currency)
    }
  }

  const handleChangeLanguage = (value: string) => {
    try {
      if (value === "es" || value === "en") {
        // Cambiar el idioma usando la función del hook
        setLanguage(value)

        // Mostrar notificación
        const languageName = languages.find((l) => l.code === value)?.name || value
        toast({
          title: t("notifications.languageUpdated"),
          description: t("notifications.languageUpdatedDesc", {
            language: languageName,
          }),
        })
      }
    } catch (error) {
      console.error("Error al cambiar idioma:", error)
      toast({
        title: t("notifications.error"),
        description: "No se pudo cambiar el idioma. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked)
    saveSettings("darkMode", checked)

    // Aplicar tema oscuro/claro
    document.documentElement.classList.toggle("dark", checked)
  }

  const handleToggleOfflineMode = (checked: boolean) => {
    setOfflineMode(checked)
    saveSettings("offlineMode", checked)
  }

  const handleClearData = () => {
    try {
      setIsClearing(true)

      // Función para obtener todas las claves de localStorage que coinciden con un patrón
      const getKeysWithPattern = (pattern: string): string[] => {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(pattern)) {
            keys.push(key)
          }
        }
        return keys
      }

      // Eliminar todos los datos relacionados con presupuestos
      const budgetKeys = getKeysWithPattern("budget_")
      budgetKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Eliminar la lista principal de presupuestos
      localStorage.removeItem("budgets")

      // Eliminar datos de gastos
      const expenseKeys = getKeysWithPattern("expenses_")
      expenseKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Eliminar categorías
      localStorage.removeItem("categories")

      // Eliminar etiquetas
      localStorage.removeItem("tags")

      // Eliminar informes guardados
      localStorage.removeItem("reports")

      // Eliminar configuraciones
      localStorage.removeItem("presuapp-settings")

      // Eliminar cualquier otra clave relacionada con la aplicación
      const appKeys = getKeysWithPattern("presuapp-")
      appKeys.forEach((key) => {
        localStorage.removeItem(key)
      })

      // Mostrar notificación de éxito
      toast({
        title: t("notifications.dataDeleted"),
        description: t("notifications.dataDeletedDesc"),
      })

      // Recargar la página después de un breve retraso
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (error) {
      console.error("Error al limpiar datos:", error)
      toast({
        title: t("notifications.error"),
        description: "No se pudieron eliminar los datos.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleExportData = () => {
    try {
      // Función para obtener todas las claves de localStorage que coinciden con un patrón
      const getKeysWithPattern = (pattern: string): Record<string, any> => {
        const result: Record<string, any> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes(pattern)) {
            try {
              result[key] = JSON.parse(localStorage.getItem(key) || "{}")
            } catch {
              result[key] = localStorage.getItem(key)
            }
          }
        }
        return result
      }

      // Recopilar todos los datos
      const allData = {
        budgets: JSON.parse(localStorage.getItem("budgets") || "[]"),
        budgetData: getKeysWithPattern("budget_"),
        expenses: getKeysWithPattern("expenses_"),
        categories: JSON.parse(localStorage.getItem("categories") || "[]"),
        tags: JSON.parse(localStorage.getItem("tags") || "[]"),
        reports: JSON.parse(localStorage.getItem("reports") || "[]"),
        settings: JSON.parse(localStorage.getItem("presuapp-settings") || "{}"),
        appData: getKeysWithPattern("presuapp-"),
      }

      // Convertir a JSON con formato legible
      const jsonData = JSON.stringify(allData, null, 2)

      // Crear un objeto Blob con el JSON
      const blob = new Blob([jsonData], { type: "application/json" })

      // Crear una URL para el Blob
      const url = URL.createObjectURL(blob)

      // Crear un elemento <a> para descargar el archivo
      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = `presuapp-backup-${new Date().toISOString().slice(0, 10)}.json`

      // Añadir el enlace al documento
      document.body.appendChild(downloadLink)

      // Simular un clic en el enlace para iniciar la descarga
      downloadLink.click()

      // Eliminar el enlace del documento
      document.body.removeChild(downloadLink)

      // Liberar la URL del objeto
      URL.revokeObjectURL(url)

      toast({
        title: t("notifications.dataExported"),
        description: t("notifications.dataExportedDesc"),
      })
    } catch (error) {
      console.error("Error al exportar datos:", error)
      toast({
        title: t("notifications.error"),
        description: "No se pudieron exportar los datos.",
        variant: "destructive",
      })
    }
  }

  // Función para obtener el símbolo de la moneda actual
  const getCurrentCurrencySymbol = (): string => {
    const currencyInfo = currencies.find((c) => c.code === currency)
    return currencyInfo ? currencyInfo.symbol : "$"
  }

  // Si el idioma aún no se ha cargado, mostrar un estado de carga
  if (!isLoaded) {
    return <div className="p-4 text-center">Cargando configuraciones...</div>
  }

  const renderContent = () => {
    return (
      <div className={`space-y-6 ${inMenu ? "" : "p-2"}`}>
        {isInstallable && !isInstalled && (
          <Card className={inMenu ? "bg-transparent border-0 shadow-none p-0" : ""}>
            <CardContent className={inMenu ? "p-0" : "p-4"}>
              <Button
                variant="default"
                size={inMenu ? "sm" : "default"}
                className={inMenu ? "w-full" : "w-full"}
                onClick={handleInstall}
              >
                <Download className={inMenu ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"} />
                {t("settings.installApp")}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className={inMenu ? "bg-transparent border-0 shadow-none p-0" : ""}>
          <CardContent className={inMenu ? "p-0" : "p-4"}>
            <h3 className={inMenu ? "text-xs font-medium mb-2" : "text-sm font-medium mb-3"}>
              {t("settings.generalPreferences")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className={inMenu ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  <Label htmlFor="notifications" className={inMenu ? "text-xs" : "text-sm"}>
                    {t("settings.notifications")}
                  </Label>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={handleToggleNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className={inMenu ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  <Label htmlFor="dark-mode" className={inMenu ? "text-xs" : "text-sm"}>
                    {t("settings.darkMode")}
                  </Label>
                </div>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleToggleDarkMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className={inMenu ? "h-3.5 w-3.5" : "h-4 w-4"} />
                  <Label htmlFor="offline-mode" className={inMenu ? "text-xs" : "text-sm"}>
                    {t("settings.offlineMode")}
                  </Label>
                </div>
                <Switch id="offline-mode" checked={offlineMode} onCheckedChange={handleToggleOfflineMode} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={inMenu ? "bg-transparent border-0 shadow-none p-0" : ""}>
          <CardContent className={inMenu ? "p-0" : "p-4"}>
            <h3 className={inMenu ? "text-xs font-medium mb-2" : "text-sm font-medium mb-3"}>
              {t("settings.regionalization")}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <Label
                  htmlFor="currency-select"
                  className={inMenu ? "text-xs flex items-center" : "text-sm flex items-center"}
                >
                  <DollarSign className={inMenu ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"} />
                  {t("settings.currency")} ({getCurrentCurrencySymbol()})
                </Label>
                <Select value={currency} onValueChange={handleChangeCurrency}>
                  <SelectTrigger id="currency-select" className={inMenu ? "h-8 text-xs" : "h-9 text-sm"}>
                    <SelectValue placeholder={t("settings.currency")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name} ({curr.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className={`mt-1 ${inMenu ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  {t("settings.currencyNote")}
                </p>
              </div>

              <div className="flex flex-col space-y-1">
                <Label
                  htmlFor="language-select"
                  className={inMenu ? "text-xs flex items-center" : "text-sm flex items-center"}
                >
                  <Languages className={inMenu ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"} />
                  {t("settings.language")}
                </Label>
                <Select value={language} onValueChange={handleChangeLanguage}>
                  <SelectTrigger id="language-select" className={inMenu ? "h-8 text-xs" : "h-9 text-sm"}>
                    <SelectValue placeholder={t("settings.language")} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={inMenu ? "bg-transparent border-0 shadow-none p-0" : ""}>
          <CardContent className={inMenu ? "p-0" : "p-4"}>
            <h3 className={inMenu ? "text-xs font-medium mb-2" : "text-sm font-medium mb-3"}>
              {t("settings.dataManagement")}
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size={inMenu ? "sm" : "default"}
                className={inMenu ? "w-full text-xs" : "w-full"}
                onClick={handleExportData}
              >
                <RefreshCw className={inMenu ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"} />
                {t("settings.exportData")}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size={inMenu ? "sm" : "default"}
                    className={inMenu ? "w-full text-xs" : "w-full"}
                    disabled={isClearing}
                  >
                    <Trash2 className={inMenu ? "h-3.5 w-3.5 mr-1.5" : "h-4 w-4 mr-2"} />
                    {isClearing ? t("actions.deleting") : t("settings.deleteAllData")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("settings.deleteConfirm")}</AlertDialogTitle>
                    <AlertDialogDescription>{t("settings.deleteWarning")}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData}>{t("actions.delete")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Sección "Acerca de" sin el texto de copyright */}
        <Card className={inMenu ? "bg-transparent border-0 shadow-none p-0" : ""}>
          <CardContent className={inMenu ? "p-0" : "p-4"}>
            <h3 className={inMenu ? "text-xs font-medium mb-2" : "text-sm font-medium mb-3"}>
              {t("settings.about") || "Acerca de"}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Info className={inMenu ? "h-3.5 w-3.5" : "h-4 w-4"} />
                <span className={inMenu ? "text-xs" : "text-sm"}>PresuApp v1.0.0</span>
              </div>
              <p className={inMenu ? "text-xs text-muted-foreground pt-1" : "text-sm text-muted-foreground pt-2"}>
                © 2025 PresuApp - Todos los derechos reservados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (inMenu) {
    return renderContent()
  }

  // Versión para usar fuera del menú
  return renderContent()
}

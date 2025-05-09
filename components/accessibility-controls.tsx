"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
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
} from "@/components/ui/alert-dialog"
import { RefreshCw } from "lucide-react"

interface AccessibilityControlsProps {
  inMenu?: boolean
}

// Valores predeterminados de accesibilidad
const DEFAULT_ACCESSIBILITY_SETTINGS = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  fontSize: 100,
}

export function AccessibilityControls({ inMenu = false }: AccessibilityControlsProps) {
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [highContrast, setHighContrast] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.highContrast)
  const [largeText, setLargeText] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.largeText)
  const [reducedMotion, setReducedMotion] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion)
  const [fontSize, setFontSize] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.fontSize)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    // Cargar configuraciones guardadas
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("accessibility")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setHighContrast(settings.highContrast ?? DEFAULT_ACCESSIBILITY_SETTINGS.highContrast)
          setLargeText(settings.largeText ?? DEFAULT_ACCESSIBILITY_SETTINGS.largeText)
          setReducedMotion(settings.reducedMotion ?? DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion)
          setFontSize(settings.fontSize ?? DEFAULT_ACCESSIBILITY_SETTINGS.fontSize)
        }
      } catch (error) {
        console.error("Error al cargar configuración de accesibilidad:", error)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    // Aplicar configuraciones de accesibilidad
    document.documentElement.style.setProperty("--font-size-multiplier", `${fontSize / 100}`)

    if (highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    if (largeText) {
      document.documentElement.classList.add("large-text")
    } else {
      document.documentElement.classList.remove("large-text")
    }

    if (reducedMotion) {
      document.documentElement.classList.add("reduced-motion")
    } else {
      document.documentElement.classList.remove("reduced-motion")
    }
  }, [highContrast, largeText, reducedMotion, fontSize])

  const handleSaveSettings = () => {
    // Guardar configuraciones en localStorage
    localStorage.setItem(
      "accessibility",
      JSON.stringify({
        highContrast,
        largeText,
        reducedMotion,
        fontSize,
      }),
    )

    toast({
      title: t("accessibility.toast.saved.title"),
      description: t("accessibility.toast.saved.description"),
    })
  }

  const handleResetSettings = () => {
    console.log("Restableciendo configuración de accesibilidad...")

    // Restablecer valores predeterminados
    setHighContrast(DEFAULT_ACCESSIBILITY_SETTINGS.highContrast)
    setLargeText(DEFAULT_ACCESSIBILITY_SETTINGS.largeText)
    setReducedMotion(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion)
    setFontSize(DEFAULT_ACCESSIBILITY_SETTINGS.fontSize)

    // Eliminar la configuración del localStorage
    localStorage.removeItem("accessibility")

    // Aplicar los cambios inmediatamente al DOM
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      `${DEFAULT_ACCESSIBILITY_SETTINGS.fontSize / 100}`,
    )
    document.documentElement.classList.remove("high-contrast", "large-text", "reduced-motion")

    toast({
      title: t("accessibility.toast.reset.title"),
      description: t("accessibility.toast.reset.description"),
    })

    // Cerrar el diálogo de confirmación
    setShowResetConfirm(false)
  }

  const renderMenuContent = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast-menu" className="text-xs">
            {t("accessibility.highContrast")}
          </Label>
          <Switch id="high-contrast-menu" checked={highContrast} onCheckedChange={setHighContrast} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="large-text-menu" className="text-xs">
            {t("accessibility.largeText")}
          </Label>
          <Switch id="large-text-menu" checked={largeText} onCheckedChange={setLargeText} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="reduced-motion-menu" className="text-xs">
            {t("accessibility.reducedMotion")}
          </Label>
          <Switch id="reduced-motion-menu" checked={reducedMotion} onCheckedChange={setReducedMotion} />
        </div>
        <div className="mt-2">
          <Label htmlFor="font-size-menu" className="text-xs">
            {t("accessibility.fontSize", { size: fontSize })}
          </Label>
          <Slider
            id="font-size-menu"
            min={80}
            max={150}
            step={5}
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
            className="mt-2"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="flex-1 h-8" onClick={handleSaveSettings}>
            {t("actions.save")}
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => setShowResetConfirm(true)}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Diálogo de confirmación para restablecer */}
        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("accessibility.resetConfirm.title")}</AlertDialogTitle>
              <AlertDialogDescription>{t("accessibility.resetConfirm.description")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetSettings}>{t("common.reset")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  const renderPageContent = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">{t("accessibility.visualOptions")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm">
                  {t("accessibility.highContrast")}
                </Label>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={(checked) => {
                    setHighContrast(checked)
                    // Guardar inmediatamente
                    const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                    settings.highContrast = checked
                    localStorage.setItem("accessibility", JSON.stringify(settings))
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="text-sm">
                  {t("accessibility.largeText")}
                </Label>
                <Switch
                  id="large-text"
                  checked={largeText}
                  onCheckedChange={(checked) => {
                    setLargeText(checked)
                    // Guardar inmediatamente
                    const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                    settings.largeText = checked
                    localStorage.setItem("accessibility", JSON.stringify(settings))
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">{t("accessibility.motionAndAnimations")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm">
                  {t("accessibility.reducedMotion")}
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={(checked) => {
                    setReducedMotion(checked)
                    // Guardar inmediatamente
                    const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                    settings.reducedMotion = checked
                    localStorage.setItem("accessibility", JSON.stringify(settings))
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-3">{t("accessibility.textSize")}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{t("accessibility.smaller")}</span>
                  <span className="text-sm">{t("accessibility.larger")}</span>
                </div>
                <Slider
                  id="font-size"
                  min={80}
                  max={150}
                  step={5}
                  value={[fontSize]}
                  onValueChange={(value) => {
                    setFontSize(value[0])
                    // Guardar inmediatamente
                    const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                    settings.fontSize = value[0]
                    localStorage.setItem("accessibility", JSON.stringify(settings))
                  }}
                />
                <div className="text-center mt-2 text-sm font-medium">{fontSize}%</div>
              </div>
              <div className="p-4 border rounded-md bg-muted/20">
                <p className="text-sm">{t("accessibility.exampleText")}</p>
                <p className="text-sm mt-2">{t("accessibility.adjustSlider")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1" onClick={handleSaveSettings}>
            {t("accessibility.saveAllChanges")}
          </Button>

          <Button variant="outline" onClick={() => setShowResetConfirm(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("accessibility.resetDefaults")}
          </Button>

          {/* Diálogo de confirmación para restablecer */}
          <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("accessibility.resetConfirm.title")}</AlertDialogTitle>
                <AlertDialogDescription>{t("accessibility.resetConfirm.description")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                <Button variant="destructive" onClick={handleResetSettings}>
                  {t("common.reset")}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  if (inMenu) {
    return renderMenuContent()
  }

  // Versión para usar fuera del menú (página completa)
  return renderPageContent()
}

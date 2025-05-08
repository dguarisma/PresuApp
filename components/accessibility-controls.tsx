"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"

interface AccessibilityControlsProps {
  inMenu?: boolean
}

export function AccessibilityControls({ inMenu = false }: AccessibilityControlsProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Cargar configuraciones guardadas
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("accessibility")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setHighContrast(settings.highContrast || false)
          setLargeText(settings.largeText || false)
          setReducedMotion(settings.reducedMotion || false)
          setFontSize(settings.fontSize || 100)
        }
      } catch (error) {
        console.error(t("accessibility.errors.loadSettings"), error)
      }
    }

    loadSettings()
  }, [t])

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

    setOpen(false)
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
        <Button size="sm" className="w-full mt-2 h-8" onClick={handleSaveSettings}>
          {t("accessibility.saveSettings")}
        </Button>
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

        <Button className="w-full" onClick={handleSaveSettings}>
          {t("accessibility.saveAllChanges")}
        </Button>
      </div>
    )
  }

  if (inMenu) {
    return renderMenuContent()
  }

  // Versión para usar fuera del menú (página completa)
  return renderPageContent()
}

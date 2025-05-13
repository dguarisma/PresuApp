"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
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
import { RefreshCw, Save, Eye, Palette, HelpCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface AccessibilityControlsProps {
  inMenu?: boolean
}

// Valores predeterminados de accesibilidad
const DEFAULT_ACCESSIBILITY_SETTINGS = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  fontSize: 100,
  contrastMode: "normal",
  colorBlindnessType: "none",
  enhancedFocus: false,
  increasedTextSpacing: false,
}

// Tipos de contraste disponibles
const CONTRAST_MODES = ["normal", "highContrast", "highContrastInverted", "softContrast", "sepia"]

// Tipos de daltonismo disponibles
const COLOR_BLINDNESS_TYPES = ["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"]

export function AccessibilityControls({ inMenu = false }: AccessibilityControlsProps) {
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [highContrast, setHighContrast] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.highContrast)
  const [largeText, setLargeText] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.largeText)
  const [reducedMotion, setReducedMotion] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.reducedMotion)
  const [fontSize, setFontSize] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.fontSize)
  const [contrastMode, setContrastMode] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.contrastMode)
  const [colorBlindnessType, setColorBlindnessType] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.colorBlindnessType)
  const [enhancedFocus, setEnhancedFocus] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.enhancedFocus)
  const [increasedTextSpacing, setIncreasedTextSpacing] = useState(DEFAULT_ACCESSIBILITY_SETTINGS.increasedTextSpacing)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("visual")

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
          setContrastMode(settings.contrastMode ?? DEFAULT_ACCESSIBILITY_SETTINGS.contrastMode)
          setColorBlindnessType(settings.colorBlindnessType ?? DEFAULT_ACCESSIBILITY_SETTINGS.colorBlindnessType)
          setEnhancedFocus(settings.enhancedFocus ?? DEFAULT_ACCESSIBILITY_SETTINGS.enhancedFocus)
          setIncreasedTextSpacing(settings.increasedTextSpacing ?? DEFAULT_ACCESSIBILITY_SETTINGS.increasedTextSpacing)
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

    // Limpiar todas las clases de contraste y daltonismo primero
    document.documentElement.classList.remove(
      "high-contrast",
      "high-contrast-inverted",
      "soft-contrast",
      "sepia-mode",
      "protanopia",
      "deuteranopia",
      "tritanopia",
      "achromatopsia",
    )

    // Aplicar modo de contraste
    if (contrastMode === "highContrast") {
      document.documentElement.classList.add("high-contrast")
    } else if (contrastMode === "highContrastInverted") {
      document.documentElement.classList.add("high-contrast-inverted")
    } else if (contrastMode === "softContrast") {
      document.documentElement.classList.add("soft-contrast")
    } else if (contrastMode === "sepia") {
      document.documentElement.classList.add("sepia-mode")
    }

    // Aplicar tipo de daltonismo
    if (colorBlindnessType !== "none") {
      document.documentElement.classList.add(colorBlindnessType)

      // Aplicar filtros CSS específicos según el tipo de daltonismo
      let filterValue = ""
      switch (colorBlindnessType) {
        case "protanopia":
          filterValue = "url('#protanopia-filter')"
          break
        case "deuteranopia":
          filterValue = "url('#deuteranopia-filter')"
          break
        case "tritanopia":
          filterValue = "url('#tritanopia-filter')"
          break
        case "achromatopsia":
          filterValue = "grayscale(100%)"
          break
      }

      // Aplicar el filtro al elemento html
      if (filterValue) {
        document.documentElement.style.filter = filterValue
      }
    } else {
      // Eliminar cualquier filtro si se selecciona "ninguno"
      document.documentElement.style.filter = ""
    }

    // Aplicar otras configuraciones
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

    if (enhancedFocus) {
      document.documentElement.classList.add("enhanced-focus")
    } else {
      document.documentElement.classList.remove("enhanced-focus")
    }

    if (increasedTextSpacing) {
      document.documentElement.classList.add("increased-text-spacing")
    } else {
      document.documentElement.classList.remove("increased-text-spacing")
    }
  }, [
    highContrast,
    largeText,
    reducedMotion,
    fontSize,
    contrastMode,
    colorBlindnessType,
    enhancedFocus,
    increasedTextSpacing,
  ])

  const handleSaveSettings = () => {
    // Guardar configuraciones en localStorage
    localStorage.setItem(
      "accessibility",
      JSON.stringify({
        highContrast,
        largeText,
        reducedMotion,
        fontSize,
        contrastMode,
        colorBlindnessType,
        enhancedFocus,
        increasedTextSpacing,
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
    setContrastMode(DEFAULT_ACCESSIBILITY_SETTINGS.contrastMode)
    setColorBlindnessType(DEFAULT_ACCESSIBILITY_SETTINGS.colorBlindnessType)
    setEnhancedFocus(DEFAULT_ACCESSIBILITY_SETTINGS.enhancedFocus)
    setIncreasedTextSpacing(DEFAULT_ACCESSIBILITY_SETTINGS.increasedTextSpacing)

    // Eliminar la configuración del localStorage
    localStorage.removeItem("accessibility")

    // Aplicar los cambios inmediatamente al DOM
    document.documentElement.style.setProperty(
      "--font-size-multiplier",
      `${DEFAULT_ACCESSIBILITY_SETTINGS.fontSize / 100}`,
    )
    document.documentElement.classList.remove(
      "high-contrast",
      "high-contrast-inverted",
      "soft-contrast",
      "sepia-mode",
      "protanopia",
      "deuteranopia",
      "tritanopia",
      "achromatopsia",
      "large-text",
      "reduced-motion",
      "enhanced-focus",
      "increased-text-spacing",
    )

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
          <Button
            size="sm"
            className="flex-1 h-8 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleSaveSettings}
          >
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
      <div className="space-y-6 pb-24">
        <Card className="overflow-hidden border-0 shadow-sm">
          <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/80">
              <TabsTrigger
                value="visual"
                className="rounded-none data-[state=active]:bg-background h-12 flex items-center justify-center"
              >
                <div className="flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t("accessibility.visualOptions")}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="contrast"
                className="rounded-none data-[state=active]:bg-background h-12 flex items-center justify-center"
              >
                <div className="flex items-center gap-1.5 text-sm">
                  <Palette className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t("accessibility.contrastOptions")}</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="p-0 m-0">
              <div className="p-4 space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="increased-text-spacing" className="text-sm">
                    {t("accessibility.increasedTextSpacing")}
                  </Label>
                  <Switch
                    id="increased-text-spacing"
                    checked={increasedTextSpacing}
                    onCheckedChange={(checked) => {
                      setIncreasedTextSpacing(checked)
                      // Guardar inmediatamente
                      const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                      settings.increasedTextSpacing = checked
                      localStorage.setItem("accessibility", JSON.stringify(settings))
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="font-size" className="text-sm block mb-2">
                    {t("accessibility.fontSize", { size: fontSize })}
                  </Label>
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

                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-3">{t("accessibility.motionAndAnimations")}</h3>
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

                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-3">{t("accessibility.focusIndicators")}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enhanced-focus" className="text-sm block">
                        {t("accessibility.enhancedFocus")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("accessibility.enhancedFocusDescription")}
                      </p>
                    </div>
                    <Switch
                      id="enhanced-focus"
                      checked={enhancedFocus}
                      onCheckedChange={(checked) => {
                        setEnhancedFocus(checked)
                        // Guardar inmediatamente
                        const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                        settings.enhancedFocus = checked
                        localStorage.setItem("accessibility", JSON.stringify(settings))
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contrast" className="p-0 m-0">
              <div className="p-4 pb-16 space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">{t("accessibility.contrastMode")}</h3>
                  <Label htmlFor="contrast-mode" className="text-sm block mb-2">
                    {t("accessibility.selectContrastMode")}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">{t("accessibility.contrastDescription")}</p>
                  <Select
                    value={contrastMode}
                    onValueChange={(value) => {
                      setContrastMode(value)
                      // Guardar inmediatamente
                      const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                      settings.contrastMode = value
                      localStorage.setItem("accessibility", JSON.stringify(settings))
                    }}
                  >
                    <SelectTrigger id="contrast-mode">
                      <SelectValue placeholder={t("accessibility.selectContrastMode")} />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRAST_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {t(`accessibility.contrastModes.${mode}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">{t("accessibility.colorBlindness")}</h3>
                    <Link href="/accesibilidad/guia-daltonismo" className="flex items-center text-xs text-primary">
                      <HelpCircle className="h-3.5 w-3.5 mr-1" />
                      Ver guía
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{t("accessibility.colorBlindnessDescription")}</p>
                  <Select
                    value={colorBlindnessType}
                    onValueChange={(value) => {
                      setColorBlindnessType(value)
                      // Guardar inmediatamente
                      const settings = JSON.parse(localStorage.getItem("accessibility") || "{}")
                      settings.colorBlindnessType = value
                      localStorage.setItem("accessibility", JSON.stringify(settings))
                    }}
                  >
                    <SelectTrigger id="color-blindness-type">
                      <SelectValue placeholder={t("accessibility.colorBlindness")} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_BLINDNESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`accessibility.colorBlindnessTypes.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t">
                  <h3 className="text-sm font-medium mb-3">{t("accessibility.previewSection")}</h3>
                  <p className="text-sm mb-3">{t("accessibility.previewDescription")}</p>

                  <div className="space-y-4 border p-4 rounded-md">
                    <h4 className="text-lg font-bold">PresuApp</h4>

                    <div className="color-blindness-preview">
                      <p className="text-sm font-medium mb-2">Muestras de color:</p>
                      <div className="color-sample">
                        <div className="red" title="Rojo"></div>
                        <div className="green" title="Verde"></div>
                        <div className="blue" title="Azul"></div>
                        <div className="yellow" title="Amarillo"></div>
                        <div className="purple" title="Púrpura"></div>
                      </div>
                    </div>

                    <p>
                      Este es un ejemplo de texto para mostrar cómo se verá el contenido con la configuración de
                      accesibilidad actual.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="default">Botón primario</Button>
                      <Button variant="outline">Botón secundario</Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="example-switch" />
                      <Label htmlFor="example-switch">Ejemplo de interruptor</Label>
                    </div>
                    <a href="#" className="text-primary underline">
                      Ejemplo de enlace
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="flex gap-4 justify-between">
          <Button onClick={handleSaveSettings} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {t("actions.save")}
          </Button>

          <Button variant="outline" onClick={() => setShowResetConfirm(true)} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.reset")}
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

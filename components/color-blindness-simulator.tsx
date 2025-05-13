"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"

// Componente para simular cómo ven las personas con daltonismo
export function ColorBlindnessSimulator() {
  const { t } = useTranslations()
  const [simulationType, setSimulationType] = useState("normal")

  // Colores de muestra para demostración
  const sampleColors = [
    { name: t("colorRed"), color: "bg-red-500" },
    { name: t("colorGreen"), color: "bg-green-500" },
    { name: t("colorBlue"), color: "bg-blue-500" },
    { name: t("colorYellow"), color: "bg-yellow-500" },
    { name: t("colorPurple"), color: "bg-purple-500" },
  ]

  // Filtros SVG para simular diferentes tipos de daltonismo
  const filters = {
    normal: "",
    protanopia: "filter: url(#protanopia-filter)",
    deuteranopia: "filter: url(#deuteranopia-filter)",
    tritanopia: "filter: url(#tritanopia-filter)",
    achromatopsia: "filter: grayscale(100%)",
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("colorBlindnessSimulator")}</CardTitle>
        <CardDescription>{t("colorBlindnessSimulatorDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Selector de tipo de daltonismo */}
        <div className="mb-6">
          <Label htmlFor="color-blindness-type">{t("selectColorBlindnessType")}</Label>
          <Select value={simulationType} onValueChange={setSimulationType}>
            <SelectTrigger id="color-blindness-type" className="w-full mt-2">
              <SelectValue placeholder={t("selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">{t("normalVision")}</SelectItem>
              <SelectItem value="protanopia">{t("protanopia")}</SelectItem>
              <SelectItem value="deuteranopia">{t("deuteranopia")}</SelectItem>
              <SelectItem value="tritanopia">{t("tritanopia")}</SelectItem>
              <SelectItem value="achromatopsia">{t("achromatopsia")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Muestras de colores con el filtro aplicado */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("colorSamples")}</h3>
          <div
            className="grid grid-cols-5 gap-2"
            style={{ [filters[simulationType as keyof typeof filters] as any]: true }}
          >
            {sampleColors.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full ${color.color} mb-2`}></div>
                <span className="text-xs text-center">{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplos de interfaz con el filtro aplicado */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">{t("interfaceExample")}</h3>
          <div style={{ [filters[simulationType as keyof typeof filters] as any]: true }}>
            <div className="flex flex-wrap gap-2 mb-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded">{t("primaryButton")}</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded">{t("secondaryButton")}</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded">{t("dangerButton")}</button>
              <button className="px-4 py-2 bg-green-500 text-white rounded">{t("successButton")}</button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-6 h-6 rounded-full bg-red-500"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
            </div>

            <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
              <div className="h-4 w-3/4 bg-blue-200 dark:bg-blue-700 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-green-200 dark:bg-green-700 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-red-200 dark:bg-red-700 rounded"></div>
            </div>
          </div>
        </div>

        {/* Descripción del tipo de daltonismo seleccionado */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-2">
            {simulationType === "normal"
              ? t("normalVision")
              : simulationType === "protanopia"
                ? t("protanopia")
                : simulationType === "deuteranopia"
                  ? t("deuteranopia")
                  : simulationType === "tritanopia"
                    ? t("tritanopia")
                    : t("achromatopsia")}
          </h3>
          <p>
            {simulationType === "normal"
              ? t("normalVisionDescription")
              : simulationType === "protanopia"
                ? t("protanopiaDescription")
                : simulationType === "deuteranopia"
                  ? t("deuteranopiaDescription")
                  : simulationType === "tritanopia"
                    ? t("tritanopiaDescription")
                    : t("achromatopsiaDescription")}
          </p>
        </div>
      </CardContent>

      {/* Filtros SVG para simular daltonismo */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {/* Filtro para Protanopia (deficiencia de rojo) */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>

          {/* Filtro para Deuteranopia (deficiencia de verde) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>

          {/* Filtro para Tritanopia (deficiencia de azul) */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>
    </Card>
  )
}

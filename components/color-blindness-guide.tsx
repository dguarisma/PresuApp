"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/hooks/use-language"

export function ColorBlindnessGuide() {
  const { t } = useLanguage()

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">{t("accessibility.colorBlindnessGuide")}</h2>
      <p className="text-sm mb-4">{t("accessibility.colorBlindnessGuideDescription")}</p>

      <Tabs defaultValue="normal">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="normal">Normal</TabsTrigger>
          <TabsTrigger value="protanopia">Protanopia</TabsTrigger>
          <TabsTrigger value="deuteranopia">Deuteranopia</TabsTrigger>
          <TabsTrigger value="tritanopia">Tritanopia</TabsTrigger>
          <TabsTrigger value="achromatopsia">Acromatopsia</TabsTrigger>
        </TabsList>

        <TabsContent value="normal" className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Visión normal</h3>
            <p className="text-sm mb-3">Así es como se ven los colores con visión normal:</p>
            <div className="grid grid-cols-5 gap-2">
              <ColorSample color="#FF0000" name="Rojo" />
              <ColorSample color="#00FF00" name="Verde" />
              <ColorSample color="#0000FF" name="Azul" />
              <ColorSample color="#FFFF00" name="Amarillo" />
              <ColorSample color="#FF00FF" name="Magenta" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="protanopia" className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Protanopia (deficiencia de rojo)</h3>
            <p className="text-sm mb-3">Las personas con protanopia tienen dificultad para distinguir:</p>
            <ul className="list-disc pl-5 mb-3 text-sm">
              <li>Rojo y verde</li>
              <li>Rojo y negro</li>
              <li>Algunos tonos de azul y verde</li>
            </ul>
            <div className="grid grid-cols-5 gap-2 filter-protanopia">
              <ColorSample color="#FF0000" name="Rojo" />
              <ColorSample color="#00FF00" name="Verde" />
              <ColorSample color="#0000FF" name="Azul" />
              <ColorSample color="#FFFF00" name="Amarillo" />
              <ColorSample color="#FF00FF" name="Magenta" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deuteranopia" className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Deuteranopia (deficiencia de verde)</h3>
            <p className="text-sm mb-3">Las personas con deuteranopia tienen dificultad para distinguir:</p>
            <ul className="list-disc pl-5 mb-3 text-sm">
              <li>Verde y rojo</li>
              <li>Verde y marrón</li>
              <li>Algunos tonos de gris y rosa</li>
            </ul>
            <div className="grid grid-cols-5 gap-2 filter-deuteranopia">
              <ColorSample color="#FF0000" name="Rojo" />
              <ColorSample color="#00FF00" name="Verde" />
              <ColorSample color="#0000FF" name="Azul" />
              <ColorSample color="#FFFF00" name="Amarillo" />
              <ColorSample color="#FF00FF" name="Magenta" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tritanopia" className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Tritanopia (deficiencia de azul)</h3>
            <p className="text-sm mb-3">Las personas con tritanopia tienen dificultad para distinguir:</p>
            <ul className="list-disc pl-5 mb-3 text-sm">
              <li>Azul y verde</li>
              <li>Amarillo y violeta</li>
              <li>Rojo y púrpura</li>
            </ul>
            <div className="grid grid-cols-5 gap-2 filter-tritanopia">
              <ColorSample color="#FF0000" name="Rojo" />
              <ColorSample color="#00FF00" name="Verde" />
              <ColorSample color="#0000FF" name="Azul" />
              <ColorSample color="#FFFF00" name="Amarillo" />
              <ColorSample color="#FF00FF" name="Magenta" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achromatopsia" className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Acromatopsia (sin color)</h3>
            <p className="text-sm mb-3">Las personas con acromatopsia ven el mundo en escala de grises:</p>
            <div className="grid grid-cols-5 gap-2 filter-achromatopsia">
              <ColorSample color="#FF0000" name="Rojo" />
              <ColorSample color="#00FF00" name="Verde" />
              <ColorSample color="#0000FF" name="Azul" />
              <ColorSample color="#FFFF00" name="Amarillo" />
              <ColorSample color="#FF00FF" name="Magenta" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function ColorSample({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-md border" style={{ backgroundColor: color }} aria-label={`Color ${name}`} />
      <span className="text-xs mt-1">{name}</span>
    </div>
  )
}

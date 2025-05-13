"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft, ArrowRight, Edit, Trash2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export function GestureTutorial() {
  const { t } = useLanguage()
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Gestos táctiles",
      description: "Ahora puedes usar gestos táctiles para interactuar con los elementos de la aplicación.",
      icon: <ArrowLeft className="h-6 w-6 text-primary" />,
    },
    {
      title: "Deslizar a la izquierda",
      description: "Desliza un elemento hacia la izquierda para revelar opciones como editar o eliminar.",
      icon: <ArrowLeft className="h-6 w-6 text-primary" />,
      animation: "swipe-left-animation",
    },
    {
      title: "Editar y eliminar",
      description: "Accede rápidamente a las acciones más comunes sin necesidad de menús adicionales.",
      icon: <Edit className="h-6 w-6 text-blue-500 mr-2" />,
      secondaryIcon: <Trash2 className="h-6 w-6 text-red-500" />,
    },
    {
      title: "Deslizar a la derecha",
      description: "Desliza hacia la derecha para volver a ocultar las opciones.",
      icon: <ArrowRight className="h-6 w-6 text-primary" />,
      animation: "swipe-right-animation",
    },
  ]

  useEffect(() => {
    // Verificar si el tutorial ya se ha mostrado
    const tutorialShown = localStorage.getItem("gestureTutorialShown")

    if (!tutorialShown) {
      // Mostrar el tutorial después de un breve retraso
      const timer = setTimeout(() => {
        setShowTutorial(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setShowTutorial(false)
    localStorage.setItem("gestureTutorialShown", "true")
  }

  if (!showTutorial) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {steps[currentStep].animation ? (
                <div className={`p-4 bg-muted/20 rounded-lg ${steps[currentStep].animation}`}>
                  {steps[currentStep].icon}
                  {steps[currentStep].secondaryIcon}
                </div>
              ) : (
                <div className="flex p-4 bg-muted/20 rounded-lg">
                  {steps[currentStep].icon}
                  {steps[currentStep].secondaryIcon}
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{steps[currentStep].title}</h3>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Anterior
            </Button>

            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === currentStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            <Button onClick={handleNext}>{currentStep < steps.length - 1 ? "Siguiente" : "Entendido"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

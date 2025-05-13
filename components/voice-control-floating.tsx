"use client"

import { useEffect, useState } from "react"
import { VoiceRecognitionIndicator } from "@/components/voice-recognition-indicator"
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"

export function VoiceControlFloating() {
  const { isSupported } = useVoiceRecognition()
  const [showControl, setShowControl] = useState(false)

  useEffect(() => {
    // Verificar si el control por voz está habilitado en la configuración
    const checkVoiceControlEnabled = () => {
      try {
        const settings = JSON.parse(localStorage.getItem("presuapp-settings") || "{}")
        return settings.voiceControlEnabled === true
      } catch (error) {
        return false
      }
    }

    setShowControl(isSupported && checkVoiceControlEnabled())

    // Escuchar cambios en la configuración
    const handleStorageChange = () => {
      setShowControl(isSupported && checkVoiceControlEnabled())
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [isSupported])

  if (!showControl) {
    return null
  }

  return <VoiceRecognitionIndicator variant="floating" />
}

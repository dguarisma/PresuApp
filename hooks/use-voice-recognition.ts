"use client"

import { useEffect, useState } from "react"
import {
  getVoiceRecognitionService,
  type VoiceCommand,
  type VoiceRecognitionState,
} from "@/services/voice-recognition-service"

export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: "",
    error: null,
    isSupported: false,
  })

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return

    const service = getVoiceRecognitionService()

    // Suscribirse a cambios en el estado
    const unsubscribe = service.subscribe(setState)

    // Limpiar suscripción al desmontar
    return () => {
      unsubscribe()
    }
  }, [])

  const service = typeof window !== "undefined" ? getVoiceRecognitionService() : null

  return {
    ...state,
    start: () => service?.start(),
    stop: () => service?.stop(),
    toggle: () => service?.toggle(),
    registerCommand: (command: VoiceCommand) => service?.registerCommand(command),
    registerCommands: (commands: VoiceCommand[]) => service?.registerCommands(commands),
    unregisterCommand: (commandName: string) => service?.unregisterCommand(commandName),
    getCommands: () => service?.getCommands() || [],
    getCommandsByCategory: (category: VoiceCommand["category"]) => service?.getCommandsByCategory(category) || [],
    setLanguage: (language: "es" | "en") => service?.setLanguage(language),
  }
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  getVoiceRecognitionService,
  type VoiceCommand,
  type VoiceRecognitionState,
} from "@/services/voice-recognition-service"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"

export function useVoiceRecognition() {
  const voiceService = getVoiceRecognitionService()
  const [state, setState] = useState<VoiceRecognitionState>(voiceService.getState())
  const { language, t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  // Actualizar el estado cuando cambie
  useEffect(() => {
    return voiceService.subscribe((newState) => {
      setState(newState)
    })
  }, [])

  // Actualizar el idioma cuando cambie
  useEffect(() => {
    if (language === "es" || language === "en") {
      voiceService.setLanguage(language)
    }
  }, [language])

  // Registrar comandos básicos
  useEffect(() => {
    const commands: VoiceCommand[] = [
      // Comandos de navegación
      {
        command: "goHome",
        action: () => {
          router.push("/")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.navigatingTo", { page: t("menu.home") }),
          })
        },
        phrases:
          language === "es"
            ? ["ir a inicio", "página principal", "volver a inicio", "pantalla principal"]
            : ["go home", "main page", "home page", "go to home"],
        description: t("voice.goHomeDesc"),
        category: "navigation",
        language,
      },
      {
        command: "goToIncome",
        action: () => {
          router.push("/ingresos")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.navigatingTo", { page: t("income.title") }),
          })
        },
        phrases:
          language === "es"
            ? ["ir a ingresos", "ver ingresos", "página de ingresos"]
            : ["go to income", "view income", "income page"],
        description: t("voice.goToIncomeDesc"),
        category: "navigation",
        language,
      },
      {
        command: "goToDebts",
        action: () => {
          router.push("/deudas")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.navigatingTo", { page: t("debt.title") }),
          })
        },
        phrases:
          language === "es"
            ? ["ir a deudas", "ver deudas", "página de deudas"]
            : ["go to debts", "view debts", "debt page"],
        description: t("voice.goToDebtsDesc"),
        category: "navigation",
        language,
      },
      {
        command: "goToSettings",
        action: () => {
          router.push("/configuracion")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.navigatingTo", { page: t("settings.title") }),
          })
        },
        phrases:
          language === "es"
            ? ["ir a configuración", "abrir configuración", "configuración"]
            : ["go to settings", "open settings", "settings"],
        description: t("voice.goToSettingsDesc"),
        category: "navigation",
        language,
      },

      // Comandos generales
      {
        command: "stopListening",
        action: () => {
          voiceService.stop()
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.stoppedListening"),
          })
        },
        phrases:
          language === "es"
            ? ["dejar de escuchar", "detener reconocimiento", "parar", "detener"]
            : ["stop listening", "stop recognition", "stop", "cancel"],
        description: t("voice.stopListeningDesc"),
        category: "general",
        language,
      },
      {
        command: "startListening",
        action: () => {
          voiceService.start()
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.startedListening"),
          })
        },
        phrases:
          language === "es"
            ? ["empezar a escuchar", "iniciar reconocimiento", "escuchar"]
            : ["start listening", "begin recognition", "listen"],
        description: t("voice.startListeningDesc"),
        category: "general",
        language,
      },
      {
        command: "showHelp",
        action: () => {
          router.push("/ayuda-voz")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.showingHelp"),
          })
        },
        phrases:
          language === "es"
            ? ["mostrar ayuda", "ayuda de voz", "comandos disponibles"]
            : ["show help", "voice help", "available commands"],
        description: t("voice.showHelpDesc"),
        category: "general",
        language,
      },

      // Comandos de presupuesto
      {
        command: "createBudget",
        action: () => {
          router.push("/budget/new")
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.creatingBudget"),
          })
        },
        phrases:
          language === "es"
            ? ["crear presupuesto", "nuevo presupuesto", "añadir presupuesto"]
            : ["create budget", "new budget", "add budget"],
        description: t("voice.createBudgetDesc"),
        category: "budget",
        language,
      },

      // Comandos de gastos
      {
        command: "addExpense",
        action: () => {
          // Aquí podríamos abrir un modal para añadir un gasto
          // Por ahora, solo mostramos un toast
          toast({
            title: t("voice.commandRecognized"),
            description: t("voice.addingExpense"),
          })

          // Disparar un evento personalizado que otros componentes pueden escuchar
          window.dispatchEvent(
            new CustomEvent("voice-command", {
              detail: { command: "addExpense" },
            }),
          )
        },
        phrases:
          language === "es"
            ? ["añadir gasto", "nuevo gasto", "registrar gasto"]
            : ["add expense", "new expense", "record expense"],
        description: t("voice.addExpenseDesc"),
        category: "expense",
        language,
      },
    ]

    voiceService.registerCommands(commands)

    // Limpiar al desmontar
    return () => {
      commands.forEach((cmd) => voiceService.unregisterCommand(cmd.command))
    }
  }, [language, router, t, toast])

  const startListening = useCallback(() => {
    voiceService.start()
  }, [])

  const stopListening = useCallback(() => {
    voiceService.stop()
  }, [])

  const toggleListening = useCallback(() => {
    voiceService.toggle()
  }, [])

  const getCommands = useCallback(() => {
    return voiceService.getCommands()
  }, [])

  const getCommandsByCategory = useCallback((category: VoiceCommand["category"]) => {
    return voiceService.getCommandsByCategory(category)
  }, [])

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    isSupported: state.isSupported,
    startListening,
    stopListening,
    toggleListening,
    getCommands,
    getCommandsByCategory,
  }
}

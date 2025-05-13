"use client"

import { useState, useEffect } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceRecognitionIndicatorProps {
  variant?: "default" | "minimal" | "floating"
  className?: string
}

export function VoiceRecognitionIndicator({ variant = "default", className }: VoiceRecognitionIndicatorProps) {
  const { isListening, transcript, error, isSupported, toggleListening } = useVoiceRecognition()
  const { t } = useLanguage()
  const [showTranscript, setShowTranscript] = useState(false)
  const [animation, setAnimation] = useState<"pulse" | "none">("none")

  // Mostrar el transcript cuando cambie
  useEffect(() => {
    if (transcript) {
      setShowTranscript(true)

      // Ocultar después de 5 segundos
      const timer = setTimeout(() => {
        setShowTranscript(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [transcript])

  // Animar el micrófono cuando esté escuchando
  useEffect(() => {
    if (isListening) {
      setAnimation("pulse")
    } else {
      setAnimation("none")
    }
  }, [isListening])

  if (!isSupported) {
    return null
  }

  // Variante mínima (solo icono)
  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleListening}
        className={cn("h-8 w-8 rounded-full", className)}
        aria-label={isListening ? t("voice.stopListening") : t("voice.startListening")}
      >
        {isListening ? (
          <Mic className={cn("h-4 w-4", animation === "pulse" && "animate-pulse text-red-500")} />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
    )
  }

  // Variante flotante
  if (variant === "floating") {
    return (
      <div className={cn("fixed bottom-20 right-4 z-50", className)}>
        <Button
          variant={isListening ? "destructive" : "default"}
          size="icon"
          onClick={toggleListening}
          className="h-12 w-12 rounded-full shadow-lg"
          aria-label={isListening ? t("voice.stopListening") : t("voice.startListening")}
        >
          {isListening ? (
            <Mic className={cn("h-6 w-6", animation === "pulse" && "animate-pulse")} />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        {showTranscript && transcript && (
          <div className="absolute bottom-16 right-0 bg-background border rounded-lg p-3 shadow-lg max-w-[250px] text-sm">
            <p className="font-medium text-xs mb-1">{t("voice.heard")}:</p>
            <p className="italic">{transcript}</p>
          </div>
        )}
      </div>
    )
  }

  // Variante por defecto
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={toggleListening}
        className="gap-2"
        aria-label={isListening ? t("voice.stopListening") : t("voice.startListening")}
      >
        {isListening ? (
          <>
            <Mic className={cn("h-4 w-4", animation === "pulse" && "animate-pulse")} />
            {t("voice.listening")}
          </>
        ) : (
          <>
            <MicOff className="h-4 w-4" />
            {t("voice.startListening")}
          </>
        )}
      </Button>

      {showTranscript && transcript && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Volume2 className="h-3 w-3" />
          <span className="italic truncate max-w-[200px]">{transcript}</span>
        </div>
      )}

      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  )
}

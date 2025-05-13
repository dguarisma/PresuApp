// Definir tipos para el servicio de reconocimiento de voz
export interface VoiceCommand {
  command: string
  action: () => void
  phrases: string[]
  description: string
  category: "navigation" | "budget" | "expense" | "income" | "settings" | "general"
  language: "es" | "en" | "all"
}

export interface VoiceRecognitionState {
  isListening: boolean
  transcript: string
  error: string | null
  isSupported: boolean
}

declare var SpeechRecognition: any
declare var SpeechRecognitionEvent: any
declare var SpeechRecognitionErrorEvent: any

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null
  private commands: VoiceCommand[] = []
  private listeners: ((state: VoiceRecognitionState) => void)[] = []
  private state: VoiceRecognitionState = {
    isListening: false,
    transcript: "",
    error: null,
    isSupported: false,
  }
  private language: "es" | "en" = "es"
  private confidenceThreshold = 0.7
  private commandTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.initRecognition()
  }

  private initRecognition() {
    try {
      // Verificar si el navegador soporta reconocimiento de voz
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        this.recognition = new SpeechRecognition()
        this.state.isSupported = true

        // Configurar el reconocimiento
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = "es-ES" // Idioma por defecto

        // Configurar eventos
        this.recognition.onstart = this.handleStart.bind(this)
        this.recognition.onend = this.handleEnd.bind(this)
        this.recognition.onresult = this.handleResult.bind(this)
        this.recognition.onerror = this.handleError.bind(this)
      } else {
        console.warn("El reconocimiento de voz no está soportado en este navegador")
        this.state.error = "El reconocimiento de voz no está soportado en este navegador"
      }
    } catch (error) {
      console.error("Error al inicializar el reconocimiento de voz:", error)
      this.state.error = "Error al inicializar el reconocimiento de voz"
      this.state.isSupported = false
    }
  }

  private handleStart() {
    this.updateState({ isListening: true, error: null })
  }

  private handleEnd() {
    this.updateState({ isListening: false })

    // Si estaba escuchando y se detuvo inesperadamente, reiniciar
    if (this.state.isListening) {
      this.start()
    }
  }

  private handleResult(event: SpeechRecognitionEvent) {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("")

    this.updateState({ transcript })

    // Procesar solo si hay un resultado final
    if (event.results[0].isFinal) {
      const result = event.results[0][0]
      const text = result.transcript.toLowerCase().trim()
      const confidence = result.confidence

      if (confidence >= this.confidenceThreshold) {
        this.processCommand(text)
      }

      // Limpiar el transcript después de un tiempo
      if (this.commandTimeout) {
        clearTimeout(this.commandTimeout)
      }

      this.commandTimeout = setTimeout(() => {
        this.updateState({ transcript: "" })
      }, 3000)
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent) {
    let errorMessage = "Error en el reconocimiento de voz"

    switch (event.error) {
      case "no-speech":
        errorMessage = "No se detectó ninguna voz"
        break
      case "aborted":
        errorMessage = "Reconocimiento de voz cancelado"
        break
      case "audio-capture":
        errorMessage = "No se pudo capturar audio"
        break
      case "network":
        errorMessage = "Error de red"
        break
      case "not-allowed":
        errorMessage = "Permiso de micrófono denegado"
        break
      case "service-not-allowed":
        errorMessage = "Servicio de reconocimiento no permitido"
        break
      case "bad-grammar":
        errorMessage = "Problema con la gramática"
        break
      case "language-not-supported":
        errorMessage = "Idioma no soportado"
        break
    }

    this.updateState({ error: errorMessage, isListening: false })
    console.error("Error de reconocimiento de voz:", errorMessage)
  }

  private processCommand(text: string) {
    // Buscar un comando que coincida con el texto
    for (const command of this.commands) {
      // Solo procesar comandos del idioma actual o de todos los idiomas
      if (command.language !== this.language && command.language !== "all") {
        continue
      }

      // Verificar si alguna de las frases del comando coincide
      const matchesPhrase = command.phrases.some((phrase) => {
        // Normalizar texto y frase (quitar acentos, etc.)
        const normalizedText = this.normalizeText(text)
        const normalizedPhrase = this.normalizeText(phrase)

        return normalizedText.includes(normalizedPhrase)
      })

      if (matchesPhrase) {
        console.log(`Comando de voz detectado: ${command.command}`)
        command.action()
        return
      }
    }

    // Si llegamos aquí, no se encontró ningún comando
    console.log("No se reconoció ningún comando en:", text)
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  private updateState(partialState: Partial<VoiceRecognitionState>) {
    this.state = { ...this.state, ...partialState }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  // Métodos públicos
  public start() {
    if (!this.recognition || !this.state.isSupported) {
      this.updateState({ error: "El reconocimiento de voz no está disponible" })
      return
    }

    try {
      this.recognition.start()
      this.updateState({ isListening: true, error: null })
    } catch (error) {
      console.error("Error al iniciar el reconocimiento de voz:", error)
      this.updateState({ error: "Error al iniciar el reconocimiento de voz", isListening: false })
    }
  }

  public stop() {
    if (!this.recognition || !this.state.isSupported) {
      return
    }

    try {
      this.recognition.stop()
      this.updateState({ isListening: false })
    } catch (error) {
      console.error("Error al detener el reconocimiento de voz:", error)
    }
  }

  public toggle() {
    if (this.state.isListening) {
      this.stop()
    } else {
      this.start()
    }
  }

  public setLanguage(language: "es" | "en") {
    this.language = language

    if (this.recognition) {
      const langCode = language === "es" ? "es-ES" : "en-US"
      this.recognition.lang = langCode
    }
  }

  public registerCommand(command: VoiceCommand) {
    // Verificar si ya existe un comando con el mismo nombre
    const existingIndex = this.commands.findIndex((c) => c.command === command.command)

    if (existingIndex >= 0) {
      // Reemplazar el comando existente
      this.commands[existingIndex] = command
    } else {
      // Agregar nuevo comando
      this.commands.push(command)
    }
  }

  public registerCommands(commands: VoiceCommand[]) {
    commands.forEach((command) => this.registerCommand(command))
  }

  public unregisterCommand(commandName: string) {
    this.commands = this.commands.filter((c) => c.command !== commandName)
  }

  public getCommands(): VoiceCommand[] {
    return [...this.commands]
  }

  public getCommandsByCategory(category: VoiceCommand["category"]): VoiceCommand[] {
    return this.commands.filter((c) => c.category === category)
  }

  public subscribe(listener: (state: VoiceRecognitionState) => void) {
    this.listeners.push(listener)
    // Notificar inmediatamente con el estado actual
    listener(this.state)

    // Devolver función para cancelar la suscripción
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  public getState(): VoiceRecognitionState {
    return { ...this.state }
  }
}

// Crear una instancia singleton
let instance: VoiceRecognitionService | null = null

export function getVoiceRecognitionService(): VoiceRecognitionService {
  if (!instance) {
    instance = new VoiceRecognitionService()
  }
  return instance
}

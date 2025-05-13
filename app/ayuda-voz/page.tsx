"use client"

import { useState } from "react"
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"
import { useLanguage } from "@/hooks/use-language"
import { VoiceRecognitionIndicator } from "@/components/voice-recognition-indicator"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Navigation, Home, DollarSign, Settings, CreditCard } from "lucide-react"

export default function VoiceHelpPage() {
  const { getCommandsByCategory, isSupported } = useVoiceRecognition()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("general")

  // Obtener comandos por categoría
  const generalCommands = getCommandsByCategory("general")
  const navigationCommands = getCommandsByCategory("navigation")
  const budgetCommands = getCommandsByCategory("budget")
  const expenseCommands = getCommandsByCategory("expense")
  const incomeCommands = getCommandsByCategory("income")
  const settingsCommands = getCommandsByCategory("settings")

  if (!isSupported) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <PageHeader
          title={t("voice.helpTitle")}
          description={t("voice.helpDescription")}
          icon={<Mic className="h-6 w-6" />}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("voice.notSupported")}</CardTitle>
            <CardDescription>{t("voice.browserNotSupported")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("voice.tryDifferentBrowser")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-20">
      <PageHeader
        title={t("voice.helpTitle")}
        description={t("voice.helpDescription")}
        icon={<Mic className="h-6 w-6" />}
      />

      <div className="flex justify-center my-6">
        <VoiceRecognitionIndicator />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("voice.howToUse")}</CardTitle>
          <CardDescription>{t("voice.howToUseDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>{t("voice.step1")}</li>
            <li>{t("voice.step2")}</li>
            <li>{t("voice.step3")}</li>
            <li>{t("voice.step4")}</li>
          </ol>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">
            <Home className="h-4 w-4 mr-2" />
            {t("voice.generalCommands")}
          </TabsTrigger>
          <TabsTrigger value="navigation">
            <Navigation className="h-4 w-4 mr-2" />
            {t("voice.navigationCommands")}
          </TabsTrigger>
          <TabsTrigger value="finance">
            <DollarSign className="h-4 w-4 mr-2" />
            {t("voice.financeCommands")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t("voice.generalCommands")}</CardTitle>
              <CardDescription>{t("voice.generalCommandsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {generalCommands.map((command) => (
                  <li key={command.command} className="border-b pb-3">
                    <h3 className="font-medium">{command.description}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {command.phrases.map((phrase) => (
                        <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>{t("voice.navigationCommands")}</CardTitle>
              <CardDescription>{t("voice.navigationCommandsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {navigationCommands.map((command) => (
                  <li key={command.command} className="border-b pb-3">
                    <h3 className="font-medium">{command.description}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {command.phrases.map((phrase) => (
                        <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>{t("voice.financeCommands")}</CardTitle>
              <CardDescription>{t("voice.financeCommandsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Comandos de presupuesto */}
                {budgetCommands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center mb-3">
                      <Home className="h-4 w-4 mr-2" />
                      {t("voice.budgetCommands")}
                    </h3>
                    <ul className="space-y-4">
                      {budgetCommands.map((command) => (
                        <li key={command.command} className="border-b pb-3">
                          <h4 className="font-medium">{command.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {command.phrases.map((phrase) => (
                              <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                                "{phrase}"
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comandos de gastos */}
                {expenseCommands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center mb-3">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t("voice.expenseCommands")}
                    </h3>
                    <ul className="space-y-4">
                      {expenseCommands.map((command) => (
                        <li key={command.command} className="border-b pb-3">
                          <h4 className="font-medium">{command.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {command.phrases.map((phrase) => (
                              <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                                "{phrase}"
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comandos de ingresos */}
                {incomeCommands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center mb-3">
                      <DollarSign className="h-4 w-4 mr-2" />
                      {t("voice.incomeCommands")}
                    </h3>
                    <ul className="space-y-4">
                      {incomeCommands.map((command) => (
                        <li key={command.command} className="border-b pb-3">
                          <h4 className="font-medium">{command.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {command.phrases.map((phrase) => (
                              <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                                "{phrase}"
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comandos de configuración */}
                {settingsCommands.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm flex items-center mb-3">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("voice.settingsCommands")}
                    </h3>
                    <ul className="space-y-4">
                      {settingsCommands.map((command) => (
                        <li key={command.command} className="border-b pb-3">
                          <h4 className="font-medium">{command.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{t("voice.sayOneOf")}:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {command.phrases.map((phrase) => (
                              <span key={phrase} className="bg-muted px-2 py-1 rounded-md text-xs">
                                "{phrase}"
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mensaje si no hay comandos */}
                {budgetCommands.length === 0 &&
                  expenseCommands.length === 0 &&
                  incomeCommands.length === 0 &&
                  settingsCommands.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">{t("voice.noFinanceCommands")}</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

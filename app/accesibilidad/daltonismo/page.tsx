"use client"

import { PageHeader } from "@/components/page-header"
import { ColorBlindnessSimulator } from "@/components/color-blindness-simulator"
import { useTranslations } from "@/hooks/use-translations"

export default function ColorBlindnessPage() {
  const { t } = useTranslations()

  return (
    <div className="container pb-24">
      <PageHeader title={t("colorBlindnessGuide")} description={t("colorBlindnessGuideDescription")} />

      <div className="space-y-6">
        <p className="text-muted-foreground">{t("colorBlindnessExplanation")}</p>

        <ColorBlindnessSimulator />

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{t("colorBlindnessTypes")}</h2>

          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">
                {t("protanopia")} ({t("redDeficiency")})
              </h3>
              <p className="mt-2 text-muted-foreground">{t("protanopiaDescription")}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">
                {t("deuteranopia")} ({t("greenDeficiency")})
              </h3>
              <p className="mt-2 text-muted-foreground">{t("deuteranopiaDescription")}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">
                {t("tritanopia")} ({t("blueDeficiency")})
              </h3>
              <p className="mt-2 text-muted-foreground">{t("tritanopiaDescription")}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">
                {t("achromatopsia")} ({t("noColor")})
              </h3>
              <p className="mt-2 text-muted-foreground">{t("achromatopsiaDescription")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

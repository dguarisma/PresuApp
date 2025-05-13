import { ColorBlindnessGuide } from "@/components/color-blindness-guide"
import { PageHeader } from "@/components/page-header"

export default function ColorBlindnessGuidePage() {
  return (
    <div className="container px-4 py-6">
      <PageHeader
        title="Guía de Daltonismo"
        description="Aprende cómo ven los colores las personas con diferentes tipos de daltonismo"
        backUrl="/accesibilidad"
      />
      <ColorBlindnessGuide />
    </div>
  )
}

import { Documentation } from "@/components/documentation"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-full">
      <div className="p-4 flex flex-col min-h-[100vh]">
        <div className="flex justify-center py-2 mb-2">
          <Link href="/">
            <img src="/logo.png" alt="PresuApp Logo" className="h-10" />
          </Link>
        </div>
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Button variant="ghost" asChild className="mr-2 rounded-full h-8 w-8 p-0" aria-label="Volver">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Documentación</h1>
          </div>
          <ModeToggle />
        </header>
        <main className="py-4">
          <Documentation />
        </main>
        <footer className="mt-8 text-center text-xs text-muted-foreground py-4">
          © {new Date().getFullYear()} PresuApp - Controla tus gastos, alcanza tus metas
        </footer>
      </div>
    </div>
  )
}

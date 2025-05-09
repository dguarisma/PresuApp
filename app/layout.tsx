import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TranslationProvider } from "@/contexts/translation-context"
import { LoadingProvider } from "@/components/loading-overlay"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { NavigationMenu } from "@/components/navigation-menu"

// Importar el NotificationProvider en lugar del NotificationChecker
import { NotificationProvider } from "@/components/notification-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PresuApp - Gestión de Gastos",
  description: "Aplicación para gestionar tus gastos y presupuestos",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
  ],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="PresuApp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PresuApp" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={inter.className}>
        <TranslationProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LoadingProvider>
              <div className="mobile-container pb-16">{children}</div>
              <NavigationMenu />
              <Toaster />
              {/* Colocar el NotificationProvider dentro de los contextos adecuados */}
              <NotificationProvider />
            </LoadingProvider>
          </ThemeProvider>
        </TranslationProvider>
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}

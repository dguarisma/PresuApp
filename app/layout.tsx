import type React from "react"
import "@/app/globals.css"
import "@/app/accessibility-styles.css"
import "@/app/color-blindness.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { TranslationProvider } from "@/contexts/translation-context"
import { LoadingProvider } from "@/components/loading-overlay"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { NavigationMenu } from "@/components/navigation-menu"
import { SplashScreen } from "@/components/splash-screen"
import { StatusBar } from "@/components/status-bar"
import { PageTransition } from "@/components/page-transition"
import { RoutePrefetcher } from "@/components/route-prefetcher"

// Importar el NotificationProvider en lugar del NotificationChecker
import { NotificationProvider } from "@/components/notification-provider"

// Importar el componente de control por voz flotante
import { VoiceControlFloating } from "@/components/voice-control-floating"

// Importar el componente GestureTutorial
import { GestureTutorial } from "@/components/gesture-tutorial"

// Importar el componente de filtros para daltonismo
import { ColorBlindnessFilters } from "@/components/color-blindness-filters"

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

// Modificar la etiqueta meta viewport para permitir escalado en iOS
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
  viewportFit: "cover",
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
      <body className={`${inter.className} overflow-x-hidden`}>
        <ColorBlindnessFilters />
        <TranslationProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LoadingProvider>
              {/* La pantalla de carga ahora solo se muestra en la primera carga de la sesión */}
              <SplashScreen />
              <StatusBar />
              <div className="bg-background transition-colors duration-300 overflow-x-hidden">
                <PageTransition>
                  <div className="mobile-container pb-24 overflow-x-hidden">{children}</div>
                </PageTransition>
                <GestureTutorial />
              </div>
              <NavigationMenu />
              <Toaster />
              {/* Componente para precargar rutas */}
              <RoutePrefetcher />
              {/* Colocar el NotificationProvider dentro de los contextos adecuados */}
              <NotificationProvider />
              {/* Añadir el componente justo antes del cierre del componente LoadingProvider */}
              <VoiceControlFloating />
            </LoadingProvider>
          </ThemeProvider>
        </TranslationProvider>
        <Script src="/register-sw.js" strategy="afterInteractive" />

        {/* Script para limpiar sessionStorage al cerrar la pestaña o navegador */}
        <Script id="clear-session-on-unload">
          {`
            window.addEventListener('beforeunload', function() {
              // Si el usuario cierra la pestaña o navegador, limpiar para que la próxima vez se muestre el splash
              if (!window.performance.navigation.type === 1) { // No es una recarga
                sessionStorage.removeItem('appHasLoaded');
              }
            });
          `}
        </Script>
        <Script id="speed-insights" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "jnizlsyf9n");
          `}
        </Script>
        {/* Filtros SVG para daltonismo */}
        <svg className="absolute w-0 h-0 overflow-hidden">
          <defs>
            <filter id="protanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.567, 0.433, 0, 0, 0
                0.558, 0.442, 0, 0, 0
                0, 0.242, 0.758, 0, 0
                0, 0, 0, 1, 0"
              />
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.625, 0.375, 0, 0, 0
                0.7, 0.3, 0, 0, 0
                0, 0.3, 0.7, 0, 0
                0, 0, 0, 1, 0"
              />
            </filter>
            <filter id="tritanopia-filter">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.95, 0.05, 0, 0, 0
                0, 0.433, 0.567, 0, 0
                0, 0.475, 0.525, 0, 0
                0, 0, 0, 1, 0"
              />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  )
}

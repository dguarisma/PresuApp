"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { ErrorBoundary } from "react-error-boundary"

// Fallback component that renders nothing
function ErrorFallback() {
  return null
}

export function AnalyticsProvider() {
  // Only render in production and in the browser
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SpeedInsights />
    </ErrorBoundary>
  )
}

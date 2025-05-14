"use client"

import { SpeedInsights } from "@vercel/speed-insights/next"
import { ErrorBoundary } from "react-error-boundary"

// Fallback component that renders nothing
function ErrorFallback() {
  return null
}

export function AnalyticsProvider() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SpeedInsights />
    </ErrorBoundary>
  )
}

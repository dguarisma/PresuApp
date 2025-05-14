"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// This component will only be used in production
// It dynamically imports AnalyticsProvider with ssr: false
const AnalyticsProvider = dynamic(() => import("./analytics-provider").then((mod) => mod.AnalyticsProvider), {
  ssr: false,
})

export function AnalyticsLoader() {
  // Only render in production and in the browser
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Check if we're in production and in the browser
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      setShouldRender(true)
    }
  }, [])

  if (!shouldRender) return null

  return <AnalyticsProvider />
}

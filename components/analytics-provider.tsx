"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import SpeedInsights with no SSR
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights), {
  ssr: false,
})

export function AnalyticsProvider() {
  // Check if we're in production environment (client-side)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Only set to true in production environment
    setIsProduction(process.env.NODE_ENV === "production")
  }, [])

  // Only render in production
  if (!isProduction) return null

  return <SpeedInsights />
}

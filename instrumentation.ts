export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { registerSpeedInsights } = await import("@vercel/speed-insights")
      registerSpeedInsights()
    } catch (error) {
      // Silently fail to prevent build errors
      console.warn("Could not register Speed Insights instrumentation:", error)
    }
  }
}

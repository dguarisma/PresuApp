export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      // Only attempt to load in Node.js environment
      const mod = await import("@vercel/speed-insights/next/instrumentation")
      if (typeof mod.register === "function") {
        await mod.register()
      }
    }
  } catch (error) {
    // Silently fail to prevent build errors
    console.warn("Could not register Speed Insights instrumentation:", error)
  }
}

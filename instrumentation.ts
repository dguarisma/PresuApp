export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@vercel/speed-insights/next/instrumentation")
      .then((mod) => mod.register())
      .catch((err) => console.error("Error registering Speed Insights instrumentation:", err))
  }
}

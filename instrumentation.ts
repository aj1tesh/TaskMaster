export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/db");
    try {
      await connectDB();
    } catch (err) {
      console.error("[instrumentation] MongoDB warm-up failed:", err);
    }
  }
}

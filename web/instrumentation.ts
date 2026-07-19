// Next.js instrumentation hook — registers the Langfuse OTEL span processor.
// Runs once per server start. Traces no-op if LANGFUSE_* env vars are absent.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { NodeTracerProvider } = await import("@opentelemetry/sdk-trace-node");
  const { langfuseSpanProcessor } = await import("./lib/langfuseProcessor");
  const provider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
  });
  provider.register();
}

// Next.js instrumentation hook — registers the Langfuse OTEL span processor.
// Runs once per server start. Traces no-op if LANGFUSE_* env vars are absent.
import { LangfuseSpanProcessor } from "@langfuse/otel";

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { NodeTracerProvider } = await import("@opentelemetry/sdk-trace-node");
  const provider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
  });
  provider.register();
}

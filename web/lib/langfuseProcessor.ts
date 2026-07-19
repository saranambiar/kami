// Shared Langfuse OTEL processor — kept outside instrumentation.ts so app
// code can import it without confusing Turbopack's instrumentation loader.
import { LangfuseSpanProcessor } from "@langfuse/otel";

export const langfuseSpanProcessor = new LangfuseSpanProcessor();

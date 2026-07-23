import { logAgentRunAsync } from "@/lib/agentRunLog";
import { traceGatewayCall } from "@/lib/tracing";

const GATEWAY = process.env.HERMES_GATEWAY_URL ?? "http://127.0.0.1:8642/v1/chat/completions";
const KEY = process.env.HERMES_API_KEY;

// Fluid compute: Hobby/Pro default max is 300s. Pro can go higher (800+).
export const maxDuration = 300;

function extractSseText(chunk: string): string {
  let out = "";
  for (const line of chunk.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload) as {
        choices?: { delta?: { content?: string }; message?: { content?: string } }[];
      };
      const delta = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content;
      if (typeof delta === "string") out += delta;
    } catch {
      /* ignore partial frames */
    }
  }
  return out;
}

export async function POST(request: Request): Promise<Response> {
  if (!KEY) {
    return Response.json({ error: "HERMES_API_KEY not configured" }, { status: 500 });
  }
  const body = await request.text();
  const sessionId = request.headers.get("x-hermes-session-id");
  const kamiSessionId = request.headers.get("x-kami-session-id");
  const kind = request.headers.get("x-kami-run-kind") || "chat_stream";
  const agent = request.headers.get("x-kami-agent") || "chat";

  let parsed: { model?: string; stream?: boolean; messages?: { content?: string }[] } = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    /* forward as-is */
  }

  const inputPreview = parsed.messages?.at(-1)?.content ?? null;
  const model = parsed.model ?? "unknown";
  const started = Date.now();

  const trace = traceGatewayCall({
    name: "kami-chat",
    sessionId,
    model,
    input: inputPreview?.slice(0, 4000) ?? null,
  });

  try {
    const upstream = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        ...(sessionId ? { "X-Hermes-Session-Id": sessionId } : {}),
      },
      body,
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => "");
      logAgentRunAsync({
        sessionId: kamiSessionId,
        hermesSessionId: sessionId,
        source: "hermes_stream",
        kind,
        agent,
        status: "error",
        model,
        input: inputPreview,
        error: `HTTP ${upstream.status}: ${errText.slice(0, 500)}`,
        durationMs: Date.now() - started,
      });
      trace.fail(`HTTP ${upstream.status}`);
      return new Response(errText || upstream.statusText, { status: upstream.status });
    }

    const [toClient, toLog] = upstream.body.tee();
    const traced = trace.wrap(
      new Response(toClient, {
        status: upstream.status,
        headers: upstream.headers,
      }),
    );

    // Consume log tee after response starts — does not block client stream.
    void (async () => {
      try {
        const reader = toLog.getReader();
        const decoder = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += extractSseText(decoder.decode(value, { stream: true }));
        }
        logAgentRunAsync({
          sessionId: kamiSessionId,
          hermesSessionId: sessionId,
          source: "hermes_stream",
          kind,
          agent,
          status: full.trim() ? "ok" : "error",
          model,
          input: inputPreview,
          outputText: full.trim() ? full : null,
          error: full.trim() ? null : "empty stream content",
          durationMs: Date.now() - started,
        });
      } catch (err) {
        logAgentRunAsync({
          sessionId: kamiSessionId,
          hermesSessionId: sessionId,
          source: "hermes_stream",
          kind,
          agent,
          status: "error",
          model,
          input: inputPreview,
          error: err instanceof Error ? err.message : "stream log failed",
          durationMs: Date.now() - started,
        });
      }
    })();

    return new Response(traced.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "gateway unreachable";
    trace.fail(message);
    logAgentRunAsync({
      sessionId: kamiSessionId,
      hermesSessionId: sessionId,
      source: "hermes_stream",
      kind,
      agent,
      status: "error",
      model,
      input: inputPreview,
      error: message,
      durationMs: Date.now() - started,
    });
    return Response.json({ error: `Hermes gateway error: ${message}` }, { status: 502 });
  }
}

import { traceGatewayCall } from "@/lib/tracing";

const GATEWAY = process.env.HERMES_GATEWAY_URL ?? "http://127.0.0.1:8642/v1/chat/completions";
const KEY = process.env.HERMES_API_KEY;

export const maxDuration = 600;

export async function POST(request: Request): Promise<Response> {
  if (!KEY) {
    return Response.json({ error: "HERMES_API_KEY not configured" }, { status: 500 });
  }
  const body = await request.text();
  const sessionId = request.headers.get("x-hermes-session-id");

  let parsed: { model?: string; messages?: { content?: string }[] } = {};
  try {
    parsed = JSON.parse(body);
  } catch {
    /* forward as-is */
  }

  const trace = traceGatewayCall({
    name: "kami-chat",
    sessionId,
    model: parsed.model ?? "unknown",
    input: parsed.messages?.at(-1)?.content?.slice(0, 4000) ?? null,
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

    const wrapped = trace.wrap(upstream);
    return new Response(wrapped.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "gateway unreachable";
    trace.fail(message);
    return Response.json({ error: `Hermes gateway error: ${message}` }, { status: 502 });
  }
}

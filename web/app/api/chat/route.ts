const GATEWAY = process.env.HERMES_GATEWAY_URL ?? "http://127.0.0.1:8642/v1/chat/completions";
const KEY = process.env.HERMES_API_KEY;

export const maxDuration = 600;

export async function POST(request: Request): Promise<Response> {
  if (!KEY) {
    return Response.json({ error: "HERMES_API_KEY not configured" }, { status: 500 });
  }
  const body = await request.text();
  const sessionId = request.headers.get("x-hermes-session-id");

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

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "gateway unreachable";
    return Response.json({ error: `Hermes gateway error: ${message}` }, { status: 502 });
  }
}

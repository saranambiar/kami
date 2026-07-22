/**
 * Non-streaming Hermes gateway helper for server-side route handlers.
 * Times out and returns null so callers can fall back deterministically.
 */

const GATEWAY =
  process.env.HERMES_GATEWAY_URL ?? "http://127.0.0.1:8642/v1/chat/completions";
const KEY = process.env.HERMES_API_KEY;

const DEFAULT_TIMEOUT_MS = 90_000;

export function hermesGatewayConfigured(): boolean {
  return Boolean(KEY);
}

export interface HermesChatParams {
  content: string;
  sessionId?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * One-shot completion. Returns assistant text or null on timeout / misconfig / error.
 */
export async function hermesChatOnce(params: HermesChatParams): Promise<string | null> {
  if (!KEY) return null;

  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        ...(params.sessionId ? { "X-Hermes-Session-Id": params.sessionId } : {}),
      },
      body: JSON.stringify({
        model: params.model ?? "gpt-5.4",
        stream: false,
        messages: [{ role: "user", content: params.content }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as {
      choices?: { message?: { content?: string } }[];
    } | null;
    const text = json?.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim() ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Extract the last fenced ```json block from agent output. */
export function parseLastJsonBlock(text: string): unknown | null {
  const matches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  const last = matches.at(-1)?.[1];
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

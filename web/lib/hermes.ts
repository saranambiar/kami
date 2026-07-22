export interface IcpBucket {
  label: string;
  where_they_live: string;
  trigger_signal: string;
  est_size: string;
  angle: string;
}

export interface Opportunity {
  title: string;
  playbook: string;
  detail: string;
}

export interface Dossier {
  company: string;
  brand_voice: string;
  positioning: string;
  tone?: string[];
  competitor_analysis: { name: string; insight: string }[];
  icp_buckets: IcpBucket[];
  opportunities: Opportunity[];
  /** Domain-truth fields */
  canonical_domain?: string;
  identity_confidence?: number;
  evidence_urls?: string[];
  product_category?: string;
  industries?: string[];
  personas?: string[];
  geos?: string[];
}

export function newSessionId(): string {
  return `kami-ui-${Date.now()}`;
}

/**
 * POST a message to the Hermes gateway via /api/chat and stream the
 * assistant text back through onDelta. Returns the full text.
 */
export async function streamChat(
  content: string,
  sessionId: string,
  onDelta: (text: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Hermes-Session-Id": sessionId,
    },
    body: JSON.stringify({
      model: "gpt-5.4",
      stream: true,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gateway error ${res.status}: ${text.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta: string =
          json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? "";
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      } catch {
        // partial JSON across chunks
      }
    }
  }

  if (!full && buffer.trim().startsWith("{")) {
    try {
      const json = JSON.parse(buffer);
      full = json.choices?.[0]?.message?.content ?? "";
      if (full) onDelta(full);
    } catch {
      /* leave empty */
    }
  }

  return full;
}

/** Extract the last fenced ```json block from agent output (raw, unvalidated). */
export function parseDossierRaw(text: string): unknown | null {
  const matches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  const last = matches.at(-1)?.[1];
  if (!last) return null;
  try {
    return JSON.parse(last);
  } catch {
    return null;
  }
}

/** @deprecated Use parseDossierRaw + validateDossier */
export function parseDossier(text: string): Dossier | null {
  const raw = parseDossierRaw(text);
  if (!raw || typeof raw !== "object" || !("icp_buckets" in (raw as object))) return null;
  return raw as Dossier;
}

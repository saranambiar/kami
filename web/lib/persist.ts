// Fire-and-forget persistence helpers. All no-op gracefully when Supabase is unconfigured.

export async function createSession(params: {
  hermesSessionId: string;
  domain: string;
  goals: string[];
  stage: string | null;
}): Promise<string | null> {
  try {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    return json.id ?? null;
  } catch {
    return null;
  }
}

export function persist(
  sessionDbId: string | null,
  type: "dossier" | "dossier_update" | "activity" | "message" | "status" | "opportunity_status",
  payload: Record<string, unknown>,
): void {
  if (!sessionDbId) return;
  void fetch(`/api/sessions/${sessionDbId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, payload }),
  }).catch(() => {});
}

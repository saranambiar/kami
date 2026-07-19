import { supabaseServer } from "@/lib/supabase";
import type { SalesChannel } from "@/lib/salesTypes";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ entries: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ entries: [] });

  const { data, error } = await sb
    .from("sales_suppression_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ entries: data ?? [] });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { session_id, identifier, reason, channel, source, scope, actor } = body as {
    session_id: string;
    identifier: string;
    reason: string;
    channel?: SalesChannel;
    source?: string;
    scope?: string;
    actor?: string;
  };

  if (!session_id || !identifier || !reason) {
    return Response.json({ error: "session_id, identifier, and reason required" }, { status: 400 });
  }

  const normalized = identifier.trim().toLowerCase();
  const row = {
    session_id,
    identifier: normalized,
    reason,
    channel: channel ?? null,
    source: source ?? "user",
    scope: scope ?? "session",
    actor: actor ?? "user",
  };

  const { data: existing } = await sb
    .from("sales_suppression_entries")
    .select("id")
    .eq("session_id", session_id)
    .eq("identifier", normalized)
    .maybeSingle();

  let data;
  let error;
  if (existing) {
    ({ data, error } = await sb
      .from("sales_suppression_entries")
      .update(row)
      .eq("id", existing.id)
      .select("*")
      .single());
  } else {
    ({ data, error } = await sb.from("sales_suppression_entries").insert(row).select("*").single());
  }

  if (error) return Response.json({ error: error.message }, { status: 500 });

  await sb.from("sales_audit_events").insert({
    session_id,
    actor: actor ?? "user",
    action: "suppression_added",
    entity_type: "sales_suppression_entry",
    entity_id: data.id,
    payload: { identifier: normalized, reason },
  });

  return Response.json({ persisted: true, entry: data });
}

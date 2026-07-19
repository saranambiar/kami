import { supabaseServer } from "@/lib/supabase";
import type { SalesChannel, SalesConversation } from "@/lib/salesTypes";

function rowToConversation(row: Record<string, unknown>): SalesConversation {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    account_id: row.account_id as string | undefined,
    contact_id: row.contact_id as string | undefined,
    channel: row.channel as SalesChannel,
    status: row.status as string,
    last_message_at: row.last_message_at as string | undefined,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ conversations: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ conversations: [] });

  const { data, error } = await sb
    .from("sales_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversations: (data ?? []).map(rowToConversation) });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const body = await request.json();
  const { session_id, account_id, contact_id, channel, status } = body as {
    session_id: string;
    account_id?: string;
    contact_id?: string;
    channel: SalesChannel;
    status?: string;
  };

  if (!session_id || !channel) {
    return Response.json({ error: "session_id and channel required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("sales_conversations")
    .insert({
      session_id,
      account_id: account_id ?? null,
      contact_id: contact_id ?? null,
      channel,
      status: status ?? "open",
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversation: rowToConversation(data) });
}

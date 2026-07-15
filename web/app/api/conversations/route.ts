import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ conversations: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");

  let query = sb
    .from("conversations")
    .select("*, marketing_crm!inner(session_id, handle, platform)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (sessionId) {
    query = query.eq("marketing_crm.session_id", sessionId);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversations: data ?? [] });
}

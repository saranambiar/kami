import { supabaseServer } from "@/lib/supabase";

// GET: list connected accounts (tokens never returned).
export async function GET(): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ accounts: [] });
  const { data } = await sb
    .from("connected_accounts")
    .select("id, platform, handle, status, created_at")
    .order("created_at");
  return Response.json({ accounts: data ?? [] });
}

// POST: register a pending connection for platforms without a real flow yet
// (X connects via /api/auth/x/login OAuth instead).
export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  const { platform, handle } = await request.json();
  if (!platform) return Response.json({ error: "platform required" }, { status: 400 });
  if (platform === "x") {
    return Response.json({ error: "connect X via /api/auth/x/login" }, { status: 400 });
  }
  if (!sb) return Response.json({ persisted: false, status: "pending" });

  const { data, error } = await sb
    .from("connected_accounts")
    .insert({ platform, handle: handle ?? null, status: "pending" })
    .select("id, platform, handle, status")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, account: data });
}

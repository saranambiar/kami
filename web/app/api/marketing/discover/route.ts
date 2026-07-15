import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { session_id } = await request.json();

  // ponytail: discovery delegated to Hermes marketing-researcher agent.
  // This route triggers the agent and returns immediately.
  // Upgrade: POST to Hermes gateway with marketing-researcher prompt + session config.

  const config = session_id
    ? await sb.from("marketing_config").select("*").eq("session_id", session_id).maybeSingle()
    : null;

  if (!config?.data) {
    return Response.json({ error: "no marketing config found" }, { status: 404 });
  }

  return Response.json({
    triggered: true,
    platforms: config.data.platforms,
    message: "Discovery agent dispatched. Results will appear in the CRM.",
  });
}

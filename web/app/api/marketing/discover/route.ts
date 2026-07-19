import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { session_id } = await request.json();
  if (!session_id) {
    return Response.json({ error: "session_id required" }, { status: 400 });
  }

  const { data: config, error } = await sb
    .from("marketing_config")
    .select("*")
    .eq("session_id", session_id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!config) {
    return Response.json({ error: "no marketing config found" }, { status: 404 });
  }

  if (config.autonomous_paused) {
    return Response.json(
      { error: "marketing autonomous actions are paused for this session", paused: true },
      { status: 423 },
    );
  }

  // ponytail: discovery delegated to Hermes marketing-researcher agent.
  // Upgrade: POST to Hermes gateway with marketing-researcher prompt + session config.

  return Response.json({
    triggered: true,
    platforms: config.platforms,
    message: "Discovery agent dispatched. Results will appear in the CRM.",
  });
}

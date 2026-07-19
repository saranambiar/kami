import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ config: null });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ config: null });

  const { data } = await sb
    .from("marketing_config")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  return Response.json({ config: data });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const {
    session_id,
    platforms,
    x_boost_budget,
    x_outreach_goal,
    ig_offer_min,
    ig_offer_max,
    ig_niche_keywords,
    ig_min_followers,
    tone,
    autonomous_paused,
  } = body;

  if (!session_id || !platforms?.length) {
    return Response.json({ error: "session_id and platforms required" }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    session_id,
    platforms,
    x_boost_budget: x_boost_budget ?? null,
    x_outreach_goal: x_outreach_goal ?? null,
    ig_offer_min: ig_offer_min ?? null,
    ig_offer_max: ig_offer_max ?? null,
    ig_niche_keywords: ig_niche_keywords ?? null,
    ig_min_followers: ig_min_followers ?? 5000,
    tone: tone ?? null,
    updated_at: new Date().toISOString(),
  };
  if (typeof autonomous_paused === "boolean") {
    row.autonomous_paused = autonomous_paused;
  }

  const { data, error } = await sb
    .from("marketing_config")
    .upsert(row, { onConflict: "session_id" })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, id: data.id, config: data });
}

export async function PATCH(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const { session_id, autonomous_paused } = await request.json();
  if (!session_id || typeof autonomous_paused !== "boolean") {
    return Response.json({ error: "session_id and autonomous_paused required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("marketing_config")
    .update({
      autonomous_paused,
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", session_id)
    .select("*")
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "no marketing config found" }, { status: 404 });

  return Response.json({ persisted: true, config: data });
}

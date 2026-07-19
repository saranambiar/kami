import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { session_id, scope } = body as { session_id?: string; scope?: string };

  if (!session_id || !scope) {
    return Response.json({ error: "session_id and scope required" }, { status: 400 });
  }

  const { data: campaign } = await sb
    .from("sales_campaigns")
    .select("id, session_id")
    .eq("session_id", session_id)
    .maybeSingle();

  if (!campaign) {
    return Response.json({ error: "sales campaign not configured" }, { status: 400 });
  }

  const { data: existing } = await sb
    .from("sales_approvals")
    .select("id, status")
    .eq("sales_campaign_id", campaign.id)
    .eq("scope", scope)
    .maybeSingle();

  if (existing?.status === "approved") {
    return Response.json({ persisted: true, approval: existing });
  }

  if (existing) {
    const { data, error } = await sb
      .from("sales_approvals")
      .update({ status: "approved", decided_at: new Date().toISOString(), actor: "user" })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ persisted: true, approval: data });
  }

  const { data, error } = await sb
    .from("sales_approvals")
    .insert({
      session_id,
      sales_campaign_id: campaign.id,
      scope,
      status: "approved",
      actor: "user",
      decided_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, approval: data });
}

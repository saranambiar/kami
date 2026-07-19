import { supabaseServer } from "@/lib/supabase";
import { linkupConfigured } from "@/lib/linkup";
import { researchSalesTargets } from "@/lib/salesResearch";
import type { SalesIcp } from "@/lib/salesTypes";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  if (!linkupConfigured()) {
    return Response.json(
      { error: "Linkup API not configured — set LINKUP_API_KEY to run sales discovery" },
      { status: 503 },
    );
  }

  const { session_id } = await request.json();
  if (!session_id) {
    return Response.json({ error: "session_id required" }, { status: 400 });
  }

  const { data: campaign, error: campErr } = await sb
    .from("sales_campaigns")
    .select("*")
    .eq("session_id", session_id)
    .maybeSingle();

  if (campErr) return Response.json({ error: campErr.message }, { status: 500 });
  if (!campaign) {
    return Response.json({ error: "no sales campaign found — run setup first" }, { status: 404 });
  }

  if (campaign.autonomous_paused) {
    return Response.json(
      { error: "sales autonomous actions are paused for this session", paused: true },
      { status: 423 },
    );
  }

  const { data: approvedPlan } = await sb
    .from("sales_plans")
    .select("id, status")
    .eq("session_id", session_id)
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!approvedPlan) {
    return Response.json(
      { error: "no approved sales plan — approve the plan before running discovery" },
      { status: 400 },
    );
  }

  const { data: session, error: sessErr } = await sb
    .from("agent_sessions")
    .select("domain")
    .eq("id", session_id)
    .maybeSingle();

  if (sessErr) return Response.json({ error: sessErr.message }, { status: 500 });
  if (!session?.domain) {
    return Response.json({ error: "session domain not found" }, { status: 400 });
  }

  let researched;
  try {
    researched = await researchSalesTargets({
      domain: session.domain,
      icp: campaign.icp as SalesIcp,
      exclusions: campaign.exclusions ?? [],
      targetQuantity: campaign.target_quantity ?? 50,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "discovery failed";
    if (msg === "LINKUP_NOT_CONFIGURED") {
      return Response.json(
        { error: "Linkup API not configured — set LINKUP_API_KEY to run sales discovery" },
        { status: 503 },
      );
    }
    return Response.json({ error: msg }, { status: 500 });
  }

  const created: {
    id: string;
    name: string;
    domain: string;
    tier: number;
    pipeline_stage: string;
    signal_count: number;
  }[] = [];

  for (const acc of researched.accounts) {
    const row = {
      session_id,
      sales_campaign_id: campaign.id,
      name: acc.name,
      domain: acc.domain,
      industry: acc.industry ?? null,
      geo: acc.geo ?? null,
      pipeline_stage: "ready_for_approval",
      tier: acc.tier,
      notes: acc.notes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await sb
      .from("sales_accounts")
      .select("id")
      .eq("session_id", session_id)
      .eq("domain", acc.domain)
      .maybeSingle();

    let accountId: string;
    if (existing) {
      const { data, error } = await sb
        .from("sales_accounts")
        .update(row)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      accountId = data.id;
    } else {
      const { data, error } = await sb.from("sales_accounts").insert(row).select("id").single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      accountId = data.id;
    }

    const signalIds: string[] = [];
    if (acc.signals.length) {
      const signalRows = acc.signals.map((sig) => ({
        session_id,
        account_id: accountId,
        provider: sig.provider,
        signal_type: sig.signal_type,
        detail: sig.detail,
        source_url: sig.url,
        observed_at: sig.observed_at ?? null,
        captured_at: sig.captured_at,
        confidence: sig.confidence,
        evidence_text: sig.evidence_text,
      }));
      const { data: insertedSignals, error: sigErr } = await sb
        .from("sales_account_signals")
        .insert(signalRows)
        .select("id");
      if (sigErr) return Response.json({ error: sigErr.message }, { status: 500 });
      signalIds.push(...(insertedSignals ?? []).map((s) => s.id));
    }

    await sb.from("sales_lead_scores").insert({
      session_id,
      account_id: accountId,
      model_version: "v1-heuristic",
      factors: {
        fit: acc.score.fit,
        intent: acc.score.intent,
        contactability: acc.score.contactability,
        priority: acc.score.priority,
      },
      explanation: acc.score.explanation,
      evidence_refs: signalIds,
      recommended_tier: acc.tier,
      recommended_channel: (campaign.allowed_channels ?? ["email"])[0] ?? "email",
    });

    created.push({
      id: accountId,
      name: acc.name,
      domain: acc.domain,
      tier: acc.tier,
      pipeline_stage: "ready_for_approval",
      signal_count: acc.signals.length,
    });
  }

  await sb.from("sales_audit_events").insert({
    session_id,
    actor: "system",
    action: "discovery_completed",
    entity_type: "sales_campaign",
    entity_id: campaign.id,
    payload: {
      accounts_discovered: created.length,
      plan_id: approvedPlan.id,
      source: "linkup",
    },
  });

  return Response.json({
    discovered: true,
    count: created.length,
    accounts: created,
  });
}

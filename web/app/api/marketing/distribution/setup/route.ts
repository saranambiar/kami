import { dossierFromBrandPayload } from "@/lib/cmoContext";
import { recommendDistributionPlan } from "@/lib/distributionManager";
import type {
  DistributionCampaignConfig,
  DistributionPlatform,
  DistributionPlanStatus,
} from "@/lib/distributionTypes";
import { normalizeSurfaces } from "@/lib/distributionTypes";
import { supabaseServer } from "@/lib/supabase";

export const maxDuration = 120;

function mapDbError(message: string | undefined): string {
  const m = message ?? "database error";
  if (
    /distribution_campaigns|distribution_opportunities/i.test(m) &&
    /(schema cache|does not exist|Could not find the table)/i.test(m)
  ) {
    return "Distribution tables missing. Apply Supabase migrations 009 and 011, then retry.";
  }
  if (/column .* does not exist|goal_label|why_these_surfaces/i.test(m)) {
    return "Distribution plan columns missing. Apply Supabase migration 011_distribution_plan.sql, then retry.";
  }
  return m;
}

function rowToConfig(row: Record<string, unknown>): DistributionCampaignConfig {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    goal: (row.goal as string) ?? "early_users",
    goal_label: (row.goal_label as string) ?? undefined,
    angle: (row.angle as string) ?? undefined,
    surfaces: normalizeSurfaces(row.surfaces),
    rationale: (row.rationale as string) ?? undefined,
    why_these_surfaces: (row.why_these_surfaces as string) ?? undefined,
    status: (row.status as DistributionPlanStatus) ?? "proposed",
    revise_note: (row.revise_note as string) ?? undefined,
    source: row.source === "hermes" || row.source === "fallback" ? row.source : undefined,
    hermes_session_id: (row.hermes_session_id as string) ?? null,
    autonomous_paused: Boolean(row.autonomous_paused),
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ config: null });
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ error: "session_id required" }, { status: 400 });
  const { data } = await sb
    .from("distribution_campaigns")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  return Response.json({ config: data ? rowToConfig(data) : null });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "database not configured" }, { status: 503 });

  const body = await request.json();
  const session_id = body.session_id as string | undefined;
  if (!session_id) return Response.json({ error: "session_id required" }, { status: 400 });

  const action = (body.action as string | undefined) || "recommend";

  if (action === "approve") {
    const { data: existing } = await sb
      .from("distribution_campaigns")
      .select("*")
      .eq("session_id", session_id)
      .maybeSingle();
    if (!existing) {
      return Response.json({ error: "no distribution plan to approve" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      status: "approved",
      updated_at: new Date().toISOString(),
    };
    if (typeof body.goal === "string" && body.goal.trim()) patch.goal = body.goal.trim();
    if (typeof body.goal_label === "string") patch.goal_label = body.goal_label.trim();
    if (typeof body.angle === "string" && body.angle.trim()) patch.angle = body.angle.trim();
    if (Array.isArray(body.surfaces)) patch.surfaces = normalizeSurfaces(body.surfaces).slice(0, 3);
    if (typeof body.rationale === "string") patch.rationale = body.rationale.trim();
    if (typeof body.why_these_surfaces === "string") {
      patch.why_these_surfaces = body.why_these_surfaces.trim();
    }

    const { data, error } = await sb
      .from("distribution_campaigns")
      .update(patch)
      .eq("session_id", session_id)
      .select("*")
      .single();
    if (error) return Response.json({ error: mapDbError(error.message) }, { status: 500 });
    return Response.json({ config: rowToConfig(data) });
  }

  // recommend (default) or revise
  const revise_note =
    typeof body.revise_note === "string" && body.revise_note.trim()
      ? body.revise_note.trim()
      : undefined;

  const [session, brand] = await Promise.all([
    sb
      .from("agent_sessions")
      .select("domain, canonical_domain, hermes_session_id")
      .eq("id", session_id)
      .maybeSingle(),
    sb.from("brand_profiles").select("*").eq("session_id", session_id).maybeSingle(),
  ]);

  const domain = (session?.data?.canonical_domain ||
    session?.data?.domain ||
    "unknown") as string;
  const dossier = dossierFromBrandPayload(brand.data);
  const hermesSid =
    typeof session?.data?.hermes_session_id === "string"
      ? session.data.hermes_session_id
      : undefined;

  const result = await recommendDistributionPlan({
    sessionId: session_id,
    domain,
    dossier,
    reviseNote: revise_note,
    hermesSessionId: hermesSid,
  });

  const row = {
    session_id,
    goal: result.plan.goal,
    goal_label: result.plan.goal_label ?? null,
    angle: result.plan.angle ?? null,
    surfaces: result.plan.surfaces ?? [],
    rationale: result.plan.rationale ?? null,
    why_these_surfaces: result.plan.why_these_surfaces ?? null,
    status: "proposed" as const,
    revise_note: revise_note ?? null,
    source: result.source,
    hermes_session_id: result.plan.hermes_session_id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("distribution_campaigns")
    .upsert(row, { onConflict: "session_id" })
    .select("*")
    .single();

  if (error) return Response.json({ error: mapDbError(error.message) }, { status: 500 });
  return Response.json({
    config: rowToConfig(data),
    source: result.source,
    note: result.note ?? null,
  });
}

export async function PATCH(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "database not configured" }, { status: 503 });
  const body = await request.json();
  const session_id = body.session_id as string | undefined;
  if (!session_id) return Response.json({ error: "session_id required" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.autonomous_paused === "boolean") patch.autonomous_paused = body.autonomous_paused;
  if (typeof body.goal === "string") patch.goal = body.goal.trim();
  if (typeof body.goal_label === "string") patch.goal_label = body.goal_label.trim();
  if (typeof body.angle === "string") patch.angle = body.angle.trim();
  if (Array.isArray(body.surfaces)) {
    patch.surfaces = normalizeSurfaces(body.surfaces as DistributionPlatform[]).slice(0, 3);
  }
  if (typeof body.rationale === "string") patch.rationale = body.rationale.trim();
  if (typeof body.why_these_surfaces === "string") {
    patch.why_these_surfaces = body.why_these_surfaces.trim();
  }
  if (body.status === "proposed" || body.status === "approved" || body.status === "superseded") {
    patch.status = body.status;
  }

  const { data, error } = await sb
    .from("distribution_campaigns")
    .update(patch)
    .eq("session_id", session_id)
    .select("*")
    .single();
  if (error) return Response.json({ error: mapDbError(error.message) }, { status: 500 });
  return Response.json({ config: rowToConfig(data) });
}

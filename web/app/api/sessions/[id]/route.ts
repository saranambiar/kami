import { supabaseServer } from "@/lib/supabase";
import type { Dossier } from "@/lib/hermes";

// GET: load full session state for resume.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });
  const { id } = await params;

  const [session, brand, buckets, opportunities, activity] = await Promise.all([
    sb.from("agent_sessions").select("*").eq("id", id).single(),
    sb.from("brand_profiles").select("*").eq("session_id", id).maybeSingle(),
    sb.from("icp_buckets").select("*").eq("session_id", id).order("created_at"),
    sb.from("opportunities").select("*").eq("session_id", id).order("created_at"),
    sb.from("activity_events").select("*").eq("session_id", id).order("created_at"),
  ]);

  if (session.error) return Response.json({ error: session.error.message }, { status: 404 });
  return Response.json({
    session: session.data,
    brand: brand.data,
    buckets: buckets.data ?? [],
    opportunities: opportunities.data ?? [],
    activity: activity.data ?? [],
  });
}

interface PatchBody {
  type: "dossier" | "activity" | "message" | "status" | "opportunity_status";
  payload: Record<string, unknown>;
}

// PATCH: persist incremental updates. No-ops (200) when Supabase unconfigured.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });
  const { id } = await params;
  const { type, payload } = (await request.json()) as PatchBody;

  try {
    switch (type) {
      case "dossier": {
        const d = payload as unknown as Dossier;
        await sb.from("brand_profiles").insert({
          session_id: id,
          company: d.company,
          brand_voice: d.brand_voice,
          positioning: d.positioning,
          competitor_analysis: d.competitor_analysis,
          raw_dossier: d,
        });
        if (d.icp_buckets?.length) {
          await sb.from("icp_buckets").insert(
            d.icp_buckets.map((b) => ({
              session_id: id,
              label: b.label,
              where_they_live: b.where_they_live,
              trigger_signal: b.trigger_signal,
              est_size: b.est_size,
              angle: b.angle,
            })),
          );
        }
        if (d.opportunities?.length) {
          await sb.from("opportunities").insert(
            d.opportunities.map((o) => ({
              session_id: id,
              title: o.title,
              playbook: o.playbook,
              detail: o.detail,
            })),
          );
        }
        await sb.from("agent_sessions").update({ status: "done" }).eq("id", id);
        break;
      }
      case "activity":
        await sb.from("activity_events").insert({
          session_id: id,
          phase: payload.phase ?? null,
          message: payload.message,
        });
        break;
      case "message":
        await sb.from("messages").insert({
          session_id: id,
          role: payload.role,
          content: payload.content,
        });
        break;
      case "status":
        await sb.from("agent_sessions").update({ status: payload.status }).eq("id", id);
        break;
      case "opportunity_status":
        await sb
          .from("opportunities")
          .update({ status: payload.status, receipt: payload.receipt ?? null })
          .eq("session_id", id)
          .eq("title", payload.title);
        break;
    }
    return Response.json({ persisted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "persist failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

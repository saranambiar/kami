import { supabaseServer } from "@/lib/supabase";

// GET: outreach log joined with contact info, filterable by status.
export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ outreach: [], suppressed: [] });

  const status = new URL(request.url).searchParams.get("status");
  let query = sb
    .from("outreach_log")
    .select("*, contacts(name, handle, platform, company, title), agent_sessions(domain)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const [outreach, suppressed] = await Promise.all([
    query,
    sb.from("do_not_contact").select("*").order("created_at", { ascending: false }),
  ]);

  return Response.json({
    outreach: outreach.data ?? [],
    suppressed: suppressed.data ?? [],
  });
}

// POST: log an outreach entry (called on approve/execute).
export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { surface, draft, status, receipt, sessionDbId, opportunityId, contact } = body;
  if (!surface) return Response.json({ error: "surface required" }, { status: 400 });

  let contactId: string | null = null;
  if (contact?.handle) {
    const { data: existing } = await sb
      .from("contacts")
      .select("id")
      .eq("platform", surface)
      .eq("handle", contact.handle)
      .maybeSingle();
    if (existing) {
      contactId = existing.id;
    } else {
      const { data: created } = await sb
        .from("contacts")
        .insert({
          platform: surface,
          handle: contact.handle,
          name: contact.name ?? null,
          company: contact.company ?? null,
          title: contact.title ?? null,
          session_id: sessionDbId ?? null,
        })
        .select("id")
        .single();
      contactId = created?.id ?? null;
    }
  }

  const { data, error } = await sb
    .from("outreach_log")
    .insert({
      contact_id: contactId,
      session_id: sessionDbId ?? null,
      opportunity_id: opportunityId ?? null,
      surface,
      draft: draft ?? null,
      status: status ?? "drafted",
      receipt: receipt ?? null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, id: data.id });
}

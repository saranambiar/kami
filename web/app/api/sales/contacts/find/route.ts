import { supabaseServer } from "@/lib/supabase";
import { findContactForDomain } from "@/lib/salesContactFinder";

/**
 * Hermes + Linkup + site scrape contact lookup for accounts missing emails.
 * Never invents — only persists emails found on/attributed to the company domain.
 */
export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const body = await request.json();
  const { session_id, account_ids } = body as {
    session_id?: string;
    account_ids?: string[];
  };

  if (!session_id) {
    return Response.json({ error: "session_id required" }, { status: 400 });
  }

  let query = sb
    .from("sales_accounts")
    .select("id, name, domain, sales_campaign_id")
    .eq("session_id", session_id);

  if (account_ids?.length) {
    query = query.in("id", account_ids);
  }

  const { data: accounts, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!accounts?.length) {
    return Response.json({ found: 0, tried: 0, results: [], message: "No accounts to search" });
  }

  const results: {
    account_id: string;
    domain: string;
    email?: string;
    method?: string;
    source_url?: string;
    status: "found" | "not_found" | "already_had" | "skipped";
  }[] = [];

  let found = 0;

  for (const acc of accounts) {
    if (!acc.domain) {
      results.push({ account_id: acc.id, domain: "", status: "skipped" });
      continue;
    }

    const { data: existing } = await sb
      .from("sales_contacts")
      .select("id, email")
      .eq("account_id", acc.id)
      .eq("session_id", session_id)
      .not("email", "is", null)
      .maybeSingle();

    if (existing?.email) {
      results.push({
        account_id: acc.id,
        domain: acc.domain,
        email: existing.email,
        status: "already_had",
      });
      continue;
    }

    const contact = await findContactForDomain(acc.domain, acc.name, session_id);
    if (!contact?.email) {
      results.push({ account_id: acc.id, domain: acc.domain, status: "not_found" });
      continue;
    }

    const verification =
      contact.verification_status === "role_inbox"
        ? "safe_to_send"
        : contact.verification_status === "hermes_evidence"
          ? "valid"
          : contact.verification_status === "verified_public"
            ? "valid"
            : "unknown";

    const contactRow = {
      session_id,
      account_id: acc.id,
      sales_campaign_id: acc.sales_campaign_id ?? null,
      name: contact.name ?? acc.name,
      title: contact.title ?? null,
      email: contact.email,
      email_verification: verification,
      do_not_contact: false,
      updated_at: new Date().toISOString(),
    };

    const { data: existingContact } = await sb
      .from("sales_contacts")
      .select("id")
      .eq("account_id", acc.id)
      .eq("session_id", session_id)
      .maybeSingle();

    if (existingContact) {
      await sb.from("sales_contacts").update(contactRow).eq("id", existingContact.id);
    } else {
      await sb.from("sales_contacts").insert(contactRow);
    }

    // Bump contactability on latest score
    const { data: score } = await sb
      .from("sales_lead_scores")
      .select("id, factors")
      .eq("account_id", acc.id)
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (score?.factors && typeof score.factors === "object") {
      const factors = score.factors as Record<string, number>;
      const { data: fullScore } = await sb
        .from("sales_lead_scores")
        .select("explanation")
        .eq("id", score.id)
        .maybeSingle();
      const prev = typeof fullScore?.explanation === "string" ? fullScore.explanation : "";
      await sb
        .from("sales_lead_scores")
        .update({
          factors: { ...factors, contactability: 0.85 },
          explanation: `${prev} · Found ${contact.email} (${contact.method ?? "lookup"})`.trim(),
        })
        .eq("id", score.id);
    }

    found++;
    results.push({
      account_id: acc.id,
      domain: acc.domain,
      email: contact.email,
      method: contact.method,
      source_url: contact.source_url,
      status: "found",
    });
  }

  await sb.from("sales_audit_events").insert({
    session_id,
    actor: "system",
    action: "hermes_contact_lookup",
    entity_type: "sales_campaign",
    entity_id: null,
    payload: { found, tried: accounts.length, results },
  });

  return Response.json({
    found,
    tried: accounts.length,
    results,
    message:
      found > 0
        ? `Found ${found} contact email${found === 1 ? "" : "s"} via site scrape / Linkup / Hermes`
        : "No public emails found on company domains — add manually or uncheck those accounts",
  });
}

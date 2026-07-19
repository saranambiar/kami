import { supabaseServer } from "@/lib/supabase";
import type { AccountSignal, SalesAccount } from "@/lib/salesTypes";

function rowToAccount(row: Record<string, unknown>): SalesAccount {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    sales_campaign_id: row.sales_campaign_id as string | undefined,
    client_id: row.client_id as string | undefined,
    name: row.name as string,
    domain: row.domain as string | undefined,
    industry: row.industry as string | undefined,
    size: row.size as string | undefined,
    geo: row.geo as string | undefined,
    pipeline_stage: row.pipeline_stage as SalesAccount["pipeline_stage"],
    tier: row.tier as SalesAccount["tier"],
    notes: row.notes as string | undefined,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ accounts: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ accounts: [] });

  const { data: accounts } = await sb
    .from("sales_accounts")
    .select("*")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false });

  const accountIds = (accounts ?? []).map((a) => a.id);
  let signals: Record<string, unknown>[] = [];

  if (accountIds.length > 0) {
    const { data: sigData } = await sb
      .from("sales_account_signals")
      .select("*")
      .in("account_id", accountIds)
      .order("captured_at", { ascending: false });
    signals = sigData ?? [];
  }

  const signalsByAccount: Record<string, AccountSignal[]> = {};
  for (const s of signals) {
    const aid = s.account_id as string;
    if (!signalsByAccount[aid]) signalsByAccount[aid] = [];
    signalsByAccount[aid].push(s as unknown as AccountSignal);
  }

  return Response.json({
    accounts: (accounts ?? []).map((a) => ({
      ...rowToAccount(a),
      signals: signalsByAccount[a.id] ?? [],
    })),
  });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { session_id, accounts } = body as {
    session_id: string;
    accounts: (Partial<SalesAccount> & { signals?: Partial<AccountSignal>[] })[];
  };

  if (!session_id || !accounts?.length) {
    return Response.json({ error: "session_id and accounts required" }, { status: 400 });
  }

  const { data: campaign } = await sb
    .from("sales_campaigns")
    .select("id")
    .eq("session_id", session_id)
    .maybeSingle();

  const upserted: SalesAccount[] = [];

  for (const acc of accounts) {
    const row = {
      session_id,
      sales_campaign_id: campaign?.id ?? acc.sales_campaign_id ?? null,
      client_id: acc.client_id ?? null,
      name: acc.name,
      domain: acc.domain ?? null,
      industry: acc.industry ?? null,
      size: acc.size ?? null,
      geo: acc.geo ?? null,
      pipeline_stage: acc.pipeline_stage ?? "researching",
      tier: acc.tier ?? null,
      notes: acc.notes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await sb
      .from("sales_accounts")
      .select("id")
      .eq("session_id", session_id)
      .eq("domain", acc.domain ?? acc.name)
      .maybeSingle();

    let accountId: string;
    if (existing) {
      const { data, error } = await sb
        .from("sales_accounts")
        .update(row)
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      accountId = data.id;
      upserted.push(rowToAccount(data));
    } else {
      const { data, error } = await sb.from("sales_accounts").insert(row).select("*").single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      accountId = data.id;
      upserted.push(rowToAccount(data));
    }

    if (acc.signals?.length) {
      const signalRows = acc.signals.map((sig) => ({
        session_id,
        account_id: accountId,
        provider: sig.provider ?? "manual",
        signal_type: sig.signal_type ?? "unknown",
        detail: sig.detail ?? "",
        source_url: sig.source_url ?? null,
        observed_at: sig.observed_at ?? null,
        confidence: sig.confidence ?? null,
        evidence_text: sig.evidence_text ?? null,
      }));
      await sb.from("sales_account_signals").insert(signalRows);
    }
  }

  return Response.json({ persisted: true, accounts: upserted });
}

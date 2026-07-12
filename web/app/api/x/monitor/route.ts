import { getTweetMetrics, xConfigured } from "@/lib/x";
import { supabaseServer } from "@/lib/supabase";

// Refresh engagement on sent X posts (OAuth 1.0a user context reads).
export async function POST(): Promise<Response> {
  if (!xConfigured()) return Response.json({ error: "X not configured" }, { status: 503 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { data: sent } = await sb
    .from("outreach_log")
    .select("id, receipt, status")
    .eq("surface", "x")
    .in("status", ["sent", "replied"])
    .not("receipt->>post_id", "is", null)
    .limit(25);

  if (!sent?.length) return Response.json({ checked: 0, updated: 0 });

  const ids = sent
    .map((r) => (r.receipt as { post_id?: string })?.post_id)
    .filter((id): id is string => Boolean(id));

  try {
    const tweets = await getTweetMetrics(ids);
    let updated = 0;
    for (const tweet of tweets) {
      const row = sent.find((r) => (r.receipt as { post_id?: string })?.post_id === tweet.id);
      if (!row) continue;
      const metrics = tweet.public_metrics ?? {};
      await sb
        .from("outreach_log")
        .update({
          receipt: { ...(row.receipt as object), metrics },
          ...(metrics.reply_count > 0 ? { status: "replied" } : {}),
        })
        .eq("id", row.id);
      updated++;
    }
    return Response.json({ checked: sent.length, updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "monitor failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

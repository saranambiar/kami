import { supabaseServer } from "@/lib/supabase";

// Cron: poll all active conversations for new replies.
// In production, call this every 60s via Vercel Cron or external scheduler.
export async function POST(): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { data: active } = await sb
    .from("conversations")
    .select("id, crm_entry_id, platform, goal, persona_config, budget_min, budget_max, status")
    .in("status", ["awaiting_reply", "first_msg_sent"]);

  if (!active?.length) return Response.json({ checked: 0, replies: 0 });

  let replies = 0;

  for (const conv of active) {
    // ponytail: platform-specific reply checking deferred.
    // Real path: X API search for conversation replies, IG Messaging API for inbox.
    // When wired, each reply triggers conversation-agent via Hermes gateway.

    const { data: lastMsg } = await sb
      .from("conversation_messages")
      .select("sent_at, sender")
      .eq("conversation_id", conv.id)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMsg?.sender === "kami") {
      const daysSince = (Date.now() - new Date(lastMsg.sent_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 3 && conv.status === "awaiting_reply") {
        await sb
          .from("conversations")
          .update({ status: "stalled", updated_at: new Date().toISOString() })
          .eq("id", conv.id);
      }
    }
  }

  return Response.json({ checked: active.length, replies });
}

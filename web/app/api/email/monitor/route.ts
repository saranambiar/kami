import { supabaseServer } from "@/lib/supabase";

// Poll the AgentMail inbox for replies to sent outreach and update the CRM.
const API = "https://api.agentmail.to/v0";
const KEY = process.env.AGENTMAIL_API_KEY;
const INBOX = process.env.AGENTMAIL_INBOX ?? "kami-outreach@agentmail.to";

interface AmMessage {
  message_id: string;
  thread_id: string;
  labels: string[];
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
}

export async function POST(): Promise<Response> {
  if (!KEY) return Response.json({ error: "AgentMail not configured" }, { status: 503 });
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const res = await fetch(`${API}/inboxes/${encodeURIComponent(INBOX)}/messages?limit=100`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const json = await res.json().catch(() => ({ messages: [] }));
  if (!res.ok) {
    return Response.json({ error: `AgentMail ${res.status}` }, { status: 502 });
  }
  const messages: AmMessage[] = json.messages ?? [];

  // thread_id of every message we sent → the outreach receipts hold message_ids
  const sentByMessageId = new Map(
    messages.filter((m) => m.labels.includes("sent")).map((m) => [m.message_id, m.thread_id]),
  );
  const replies = messages.filter((m) => m.labels.includes("received"));
  if (!replies.length) return Response.json({ checked: messages.length, replies: 0, updated: 0 });

  const { data: outreach } = await sb
    .from("outreach_log")
    .select("id, receipt, status")
    .eq("surface", "email")
    .in("status", ["sent", "replied"]);

  let updated = 0;
  for (const row of outreach ?? []) {
    const messageId = (row.receipt as { message_id?: string })?.message_id;
    if (!messageId) continue;
    const threadId = sentByMessageId.get(messageId);
    if (!threadId) continue;
    const threadReplies = replies.filter((m) => m.thread_id === threadId);
    if (!threadReplies.length) continue;

    await sb
      .from("outreach_log")
      .update({
        status: "replied",
        receipt: {
          ...(row.receipt as object),
          replies: threadReplies.map((m) => ({
            from: m.from,
            preview: m.preview,
            at: m.timestamp,
          })),
        },
      })
      .eq("id", row.id);
    updated++;
  }

  return Response.json({ checked: messages.length, replies: replies.length, updated });
}

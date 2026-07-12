// AgentMail sending — real email surface.

const API = "https://api.agentmail.to/v0";
const KEY = process.env.AGENTMAIL_API_KEY;
const INBOX = process.env.AGENTMAIL_INBOX ?? "kami-outreach@agentmail.to";

export function emailConfigured(): boolean {
  return Boolean(KEY);
}

export interface EmailReceipt {
  message_id: string;
  inbox: string;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailReceipt> {
  if (!KEY) throw new Error("AGENTMAIL_API_KEY not configured");

  const res = await fetch(`${API}/inboxes/${encodeURIComponent(INBOX)}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: [params.to], subject: params.subject, text: params.text }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`AgentMail ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return { message_id: json.message_id ?? json.id ?? "unknown", inbox: INBOX };
}

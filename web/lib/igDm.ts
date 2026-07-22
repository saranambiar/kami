/**
 * Send an Instagram DM as the connected professional account (user OAuth token).
 * Uses Instagram Messaging API (graph.instagram.com).
 */

export interface IgDmReceipt {
  message_id?: string;
  raw: unknown;
}

export async function sendIgDirectMessage(params: {
  accessToken: string;
  /** Instagram-scoped user id of the sender (from oauth.user_id) */
  igUserId: string;
  /** Recipient Instagram-scoped id OR we resolve by username when possible */
  recipientUsername: string;
  text: string;
}): Promise<IgDmReceipt> {
  const text = params.text.trim();
  if (!text) throw new Error("message text required");
  if (!params.igUserId) throw new Error("Instagram user id missing — reconnect Instagram");

  const handle = params.recipientUsername.replace(/^@/, "").trim();

  // Instagram Messaging typically needs an IGSID for the recipient from a prior webhook/
  // conversation. For cold outreach we attempt the Conversations API recipient username
  // path where available; otherwise return a clear needs-input style error.
  //
  // Primary path: POST /{ig-user-id}/messages with recipient username (Business Login apps).
  const res = await fetch(`https://graph.instagram.com/v21.0/${params.igUserId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { username: handle },
      message: { text },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = json as { error?: { message?: string; code?: number } };
    const msg = err.error?.message ?? `Instagram DM API ${res.status}`;
    if (res.status === 403 || err.error?.code === 10) {
      throw new Error(
        `${msg} — Instagram cold DMs require messaging permissions and often a prior user interaction. Add testers in Meta app roles for dev mode.`,
      );
    }
    throw new Error(msg);
  }

  const data = json as { message_id?: string };
  return { message_id: data.message_id, raw: json };
}

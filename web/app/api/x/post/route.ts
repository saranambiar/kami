import { postTweet } from "@/lib/x";
import { resolveXCreds } from "@/lib/xCreds";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const resolved = await resolveXCreds();
  if (!resolved) {
    return Response.json(
      { error: "No X account connected — connect your X API keys from the dashboard" },
      { status: 503 },
    );
  }
  const { text, sessionDbId, opportunityId } = await request.json();
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  try {
    const receipt = await postTweet(text, resolved.creds);

    const sb = supabaseServer();
    if (sb) {
      await sb.from("outreach_log").insert({
        session_id: sessionDbId ?? null,
        opportunity_id: opportunityId ?? null,
        surface: "x",
        draft: text,
        receipt: {
          provider: "x",
          post_id: receipt.id,
          url: receipt.url,
          account: resolved.handle,
        },
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    return Response.json({ sent: true, receipt: { ...receipt, account: resolved.handle } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "post failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

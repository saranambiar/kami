import { postTweet } from "@/lib/x";
import { resolveXAccess } from "@/lib/xCreds";
import { supabaseServer } from "@/lib/supabase";
import { readClaimId } from "@/lib/claimCookie";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { text, sessionDbId, opportunityId } = body as {
    text?: string;
    sessionDbId?: string;
    opportunityId?: string;
  };

  const access = await resolveXAccess({
    sessionId: sessionDbId ?? null,
    claimId: readClaimId(request),
  });
  if (!access) {
    return Response.json(
      { error: "No X account connected for this session — log in with X from the landing page" },
      { status: 503 },
    );
  }
  if (!text) return Response.json({ error: "text required" }, { status: 400 });

  try {
    const receipt = await postTweet(text, access.token);

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
          account: access.handle,
        },
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    return Response.json({ sent: true, receipt: { ...receipt, account: access.handle } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "post failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

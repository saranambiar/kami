import { emailConfigured, sendEmail } from "@/lib/agentmail";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  if (!emailConfigured()) {
    return Response.json({ error: "AgentMail not configured" }, { status: 503 });
  }
  const { to, subject, text, sessionDbId, opportunityId } = await request.json();
  if (!to || !subject || !text) {
    return Response.json({ error: "to, subject, text required" }, { status: 400 });
  }

  const sb = supabaseServer();

  // Suppression check — hard gate before any real send.
  if (sb) {
    const domain = String(to).split("@")[1]?.toLowerCase();
    const { data: blocked } = await sb
      .from("do_not_contact")
      .select("handle")
      .in("handle", [String(to).toLowerCase(), domain ?? ""]);
    if (blocked && blocked.length > 0) {
      return Response.json(
        { error: `recipient is on the do-not-contact list (${blocked[0].handle})` },
        { status: 403 },
      );
    }
  }

  try {
    const receipt = await sendEmail({ to, subject, text });

    if (sb) {
      await sb.from("outreach_log").insert({
        session_id: sessionDbId ?? null,
        opportunity_id: opportunityId ?? null,
        surface: "email",
        draft: `To: ${to}\nSubject: ${subject}\n\n${text}`,
        receipt: { provider: "agentmail", ...receipt },
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    }

    return Response.json({ sent: true, receipt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "send failed";
    return Response.json({ error: message }, { status: 502 });
  }
}

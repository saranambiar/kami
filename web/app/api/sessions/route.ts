import { supabaseServer } from "@/lib/supabase";
import { claimAccountsForSession } from "@/lib/claimAccounts";
import { readClaimId } from "@/lib/claimCookie";

// Create a session row. Returns { id } or { id: null } when Supabase is unconfigured.
// Claims any connected X/IG accounts for this browser (kami_claim cookie).
export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ id: null, persisted: false });

  const { hermesSessionId, domain, goals, stage } = await request.json();
  if (!hermesSessionId || !domain) {
    return Response.json({ error: "hermesSessionId and domain required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("agent_sessions")
    .insert({ hermes_session_id: hermesSessionId, domain, goals: goals ?? [], stage })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const claimId = readClaimId(request);
  const claimed = await claimAccountsForSession(sb, data.id, claimId);

  return Response.json({ id: data.id, persisted: true, accounts_claimed: claimed });
}

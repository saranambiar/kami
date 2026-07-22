import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Attach unclaimed browser OAuth accounts to a newly created campaign session.
 */
export async function claimAccountsForSession(
  sb: SupabaseClient,
  sessionId: string,
  claimId: string | null,
): Promise<number> {
  if (!claimId) return 0;

  const { data, error } = await sb
    .from("connected_accounts")
    .update({ session_id: sessionId })
    .eq("claim_id", claimId)
    .is("session_id", null)
    .eq("status", "connected")
    .select("id");

  if (error) {
    console.error("claimAccountsForSession", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

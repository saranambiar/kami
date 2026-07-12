import { envCreds, type XCreds } from "@/lib/x";
import { supabaseServer } from "@/lib/supabase";

/**
 * Resolve X credentials: the user's connected account from the DB first
 * (SaaS/BYOK model), env vars as dev fallback.
 */
export async function resolveXCreds(): Promise<{ creds: XCreds; handle: string | null } | null> {
  const sb = supabaseServer();
  if (sb) {
    const { data } = await sb
      .from("connected_accounts")
      .select("handle, oauth")
      .eq("platform", "x")
      .eq("status", "connected")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const o = data?.oauth as Partial<XCreds> | null;
    if (o?.consumerKey && o.consumerSecret && o.accessToken && o.accessSecret) {
      return { creds: o as XCreds, handle: data?.handle ?? null };
    }
  }
  const env = envCreds();
  return env ? { creds: env, handle: null } : null;
}

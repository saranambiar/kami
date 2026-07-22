import { getValidAccessToken, type TokenLookup } from "@/lib/xOauth";

/**
 * Resolve X access for a campaign session (or pre-launch claim).
 * SaaS model: the token belongs to whoever logged in with X for that session.
 */
export async function resolveXAccess(
  lookup: TokenLookup,
): Promise<{ token: string; handle: string } | null> {
  return getValidAccessToken(lookup);
}

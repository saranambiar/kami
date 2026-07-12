import { getValidAccessToken } from "@/lib/xOauth";

/**
 * Resolve X access for the connected account (OAuth 2.0 user token,
 * auto-refreshed). SaaS model: the token belongs to whoever logged in with X.
 */
export async function resolveXAccess(): Promise<{ token: string; handle: string } | null> {
  return getValidAccessToken();
}

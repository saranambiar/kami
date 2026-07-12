import { createHash, randomBytes } from "node:crypto";
import { supabaseServer } from "@/lib/supabase";

// X OAuth 2.0 + PKCE — users log in with X; Kami acts with their token.

const CLIENT_ID = process.env.X_CLIENT_ID;
const CLIENT_SECRET = process.env.X_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.X_REDIRECT_URI ?? "http://localhost:3000/api/auth/x/callback";

const AUTH_URL = "https://x.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.x.com/2/oauth2/token";
export const SCOPES = "tweet.read tweet.write users.read offline.access";

export function oauthConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

export function buildAuthUrl(): { url: string; state: string; verifier: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return { url: `${AUTH_URL}?${params}`, state, verifier };
}

interface TokenSet {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
}

function basicAuth(): string {
  return "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
}

async function tokenRequest(body: URLSearchParams): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: basicAuth(),
    },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`X token exchange ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + (json.expires_in ?? 7200) * 1000,
  };
}

export function exchangeCode(code: string, verifier: string): Promise<TokenSet> {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
      client_id: CLIENT_ID!,
    }),
  );
}

function refreshToken(refresh: string): Promise<TokenSet> {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: CLIENT_ID!,
    }),
  );
}

/**
 * Get a valid access token for the connected X account, refreshing (and
 * persisting the new token) if expired. Returns null if no account connected.
 */
export async function getValidAccessToken(): Promise<{ token: string; handle: string } | null> {
  const sb = supabaseServer();
  if (!sb) return null;
  const { data } = await sb
    .from("connected_accounts")
    .select("id, handle, oauth")
    .eq("platform", "x")
    .eq("status", "connected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const tokens = (data?.oauth as { oauth2?: TokenSet } | null)?.oauth2;
  if (!data || !tokens?.access_token) return null;

  // still valid (60s buffer)
  if (tokens.expires_at > Date.now() + 60_000) {
    return { token: tokens.access_token, handle: data.handle ?? "" };
  }

  if (!tokens.refresh_token) throw new Error("X token expired and no refresh token — reconnect X");
  const fresh = await refreshToken(tokens.refresh_token);
  await sb
    .from("connected_accounts")
    .update({
      oauth: { oauth2: { ...fresh, refresh_token: fresh.refresh_token ?? tokens.refresh_token } },
    })
    .eq("id", data.id);
  return { token: fresh.access_token, handle: data.handle ?? "" };
}

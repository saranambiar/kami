import { exchangeCode } from "@/lib/xOauth";
import { supabaseServer } from "@/lib/supabase";

// OAuth 2.0 callback: exchange code → tokens, fetch handle, store account.
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("cookie") ?? "";
  const stored = cookie.match(/x_oauth=([^;]+)/)?.[1];
  const [storedState, verifier] = stored?.split(".") ?? [];

  function fail(reason: string): Response {
    return new Response(null, {
      status: 307,
      headers: { Location: `/?x_connect=error&reason=${encodeURIComponent(reason)}` },
    });
  }

  if (!code || !state || !verifier || state !== storedState) {
    return fail("invalid oauth state");
  }

  try {
    const tokens = await exchangeCode(code, verifier);

    // whoami with the user's token
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const me = await meRes.json().catch(() => ({}));
    const username: string | undefined = me.data?.username;
    if (!meRes.ok || !username) return fail("could not fetch X profile");

    const sb = supabaseServer();
    if (sb) {
      await sb.from("connected_accounts").delete().eq("platform", "x");
      await sb.from("connected_accounts").insert({
        platform: "x",
        handle: `@${username}`,
        status: "connected",
        oauth: { oauth2: tokens },
      });
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: `/?x_connect=ok&handle=${encodeURIComponent(`@${username}`)}`,
        "Set-Cookie": "x_oauth=; Path=/; Max-Age=0",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "token exchange failed";
    return fail(message);
  }
}

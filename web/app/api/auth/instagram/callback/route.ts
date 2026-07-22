import { exchangeIgCode, fetchIgProfile } from "@/lib/igOauth";
import { supabaseServer } from "@/lib/supabase";
import { claimCookieHeader, newClaimId, readClaimId } from "@/lib/claimCookie";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("cookie") ?? "";
  const storedState = cookie.match(/ig_oauth=([^;]+)/)?.[1];

  function fail(reason: string): Response {
    return new Response(null, {
      status: 307,
      headers: {
        Location: `/?ig_connect=error&reason=${encodeURIComponent(reason)}`,
        "Set-Cookie": "ig_oauth=; Path=/; Max-Age=0",
      },
    });
  }

  const cleanCode = code?.replace(/#_$/, "") ?? null;
  if (!cleanCode || !state || !storedState || state !== storedState) {
    return fail("invalid oauth state");
  }

  try {
    const tokens = await exchangeIgCode(cleanCode);
    const profile = await fetchIgProfile(tokens.access_token);
    const handle = `@${profile.username}`;
    const claimId = readClaimId(request) ?? newClaimId();

    const sb = supabaseServer();
    if (sb) {
      const { data: existing } = await sb
        .from("connected_accounts")
        .select("id")
        .eq("platform", "instagram")
        .eq("claim_id", claimId)
        .maybeSingle();

      const oauth = {
        oauth2: {
          ...tokens,
          user_id: tokens.user_id ?? profile.id,
        },
      };

      if (existing) {
        await sb
          .from("connected_accounts")
          .update({ handle, status: "connected", oauth })
          .eq("id", existing.id);
      } else {
        await sb.from("connected_accounts").insert({
          platform: "instagram",
          handle,
          status: "connected",
          oauth,
          claim_id: claimId,
          session_id: null,
        });
      }
    }

    const headers = new Headers({
      Location: `/?ig_connect=ok&handle=${encodeURIComponent(handle)}`,
    });
    headers.append("Set-Cookie", "ig_oauth=; Path=/; Max-Age=0");
    headers.append("Set-Cookie", claimCookieHeader(claimId));

    return new Response(null, { status: 307, headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "token exchange failed";
    return fail(message);
  }
}

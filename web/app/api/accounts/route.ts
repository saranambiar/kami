import { verifyCreds, type XCreds } from "@/lib/x";
import { supabaseServer } from "@/lib/supabase";

// GET: list connected accounts (keys never returned).
export async function GET(): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ accounts: [] });
  const { data } = await sb
    .from("connected_accounts")
    .select("id, platform, handle, status, created_at")
    .order("created_at");
  return Response.json({ accounts: data ?? [] });
}

// POST: connect an account. For X with keys: verify live against the X API,
// then store. Without keys: register as pending (demo state).
export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  const body = await request.json();
  const { platform, handle, keys } = body as {
    platform: string;
    handle?: string;
    keys?: Partial<XCreds>;
  };
  if (!platform) return Response.json({ error: "platform required" }, { status: 400 });

  // BYOK path: verify the user's own X keys before storing.
  if (platform === "x" && keys) {
    const { consumerKey, consumerSecret, accessToken, accessSecret } = keys;
    if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
      return Response.json({ error: "all four X keys are required" }, { status: 400 });
    }
    try {
      const user = await verifyCreds(keys as XCreds);
      if (sb) {
        // one connected X account at a time — replace previous
        await sb.from("connected_accounts").delete().eq("platform", "x");
        await sb.from("connected_accounts").insert({
          platform: "x",
          handle: `@${user.username}`,
          status: "connected",
          oauth: keys,
        });
      }
      return Response.json({ connected: true, handle: `@${user.username}` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "verification failed";
      return Response.json({ error: message }, { status: 401 });
    }
  }

  // Demo/pending path (other platforms, or X without keys)
  if (!sb) return Response.json({ persisted: false, status: "pending" });
  const { data, error } = await sb
    .from("connected_accounts")
    .insert({ platform, handle: handle ?? null, status: "pending" })
    .select("id, platform, handle, status")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, account: data });
}

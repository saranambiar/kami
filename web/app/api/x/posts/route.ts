import { resolveXAccess } from "@/lib/xCreds";

export async function GET(): Promise<Response> {
  const access = await resolveXAccess();
  if (!access) return Response.json({ posts: [], error: "No X account connected" });

  try {
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const me = await meRes.json();
    const userId = me.data?.id;
    if (!userId) return Response.json({ posts: [], error: "Could not resolve user" });

    const query = new URLSearchParams({
      max_results: "10",
      "tweet.fields": "public_metrics,created_at",
      exclude: "retweets,replies",
    });
    const res = await fetch(`https://api.x.com/2/users/${userId}/tweets?${query}`, {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const json = await res.json();
    if (!res.ok) return Response.json({ posts: [], error: `X API ${res.status}` });

    return Response.json({ posts: json.data ?? [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "failed";
    return Response.json({ posts: [], error: msg });
  }
}

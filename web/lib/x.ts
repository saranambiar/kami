import { createHmac, randomBytes } from "node:crypto";

// X API v2 via OAuth 1.0a user context — stdlib crypto only.
// SaaS model: each user connects their own keys (stored in connected_accounts);
// env vars are only a dev fallback.

export interface XCreds {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessSecret: string;
}

/** Dev fallback creds from env, or null. */
export function envCreds(): XCreds | null {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) return null;
  return {
    consumerKey: X_API_KEY,
    consumerSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  };
}

// RFC 3986 percent-encoding (encodeURIComponent misses !'()*)
function enc(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function oauthHeader(
  creds: XCreds,
  method: string,
  url: string,
  query: Record<string, string> = {},
): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const all = { ...oauth, ...query };
  const paramString = Object.keys(all)
    .sort()
    .map((k) => `${enc(k)}=${enc(all[k])}`)
    .join("&");
  const baseString = [method.toUpperCase(), enc(url), enc(paramString)].join("&");
  const signingKey = `${enc(creds.consumerSecret)}&${enc(creds.accessSecret)}`;
  oauth.oauth_signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${enc(k)}="${enc(oauth[k])}"`)
      .join(", ")
  );
}

/** Verify creds by fetching the authenticated user. Returns the handle. */
export async function verifyCreds(creds: XCreds): Promise<{ id: string; username: string }> {
  const url = "https://api.x.com/2/users/me";
  const res = await fetch(url, { headers: { Authorization: oauthHeader(creds, "GET", url) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.data?.username) {
    throw new Error(`X verification failed (${res.status}): ${JSON.stringify(json).slice(0, 200)}`);
  }
  return { id: json.data.id, username: json.data.username };
}

export interface PostReceipt {
  id: string;
  url: string;
}

export async function postTweet(text: string, creds: XCreds): Promise<PostReceipt> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("empty post");
  if (trimmed.length > 280) throw new Error(`post too long (${trimmed.length}/280 chars)`);
  if (/https?:\/\//i.test(trimmed)) throw new Error("URLs in posts are blocked (13x API cost)");

  const url = "https://api.x.com/2/tweets";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: oauthHeader(creds, "POST", url),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: trimmed }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  const id: string = json.data?.id;
  if (!id) throw new Error(`X API returned no post id: ${JSON.stringify(json).slice(0, 200)}`);
  return { id, url: `https://x.com/i/status/${id}` };
}

export interface TweetMetrics {
  id: string;
  public_metrics: Record<string, number>;
}

/** Fetch public metrics for the account's own posts. */
export async function getTweetMetrics(ids: string[], creds: XCreds): Promise<TweetMetrics[]> {
  if (ids.length === 0) return [];
  const url = "https://api.x.com/2/tweets";
  const query = { ids: ids.join(","), "tweet.fields": "public_metrics" };
  const res = await fetch(`${url}?${new URLSearchParams(query)}`, {
    headers: { Authorization: oauthHeader(creds, "GET", url, query) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X API ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  return json.data ?? [];
}

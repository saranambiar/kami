import { buildIgAuthUrl, igOauthConfigured } from "@/lib/igOauth";

export async function GET(): Promise<Response> {
  if (!igOauthConfigured()) {
    return Response.json(
      { error: "INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET not configured" },
      { status: 503 },
    );
  }
  const { url, state } = buildIgAuthUrl();
  const cookie = [
    `ig_oauth=${state}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=600",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
  return new Response(null, {
    status: 307,
    headers: { Location: url, "Set-Cookie": cookie },
  });
}

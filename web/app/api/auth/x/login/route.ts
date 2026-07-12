import { buildAuthUrl, oauthConfigured } from "@/lib/xOauth";

// Kick off X OAuth 2.0 login — redirects the user to X's authorize page.
export async function GET(): Promise<Response> {
  if (!oauthConfigured()) {
    return Response.json(
      { error: "X_CLIENT_ID / X_CLIENT_SECRET not configured" },
      { status: 503 },
    );
  }
  const { url, state, verifier } = buildAuthUrl();
  const cookie = [
    `x_oauth=${state}.${verifier}`,
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

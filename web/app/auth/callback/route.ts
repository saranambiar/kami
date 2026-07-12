import { NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabaseAuth";

// Google OAuth redirect target: exchanges the auth code for a session cookie,
// then bounces back to the app.
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const sb = await supabaseAuth();
    if (sb) await sb.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

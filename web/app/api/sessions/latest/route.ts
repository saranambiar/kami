import { supabaseServer } from "@/lib/supabase";
import { currentUserId } from "@/lib/supabaseAuth";

// Most recent campaign for the signed-in user — used to reopen on login.
export async function GET(): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ id: null });

  const userId = await currentUserId();
  if (!userId) return Response.json({ id: null });

  const { data } = await sb
    .from("agent_sessions")
    .select("id, hermes_session_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Response.json({
    id: data?.id ?? null,
    hermesId: data?.hermes_session_id ?? null,
  });
}

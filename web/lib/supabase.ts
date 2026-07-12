import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (service role). Returns null when env vars
 * are absent so the app runs without persistence until Supabase is set up.
 */
export function supabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

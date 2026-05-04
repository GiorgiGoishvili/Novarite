/**
 * Supabase browser client — safe to import in client components.
 *
 * Uses only NEXT_PUBLIC_* variables so no secrets are exposed.
 * The anon key is intentionally public; Row Level Security on the
 * Supabase tables is what controls what users can and cannot access.
 */

import { createClient } from "@supabase/supabase-js";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url || !anonKey) {
  console.warn("[Supabase] Browser client: missing environment variables:", {
    hasSupabaseUrl: Boolean(url),
    hasAnonKey:     Boolean(anonKey),
  });
}

export const supabase = createClient(url, anonKey);

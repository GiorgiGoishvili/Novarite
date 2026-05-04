/**
 * Supabase admin/service-role client — SERVER-SIDE ONLY.
 *
 * ⚠️  Never import this file in a component, a layout, or any file
 *     that is part of the client bundle.  The service-role key bypasses
 *     Row Level Security and must never be exposed to the browser.
 *
 * Safe to import from:
 *   - app/api/** /route.ts
 *   - lib/** server utilities called only by API routes
 *
 * The runtime guard below will throw if this module is accidentally
 * loaded in a browser context.
 */

import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error(
    "[Supabase] lib/supabase/admin.ts was imported in a browser context. " +
    "This file must only be used in API routes or server-side code."
  );
}

const url            = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY    ?? "";

if (!url || !serviceRoleKey) {
  console.warn("[Supabase] Admin client: missing environment variables:", {
    hasSupabaseUrl:    Boolean(url),
    hasServiceRoleKey: Boolean(serviceRoleKey),
  });
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
});

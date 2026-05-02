import { createClient } from "@supabase/supabase-js";

let warnedPublishableKey = false;

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (
    !warnedPublishableKey &&
    supabaseServiceRoleKey.startsWith("sb_publishable_")
  ) {
    warnedPublishableKey = true;
    console.error(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY is a publishable (anon) key — server writes will fail. Use a secret key (sb_secret_…) or the legacy service_role JWT (eyJ…) from Supabase → Project Settings → API Keys.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

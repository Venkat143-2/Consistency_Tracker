import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables with secure fallback defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cwnkgmxssmjkqkyvzqnp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_A6oljSlKv6yu1BK0Jl57eg_YNmoXsBx";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Critical Error: Supabase credentials are not defined in the environment. " +
    "Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
}

/**
 * Single shared Supabase Client instance for the application.
 * This client is safe to share on the client-side as it uses the anon key,
 * which respects Row-Level Security (RLS) policies configured on Supabase.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

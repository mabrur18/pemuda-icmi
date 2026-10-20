import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client utilizing the elevated SUPABASE_SERVICE_ROLE_KEY.
 *
 * CRITICAL SECURITY (NFR-03):
 * - Protected by 'server-only' to prevent accidental imports in client components.
 * - Bypasses RLS strictly for server-side mutations (subscribers, contact messages, event registrations).
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to NEXT_PUBLIC_* variables or client code.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server operations."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

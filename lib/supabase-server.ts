import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseServerClient: SupabaseClient | null = null;

export function getSupabaseServerClient() {
  const supabaseUrl = normalizeEnvValue(readRuntimeEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const serviceRoleKey = normalizeEnvValue(readRuntimeEnv("SUPABASE_SERVICE_ROLE_KEY"));

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  if (!supabaseServerClient) {
    supabaseServerClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseServerClient;
}

function readRuntimeEnv(key: string) {
  return process.env[key];
}

function normalizeEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.replace(/^["']|["']$/g, "");
}

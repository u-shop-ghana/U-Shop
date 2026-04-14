"use client";

import { apiFetch as baseApiFetch, ApiOptions } from "./api";
import { createClient } from "./supabase/client";

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(options.headers || {});
  if (session?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  
  return baseApiFetch(endpoint, { ...options, headers });
}

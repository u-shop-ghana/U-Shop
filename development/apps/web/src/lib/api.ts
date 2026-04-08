import { createClient } from "./supabase/client";

interface ApiOptions extends RequestInit {
  returnRaw?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  // Inject Supabase session cleanly
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  if (session?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (options.returnRaw) {
    return response;
  }

  const json = await response.json();
  return json;
}

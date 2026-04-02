import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ─── Server Supabase Client ─────────────────────────────────────
// Used in Server Components, Server Actions, and Route Handlers.
// Reads/writes cookies for session management. Must be called
// fresh on every request — don't cache or memoize this.
//
// IMPORTANT: This is NOT the admin client (no SERVICE_ROLE key).
// It uses the ANON key and respects RLS policies. For admin ops,
// use the Express API's supabaseAdmin client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components (read-only).
            // This is expected — the middleware handles token refresh.
          }
        },
      },
    }
  );
}

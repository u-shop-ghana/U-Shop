"use client";

import { createBrowserClient } from "@supabase/ssr";

// ─── Browser Supabase Client ────────────────────────────────────
// Used in Client Components for auth operations (sign in, sign up,
// sign out, OAuth). Uses the ANON key — safe for the browser.
// createBrowserClient automatically handles token refresh and
// stores the session in cookies (not localStorage) for SSR compat.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

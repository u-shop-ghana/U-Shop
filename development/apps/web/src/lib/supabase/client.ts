"use client";

import { createBrowserClient } from "@supabase/ssr";

// ─── Browser Supabase Client ────────────────────────────────────
// Used in Client Components for auth operations (sign in, sign up,
// sign out, OAuth). Uses the ANON key — safe for the browser.
// createBrowserClient automatically handles token refresh and
// stores the session in cookies (not localStorage) for SSR compat.
//
// WHY the fallback placeholders: During CI builds (Vercel, GitHub Actions),
// Next.js prerenders "use client" pages on the server to generate static
// HTML shells. The .env.local file doesn't exist in CI, so the env vars
// are undefined. The @supabase/ssr library throws if it receives undefined.
// These placeholders allow the prerender to succeed — no real Supabase
// calls are made during prerender because the component renders the static
// HTML without executing event handlers. At runtime in the browser,
// NEXT_PUBLIC_ vars are always available (embedded in the JS bundle).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
  );
}

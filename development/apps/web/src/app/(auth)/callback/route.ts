import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ─── OAuth Callback Handler ────────────────────────────────────
// This route handles the callback from Supabase OAuth providers
// (Google, etc.). It exchanges the auth code for a session,
// syncs the user with our Express backend, and redirects to
// the dashboard.
//
// Flow: Google → Supabase → /callback?code=xyz → exchange → redirect
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // Create a Supabase client that can read/write cookies
    const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange the OAuth code for a session.
    // This sets the auth cookies on the response.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Sync user with our Express backend.
      // This creates the internal User record if it doesn't exist,
      // and triggers auto-verification for student emails.
      // We fire-and-forget because the user is already authenticated
      // and the /sync endpoint will handle this on next login if it fails.
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      try {
        await fetch(`${apiUrl}/api/v1/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
          body: JSON.stringify({
            email: data.user.email,
            fullName:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              "User",
          }),
        });
      } catch {
        // Non-critical: user exists in Supabase, sync will retry on next login
        console.warn("Backend sync failed during OAuth callback, will retry");
      }

      return supabaseResponse;
    }
  }

  // If there's no code or the exchange failed, redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}

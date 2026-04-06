import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ─── OAuth & Email Confirmation Callback Handler ───────────────
// This route handles TWO Supabase callback types:
//   1. OAuth callbacks (Google sign-in): ?code=xyz
//   2. Email confirmation callbacks: ?code=xyz (from signup email link)
//
// After exchanging the code for a session, it checks the user's
// metadata to decide where to redirect:
//   - If wants_student_verification = true → /verify?type=student
//   - Otherwise → / (home page)
//
// It also syncs the user with our Express backend (creates the
// internal User record if it doesn't exist).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Default redirect — will be overridden based on user metadata
    let redirectPath = "/";

    // Create a Supabase client that can read/write cookies on the response
    const supabaseResponse = NextResponse.redirect(
      `${origin}${redirectPath}`
    );

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

    // Exchange the OAuth/email-confirmation code for a session.
    // This sets the auth cookies on the response.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Sync user with our Express backend.
      // This creates the internal User record if it doesn't exist.
      // We do NOT call handlePostSignup auto-verification anymore —
      // verification is a separate, explicit user action.
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
      }

      // Determine redirect based on wants_student_verification.
      // This flag is set during signup in user_metadata.
      // If the user opted to verify as a student, send them to /verify.
      // Otherwise, send them to the home page.
      const wantsVerification =
        data.user.user_metadata?.wants_student_verification === true;

      if (wantsVerification) {
        redirectPath = "/verify?type=student";
      } else {
        redirectPath = "/";
      }

      // Build the final redirect with the correct path
      return NextResponse.redirect(new URL(redirectPath, origin), {
        headers: supabaseResponse.headers,
      });
    }
  }

  // If there's no code or the exchange failed, redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}

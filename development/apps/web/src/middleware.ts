import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Auth Middleware ────────────────────────────────────────────
// Runs on every matched request. Two jobs:
//   1. Refresh the Supabase auth token if it's expired
//   2. Redirect unauthenticated users away from protected routes
//
// The token refresh MUST happen in middleware because Server
// Components can't set cookies. Without this, users would be
// silently logged out after their JWT expires (1 hour by default).
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward refreshed cookies to both the request (for downstream
          // Server Components) and the response (for the browser).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the token — this is the critical operation.
  // If the token is valid, this is a no-op. If expired, it refreshes
  // using the refresh token in the cookie and sets new cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected route patterns — routes that require authentication.
  // Auth routes (/login, /register, etc.) are NOT protected.
  // Note: /store is NOT protected because /store/[handle] is a public storefront.
  // Only /dashboard/store (the store management panel) is protected.
  const protectedPaths = ["/dashboard", "/settings", "/orders", "/wallet"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If user is not authenticated and tries to access a protected route,
  // redirect them to login with a returnTo parameter
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: We intentionally do NOT redirect authenticated users away from
  // /login or /register. Stale Supabase cookies can make the middleware
  // think a user is "logged in" even when the API session is expired.
  // The auth pages themselves handle the UX for already-logged-in users.

  return supabaseResponse;
}

// Only run middleware on routes that need auth checking.
// Skip static assets, images, favicon, manifest.json, and API routes.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

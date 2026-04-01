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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  const protectedPaths = ["/dashboard", "/settings", "/orders", "/wallet", "/store"];
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

  // If user IS authenticated and tries to access auth pages,
  // redirect them to the dashboard (they're already logged in)
  const authPaths = ["/login", "/register"];
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

// Only run middleware on routes that need auth checking.
// Skip static assets, images, favicon, and API routes.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

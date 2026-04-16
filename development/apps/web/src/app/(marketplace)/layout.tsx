"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// ─── Marketplace Layout ─────────────────────────────────────────
// Wraps all public-facing pages (homepage, search, categories,
// stores, product detail, cart, checkout) with the shared
// Header and Footer.
//
// Auth pages ((auth) route group) have their own layout without
// Header/Footer — they use a clean split-screen design.
//
// Why a Client Component? We need the useAuth() hook to read the
// user's login state, cart count, etc. and pass them to <Header />.
// The actual page children can still be Server Components.
export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ─── Supabase Hash-Based Auth Redirect Handler ─────────────────
  // Supabase password recovery uses hash-based token delivery: the
  // reset link redirects to the Site URL (root) with a fragment like
  // #access_token=XXX&type=recovery. Without this handler, the user
  // lands on the homepage instead of /reset-password.
  //
  // We also handle the error case (otp_expired) from stale links.
  // The hash fragment is NOT visible to the server (middleware can't
  // read it), so this MUST be handled client-side.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    // Case 1: Expired or invalid recovery link — send to forgot-password
    if (hash.includes("error_code=otp_expired") || hash.includes("error_description=Email+link+is+invalid")) {
      router.replace("/forgot-password?error=expired");
      return;
    }

    // Case 2: Valid recovery token — Supabase already set the session
    // via the hash. Redirect to /reset-password so the user can update
    // their password. The createClient() in reset-password/page.tsx will
    // automatically pick up the session from cookies.
    if (hash.includes("type=recovery") && hash.includes("access_token=")) {
      // Clear the hash from the URL to prevent re-processing on navigation
      window.history.replaceState(null, "", window.location.pathname);
      router.replace("/reset-password");
      return;
    }
  }, [router]);

  // Derive header props from the authenticated user state.
  // Cart/wishlist counts will come from the API once those
  // features are built — for now we default to 0.
  const isLoggedIn = !loading && user !== null;
  const userName = user?.fullName ?? undefined;
  const hasStore = user?.store !== null && user?.store !== undefined;

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        hasStore={hasStore}
        cartCount={0}
        wishlistCount={0}
      />
      {/* flex-grow ensures footer stays at bottom when content is short */}
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

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

  // Watch for Supabase PKCE Expired Error Hash in URL
  // If user clicked an old reset link, Supabase redirects them to Site URL (root) with error hash.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("error_code=otp_expired") || hash.includes("error_description=Email+link+is+invalid")) {
        router.replace("/forgot-password?error=expired");
      }
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

import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HashRedirectHandler } from '@/components/layout/HashRedirectHandler';

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
export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Derive header props from the authenticated user state.
  const isLoggedIn = user !== null;
  const userName = user?.user_metadata?.fullName ?? undefined;
  // Note: user.store logic depends on how metadata is stored or if we need a DB lookup.
  // Assuming it's in metadata for now, or just derived later.
  const hasStore = user?.user_metadata?.storeId !== undefined;

  return (
    <>
      <HashRedirectHandler />
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        hasStore={hasStore}
        wishlistCount={0}
      />
      {/* flex-grow ensures footer stays at bottom when content is short */}
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

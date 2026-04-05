"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser, AuthContextType } from "@/lib/auth/types";

// ─── Auth Context ───────────────────────────────────────────────
// Provides user state to every component in the tree via React context.
// Hydrates from Supabase session + our API on mount, and re-syncs
// whenever the Supabase auth state changes (login, logout, token refresh).
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  signOut: async () => {},
});

// ─── Auth Provider ──────────────────────────────────────────────
// Wrap this around the app layout to provide auth state everywhere.
//
// Flow:
// 1. On mount, check if Supabase has an active session
// 2. If yes, call GET /api/v1/auth/me with the access_token
// 3. Store the user profile in state
// 4. Listen for onAuthStateChange to handle login/logout/token-refresh
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch the user profile from our Express API.
  // This is the only way to get the full user profile (role, store, etc.)
  // since Supabase only knows about email/password, not our domain data.
  const fetchUserProfile = useCallback(
    async (accessToken: string): Promise<AuthUser | null> => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      try {
        const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          // 401 means the user exists in Supabase but not in our DB.
          // This is expected for brand-new signups before /register is called.
          return null;
        }

        const data: { success: boolean; data: AuthUser } = await res.json();
        return data.success ? data.data : null;
      } catch {
        // Network error — API might be down. Don't crash the app.
        return null;
      }
    },
    []
  );

  // Re-fetch user profile. Called after profile updates (e.g., store creation).
  const refreshUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const profile = await fetchUserProfile(session.access_token);
      setUser(profile);
    }
  }, [supabase, fetchUserProfile]);

  // Sign the user out. Clears the Supabase session (deletes cookies)
  // and resets local state, then redirects to login.
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  // ── Initial hydration + auth state listener ───────────────────
  // On mount, check for an existing session and fetch the profile.
  // Also subscribe to auth state changes so login/logout/token-refresh
  // are picked up automatically. This handles tab-switching, OAuth
  // callbacks, and session expiry without any manual refresh.
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token && mounted) {
          const profile = await fetchUserProfile(session.access_token);
          if (mounted) setUser(profile);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        const profile = await fetchUserProfile(session.access_token);
        if (mounted) setUser(profile);
      } else if (event === "SIGNED_OUT") {
        if (mounted) setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.access_token) {
        // Token was refreshed — re-fetch profile in case it changed
        const profile = await fetchUserProfile(session.access_token);
        if (mounted) setUser(profile);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  // Memoize the context value to prevent unnecessary re-renders.
  // Only re-computes when user, loading, refreshUser, or signOut change.
  const value = useMemo<AuthContextType>(
    () => ({ user, loading, refreshUser, signOut }),
    [user, loading, refreshUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

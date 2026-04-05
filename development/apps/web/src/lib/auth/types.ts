// ─── User type & Auth Context ───────────────────────────────────
// Represents the authenticated user profile returned from the API.
// This is the source of truth for auth state across the entire app.
// The context is hydrated on mount by calling GET /api/v1/auth/me.

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "BUYER" | "SELLER" | "BOTH" | "ADMIN";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  universityName: string | null;
  createdAt: string;
  store: {
    id: string;
    handle: string;
    name: string;
    logoUrl: string | null;
    isActive: boolean;
  } | null;
}

export interface AuthContextType {
  /** The current authenticated user, or null if not logged in */
  user: AuthUser | null;
  /** True while the initial session check is in progress */
  loading: boolean;
  /** Re-fetch the user profile from the API */
  refreshUser: () => Promise<void>;
  /** Sign the user out (clears Supabase session + local state) */
  signOut: () => Promise<void>;
}

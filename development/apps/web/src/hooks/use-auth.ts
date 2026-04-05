"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import type { AuthContextType } from "@/lib/auth/types";

// ─── useAuth Hook ───────────────────────────────────────────────
// Convenience hook to access the auth context from any client component.
//
// Usage:
//   const { user, loading, signOut } = useAuth();
//
// Throws if used outside of <AuthProvider> — this is intentional.
// It surfaces misconfiguration immediately instead of silently returning null.
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth() must be used within an <AuthProvider>. " +
        "Wrap your app layout with <AuthProvider> to fix this."
    );
  }

  return context;
}

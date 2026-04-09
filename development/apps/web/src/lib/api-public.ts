import { apiFetch as baseApiFetch, ApiOptions } from "./api";

// ─── Public API Fetch ───────────────────────────────────────────
// This wrapper MUST BE USED for all public data fetching on
// Server Components (e.g. Homepage, Categories) to avoid breaking
// Static Prerendering (ISR).
//
// UNLIKE `api-server.ts`, this does NOT call `cookies()` or Supabase
// auth. It enforces purely static Next.js fetch caching.

export async function apiPublicFetch(endpoint: string, options: ApiOptions = {}) {
  // Enforce Next.js ISR (Incremental Static Regeneration) globally unless overridden
  // We accepted a 15-second cache window for the marketplace.
  const nextOptions = options.next || { revalidate: 15 };
  
  return baseApiFetch(endpoint, { 
    ...options, 
    next: nextOptions 
  });
}

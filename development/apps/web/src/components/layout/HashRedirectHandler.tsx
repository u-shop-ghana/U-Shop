'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function HashRedirectHandler() {
  const router = useRouter();

  // ─── Supabase Hash-Based Auth Redirect Handler ─────────────────
  // Supabase password recovery uses hash-based token delivery: the
  // reset link redirects to the Site URL (root) with a fragment like
  // #access_token=XXX&type=recovery.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash) return;

    // Case 1: Expired or invalid recovery link
    if (hash.includes('error_code=otp_expired') || hash.includes('error_description=Email+link+is+invalid')) {
      router.replace('/forgot-password?error=expired');
      return;
    }

    // Case 2: Valid recovery token
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
      window.history.replaceState(null, '', window.location.pathname);
      router.replace('/reset-password');
      return;
    }
  }, [router]);

  return null;
}

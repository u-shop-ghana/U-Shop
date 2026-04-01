import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

// ─── Environment Validation ─────────────────────────────────────
// We crash immediately on startup if critical Supabase env vars are
// missing. This is deliberate — it's better to fail fast with a clear
// error message than to silently fail when someone hits an auth endpoint
// 10 minutes into the process. Debugging "undefined URL" in production
// at 2 AM is nobody's idea of fun.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'SUPABASE_URL is not set. Add it to your .env file. ' +
    'Get it from: Supabase Dashboard → Settings → API → Project URL'
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env file. ' +
    'Get it from: Supabase Dashboard → Settings → API → service_role key. ' +
    'WARNING: This key bypasses Row Level Security — NEVER expose it to the frontend.'
  );
}

// ─── Supabase Admin Client ──────────────────────────────────────
// This client uses the SERVICE_ROLE key, which bypasses all RLS
// policies. Use it ONLY in trusted backend code for:
//   (a) Verifying JWTs from frontend requests
//   (b) Managing Supabase Storage (upload IDs, avatars, listing images)
//   (c) Admin-level user operations (deleting accounts, changing roles)
//
// NEVER import this in frontend code. NEVER pass this client to a
// route handler directly — always go through service functions.
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      // We're running on the server — there is no browser localStorage.
      // autoRefreshToken is disabled because the service_role key doesn't
      // expire (it's not a user session token). persistSession is disabled
      // because there is no session to persist on the server side.
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

logger.info('✅ Supabase admin client initialized');

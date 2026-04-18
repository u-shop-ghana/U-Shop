import { request } from '@playwright/test';

// ─── Global Setup: Route Warmup ─────────────────────────────────
// Next.js with Turbopack compiles routes lazily on first request.
// When Playwright launches 4 workers that all hit /login at the
// same time, the compile takes >60s and every worker times out.
//
// This setup hits each route once, serially, so the dev server
// compiles and caches them before any test begins.

const ROUTES_TO_WARM = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/search',
];

async function globalSetup() {
  const ctx = await request.newContext({ baseURL: 'http://127.0.0.1:3000' });

  for (const route of ROUTES_TO_WARM) {
    try {
      // A simple GET request triggers Turbopack compilation for the route.
      // We allow up to 120s per route for first-time compilation.
      await ctx.get(route, { timeout: 120_000 });
      console.log(`  ✓ Warmed up: ${route}`);
    } catch (err) {
      // Non-fatal — the route may fail (e.g. API-dependent pages), but
      // the important thing is Turbopack has compiled the JS bundles.
      console.warn(`  ⚠ Warmup failed for ${route}: ${(err as Error).message}`);
    }
  }

  await ctx.dispose();
}

export default globalSetup;

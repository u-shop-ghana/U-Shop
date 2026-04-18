# U-Shop Infrastructure

> **Classification:** Internal — Engineering Team  
> **Stack:** Next.js 14 (Vercel) · Express.js (Railway) · Supabase · Upstash Redis · Paystack  
> **Last updated:** See git blame

This document covers the complete server setup, deployment topology, CI/CD pipeline, environment configuration, database connection strategy, Docker containerisation, job queues, and the production readiness checklist. Read it once in full before writing any infrastructure code.

---

## Table of Contents

1. [Deployment Topology](#1-deployment-topology)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Environment Variables](#3-environment-variables)
4. [Supabase — Database & Connection Pooling](#4-supabase--database--connection-pooling)
5. [Express API — Railway Container Setup](#5-express-api--railway-container-setup)
6. [Next.js Frontend — Vercel](#6-nextjs-frontend--vercel)
7. [Redis — Upstash](#7-redis--upstash)
8. [Background Jobs — BullMQ](#8-background-jobs--bullmq)
9. [CI/CD — GitHub Actions](#9-cicd--github-actions)
10. [Database Indexes & Performance Setup](#10-database-indexes--performance-setup)
11. [Caching Strategy](#11-caching-strategy)
12. [Observability — Logging & Error Tracking](#12-observability--logging--error-tracking)
13. [Production Readiness Checklist](#13-production-readiness-checklist)

---

## 1. Deployment Topology

```
┌───────────────────────────────────────────────────────────────────────┐
│                          GITHUB REPOSITORY                             │
│  Push to main → GitHub Actions triggered                               │
└───────────────────────────┬───────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌──────────────────────────────────────────┐
│   VERCEL (Next.js Web)  │   │   RAILWAY (Express API)                  │
│                         │   │                                           │
│  • Automatic deploys    │   │  • Docker container (node:20-alpine)      │
│    from GitHub          │   │  • Always-on persistent process           │
│  • Global edge CDN      │   │  • Automatic deploys from GitHub          │
│  • ISR page caching     │   │  • BullMQ job workers running inside      │
│  • Serverless functions │   │  • Health check endpoint at /health       │
│  • OG image generation  │   │  • Scales vertically via Railway dashboard│
└────────────┬────────────┘   └──────────────────┬───────────────────────┘
             │                                    │
             │  Supabase SDK (Auth + Storage)      │  Prisma ORM (all data ops)
             │                                    │
             └──────────────┬─────────────────────┘
                            ▼
     ┌──────────────────────────────────────────────────────────────────┐
     │                         SUPABASE                                  │
     │                                                                   │
     │  PostgreSQL 15  │  Auth (JWTs)  │  Storage (S3-compatible)       │
     │  PgBouncer (port 6543 for queries, port 5432 for migrations)      │
     └──────────────────────────────────────────────────────────────────┘
                            │
     ┌──────────────────────┼──────────────────────────────────────────┐
     │                      │                                           │
     ▼                      ▼                                           ▼
┌──────────────┐   ┌──────────────────┐                     ┌─────────────────┐
│  UPSTASH     │   │    PAYSTACK      │                     │     RESEND      │
│  Redis       │   │                  │                     │                 │
│              │   │  • Charge API    │                     │  Transactional  │
│  • Rate limits│  │  • Transfer API  │                     │  Email          │
│  • Caching   │   │  • Webhooks      │                     │  (orders, escrow│
│  • BullMQ    │   │  • MoMo payments │                     │   reminders,    │
│    job queues│   │  • Bank payouts  │                     │   alerts)       │
└──────────────┘   └──────────────────┘                     └─────────────────┘
```

### Why Railway for Express (not Vercel Serverless)?

| Concern | Serverless Functions | Railway Container |
|---|---|---|
| Cold starts | Yes — adds 200–2000ms latency on first request | No — always running |
| Webhook reliability | Risky — 10s timeout on hobby tier | Reliable — no timeout limit |
| BullMQ job workers | Impossible — process dies after response | Works natively |
| Cron jobs (escrow auto-release) | Unreliable — not persistent | Reliable — persistent process |
| Database connection pools | Opens new pool per invocation | Stable pool, reused across requests |
| Cost at low traffic | Very cheap | ~$5/month on Starter plan |
| Deploy workflow | Push to GitHub → auto-deploy | Push to GitHub → auto-deploy |
| Environment variables | Vercel dashboard | Railway dashboard → Variables tab |

The Express server must be **always-on**. Paystack webhooks are the financial nervous system of the platform — a cold-started serverless function that times out on a `charge.success` webhook leaves an order permanently stuck in `PENDING_PAYMENT`.

---

## 2. Monorepo Structure

```
ushop/
├── apps/
│   ├── web/                         # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (auth)/              # Login, register, verify routes
│   │   │   ├── (marketplace)/       # Homepage, search, category pages
│   │   │   ├── store/
│   │   │   │   └── [handle]/        # /store/janes-tech — dynamic SSR
│   │   │   ├── listing/
│   │   │   │   └── [id]/            # Individual listing detail page
│   │   │   ├── checkout/            # Checkout + callback flow
│   │   │   ├── dashboard/           # Buyer/seller dashboard (protected)
│   │   │   └── admin/               # Admin panel (ADMIN role only)
│   │   ├── components/
│   │   │   ├── ui/                  # Shared UI primitives
│   │   │   ├── store/               # Store-specific components
│   │   │   ├── listing/             # Listing cards, detail, creation form
│   │   │   └── checkout/            # Checkout components (Client Components)
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── server.ts        # Server Component + Server Action client
│   │   │   │   └── client.ts        # Browser client (Client Components)
│   │   │   ├── api.ts               # Typed fetch wrapper for Express API calls
│   │   │   └── utils.ts
│   │   └── middleware.ts            # Edge middleware — auth guard + handle validation
│   │
│   └── api/                         # Express.js backend
│       ├── src/
│       │   ├── routes/              # URL definitions only
│       │   ├── controllers/         # HTTP req/res handling only
│       │   ├── services/            # All business logic
│       │   ├── middleware/          # authenticate, authorize, rateLimiter, validateBody
│       │   ├── jobs/                # BullMQ worker handlers
│       │   ├── lib/
│       │   │   ├── prisma.ts        # PrismaClient singleton
│       │   │   ├── paystack.ts      # Paystack API wrapper
│       │   │   ├── supabase-admin.ts
│       │   │   ├── redis.ts         # Upstash Redis singleton
│       │   │   └── resend.ts        # Email client
│       │   └── index.ts             # App entry point
│       ├── prisma/
│       │   ├── schema.prisma        # Single source of truth for DB schema
│       │   └── migrations/          # Auto-generated migration files
│       └── Dockerfile               # Production container definition
│
├── packages/
│   └── shared/                      # Shared TypeScript types + Zod schemas
│       └── src/
│           ├── types/               # Shared interfaces (used by both apps)
│           └── schemas/             # Zod schemas (validated on both frontend + backend)
│
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD pipeline
├── package.json                     # Root workspace config
└── turbo.json                       # Turborepo build pipeline
```

### Initialise the monorepo

```bash
mkdir ushop && cd ushop
pnpm init
pnpm add turbo -D -w

# Create app directories
mkdir -p apps/web apps/api packages/shared

# Next.js frontend
cd apps/web
pnpx create-next-app@latest . --typescript --tailwind --eslint --app

# Express API
cd ../api
pnpm init
pnpm add express cors helmet morgan dotenv @supabase/supabase-js
pnpm add -D typescript @types/express @types/node ts-node nodemon
pnpm add prisma @prisma/client
pnpx prisma init --datasource-provider postgresql

# Root workspace config
cd ../..
```

**Root `package.json`:**

```json
{
  "name": "ushop",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev":          "turbo dev",
    "build":        "turbo build",
    "test":         "turbo test",
    "typecheck":    "turbo typecheck",
    "lint":         "turbo lint",
    "db:migrate":   "cd apps/api && prisma migrate dev",
    "db:studio":    "cd apps/api && prisma studio",
    "db:generate":  "cd apps/api && prisma generate"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

---

## 3. Environment Variables

### Express API (`apps/api/.env`)

```bash
# ── Database ────────────────────────────────────────────────────────────────
# Two URLs are required. See Section 4 for the full explanation.
# APPLICATION QUERIES — goes through PgBouncer connection pooler (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@[host]:6543/postgres?pgbouncer=true"
# MIGRATIONS ONLY — direct connection bypassing PgBouncer (port 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@[host]:5432/postgres"

# ── Supabase ────────────────────────────────────────────────────────────────
SUPABASE_URL="https://[project-ref].supabase.co"
# SERVICE_ROLE bypasses ALL Row Level Security. NEVER expose to the frontend.
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# ── Paystack ────────────────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY="sk_live_..."          # Live key — used for all API calls
PAYSTACK_WEBHOOK_SECRET="your_secret"     # From Paystack dashboard → webhooks → secret

# ── Redis (Upstash) ─────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ── Email (Resend) ──────────────────────────────────────────────────────────
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@ushop.com"

# ── Application ─────────────────────────────────────────────────────────────
PORT=4000
FRONTEND_URL="https://ushop.com"
NODE_ENV="production"

# ── Observability ───────────────────────────────────────────────────────────
SENTRY_DSN="https://..."
LOG_LEVEL="info"   # "debug" in development, "info" in production
```

### Next.js Frontend (`apps/web/.env.local`)

```bash
# NEXT_PUBLIC_ = safe to expose in the browser
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."   # Limited permissions — subject to RLS
NEXT_PUBLIC_API_URL="https://api.ushop.com/api/v1"
NEXT_PUBLIC_SENTRY_DSN="https://..."

# No NEXT_PUBLIC_ prefix = server-only (Server Components only, never browser)
SUPABASE_SERVICE_ROLE_KEY="eyJ..."       # Used for admin operations in Server Components
```

### GitHub Actions secrets (set in repository settings)

```
RAILWAY_TOKEN               # Railway deployment token (Settings → Tokens)
RAILWAY_SERVICE_ID          # Railway service ID for the Express API
VERCEL_TOKEN                # Vercel deployment token
VERCEL_ORG_ID               # Vercel organisation ID
VERCEL_PROJECT_ID           # Vercel project ID
PRODUCTION_DIRECT_URL       # Supabase direct URL for migration step
```

---

## 4. Supabase — Database & Connection Pooling

### The two-URL problem

This is the most common source of production outages for teams using Supabase with Prisma. PostgreSQL has a hard limit on concurrent connections (free tier: ~60, Pro tier: more). Without a pooler, every Express request opens a new connection — a traffic spike exhausts the limit and all queries start failing.

**Supabase's built-in solution: PgBouncer**

| URL | Port | When to use | Why |
|---|---|---|---|
| `DATABASE_URL` (PgBouncer) | 6543 | All application queries | Multiplexes thousands of app requests through ~20 real DB connections |
| `DIRECT_URL` | 5432 | Prisma migrations only | Migrations need DDL operations that PgBouncer's transaction mode doesn't support |

```prisma
// apps/api/prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")    // PgBouncer — used by all queries at runtime
  directUrl = env("DIRECT_URL")      // Direct — used ONLY by prisma migrate CLI
}
```

The `?pgbouncer=true` flag in `DATABASE_URL` disables Prisma's prepared statement caching, which is incompatible with PgBouncer's transaction-mode pooling.

### Prisma Client singleton

```typescript
// apps/api/src/lib/prisma.ts
// Create exactly ONE PrismaClient instance for the entire process lifetime.
// Multiple instances = multiple connection pools = exhausted connections.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? [{ level: 'query', emit: 'stdout' }]  // Log all SQL in dev — very verbose, off in prod
    : [{ level: 'warn', emit: 'stdout' }, { level: 'error', emit: 'stdout' }],
});

// Prevent hot-module-reloading from creating a new instance on every file change
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Connection pool limits

For a Railway deployment with a single service instance:

```typescript
// In DATABASE_URL, append connection pool params:
// ?pgbouncer=true&connection_limit=10&pool_timeout=20
//
// connection_limit: Max simultaneous connections from this instance to PgBouncer.
// With a single instance: set to 10-15.
// With multiple instances: total = instances × connection_limit. Keep well under Supabase limit.
// pool_timeout: Seconds to wait for a free connection before throwing an error.
```

### Supabase Storage bucket configuration

All buckets are created in the Supabase dashboard before first deploy:

| Bucket | Public read | Max file size | Allowed types |
|---|---|---|---|
| `product-images` | ✅ Yes | 10 MB | image/jpeg, image/png, image/webp |
| `store-assets` | ✅ Yes | 5 MB | image/jpeg, image/png, image/webp |
| `user-avatars` | ✅ Yes | 3 MB | image/jpeg, image/png, image/webp |
| `verification-docs` | ❌ No | 5 MB | image/jpeg, image/png, image/pdf |
| `dispute-evidence` | ❌ No | 50 MB | image/*, video/mp4 |
| `message-attachments` | ❌ No | 10 MB | image/jpeg, image/png, image/webp |

**File path convention:** Always store paths (not full URLs) in the database. Generate public URLs on-the-fly:

```typescript
// Public bucket — get URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl('listings/abc123/photo-1.webp', {
    transform: { width: 400, quality: 80 }  // Supabase image transform
  });

// Private bucket — get time-limited signed URL
const { data } = await supabaseAdmin.storage
  .from('verification-docs')
  .createSignedUrl('student-ids/user123/front.webp', 3600); // 1-hour expiry
```

---

## 5. Express API — Railway Container Setup

Railway deploys directly from your GitHub repository. It detects the `Dockerfile` in `apps/api/` and builds it automatically on every push to `main`. No CLI tooling required on your local machine beyond the initial project setup.

### Railway project setup (one-time)

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. Select your `ushop` monorepo
3. Railway will prompt for the root directory — set it to `apps/api`
4. Set **Start Command** to `node dist/index.js` (or leave blank if using the Dockerfile CMD)
5. Go to **Settings → Networking** → enable **Public Networking** → Railway assigns a domain like `ushop-api.up.railway.app`
6. Go to **Settings → Health Checks** → set path to `/health`, port `4000`
7. Go to **Variables** → add all environment variables from Section 3

### Dockerfile

```dockerfile
# apps/api/Dockerfile
# Two-stage build: "builder" compiles TypeScript; "production" runs compiled JS.
# Railway builds this automatically — no flyctl or CLI needed.

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy package files first — Docker caches this layer until dependencies change.
# pnpm install only re-runs when lockfile changes, not on every code push.
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client (TypeScript types from schema)
RUN pnpm --filter api exec prisma generate

# Compile TypeScript to JavaScript
RUN pnpm --filter api exec tsc

# ── Stage 2: Production ─────────────────────────────────────────────────────
# Start fresh — excludes TypeScript compiler, dev dependencies, build tools.
# Final image is ~60% smaller than a single-stage build.
FROM node:20-alpine AS production

WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Run as non-root — if the container is compromised, attacker doesn't get root
USER node

EXPOSE 4000

# Railway uses this for health monitoring. Unhealthy containers are restarted.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "apps/api/dist/index.js"]
```

### railway.json (optional — for explicit config)

Railway can be configured entirely through the dashboard, but committing a `railway.json` keeps your deployment config in version control:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "apps/api/Dockerfile"
  },
  "deploy": {
    "startCommand": "node apps/api/dist/index.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Place this file at `apps/api/railway.json`.

### Environment variables on Railway

Railway injects environment variables at runtime from the **Variables** tab in your service dashboard. Do not commit `.env` files. The required variables match Section 3 exactly — copy them from your local `apps/api/.env` into the Railway dashboard.

Railway also provides a `DATABASE_PUBLIC_URL` if you add a Railway PostgreSQL service, but **U-Shop uses Supabase for its database** — do not use Railway's database add-on. Add only the Supabase `DATABASE_URL` and `DIRECT_URL` from your Supabase project settings.

### Always-on configuration

Railway's Starter and Pro plans keep your service running continuously. Unlike serverless functions, the container does not sleep between requests. This is required for:

- Paystack webhook delivery (must respond within 20 seconds)
- BullMQ worker processes (must be running to consume jobs)
- Escrow auto-release cron (must fire every minute without interruption)

Verify this is working by checking **Metrics → CPU/Memory** in the Railway dashboard after deployment — you should see consistent low-level activity from the job workers even when no HTTP traffic is present.

### Express app entry point — middleware order

```typescript
// apps/api/src/index.ts
// Middleware order matters. Getting it wrong silently breaks webhook verification.

import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';

const app = express();

// 1. Security headers (always first)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],
    styleSrc:   ["'self'", "'unsafe-inline'"],
    imgSrc:     ["'self'", "data:", "*.supabase.co"],
    connectSrc: ["'self'", "*.supabase.co", "api.paystack.co"],
  }
}));

// 2. CORS — restrict to production frontend domain only
app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true,
}));

// 3. ⚠ WEBHOOK ROUTES BEFORE BODY PARSERS — critical ordering
// Paystack HMAC verification requires the raw Buffer body.
// express.json() destroys the raw bytes. Register webhooks first.
app.use('/webhooks', webhookRoutes);

// 4. Body parsers (after webhook routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 6. Rate limiting
app.use('/api', rateLimiter.general);

// 7. Application routes
app.use('/api/v1/auth',     authRoutes);
app.use('/api/v1/users',    userRoutes);
app.use('/api/v1/stores',   storeRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/orders',   orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/admin',    adminRoutes);

// 8. Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 9. Error handler — MUST be last (4-param signature)
app.use(errorHandler);

app.listen(parseInt(process.env.PORT ?? '4000'));
```

---

## 6. Next.js Frontend — Vercel

### Rendering strategy

| Route | Strategy | Reason |
|---|---|---|
| `/store/[handle]` | ISR (`revalidate: 60`) | SSR for SEO; cached 60s; on-demand revalidation on store update |
| `/listing/[id]` | Dynamic (`revalidate: 5`) | Listings change frequently (sold, price update) — short cache |
| `/` (homepage) | ISR (`revalidate: 60`) | Featured listings; acceptable 60s staleness |
| `/search` | Dynamic (no cache) | Search results are query-specific; not worth caching |
| `/dashboard/*` | Dynamic (no cache) | Authenticated, user-specific — never cache |
| `/admin/*` | Dynamic (no cache) | Admin data must always be fresh |
| `/api/og/store/[handle]` | CDN cached 24h | OG image generated once, served from edge |

### On-demand revalidation

```typescript
// apps/web/app/actions/store.ts
// When a seller updates their store, immediately invalidate the cached page.
'use server'
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateStore(handle: string, data: UpdateStoreData) {
  await apiFetch(`/stores/${handle}`, { method: 'PATCH', body: JSON.stringify(data) });
  revalidatePath(`/store/${handle}`);    // Invalidate the specific store page
  revalidateTag(`store:${handle}`);      // Invalidate any tagged fetches
}
```

### Supabase SSR client setup

```typescript
// apps/web/lib/supabase/server.ts
// Server Component client — reads/writes cookies for session management
import { createServerClient } from '@supabase/ssr';
import { cookies }            from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name)          => cookieStore.get(name)?.value,
        set:    (name, val, opts) => cookieStore.set({ name, value: val, ...opts }),
        remove: (name, opts)    => cookieStore.set({ name, value: '', ...opts }),
      },
    }
  );
}

// apps/web/lib/supabase/client.ts
// Browser client — for use only in Client Components ('use client')
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Typed API fetch wrapper

```typescript
// apps/web/lib/api.ts
// All calls from Next.js to the Express API go through this wrapper.
// It handles auth token injection, error parsing, and TypeScript types.

import { createClient } from '@/lib/supabase/server';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  // If no token provided, get it from the Supabase session (Server Components)
  let token = accessToken;
  if (!token) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.code ?? 'UNKNOWN', error.message);
  }

  return response.json();
}
```

---

## 7. Redis — Upstash

Upstash is chosen over self-hosted Redis because:
- Serverless-compatible REST API (works in Vercel Edge functions and Railway containers)
- Pay-per-request pricing — zero cost at zero traffic
- Persistent across deployments — no data loss on container restart
- Multi-region replication available (Phase 2)

### Redis singleton

```typescript
// apps/api/src/lib/redis.ts
import { Redis } from '@upstash/redis';

// Singleton — reuse the same connection across the app
export const redis = Redis.fromEnv();
// Reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from environment
```

### Key naming conventions

```
user:supa:{supabaseId}         → cached User DB record (TTL: 300s)
store:{handle}                 → cached Store + listings (TTL: 300s)
search:{md5(queryString)}      → cached search results first page (TTL: 120s)
handle:available:{slug}        → handle availability check result (TTL: 30s)
login:failures:{userId}        → failed login attempt counter (TTL: 900s)
rate:{endpoint}:{identifier}   → rate limit counter (managed by Upstash Ratelimit)
```

### Cache-aside pattern

```typescript
// apps/api/src/lib/cache.ts
export const cache = {
  async getOrSet<T>(key: string, computeFn: () => Promise<T>, ttlSeconds = 60): Promise<T> {
    const cached = await redis.get<T>(key);
    if (cached !== null) return cached;  // Cache hit

    const value = await computeFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
    return value;
  },

  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    // Use sparingly — KEYS command scans entire keyspace
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  },
};
```

---

## 8. Background Jobs — BullMQ

BullMQ provides persistent, reliable job queues backed by Redis. Jobs survive server restarts because they're stored in Redis, not in application memory. This is why `setTimeout` is never used for scheduled business-critical tasks.

### Queue definitions

```typescript
// apps/api/src/lib/queues.ts
import { Queue } from 'bullmq';
import { redis } from './redis';

const connection = { url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! };

export const emailQueue        = new Queue('email',        { connection });
export const escrowReleaseQueue= new Queue('escrow-release',{ connection });
export const deletionQueue     = new Queue('deletion',     { connection });
export const ogImageQueue      = new Queue('og-image',     { connection });
export const notificationQueue = new Queue('notification', { connection });
```

### Worker definitions

```typescript
// apps/api/src/jobs/escrow-release.job.ts
// Runs every minute as a repeating job.
// Finds orders where escrowReleaseAt <= NOW() and status = PAYMENT_RECEIVED.

import { Worker } from 'bullmq';

new Worker('escrow-release', async () => {
  const overdueOrders = await prisma.order.findMany({
    where: {
      status: 'PAYMENT_RECEIVED',
      escrowReleaseAt: { lte: new Date() },
    },
    select: { id: true }
  });

  for (const order of overdueOrders) {
    await EscrowService.releaseEscrow(order.id, 'AUTO_7DAY');
  }
}, { connection });

// Schedule the recurring job (call once at app startup)
await escrowReleaseQueue.add('auto-release', {}, {
  repeat: { every: 60 * 1000 }  // Every 60 seconds
});
```

```typescript
// apps/api/src/jobs/escrow-reminder.job.ts
// Called when an order enters PAYMENT_RECEIVED status.
// Schedules 4 reminder emails at specific delays.

export async function scheduleEscrowReminders(orderId: string, releaseAt: Date): Promise<void> {
  const t = releaseAt.getTime();
  await emailQueue.add('escrow-reminder', { orderId, urgency: 'low'    }, { delay: t - Date.now() - 4 * DAY });
  await emailQueue.add('escrow-reminder', { orderId, urgency: 'medium' }, { delay: t - Date.now() - 2 * DAY });
  await emailQueue.add('escrow-reminder', { orderId, urgency: 'high'   }, { delay: t - Date.now() - 1 * DAY });
  await emailQueue.add('escrow-reminder', { orderId, urgency: 'urgent' }, { delay: t - Date.now() - 6 * HOUR });
}
```

```typescript
// apps/api/src/jobs/reconciliation.job.ts
// Runs every 5 minutes. Catches orders stuck in PENDING_PAYMENT
// because a Paystack webhook was missed (server was down during delivery).

new Worker('reconciliation', async () => {
  const stuckOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: { lte: new Date(Date.now() - 10 * 60 * 1000) }  // Older than 10 min
    }
  });

  for (const order of stuckOrders) {
    const res  = await fetch(`https://api.paystack.co/transaction/verify/${order.paystackRef}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
    const { data } = await res.json();

    if (data.status === 'success') {
      await WebhookService.handleChargeSuccess(data);
      logger.info({ orderId: order.id }, 'Reconciled stuck order — payment verified directly');
    } else if (data.status === 'failed' || data.status === 'abandoned') {
      // Cancel order and restore stock
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
        prisma.listing.update({ where: { id: order.items[0].listingId },
          data: { stock: { increment: order.items[0].quantity } } }),
      ]);
    }
  }
}, { connection });

await reconciliationQueue.add('reconcile', {}, { repeat: { every: 5 * 60 * 1000 } });
```

### Starting workers at app startup

```typescript
// apps/api/src/index.ts — add after app.listen()
import './jobs/escrow-release.job';
import './jobs/escrow-reminder.job';
import './jobs/reconciliation.job';
import './jobs/deletion.job';
```

---

## 9. CI/CD — GitHub Actions

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ── Job 1: Tests (runs on every PR and push) ─────────────────────────────
  test:
    name: Test, Lint & Type Check
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: ushop_test
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run database migrations
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
          DIRECT_URL:   postgresql://postgres:testpassword@localhost:5432/ushop_test
        run: pnpm --filter api exec prisma migrate deploy

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
          DIRECT_URL:   postgresql://postgres:testpassword@localhost:5432/ushop_test
          NODE_ENV:     test
        run: pnpm test

      - name: TypeScript type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

  # ── Job 2: Deploy Express API to Railway (main branch only) ──────────────
  deploy-api:
    name: Deploy API → Railway
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      # Run Prisma migrations against production DB BEFORE deploying new code.
      # New code may depend on schema changes that must land first.
      # Uses DIRECT_URL (port 5432) — migrations need a direct connection, not PgBouncer.
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run production migrations
        env:
          DIRECT_URL: ${{ secrets.PRODUCTION_DIRECT_URL }}
        run: pnpm --filter api exec prisma migrate deploy

      # Railway redeploys automatically on push to main via its GitHub integration.
      # The step below triggers a manual redeploy via the Railway API as an explicit
      # signal — useful to confirm deploy was triggered and track it in the Actions log.
      - name: Trigger Railway redeploy
        env:
          RAILWAY_TOKEN:      ${{ secrets.RAILWAY_TOKEN }}
          RAILWAY_SERVICE_ID: ${{ secrets.RAILWAY_SERVICE_ID }}
        run: |
          curl -s -X POST "https://backboard.railway.app/graphql/v2" \
            -H "Authorization: Bearer $RAILWAY_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{\"query\": \"mutation { serviceInstanceRedeploy(serviceId: \\\"$RAILWAY_SERVICE_ID\\\") }\"}"

  # ── Job 3: Deploy Next.js Frontend to Vercel (main branch only) ─────────
  deploy-web:
    name: Deploy Web → Vercel
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token:      ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:     ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args:       '--prod'
```

### Deployment order matters

```
1. Tests pass
2. Run Prisma migrations on production DB  ← schema changes land first
3. Deploy new Express API code             ← new code reads new schema
4. Deploy new Next.js frontend             ← frontend uses new API

Never: deploy code → then run migrations (new code + old schema = runtime errors)
```

---

## 10. Database Indexes & Performance Setup

Run these in the Supabase SQL Editor once, after the initial migration. Some indexes are declared in `schema.prisma` via `@@index()` — the SQL equivalents are here for reference.

```sql
-- ── Full-Text Search ───────────────────────────────────────────────────────

-- GIN index for tsvector — makes full-text search O(log n) instead of O(n)
CREATE INDEX IF NOT EXISTS listings_search_idx
  ON listings USING GIN(search_vector);

-- Trigger to auto-update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')),       'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_search_vector_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_listing_search_vector();

-- ── Listing Queries ────────────────────────────────────────────────────────

-- Most common query: active listings by category, sorted by date
-- Partial index (WHERE status = 'ACTIVE') only indexes relevant rows — much smaller
CREATE INDEX IF NOT EXISTS listings_category_status_date_idx
  ON listings(category_id, status, created_at DESC)
  WHERE status = 'ACTIVE';

-- Store listings page
CREATE INDEX IF NOT EXISTS listings_store_status_idx
  ON listings(store_id, status, created_at DESC);

-- Price range filtering
CREATE INDEX IF NOT EXISTS listings_price_idx
  ON listings(price);

-- ── Order Queries ──────────────────────────────────────────────────────────

-- Buyer's order history
CREATE INDEX IF NOT EXISTS orders_buyer_status_idx
  ON orders(buyer_id, status, created_at DESC);

-- Seller's order management
CREATE INDEX IF NOT EXISTS orders_store_status_idx
  ON orders(store_id, status, created_at DESC);

-- Escrow auto-release cron — finds orders ready for auto-release
CREATE INDEX IF NOT EXISTS orders_escrow_release_idx
  ON orders(escrow_release_at)
  WHERE status = 'PAYMENT_RECEIVED';

-- ── Webhook Idempotency ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS webhook_events_external_id_idx
  ON webhook_events(external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS webhook_events_processed_idx
  ON webhook_events(processed, created_at)
  WHERE processed = false;

-- ── Wallet ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS wallet_transactions_wallet_idx
  ON wallet_transactions(wallet_id, created_at DESC);
```

### Avoiding N+1 queries

```typescript
// WRONG — makes 1 + N database queries (N = number of listings)
const listings = await prisma.listing.findMany({ take: 20 });
for (const listing of listings) {
  listing.store = await prisma.store.findUnique({ where: { id: listing.storeId } });
}

// CORRECT — single query with JOIN via Prisma include
const listings = await prisma.listing.findMany({
  take: 20,
  include: {
    store:    { select: { id: true, name: true, handle: true,
                          owner: { select: { verificationStatus: true } } } },
    category: { select: { name: true, slug: true } },
  }
});
```

---

## 11. Caching Strategy

| Layer | What | TTL | Invalidation trigger |
|---|---|---|---|
| Vercel CDN (edge) | Store pages, category pages, homepage | 60s | `revalidatePath()` / `revalidateTag()` on update |
| Next.js fetch cache (server) | Listing detail pages | 5s | `revalidatePath('/listing/[id]')` on edit/sell |
| Redis (application) | Store profile + listings | 300s | `cache.invalidate('store:{handle}')` on update |
| Redis | Search results (first page) | 120s | `cache.invalidatePattern('search:*')` on listing change |
| Redis | Handle availability | 30s | `cache.invalidate('handle:available:{slug}')` on creation |
| Redis | User auth lookup | 300s | `cache.invalidate('user:supa:{id}')` on role/status change |

**What to never cache:**
- Wallet balances — must always be accurate
- Order details — user-specific and sensitive
- Active disputes — status can change at any moment
- Checkout flow — must always be fresh

---

## 12. Observability — Logging & Error Tracking

### Structured logging with pino

```typescript
// apps/api/src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true } }
  }),
  // Redact sensitive fields from all logs automatically
  redact: {
    paths: ['*.password', '*.token', '*.secret', '*.key',
            '*.access_token', '*.refresh_token', 'req.headers.authorization'],
    censor: '[REDACTED]'
  },
  // Standard fields on every log line for tracing
  base: { service: 'ushop-api', env: process.env.NODE_ENV },
});

// Helper to mask email addresses in logs
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 4)}***@${domain}`;
}
```

### Log levels

| Level | Use for |
|---|---|
| `INFO` | Normal operations: user created, order placed, escrow released |
| `WARN` | Recoverable anomalies: rate limit hit, slow query, duplicate webhook |
| `ERROR` | Handled failures: validation error, Paystack API timeout |
| `FATAL` | Unrecoverable failures requiring immediate attention: wallet credit failed, signature mismatch attack |

### Sentry error tracking

```typescript
// apps/api/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Don't send events in test environment
  enabled: process.env.NODE_ENV !== 'test',
});

// In error handler — capture unexpected errors
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  Sentry.captureException(err, { extra: { path: req.path, method: req.method } });
  logger.error({ err, path: req.path }, 'Unhandled error');
  res.status(500).json(buildError(500, 'INTERNAL_ERROR', 'An unexpected error occurred'));
});
```

### Health check endpoint

```typescript
// apps/api/src/index.ts
app.get('/health', async (_, res) => {
  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status:    'ok',
      timestamp: new Date().toISOString(),
      uptime:    process.uptime(),
      db:        'connected',
    });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});
```

---

## 13. Production Readiness Checklist

### Infrastructure

- [ ] `DATABASE_URL` uses PgBouncer port 6543 with `?pgbouncer=true`
- [ ] `DIRECT_URL` uses port 5432 (migrations only)
- [ ] All production secrets added to Railway Variables tab (not committed to git)
- [ ] Railway service **Start Command** set correctly; container is not sleeping
- [ ] Railway **Health Check** path set to `/health`, port `4000`
- [ ] Sentry DSN configured for both `apps/api` and `apps/web`
- [ ] Railway **Metrics** tab shows persistent CPU/memory activity from BullMQ workers

### Database

- [ ] All Prisma migrations run on production database (`prisma migrate deploy`)
- [ ] `search_vector` tsvector trigger installed and tested
- [ ] GIN index on `search_vector` created
- [ ] All composite indexes created (listings, orders, escrow, webhook_events)
- [ ] Supabase database backup schedule configured (daily minimum)
- [ ] RLS tested: accessing another user's data with ANON key returns empty, not 403

### Storage

- [ ] All 6 Supabase Storage buckets created with correct access policies
- [ ] `verification-docs` bucket is private (no public read policy)
- [ ] Image transformation parameters tested (400px thumbnails for listing cards)

### Background Jobs

- [ ] All BullMQ workers start with `apps/api/src/index.ts`
- [ ] Escrow auto-release cron tested with a 2-minute future `escrowReleaseAt`
- [ ] Reconciliation job tested: stuck order correctly resolved after 10 minutes
- [ ] Student ID deletion job scheduled and firing correctly in test environment
- [ ] BullMQ dashboard (Bull Board) accessible at `/admin/queues` (admin auth required)

### Payments

- [ ] Paystack account in live mode (not test mode)
- [ ] Webhook URL configured in Paystack dashboard: `https://api.ushop.com/webhooks/paystack`
- [ ] Webhook secret matches `PAYSTACK_WEBHOOK_SECRET` environment variable exactly
- [ ] End-to-end transaction tested: pay → webhook fires → escrow created → delivery confirmed → payout transferred
- [ ] `transfer.failed` webhook tested: wallet debit correctly reversed

### Security

- [ ] See [security.md Pre-Launch Checklist](./security.md#12-pre-launch-security-checklist) — all items must pass

### Load Testing

- [ ] Load tested to 500 concurrent users (per PRD requirement)
- [ ] Database connection pool holds under concurrent checkout load
- [ ] Rate limiters tested: 429 responses returned correctly at limit thresholds
- [ ] Search endpoint response time < 500ms at 200 concurrent search requests

---

*U-Shop Infrastructure Reference · Internal Engineering Documentation*  
*All paths reference the monorepo root unless otherwise noted.*

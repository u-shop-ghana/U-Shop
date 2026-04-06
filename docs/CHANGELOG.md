# Changelog

All notable changes to U-Shop are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.4.1] — 2026-04-06 — Security Hardening + Auth Flow Redesign

### Security Fix — Auto-Verification Vulnerability

> **CRITICAL**: Previously, `VerificationService.handlePostSignup()` auto-verified anyone who typed a student email domain (e.g., `@st.ug.edu.gh`) at signup — **before email confirmation**. This meant an attacker could type any student email they don't own, get auto-verified, and gain student-only privileges.

**Fix**: Removed auto-verification entirely. Users must now:
1. Sign up with any personal email
2. Confirm their email (click Supabase link)
3. Optionally opt into student verification via the "Verify as Student" toggle
4. After email confirmation, users who toggled → redirected to `/verify` for student ID upload
5. Users who didn't toggle → redirected to home page `/`

### Added

#### Input Sanitisation Middleware — `src/middleware/sanitize.ts`
- `sanitizePlainText()` — strips ALL HTML (store names, handles, bios, etc.)
- `sanitizeRichText()` — allowlist of safe formatting tags (`b`, `i`, `em`, `strong`, `br`, `ul`, `ol`, `li`, `p`)
- Uses `isomorphic-dompurify` as specified in `docs/technical/security.md §1`

#### Zod Validation Middleware — `src/middleware/validate-body.ts`
- Generic `validateBody(schema)` middleware per security.md §4
- Replaces `req.body` with validated + type-coerced data; strips unknown fields
- Returns standardized error envelope with field-level details on failure

### Changed

#### Auth Flow Redesign
- **Register page**: Stores `wants_student_verification` toggle in Supabase `user_metadata`
- **Callback route**: After email confirmation, reads `user_metadata.wants_student_verification` to determine redirect (`/verify?type=student` or `/`)
- **Backend `/register`**: No longer calls `VerificationService.handlePostSignup()`
- Removed `isStudentEmail` auto-detection hint from register form
- Email placeholder changed from `example@st.ug.edu.gh` to `your@email.com`

#### Helmet CSP Hardening — `src/index.ts`
- Replaced bare `helmet()` with explicit Content Security Policy directives
- `script-src: 'self'` — blocks inline scripts even if XSS injection reaches the DB
- `img-src` restricted to `self`, `data:`, `*.supabase.co`
- `connect-src` restricted to `self`, `*.supabase.co`, `api.paystack.co`

### Dependencies Added
- `isomorphic-dompurify` — HTML sanitisation for user-generated content

---

## [0.4.0] — 2026-04-05 — Phase 1B: Database + Auth Provider + Dashboard

### Added

#### Database — All 13 Tables Live in Supabase
- Ran `prisma db push` to create all models: `User`, `Store`, `Category`, `Listing`, `Order`, `OrderItem`, `Escrow`, `Wallet`, `WalletTransaction`, `Payout`, `MessageThread`, `Message`, `Review`, `Dispute`, `WebhookEvent`
- All 12 enums created: `UserRole`, `VerificationStatus`, `ListingStatus`, `ListingCondition`, `OrderStatus`, `EscrowStatus`, `DisputeStatus`, `DisputeReason`, `PayoutStatus`, `WalletTransactionType`, `DeliveryMode`, `WebhookEventType`
- Generated Prisma Client v6.19.2

#### Auth Provider — `src/lib/auth/`
- `auth-provider.tsx` — React context provider that hydrates user state from Supabase session + Express API (`GET /api/v1/auth/me`). Subscribes to `onAuthStateChange` for auto-sync on login/logout/token-refresh
- `types.ts` — Shared `AuthUser` and `AuthContextType` interfaces
- `hooks/use-auth.ts` — Convenience hook with safety check (throws if used outside provider)
- Wired `<AuthProvider>` into root `layout.tsx`

#### Dashboard — `src/app/dashboard/`
- `layout.tsx` — Sidebar navigation with role-adaptive links (Buyer vs Seller vs Admin), user profile section, mobile-responsive hamburger menu, verification status badges
- `page.tsx` — Overview page with time-of-day greeting, stats cards (placeholder), role-aware quick actions, and account info section

### Changed
- **Favicon fix** — Replaced default Next.js favicon in `src/app/favicon.ico` with real U-Shop brand favicon (the `src/app/` file was overriding `public/favicon.ico`)
- **DIRECT_URL** — Fixed to use Supabase Session Mode pooler (port 5432 on `pooler.supabase.com`) since direct DB connection was blocked by local network

### Technical Notes
- `prisma db push` was used instead of `prisma migrate dev` because local network blocks direct PostgreSQL connections (port 5432 on `db.*.supabase.co`). Session Mode pooler supports DDL operations.
- Auth state flows: Supabase JWT → Express API verification → internal User record → React context
- Dashboard layout uses Material Symbols Outlined for consistent iconography

---

## [0.3.1] — 2026-04-02 — Real Brand Assets & Favicons

### Added
- **Favicons & PWA** — Proper favicon metadata in root layout (16x16, 32x32, apple-touch-icon, android-chrome 192/512) referencing real brand assets from `/assets/logos/favicon/`
- **Web Manifest** — Created `public/manifest.json` for PWA support with U-Shop branding, theme color, and maskable icons
- **Favicon copies** — Copied `favicon.ico` and `apple-touch-icon.png` to `/public/` root for automatic browser discovery

### Changed
- **Login hero** — Replaced solid `bg-campus-card` with actual `login.png` photo (students collaborating on laptops) + purple gradient overlay matching Figma design
- **Register hero** — Replaced solid `bg-ushop-purple` with actual `signup.png` photo (Ghanaian students studying together) + purple-to-pink gradient overlay
- **Forgot Password hero** — Added `forgot password.png` illustrated students scene with purple overlay
- **Reset Password hero** — Added `reset password.png` students collaboration photo with dark-to-purple gradient
- **Verify hero** — Added `verify.png` Ghanaian university campus students photo with purple tint overlay
- **All logos** — Replaced all 12 hardcoded text logos (`<div>U</div><span>shop</span>`) across 5 auth pages with `next/image` `<Image>` components referencing the real `logo-300w.png` brand asset
- **Root layout** — Added SEO icons metadata for all favicon sizes and apple-touch-icon

### Technical Notes
- All hero images use `next/image` with `fill` mode, `mix-blend-overlay` opacity, and `priority` loading for LCP optimization
- Logo images use `next/image` with explicit `width`/`height` and `object-contain` for crisp rendering at all DPIs
- `sizes="50vw"` on hero images enables Next.js to serve optimally-sized images for split-screen layouts

---

## [0.3.0] — 2026-04-01 — Phase 1: Frontend Auth Pages

### Added

#### Design System — `apps/web/src/app/globals.css`
- Full U-Shop design system for Tailwind v4 via `@theme inline`
- Brand core tokens: `ushop-red`, `ushop-purple`, `ushop-magenta`, `ushop-pink`
- Ink layer system: `ink-void`, `ink-deep`, `ink-dark`, `ink-mid`, `ink-surface`
- Campus Figma tokens: `campus-dark`, `campus-card`, `campus-purple`, `campus-pink`
- Text colors: `ink-text`, `ink-soft`, `ink-muted`, `ink-disabled`
- Semantic status colors: `success`, `warning`, `error`, `info`
- Utility classes: `.text-gradient-brand`, `.bg-gradient-brand`, `.bg-gradient-cta`, `.bg-dark-mesh`
- Typography custom properties matching `docs/brand/typography.md` scale

#### Root Layout — `apps/web/src/app/layout.tsx`
- Replaced Geist fonts with **Plus Jakarta Sans** (primary) + **IBM Plex Mono** (secondary)
- SEO metadata: title, description, keywords for U-Shop Ghana
- Material Symbols Outlined icon font loaded
- Dark mode enabled by default (`dark` class on `<html>`)

#### Supabase Client Setup
- **Browser client** — `apps/web/src/lib/supabase/client.ts` for Client Components
- **Server client** — `apps/web/src/lib/supabase/server.ts` for Server Components with cookie-based sessions
- Both use `@supabase/ssr` for proper SSR/SSG compatibility

#### Next.js Middleware — `apps/web/src/middleware.ts`
- Automatic Supabase auth token refresh on every request
- Route protection: redirects unauthenticated users from `/dashboard`, `/settings`, etc.
- Reverse protection: redirects authenticated users away from `/login`, `/register`
- `returnTo` parameter support for post-login redirects

#### Auth Pages — `apps/web/src/app/(auth)/`

**Login** — `login/page.tsx`
- Split-screen layout: hero section (desktop), form card (all sizes)
- Email/password login via `supabase.auth.signInWithPassword()`
- Google OAuth via `supabase.auth.signInWithOAuth()`
- Show/hide password toggle, "Remember me" checkbox
- "Forgot Password?" link, error messages with user-friendly text
- Login/Sign Up tab switcher, social proof badges

**Register** — `register/page.tsx`
- Student hero banner with campus imagery + feature badges
- Full Name, Email, Password fields with icon prefixes
- **Password strength indicator** (4-level: Weak → Strong)
- **Student email auto-detection** — green badge when `.edu.gh` domain detected
- "Verify as Student" toggle with explanation
- Terms & Privacy Policy checkbox (required)
- Supabase signup → Express API `/register` sync → auto-verify flow
- Google OAuth signup option

**Forgot Password** — `forgot-password/page.tsx`
- Email entry form with Supabase `resetPasswordForEmail()`
- Success state with "Check Your Email" confirmation
- "Try again" option, "Need Help?" support note
- Back to Login navigation

**Reset Password** — `reset-password/page.tsx`
- New Password + Confirm Password fields with show/hide
- **Real-time security requirement checkers** (8 chars, uppercase+number, match)
- Supabase `updateUser()` for password change
- Visual feedback: green check icons as requirements are met

**Student Verification** — `verify/page.tsx`
- Three states: email confirmation, manual verification, submission success
- University dropdown (10 Ghanaian institutions)
- Student email input with `.edu.gh` auto-verify detection
- **Dual file upload** for Student ID (front/back) with type/size validation
- Security/encryption notice
- "Skip for now" option to continue without verification

**OAuth Callback** — `callback/route.ts`
- Route handler for Supabase OAuth code exchange
- Automatic backend user sync via `/api/v1/auth/register`
- Error fallback redirect to login

### Changed
- Added `@ushop/shared` as workspace dependency to `apps/web/package.json`
- All auth pages follow the Figma designs from `design/web-designs/desktop/`

### Fixed
- **Build failure on `/verify`** — Wrapped `useSearchParams()` in a `<Suspense>` boundary to satisfy Next.js 16 static generation requirements. Without this, the build crashes during prerendering because `useSearchParams` is a client-only hook that can't be resolved at build time.

---

## [0.2.0] — 2026-04-01 — Phase 1: Auth & Verification


### Added

#### Supabase Admin Client — `src/lib/supabase.ts`
- Supabase admin client using `SERVICE_ROLE_KEY` (bypasses RLS)
- Fail-fast startup validation — crashes immediately with clear error messages if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing
- Server-side config: `autoRefreshToken: false`, `persistSession: false`
- Used for: JWT verification, storage management, admin operations

#### Auth Middleware — `src/middleware/authenticate.ts`
- `authenticate()` — verifies Supabase JWT via `getUser()` (revocation-safe), looks up internal User record, checks suspension status, attaches `req.user`
- `requireSeller()` — restricts to users with SELLER, BOTH, or ADMIN roles
- `requireAdmin()` — restricts to ADMIN role only
- `requireVerified()` — restricts to VERIFIED verification status
- Minimal `SELECT` on user lookup to avoid leaking sensitive fields (e.g., `studentIdImagePath`)

#### Auth Routes — `src/routes/auth.ts`
- `POST /api/v1/auth/register` — creates internal User record after Supabase signup; idempotent (returns existing user if called twice); triggers auto-verification for student emails
- `POST /api/v1/auth/sync` — safety net endpoint for re-syncing Supabase → DB if registration failed
- `GET /api/v1/auth/me` — returns full user profile with store info
- `POST /api/v1/auth/verify/upload` — submit student ID image path for admin review; guards against re-submission while PENDING

#### Verification Service — `src/services/verification.service.ts`
- **Auto-verification (Path 1):** Matches email against 18 Ghanaian university domains with subdomain support (e.g., `st.ug.edu.gh` → `ug.edu.gh`)
- **Manual verification (Path 2):** ID upload → PENDING status → admin review
- `extractUniversityName()` — maps domain to human-readable name (UG, KNUST, Ashesi, etc.)
- State machine guards: prevents re-submission while PENDING, prevents upload if already VERIFIED
- `approveVerification()` / `rejectVerification()` — admin actions with audit logging

#### Rate Limiter — `src/middleware/rate-limiter.ts`
- In-memory sliding-window rate limiter with 4 tiers:
  - `auth`: 10 req / 15 min (brute-force prevention)
  - `general`: 200 req / 15 min (normal API usage)
  - `upload`: 30 req / hour (storage abuse prevention)
  - `checkout`: 5 req / 15 min (payment spam prevention)
- Sets standard `X-RateLimit-*` and `Retry-After` headers
- Auto-cleanup of expired entries every 5 minutes
- Designed for easy swap to Upstash Redis for multi-instance deploys

#### Type Declarations — `src/types/express.d.ts`
- Dedicated ambient declaration file for `req.user` type augmentation
- Avoids ESM namespace lint warnings from inline `declare global`

#### Dependency
- Installed `@supabase/supabase-js` in `@ushop/api`

### Changed
- Updated `src/index.ts` — wired auth routes at `/api/v1/auth` with strict rate limiting, general rate limit on all `/api` routes

---

## [0.1.0] — 2026-03-28 — Phase 0: Foundation & Project Setup

### Added

#### Project Structure
- Created root organizational directories: `docs/`, `design/`, `business/`, `assets/`, `testing/`, `deployment/`, `packages/` — each with full subdirectory trees per `COMPLETE_FOLDER_STRUCTURE.md`
- Added `.gitkeep` files to all empty directories so Git tracks them
- Created root `README.md` with project overview, folder map, and tech stack
- Created `.editorconfig` for cross-editor formatting consistency
- Created root `.gitignore` covering all project folders (deps, builds, env files, SSL, Terraform state)
- Created `.github/PULL_REQUEST_TEMPLATE.md`

#### Monorepo Initialization
- Initialized pnpm workspace in `development/` with `pnpm-workspace.yaml`
- Configured Turborepo (`turbo.json`) with `dev`, `build`, `lint`, `typecheck`, `test`, `clean` tasks
- Installed root devDependencies: `turbo`, `prettier`, `eslint`
- Created root `tsconfig.json` with project references for `api`, `web`, and `shared`

#### Frontend — `apps/web`
- Bootstrapped Next.js 14 (App Router) with TypeScript, Tailwind CSS, ESLint, and `src/` directory
- Removed nested `.git` directory created by `create-next-app` (caused GitHub submodule issue)

#### Backend — `apps/api`
- Created Express API entry point (`src/index.ts`) with middleware chain: Helmet → CORS → Morgan → body parsing → health check → error handling
- Created Pino structured logger (`src/lib/logger.ts`) with sensitive data redaction (auth headers, passwords, tokens)
- Created Prisma client singleton (`src/lib/prisma.ts`) with hot-reload protection and dev query logging
- Created centralized error handler (`src/middleware/error-handler.ts`) — distinguishes operational vs programming errors, hides internals in production
- Created 404 handler (`src/middleware/not-found.ts`)
- Created `.env.example` with all required environment variables documented
- Installed dependencies: `express`, `cors`, `helmet`, `morgan`, `pino`, `pino-pretty`, `zod`, `@prisma/client`, `dotenv`
- Installed devDependencies: `tsx`, `typescript`, `prisma`, `@types/*`, `eslint`

#### Database — Prisma Schema
- Created full schema (`prisma/schema.prisma`) with **15 models** and **11 enums**:
  - `User` — Supabase auth integration, student verification status, role system
  - `Store` — unique handles, structured return/warranty policies (7 configurable fields), aggregate stats
  - `Category` — tech categories with slug and ordering
  - `Listing` — 6-tier condition grading, status lifecycle (Draft → Active → Paused → Sold), full-text search vector, Decimal pricing
  - `Order` / `OrderItem` — Paystack integration, meetup code system, policy snapshots, Decimal fee calculations
  - `Escrow` — hold/release/freeze lifecycle with auto-release scheduling
  - `Wallet` / `WalletTransaction` — balance tracking with full audit trail
  - `Payout` — Paystack transfer integration with MoMo/bank support
  - `MessageThread` / `Message` — listing + order context, read tracking
  - `Review` — one-per-transaction enforcement via `@@unique`
  - `Dispute` — structured reasons, evidence URLs, resolution workflow
  - `WebhookEvent` — Paystack event idempotency via `externalId`
- Added composite indexes for query performance: `(storeId, status)`, `(categoryId, status)`, `(buyerId)`, `(receiverId, isRead)`, etc.
- Created seed script (`prisma/seed.ts`) for 10 tech categories

#### Shared Package — `packages/shared`
- Created `constants.ts`: 10 tech categories, 6-tier condition grades, order status labels, platform fee rates (5% student / 8% reseller), handle validation rules, ~50 reserved handles, 20 Ghanaian university email domains, return/warranty policy options
- Created `schemas.ts`: Zod validation schemas for all API endpoints — `registerSchema`, `createStoreSchema`, `createListingSchema`, `searchListingsSchema`, `createOrderSchema`, `createReviewSchema`, `sendMessageSchema`, `createDisputeSchema`
- Created barrel export `index.ts`

#### CI/CD
- Created GitHub Actions workflow (`.github/workflows/ci.yml`) with 4 parallel jobs: `build`, `lint`, `test`, `type-check` — all using pnpm 9

#### Deployment
- Created `Dockerfile` with multi-stage build (builder → runner) using Node 20 Alpine + pnpm via corepack
- Created `railway.toml` configured for Dockerfile builder with health check and restart policy
- Created `.dockerignore` to exclude unnecessary files from build context

#### Documentation
- Created `docs/product/MVP_BUILD_GUIDE.md` — 10-phase vertical-slice build plan with production-grade requirements, step-by-step tasks, edge cases, and verification checklists per feature
- Created `docs/DEVELOPMENT_STANDARDS.md` — mandatory coding rules for the project
- Added `COMPLETE_FOLDER_STRUCTURE.md` to `docs/guides/`

### Fixed
- **GitHub submodule issue**: `apps/web` appeared as an empty folder on GitHub because `create-next-app` initialized a nested `.git` directory → removed it, cleared gitlink cache, re-added all files
- **Railway build failures** (3 iterations):
  1. `npm` doesn't understand `workspace:*` protocol → switched to pnpm
  2. External `nixpacks.toml` reference not found → inlined config into `railway.toml`
  3. `--frozen-lockfile` failed (no lockfile committed) → switched to `--no-frozen-lockfile`, then migrated to Dockerfile builder for reliability
  4. `node dist/index.ts` → `node dist/index.js` (tsc outputs JavaScript, not TypeScript)

### Security
- Removed hardcoded database URLs and API keys from `railway.toml` — moved to Railway dashboard variables
- Logger redacts `Authorization` headers, cookies, passwords, and tokens from log output

---

## [0.0.1] — 2026-03-27 — Project Kickoff

### Added
- Initial repository setup
- PRD v2.0, technical roadmap, and API contract documents in `documents/`

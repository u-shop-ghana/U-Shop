# Changelog

All notable changes to U-Shop are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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

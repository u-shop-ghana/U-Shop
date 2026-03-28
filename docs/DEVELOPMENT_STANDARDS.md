# U-Shop Global Engineering & AI Guidelines

> **Status:** Active · **Version:** 1.0.0 · **Owner:** VP of Engineering
>
> This document is the law of this codebase. It applies equally to every human engineer,
> every AI coding agent, and every automated tool that writes, reviews, or modifies code
> in this repository. There are no exceptions and no overrides.
>
> When in doubt: read this document. When this document is silent: ask before acting.

---

## Table of Contents

1. [AI Agent Directives](#1-ai-agent-directives)
2. [Human Developer Workflows](#2-human-developer-workflows)
3. [Strict Coding Standards](#3-strict-coding-standards)
4. [Security & Secrets Management](#4-security--secrets-management)
5. [Database & Schema Rules](#5-database--schema-rules)
6. [Appendix: Quick Reference Card](#6-appendix-quick-reference-card)

---

## 1. AI Agent Directives

> **How to use this section:** Copy the block under §1.1 verbatim into the System
> Instructions field of Cursor, GitHub Copilot Chat, Claude Projects, or any other
> AI coding agent operating in this repository. Do not paraphrase it. Do not summarize
> it. Paste it in full.

---

### 1.1 System Prompt — Paste Into Your AI Agent's System Instructions

```
You are a senior full-stack engineer working on U-Shop, a multi-vendor technology
marketplace built in Ghana. Your stack is: Next.js 14 (App Router ONLY),
Express.js, Prisma ORM, Supabase (PostgreSQL + Auth + Storage), and Paystack
for payments.

=== MANDATORY PRE-FLIGHT RULES ===

Before writing ANY fetch() call, axios call, or API request in the codebase:
  1. You MUST read the file `docs/ushop-api-contract-v1.md` (or .html) in its
     entirety. Every endpoint, its expected request shape, its response shape,
     its auth requirements, and its error codes are defined there. You are
     forbidden from inventing endpoints, changing route paths, or assuming
     response structures. If the contract does not cover a case, you flag it
     to the human engineer and STOP — you do not guess.

Before writing ANY Prisma query (findUnique, create, update, $transaction, etc.):
  2. You MUST read the file `docs/ushop-db-schema-spec.md` (or .html) in its
     entirety. Every model, its fields, its relations, its enums, and its index
     strategy is defined there. You are forbidden from querying fields that do not
     exist, assuming relation names, or writing raw SQL without referencing the
     schema. If you are unsure whether a field exists, check the schema. Do not guess.

=== COMMENT MANDATE ===

Every block of non-trivial logic you write MUST be preceded by a plain-English
comment that explains:
  (a) WHAT the code is doing, in one sentence.
  (b) WHY this approach was chosen over alternatives, if the logic is complex.
  (c) Any side effects, gotchas, or edge cases a future engineer should know about.

"Non-trivial" means: any conditional logic, any database transaction, any API call,
any middleware, any authentication check, any financial calculation, and any data
transformation. When in doubt, comment it. Comments are free. Bugs are not.

Example of an UNACCEPTABLE code block (no comments):
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.listing.updateMany({...});
    if (rows.count === 0) throw new Error('Not found');
    return rows;
  });

Example of an ACCEPTABLE code block (well-commented):
  // We use a Prisma interactive transaction here because we need to:
  // (a) update listing stock and (b) create an order item atomically.
  // If stock update finds 0 rows (item sold out), we throw immediately —
  // this rolls back the entire transaction and no partial order is created.
  // Using updateMany with a WHERE stock >= quantity is the atomic stock
  // reservation pattern; it avoids the read-then-write race condition.
  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.listing.updateMany({...});
    if (rows.count === 0) throw new Error('Item is out of stock');
    return rows;
  });

=== ABSOLUTE PROHIBITIONS — NEVER DO THESE ===

BANNED — Next.js Pages Router:
  You are forbidden from using, suggesting, or generating ANY code that uses
  the Next.js Pages Router. This includes:
    - Files in a `pages/` directory (except `pages/api/` if explicitly authorised)
    - `getServerSideProps`, `getStaticProps`, `getStaticPaths`
    - `useRouter` from 'next/router' (use 'next/navigation' ONLY)
    - `next/head` for metadata (use the App Router Metadata API ONLY)
  The project uses Next.js 14 App Router exclusively. If you are unsure whether
  a pattern belongs to the Pages Router, do not use it.

BANNED — The `any` TypeScript type:
  You are forbidden from using `any` as a type annotation anywhere in this
  codebase. Every variable, function parameter, return type, and generic must
  be explicitly typed. If you do not know the correct type, use `unknown` and
  narrow it with a type guard. Write `// TODO: type this properly` and flag it
  to the human engineer — do not silently use `any`.

BANNED — Catching errors with console.log:
  You are forbidden from writing catch blocks that only call console.log or
  console.error. All errors in the Express backend must be passed to the
  centralized errorHandler middleware via `next(err)`. All errors in Next.js
  Server Actions must be thrown (not swallowed) so they propagate correctly.

BANNED — Hardcoded secrets:
  You are forbidden from hardcoding API keys, database URLs, Supabase keys,
  Paystack secret keys, or any other secret value. All secrets live in
  environment variables. Reference them as `process.env.VARIABLE_NAME`. If
  you need a secret that doesn't exist in the env yet, flag it to the human
  engineer. Do not invent a placeholder key.

BANNED — Outdated or deprecated dependencies:
  Before suggesting `npm install` or `pnpm add` for any package, you must
  verify that the package is the latest stable version compatible with our
  stack (Node 20, Next.js 14, React 18, TypeScript 5). You must not suggest:
    - Any package that is officially deprecated on npm (shows deprecation warning)
    - Any version pinned to a major version older than the current stable
    - Any package that has a well-known, drop-in modern replacement
      (e.g., `node-fetch` when native fetch is available, `moment` when
      `date-fns` or native Intl is available, `request` which is archived)
  If you are uncertain whether a package is current, state your uncertainty
  explicitly and ask the human engineer to confirm before adding it.

BANNED — Mutations that break existing tested functionality:
  You are forbidden from modifying shared utility functions, middleware,
  Prisma client configuration, Supabase client factories, or error handler
  logic without explicit instruction to do so. If a new feature requires a
  change to shared infrastructure, you must:
    1. Flag the required change explicitly to the human engineer.
    2. Write the new feature code in isolation first.
    3. Wait for the human engineer to approve and integrate the infrastructure change.
  You do not refactor code that was not part of the task you were given.

BANNED — Direct Supabase data queries from the frontend:
  The Next.js frontend may only use Supabase for: Auth (sign in, sign up,
  session management) and Storage (direct file uploads with pre-signed URLs).
  ALL data operations (reading listings, creating orders, managing wallets,
  etc.) must go through the Express API. You must not write Supabase
  `from('table').select()` calls in frontend components for data fetching.

=== WHAT GOOD OUTPUT LOOKS LIKE ===

When you generate code, your output must include:
  1. The complete file or function with all imports.
  2. Inline comments on every non-trivial line or block (see Comment Mandate above).
  3. Any new environment variables required, listed explicitly.
  4. Any new Prisma schema changes required, flagged explicitly with the note
     "SCHEMA CHANGE REQUIRED — do not run prisma migrate until ERD is updated."
  5. The test cases you would write for this code, even if you are not writing
     the test file itself.
```

---

### 1.2 Agent Behaviour Expectations — For Human Engineers Supervising AI Output

AI-generated code **must be reviewed against this checklist** before it is accepted into any branch. An engineer who merges AI-generated code without reviewing it is personally responsible for what that code does.

| Check | What to look for |
|---|---|
| **Contract compliance** | Does every API call match a route defined in `ushop-api-contract-v1`? |
| **Schema compliance** | Does every Prisma query reference fields that actually exist in `ushop-db-schema-spec`? |
| **Comment quality** | Does every non-trivial block have a plain-English comment explaining the `why`? |
| **No `any` types** | Run `tsc --noEmit` and confirm zero `any` type errors. |
| **No Pages Router** | Grep for `getServerSideProps`, `getStaticProps`, `pages/` references. |
| **No new secrets** | Grep for hardcoded strings that look like API keys or connection strings. |
| **No broken deps** | Run `npm outdated` and verify no deprecated packages were added. |
| **Isolation respected** | Confirm shared utilities, middleware, and Prisma client were not silently modified. |

---

## 2. Human Developer Workflows

### 2.1 Git Branching Strategy

We operate a strict four-branch model. Direct commits to `main` or `develop` are
prohibited and blocked by branch protection rules.

```
main          ← Production. Tagged releases only. Protected. Requires 2 approvals.
develop       ← Integration branch. All feature branches merge here first.
  │
  ├── feature/[ticket-id]-short-description
  ├── bugfix/[ticket-id]-short-description
  ├── hotfix/[ticket-id]-short-description    ← Branches from main, merges to main AND develop
  ├── chore/[ticket-id]-short-description     ← Dependency updates, config, tooling
  └── docs/[ticket-id]-short-description      ← Documentation-only changes
```

**Branch naming rules:**
- Ticket ID is mandatory. Format: `US-42` (U-Shop ticket number from your project tracker).
- Short description uses kebab-case, maximum 5 words.
- No capital letters, no spaces, no special characters except hyphens.

```bash
# ✅ Correct
git checkout -b feature/US-42-seller-store-creation
git checkout -b bugfix/US-107-escrow-double-release
git checkout -b hotfix/US-203-paystack-webhook-500
git checkout -b chore/US-88-upgrade-prisma-5-14

# ❌ Wrong — will be rejected at PR review
git checkout -b new-feature
git checkout -b fix-the-bug-where-escrow-doesnt-work-correctly
git checkout -b JohnsWork
```

**Lifecycle of a feature branch:**
1. Branch from `develop` (never from `main`).
2. Commit work in small, logical increments (see §2.2).
3. Rebase onto `develop` before opening a PR to keep history linear.
4. Open PR against `develop`. Get at least 1 approval.
5. Squash-merge into `develop`.
6. Delete the feature branch after merge.

---

### 2.2 Conventional Commits Standard

Every commit message in this repository must follow the
[Conventional Commits](https://www.conventionalcommits.org/) specification.
This is enforced by a `commitlint` hook. A commit that does not conform will
be rejected by the pre-commit hook — fix it before it reaches the remote.

**Format:**
```
<type>(<scope>): <short imperative summary>

[optional body — explain the WHY, not the WHAT]

[optional footer — BREAKING CHANGE: or Closes #issue]
```

**Allowed types:**

| Type | When to use |
|---|---|
| `feat` | A new feature or user-facing capability |
| `fix` | A bug fix |
| `perf` | A performance improvement (no functional change) |
| `refactor` | Code restructuring with no functional or bug-fix change |
| `test` | Adding or correcting tests only |
| `docs` | Documentation changes only (including CHANGELOG.md updates) |
| `chore` | Build process, dependency updates, tooling, config |
| `ci` | Changes to CI/CD pipeline configuration |
| `revert` | Reverting a previous commit |

**Allowed scopes** (keep this list updated as the project grows):

| Scope | What it covers |
|---|---|
| `auth` | Supabase auth, session management, JWT middleware |
| `store` | Seller store creation, handle management, store page |
| `listing` | Product listing CRUD, search, category filtering |
| `order` | Order creation, status transitions, checkout flow |
| `escrow` | Escrow ledger, release logic, auto-release cron |
| `payment` | Paystack integration, webhook handling, transfer API |
| `wallet` | Wallet balance, payout requests, transaction ledger |
| `dispute` | Dispute creation, admin resolution, evidence handling |
| `notification` | Email, in-app, SMS notification logic |
| `user` | User profile, verification, role management |
| `admin` | Admin panel, moderation tools, manual overrides |
| `db` | Schema changes, migrations, seed data |
| `api` | Express route definitions, middleware |
| `web` | Next.js pages, components, layouts |
| `infra` | Docker, deployment config, CI/CD, environment |
| `deps` | Dependency additions, updates, removals |

**Real examples:**

```bash
# ✅ Correct
feat(store): add real-time handle availability check endpoint
fix(escrow): prevent double-release when buyer double-clicks confirm
perf(listing): add partial GIN index for active listing status filter
chore(deps): upgrade prisma to 5.14.0
docs(api): update webhook event reference table in contract
test(payment): add integration test for transfer.failed webhook handler
ci(infra): add Fly.io health check to deployment pipeline
fix(payment): use timingSafeEqual for Paystack HMAC comparison

# ❌ Wrong
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "Updated the listing page to fix the bug that was causing the
               escrow to not release when the buyer clicked confirm"
git commit -m "feat: add feature"
```

---

### 2.3 The Changelog Mandate

**No PR is approved without a CHANGELOG.md entry. This is a hard rule with no exceptions.**

The `CHANGELOG.md` file lives in the repository root and follows the
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**CHANGELOG.md structure:**
```markdown
# Changelog

All notable changes to U-Shop are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

## [Unreleased]

### Added
- Real-time handle availability check: GET /api/v1/stores/check-handle (US-42)

### Changed
- Paystack HMAC verification now uses crypto.timingSafeEqual to prevent
  timing attacks (US-107)

### Fixed
- Escrow auto-release cron no longer fires on orders with status DISPUTED (US-203)

### Removed
- Removed unused `moment` dependency; replaced with native Date methods (US-88)

### Security
- Sanitised all store bio and policy text inputs with isomorphic-dompurify
  to prevent XSS via user-generated content (US-115)

## [0.2.0] - 2025-08-15
...
```

**Rules for CHANGELOG entries:**

1. Every entry must reference the ticket ID in parentheses: `(US-42)`.
2. Use the correct section heading: `Added`, `Changed`, `Fixed`, `Removed`,
   `Security`, or `Deprecated`.
3. Write in past tense from the user's or system's perspective.
4. Be specific. "Fixed a bug" is not acceptable. "Fixed escrow auto-release
   firing on DISPUTED orders, preventing premature fund release (US-203)"
   is acceptable.
5. PRs with only `docs` scope changes (documentation-only PRs) still require
   a CHANGELOG entry under `Changed` or `Added`.

---

### 2.4 Pull Request Checklist

Every PR author must complete this checklist before requesting review.
Every reviewer must verify it was completed honestly before approving.
This checklist lives as a PR template at `.github/pull_request_template.md`.

```markdown
## Pull Request Checklist

**Ticket:** [US-XXX](link-to-ticket)
**Type:** Feature / Bug Fix / Hotfix / Chore / Docs
**Branch:** feature/US-XXX-short-description → develop

---

### Code Quality
- [ ] I have read and followed the rules in `DEVELOPMENT_STANDARDS.md`.
- [ ] All new functions and non-trivial logic blocks have plain-English comments
      explaining the `why`.
- [ ] I have not introduced any `any` types. I ran `pnpm typecheck` and it passed.
- [ ] I have not used Pages Router syntax (`getServerSideProps`, `pages/`,
      `next/router`). App Router only.
- [ ] All errors in Express routes are passed to `next(err)`, not swallowed
      with `console.log`.

### Database
- [ ] If I changed the Prisma schema, I updated the ERD documentation in
      `docs/ushop-db-schema-spec.md` BEFORE running `prisma migrate`.
- [ ] I ran `npx prisma format` and committed the formatted schema file.
- [ ] If I added a new model or index, I verified the index strategy against
      the performance requirements in the schema spec.
- [ ] My migration file has a descriptive name:
      `npx prisma migrate dev --name add_paystack_recipient_code_to_users`

### API & Contracts
- [ ] Any new Express endpoint is documented in `docs/ushop-api-contract-v1.md`.
- [ ] Any new or modified fetch call in the frontend matches the contract exactly.
- [ ] All request bodies pass through Zod validation before touching Prisma.

### Security
- [ ] I have not committed, hardcoded, or logged any secrets, API keys,
      database URLs, or Supabase keys.
- [ ] Any new environment variable is added to `.env.example` with a
      placeholder value and a comment explaining what it is.
- [ ] If this PR touches user-generated text fields, DOMPurify sanitisation
      is applied before the data is written to the database.

### Testing & Regression
- [ ] I have manually tested the happy path of this feature end-to-end.
- [ ] I have manually tested at least two failure/edge cases.
- [ ] I have verified that existing features I touched (or that depend on code
      I changed) still work correctly. List what you verified:
      _________________________________________
- [ ] If I changed shared middleware, utilities, or Prisma client config, I
      have explicitly tested that all routes using those shared components
      still function correctly.

### Dependencies
- [ ] Any new package I added is the latest stable version compatible with
      our stack. I ran `npm info [package] version` to verify.
- [ ] I did not add a package that is deprecated, archived, or has a
      well-known modern replacement.

### Changelog & Docs
- [ ] I have added an entry to `CHANGELOG.md` under `[Unreleased]` with the
      correct section heading and ticket reference.
- [ ] If I added a new environment variable, it is documented in `CHANGELOG.md`
      under `Added` and in `docs/environment-variables.md`.

### Reviewer Notes
<!-- Explain anything the reviewer needs to know that isn't obvious from the code.
     Describe any conscious trade-offs you made. Flag anything you are uncertain about. -->
```

---

## 3. Strict Coding Standards

### 3.1 Next.js 14 — App Router Rules

#### The `"use client"` Decision Framework

The question is not "should I use a Server Component?" The question is
"is there any reason this *must* run in the browser?" If the answer is
no, it is a Server Component. Default to the server.

**Use React Server Components (RSC) — no directive needed — when:**

| Scenario | Why RSC |
|---|---|
| Fetching data from the Express API to render a page | No useEffect, no loading state, data arrives with HTML |
| Rendering a store page, listing detail, or category browse | SEO requires server-rendered HTML |
| Reading from cookies or headers (via `next/headers`) | Server-only API |
| Generating page `<head>` metadata via `generateMetadata()` | Runs on server exclusively |
| Rendering content that does not require user interaction | Zero client-side JS shipped |
| Components that compose other Server Components | Keeps the tree on the server |

**Use `"use client"` — add the directive — when:**

| Scenario | Why Client Component |
|---|---|
| Using `useState`, `useReducer`, `useEffect`, `useRef` | React hooks require client runtime |
| Using browser APIs (`window`, `document`, `navigator`, `localStorage`) | Not available on server |
| Using event handlers (`onClick`, `onChange`, `onSubmit`) for interactivity | DOM events require client |
| Using third-party libraries that themselves use hooks or browser APIs | e.g., charting libs, drag-and-drop |
| Wrapping Supabase Auth context providers | Auth state is client-side |
| Checkout button, form submissions, real-time status polling | Requires interactivity |

**The composition rule — keep `"use client"` leaves at the bottom of the tree:**

```typescript
// ✅ CORRECT — Server Component fetches data, passes it to a small client leaf
// app/store/[handle]/page.tsx — Server Component (no directive)
export default async function StorePage({ params }) {
  // Data fetch happens on the server. Zero client-side JS for this fetch.
  const store = await fetchStore(params.handle);
  return (
    <div>
      <StoreHeader store={store} />        {/* Server Component */}
      <ListingGrid listings={store.listings} /> {/* Server Component */}
      <ContactSellerButton storeId={store.id} /> {/* "use client" — needs onClick */}
    </div>
  );
}

// ❌ WRONG — Marking the entire page "use client" to use one button
"use client";
export default function StorePage({ params }) {
  const [store, setStore] = useState(null);
  useEffect(() => { fetchStore(params.handle).then(setStore); }, []);
  // This ships all this data-fetching logic to the client unnecessarily.
  // The page is no longer SSR'd. SEO is broken. Performance is worse.
}
```

#### Metadata API Rules

```typescript
// ✅ CORRECT — generateMetadata for dynamic pages
// app/listing/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  return {
    title: `${listing.title} | U-Shop`,
    description: listing.description.slice(0, 155),
    openGraph: {
      images: [{ url: `/api/og/listing?id=${params.id}` }],
    },
  };
}

// ❌ WRONG — next/head is Pages Router. Banned.
import Head from 'next/head';
export default function Page() {
  return <Head><title>Some Title</title></Head>;
}
```

#### Server Actions Rules

```typescript
// ✅ CORRECT — Server Action for form submission
// app/checkout/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckoutSchema } from "@/lib/schemas/checkout";

export async function initiateCheckout(formData: FormData) {
  // Validate the incoming form data with Zod before doing anything.
  // Never trust raw FormData. This throws a ZodError if validation fails,
  // which is caught by the error boundary or the calling component.
  const validated = CheckoutSchema.parse({
    listingId: formData.get("listingId"),
    quantity: Number(formData.get("quantity")),
  });

  // Get the authenticated user's session from the server-side cookie.
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  // Call the Express API with the verified JWT. This code runs on the server,
  // so including the access_token here is safe — it never reaches the browser.
  const response = await fetch(`${process.env.API_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Order creation failed");
  }

  const { paystackUrl } = await response.json();
  redirect(paystackUrl);
}
```

---

### 3.2 Express.js Rules

#### The Centralized Error Handler — Non-Negotiable

We have one error handler: `apps/api/src/middleware/errorHandler.ts`.
Every Express route that can fail **must** propagate errors to it via `next(err)`.
Silent error swallowing is a production incident waiting to happen.

```typescript
// apps/api/src/middleware/errorHandler.ts
// This is the single exit point for all errors in the Express application.
// It normalizes errors into a consistent JSON response shape and sends them
// to Sentry for monitoring. It is registered LAST in index.ts.
import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

// We define our own typed error classes so we can attach HTTP status codes
// to errors without coupling business logic to HTTP concerns.
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400, "VALIDATION_ERROR"); }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") { super(message, 401, "UNAUTHORIZED"); }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") { super(message, 403, "FORBIDDEN"); }
}
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}
export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409, "CONFLICT"); }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // Must have 4 params for Express to identify as error handler
): void {
  // Send unknown/unexpected errors to Sentry for alerting.
  // Known AppErrors are operational errors, not bugs — don't alert on them.
  if (!(err instanceof AppError)) {
    Sentry.captureException(err);
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";

  // Never expose internal error details to the client in production.
  // "err.message" is safe for AppErrors (we wrote them); use a generic
  // message for unexpected errors to avoid leaking implementation details.
  const message =
    err instanceof AppError
      ? err.message
      : "An unexpected error occurred. Our team has been notified.";

  res.status(statusCode).json({ error: { code, message } });
}
```

**Correct usage in routes:**

```typescript
// ✅ CORRECT — errors are forwarded to errorHandler
router.post("/stores", authenticate, async (req, res, next) => {
  try {
    const store = await StoreService.createStore(req.user!.id, req.body);
    res.status(201).json(store);
  } catch (err) {
    // Pass the error to errorHandler. It logs, alerts, and responds.
    // We do NOT console.log here. We do NOT construct our own error response.
    next(err);
  }
});

// ❌ WRONG — swallowed error, no alerting, inconsistent response shape
router.post("/stores", authenticate, async (req, res) => {
  try {
    const store = await StoreService.createStore(req.user!.id, req.body);
    res.status(201).json(store);
  } catch (err) {
    console.log(err); // ← this tells nobody anything useful in production
    res.status(500).json({ message: "Something went wrong" }); // ← inconsistent shape
  }
});
```

#### Middleware Registration Order

The order of middleware in `apps/api/src/index.ts` is architecture, not style.
It must not be changed without explicit VP of Engineering approval.

```typescript
// MANDATORY ORDER — do not reorder without approval
app.use(helmet());                              // 1. Security headers
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // 2. CORS
app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter); // 3. WEBHOOKS BEFORE JSON PARSER
app.use(express.json({ limit: "10mb" }));       // 4. JSON body parser (after webhooks)
app.use(morgan(...));                           // 5. Request logging
app.use("/api", rateLimiter.general);           // 6. Rate limiting
app.use("/api/v1/auth", authRoutes);            // 7. Routes
app.use("/api/v1/stores", storeRoutes);
// ... other routes
app.get("/health", (req, res) => res.json({ status: "ok" })); // 8. Health check
app.use(errorHandler);                          // 9. LAST — error handler
```

---

### 3.3 TypeScript Standards

**The strict tsconfig.json — this must never be weakened:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

**The `any` ban in practice:**

```typescript
// ❌ BANNED
function processWebhookPayload(payload: any) { ... }
const userData: any = await prisma.user.findUnique(...);
const result: any[] = [];

// ✅ CORRECT — use specific types
function processWebhookPayload(payload: PaystackChargeSuccessEvent) { ... }
const userData = await prisma.user.findUnique(...); // Prisma infers the type
const result: WebhookEvent[] = [];

// ✅ CORRECT — use unknown + type narrowing for truly unknown data
function parseExternalData(raw: unknown): ParsedData {
  if (typeof raw !== "object" || raw === null) {
    throw new ValidationError("Invalid data shape");
  }
  // Narrow via Zod parse — it validates and types simultaneously
  return ParsedDataSchema.parse(raw);
}
```

**Shared types live in `packages/shared/src/types/`:**
All TypeScript interfaces and types shared between the Next.js app and the
Express API must be defined in the `packages/shared` workspace package.
Do not duplicate type definitions across apps.

---

## 4. Security & Secrets Management

### 4.1 Environment Variable Rules

**The `.env` file is never committed. Ever. For any reason.**

The `.gitignore` file at the repository root must include:
```
.env
.env.local
.env.production
.env.*.local
apps/web/.env.local
apps/api/.env
```

**The `.env.example` file is always committed and always kept current.**
Every environment variable used anywhere in the codebase must have a corresponding
entry in `.env.example` with:
- A placeholder value (never a real key)
- A comment explaining what the variable is and where to find the real value

```bash
# apps/api/.env.example

# ── DATABASE ──────────────────────────────────────────────────────────────
# Supabase PostgreSQL connection string via PgBouncer pooler (port 6543).
# Find this in: Supabase Dashboard → Settings → Database → Connection string (URI)
# Append: ?pgbouncer=true&connection_limit=10
DATABASE_URL="postgresql://postgres.[ref]:[password]@[host]:6543/postgres?pgbouncer=true"

# Direct connection for Prisma migrations only (port 5432, bypasses PgBouncer).
DIRECT_URL="postgresql://postgres.[ref]:[password]@[host]:5432/postgres"

# ── SUPABASE ──────────────────────────────────────────────────────────────
# Public project URL. Safe to use in backend. Find in: Supabase → Settings → API
SUPABASE_URL="https://your-project-ref.supabase.co"

# Service Role key. Bypasses RLS. NEVER send to frontend. NEVER log.
# Find in: Supabase → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# ── PAYSTACK ──────────────────────────────────────────────────────────────
# Secret key for server-side Paystack API calls. NEVER send to frontend.
# Find in: Paystack Dashboard → Settings → API Keys & Webhooks
PAYSTACK_SECRET_KEY="sk_live_..."

# Webhook signature secret. Used to verify HMAC-SHA512 webhook signatures.
# Find in: Paystack Dashboard → Settings → API Keys & Webhooks → Webhook section
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"

# ── APPLICATION ───────────────────────────────────────────────────────────
PORT="4000"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

**The `NEXT_PUBLIC_` prefix rule:**
Only environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
bundle. This is not just a Next.js convention — it is a security boundary.

```bash
# ✅ Safe to be NEXT_PUBLIC — these have no privileged access
NEXT_PUBLIC_SUPABASE_URL="..."        # Needed by Supabase JS in the browser
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."  # Anon key is governed by RLS
NEXT_PUBLIC_API_URL="..."            # Just a URL, not a secret

# ❌ NEVER NEXT_PUBLIC — these are privileged
# NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY  ← bypasses all RLS, catastrophic if exposed
# NEXT_PUBLIC_PAYSTACK_SECRET_KEY        ← full API access to your Paystack account
# NEXT_PUBLIC_DATABASE_URL               ← direct database access
```

---

### 4.2 The Zod-Before-Prisma Rule

**No data from any external source (HTTP request body, URL params, query strings,
form data, webhook payload) touches Prisma without first passing through a Zod schema.**

This is not optional. It is the boundary between the internet and our database.

```typescript
// apps/api/src/routes/stores.ts

import { z } from "zod";
import { validateRequest } from "../middleware/validateRequest";
import { sanitizeRichText, sanitizePlainText } from "../middleware/sanitize";

// Define the Zod schema adjacent to the route that uses it.
// The schema is the contract for what this endpoint accepts.
const CreateStoreSchema = z.object({
  // .trim() removes leading/trailing whitespace before length validation.
  // .min() and .max() enforce the length rules from the PRD spec.
  handle: z
    .string()
    .trim()
    .min(3, "Handle must be at least 3 characters")
    .max(24, "Handle must be at most 24 characters")
    .regex(/^[a-z0-9-]+$/, "Handle may only contain lowercase letters, numbers, and hyphens"),
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(280).optional(),
  warrantyPolicyText: z.string().trim().max(500).optional(),
});

// The validateRequest middleware calls schema.safeParse(req.body).
// If validation fails, it calls next(new ValidationError(details)) immediately —
// the route handler never runs. This keeps route handlers clean.
router.post(
  "/",
  authenticate,
  validateRequest(CreateStoreSchema),
  async (req, res, next) => {
    try {
      // By this point, req.body is guaranteed to match CreateStoreSchema.
      // TypeScript knows the shape. Prisma will receive clean, typed data.
      // We still sanitize free-text fields for XSS protection even though
      // Zod has already validated the structure — defence in depth.
      const sanitizedData = {
        ...req.body,
        name: sanitizePlainText(req.body.name),
        bio: req.body.bio ? sanitizeRichText(req.body.bio) : undefined,
        warrantyPolicyText: req.body.warrantyPolicyText
          ? sanitizeRichText(req.body.warrantyPolicyText)
          : undefined,
      };

      const store = await StoreService.createStore(req.user!.id, sanitizedData);
      res.status(201).json(store);
    } catch (err) {
      next(err);
    }
  }
);
```

---

## 5. Database & Schema Rules

### 5.1 The Schema Change Protocol

**No developer runs `npx prisma migrate dev` without completing the following
steps in order. Running a migration before updating the documentation is a
disciplinary matter — it creates a permanent divergence between our running
database and our specifications.**

```
SCHEMA CHANGE PROTOCOL — MANDATORY ORDER OF OPERATIONS

Step 1: Update docs/ushop-db-schema-spec.md
        - Update the Mermaid ERD diagram to reflect the new model, field, or relation.
        - Update the prose description of the affected model(s).
        - If you are adding an index: document why this index is needed,
          which query pattern it serves, and its expected cardinality.
        - If you are removing a field: document the migration path for any
          existing data and any downstream code that referenced that field.
        - Commit the documentation change FIRST, separately from the migration.

Step 2: Update the Prisma schema file
        - Make your changes in apps/api/prisma/schema.prisma.
        - Run `npx prisma format` to normalize the file formatting.
        - Commit the formatted schema file.

Step 3: Generate and name the migration
        - Use a descriptive migration name in snake_case that states what changed:
          npx prisma migrate dev --name add_imei_to_listings
          npx prisma migrate dev --name add_paystack_recipient_code_to_users
          npx prisma migrate dev --name create_wallet_transaction_table
        - Review the generated SQL in prisma/migrations/ before applying.
        - Commit the migration file.

Step 4: Regenerate the Prisma client
        - npx prisma generate
        - Verify the generated client reflects your changes (check the types).

Step 5: Update any affected application code
        - Update service files that query the affected models.
        - Update TypeScript types in packages/shared if model types changed.
        - Run the full test suite.
```

**Migration naming convention:**

```bash
# ✅ Descriptive migration names
npx prisma migrate dev --name add_imei_field_to_listings
npx prisma migrate dev --name add_search_vector_to_listings
npx prisma migrate dev --name create_escrow_ledger_table
npx prisma migrate dev --name add_composite_index_listing_store_status
npx prisma migrate dev --name rename_wallet_balance_to_available_balance

# ❌ Unacceptable migration names — rejected at PR review
npx prisma migrate dev --name update
npx prisma migrate dev --name changes
npx prisma migrate dev --name migration_1
npx prisma migrate dev --name fix
```

---

### 5.2 Prisma Query Standards

**Always use `select` to specify exactly which fields you need.** Never return
full model objects when a subset of fields is sufficient. This prevents
accidentally returning sensitive fields (e.g., `studentIdImagePath`,
`paystackRecipientCode`) to API consumers.

```typescript
// ❌ WRONG — returns ALL fields including sensitive ones
const user = await prisma.user.findUnique({ where: { id } });
return res.json(user); // What if user.studentIdImagePath is in here?

// ✅ CORRECT — explicit field selection, no sensitive data leaks
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    verificationStatus: true,
    createdAt: true,
    store: {
      select: { id: true, handle: true, name: true },
    },
  },
});
return res.json(user);
```

**Always use `prisma.$transaction()` when multiple writes must succeed together.**

```typescript
// ✅ CORRECT — atomic: if wallet credit fails, escrow status reverts
await prisma.$transaction(async (tx) => {
  await tx.escrowLedger.update({
    where: { orderId, status: "HELD" }, // Conditional WHERE for idempotency
    data: { status: "RELEASED", releasedAt: new Date(), releaseTrigger },
  });
  await tx.wallet.upsert({
    where: { userId: sellerId },
    create: { userId: sellerId, availableBalance: amount, totalEarned: amount },
    update: {
      availableBalance: { increment: amount },
      totalEarned: { increment: amount },
    },
  });
  await tx.walletTransaction.create({
    data: { walletId: wallet.id, amount, description, referenceType: "ORDER", referenceId: orderId },
  });
});
```

**Use the Prisma Singleton — never instantiate `PrismaClient` directly in a route or service.**

```typescript
// ✅ CORRECT — import the singleton
import { prisma } from "../lib/prisma";

// ❌ WRONG — creates a new connection pool on every module load
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

---

## 6. Appendix: Quick Reference Card

> Cut this out and pin it somewhere your team looks every day.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        U-SHOP ENGINEERING RULES                              │
│                         The 10 Things You Never Do                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1.  Never commit .env files or hardcoded secrets.                           │
│  2.  Never use the Next.js Pages Router. App Router only.                    │
│  3.  Never use `any` as a TypeScript type. Use `unknown` + Zod instead.     │
│  4.  Never call Prisma without first passing data through a Zod schema.      │
│  5.  Never run `prisma migrate` without updating the ERD docs first.         │
│  6.  Never catch errors with just console.log. Use next(err) in Express.     │
│  7.  Never merge a PR without a CHANGELOG.md entry.                          │
│  8.  Never register webhook routes after express.json() middleware.          │
│  9.  Never write a Prisma query without checking the schema spec first.      │
│  10. Never write a fetch() call without checking the API contract first.     │
│                                                                               │
│                   When in doubt, ask before you ship.                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

*This document is maintained by the VP of Engineering. Proposed changes require
a PR with at least two engineering approvals. Changes take effect immediately
upon merge to `main`. All team members are expected to have read this document
in full before making their first commit.*

*Last reviewed: See git log for this file's last modification date.*

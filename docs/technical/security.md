# U-Shop Security Protocols

> **Classification:** Internal — Engineering Team  
> **Stack:** Next.js 14 · Express.js · Supabase (PostgreSQL + Auth) · Prisma · Paystack  
> **Last updated:** See git blame

This document is the single source of truth for every security control in the U-Shop platform. It covers the five threat vectors specific to this architecture, authentication flows, input sanitisation, rate limiting, Row Level Security policies, and the pre-launch hardening checklist. Every section maps to code that exists (or must exist) in the repository.

---

## Table of Contents

1. [Security Philosophy](#1-security-philosophy)
2. [Threat Model — The Five Attack Vectors](#2-threat-model)
3. [Authentication & JWT Flow](#3-authentication--jwt-flow)
4. [Input Sanitisation](#4-input-sanitisation)
5. [Rate Limiting](#5-rate-limiting)
6. [Paystack Webhook Security](#6-paystack-webhook-security)
7. [Database Security — Row Level Security (RLS)](#7-database-security--row-level-security-rls)
8. [Secrets & Environment Variables](#8-secrets--environment-variables)
9. [Inventory Race Condition Prevention](#9-inventory-race-condition-prevention)
10. [OWASP Top 10 Mitigation Matrix](#10-owasp-top-10-mitigation-matrix)
11. [Data Protection — Ghana DPA Compliance](#11-data-protection--ghana-dpa-compliance)
12. [Pre-Launch Security Checklist](#12-pre-launch-security-checklist)

---

## 1. Security Philosophy

> The biggest risk to U-Shop is not a technical breach — it is a **trust failure that goes viral on campus**. One widely-shared story of a GH₵ 2,000 laptop scam that the platform failed to resolve will cause months of growth stagnation. These controls are therefore brand protection as much as technical controls.

**Three guiding principles:**

1. **Never trust the client.** Validate and sanitise every input server-side with Zod and DOMPurify, regardless of what frontend validation has already run.
2. **Least privilege everywhere.** The frontend never holds the `SERVICE_ROLE_KEY`. The Express backend never holds the user's raw card number. Each layer only has the access it needs.
3. **Defence in depth.** No single control is relied upon alone. XSS is mitigated at input sanitisation (Express), output escaping (React), and CSP headers (Helmet) simultaneously.

---

## 2. Threat Model

The five threats below are specific to U-Shop's architecture. Generic OWASP checklists alone do not cover this surface.

---

### Threat 1 — XSS via Custom Policy & Store Content

| | |
|---|---|
| **Severity** | Critical |
| **Vector** | User-generated content rendered in SSR'd HTML |

**Attack surface:**
- Store bio — server-rendered for SEO, every visitor executes injected scripts
- Custom return policy `policyNotes` — rendered in listing sidebar and at checkout
- Product description — supports formatting; widest injection surface
- Store name / handle — appears in OG images, emails, admin dashboard
- Dispute evidence descriptions — rendered in admin panel (high-privilege target)

**Layered mitigations:**

| Layer | Location | Implementation |
|---|---|---|
| Input sanitisation | Express middleware | `isomorphic-dompurify` strips all HTML from plain-text fields; limited allowlist for rich-text fields |
| Output escaping | React / Next.js | All `{value}` interpolations escape by default. `dangerouslySetInnerHTML` is **never used** with user content |
| Content Security Policy | `helmet.contentSecurityPolicy()` | `script-src 'self'` blocks inline scripts even if injection occurs |
| Schema validation | Zod | Max-length constraints enforced before sanitisation runs |

```typescript
// apps/api/src/middleware/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

// No HTML allowed — strip everything (store name, handle, bio)
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .trim()
    .replace(/\s+/g, ' ');
}

// Limited allowlist for policy text and product descriptions
export function sanitizeRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'ul', 'ol', 'li', 'p'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style'],
  });
}

// Content Security Policy — set in Express via helmet
// app.use(helmet.contentSecurityPolicy({ directives: {
//   defaultSrc: ["'self'"],
//   scriptSrc:  ["'self'"],
//   styleSrc:   ["'self'", "'unsafe-inline'"],
//   imgSrc:     ["'self'", "data:", "*.supabase.co"],
//   connectSrc: ["'self'", "*.supabase.co", "api.paystack.co"],
// }}));
```

---

### Threat 2 — Fraudulent Listings (Brick-in-Box, Condition Fraud, Stolen Devices)

| | |
|---|---|
| **Severity** | Critical |
| **Vector** | Seller misrepresentation at listing creation |

**Attack variants:**
- **Brick-in-Box** — buyer pays, receives junk; seller claims delivery was made
- **Condition fraud** — device listed as "Used — Good", arrives as "For Parts"; battery screenshot faked
- **Stolen device** — IMEI-blocked phone or laptop sold as functional
- **Counterfeit** — replica device sold as genuine at near-genuine price

**Mitigations:**

```typescript
// apps/api/src/services/listing.service.ts
// Called before DRAFT → ACTIVE transition. Listing cannot go live without passing.

async function validateListingForActivation(listing: ListingWithCategory): Promise<void> {
  const errors: string[] = [];

  // Rule 1: Minimum photos per condition grade
  const MIN_PHOTOS = { NEW: 2, LIKE_NEW: 3, USED_EXCELLENT: 4, USED_GOOD: 4, USED_FAIR: 5, FOR_PARTS: 3 };
  if (listing.imagePaths.length < MIN_PHOTOS[listing.condition]) {
    errors.push(`${listing.condition} requires at least ${MIN_PHOTOS[listing.condition]} photos`);
  }

  // Rule 2: Battery health screenshot required for phones/laptops in used conditions
  const BATTERY_CONDITIONS = ['USED_GOOD', 'USED_FAIR', 'USED_EXCELLENT'];
  const BATTERY_CATEGORIES = ['phones', 'laptops', 'tablets'];
  if (BATTERY_CONDITIONS.includes(listing.condition) &&
      BATTERY_CATEGORIES.includes(listing.category.slug) &&
      !listing.batteryScreenshotPath) {
    errors.push('Battery health screenshot required for this condition grade and category');
  }

  // Rule 3: IMEI mandatory for all phone listings
  if (listing.category.slug === 'phones' && !listing.imei) {
    errors.push('IMEI number is mandatory for all phone listings');
  }

  // Rule 4: Serial number required for high-value laptops
  if (listing.category.slug === 'laptops' && listing.price >= 500 && !listing.serialNumber) {
    errors.push('Serial number required for laptop listings above GH₵ 500');
  }

  if (errors.length > 0) throw new ValidationError(errors.join(' | '));
}
```

**Additional controls:**
- Escrow holds funds until buyer confirms delivery — no pre-payment risk
- "Report Stolen Device" button on every listing — triggers immediate escrow freeze
- Seller identity verified via student ID or Ghana Card before store activation
- Permanent account ban on confirmed stolen device listing; payout blocked

---

### Threat 3 — Paystack Webhook Forgery & Replay Attacks

| | |
|---|---|
| **Severity** | Critical |
| **Vector** | Forged `charge.success` webhook triggers fake escrow creation |

**Attack variants:**
- **Webhook forgery** — attacker POSTs a crafted `charge.success` to `/webhooks/paystack`
- **Replay attack** — genuine past webhook replayed to trigger double-escrow-release
- **Redirect exploitation** — attacker visits `/checkout/complete?reference=abc` without paying
- **Race exploit** — callback page marks order paid before webhook verification completes

**Mitigations (all four must be implemented):**

```typescript
// apps/api/src/controllers/webhooks.controller.ts

// Layer 1: HMAC-SHA512 timing-safe signature verification
// crypto.timingSafeEqual prevents timing-based side-channel attacks.
// A naive (hash === signature) leaks information about partial matches
// via response timing. timingSafeEqual always takes the same duration.

const signature = req.headers['x-paystack-signature'] as string;
if (!signature) return res.status(401).send('Missing signature');

const expectedHash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
  .update(req.body) // req.body = raw Buffer — MUST NOT be JSON-parsed yet
  .digest('hex');

const sigBuffer  = Buffer.from(signature, 'hex');
const hashBuffer = Buffer.from(expectedHash, 'hex');

if (sigBuffer.length !== hashBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, hashBuffer)) {
  logger.warn({ ip: req.ip, event: 'webhook_signature_failed' },
    'Paystack webhook HMAC verification failed — potential forgery');
  return res.status(401).send('Invalid signature');
}

// Layer 2: Idempotency check — prevents replay attacks
const existing = await prisma.webhookEvent.findUnique({ where: { externalId: event.id } });
if (existing?.processed) {
  return res.status(200).json({ received: true, status: 'already_processed' });
}

// Layer 3: Persist raw event BEFORE responding (R-14 from Escrow Spec)
await prisma.webhookEvent.upsert({
  where:  { externalId: event.id },
  create: { externalId: event.id, source: 'paystack', eventType: event.event, payload: event },
  update: {},
});

// Layer 4: Respond to Paystack IMMEDIATELY — process asynchronously after
res.status(200).json({ received: true });
// Business logic runs here — after the response is sent
```

**Critical middleware ordering — this cannot be wrong:**

```typescript
// apps/api/src/index.ts
// Webhook route MUST be registered BEFORE express.json() body parser.
// HMAC verification requires the raw body bytes.
// Once JSON parsing runs, the raw bytes are gone and verification always fails.

app.use('/webhooks', webhookRoutes);  // ← BEFORE body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

---

### Threat 4 — Inventory Race Conditions at Checkout

| | |
|---|---|
| **Severity** | High |
| **Vector** | Concurrent checkout requests oversell a single-unit listing |

**Why it happens:** Two requests both read `stock = 1`, both pass the stock check, both create orders, both send buyers to Paystack. Both pay. Two confirmed payments for one item.

**The correct pattern — atomic conditional UPDATE:**

```typescript
// apps/api/src/services/order.service.ts

// WRONG — Read-then-write creates a TOCTOU (Time-of-Check-Time-of-Use) race:
// const listing = await prisma.listing.findUnique({ where: { id } });
// if (listing.stock < quantity) throw new Error('Out of stock');  // ← race here
// await prisma.listing.update({ data: { stock: { decrement: quantity } } });

// CORRECT — Single atomic conditional UPDATE:
// PostgreSQL executes this as one operation. Row-level locking ensures
// only one concurrent request can decrement successfully.
const rowsAffected = await prisma.$executeRaw`
  UPDATE listings
  SET    stock = stock - ${quantity}
  WHERE  id    = ${listingId}
  AND    stock >= ${quantity}
  AND    status = 'ACTIVE'
`;

// 0 rows affected = stock was 0 when we tried. Safe failure, no partial state.
if (rowsAffected === 0) {
  throw new ConflictError('This item just sold out. Please choose another listing.');
}
```

**Additional controls:**
- The entire `order create + stock decrement` runs inside `prisma.$transaction()` — if any step fails, all steps roll back
- Escrow release uses the same pattern: `WHERE status = 'HELD'` guard prevents double-release
- Frontend "Buy Now" button disabled immediately on click (stops accidental double-clicks at UI layer)

---

### Threat 5 — Stolen Device Laundering

| | |
|---|---|
| **Severity** | High |
| **Vector** | Stolen/blacklisted devices listed before IMEI verification |

**Platform risks:**
- Ghana Police Service can hold a marketplace liable for knowingly facilitating stolen goods sales
- A buyer who receives a network-blacklisted phone has received a worthless item after escrow release
- Campus context amplifies reputational risk — one incident circulates via WhatsApp immediately

**Controls:**
- IMEI mandatory for all phone listings (stored, displayed to buyer with "Check IMEI" link)
- Serial number required for all laptop listings above GH₵ 500
- "Report Stolen Device" button on every listing → immediate escrow freeze on active orders
- Seller identity link via student ID or Ghana Card before store activation
- Permanent account ban + payout block on confirmed stolen device listing

---

## 3. Authentication & JWT Flow

U-Shop uses **Supabase Auth** as the identity provider. The JWT it issues is the only credential the Express backend trusts.

```
1. User signs in via Supabase Auth (Next.js browser client)
2. Supabase issues a signed JWT — stored in an httpOnly secure cookie
   (httpOnly = JavaScript cannot read it, preventing XSS token theft)
3. Next.js Server Components or Client Components read the session
4. JWT is passed to Express in the Authorization header: Bearer <token>
5. Express authenticate middleware calls supabaseAdmin.auth.getUser(token)
6. Supabase verifies the JWT cryptographic signature and expiry
7. Express looks up the application User record via supabaseId
8. req.user is populated with role, verificationStatus, storeId
9. Route handlers access req.user — never trust client-supplied user IDs
```

```typescript
// apps/api/src/middleware/authenticate.ts
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(buildError(401, 'MISSING_TOKEN', 'Authorization header required'));
  }

  const token = authHeader.slice(7);
  const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !supabaseUser) {
    return res.status(401).json(buildError(401, 'INVALID_TOKEN', 'Token is invalid or expired'));
  }

  // Cache this lookup in Redis (key: user:supa:{supabaseId}, TTL: 5 min)
  // to avoid a DB query on every authenticated request
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    select: { id: true, supabaseId: true, email: true, role: true,
              verificationStatus: true, store: { select: { id: true } } }
  });

  if (!user) return res.status(401).json(buildError(401, 'USER_NOT_FOUND', 'User profile not found'));

  req.user = { ...user, storeId: user.store?.id };
  next();
};

// Authorization — always check ownership, not just authentication
export const requireStoreOwner = async (req: Request, res: Response, next: NextFunction) => {
  const store = await prisma.store.findUnique({ where: { handle: req.params.handle } });
  if (!store) return res.status(404).json(buildError(404, 'NOT_FOUND', 'Store not found'));
  if (store.ownerId !== req.user!.id) {
    return res.status(403).json(buildError(403, 'FORBIDDEN', 'You do not own this store'));
  }
  req.store = store;
  next();
};
```

**Key rules:**
- `SUPABASE_SERVICE_ROLE_KEY` is **only in the Express backend** — never in any Next.js environment variable prefixed with `NEXT_PUBLIC_`
- The `ANON_KEY` in the frontend is subject to Row Level Security (RLS) — it cannot bypass it
- Sessions stored in `httpOnly` cookies prevent JavaScript token theft
- JWT expiry is handled by Supabase; the Express middleware validates on every request

---

## 4. Input Sanitisation

**Never trust the client. Validate and sanitise everything server-side.**

### Zod Schema Validation (first gate)

All `POST`/`PATCH` request bodies are validated with Zod before any service logic runs:

```typescript
// apps/api/src/middleware/validateBody.ts
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(buildError(400, 'VALIDATION_FAILED', 'Request body failed validation', {
        details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      }));
    }
    req.body = result.data; // Replace with validated + type-coerced data; unknown fields stripped
    next();
  };
}

// Example schema for store creation
export const createStoreSchema = z.object({
  handle:   z.string().min(3).max(32).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  name:     z.string().min(1).max(80),
  bio:      z.string().max(280).optional(),
});

// Search endpoint — prevents excessively long queries
export const searchSchema = z.object({
  query:    z.string().max(200).optional(),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
  cursor:   z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});
```

### DOMPurify Sanitisation (second gate, for text fields)

Applied after Zod validation, before any DB write:

| Field | Sanitisation Level |
|---|---|
| `store.name` | `sanitizePlainText` — no HTML |
| `store.handle` | Regex already enforces alphanumeric + hyphens only |
| `store.bio` | `sanitizePlainText` — no HTML |
| `returnPolicy.policyNotes` | `sanitizeRichText` — allowlist only |
| `listing.title` | `sanitizePlainText` |
| `listing.description` | `sanitizeRichText` |
| `dispute.description` | `sanitizePlainText` |

### SQL Injection Prevention

Prisma uses parameterised queries by default for all ORM operations. For raw queries, **always use `Prisma.sql` tagged templates** — never `$queryRawUnsafe`:

```typescript
// NEVER DO THIS — SQL injection risk:
await prisma.$queryRawUnsafe(`SELECT * FROM listings WHERE title LIKE '%${query}%'`);

// ALWAYS DO THIS — Prisma.sql parameterises all interpolated values:
await prisma.$queryRaw`
  SELECT * FROM listings
  WHERE search_vector @@ plainto_tsquery('english', ${query})
  AND status = 'ACTIVE'
`;
```

---

## 5. Rate Limiting

All rate limits use **Upstash Redis sliding window** — shared across all Express container instances. In-memory rate limiters only see their own instance's traffic and are useless in a multi-instance deployment.

```typescript
// apps/api/src/middleware/rateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis }     from '@upstash/redis';

const redis = Redis.fromEnv();

function createLimiter(requests: number, window: string, keyBy: 'ip' | 'user') {
  const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = keyBy === 'user' ? req.user?.id ?? req.ip : req.ip;
    const { success, limit, remaining, reset } = await limiter.limit(identifier!);
    res.setHeader('RateLimit-Limit', limit);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', reset);
    if (!success) return res.status(429).json(buildError(429, 'RATE_LIMITED', 'Too many requests'));
    next();
  };
}

export const rateLimiter = {
  general:      createLimiter(300, '1 m',   'ip'),   // All API routes
  auth:         createLimiter(10,  '1 m',   'ip'),   // /auth/* — brute force prevention
  checkout:     createLimiter(5,   '1 m',   'user'), // Order initiation
  search:       createLimiter(60,  '1 m',   'ip'),   // Search endpoint
  fileUpload:   createLimiter(20,  '1 h',   'user'), // Image uploads
  verification: createLimiter(3,   '24 h',  'user'), // Student ID submission
  payout:       createLimiter(5,   '1 h',   'user'), // Payout requests
  dispute:      createLimiter(3,   '24 h',  'user'), // Dispute creation
};
```

**Login lockout — 3 failed attempts in 15 minutes:**

```typescript
// Track failed login attempts separately from rate limiting.
// Use a BullMQ delayed job for the lockout timer — server restarts must not reset it.
async function recordFailedLogin(userId: string): Promise<void> {
  const key = `login:failures:${userId}`;
  const count = await redis.incr(key);
  await redis.expire(key, 15 * 60); // 15-minute window

  if (count === 3) {
    await emailQueue.add('login-lockout-warning', { userId }, { delay: 0 });
  }
  if (count >= 5) {
    await prisma.user.update({ where: { id: userId }, data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) } });
  }
}
```

---

## 6. Paystack Webhook Security

See [Threat 3](#threat-3--paystack-webhook-forgery--replay-attacks) for the full implementation.

**Summary of requirements:**

| Requirement | Implementation | If missing |
|---|---|---|
| Raw body parsing | `express.raw()` on webhook route, registered before `express.json()` | HMAC always fails |
| HMAC-SHA512 verification | `crypto.createHmac + timingSafeEqual` | Fake events accepted |
| Idempotency check | `webhook_events` table with unique `externalId` | Double-processing payments |
| Immediate 200 response | Respond before processing | Paystack retries → duplicate events |
| Redirect not trusted | Callback page polls order status via API | Redirect exploitation |
| Event logging before processing | `upsert` to `webhook_events` first | Lost events on crash |

---

## 7. Database Security — Row Level Security (RLS)

RLS is enabled on all tables in Supabase. It is the defence-in-depth layer that protects data even if application code has a bug. The Express backend uses the `SERVICE_ROLE_KEY` which bypasses RLS — this is intentional and correct for trusted server-side code. The frontend only ever uses the `ANON_KEY`, which is fully subject to RLS.

```sql
-- Enable RLS on all user-data tables
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes   ENABLE ROW LEVEL SECURITY;

-- ── LISTINGS POLICIES ──────────────────────────────────────────────────────
-- Anyone can see active listings (public marketplace)
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'ACTIVE');

-- Sellers see all their own listings including drafts
CREATE POLICY "Sellers view their own listings"
  ON listings FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_id = auth.uid()::text
      )
    )
  );

-- Only the store owner can create or modify listings in their store
CREATE POLICY "Sellers manage their listings"
  ON listings FOR INSERT WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()::text
    ))
  );

-- ── ORDERS POLICIES ────────────────────────────────────────────────────────
-- Buyers see their own orders
CREATE POLICY "Buyers view their orders"
  ON orders FOR SELECT
  USING (buyer_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Sellers see orders placed with their store
CREATE POLICY "Sellers view their store orders"
  ON orders FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()::text
    ))
  );

-- ── MESSAGES POLICIES ──────────────────────────────────────────────────────
-- Users only see messages in threads they are a party to
CREATE POLICY "Users view their message threads"
  ON messages FOR SELECT
  USING (
    sender_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    OR order_id IN (
      SELECT id FROM orders WHERE
        buyer_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
        OR store_id IN (SELECT id FROM stores WHERE owner_id IN (
          SELECT id FROM users WHERE supabase_id = auth.uid()::text
        ))
    )
  );

-- ── WALLETS ────────────────────────────────────────────────────────────────
-- Users can only see their own wallet
CREATE POLICY "Users view their own wallet"
  ON wallets FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));
```

**Testing RLS:** After applying policies, always verify them with a separate test Supabase client using the `ANON_KEY`:

```typescript
// This must return null — a user should never see another user's order
const result = await supabaseAnonClient
  .from('orders')
  .select('*')
  .eq('id', otherUsersOrderId);
// Expect: result.data = [], result.error = null (RLS silently filters, not 403)
```

---

## 8. Secrets & Environment Variables

### Express API (`apps/api/.env`)

```bash
# Database — two URLs required (see infrastructure.md for explanation)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@[host]:5432/postgres"

# Supabase — SERVICE_ROLE bypasses RLS. Never goes to the frontend. Never.
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Paystack — secret key can drain your balance via Transfer API if leaked
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_WEBHOOK_SECRET="your_paystack_webhook_secret"

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
PORT=4000
FRONTEND_URL="https://ushop.com"
NODE_ENV="production"
```

### Next.js Frontend (`apps/web/.env.local`)

```bash
# NEXT_PUBLIC_ prefix = exposed to the browser. Only safe public values here.
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."   # Limited permissions via RLS — safe
NEXT_PUBLIC_API_URL="https://api.ushop.com/api/v1"

# No NEXT_PUBLIC_ prefix = server-only (used in Server Components, not browser)
SUPABASE_SERVICE_ROLE_KEY="eyJ..."       # Only used in Server Components for admin ops
```

### Secret classification table

| Secret | Location | Exposure level |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | Express only | Never frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Express + Next.js server-only | Never browser |
| `PAYSTACK_WEBHOOK_SECRET` | Express only | Never frontend |
| `UPSTASH_REDIS_REST_TOKEN` | Express only | Never frontend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js (browser) | Safe — RLS enforced |
| `NEXT_PUBLIC_API_URL` | Next.js (browser) | Safe — public URL |
| `DATABASE_URL` | Express only | Never frontend |

**Rule:** If a secret doesn't have `NEXT_PUBLIC_` in its name, it should not appear in any frontend code. Audit this before every deployment.

---

## 9. Inventory Race Condition Prevention

Full implementation documented in [Threat 4](#threat-4--inventory-race-conditions-at-checkout). The pattern is reused across three places:

### Stock reservation (checkout)

```typescript
// Atomic conditional UPDATE — PostgreSQL row-level lock prevents overselling
const rowsAffected = await prisma.$executeRaw`
  UPDATE listings SET stock = stock - ${quantity}
  WHERE id = ${listingId} AND stock >= ${quantity} AND status = 'ACTIVE'
`;
if (rowsAffected === 0) throw new ConflictError('This item just sold out');
```

### Escrow release (delivery confirmation)

```typescript
// WHERE status = 'HELD' ensures only one concurrent release succeeds
const result = await prisma.escrow.updateMany({
  where: { orderId, status: 'HELD' },
  data:  { status: 'RELEASED', releasedAt: new Date(), releaseTrigger: trigger }
});
if (result.count === 0) throw new Error('ALREADY_RELEASED'); // Rolls back transaction
```

### Admin approval (student verification)

```typescript
// WHERE verificationStatus = 'PENDING' prevents double-approval notifications
const result = await prisma.user.updateMany({
  where: { id: userId, verificationStatus: 'PENDING' },
  data:  { verificationStatus: 'VERIFIED', verifiedAt: new Date(), verifiedBy: adminId }
});
if (result.count === 0) return; // Already approved by another admin — no-op
```

---

## 10. OWASP Top 10 Mitigation Matrix

| # | Threat | U-Shop Mitigation |
|---|---|---|
| A01 | Broken Access Control | `requireStoreOwner`, `requireRole`, ownership checks before every mutation |
| A02 | Cryptographic Failures | `httpOnly` cookies, HMAC-SHA512 for webhooks, `timingSafeEqual` for comparisons |
| A03 | Injection | `Prisma.sql` tagged templates for all `$queryRaw`, Zod strips unknown fields |
| A04 | Insecure Design | Escrow-first payments, policy snapshots, immutable order records |
| A05 | Security Misconfiguration | Helmet.js headers, CORS restricted to production domain, RLS on all tables |
| A06 | Vulnerable Components | `pnpm audit` in CI pipeline; Dependabot alerts enabled on GitHub |
| A07 | Auth & Session Failures | Supabase JWT + httpOnly cookies; 10 req/min limit on auth routes; lockout after 5 failures |
| A08 | Software & Data Integrity | Webhook HMAC verification; `frozen-lockfile` in CI; signed Docker images |
| A09 | Logging & Monitoring | Structured pino logs; Sentry for errors; FATAL alert on webhook signature failure |
| A10 | SSRF | No server-side URL fetching from user input; only known external APIs called |

---

## 11. Data Protection — Ghana DPA Compliance

Ghana's **Data Protection Act 2012** (Act 843) applies to U-Shop. Key obligations:

### Student ID image deletion

Student ID photos are the most sensitive personal data collected. They must be deleted within **30 days of a verification decision** (approved or rejected).

```typescript
// Schedule at time of upload — not at time of decision
// apps/api/src/services/verification.service.ts

async function submitStudentId(userId: string, imagePath: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data:  { verificationStatus: 'PENDING', studentIdImagePath: imagePath }
  });

  // Schedule deletion job for 30 days from now
  await deletionQueue.add(
    'delete-student-id',
    { userId, imagePath },
    { delay: 30 * 24 * 60 * 60 * 1000 }  // 30 days in ms
  );
}

// The deletion job — runs when the 30-day delay elapses
async function deleteStudentId({ userId, imagePath }: DeletionJobData) {
  await supabaseAdmin.storage.from('verification-docs').remove([imagePath]);
  await prisma.user.update({
    where: { id: userId },
    data:  { studentIdImagePath: null }  // Clear DB reference too
  });
  logger.info({ userId, event: 'student_id_deleted' }, 'Student ID deleted per DPA schedule');
}
```

### Other DPA requirements

| Requirement | Implementation |
|---|---|
| Privacy Policy | Published at `/privacy` before launch |
| Terms of Service | Published at `/terms` before launch; sellers agree at store creation |
| Data Protection Commission registration | Submit registration form before launch |
| Right to erasure | `DELETE /api/v1/users/me/account` endpoint soft-deletes user data |
| Data minimisation | Student ID images in private bucket; only admin can access via signed URL |
| Breach notification | Sentry alerts + incident response playbook (see `docs/incident-response.md`) |

---

## 12. Pre-Launch Security Checklist

All items must be checked before deploying to production.

### Infrastructure

- [ ] `DATABASE_URL` uses PgBouncer port 6543 (not 5432)
- [ ] `DIRECT_URL` uses port 5432 (migrations only)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in Express environment — not in any Next.js `NEXT_PUBLIC_` variable
- [ ] `PAYSTACK_SECRET_KEY` only in Express environment
- [ ] All development values rotated for production secrets
- [ ] Sentry DSN configured and receiving errors from both apps

### Security Controls

- [ ] RLS enabled on all tables — tested by trying to access another user's data with ANON key (must fail silently)
- [ ] Webhook HMAC verification tested end-to-end (tamper with body → 401 response)
- [ ] Rate limits tested: 11 login attempts in 60s → 429 response → lockout email sent
- [ ] CORS configured to `https://ushop.com` only — not `*`
- [ ] Helmet.js Content Security Policy active — check `script-src` in response headers
- [ ] `dangerouslySetInnerHTML` audit: grep the entire `apps/web` directory — must return 0 results with user content
- [ ] `$queryRawUnsafe` audit: grep `apps/api` — must return 0 results

### Payments

- [ ] Paystack webhook URL configured in Paystack dashboard pointing to production URL
- [ ] Webhook secret in environment matches Paystack dashboard secret exactly
- [ ] Webhook route registered before `express.json()` in `index.ts`
- [ ] `webhook_events` table has unique constraint on `externalId`
- [ ] Test `transfer.failed` webhook: wallet debit correctly reversed
- [ ] End-to-end transaction tested in Paystack test mode from a real device

### Data Protection

- [ ] Privacy Policy published at `/privacy`
- [ ] Terms of Service published at `/terms`; seller agreement checkbox at store creation
- [ ] Student ID deletion job scheduled on upload (30-day BullMQ delayed job)
- [ ] `verification-docs` bucket is private — no public read policy
- [ ] Data Protection Commission registration submitted

---

*U-Shop Security Protocols · Internal Engineering Reference*  
*All code samples reference `apps/api/src/` and `apps/web/` unless otherwise noted.*

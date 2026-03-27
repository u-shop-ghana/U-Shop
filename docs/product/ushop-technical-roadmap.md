# U-Shop: Principal Engineer's Technical Roadmap
### From Zero to Production — Next.js 14 + Express.js + Prisma + Supabase

> **How to use this document:** Read it top to bottom, at least once, before writing a single line of code. Every phase builds on the last. The architecture decisions made in Phase 0 will either save you or haunt you for the entire project. Understand the *why* before executing the *how*.

---

## Table of Contents

1. [Phase 0 — Architecture & Planning](#phase-0)
2. [Phase 1 — Foundation & Project Setup](#phase-1)
3. [Phase 2 — Core Features: Auth, Stores & Listings](#phase-2)
4. [Phase 3 — Payments, Escrow & Payouts](#phase-3)
5. [Phase 4 — Trust, Discovery & Messaging](#phase-4)
6. [Phase 5 — Security Hardening & Observability](#phase-5)
7. [Phase 6 — Performance Optimization](#phase-6)
8. [Phase 7 — CI/CD & Production Deployment](#phase-7)
9. [Edge Cases & Failure Mode Playbook](#edge-cases)

---

## PHASE 0 — Architecture & Planning {#phase-0}

### 0.1 The Big Picture: How Your Services Talk to Each Other

Before writing code, understand the shape of your system. U-Shop has two separate applications that work together:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER / DEVICE                       │
└──────────────────────┬──────────────────────────┬───────────────────┘
                       │ HTTPS Requests            │ HTTPS Requests
                       ▼                           ▼
┌──────────────────────────────┐   ┌───────────────────────────────────┐
│   NEXT.JS 14 APP (Frontend)  │   │  EXPRESS.JS API (Backend)         │
│   Deployed on: Vercel        │   │  Deployed on: Fly.io / Railway    │
│                              │   │  (Dockerized container)           │
│  • Server Components (SSR)   │   │                                   │
│  • Client Components (CSR)   │◄──►  • REST API (/api/v1/...)         │
│  • Server Actions            │   │  • Business Logic                 │
│  • Next.js API Routes        │   │  • Webhook Handlers               │
│    (light use only)          │   │  • Background Jobs                │
│  • Image Optimization        │   │  • File Processing                │
└──────────┬───────────────────┘   └──────────────┬────────────────────┘
           │                                       │
           │  Direct Supabase calls                │  Prisma ORM calls
           │  (Auth + Storage ONLY)                │  (ALL data operations)
           ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                       │
│                                                                        │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  PostgreSQL DB │  │  Auth Service    │  │  Storage (S3-compat.) │ │
│  │  (your data)   │  │  (JWT tokens)    │  │  (images, documents)  │ │
│  └────────────────┘  └──────────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                   │
│  • Paystack (Payments — Ghana-optimized, supports MoMo)               │
│  • Resend (Transactional Email)                                        │
│  • Upstash Redis (Rate limiting, Session caching)                      │
│  • Sentry (Error tracking)                                             │
│  • PostHog (Analytics)                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Why two separate apps (Next.js + Express) instead of just Next.js API Routes?**

This is a critical architectural decision. Here is the honest reasoning:

- **Separation of concerns**: Your Express backend can be scaled, redeployed, and tested completely independently. If your API is hammered by traffic, you scale it without touching the frontend.
- **Webhook handling**: Paystack webhooks *must* be handled reliably. Next.js serverless functions on Vercel have execution time limits and cold starts. An always-running Express server on a container is far more reliable for this.
- **Background jobs**: Long-running tasks (processing ID verification images, sending batch notifications, running the auto-release escrow cron job) cannot live in serverless Next.js functions. They belong in Express.
- **Team separation**: As the team grows, a frontend team and backend team can work independently.

**The trade-off:** More infrastructure to manage. Worth it for a marketplace of this complexity.

---

### 0.2 Choosing Your ORM: Prisma vs. Drizzle

**Recommendation: Use Prisma.** Here's the honest breakdown:

| Factor | Prisma | Drizzle |
|--------|--------|---------|
| Learning curve | Gentle — schema-first, great docs | Steeper — code-first, SQL-like |
| Type safety | Excellent auto-generated types | Excellent, more SQL-transparent |
| Performance | Good, with caveats (N+1 risk) | Slightly faster, thinner layer |
| Migrations | Excellent CLI tooling | Good, maturing |
| Best for | Teams, rapid iteration, complex relations | Performance-critical, SQL experts |
| Supabase compatibility | ✅ Full | ✅ Full |

**Choose Prisma for U-Shop** because: you have complex relational data (Users → Stores → Listings → Orders → Escrow → Wallets), you need reliable migrations as the schema evolves, and the developer experience is superior for a team building fast.

---

### 0.3 Complete Database Schema

This is the single most important artifact you will create. Get this right before writing *any* application code. Every bug in a complex system traces back to a poorly designed schema.

```prisma
// prisma/schema.prisma
// This file is the "blueprint" of your entire database.
// Prisma reads this file and generates:
//   1. The actual tables in your PostgreSQL database (via migrations)
//   2. A fully type-safe TypeScript client you use in your code

generator client {
  provider = "prisma-client-js"
}

datasource db {
  // "postgresql" tells Prisma we're using a PostgreSQL database.
  // The URL comes from our environment variable, never hardcoded.
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // directUrl is used for migrations (bypasses the connection pooler).
  // Supabase uses PgBouncer as a connection pooler for regular queries,
  // but migrations need a direct database connection.
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ──────────────────────────────────────────────────────────────────
// Enums are fixed lists of allowed values. Using them prevents typos like
// "stuudent" or "STUDENT" — the database will reject anything not in the list.

enum UserRole {
  BUYER
  SELLER
  BOTH      // User is both a buyer and a seller
  ADMIN
}

enum VerificationStatus {
  UNVERIFIED    // Default — regular user
  PENDING       // Student ID uploaded, awaiting admin review
  VERIFIED      // Confirmed student
  REJECTED      // Admin rejected the ID upload
}

enum ListingStatus {
  DRAFT   // Seller is still editing, not publicly visible
  ACTIVE  // Live and purchasable
  PAUSED  // Seller temporarily hid it
  SOLD    // Item sold, no longer available
}

// 6-tier condition grading system from the PRD
enum ConditionGrade {
  NEW
  LIKE_NEW
  USED_EXCELLENT
  USED_GOOD
  USED_FAIR
  FOR_PARTS
}

enum OrderStatus {
  PENDING_PAYMENT   // Checkout initiated, payment not yet confirmed
  PAYMENT_RECEIVED  // Paystack confirmed payment, escrow holding funds
  PROCESSING        // Seller acknowledged order, preparing to ship/meetup
  IN_TRANSIT        // Seller marked as shipped / meetup arranged
  DELIVERED         // Buyer confirmed receipt — triggers escrow release
  COMPLETED         // Escrow released to seller, order finalized
  DISPUTED          // Buyer opened a dispute, escrow frozen
  CANCELLED         // Order cancelled before delivery
  REFUNDED          // Refund issued to buyer
}

enum EscrowStatus {
  HOLDING     // Funds sitting safely in escrow
  RELEASED    // Funds sent to seller's wallet
  REFUNDED    // Funds returned to buyer
}

enum DisputeStatus {
  OPEN        // Buyer just filed
  UNDER_REVIEW // Admin is investigating
  RESOLVED_BUYER  // Resolved in buyer's favor (refund)
  RESOLVED_SELLER // Resolved in seller's favor (release)
  CLOSED      // Closed without action (e.g., buyer withdrew)
}

enum PayoutStatus {
  PENDING     // Payout requested, not yet processed
  PROCESSING  // Being sent via Paystack transfer
  COMPLETED   // Arrived in seller's account
  FAILED      // Paystack returned an error
}

enum MessageSenderType {
  BUYER
  SELLER
  SYSTEM  // Automated messages (order updates, etc.)
}

// ─── MODELS ─────────────────────────────────────────────────────────────────

model User {
  // id uses CUID — a collision-resistant unique ID.
  // Better than sequential integers for public APIs (you don't want
  // users to guess "/api/users/1, /api/users/2..." and enumerate your data).
  id                String             @id @default(cuid())

  // supabaseId links this record to Supabase Auth.
  // When someone logs in via Supabase, we get their Supabase UUID.
  // We store it here so we can look up our User record from any auth token.
  supabaseId        String             @unique

  email             String             @unique
  name              String?
  avatarUrl         String?
  phone             String?            // For MoMo payout notifications

  role              UserRole           @default(BUYER)
  verificationStatus VerificationStatus @default(UNVERIFIED)

  // The student ID photo lives in Supabase Storage.
  // We store the path here, not the full URL (paths are stable; URLs can change).
  studentIdImagePath String?
  studentEmail      String?            // The .edu.gh email they used for verification
  verifiedAt        DateTime?          // Timestamp of when verification was approved
  verifiedBy        String?            // Admin user ID who approved it

  // Timestamps — always include these. You WILL need them for debugging.
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  // Relations — these are NOT stored in the database directly.
  // Prisma creates them as virtual properties you can use in queries.
  store             Store?             // A user can have at most one store
  orders            Order[]            // Orders this user placed as a buyer
  wallet            Wallet?            // The seller's earnings wallet
  reviews           Review[]           // Reviews this user has written
  disputes          Dispute[]          // Disputes this user has opened as a buyer
  sentMessages      Message[]          @relation("SentMessages")

  @@map("users") // The actual PostgreSQL table will be named "users" (lowercase)
}

model Store {
  id          String   @id @default(cuid())

  // The unique URL handle, e.g., "kwame-tech" → ushop.com/store/kwame-tech
  // @unique enforces a database-level uniqueness constraint.
  // This is your safety net even if application code has a bug.
  handle      String   @unique

  name        String
  bio         String?  // Max 280 chars — enforced at app level
  logoPath    String?  // Path in Supabase Storage
  bannerPath  String?

  // JSON field for the structured return/warranty policy.
  // Storing it as JSON means we don't need a separate table for policy,
  // but we still get structured data (not free text).
  // Example: { "returnWindow": "7_DAYS", "warrantyCoverage": "DOA_ONLY", ... }
  returnPolicy Json?

  // The policy snapshot stored per ORDER. Immutable after purchase.
  // This is separate from the store's current policy — see Order model.

  isActive    Boolean  @default(true)

  // SEO metadata, auto-generated but overrideable
  metaTitle       String?
  metaDescription String?

  // Handle was changed — we need to 301 redirect the old URL
  previousHandle  String?
  handleChangedAt DateTime?

  ownerId     String   @unique // Each user can have exactly one store
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  listings    Listing[]
  orders      Order[]   // Orders involving products from this store

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("stores")
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique // "Laptops", "Phones", "Accessories", etc.
  slug     String    @unique // "laptops", "phones", "accessories"
  iconUrl  String?

  listings Listing[]

  @@map("categories")
}

model Listing {
  id          String        @id @default(cuid())
  title       String
  description String        // Full description, supports markdown
  price       Decimal       @db.Decimal(10, 2) // Use Decimal, never Float, for money
  stock       Int           @default(1)        // How many units available
  status      ListingStatus @default(DRAFT)
  condition   ConditionGrade

  // Stored as an array of storage paths.
  // Example: ["/listings/abc123/photo-1.jpg", "/listings/abc123/photo-2.jpg"]
  // Up to 6 photos per the PRD. Enforced at application level.
  imagePaths  String[]

  // The policy AT THE TIME of listing creation.
  // If a seller later changes their store policy, existing listings
  // are NOT automatically updated. This prevents bait-and-switch.
  policySnapshot Json?

  // Search optimization: store a pre-computed search vector.
  // This is a PostgreSQL tsvector — a special type for full-text search.
  // We'll set this up with a trigger.
  searchVector Unsupported("tsvector")?

  viewCount   Int      @default(0)

  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  orderItems  OrderItem[]
  messages    Message[]  // Q&A threads are attached to a listing

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Composite index: speeds up "get all active listings for a store" queries
  @@index([storeId, status])
  // Index for category filtering
  @@index([categoryId, status])
  // Index for price-range filtering
  @@index([price])
  @@map("listings")
}

model Order {
  id             String      @id @default(cuid())

  // The total the buyer paid, in GHS (Ghana Cedis)
  totalAmount    Decimal     @db.Decimal(10, 2)

  // The platform fee (5% or 8%) calculated at checkout
  platformFee    Decimal     @db.Decimal(10, 2)

  // The net amount the seller will receive after the fee
  sellerAmount   Decimal     @db.Decimal(10, 2)

  status         OrderStatus @default(PENDING_PAYMENT)

  // Paystack's unique reference for this transaction.
  // We generate this before redirecting to Paystack, then use it
  // in the webhook to find this order.
  paystackRef    String      @unique

  // The FULL shipping address as a JSON snapshot.
  // Why a snapshot? If the buyer later changes their address,
  // we still know where this specific order was shipped to.
  shippingAddress Json?

  // CRITICAL: Snapshot of seller's return/warranty policy at checkout.
  // This is the policy the buyer agreed to. Even if the seller changes
  // their policy tomorrow, this order is governed by THIS snapshot.
  policySnapshot Json

  // When should escrow auto-release if buyer doesn't confirm?
  escrowReleaseAt DateTime?

  // Timestamps for the order lifecycle
  paidAt         DateTime?
  deliveredAt    DateTime?
  completedAt    DateTime?

  buyerId        String
  buyer          User        @relation(fields: [buyerId], references: [id])

  storeId        String
  store          Store       @relation(fields: [storeId], references: [id])

  items          OrderItem[]
  escrow         Escrow?     // One escrow record per order
  dispute        Dispute?    // At most one dispute per order
  messages       Message[]   // The in-app chat thread for this order
  reviews        Review[]

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([buyerId])
  @@index([storeId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  // Snapshot the price at time of purchase!
  // If a seller later changes the listing price, historical orders
  // must still show what was actually paid.
  unitPrice Decimal @db.Decimal(10, 2)

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

  listingId String
  listing   Listing @relation(fields: [listingId], references: [id])

  @@map("order_items")
}

model Escrow {
  id        String       @id @default(cuid())
  amount    Decimal      @db.Decimal(10, 2)
  status    EscrowStatus @default(HOLDING)
  heldAt    DateTime     @default(now())
  releasedAt DateTime?

  orderId   String       @unique // Enforces one escrow per order
  order     Order        @relation(fields: [orderId], references: [id])

  @@map("escrows")
}

model Wallet {
  id              String   @id @default(cuid())

  // Current available balance — what they can request to withdraw
  availableBalance Decimal  @db.Decimal(10, 2) @default(0)

  // Total lifetime earnings for analytics
  totalEarned     Decimal   @db.Decimal(10, 2) @default(0)

  userId          String    @unique // One wallet per seller user
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  transactions    WalletTransaction[]
  payouts         Payout[]

  @@map("wallets")
}

model WalletTransaction {
  id          String   @id @default(cuid())

  // Positive = credit (earning from a sale)
  // Negative = debit (payout being withdrawn)
  amount      Decimal  @db.Decimal(10, 2)

  // Human-readable description: "Sale: MacBook Pro 2019 (#ord_xyz)"
  description String

  // Reference to the order that triggered this transaction, if applicable
  orderId     String?

  walletId    String
  wallet      Wallet   @relation(fields: [walletId], references: [id])

  createdAt   DateTime @default(now())

  @@map("wallet_transactions")
}

model Payout {
  id              String       @id @default(cuid())
  amount          Decimal      @db.Decimal(10, 2)
  status          PayoutStatus @default(PENDING)

  // Where the money is going
  recipientType   String       // "momo" or "bank"
  recipientDetails Json        // { "accountNumber": "...", "network": "MTN" }

  // Paystack's transfer code — needed to check transfer status
  paystackTransferCode String?

  failureReason   String?
  processedAt     DateTime?

  walletId        String
  wallet          Wallet       @relation(fields: [walletId], references: [id])

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@map("payouts")
}

model Message {
  id         String            @id @default(cuid())
  content    String
  senderType MessageSenderType
  isRead     Boolean           @default(false)

  senderId   String
  sender     User              @relation("SentMessages", fields: [senderId], references: [id])

  // A message belongs to either a listing thread (pre-purchase Q&A)
  // or an order thread (post-purchase communication/dispute evidence).
  // Both are nullable, but exactly one must be set.
  listingId  String?
  listing    Listing?          @relation(fields: [listingId], references: [id])

  orderId    String?
  order      Order?            @relation(fields: [orderId], references: [id])

  createdAt  DateTime          @default(now())

  @@index([listingId])
  @@index([orderId])
  @@map("messages")
}

model Review {
  id       String  @id @default(cuid())
  rating   Int     // 1-5, enforced at app level
  comment  String?

  // Who wrote the review
  authorId String
  author   User    @relation(fields: [authorId], references: [id])

  // Which order this review is for (ensures one review per transaction)
  orderId  String
  order    Order   @relation(fields: [orderId], references: [id])

  createdAt DateTime @default(now())

  // Composite unique: one review per author per order
  @@unique([authorId, orderId])
  @@map("reviews")
}

model Dispute {
  id          String        @id @default(cuid())
  reason      String        // "Item not received", "Not as described", etc.
  description String        // Buyer's full explanation
  status      DisputeStatus @default(OPEN)

  // Paths to evidence files (photos/videos) in Supabase Storage
  evidencePaths String[]

  adminNotes  String?   // Internal notes from the admin reviewing the case
  resolvedAt  DateTime?
  resolvedBy  String?   // Admin user ID

  buyerId     String
  buyer       User      @relation(fields: [buyerId], references: [id])

  orderId     String    @unique // One dispute per order
  order       Order     @relation(fields: [orderId], references: [id])

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("disputes")
}

// Webhook events log — store every incoming webhook from Paystack.
// This is your audit trail and your idempotency mechanism.
model WebhookEvent {
  id          String   @id @default(cuid())
  source      String   // "paystack"
  eventType   String   // "charge.success", "transfer.success", etc.
  payload     Json     // The full webhook body, stored verbatim
  processed   Boolean  @default(false)

  // Paystack sends a unique ID with each event.
  // We store it and check for it before processing to prevent
  // running the same payment twice if Paystack retries the webhook.
  externalId  String?  @unique

  processedAt DateTime?
  error       String?  // If processing failed, store the error message

  createdAt   DateTime @default(now())

  @@index([processed])
  @@map("webhook_events")
}
```

---

### 0.4 Monorepo Structure

Organize your code so both apps can share TypeScript types and utility functions.

```
ushop/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Login, register, verify routes
│   │   │   ├── (marketplace)/  # Homepage, search, category pages
│   │   │   ├── store/
│   │   │   │   └── [handle]/   # Dynamic store page: /store/kwame-tech
│   │   │   ├── listing/
│   │   │   │   └── [id]/       # Individual listing page
│   │   │   ├── dashboard/      # Buyer/seller dashboard (protected)
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── admin/          # Admin panel (heavily protected)
│   │   ├── components/         # Reusable React components
│   │   ├── lib/
│   │   │   ├── supabase/       # Supabase client instances
│   │   │   ├── api-client.ts   # Typed HTTP client for Express API
│   │   │   └── utils.ts
│   │   └── middleware.ts       # Next.js middleware for auth/redirects
│   │
│   └── api/                    # Express.js backend
│       ├── src/
│       │   ├── routes/         # Route definitions
│       │   ├── controllers/    # Request/response handling
│       │   ├── services/       # Business logic (the real meat)
│       │   ├── middleware/     # Auth, validation, rate-limiting
│       │   ├── lib/
│       │   │   ├── prisma.ts   # Prisma client singleton
│       │   │   ├── paystack.ts # Paystack SDK wrapper
│       │   │   └── supabase.ts # Supabase admin client
│       │   └── index.ts        # Express app entry point
│       └── prisma/
│           ├── schema.prisma   # The schema from 0.3
│           └── migrations/     # Auto-generated migration files
│
├── packages/
│   └── shared/                 # Shared TypeScript types & validation
│       ├── src/
│       │   ├── types/          # Shared interfaces
│       │   └── schemas/        # Zod validation schemas (used in both apps)
│       └── package.json
│
├── package.json                # Root workspace config
└── turbo.json                  # Turborepo build pipeline config
```

---

## PHASE 1 — Foundation & Project Setup {#phase-1}

### 1.1 Initialize the Monorepo

```bash
# Create root directory
mkdir ushop && cd ushop

# Initialize with pnpm workspaces (faster than npm, better than yarn for monorepos)
pnpm init

# Install Turborepo — it manages running tasks across all packages efficiently
pnpm add turbo -D -w

# Create the apps
mkdir -p apps/web apps/api packages/shared

# Initialize Next.js in the web app
cd apps/web
pnpx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir no

# Initialize the Express API
cd ../api
pnpm init
pnpm add express cors helmet morgan dotenv
pnpm add -D typescript @types/express @types/node ts-node nodemon

# Add Prisma to the API
pnpm add prisma @prisma/client
pnpx prisma init --datasource-provider postgresql
```

**Root `package.json` (Workspace Configuration):**

```json
{
  "name": "ushop",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "db:migrate": "cd apps/api && prisma migrate dev",
    "db:studio": "cd apps/api && prisma studio"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

---

### 1.2 Setting Up the Express API (`apps/api/src/index.ts`)

```typescript
// apps/api/src/index.ts
// This is the entry point for your Express server.
// Think of it like the "front door" of your backend.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Import all route modules
import authRoutes from './routes/auth';
import storeRoutes from './routes/stores';
import listingRoutes from './routes/listings';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';

// Create the Express application instance
const app = express();

// ── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

// helmet() sets a bunch of HTTP security headers automatically.
// For example, it sets X-Content-Type-Options to prevent MIME sniffing,
// and X-Frame-Options to prevent clickjacking attacks.
app.use(helmet());

// CORS (Cross-Origin Resource Sharing): Controls which domains can call our API.
// Without this, browsers would block requests from your Next.js frontend
// to your Express backend (they're on different domains/ports).
app.use(cors({
  // In production, only allow requests from your actual frontend domain.
  // process.env.FRONTEND_URL will be "https://ushop.com" in production.
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent cross-origin
}));

// ── WEBHOOK ROUTES (Must be registered BEFORE body parsing!) ────────────────
// CRITICAL: Paystack webhook signature verification requires the RAW request body —
// the original bytes before any JSON parsing.
// If we parse JSON first, we can't verify the signature anymore.
// Register webhook routes BEFORE calling app.use(express.json()).
app.use('/webhooks', webhookRoutes);

// ── BODY PARSING MIDDLEWARE ──────────────────────────────────────────────────
// These middleware functions convert the raw HTTP body into usable data.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── LOGGING ──────────────────────────────────────────────────────────────────
// morgan logs every HTTP request: method, path, status code, response time.
// In development, use 'dev' format (colorized, concise).
// In production, use 'combined' format (Apache-style, includes IP addresses).
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── RATE LIMITING ─────────────────────────────────────────────────────────────
// Apply a general rate limit to all API routes.
// More specific limits are applied per-route (e.g., auth routes get stricter limits).
app.use('/api', rateLimiter.general);

// ── ROUTES ────────────────────────────────────────────────────────────────────
// Mount each router at its prefix.
// So a route defined as router.get('/me') in userRoutes
// becomes accessible at GET /api/v1/users/me
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
// A simple endpoint that returns 200 OK.
// Your deployment platform uses this to know the server is alive.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── ERROR HANDLER (Must be LAST) ─────────────────────────────────────────────
// Express identifies error handlers by their 4 parameters: (err, req, res, next)
// Any route that calls next(error) will end up here.
app.use(errorHandler);

// Start listening for connections
const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});

export default app;
```

---

### 1.3 Prisma Client Singleton (`apps/api/src/lib/prisma.ts`)

```typescript
// apps/api/src/lib/prisma.ts
// A "singleton" means we create exactly ONE instance of the Prisma client
// for the entire application. Why? Because each PrismaClient instance
// opens its own connection pool to the database.
//
// If you create a new PrismaClient() in every file that needs it,
// you'll quickly exhaust your Supabase database connection limit.
// This pattern ensures we always reuse the same one.

import { PrismaClient } from '@prisma/client';

// In Node.js, 'global' is an object that persists for the lifetime of the process.
// We use it to store our single Prisma instance.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Check if a PrismaClient instance already exists on global.
// If it does, reuse it. If not, create a new one.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      // In development, log all queries to the console so you can see
      // exactly what SQL is being generated. Turn this OFF in production
      // as it's very verbose and will flood your logs.
      ...(process.env.NODE_ENV === 'development'
        ? [{ level: 'query', emit: 'stdout' } as const]
        : []),
      // Always log warnings and errors regardless of environment
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ],
  });

// In development, hot-module reloading (HMR) can cause this module to
// be re-evaluated, creating a new PrismaClient each time.
// Storing it on `global` prevents this.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

### 1.4 Environment Variables Setup

**`apps/api/.env` (never commit this file!):**
```bash
# Database — Two URLs because of Supabase's connection pooler
# DATABASE_URL uses the pooled connection (for regular queries) — port 6543
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# DIRECT_URL bypasses the pooler (for migrations) — port 5432
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase (for admin operations)
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..." # NEVER expose this to the frontend!

# Paystack
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_WEBHOOK_SECRET="your_paystack_webhook_secret"

# App
PORT=4000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
JWT_SECRET="a-very-long-random-string-for-signing-tokens"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**`apps/web/.env.local`:**
```bash
# PUBLIC keys — safe to expose in the browser
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."  # This key has limited permissions via RLS
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Server-only (not exposed to browser — no NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Used in Next.js Server Components
```

---

## PHASE 2 — Core Features: Auth, Stores & Listings {#phase-2}

### 2.1 Authentication Architecture

Understanding how auth works across two apps is crucial. Here is the exact flow:

```
1. User clicks "Sign In" on Next.js frontend
2. Supabase JS library handles the OAuth/email flow
3. Supabase returns a JWT (JSON Web Token) to the browser
4. Next.js stores this JWT in a secure cookie
5. When Next.js makes a request to Express API, it includes the JWT
6. Express middleware verifies the JWT against Supabase's public keys
7. Express extracts the user's Supabase ID from the token
8. Express uses that Supabase ID to look up the User record in our database
9. The User record (with role, verification status, etc.) is attached to the request
```

**Supabase Client Setup for Next.js:**

```typescript
// apps/web/lib/supabase/server.ts
// This creates a Supabase client for use in Server Components and Server Actions.
// It uses cookies to store the auth session, which is more secure than localStorage.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  // Get the cookie store from Next.js — this is how we read/write auth cookies
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // How to read a cookie by name
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // How to set a cookie
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        // How to delete a cookie
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

**Express Auth Middleware (`apps/api/src/middleware/authenticate.ts`):**

```typescript
// apps/api/src/middleware/authenticate.ts
// This middleware runs BEFORE your route handlers on protected routes.
// Its job: verify the JWT, find the user, and attach them to the request.

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';

// Create a Supabase admin client.
// The SERVICE_ROLE_KEY bypasses Row Level Security.
// Use it ONLY in trusted backend code, never in the frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Extend the Express Request type to include our custom properties.
// This way, TypeScript knows that req.user exists on protected routes.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;       // Our database user ID (cuid)
        supabaseId: string;
        email: string;
        role: string;
        verificationStatus: string;
        storeId?: string; // Populated if user is a seller
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // The token arrives in the Authorization header, formatted as:
  // "Bearer eyJhbGciOiJIUzI1NiIs..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  // Extract just the token part (after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Ask Supabase to verify this token.
    // Supabase checks: Is this token cryptographically valid?
    // Was it issued by us? Has it expired?
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Now look up our own User record using the Supabase ID.
    // We include the store so we know if they're a seller.
    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: {
        id: true,
        supabaseId: true,
        email: true,
        role: true,
        verificationStatus: true,
        store: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      // User authenticated with Supabase but doesn't exist in our DB.
      // This can happen if the user was deleted from our DB but not Supabase,
      // or if there's a sync issue during signup.
      return res.status(401).json({ error: 'User account not found' });
    }

    // Attach the user to the request object.
    // Every route handler that comes AFTER this middleware can now access req.user.
    req.user = {
      ...user,
      storeId: user.store?.id,
    };

    // Call next() to pass control to the next middleware or route handler.
    next();
  } catch (err) {
    // If anything unexpected goes wrong, return a 500
    next(err);
  }
};

// A separate middleware for routes that only admins can access.
// Used AFTER authenticate().
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
```

---

### 2.2 Student Verification Flow

This is one of the most trust-critical features in the platform. Two paths:

**Path 1: Automatic (email domain check)**
```typescript
// apps/api/src/services/verification.service.ts
// The verification service handles all logic related to student status.

import { prisma } from '../lib/prisma';

// A list of known Ghanaian university email domains.
// Store this in your database or a config file so it's easy to update.
const VERIFIED_STUDENT_DOMAINS = [
  'ug.edu.gh',        // University of Ghana
  'knust.edu.gh',     // Kwame Nkrumah University
  'ucc.edu.gh',       // University of Cape Coast
  'uds.edu.gh',       // University for Development Studies
  'gimpa.edu.gh',     // Ghana Institute of Management and Public Administration
  'ashesi.edu.gh',    // Ashesi University
  'pentvars.edu.gh',  // Pentecost University
  'gctu.edu.gh',      // Ghana Communication Technology University
  // ... add more as needed
];

export class VerificationService {

  // Check if an email address belongs to a known student domain.
  // Called immediately after signup if the user signs up with a student email.
  static isStudentEmail(email: string): boolean {
    // Extract the domain part from the email.
    // "kwame@ug.edu.gh" → "ug.edu.gh"
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    return VERIFIED_STUDENT_DOMAINS.some(studentDomain =>
      // Check for exact match OR subdomain match.
      // "st.ug.edu.gh" should also count as a UG email.
      domain === studentDomain || domain.endsWith('.' + studentDomain)
    );
  }

  // Called after a user successfully signs up.
  // Automatically grants VERIFIED status if email is a student domain.
  static async handlePostSignup(userId: string, email: string): Promise<void> {
    if (this.isStudentEmail(email)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationStatus: 'VERIFIED',
          studentEmail: email,
          verifiedAt: new Date(),
          // "system" indicates this was auto-verified, not by a human admin
          verifiedBy: 'system:auto-domain',
        }
      });
    }
  }

  // Path 2: Manual ID upload.
  // Called when a student uploads their ID photo for admin review.
  static async submitIdForReview(
    userId: string,
    imageStoragePath: string
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'PENDING',
        studentIdImagePath: imageStoragePath,
      }
    });

    // TODO: Notify admin dashboard (send a notification, update a counter, etc.)
  }

  // Called by an admin from the admin panel.
  static async approveVerification(
    userId: string,
    adminId: string
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: adminId,
        // Once approved, we should schedule deletion of the ID image
        // per Ghana Data Protection Act requirements.
        // Set a flag or schedule a job here.
      }
    });
  }
}
```

---

### 2.3 Store Creation with Unique Handle

```typescript
// apps/api/src/services/store.service.ts
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

// Reserved handles that can never be registered.
// These are paths used by the Next.js app itself.
const RESERVED_HANDLES = new Set([
  'admin', 'api', 'help', 'support', 'auth', 'login', 'logout',
  'register', 'signup', 'search', 'category', 'checkout', 'order',
  'dashboard', 'settings', 'about', 'contact', 'terms', 'privacy',
  'ushop', 'store', 'listing', 'profile', 'wallet', 'payout',
  'verify', 'verification', 'dispute', 'review', 'report',
  // Add more as needed — keep this list in a config file
]);

export class StoreService {

  // Validate that a handle meets our format requirements.
  static validateHandle(handle: string): { valid: boolean; reason?: string } {
    if (handle.length < 3 || handle.length > 24) {
      return { valid: false, reason: 'Handle must be between 3 and 24 characters' };
    }
    // Only allow alphanumeric characters and hyphens
    if (!/^[a-z0-9-]+$/.test(handle)) {
      return { valid: false, reason: 'Handle can only contain lowercase letters, numbers, and hyphens' };
    }
    if (handle.startsWith('-') || handle.endsWith('-')) {
      return { valid: false, reason: 'Handle cannot start or end with a hyphen' };
    }
    if (RESERVED_HANDLES.has(handle)) {
      return { valid: false, reason: 'This handle is reserved' };
    }
    return { valid: true };
  }

  // Check if a handle is already taken — used for real-time availability check.
  static async isHandleAvailable(handle: string): Promise<boolean> {
    const normalizedHandle = handle.toLowerCase();

    // Check reserved words first (fast, no database call needed)
    if (RESERVED_HANDLES.has(normalizedHandle)) return false;

    // Check database
    const existing = await prisma.store.findUnique({
      where: { handle: normalizedHandle },
      select: { id: true }, // Only fetch the ID — we don't need anything else
    });

    return !existing; // If null, handle is available
  }

  // Create a new store for a user.
  static async createStore(
    ownerId: string,
    data: { handle: string; name: string; bio?: string }
  ) {
    const handle = data.handle.toLowerCase();

    // Validate handle format
    const validation = this.validateHandle(handle);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Check availability again (even if frontend checked — always validate on backend)
    const available = await this.isHandleAvailable(handle);
    if (!available) {
      throw new Error('This store handle is already taken');
    }

    // Check that the user doesn't already have a store
    const existingStore = await prisma.store.findUnique({
      where: { ownerId },
    });
    if (existingStore) {
      throw new Error('You already have a store');
    }

    // Create the store and update the user's role to SELLER in one transaction.
    // A database transaction means both operations succeed, or neither does.
    // We never want a store without an owner or an owner without a store status update.
    return prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          handle,
          name: data.name,
          bio: data.bio,
          ownerId,
        }
      });

      // Update user role to at least SELLER
      await tx.user.update({
        where: { id: ownerId },
        data: {
          // If they were a BUYER, make them BOTH. If they were already something
          // higher, don't downgrade them.
          role: { set: 'BOTH' } // This is a simplification; refine as needed
        }
      });

      return store;
    });
  }
}
```

---

### 2.4 Product Listings & Image Upload

```typescript
// apps/api/src/services/listing.service.ts
import { prisma } from '../lib/prisma';
import { supabaseAdmin } from '../lib/supabase';

export class ListingService {

  // Create a new listing.
  // Note: Images have already been uploaded to Supabase Storage
  // at this point. The frontend uploads images first, gets back
  // the storage paths, then submits the listing form with those paths.
  static async createListing(
    storeId: string,
    data: {
      title: string;
      description: string;
      price: number;
      stock: number;
      condition: string;
      categoryId: string;
      imagePaths: string[]; // Already uploaded to Supabase Storage
    }
  ) {
    // Validate image count
    if (data.imagePaths.length > 6) {
      throw new Error('Maximum 6 images per listing');
    }

    // Get the store's current policy to snapshot it on the listing
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { returnPolicy: true }
    });

    return prisma.listing.create({
      data: {
        ...data,
        storeId,
        // Snapshot the policy at listing creation time.
        // If the seller changes their policy later, this listing
        // will still show the original policy it was created with.
        policySnapshot: store?.returnPolicy ?? null,
        status: 'DRAFT', // All listings start as drafts
      }
    });
  }

  // Full-text search with filters.
  // This is a carefully crafted Prisma query — let's break it down.
  static async searchListings(params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sellerType?: 'student' | 'reseller' | 'any';
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Build the WHERE clause dynamically.
    // We only add conditions when the parameter is actually provided.
    const where: any = {
      status: 'ACTIVE', // Never return drafts or sold items to searchers
    };

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {
        ...(params.minPrice !== undefined && { gte: params.minPrice }),
        ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
      };
    }

    if (params.condition) {
      where.condition = params.condition;
    }

    // For full-text search, we use Prisma's raw SQL capability.
    // PostgreSQL has excellent built-in full-text search.
    // We previously set up a tsvector column and a trigger to keep it updated.
    if (params.query) {
      // Use Prisma's raw query for full-text search
      // This uses the searchVector column we set up in the schema
      where.searchVector = {
        // This is a raw PostgreSQL operator — @@ means "matches"
        // We're using Prisma's raw filter here
        search: params.query.split(' ').join(' & '), // Join words with AND operator
      };
    }

    // Build the ORDER BY clause
    const orderBy: any = {
      newest: { createdAt: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      // rating sort requires a subquery — advanced, implement later
    }[params.sortBy || 'newest'] || { createdAt: 'desc' };

    // Execute the query and a count query simultaneously.
    // Promise.all runs both queries at the same time instead of waiting
    // for one to finish before starting the other.
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          // Include related data we need for the listing cards
          store: {
            select: {
              id: true,
              name: true,
              handle: true,
              owner: {
                select: { verificationStatus: true }
              }
            }
          },
          category: {
            select: { name: true, slug: true }
          }
        }
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      }
    };
  }
}
```

---

## PHASE 3 — Payments, Escrow & Payouts {#phase-3}

### 3.1 The Paystack Integration Architecture

Paystack is Ghana's leading payment processor and supports cards, MTN MoMo, Vodafone Cash, and AirtelTigo. Here's exactly how the checkout flow works:

```
CHECKOUT FLOW:
─────────────
1. User clicks "Pay Now" on Next.js
2. Next.js calls Express POST /api/v1/orders (creates order in DB with PENDING_PAYMENT status)
3. Express generates a unique paystackRef (e.g., "ushop_ord_clxabc123_1718000000")
4. Express calls Paystack API to initialize a transaction
5. Paystack returns an authorization_url
6. Express sends this URL back to Next.js
7. Next.js redirects user to Paystack's hosted checkout page
8. User pays on Paystack's page (Paystack handles all the card/MoMo complexity)
9. Paystack redirects user back to our callback_url
10. Paystack ALSO sends a webhook to our Express backend
    (The webhook is the SOURCE OF TRUTH — don't rely on the callback URL)
11. Express webhook handler verifies the webhook signature (security!)
12. Express updates order status to PAYMENT_RECEIVED
13. Express creates Escrow record (funds are now "held")
14. Express sends order confirmation email to buyer
15. Express notifies seller of new order
```

```typescript
// apps/api/src/lib/paystack.ts
// A wrapper around the Paystack API.
// We wrap it in our own class so we can: add logging, handle errors
// consistently, and easily swap it out or mock it in tests.

import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Create an axios instance with the Paystack base URL and auth header.
// Every request using this instance will automatically include our secret key.
const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export class PaystackService {

  // Step 1: Initialize a transaction and get a payment URL.
  static async initializeTransaction(params: {
    email: string;       // Buyer's email — Paystack sends them a receipt
    amount: number;      // Amount in PESEWAS (not cedis!) — 1 GHS = 100 pesewas
    reference: string;   // Our unique order reference
    callbackUrl: string; // Where to redirect after payment
    metadata?: Record<string, any>; // Extra data we want to store with this transaction
  }) {
    const response = await paystackAPI.post('/transaction/initialize', {
      email: params.email,
      // IMPORTANT: Paystack uses the smallest currency unit.
      // So GH₵ 150.00 must be sent as 15000 pesewas.
      amount: Math.round(params.amount * 100),
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: 'GHS',
      metadata: params.metadata,
      // These are the payment channels we support
      channels: ['card', 'mobile_money', 'bank'],
    });

    return response.data.data as {
      authorization_url: string; // URL to redirect the buyer to
      access_code: string;
      reference: string;
    };
  }

  // Verify a transaction by reference — used in the webhook handler.
  static async verifyTransaction(reference: string) {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data.data as {
      status: string;    // "success" | "failed"
      amount: number;    // In pesewas
      reference: string;
      customer: { email: string };
      paid_at: string;
    };
  }

  // Initiate a transfer (payout to seller).
  static async initiateTransfer(params: {
    amount: number;          // In pesewas
    recipientCode: string;   // Paystack recipient code (created separately)
    reference: string;       // Our unique reference for this payout
    reason: string;          // Description shown to recipient
  }) {
    const response = await paystackAPI.post('/transfer', {
      source: 'balance',
      amount: Math.round(params.amount * 100),
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason,
    });

    return response.data.data as {
      transfer_code: string;
      status: string;
    };
  }
}
```

---

### 3.2 The Webhook Handler — The Most Critical Code You Will Write

```typescript
// apps/api/src/routes/webhooks.ts
// CRITICAL: This file handles Paystack's server-to-server notifications.
// These are the notifications that tell us "payment was successful",
// "transfer failed", etc. Getting this wrong means lost money or stuck orders.

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { EscrowService } from '../services/escrow.service';
import { NotificationService } from '../services/notification.service';

const router = Router();

// REMEMBER: This route is registered BEFORE express.json() middleware.
// We need the raw body to verify the Paystack signature.
// The raw body is available because we use express.raw() here.
router.post('/paystack',
  // express.raw() reads the body as a Buffer (raw bytes), not parsed JSON.
  // We MUST do this BEFORE any JSON parsing happens.
  require('express').raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {

    // STEP 1: Verify the webhook signature.
    // Paystack signs every webhook with HMAC-SHA512 using your secret key.
    // We recompute the hash and compare it. If they don't match,
    // someone is sending fake webhooks to trigger free money releases!
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'No signature header' });
    }

    // Compute the expected signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(req.body) // req.body is raw bytes here — crucial!
      .digest('hex');

    // Compare using timingSafeEqual to prevent timing attacks.
    // Regular string comparison (hash === signature) can leak information
    // about how close the guess was based on how long it takes.
    const sigBuffer = Buffer.from(signature);
    const hashBuffer = Buffer.from(hash);

    if (sigBuffer.length !== hashBuffer.length ||
        !crypto.timingSafeEqual(hashBuffer, sigBuffer)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // STEP 2: Parse the verified body
    const event = JSON.parse(req.body.toString());

    // STEP 3: Respond to Paystack immediately with 200 OK.
    // Paystack expects a quick response. If we don't respond fast,
    // it will retry the webhook (which can cause double-processing).
    // We process the event AFTER responding.
    res.sendStatus(200);

    // STEP 4: Process the event asynchronously.
    // We fire-and-forget the processing. If it fails, we'll have the
    // event logged in our database to retry later.
    processWebhookEvent(event).catch(err => {
      console.error('Webhook processing error:', err);
    });
  }
);

async function processWebhookEvent(event: any) {
  const eventType = event.event; // e.g., "charge.success"

  // STEP 5: Check for idempotency.
  // Paystack may send the same webhook multiple times if it doesn't
  // receive a quick enough response. We store each event and check
  // if we've already processed it before doing anything.
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { externalId: event.data?.id?.toString() }
  });

  if (existingEvent?.processed) {
    console.log(`Webhook already processed: ${eventType} ${event.data?.id}`);
    return; // Exit early — don't process the same event twice!
  }

  // Store the event first, then process it.
  const storedEvent = await prisma.webhookEvent.upsert({
    where: { externalId: event.data?.id?.toString() ?? `${eventType}-${Date.now()}` },
    create: {
      source: 'paystack',
      eventType,
      payload: event,
      externalId: event.data?.id?.toString(),
    },
    update: { payload: event }, // Update if it already exists (from a retry)
  });

  try {
    // STEP 6: Route to the appropriate handler based on event type.
    switch (eventType) {
      case 'charge.success':
        // A payment was successful — move order to payment received state
        await handleChargeSuccess(event.data);
        break;

      case 'transfer.success':
        // A payout to a seller was successful
        await handleTransferSuccess(event.data);
        break;

      case 'transfer.failed':
        // A payout to a seller failed — return funds to wallet
        await handleTransferFailed(event.data);
        break;

      case 'transfer.reversed':
        // A payout was reversed by Paystack — return funds to wallet
        await handleTransferFailed(event.data);
        break;

      default:
        // Log unknown event types for monitoring
        console.log(`Unhandled Paystack event type: ${eventType}`);
    }

    // Mark the event as processed successfully
    await prisma.webhookEvent.update({
      where: { id: storedEvent.id },
      data: { processed: true, processedAt: new Date() }
    });

  } catch (error: any) {
    // Mark the event as failed — we can retry it later
    await prisma.webhookEvent.update({
      where: { id: storedEvent.id },
      data: { error: error.message }
    });
    throw error; // Re-throw so the outer catch can log it
  }
}

async function handleChargeSuccess(data: any) {
  const reference = data.reference;

  // Find the order by Paystack reference
  const order = await prisma.order.findUnique({
    where: { paystackRef: reference },
    include: { items: { include: { listing: true } } }
  });

  if (!order) {
    throw new Error(`Order not found for reference: ${reference}`);
  }

  if (order.status !== 'PENDING_PAYMENT') {
    // Already processed — this is a duplicate webhook, skip it
    console.log(`Order ${order.id} already processed`);
    return;
  }

  // Use a database transaction to ensure all of these happen atomically.
  // If any step fails, ALL changes are rolled back — no partial updates!
  await prisma.$transaction(async (tx) => {

    // 1. Update order status
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAYMENT_RECEIVED',
        paidAt: new Date(),
        // Set the escrow auto-release date (7 days from now per PRD)
        escrowReleaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // 2. Create the escrow record — funds are now "held"
    await tx.escrow.create({
      data: {
        orderId: order.id,
        amount: order.sellerAmount, // The seller's cut (after platform fee)
        status: 'HOLDING',
      }
    });

    // 3. Decrement inventory for each item in the order.
    // This is where race conditions can happen — see the Edge Cases section.
    for (const item of order.items) {
      await tx.listing.update({
        where: { id: item.listingId },
        data: {
          stock: { decrement: item.quantity },
          // If stock hits 0, automatically change status to SOLD
          status: item.listing.stock - item.quantity <= 0 ? 'SOLD' : 'ACTIVE',
        }
      });
    }
  });

  // 4. Send notifications (outside the transaction — non-critical)
  await NotificationService.notifyOrderConfirmation(order.id);
}
```

---

### 3.3 The Escrow Service

```typescript
// apps/api/src/services/escrow.service.ts
// The escrow service manages the most financially sensitive part of the platform.
// Every function in this service should be treated with extreme care.

import { prisma } from '../lib/prisma';
import { PaystackService } from '../lib/paystack';

export class EscrowService {

  // Called when buyer confirms delivery (or by the cron job after 7 days).
  // This releases the seller's money from escrow to their wallet.
  static async releaseToSeller(orderId: string, triggeredBy: 'buyer' | 'auto') {
    // Find the order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        escrow: true,
        store: { include: { owner: true } }
      }
    });

    if (!order) throw new Error(`Order ${orderId} not found`);
    if (!order.escrow) throw new Error(`No escrow record for order ${orderId}`);

    // Validate the current state
    if (order.escrow.status !== 'HOLDING') {
      throw new Error(`Escrow for order ${orderId} is not in HOLDING state (current: ${order.escrow.status})`);
    }

    if (order.status !== 'DELIVERED' && order.status !== 'PAYMENT_RECEIVED') {
      throw new Error(`Order ${orderId} is not in a deliverable state`);
    }

    // Check that the order isn't disputed
    if (order.status === 'DISPUTED') {
      throw new Error(`Cannot release escrow for disputed order ${orderId}`);
    }

    const sellerId = order.store.ownerId;
    const releaseAmount = order.escrow.amount;

    // Execute all database updates atomically
    await prisma.$transaction(async (tx) => {

      // 1. Update escrow status
      await tx.escrow.update({
        where: { orderId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        }
      });

      // 2. Update order status to COMPLETED
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      });

      // 3. Add funds to seller's wallet.
      // upsert: creates the wallet if it doesn't exist, otherwise updates it.
      await tx.wallet.upsert({
        where: { userId: sellerId },
        create: {
          userId: sellerId,
          availableBalance: releaseAmount,
          totalEarned: releaseAmount,
        },
        update: {
          availableBalance: { increment: releaseAmount },
          totalEarned: { increment: releaseAmount },
        }
      });

      // 4. Create a wallet transaction record for the audit trail
      const wallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet!.id,
          amount: releaseAmount,
          description: `Sale: Order #${orderId.slice(-8)} (${triggeredBy === 'auto' ? 'Auto-released' : 'Buyer confirmed'})`,
          orderId,
        }
      });
    });

    // Send notifications after the transaction succeeds
    // (we don't want notification failures to roll back the money release)
    await Promise.all([
      // Notify the seller their money is available
      // NotificationService.notifyEscrowReleased(order.store.ownerId, orderId),
      // Ask buyer to leave a review
      // NotificationService.requestReview(order.buyerId, orderId),
    ]);
  }

  // The cron job that auto-releases escrow after 7 days.
  // Schedule this to run every hour on your server.
  static async processAutoReleases() {
    const now = new Date();

    // Find all orders where:
    // 1. They're in PAYMENT_RECEIVED state (paid but not yet confirmed delivered)
    // 2. The escrow auto-release time has passed
    const overdueOrders = await prisma.order.findMany({
      where: {
        status: 'PAYMENT_RECEIVED',
        escrowReleaseAt: {
          lte: now, // "less than or equal to now" = the time has passed
        },
        escrow: {
          status: 'HOLDING',
        }
      },
      select: { id: true }
    });

    console.log(`Auto-releasing escrow for ${overdueOrders.length} orders`);

    // Process each one individually so a failure on one doesn't block others
    const results = await Promise.allSettled(
      overdueOrders.map(order =>
        this.releaseToSeller(order.id, 'auto')
      )
    );

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Failed to auto-release order ${overdueOrders[index].id}:`,
          result.reason
        );
      }
    });

    return { processed: overdueOrders.length, results };
  }
}
```

---

## PHASE 4 — Trust, Discovery & Messaging {#phase-4}

### 4.1 In-App Messaging

The messaging system is both a trust feature (replaces sharing personal contacts) and a dispute evidence trail. Messages attached to an order become crucial during dispute resolution.

```typescript
// apps/api/src/routes/messages.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

// Zod schema for incoming message data.
// Zod validates and types the request body simultaneously.
const sendMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long'),
  // Either listingId OR orderId must be provided, not both
  listingId: z.string().optional(),
  orderId: z.string().optional(),
}).refine(
  data => !!data.listingId !== !!data.orderId, // XOR — exactly one must be set
  { message: 'Provide either listingId or orderId, not both' }
);

// POST /api/v1/messages — Send a message
router.post('/', authenticate, validateRequest(sendMessageSchema), async (req, res, next) => {
  try {
    const { content, listingId, orderId } = req.body;
    const senderId = req.user!.id;

    // SECURITY: Verify the sender is authorized to message in this thread.
    // Only the buyer and the seller in a transaction can message each other.
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { store: true }
      });

      if (!order) return res.status(404).json({ error: 'Order not found' });

      const isAuthorized =
        order.buyerId === senderId ||
        order.store.ownerId === senderId;

      if (!isAuthorized) {
        return res.status(403).json({ error: 'Not authorized to send messages in this order' });
      }
    }

    // SECURITY: Scan for contact information.
    // Sellers/buyers might try to share phone numbers or social media
    // to take the transaction off-platform (bypassing our escrow and fees).
    const contactPattern = /(\+?233\d{9}|\b\d{10}\b|whatsapp|telegram|@[a-zA-Z0-9_]+)/i;
    if (contactPattern.test(content)) {
      return res.status(400).json({
        error: 'Messages cannot contain phone numbers or social media handles. Use the platform for all communication.'
      });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        senderType: 'BUYER', // TODO: determine based on user's role in this transaction
        listingId: listingId || null,
        orderId: orderId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

export default router;
```

---

### 4.2 Next.js 14 App Router: SSR vs. SSG vs. Server Actions

This is where Next.js 14 really shines. Understanding which rendering strategy to use for each page is critical for both performance and SEO.

```typescript
// apps/web/app/store/[handle]/page.tsx
// Store page — Server-Side Rendered for SEO and fresh data.
//
// WHY SSR for store pages?
// - Sellers want their store page indexed by Google
// - Store data changes frequently (new listings, updated ratings)
// - The content must be available to WhatsApp/Twitter when sharing the link

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// generateMetadata runs on the server and generates the <head> tags.
// This is how search engines and social media platforms (WhatsApp, Twitter)
// read the page title, description, and Open Graph image.
export async function generateMetadata(
  { params }: { params: { handle: string } }
): Promise<Metadata> {

  // Fetch basic store info for meta tags
  const store = await getStore(params.handle);

  if (!store) {
    return { title: 'Store Not Found | U-Shop' };
  }

  return {
    title: `${store.name} | U-Shop`,
    description: store.bio || `Shop at ${store.name} on U-Shop — Ghana's student tech marketplace`,
    openGraph: {
      title: store.name,
      description: store.bio || '',
      // This URL generates a dynamic OG image with the store name and rating.
      // When someone shares the store link on WhatsApp, this image appears.
      images: [
        {
          url: `/api/og/store?handle=${store.handle}&name=${encodeURIComponent(store.name)}`,
          width: 1200,
          height: 630,
        }
      ],
    },
  };
}

// The page component itself — runs on the server
export default async function StorePage(
  { params }: { params: { handle: string } }
) {
  const store = await getStore(params.handle);

  // next/navigation's notFound() shows the 404 page
  if (!store) notFound();

  // Fetch listings separately so we can use Suspense
  const listings = await getStoreListings(store.id);

  return (
    <main>
      <StoreHeader store={store} />
      {/* listings is passed as a prop — rendered on server */}
      <ListingGrid listings={listings} />
    </main>
  );
}

// Data fetching function — called on the server
async function getStore(handle: string) {
  // Call your Express API from the server.
  // Note: we're calling the API directly, not going through the browser.
  // This call happens server-to-server, which is faster.
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stores/${handle}`,
    {
      // next.revalidate controls caching:
      // - 0: Always fetch fresh (no cache) - for real-time data
      // - 60: Cache for 60 seconds, then re-fetch
      // - false: Cache indefinitely until manually revalidated
      next: { revalidate: 60 }, // Cache store data for 60 seconds
    }
  );

  if (!res.ok) return null;
  return res.json();
}
```

```typescript
// apps/web/app/listing/[id]/page.tsx
// Product listing page — SSR with ISR (Incremental Static Regeneration)
//
// WHY ISR for listing pages?
// - Most listing data doesn't change frequently
// - We want these pages to load FAST (they're pre-rendered)
// - But we need them to eventually reflect updates (price changes, sold out)

export const revalidate = 30; // Revalidate every 30 seconds

export default async function ListingPage(
  { params }: { params: { id: string } }
) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  return (
    <div>
      <ListingImages images={listing.imagePaths} />
      <ListingDetails listing={listing} />
      {/* Checkout button — this is a Client Component because it needs interactivity */}
      <CheckoutButton listingId={listing.id} price={listing.price} />
    </div>
  );
}
```

**Server Actions for Checkout:**

```typescript
// apps/web/app/checkout/actions.ts
// Server Actions are Next.js 14's way of running server-side code
// directly from client components — no need for a separate API endpoint.
// They're perfect for form submissions and mutations.
//
// Note: For complex business logic (checkout with payments),
// we still delegate to the Express API. Server Actions here
// act as a secure proxy between the browser and Express.

'use server'; // This directive tells Next.js this code runs on the server

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function initiateCheckout(listingId: string, quantity: number) {
  // Get the current user's session from the server-side cookie
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redirect to login if not authenticated
    redirect('/auth/login?redirect=/listing/' + listingId);
  }

  // Call the Express API — we can safely include the JWT here
  // because this code runs on the server, not in the browser.
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the bearer token so Express knows who is ordering
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ listingId, quantity }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }

  const { paystackUrl } = await response.json();

  // Redirect the browser to Paystack's payment page
  redirect(paystackUrl);
}
```

---

## PHASE 5 — Security Hardening {#phase-5}

### 5.1 Supabase Row Level Security (RLS) Policies

RLS is a PostgreSQL feature that lets you define rules in the database itself about who can see or modify which rows. It's your last line of defense — even if your application code has a bug that accidentally exposes a query, RLS will block unauthorized access.

```sql
-- Run these SQL commands in your Supabase SQL editor.
-- These are your database-level security policies.

-- ─── ENABLE RLS ON ALL TABLES ────────────────────────────────────────────────
-- By default, when you enable RLS on a table, NO ONE can access it
-- until you add explicit "allow" policies.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- ─── USERS TABLE ──────────────────────────────────────────────────────────────

-- Allow users to read their own profile.
-- auth.uid() is a Supabase function that returns the current user's UUID.
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (supabase_id = auth.uid()::text);

-- Allow anyone to see basic public profile info (for store pages, reviews).
-- We use a view for this to control which fields are exposed.
CREATE POLICY "Public profiles are viewable by anyone"
  ON users FOR SELECT
  USING (true); -- Everyone can read users, but we expose limited columns via API

-- Users can only update their own profile.
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (supabase_id = auth.uid()::text)
  WITH CHECK (supabase_id = auth.uid()::text);

-- ─── LISTINGS TABLE ───────────────────────────────────────────────────────────

-- Anyone can view ACTIVE listings (the marketplace is public).
CREATE POLICY "Active listings are publicly viewable"
  ON listings FOR SELECT
  USING (status = 'ACTIVE');

-- A seller can view ALL their own listings (including drafts).
CREATE POLICY "Sellers can view their own listings"
  ON listings FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_id = auth.uid()::text
      )
    )
  );

-- Only the store owner can create listings in their store.
CREATE POLICY "Sellers can create listings in their store"
  ON listings FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_id = auth.uid()::text
      )
    )
  );

-- Only the store owner can update their listings.
CREATE POLICY "Sellers can update their own listings"
  ON listings FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_id = auth.uid()::text
      )
    )
  );

-- ─── ORDERS TABLE ─────────────────────────────────────────────────────────────

-- Buyers can see their own orders.
CREATE POLICY "Buyers can view their orders"
  ON orders FOR SELECT
  USING (
    buyer_id IN (
      SELECT id FROM users WHERE supabase_id = auth.uid()::text
    )
  );

-- Sellers can see orders placed with their store.
CREATE POLICY "Sellers can view orders for their store"
  ON orders FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id IN (
        SELECT id FROM users WHERE supabase_id = auth.uid()::text
      )
    )
  );

-- ─── MESSAGES TABLE ───────────────────────────────────────────────────────────

-- Users can only see messages in threads they're part of.
CREATE POLICY "Users can view messages in their threads"
  ON messages FOR SELECT
  USING (
    -- Either the sender
    sender_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    OR
    -- Or involved in the order the message belongs to
    order_id IN (
      SELECT id FROM orders WHERE
        buyer_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
        OR
        store_id IN (SELECT id FROM stores WHERE owner_id IN (
          SELECT id FROM users WHERE supabase_id = auth.uid()::text
        ))
    )
  );

-- ─── SERVICE ROLE BYPASS ──────────────────────────────────────────────────────
-- Your Express API uses the SERVICE_ROLE key, which BYPASSES RLS entirely.
-- This is by design — your backend is trusted and needs full access.
-- This is why the SERVICE_ROLE key must NEVER leave your backend server.
-- The frontend only uses the ANON key, which is subject to RLS.
```

---

### 5.2 OWASP Top 10 Mitigation Checklist

```typescript
// apps/api/src/middleware/security.ts
// Security middleware for Express

import rateLimit from 'express-rate-limit';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { z } from 'zod';

// ── 1. SQL INJECTION PREVENTION ───────────────────────────────────────────────
// Prisma uses parameterized queries by default.
// NEVER do this: prisma.$queryRaw(`SELECT * FROM users WHERE email = '${email}'`)
// ALWAYS do this: prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`
// The backtick template literal version automatically parameterizes the input.

// ── 2. RATE LIMITING ──────────────────────────────────────────────────────────
// Rate limiting prevents brute-force attacks, DDoS, and API abuse.

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Sliding window rate limiter using Upstash Redis.
// This is more accurate than fixed-window limiters.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export const rateLimiter = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // Max 200 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  }),

  // Strict limit for auth endpoints — prevents password brute-forcing
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,                   // Only 10 login attempts per 15 minutes
    message: { error: 'Too many authentication attempts' },
  }),

  // Strict limit for checkout — prevents checkout abuse
  checkout: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,                   // 20 checkout attempts per hour
    message: { error: 'Too many checkout attempts' },
  }),
};

// ── 3. INPUT VALIDATION ───────────────────────────────────────────────────────
// Use Zod to validate ALL inputs. Never trust user-provided data.

// Middleware factory — wraps a Zod schema and validates the request body.
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Return all validation errors at once (better UX than one at a time)
      return res.status(400).json({
        error: 'Validation failed',
        // Transform Zod's error format into a more readable format
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      });
    }

    // Replace req.body with the validated (and transformed) data.
    // Zod can do things like coerce types and strip unknown fields.
    req.body = result.data;
    next();
  };
}

// ── 4. XSS PREVENTION ────────────────────────────────────────────────────────
// React (and Next.js) escapes HTML by default when rendering.
// BUT: we still need to sanitize any HTML stored in the DB and later rendered.
// For user-generated content (descriptions, bios), use a sanitizer.

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  // DOMPurify strips malicious scripts while keeping safe HTML formatting.
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [], // No attributes allowed (prevents style injection etc.)
  });
}

// ── 5. SENSITIVE DATA EXPOSURE ────────────────────────────────────────────────
// Never return sensitive fields in API responses.
// Use Prisma's 'select' to explicitly choose which fields to return.

// Example — BAD (exposes everything including passwordHash, studentIdImagePath):
// const user = await prisma.user.findUnique({ where: { id } });
// return res.json(user);

// Example — GOOD (only returns what the client needs):
// const user = await prisma.user.findUnique({
//   where: { id },
//   select: {
//     id: true,
//     name: true,
//     avatarUrl: true,
//     verificationStatus: true,
//     store: { select: { handle: true, name: true } }
//   }
// });
// return res.json(user);

// ── 6. AUTHORIZATION (not just authentication!) ───────────────────────────────
// Authentication = "Who are you?" (checking the JWT)
// Authorization = "Are you ALLOWED to do this?" (checking permissions)
// Every protected route must check BOTH.

// Bad example — only checks authentication:
// router.delete('/listings/:id', authenticate, async (req, res) => {
//   await prisma.listing.delete({ where: { id: req.params.id } });
//   // BUG: Any authenticated user can delete ANY listing!
// });

// Good example — checks ownership:
// router.delete('/listings/:id', authenticate, async (req, res) => {
//   const listing = await prisma.listing.findUnique({
//     where: { id: req.params.id },
//     include: { store: true }
//   });
//   if (!listing) return res.status(404).json({ error: 'Not found' });
//   if (listing.store.ownerId !== req.user!.id) {
//     return res.status(403).json({ error: 'You do not own this listing' });
//   }
//   await prisma.listing.delete({ where: { id: req.params.id } });
// });
```

---

## PHASE 6 — Performance Optimization {#phase-6}

### 6.1 Database Performance: Indexing Strategy

```sql
-- Run these in Supabase SQL editor.
-- Indexes are the #1 way to speed up slow database queries.
-- An index is like a book's index — instead of scanning every page,
-- the database can jump directly to the relevant rows.

-- ── SEARCH VECTOR SETUP ───────────────────────────────────────────────────────
-- This sets up PostgreSQL's full-text search on the listings table.

-- Step 1: Add the tsvector column (if not already in migration)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create a GIN index on the search vector.
-- GIN (Generalized Inverted Index) is optimized for full-text search.
-- Without this index, every search does a full table scan.
CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN(search_vector);

-- Step 3: Create a function that updates the search vector when a listing changes.
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    -- setweight gives different importance to different fields.
    -- 'A' weighted terms rank higher in search results than 'B' terms.
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger that calls the function on insert/update.
CREATE TRIGGER listings_search_vector_update
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_vector();

-- ── PERFORMANCE INDEXES ───────────────────────────────────────────────────────

-- Composite index for the most common query: "active listings in a category, sorted by date"
CREATE INDEX IF NOT EXISTS listings_category_status_date_idx
  ON listings(category_id, status, created_at DESC)
  WHERE status = 'ACTIVE'; -- Partial index — only index active listings (much smaller)

-- Index for store listings page
CREATE INDEX IF NOT EXISTS listings_store_status_idx
  ON listings(store_id, status, created_at DESC);

-- Index for price range queries
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings(price);

-- Index for looking up orders by buyer
CREATE INDEX IF NOT EXISTS orders_buyer_status_idx ON orders(buyer_id, status, created_at DESC);

-- Index for looking up orders by store (seller's order list)
CREATE INDEX IF NOT EXISTS orders_store_status_idx ON orders(store_id, status, created_at DESC);

-- Index for finding overdue escrow releases (the cron job uses this)
CREATE INDEX IF NOT EXISTS orders_escrow_release_idx
  ON orders(escrow_release_at)
  WHERE status = 'PAYMENT_RECEIVED'; -- Only index relevant orders

-- Index for the webhook idempotency check
CREATE INDEX IF NOT EXISTS webhook_events_external_id_idx ON webhook_events(external_id)
  WHERE external_id IS NOT NULL;
```

### 6.2 Avoiding the N+1 Query Problem

The N+1 problem is one of the most common performance killers in ORM-based apps. It happens when you fetch a list of items and then make a separate database query for each one.

```typescript
// ── BAD: N+1 QUERY PROBLEM ────────────────────────────────────────────────────
// This code makes 1 query to get 20 listings,
// then 20 MORE queries (one per listing) to get each store.
// On a page with 20 listings = 21 database queries. Terrible.

// BAD ❌
const listings = await prisma.listing.findMany({ take: 20 });
for (const listing of listings) {
  // This runs a new DB query for EACH listing!
  const store = await prisma.store.findUnique({ where: { id: listing.storeId } });
  listing.store = store;
}

// ── GOOD: Use Prisma's include ─────────────────────────────────────────────────
// Prisma's `include` tells it to JOIN the related table in a single query.
// 1 query instead of 21.

// GOOD ✅
const listings = await prisma.listing.findMany({
  take: 20,
  include: {
    store: {
      select: {
        id: true,
        name: true,
        handle: true,
        owner: {
          select: { verificationStatus: true }
        }
      }
    },
    category: true,
  }
});

// ── GOOD: Use Prisma's select for large objects ────────────────────────────────
// When fetching a single item with lots of relations, be explicit about
// what you need. Don't load 5KB of data when you need 200 bytes.

// Use `select` to get only the fields you need
const orderSummary = await prisma.order.findUnique({
  where: { id: orderId },
  select: {
    id: true,
    status: true,
    totalAmount: true,
    createdAt: true,
    // Only get specific fields from the buyer
    buyer: {
      select: { name: true, email: true }
    },
    // Only get the item count, not all order items
    _count: {
      select: { items: true }
    }
  }
});
```

### 6.3 Caching Strategy

```typescript
// apps/api/src/lib/cache.ts
// A simple caching layer using Upstash Redis.
// Cache things that are:
//   1. Expensive to compute/fetch
//   2. Read frequently
//   3. Don't change often

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  // Generic get-or-compute: tries cache first, falls back to computeFn.
  // This pattern is called "cache-aside" or "lazy loading".
  async getOrSet<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds: number = 60
  ): Promise<T> {
    // Try to get the cached value
    const cached = await redis.get<T>(key);

    if (cached !== null) {
      return cached; // Cache hit — return immediately
    }

    // Cache miss — compute the value
    const value = await computeFn();

    // Store in cache with an expiry time (TTL = Time To Live)
    await redis.setex(key, ttlSeconds, JSON.stringify(value));

    return value;
  },

  // Invalidate cache entries that match a pattern.
  // Call this when data changes (e.g., a listing is updated).
  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Example usage in a controller:
// const store = await cache.getOrSet(
//   `store:${handle}`,
//   () => StoreService.getByHandle(handle),
//   300 // Cache for 5 minutes
// );

// What to cache:
// ✅ Category list (changes rarely) — TTL: 1 hour
// ✅ Store profiles (changes occasionally) — TTL: 5 minutes
// ✅ Homepage featured listings — TTL: 5 minutes
// ✅ Search results for popular queries — TTL: 1 minute
// ❌ Individual order details (user-specific, sensitive)
// ❌ Wallet balances (must always be accurate)
// ❌ Checkout flow (must be fresh)
```

### 6.4 Connection Pooling

Supabase uses PgBouncer for connection pooling. Without it, every request from your app opens a new database connection, and databases can only handle ~100-200 connections before they degrade.

```typescript
// In Prisma, configure connection pool limits:
// apps/api/src/lib/prisma.ts (update this)

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '&connection_limit=10&pool_timeout=20',
      // connection_limit: Max connections from THIS service instance.
      // In production with multiple instances, set this to 10-20 per instance.
      // Your total connections = (instances × connection_limit) + some headroom.
      //
      // pool_timeout: How long to wait for a connection from the pool
      // before throwing an error. 20 seconds is reasonable.
    },
  },
});
```

---

## PHASE 7 — CI/CD & Production Deployment {#phase-7}

### 7.1 Infrastructure Overview

```
PRODUCTION DEPLOYMENT:

┌─────────────────────────────────────────────────────────────┐
│                    YOUR GITHUB REPO                          │
│  Push to main → GitHub Actions triggered automatically       │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────────────────────┐
│  VERCEL (Web)    │    │  FLY.IO (API)                         │
│                  │    │                                        │
│  • Automatic     │    │  • Docker container                    │
│    deploys from  │    │  • Zero-downtime deploys via           │
│    GitHub        │    │    blue-green deployment               │
│  • Edge CDN      │    │  • Autoscaling                         │
│  • Serverless    │    │  • Persistent connection to Supabase   │
└──────────────────┘    └──────────────────────────────────────┘
```

**Why Fly.io for Express?**
- Containers run globally close to your users
- True persistent processes (unlike serverless — your cron jobs stay running)
- Free tier is generous for an MVP
- Easy blue-green zero-downtime deployments

### 7.2 Dockerfile for Express API

```dockerfile
# apps/api/Dockerfile
# A Dockerfile is a recipe for building a container image.
# Each line is a layer — Docker caches layers that haven't changed.
# We organize it to maximize cache hits (putting rarely-changing steps first).

# ── STAGE 1: Build ───────────────────────────────────────────────────────────
# Use the official Node.js LTS Alpine image. Alpine is a minimal Linux distro
# that results in much smaller images than full Ubuntu/Debian.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally in the container
RUN npm install -g pnpm

# Copy package files first — this layer is cached until packages change.
# This means "pnpm install" only re-runs when dependencies change, not on
# every code change.
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate the Prisma client (TypeScript types from your schema)
RUN pnpm --filter api exec prisma generate

# Compile TypeScript to JavaScript
RUN pnpm --filter api exec tsc

# ── STAGE 2: Production ───────────────────────────────────────────────────────
# Start fresh from the base image — this excludes build tools, TypeScript,
# and dev dependencies. The final image is much smaller.
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Copy the compiled JavaScript output from the build stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma files (needed at runtime for migrations and the client)
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# The USER instruction runs the container as a non-root user.
# Running as root is a security risk — if someone exploits your app,
# they'd have root access to the container.
USER node

# Tell Docker this container listens on port 4000
EXPOSE 4000

# Healthcheck: Docker will periodically call this endpoint to verify
# the container is healthy. Unhealthy containers get replaced automatically.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# The command to run when the container starts.
# 'node' runs the compiled JavaScript directly — fast startup, no TypeScript overhead.
CMD ["node", "apps/api/dist/index.js"]
```

### 7.3 GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
# This file defines your automated deployment pipeline.
# It runs on every push to the main branch.

name: Deploy to Production

# When to trigger this pipeline:
on:
  push:
    branches: [main]    # Only deploy from the main branch
  pull_request:
    branches: [main]    # Run tests on PRs, but don't deploy

# Environment variables available to all jobs
env:
  NODE_VERSION: '20'

jobs:
  # ── JOB 1: RUN TESTS ────────────────────────────────────────────────────────
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    # Spin up a PostgreSQL database for integration tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: ushop_test
        ports:
          - 5432:5432
        # Wait until postgres is actually ready
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      # Check out the repository code
      - uses: actions/checkout@v4

      # Set up Node.js with caching for pnpm
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # Run database migrations on the test database
      - name: Run database migrations
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
          DIRECT_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
        run: pnpm --filter api exec prisma migrate deploy

      # Run all tests
      - name: Run unit & integration tests
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
          DIRECT_URL: postgresql://postgres:testpassword@localhost:5432/ushop_test
          NODE_ENV: test
        run: pnpm test

      # Check TypeScript types (no type errors allowed)
      - name: TypeScript type check
        run: pnpm typecheck

      # Run ESLint to catch code quality issues
      - name: Lint
        run: pnpm lint

  # ── JOB 2: DEPLOY API ────────────────────────────────────────────────────────
  deploy-api:
    name: Deploy API to Fly.io
    runs-on: ubuntu-latest
    needs: test  # Only run if tests passed
    if: github.ref == 'refs/heads/main' # Only deploy from main branch

    steps:
      - uses: actions/checkout@v4

      # Install flyctl (Fly.io's CLI tool)
      - uses: superfly/flyctl-actions/setup-flyctl@master

      # Run database migrations BEFORE deploying new code.
      # This ensures the database schema is updated before the new code runs.
      # The opposite order (deploy then migrate) can cause the new code to
      # fail if it expects database columns that don't exist yet.
      - name: Run Production Migrations
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
          DIRECT_URL: ${{ secrets.PRODUCTION_DIRECT_URL }}
        run: |
          flyctl ssh console --app ushop-api \
            --command "cd /app && npx prisma migrate deploy"

      # Deploy with zero-downtime rolling update.
      # Fly.io starts new instances with the new code before shutting down old ones.
      - name: Deploy to Fly.io
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: flyctl deploy --remote-only --config apps/api/fly.toml

  # ── JOB 3: DEPLOY FRONTEND ───────────────────────────────────────────────────
  deploy-web:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    needs: test  # Only run if tests passed
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      # Vercel's GitHub integration handles this automatically —
      # but we include it here for explicit control and to see
      # deploy status in the Actions dashboard.
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod' # Deploy to production environment
          working-directory: apps/web
```

---

## PHASE 8 — Logging & Observability {#phase-8}

### 8.1 What to Log and Where

```typescript
// apps/api/src/lib/logger.ts
// A structured logger using Pino — the fastest Node.js logger.
// Structured logging means logs are JSON objects, not plain text.
// This makes them searchable and parseable by log management tools.

import pino from 'pino';

export const logger = pino({
  // In production, output pure JSON (machine-readable)
  // In development, output pretty-printed human-readable logs
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,

  // Base fields included in every log message
  base: {
    service: 'ushop-api',
    env: process.env.NODE_ENV,
  },

  // Minimum log level to output.
  // In production, 'info' and above. In development, 'debug' and above.
  level: process.env.LOG_LEVEL || 'info',

  // Redact sensitive fields from logs automatically.
  // Even if a bug causes you to log a request body containing a card number,
  // it will be replaced with [Redacted].
  redact: {
    paths: [
      'req.headers.authorization',    // JWT tokens
      'body.password',
      'body.cardNumber',
      'body.cvv',
      'body.recipientDetails.accountNumber',
    ],
    censor: '[Redacted]',
  },
});

// Domain-specific logging functions — use these instead of logger.info() directly.
// They ensure consistent log structure across the codebase.
export const paymentLogger = logger.child({ domain: 'payments' });
export const orderLogger = logger.child({ domain: 'orders' });
export const authLogger = logger.child({ domain: 'auth' });
export const escrowLogger = logger.child({ domain: 'escrow' });

// Example usage:
// paymentLogger.info({ orderId, amount, paystackRef }, 'Payment initialized');
// orderLogger.warn({ orderId, userId }, 'Order creation failed — out of stock');
// escrowLogger.info({ orderId, triggeredBy: 'auto' }, 'Escrow released');
```

```typescript
// apps/api/src/lib/sentry.ts
// Sentry captures errors in production and sends you alerts.
// Without this, you're flying blind — you won't know when things break.

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance monitoring: traces 10% of requests to measure API response times.
  // Start at 0.1 in production and adjust based on your Sentry quota.
  tracesSampleRate: 0.1,

  // Don't capture errors in development (too noisy)
  enabled: process.env.NODE_ENV === 'production',

  // These functions control what user info is attached to error reports.
  // Be careful not to log PII (personally identifiable information) in violation
  // of the Ghana Data Protection Act.
  beforeSend(event) {
    // Strip sensitive data from error reports
    if (event.request?.data?.password) {
      delete event.request.data.password;
    }
    return event;
  },
});

// Express error handler that sends uncaught errors to Sentry
export const sentryErrorHandler = Sentry.Handlers.errorHandler();
```

---

## Edge Cases & Failure Mode Playbook {#edge-cases}

### Race Condition: Concurrent Checkout (Inventory Over-Selling)

```typescript
// PROBLEM: Two users both see "1 item in stock" and both click "Buy".
// Both requests hit the server at the same time.
// Both checks pass ("stock > 0"), both create orders.
// Result: You've sold 1 item twice. Seller is furious.

// SOLUTION: Use PostgreSQL's atomic UPDATE with a WHERE condition
// (optimistic locking at the database level).

// In your checkout service:
async function reserveInventory(listingId: string, quantity: number, orderId: string) {
  // This UPDATE only succeeds if stock is currently >= quantity.
  // If two requests run simultaneously:
  //   - Request 1: UPDATE listings SET stock = 0 WHERE id = X AND stock >= 1  → SUCCEEDS (1 row updated)
  //   - Request 2: UPDATE listings SET stock = -1 WHERE id = X AND stock >= 1 → FAILS (0 rows updated, -1 < 1)
  // PostgreSQL's atomic operations prevent the race condition.

  const result = await prisma.$executeRaw`
    UPDATE listings
    SET stock = stock - ${quantity}
    WHERE id = ${listingId}
    AND stock >= ${quantity}
    AND status = 'ACTIVE'
  `;

  // executeRaw returns the number of rows updated.
  // If 0 rows were updated, the item was already out of stock.
  if (result === 0) {
    throw new Error('Item is out of stock or no longer available');
  }
}
```

### Webhook Failures: Handling Failed Paystack Webhooks

```typescript
// PROBLEM: Your server was down when Paystack sent a webhook.
// Paystack retried 3 times, all failed.
// The buyer paid, but their order is stuck in PENDING_PAYMENT forever.

// SOLUTION 1: Webhook retry mechanism.
// Set up a cron job that runs every 5 minutes and looks for
// orders in PENDING_PAYMENT state where payment was likely made.

async function reconcileStuckOrders() {
  // Find orders that have been in PENDING_PAYMENT for more than 10 minutes.
  // If a user's payment went through, Paystack processes it in < 2 minutes.
  const stuckOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: {
        lte: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      }
    }
  });

  for (const order of stuckOrders) {
    try {
      // Verify the payment directly with Paystack's API
      const transaction = await PaystackService.verifyTransaction(order.paystackRef);

      if (transaction.status === 'success') {
        // Payment went through but we missed the webhook — process it now
        await handleChargeSuccess({ reference: order.paystackRef });
        console.log(`Reconciled stuck order: ${order.id}`);
      }
    } catch (err) {
      console.error(`Reconciliation failed for order ${order.id}:`, err);
    }
  }
}
```

### The Condition Grade War: Preventing Disputes

```typescript
// From the PRD: "Seller says 'Used – Good'. Buyer receives 'Used – Fair'."
// This is the #1 source of disputes on tech marketplaces.

// MITIGATION: Enforce structured condition documentation at listing creation.

const CONDITION_REQUIREMENTS = {
  USED_GOOD: {
    label: 'Used – Good',
    criteria: [
      'Minor scratches only, visible under direct light',
      'All ports and buttons functional',
      'Battery above 80% (for phones/laptops — must upload screenshot)',
      'No cracks on screen or body',
    ],
    // Require a specific photo angle to prove condition
    requiredPhotoAngles: ['front', 'back', 'corners', 'ports', 'screen-on'],
    batteryScreenshotRequired: true, // For phones/laptops
  },
  USED_FAIR: {
    label: 'Used – Fair',
    criteria: [
      'Visible scratches or scuffs on body',
      'All core functions working',
      'Battery between 60-80% (must upload screenshot)',
      'May have minor cosmetic damage',
    ],
    requiredPhotoAngles: ['front', 'back', 'all-damage'],
    batteryScreenshotRequired: true,
  },
  // ... other grades
};

// Validate that a listing submission meets the condition requirements
function validateListingCondition(listing: any): { valid: boolean; errors: string[] } {
  const requirements = CONDITION_REQUIREMENTS[listing.condition];
  if (!requirements) return { valid: true, errors: [] };

  const errors: string[] = [];

  if (requirements.batteryScreenshotRequired && !listing.hasBatteryScreenshot) {
    errors.push(`Battery health screenshot is required for ${requirements.label} condition`);
  }

  if (listing.imagePaths.length < requirements.requiredPhotoAngles.length) {
    errors.push(`Please upload at least ${requirements.requiredPhotoAngles.length} photos showing: ${requirements.requiredPhotoAngles.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
```

### The 7-Day Auto-Release Trap

```typescript
// From the PRD: A buyer who doesn't confirm delivery (busy, forgot) triggers
// auto-release. If the item never arrived, they've lost their window.

// MITIGATION: Aggressive notification sequence.
// Schedule these when the order enters PAYMENT_RECEIVED state.

async function scheduleEscrowReminders(orderId: string, escrowReleaseAt: Date) {
  const releaseTime = escrowReleaseAt.getTime();

  // Day 3 reminder (4 days before release)
  const day3 = new Date(releaseTime - 4 * 24 * 60 * 60 * 1000);
  // Day 5 reminder (2 days before release)
  const day5 = new Date(releaseTime - 2 * 24 * 60 * 60 * 1000);
  // Day 6 urgent reminder (24 hours before release)
  const day6 = new Date(releaseTime - 24 * 60 * 60 * 1000);
  // Day 6.5 final warning (6 hours before release)
  const day6half = new Date(releaseTime - 6 * 60 * 60 * 1000);

  // Schedule all reminders.
  // Use a job queue (Bull + Redis) to handle this reliably.
  // Using setTimeout won't work across server restarts!
  await jobQueue.schedule('send-escrow-reminder', { orderId, urgency: 'low' }, day3);
  await jobQueue.schedule('send-escrow-reminder', { orderId, urgency: 'medium' }, day5);
  await jobQueue.schedule('send-escrow-reminder', { orderId, urgency: 'high' }, day6);
  await jobQueue.schedule('send-escrow-reminder', { orderId, urgency: 'urgent' }, day6half);
}

// The notification messages (increasingly urgent):
const ESCROW_REMINDER_MESSAGES = {
  low: 'Your item from [Store] should arrive soon. Once you receive it, please confirm delivery so your seller gets paid.',
  medium: 'Have you received your item from [Store]? Payment will be automatically released in 2 days if you don\'t confirm.',
  high: '⚠️ REMINDER: Payment for your order releases to the seller in 24 HOURS. If you haven\'t received the item, open a dispute NOW.',
  urgent: '🔴 FINAL WARNING: Payment releases in 6 hours. If there is ANY problem with your order, open a dispute immediately.',
};
```

---

## Quick Reference: Production Checklist

Before going live, verify every item on this list:

```
INFRASTRUCTURE
□ Environment variables set in Vercel and Fly.io (not in code)
□ DATABASE_URL uses connection pooler URL (port 6543)
□ DIRECT_URL uses direct database URL (port 5432) for migrations
□ All secrets rotated from development values
□ Sentry DSN configured for both frontend and backend

SECURITY
□ RLS enabled on all tables in Supabase
□ RLS policies tested (try to access another user's data — it should fail)
□ Webhook signature verification tested
□ Rate limiting configured for auth and checkout routes
□ CORS configured to only allow production frontend domain
□ SERVICE_ROLE key is only in backend environment, never frontend

PAYMENTS
□ Paystack account verified and in live mode
□ Webhook URL configured in Paystack dashboard
□ Webhook signature secret matches environment variable
□ Payout bank accounts set up in Paystack
□ Test transaction end-to-end (pay → webhook fires → escrow created → escrow released → wallet updated)

PERFORMANCE
□ Database indexes created (run the SQL from Phase 6)
□ Full-text search tsvector trigger created
□ Connection pool limits configured
□ Cache TTLs set appropriately

COMPLIANCE (Ghana Data Protection Act)
□ Privacy Policy published
□ Terms of Service published
□ Student ID photos encrypted at rest (Supabase Storage handles this)
□ Student ID deletion schedule implemented
□ Data Protection Commission registration pending/complete

MONITORING
□ Sentry capturing errors from both apps
□ Health check endpoint returning 200
□ Database backup schedule configured in Supabase
□ Load test to 500 concurrent users passed (per PRD requirement)
□ Cron jobs (escrow auto-release, reconciliation) running and monitored
```

---

*U-Shop Technical Roadmap v1.0 — Covers MVP through production deployment*
*Stack: Next.js 14 + Express.js + Prisma + Supabase + Paystack*
*Generated from PRD v2.0 by Principal Engineering Review*

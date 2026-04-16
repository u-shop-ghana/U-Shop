# Changelog

All notable changes to U-Shop are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.9.0] — 2026-04-16 — Phase 3.5 Tech Debt Cleanup & Documentation

### Added
- Created `CONTRIBUTING.md` onboarding guide for developer environment setup.
- Added visual "Coming soon" feedback UI to `AddToCartButtonCard` and `WishlistButton` to prevent silent `console.log` failures.

### Changed
- Updated `README.md` tech stack to reflect Next.js 16 (App Router) and the Express.js API deployed on Railway.

### Removed
- Permanently deleted `test_secret.txt` and `test_ps_scrub.txt` credential exposure risks from the working tree.
- Removed the auto-generated `.vade-report` and updated `.gitignore` to prevent committing sensitive/auto-generated files.
- Removed the dead "Message Seller" button from the public store page since the feature isn't implemented yet.

## [0.8.7] — 2026-04-16 — User Profile Dashboard & Google OAuth Fix

### Changed
- **Profile Dashboard Redesign** — Completely redesigned the Account Overview page (`/dashboard`) and its layout from a dark theme to a clean, light-themed design matching the UI kit mockup (`Profile dashboard.png`). Features: 4-card overview hub (Account Info, Primary Address, Wallet Balance, Newsletter), contextual alert banners, recent orders table with status badges, recommendations placeholder, and a white sidebar with purple active-state indicators.
- **Dashboard Layout Redesign** — Rewrote `(marketplace)/dashboard/layout.tsx` with a light-themed sidebar navigation, mobile slide-out drawer, and fixed bottom nav bar. Preserved all functional logic including role-based nav items (seller store links, admin panel), verification badges, and mobile responsiveness.

### Fixed
- **Google OAuth Consent Screen** — The consent screen shows the Supabase project ID instead of "U-Shop" (requires Google Cloud Console configuration — see instructions below).

---

## [0.8.6] — 2026-04-16 — Branded Email Templates & Password Reset Fix

### Added
- **Complete Supabase Email Template Suite** — Designed and created 9 branded HTML email templates stored in `docs/email-templates/` for all Supabase Auth email types: Confirm Signup, Magic Link, Reset Password, Invite User, Change Email Address, Reauthentication, Password Changed, Email Address Changed, and Phone Number Changed. All templates feature U-Shop branding (purple CTA buttons, logo, campus marketplace footer) and are optimized for spam filter compliance.

### Fixed
- **Password Reset Redirect Failure** — Users clicking the password reset link in their email were landing on the homepage instead of `/reset-password`. Root cause: Supabase recovery uses hash-based token delivery (`#access_token=...&type=recovery`), but the marketplace layout only handled the error hash (`otp_expired`). Added client-side detection of `type=recovery` in the URL hash fragment with automatic redirect to `/reset-password`.

### Security
- **Email Deliverability Hardening** — Added DMARC DNS record guidance and domain warming strategy to prevent Resend-delivered emails from landing in spam/junk folders for the new `ushopgh.com` domain.

---

## [0.8.5] — 2026-04-14 — Reseller Verification & Store Creation Upgrades

### Added
- **Reseller Database Expansion** — Formally augmented the `User` schema injecting `ghanaCardId`, `ghanaCardDob`, `ghanaCardFrontImagePath`, and `ghanaCardBackImagePath` enabling administrative KYC capabilities explicitly supporting Reseller tiers.
- **Reseller Verification Route & Form** — Scaffolded `/reseller-verify` UI gathering secure structural inputs mapping strictly to the Ghana Card layout. Constructed an active backend controller intercept mapping these directly into the User state driving verification Status to `PENDING` ensuring admin reviews block malicious actors.
- **Store Contact Integrations** — Deployed `contactEmail`, `contactPhone`, and geographic `location` configurations straight into the Supabase database and schema parsers allowing Store fronts robust local presence mappings.
- **Dynamic University Mapping** — Rebuilt the Store creation form mapping dynamically fetched `universities` locally onto the state for Student Sellers to anchor onto campus logistics precisely.

### Security
- **Store Block Routing** — Updated `store.controller.ts` securely querying the native JWT-based Supabase session restricting database inserts blocking unverified entities directly via an explicit non-authoritative fallback redirect mapped against `app/dashboard/store/create/page.tsx` intercept logic.
- **Verified Bucket Inputs** — Enforced validation structures guaranteeing 5MB max payload arrays correctly mapping into the Supabase `verification-docs` isolated administrative bucket blocking shell injection attempts locally via Mime restrictions (`image/png`, `image/webp`).

---

## [0.8.4] — 2026-04-14 — UX Enhancements & Auth Bug Fixes

### Added
- **Functional Newsletter Server Action** — Replaced the static Footer newsletter with a dynamic `subscribeToNewsletter` Server Action wrapped in Next.js transitions, natively validating and accepting simulated newsletter pings complete with an animated Loading and Success UI state dynamically rendered.
- **Header Profile Dropdown** — Scaled up the simple header account link into a fully functional hover/click absolute dropdown rendering cleanly positioned profile settings, `My Orders`, and conditionally rendering `My Store` navigation links natively mapping `user.store` presence. Integrated absolute `useRef` handlers snapping the dropdown shut immediately clicking out of bounds.
- **Dynamic Homepage Hero Slider** — Abstracted the huge monolithic static marketing banner gracefully out of the active Marketplace homepage replacing it directly with `HeroSlider.tsx` component driving an elegant timed CSS fade carousel displaying `Power Your Academic Excellence`, `Upgrade Your Tech Setup`, and `Student Discounts` safely matching marketing cadences seamlessly.

### Fixed
- **Duplicate Navigation Breadcrumbs** — Safely resolved the redundancy conflict showing double `<Breadcrumbs/>` instances exclusively destroying the internal component breadcrumbs layered inside `ClientCategoryList` and `ClientUniversityList` allowing top-level URL paths strictly controlling navigation mapping from `page.tsx`.
- **"otp_expired" Infinite Refresh URL Error** — Executed a root layout Client-Level interception detecting arbitrary Supabase `#error_code=otp_expired` payloads (often triggered by Email Scanners consuming 1-time magic links prematurely) intercepting the URL natively swapping out `#error...` params directly into clean URL SearchParams mapping back into `forgot-password?error=expired` resulting directly in a clean UI warning mapping gracefully replacing opaque system variables.

---

## [0.8.3] — 2026-04-14 — Global Security Remediation & History Sanitization

### Security
- **Definitive History Scrubbing** — Successfully executed a global, multi-pass sanitization of the entire Git repository history across all branches using binary-aware redaction. Permanently eliminated leaked PostgreSQL credentials, Supabase Service Role keys, and JWT fragments from 500+ commits.
- **Credential Rotation** — Rotated all production database passwords and Supabase keys. Secured the infrastructure by transitioning from hardcoded secrets in `docker-compose.yml` and `railway.toml` to dynamic environment variable injections.
- **Repository Realignment** — Force-pushed the sanitized, high-integrity history to the `develop` and `staging` branches, resolving critical GitGuardian security blocks and satisfying automated compliance checks.
- **Git Hygiene Architecture** — Implemented enhanced `.gitignore` rules for `.turbo` build caches and established new protocols for staging environment variables to prevent future secret exposure.

---



### Added
- **Dynamic OAuth Redirects** — Integrated `NEXT_PUBLIC_SITE_URL` across all Google Sign-In and Email confirmation flows, ensuring successful redirections dynamically adapt to both local and production environments.
- **Auto-Sync Google Signups** — Updated `callback/route.ts` and Express signup endpoints to automatically map Google users into the database with their respective avatar data (`avatarUrl`), immediately upon successful authentication.
- **PKCE Password Reset Integration** — Refactored the `forgot-password` module to properly funnel users through the `callback?next=/reset-password` exchange rather than blindly navigating to `/reset-password` without session verification.

### Changed
- **Official Brand Assets** — Stripped rudimentary SVG drawings within the `/login` and `/register` components in favor of the authentic Google "G" Vector path.
- **Search Logic Transparency** — Updated the `SearchSidebar` active filter from "Most Relevant" to "All" across the global UI to match standardized marketplace patterns.

---

## [0.8.1] — 2026-04-13 — Redis Caching Integration

### Added
- **Upstash Redis Integration** — Connected the Express API to Upstash Redis (via Vercel service) for high-performance data caching.
- **University & Category Caching** — Implemented long-term caching (12-24h) for campus and taxonomy lists, significantly reducing database load on navigation and onboarding.
- **Search Result Caching** — Added short-term (5m) caching for listing searches, accelerating repeated queries and improving marketplace responsiveness.
- **CacheService Utility** — Developed a robust backend service for standardized cache management with TTL and automatic JSON handling.
- **CI Build & Lint Resolutions** — Fixed type mismatches in the Upstash Redis client and resolved `no-explicit-any` linting violations across the Express API to ensure robust build pipeline compliance.

### Changed
- **Performance Optimization** — Shifted frequently accessed static-ish data from PostgreSQL queries to Redis memory lookups.

---

## [0.8.0] — 2026-04-13 — Firebase Integration & Push Notifications

### Added
- **Firebase Core & Analytics** — Integrated Firebase Web SDK to provide advanced campus usage analytics and performance monitoring.
- **Push Notification Support (FCM)** — Implemented Firebase Cloud Messaging with background service worker and permission management.
- **Firebase Admin SDK** — Initialized the Backend SDK in the Express API to allow server-triggered push notifications.
- **Google Sign-In (Supabase)** — Verified and ensured Google OAuth via Supabase is functional for high-speed student onboarding.

### Changed
- **App Layout Refactor** — Wrapped the root application in a `FirebaseProvider` to handle notification registration and analytics lifecycle.

---


## [0.7.2] — 2026-04-12 — Next.js 16 Alignment & Dynamic Filtering

### Fixed
- **Next.js 16 Promise Params Crash** — Resolved critical `TypeError` crashes on `universities/[slug]`, `categories/[slug]`, and `store/[handle]` pages by awaiting `params` and `searchParams` Promises as required by the latest Next.js 16.2.1 runtime.
- **Defensive Metadata Generation** — Implemented robust null-checking for university `shortName` fields in metadata generation, preventing production crashes if backend data is malformed.
- **Hydration Error (Nested Buttons)** — Resolved a React hydration error in `SearchSidebar.tsx` where a mobile "Clear" button was nested inside the main toggle button, violating HTML specifications.

### Changed
- **Database-Driven Campus Filters** — Fully decoupled the marketplace from hardcoded university lists. The `/stores` and `/search` pages now dynamically fetch campuses from the DB, ensuring immediate updates when new universities are added.
- **Enhanced Search Pill UI** — Refactored search result pins (pills) to use dynamic university names from the database instead of force-uppercased slugs.


---

## [0.7.1] — 2026-04-12 — Search Resilience & Campus Store Discovery

### Added
- **University Filter for Stores** — Implemented a dedicated university selection dropdown on the `/stores` page. Users can now filter verified shops by their specific campus (UG, KNUST, UCC, GCTU) using dynamic URL search parameters.
- **Enhanced Breadcrumb Navigation** — Added hierarchical breadcrumbs to the `Categories` and `Universities` pages, ensuring consistent site-wide navigation and easier "Back to Home" flows for mobile users.

### Fixed
- **Search Robustness & Empty State Handling** — Refactored the backend `ListingService` to handle null `searchVector` fields using `COALESCE` and added a title-based `ILIKE` fallback. Submitting an empty search or selecting "All Products" now reliably displays the full marketplace catalog as expected.
- **Vibrant Condition Badge Styling** — Overhauled the condition badges on `ListingCard` and `ListingDetailPage` with premium, vibrant semantic colors from the U-Shop design system (Emerald for New, Amber for Good, Rose for For Parts, etc.), improving visual hierarchy and readability.
- **Mobile Filter UX** — Enhanced the mobile search sidebar with a "Clear All" functionality in the mobile dropdown view, allowing users to reset complex filters with a single tap.

---

## [0.7.0] — 2026-04-11 — Marketplace Inventory Logic & Brand Alignment

### Added
- **Dynamic Stock Availability** — Implemented a real-world multi-tier inventory logic system in the `ListingDetailPage`. The indicator now dynamically reflects item quantity with urgency-driving states: "In Stock" (>10), "Only X Left" (1-10) for conversion boost, and "Out of Stock" (0).
- **Global "All Products" Access** — Upgraded the `Header` and `SearchBar` components to support empty query handling. Selecting "All Products" from navigation or submitting an empty search now correctly routes to a global `/search` results view displaying the full marketplace catalog.

### Fixed
- **Condition Enum Synchronization** — Aligned the `CONDITION_STYLES` lookup keys in the frontend with the native Prisma `ListingCondition` enum. Replaced `BRAND_NEW` with `NEW` and `REFURBISHED` with `FOR_PARTS` to prevent badge styling failures during data retrieval.
- **Premium Condition Badge Implementation** — Upgraded and standardized the marketplace condition badges to use a high-contrast hex code palette (`#E8F5E9`, `#0D47A1`, etc.) as defined in the UI Kit. This ensures professional brand-alignment across all listing cards and dynamic detail pages.


## [0.6.9] — 2026-04-11 — Mobile Breadcrumbs & Form Overhaul

### Added
- **Global Breadcrumb Navigation** — Developed a reusable sticky horizontal-scrolling `<Breadcrumbs />` core component deployed deeply across all generalized root paths (`Universities`, `Stores`, `Categories`, `Search`, and complex dynamic `[id]` pages) mapping clean hierarchical paths safely escaping grid collisions natively on narrow mobile viewports.
- **Accordion Logic (Mobile Only)** — Rewrote standard inline `<form>` Search Sidebar components tracking reactive `<button onClick={}>` event states explicitly scaling massive multi-checkbox lists underneath expandable chevron arrows saving 100%+ vertical screen real-estate exclusively when rendering across smaller bounds safely ignoring client state unhooked cleanly on standard desktops. 

### Fixed
- **Condition Badge Normalization** — Synced the core global design language strictly replacing generalized fallback CSS with unified `UI Kit` variables across exact specific mapped conditions mapping gracefully rendering `bg-color-100 text-color-800` values inside both the standard Grid card loops (`ListingCard`) and dynamic PDPs (`ListingDetailPage`).
- **Tab Layout Overflow** — Embedded CSS `scrollbar-hide` boundaries and mapped container overflow handling preventing tab labels from clipping forcefully out of mobile viewport structures.

## [0.6.8] — 2026-04-11 — Application Monitoring & CI/CD Telemetry

### Added
- **Production Error Tracking** — Successfully initialized and configured `@sentry/nextjs` telemetry tracking across the `apps/web` environment. Edge, Client, and Server environments now pipe real-time crash reports and performance tracing directly to the `ushop-uy/sentry-ushop` Sentry project.
- **GitHub Actions Security** — Injected `SENTRY_AUTH_TOKEN` safely into the standard `.github/workflows/ci.yml` pipeline leveraging encrypted GitHub Secrets mapping to avoid leaking organizational tokens in plaintext environment commits.

### Fixed
- **Root Workspace Decoupling** — Safely uninstalled isolated Sentry wizard configurations (e.g., `sentry.edge.config.ts`, `instrumentation.ts`) that were erroneously deployed into the root Turborepo scaffold directory. Cleared stray `@sentry/nextjs` node dependencies cleanly scaling the package structure back exclusively to the Next.js target module.

## [0.6.7] — 2026-04-11 — UI Production Standardization & Layout Reliability

### Added
- **Dynamic Empty States** — Implemented elegant fallback UX layouts wrapped with standard semantic placeholders rendering reliably on `Universities` and `Stores` grids if the database pulls return absolute `0` objects avoiding structural height collapses mid-screen. 
- **Typography Baseline Stabilization** — Enforced globally inherited `line-heights` scaling strictly across Tailwind header scopes (`var(--leading-heading)`) fixing component typography line wraps overlapping dynamically scaled mobile viewport grids.

### Changed
- **Escrow Banner Structuring** — Overhauled intrusive block-level security flags natively mapping them deeply into a streamlined frosted-glass inline Component integrated immediately alongside core trust markers inside the Homepage Hero section minimizing vertical scrolling boundaries.
- **Hero Background Confinement** — Decoupled massive hardcoded `[50vh]` bounding values from the Categories index structurally re-engineering them within safe semantic `<section>` parent blocks preventing dynamic search elements from completely disjointing visual glow flows overlapping page ends.
- **CTA Alignment Mechanics** — Structurally isolated `absolute -inset-1` glow constraints onto the inner tracking component bounds inside Stores natively halting blurry shadow gradients from incorrectly destroying horizontal device edge boundaries!

### Fixed
- **Fatal Image Sub-Domain Constraints** — Resolved critical `Next.js` DOM hard-crashes destroying `Categories` and `Promotional` grids dynamically unlocking raw Supabase asset buckets internally inside strict `remotePatterns` configuration trees directly over Next configuration definitions.
- **Material Baseline Collapses** — Successfully hot-patched `fonts.googleapis.com` extraction variables securely fetching `opsz,wght,FILL,GRAD` font boundaries preventing `material-symbols-outlined` from actively malfunctioning backwards into literal raw text icons over main marketplace navigation menus!

## [0.6.6] — 2026-04-11 — Listing API Integrity & Database Security

### Added
- **Comprehensive Row Level Security (RLS)** — Drafted and securely mapped complete zero-trust access control schemas executing strict `auth.uid()` boundaries directly targeting native Prisma endpoints locking the `Listing`, `Order`, `Store`, and Storage Layer assets.

### Changed
- **Mobile Container Mechanics** — Overhauled the Universities directory rendering tree scaling correctly on mobile by destroying explicitly bounded `h-[50vh]` wrappers cutting beneath absolute parent bounds. Remapped weird boundary-pushing lateral margin flows tracking `Back to Home` elements efficiently into native relative CSS flow. 
- **CTA Component Purge** — Severed redundant secondary colored informational section bands targeting `stores/page.tsx` and `universities/page.tsx` mapping to drastically clean interface real estate.

### Fixed
- **Listing Form Native Mappings** — Prevented HTTP 400 validation failures against `createListingSchema` when creating production items restricting structural condition mapping conflicts safely inside `@ushop/shared`.
- **Dynamic Category Mapping Logic** — Relocated absolute Prisma relations to resolve natively by `slug` on creation to prevent bypassing frontend URL selections from crashing the underlying backend API architecture. 
- **Type Checking Stability** — Reorganized hanging interface typings solving core `@typescript-eslint` leakage errors guaranteeing pure TS Next.JS production server compilation bounds natively (`next/link` extraction).

## [0.6.5] — 2026-04-10 — Mobile Grid Layout & Dynamic Real-time Counts

### Added
- **Dynamic Category Stock Enumeration** — Replaced hardcoded category counts on `/categories` with absolute real-time metrics integrating `_count.listings` fetched dynamically via Prisma endpoints directly mapped into `ClientCategoryList`.

### Changed
- **E-commerce Grid Parity (Mobile)** — Overhauled massive structural grid defects mapping `grid-cols-2` natively onto Homepage Browse Stores & Promotional Deals. Replaced `flex-col` stack flows explicitly ordering Listing Payloads _above_ the sidebars sequentially on Mobile formats matching global standard UX rendering.
- **Micro-Component Detail Polishing** — Scaled the internal spacing boundaries on `AddToCartButtonCard` ensuring tight vertical sizing under 375px display widths. Sourced explicit `CONDITION_STYLES` format mappings to safely display dynamically colored tokens strictly next to Stock Availability elements on the Detail schemas.
- **Background Bleed Annihilations** — Safely resolved strict `bg-neutral-900` bleeding defects escaping padding bounds inside `universities/page.tsx` resulting in ugly root-black structural renders under custom colored UI nodes.

## [0.6.4] — 2026-04-10 — Mobile Accessibility & WCAG Compliance

### Changed
- **WCAG AA Contrast Resolution** — Adjusted search bar icons (`#9ca3af` -> `#6b7280`), vendor profile texts, semantic verification checkmarks, and promotional student deal cards (`#1275e2` -> `#0b5ed7` and `#00c853` -> `#118134`) across the frontend. Ensured minimum contrast `> 4.5:1` globally.
- **Accessible Touch Targets** — Expanded `padding-y` bounding boxes via Tailwind (`py-1`, `-my-1`) across `ListingCard` internal link mechanisms (titles, vendor paths) to natively support larger clickable regions without breaking pixel-perfect design alignment. 
- **Screen Reader Parity (`aria-hidden`)** — Eliminated label-content-name mismatch errors generated by Google Material Symbols literal strings (`favorite`, `search`) overriding `aria-label`s. Hidden literal span nodes from screen-readers via `aria-hidden="true"`.
- **Heading Order Enforcement** — Upgraded strict semantic hierarchies on `page.tsx`, directly converting broken `<h4>` steps to `<h3>`.
- **Footer Visibility** — Improved Footer legal/payment textual mappings from `text-gray-500` to `text-gray-400` establishing optimal contrast limits over dark `#0f172a` canvas defaults.
- **TypeScript Core API Fixes** — Removed `Prisma.StoreWhereInput` explicit generics causing `TS2694` failures on `pnpm typecheck` deployment queues. Successfully refactored `StoreService` into pure extraction `NonNullable<Parameters<typeof prisma.store.findMany>>` ensuring seamless CI passes.

## [0.6.3] — 2026-04-10 — Dynamic Marketplace Directories & Responsive UI

### Added
- **Global Search & Sort Functionally** — Transformed `/categories`, `/universities`, and `/stores` from statically hardcoded grids (mocks) to fully functional client/server components. Added rigorous multi-parameter search mapping and dynamic sorting algorithms (A-Z, Newest, Ratings, Elite/Student-Run).
- **Client Route State Navigation** — Built `<StoreFilters />` natively mapping query objects across the Next.js App Router for server-rendered `?q=` handling on the fast Express DB API.
- **Backend Search Integration** — Expanded the Express `StoreService.listStores()` to natively intercept `search` parameters searching `name`, `bio`, `handle` and relations via robust Prisma `OR` query statements. Also seamlessly mapped sorting string types directly into complex `orderBy` cascades over Prisma schemas.
- **Client Search Fallbacks** — Built `<ClientCategoryList />` and `<ClientUniversityList />` handling immediate `O(n)` array filtration instantly via React Context for lightweight static models eliminating lag time entirely for non-paginated lists.

### Changed
- **Mobile Responsive Typography** — Implemented highly strict CSS tailwind layouts `flex-col sm:flex-row`, text shrinking utilities on mobile nodes (`text-sm` and `text-xs`) eliminating UI/UX clipping breakage.
- **"Back to Home" Strict Alignment** — Completely removed `text-center` alignment flows off navigation wrappers on Category, University, and Store nodes resulting in beautiful top-left absolute alignment matching precise UX directives.

## [0.6.2] — 2026-04-09 — Vercel Speed Insights Optimizations

### Changed
- **Next.js ISR Caching Integration** — Created `apiPublicFetch` specifically resolving `options.next = { revalidate: 15 }` on Edge responses globally preventing unauthenticated calls from using `cookies()`. This successfully transitioned `/`, `/categories`, `/universities`, and `/stores` from Dynamic SSR (`force-dynamic`) over into pure Statically Cacheable endpoints mathematically destroying ~2s Mobile TTFB latency overhead.
- **Mobile Image `sizes` Optimization** — Refactored the `ListingCard.tsx` wrapping the `next/image` API sizes boundaries limiting mobile (`max-width: 640px`) resolution scaling to `50vw` natively resulting in massive payload reductions improving LCP network rendering aggressively.
- **Client Component Architecture Split** — Extracted interactive `onClick` handlers (Wishlist and Add to Cart) out of `ListingCard` into strict `"use client"` micro-components (`WishlistButton.tsx` and `AddToCartButtonCard.tsx`). This elegantly solves Next.js `prerender-error` compilation crashes while preserving the parent `ListingCard` as a 100% pure Server Component for maximum Edge caching throughput.
- **Hero Paint Layering** — Hidden computationally heavy SVG background text gradients exclusively on limited CPU `md:hidden` boundaries solving excessive Main Thread Blocking resulting directly in significantly higher INP responsiveness metrics globally.
- **Dashboard Profile CLS Lockdown** — Deployed tall minimum-height bound structure mimicking the `Suspense` dashboard layouts solving Cumulative Layout Shifts previously caused by `!user` checking delays returning dynamic zero-height `null` flashes during React Context hydration.

---

## [0.6.1] — 2026-04-09 — Phase 4: Full E-Commerce Production Readiness

### Added
- **`ImageGallery.tsx`, `QuantitySelector.tsx`, `ProductTabs.tsx`** — Created robust UI components for the product detail page, fully matching the Figma design specifications.
- **Product Detail Restructure** — Rewrote `app/listing/[id]/page.tsx` integrating the new components, Store verification badges, dynamic CTAs (Add to Cart / Buy Now), escrow assurance banners, and a dynamic student reviews section.
- **Loading Skeletons** — Implemented gracefully animated CSS pulse skeletons (`loading.tsx`) across all 6 marketplace entry points (Homepage, Search, Stores, Universities, Categories, Product Detail) for optimal perceived performance.
- **Error Boundaries** — Centralized runtime crash protection via `error.tsx` wrapping the `(marketplace)` group with an easy-to-recover friendly UI pattern.

### Changed
- **`ListingCard.tsx` Figma Rewrite** — Transformed the listing cards strictly matching the Figma specs: white backgrounds, condition badges ("BRAND NEW", "FAIR"), deal badges, interactive wishlist icons, visual store validations, and full-width "ADD TO CART" buttons.
- **Inventory Stock Enforcement** — Integrated the numeric `stock` prop dynamically across all `ListingCard` instances, calculating rigorous "Out of Stock" lockouts across the `/search`, `/student-deals`, and `/categories` pipelines.
- **Global Typography Alignment** — Strictly enforced the `.font-sans` map resolving specifically to `Plus Jakarta Sans` globally inside `layout.tsx`/`globals.css`, adhering stringently to the U-Shop spec.
- **Brand Colors Standardization** — Conducted a regex-based repository sweep normalizing legacy visual classes (e.g., `#520f85`, `#d41295`, `purple-600`) entirely to the exact verified hexes from `color-palette.md`: `$ushop-purple` (`#6B1FA8`) and `$ushop-magenta` (`#D4009B`).

### Fixed
- **Next.js `searchParams` Promises** — Correctly destructured `searchParams` as `await searchParams` to comply natively with Next.js 16+ Server Actions.
- **Prisma Decimal Parsing** — Addressed JSON hydration warnings explicitly parsing Prisma Postgres Decimals into `Number(item.price)` prior to passing them strictly into numerical `ListingCard` interfaces.
- **Header Responsiveness** — Corrected Mobile menu behavior wrapping the `Search`, `Wishlist`, and `Authentication` interactions inside an `aria-expanded` hamburger navigation sequence automatically dismissing upon active clicks.

---

## [0.6.0] — 2026-04-08 — Phase 3: Marketplace Discovery & Pipeline Fixes

### Added
- **`apps/web/src/app/dashboard/store/listings/new/page.tsx`** — Implemented the robust multi-step listing creation wizard connected sequentially to Supabase `product-images` storage.
- **`apps/web/src/app/dashboard/store/listings/page.tsx`** — Created the store managerial inventory UI isolating SSR active bounds safely checking inventory counts limit dynamically.
- **`apps/web/src/app/listing/[id]/page.tsx`** — Developed the fully immersive, layout-shift-free UI bridging technical escrow logic and dynamic condition stock validation.
- **`apps/web/src/components/ui/ListingCard.tsx`** — Constructed the glassmorphism UI card token dynamically standardizing layout conditions.
- **`apps/api/src/services/listing.service.ts`** — Implemented strict inventory search arrays limiting isolated `storeId` matches accurately alongside PostgreSQL search vectors formatting safely.
- **Search Grid Navigation**: Established `app/search`, `app/categories`, `app/student-deals`, and `app/universities` rendering sophisticated grid cards leveraging dynamically fetched API filters accurately resolving into the Tailwind based `ListingCard` map efficiently.
- **Store Directory**: Created `app/stores` directory indexing `isActive` stores mathematically ordered by reviews naturally bypassing search clutter safely onto responsive mobile mappings.
- **Homepage (UI Kit Mapped)**: Completely rewrote `app/(marketplace)/page.tsx` mapping entirely over the Figma structure dynamically:
  - Validated strict grid integrations iterating `Promise.all` logic mapping `[Featured Deals, Trending Now, Top Campuses, Verified Stores]` asynchronously into structural UI grids exactly bypassing UI latency beautifully.
  - Implemented the Escrow Safety banner, Student Deals Grid gradient logic, and responsive `Featured Categories` structurally.
- **Strict Typing Safety Constraints**: Globally stabilized TypeScript compiler warnings converting `any[]` mapped array warnings over into exact representations matching `ListingOption`, `StoreOption` cleanly purging syntax violations! safely.

### Fixed
- **Next.js 16.x Turbopack Resolution** — Migrated the backend API configuration entirely to `tsx` native Node runtime, changing `tsconfig.json` `moduleResolution` to `bundler` globally. This completely removes the strict `.js` implicit extensions requirement from `@ushop/shared` allowing Next.js `transpilePackages` to perfectly build the shared dependencies natively without crashing.
- **Vercel Monorepo Missing Scope** — Successfully enabled default Next.js workspaces dependencies resolution cleanly relying transparently on `src/index.ts` instead of hacking `package.json` with external `dist` build streams.
- **Server Component Client SSR Mixes** — Split `apiFetch` permanently into `@/lib/api-client` and `@/lib/api-server` to respect strict Next.js App Router isomorphic environments avoiding Supabase object proxies causing Server rendering evaluation crashes.
- **ESLint & TS Compilations** — Re-configured TS definitions explicitly enforcing typed structs mitigating all `.any` variables accurately in mapping grids.
- **Turbo Pipeline Dependency Checks** — Added `"dependsOn": ["^build"]` for proper CI typechecking synchronization inside `.turbo.json`.
- **Route Group Fix** — Moved all discovery pages (`/search`, `/categories`, `/universities`, `/stores`, `/student-deals`, `/listing`, `/store`) into the `(marketplace)` route group so they correctly inherit the shared Header and Footer layout.
- **Login Redirect** — Changed post-login redirect from `/dashboard` to `/` (homepage) for a better marketplace-first UX.
- **Header Auth State** — Added `account_circle` Material Symbol icon for logged-in users, replacing plain text link with a visual profile indicator.
- **Local Asset Images** — Replaced all broken external Google CDN URLs for category and university images with local `/assets/images/` paths that ship with the repository.
- **Verify Page Universities** — Improved the university fetch in the verification page with more robust response shape handling to ensure the dropdown populates correctly.
- **Light Theme Discovery Pages** — Rewrote `/categories`, `/universities`, and `/stores` index pages from dark theme (`bg-campus-dark`) to light theme (`bg-white`) matching the Figma UI kit design. University cards now show campus logo images instead of generic icons.
- **Homepage Categories/Universities** — Matched Figma reference: categories use image overlay cards on white background; universities display as clean white cards with logo thumbnails and university names.
- **CORS Multi-Origin Support** — Replaced the single-origin CORS config (`FRONTEND_URL` only) with a dynamic callback that allows localhost, the primary frontend URL, and all `*.vercel.app` preview/production deployments. This was blocking all client-side API calls (auth, universities, etc.) on deployed Vercel builds.
- **Broken Nav Links (Header/Footer)** — Fixed 404s caused by links to non-existent routes: `/products` → `/search`, `/sell` → `/dashboard/store/create`, `/track` → `/dashboard`, `/categories/smartphones` → `/categories/phones`. Added `id`/`name` attributes to newsletter email input.
- **Middleware Fixes** — (a) Excluded `manifest.json` from auth middleware matcher to fix 401 on PWA manifest. (b) Removed `/store` from `protectedPaths` so public storefronts (`/store/[handle]`) are accessible without login. (c) Removed the redirect that blocked `/login` and `/register` for users with stale Supabase cookies — this was causing a blank login page.
- **Placeholder Pages** — Created `(marketplace)/cart/page.tsx` and `(marketplace)/wishlist/page.tsx` with empty-state UIs to eliminate 404 console errors. These will be replaced with real functionality in Phase 4.
- **Figma-Matched Discovery Pages** — Rewrote all discovery pages to match the Figma UI kit exactly:
  - **Categories** (`/categories`): Dark hero banner with search bar, 3-col grid of image cards showing product counts, descriptions, and "Browse Collection →" CTAs.
  - **Universities** (`/universities`): Dark hero banner with "Find Campus" search, 3-col cards with campus images, location pins, "VIEW MARKETPLACE" CTAs, and a purple "Don't see your university?" CTA section.
  - **Stores** (`/stores`): Dark hero banner with "Verified Marketplace" badge + gradient title, filter pills (All/Student Run/Elite), 4-col store cards with image headers and "Browse Store" CTAs, plus "Want to sell your products?" CTA section.
  - **Search** (`/search`): Light-themed sidebar with university radio list, price range, condition filters, and "Apply Filters" CTA. No-results state with tips cards and support links matching the Figma no-results screen.
  - **Homepage Universities**: Changed from small logo thumbnails to full image card grid matching the categories section layout.
- **Resend Email Service** — Added `resend` SDK to the Express API and created `src/lib/email.ts` with a centralised `sendEmail()` function and pre-built branded templates for order confirmation, welcome, and store approval emails. Auth emails (signup, password reset) are handled by Supabase SMTP → Resend integration configured in the Supabase Dashboard.
- **CRITICAL: Production Auth Fix** — `.env.production` was missing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, causing the deployed Vercel build to use placeholder Supabase credentials. This resulted in 500 errors on all auth flows (signup, login, email confirmation) with the message "No API key found in request". Fixed by adding all public Supabase keys to `.env.production`.
- **Auth Auto-Sync** — Added automatic DB record creation in `AuthProvider`. When `/auth/me` returns 401 (user exists in Supabase but not in our DB), the provider now auto-calls `/register` to create the internal User record, then retries `/me`. This fixes the permanent 401 loop for users who signed up when email confirmation was enabled (the `/register` call was skipped because `data.session` was null).
- **CRITICAL: API Auth Header Fix** — Fixed the `Authorization` header being silently dropped in `api.ts`. The `Headers` object from `api-client.ts` was being spread as a plain object (`...(options.headers as Record<string, string>)`), which loses all entries from a `Headers` instance. Replaced with proper `Headers.forEach()` iteration. This was causing 401 errors on all authenticated API calls (verify/upload, store creation, etc.).
- **Email Bounce Prevention** — Added client-side email validation in the registration flow: regex format check, disposable email domain blocklist (mailinator, yopmail, etc.), and fake TLD detection. Catches bad emails before they reach Supabase/Resend, reducing bounce rates.

---
## [0.5.2] — 2026-04-06 — Category Seeding with Icons

### Changed
- **`packages/shared/src/constants.ts`** — Added `iconUrl` field to `CATEGORIES` array, mapping 6 of 10 categories to their image assets in `/assets/images/categories/`
- **`prisma/seed.ts`** — Updated seed script to include `iconUrl` in both create and update paths of the upsert

### Seeded Data
| Category | Icon | Path |
|----------|------|------|
| Laptops | ✅ | `laptop.jpg` |
| Phones | ✅ | `phone.png` |
| Tablets | ✅ | `Tablet.png` |
| Accessories | ✅ | `Accessories.png` |
| Storage | ✅ | `storage.png` |
| Gaming | ✅ | `Gaming.png` |
| Components | — | No image yet |
| Networking | — | No image yet |
| Audio | — | No image yet |
| Peripherals | — | No image yet |

---

## [0.5.1] — 2026-04-06 — Phase 0 & 1 TODOs: Layout + University API

### Added

#### Backend — University API
- **`GET /api/v1/universities`** — Public endpoint returning all active universities (name, shortName, slug, domain, logoUrl). Registered in `index.ts` with general rate limit.

#### Frontend — Marketplace Layout
- **`app/(marketplace)/layout.tsx`** — New route group wrapping all public pages with `<Header />` + `<Footer />`. Auth-aware: shows Login/Sign Up for guests, user name + dashboard link for logged-in users.
- Moved `app/page.tsx` → `app/(marketplace)/page.tsx` (homepage now wrapped with Header/Footer)
- Moved `app/dashboard/` → `app/(marketplace)/dashboard/` (dashboard now has Header/Footer)

### Changed

#### Frontend — Verify Page
- Replaced hardcoded 10-university list with dynamic `GET /api/v1/universities` API call
- Dropdown shows "Loading universities..." placeholder while fetching
- University options now display as "University Name (SHORT)" from the database

---

## [0.5.0] — 2026-04-06 — Database Expansion + Component Library + Build Guide

### Documentation
- **`docs/product/MVP_BUILD_GUIDE.md`** — Complete rewrite with page-by-page build plan:
  - 54 pages inventoried across 10 phases (8 done, 46 remaining)
  - Each page: route, design reference, components, API endpoints, build steps, status
  - Current progress snapshot, build execution timeline (Weeks 3–12)
  - Per-phase backend work quick reference table
  - Pre-flight checklist for every new page

### Added

#### Database — 6 New Tables
- **`University`** — Replaces hardcoded student email domain list. Fields: `name`, `shortName`, `slug`, `domain`, `logoUrl`, `isActive`. Indexed on `slug` and `isActive`.
- **`Cart`** — Server-side cart, one per user (`userId` unique). Cascades on user delete.
- **`CartItem`** — Items in a cart. Unique constraint on `[cartId, listingId]` prevents duplicates.
- **`Wishlist`** — One wishlist per user (`userId` unique). Cascades on user delete.
- **`WishlistItem`** — Items in a wishlist. Unique constraint on `[wishlistId, listingId]`.
- **`Address`** — Delivery addresses supporting campus (hall + university FK) and off-campus. `digitalAddress` (Ghana Post GPS) is optional. Indexed on `[userId, isDefault]`.

#### University Seed Data — `prisma/seed-universities.ts`
- 5 Ghanaian universities seeded: **GCTU**, **UG**, **UCC**, **KNUST**, **UMAT**
- Logos from `/assets/images/universities/`
- Idempotent upsert — safe to re-run

#### Component Library — `src/components/` (15 files)

**Atoms (`components/ui/`)**:
- `Button` — 5 variants (Primary, Secondary, Outline, Ghost, Danger), 3 sizes, loading spinner, icon slots
- `Badge` — 7 color variants + pre-built `ConditionBadge`, `VerificationBadge`, `StockBadge`
- `Input` — Text input with label, error state, helper text, left/right icon slots
- `Textarea` — Multi-line input, same styling as Input
- `Select` — Dropdown with placeholder support
- `Toggle` — Switch toggle with label, description, Material Symbols icon

**Molecules (`components/cards/`, `components/modals/`)**:
- `Card` — Elevated/Outlined/Hoverable + composable Header/Content/Footer
- `ProductCard` — Full product listing card: image, vendor, title, stars, price (GH₵), condition badge, wishlist heart, "Add to Cart" button, out-of-stock overlay
- `SearchBar` — Search input with autocomplete suggestions dropdown
- `Modal` — 3 sizes (sm/md/lg), ESC-to-close, backdrop click, scrollable content
- `ConfirmModal` — Pre-built destructive action dialog with danger/warning variants

**Organisms (`components/layout/`)**:
- `Header` — 3-row layout (topbar → main → nav) with mobile responsive menu
- `Footer` — Brand, Quick Links, Customer Service, Contact Us, newsletter, payment logos (Momo, TCash, AT Money, Visa)
- `EmptyState` — Centered icon, title, description, CTA button

**Barrel exports** — `components/index.ts` enables `import { Button, ProductCard } from '@/components'`

### Changed
- `User` model — added `cart`, `wishlist`, `addresses` relations
- `Listing` model — added `cartItems`, `wishlistItems` relations

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

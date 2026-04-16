# Contributing to U-Shop

Welcome! This guide provides everything you need to get the U-Shop application running locally.

## Project Structure

U-Shop is a monorepo managed with `pnpm` and Turborepo.

- `development/apps/web/`: The Next.js 16 (App Router) frontend.
- `development/apps/api/`: The Express.js backend.
- `development/packages/shared/`: Shared TypeScript configurations, types, and utilities.

## Prerequisites

- **Node.js**: v20 or higher.
- **Package Manager**: `pnpm` (v9+ recommended). Run `npm install -g pnpm`.
- **Git**: For version control.

## 1. Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd UShop
   ```

2. **Install dependencies:**
   From the root of the project, run:
   ```bash
   pnpm install
   ```

## 2. Environment Variables

You need to configure environment variables for both the frontend and backend applications. You will need access to the U-Shop Supabase, Paystack, Upstash Redis, and Resend projects to get these keys.

### Backend (`development/apps/api/.env`)
Copy the provided `.env.example` to `.env` inside `development/apps/api/`:

```bash
cd development/apps/api
cp .env.example .env
```
Fill in the placeholders with the actual development keys.

### Frontend (`development/apps/web/.env.local`)
Create a `.env.local` file inside `development/apps/web/` with the following variables:

```env
# API Connection
NEXT_PUBLIC_API_URL=http://localhost:4000

# Supabase Auth & DB
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Firebase (Required for certain UI components/notifications mapping)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
```

## 3. Running the App

Thanks to Turborepo, you can start both the frontend and backend simultaneously from the root of the project:

```bash
# Starts both Next.js (port 3000) and Express API (port 4000)
pnpm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

## 4. Local Database & Testing (Phase 3.6)

To fully validate logic against the database without polluting production or staging environments, U-Shop uses the **Supabase Local CLI**.

1. **Install Supabase CLI:** follow the [official documentation](https://supabase.com/docs/guides/cli/getting-started).
2. **Start the local database:**
   ```bash
   supabase start
   ```
   This spins up Docker containers mimicking the complete Supabase stack (Postgres, Auth, Storage).
3. **Run Unit and Integration Tests:**
   ```bash
   pnpm test
   ```
4. **Run End-to-End Tests (Playwright):**
   ```bash
   cd testing/e2e-tests/playwright
   # Ensure dev server is running first
   pnpm test:ui
   ```

## 5. Building for Production

To test the production build locally:

```bash
pnpm run build
```

## 6. Development Standards

Please read and adhere to our strict coding guidelines before submitting a PR:
- Always use **Next.js App Router** (no `pages/` directory).
- **Never use `any`** in TypeScript.
- **Comments are mandatory** before any non-trivial logic block (DB transactions, API calls, auth checks).
- Read API contracts (`docs/ushop-api-contract-v1.md`) and DB schemas (`docs/ushop-db-schema-spec.md`) before writing data-fetching code.

For full rules, check our internal development guidelines document.

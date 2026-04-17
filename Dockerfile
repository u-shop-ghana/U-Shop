# ─── Build Stage ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm via corepack (matches packageManager field in package.json)
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy the entire monorepo so pnpm can resolve workspace:* dependencies
COPY . .

# Install all workspace dependencies 
WORKDIR /app/development
RUN pnpm install --frozen-lockfile

# Generate Prisma client and compile TypeScript
WORKDIR /app/development/apps/api
RUN pnpm db:generate
RUN pnpm build

# ─── Production Stage ────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy the full monorepo (node_modules included) from the builder so
# workspace symlinks and the Prisma client are all present at runtime
COPY --from=builder /app /app

WORKDIR /app/development/apps/api

EXPOSE 4000

CMD ["pnpm", "run", "start"]

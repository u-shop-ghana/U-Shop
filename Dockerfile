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

# Selectively copy the pre-compiled monorepo segments required for node execution
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/development/package.json /app/development/
COPY --from=builder /app/development/node_modules /app/development/node_modules
COPY --from=builder /app/development/packages /app/development/packages

# Copy the API binary bundle and schemas
COPY --from=builder /app/development/apps/api/package.json /app/development/apps/api/
COPY --from=builder /app/development/apps/api/node_modules /app/development/apps/api/node_modules
COPY --from=builder /app/development/apps/api/dist /app/development/apps/api/dist
COPY --from=builder /app/development/apps/api/prisma /app/development/apps/api/prisma

WORKDIR /app/development/apps/api

EXPOSE 4000

CMD ["pnpm", "run", "start"]

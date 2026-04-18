# ─── Build Stage ─────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm via corepack (matches packageManager field in package.json)
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy the entire monorepo so pnpm can resolve workspace:* dependencies
COPY . .

# Install all workspace dependencies from the workspace root where
# pnpm-lock.yaml and pnpm-workspace.yaml live
RUN pnpm install --frozen-lockfile

# Generate Prisma client and compile TypeScript
WORKDIR /app/development/apps/api
RUN pnpm db:generate
RUN pnpm build

# Prune devDependencies before copying node_modules to runtime image
WORKDIR /app
RUN pnpm prune --prod

# ─── Production Stage ────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace root manifests required for production dependency install
COPY --from=builder /app/package.json /app/
COPY --from=builder /app/pnpm-workspace.yaml /app/
COPY --from=builder /app/pnpm-lock.yaml /app/

# Copy shared package sources (imported directly via workspace:* at runtime)
COPY --from=builder /app/development/packages /app/development/packages

# Install only production dependencies in the runtime image
RUN pnpm install --frozen-lockfile --prod

# Copy the API package manifest, any package-level node_modules, built
# artifacts, and Prisma schema/migrations
COPY --from=builder /app/development/apps/api/package.json /app/development/apps/api/
COPY --from=builder /app/development/apps/api/node_modules /app/development/apps/api/node_modules
COPY --from=builder /app/development/apps/api/dist /app/development/apps/api/dist
COPY --from=builder /app/development/apps/api/prisma /app/development/apps/api/prisma

WORKDIR /app/development/apps/api

EXPOSE 4000

CMD ["pnpm", "run", "start"]

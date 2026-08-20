# ── Stage 1: Build & Dependencies ──────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Copy ONLY the api package.json + lockfile (isolates the build from the
# monorepo workspace and prevents npm edgeOut errors). Using `npm ci` with a
# committed lockfile instead of `npm install` skips dependency resolution
# against the registry entirely — much faster and fully reproducible.
COPY apps/api/package.json apps/api/package-lock.json ./

RUN npm ci --ignore-scripts

# Copy backend source code
COPY apps/api ./

# Compile TypeScript
RUN npm run build

# ── Stage 2: Production Runtime ────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3005

# Copy production node_modules and compiled output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Copy document templates from web
COPY apps/web/public/templates ./apps/web/public/templates

EXPOSE 3005

CMD ["node", "dist/server.js"]

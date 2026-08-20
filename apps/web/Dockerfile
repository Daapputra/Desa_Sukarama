# ── Stage 1: Build Nuxt Application ─────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Build args
ARG NUXT_PUBLIC_API_BASE=http://localhost:3005
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

# Copy ONLY the web package.json + lockfile to isolate it from the monorepo
# workspace (prevents npm edgesOut bugs and allows clean resolution of Linux
# native bindings). Passing the lockfile to `npm install` still skips most
# registry resolution (much faster than no lockfile at all) without `npm
# ci`'s strict lockfile-consistency check — that check fails on this
# dependency tree (cac/commander transitive version conflict reproducible
# even on a freshly generated lockfile, likely an npm 10.x resolver edge
# case) even though a plain `npm install` resolves it fine.
COPY apps/web/package.json apps/web/package-lock.json ./

RUN npm install --ignore-scripts

# Copy frontend source code
COPY apps/web ./

# Build production Nuxt/Nitro bundle
RUN npm run build

# ── Stage 2: Production Nitro Runtime ───────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy standalone Nitro output
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

# ── Stage 1: Build Nuxt Application ─────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Build args
ARG NUXT_PUBLIC_API_BASE=http://localhost:3005
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

# Copy workspace and frontend package definitions
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies (use --ignore-scripts to defer nuxt prepare until code is copied)
RUN npm install --ignore-scripts

# Copy frontend source code and static assets
COPY apps/web ./apps/web

# Build production Nuxt/Nitro bundle
RUN npm --prefix apps/web run build

# ── Stage 2: Production Nitro Runtime ───────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy only the compiled standalone Nitro server output
COPY --from=builder /app/apps/web/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

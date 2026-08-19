# ── Stage 1: Build Nuxt Application ─────────────────────────
FROM node:22-slim AS builder

WORKDIR /app/apps/web

# Build args
ARG NUXT_PUBLIC_API_BASE=http://localhost:3005
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

# Copy web package definition and install native Linux bindings
COPY apps/web/package.json ./package.json

RUN npm install

# Copy source code and build
COPY apps/web ./

RUN npm run build

# ── Stage 2: Production Nitro Runtime ───────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy standalone Nitro output
COPY --from=builder /app/apps/web/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

# ── Stage 1: Build Nuxt Application ─────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Build args
ARG NUXT_PUBLIC_API_BASE=http://localhost:3005
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

# Copy ONLY the web package.json to isolate it from the monorepo workspace
# This prevents NPM workspace bugs (edgesOut) and allows clean resolution of Linux native bindings
COPY apps/web/package.json ./

# Install dependencies in isolation
RUN npm i -g npm@latest
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

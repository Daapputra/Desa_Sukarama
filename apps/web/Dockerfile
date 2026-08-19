# ── Stage 1: Build Nuxt Application ─────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Build args
ARG NUXT_PUBLIC_API_BASE=http://localhost:3005
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

# Copy package and web source code
COPY package.json ./
COPY apps/web ./apps/web

# Install dependencies inside apps/web and compile Nitro bundle
WORKDIR /app/apps/web
RUN npm install --ignore-scripts
RUN npm run build

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

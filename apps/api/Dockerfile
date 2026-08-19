# ── Stage 1: Build & Dependencies ──────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace and backend package definitions
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/

# Install dependencies for compilation
RUN npm install

# Copy backend source code and configurations
COPY apps/api ./apps/api

# Compile TypeScript
RUN npm --prefix apps/api run build

# ── Stage 2: Production Runtime ────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3005

# Copy production node_modules and compiled output
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/scripts ./scripts

EXPOSE 3005

CMD ["node", "dist/server.js"]

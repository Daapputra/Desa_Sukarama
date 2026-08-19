# ── Stage 1: Build & Dependencies ──────────────────────────
FROM node:22-slim AS builder

WORKDIR /app/apps/api

COPY apps/api/package.json ./package.json

RUN npm install

COPY apps/api ./

RUN npm run build

# ── Stage 2: Production Runtime ────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3005

COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/scripts ./scripts

EXPOSE 3005

CMD ["node", "dist/server.js"]

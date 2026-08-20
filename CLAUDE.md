# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Desa Sukarama Digital — official website + admin system for an Indonesian village government (Desa Sukarama, Kec. Bojongpicung, Kab. Cianjur). NPM Workspaces monorepo: `apps/api` (Fastify + Drizzle ORM backend) and `apps/web` (Nuxt 4 frontend), backed by PostgreSQL. Most identifiers, routes, and UI copy are in Indonesian (Bahasa) — keep new code, error messages, and field names consistent with that convention (e.g. `nik`, `no_kk`, `jenisSurat`, error strings like `'Akses ditolak...'`).

## Commands

Run from repo root unless noted.

```bash
npm install                  # install all workspace deps
npm run dev                  # run API (:3005) + Web (:3000) concurrently, colored logs
npm run dev:api              # API only
npm run dev:web              # Web only
npm run build                # tsc build for API, then nuxt build for Web
npm run typecheck            # tsc build (api) + tsc --noEmit against .nuxt/tsconfig.json (web)
npm run db:push              # drizzle-kit push (apps/api)
npm run db:seed              # seed admin account + dummy data (apps/api/src/db/seed.ts)
npm run db:studio            # drizzle-kit studio
npm run import:penduduk      # import resident (NIK) data from uploads/*.xlsx (repo root) into `penduduk` table
```

Backend-only scripts (run with `npm --prefix apps/api run <script>`):
- `db:generate` — drizzle-kit generate migrations
- `reset:admin` — reset the admin account password (`tsx scripts/reset-admin.ts`)

There is no test suite in this repo — verification is via `npm run typecheck` and manual exercise of the running app.

### Docker (primary way this app is actually run)

```bash
docker compose up --build -d   # first-time / after dependency or Dockerfile changes
docker compose start           # daily: resume containers (fast, no rebuild)
docker compose stop            # daily: pause containers, keep data
docker compose down            # remove containers, keeps named volume (postgres data safe)
docker compose down -v         # full reset — destroys the Postgres volume too
docker compose logs -f api     # tail one service's logs
```

Services: `db` (postgres:16-alpine, host port from `POSTGRES_PORT`, default 5434), `api` (Fastify, :3005), `web` (Nuxt, :3000), `pgweb` (DB GUI, :8081). `api`'s container also bind-mounts `./apps/web/public/templates` so it can read `.docx` letter templates without a rebuild.

Local dev without Docker requires Postgres reachable at the URL in `.env`/`apps/api/.env` (`DATABASE_URL`).

### Hybrid workflow: live-editing `apps/web` while the rest runs in Docker

`apps/web`'s Dockerfile builds a production Nuxt/Nitro bundle at image-build time and copies only `.output/` into the runtime image — the running `web` container never re-reads source files, so editing `apps/web` while `docker compose up`/`start` is running has zero visible effect until the image is rebuilt. To iterate with hot-reload against a Docker-hosted `api`/`db`: `docker compose stop web`, then `npm run dev:web` (serves `:3000` locally, hits `api` at `127.0.0.1:3005` same as the container did), then `Ctrl+C` when done. **`docker compose up --build -d web` is required afterward** to make changes stick in Docker — there is no file-watching or bind-mount for `apps/web` source, so this step is easy to forget (the stale container keeps serving the old build with no error). A `Stop` hook in `.claude/settings.json` reminds about this when `apps/web` has uncommitted changes at the end of a Claude Code session; see README.md § "Mode Hybrid" for the full user-facing walkthrough.

## Architecture

### Backend (`apps/api`, Fastify 5 + Drizzle ORM + `pg`, ESM/`type: module`)

- `src/server.ts` — app bootstrap: registers `@fastify/cors`, `@fastify/multipart` (5MB file limit, 50MB body limit), a global error handler (413 for oversized uploads, else generic 500 with Indonesian message), all route plugins, `/api/health`, then attempts `seedDatabase()` (non-fatal if DB unreachable) before `listen()`. Graceful shutdown closes both the Fastify app and the pg `pool` on SIGINT/SIGTERM.
- `src/db/index.ts` — single `pg.Pool` + `drizzle()` instance exported as `db`/`pool`. Requires `DATABASE_URL` env var (thrown at import time if missing).
- `src/db/schema.ts` — the only source of truth for tables: `adminUsers`, `pengumuman` (announcements), `suratPengajuan` (letter/document requests), `umkmProduk` (village MSME products), `pesanKontak` (contact messages), `penduduk` (resident registry, keyed by unique `nik`). Note DB columns are snake_case but several API responses manually map back to snake_case keys to match a pre-existing API contract (see `surat.ts` `GET /api/surat/:id`) — when adding fields, check whether the route needs an equivalent manual mapping.
- `src/plugins/auth.ts` — auth is a **process-local, in-memory `Map<token, {username, createdAt}>`**, not JWT/sessions in the DB. Tokens do not survive an API restart and won't work across multiple API replicas. Passwords are PBKDF2 (`hashPassword`) with a random per-user salt column.
- Each `src/routes/*.ts` file is a Fastify plugin function (`export async function xRoutes(fastify)`) registered in `server.ts`. Route-protected endpoints repeat a local `requireAuth` preHandler (reads `Authorization: Bearer <token>`, looks it up via `getToken`) — this is duplicated per-file rather than shared, follow the existing pattern when adding protected routes.
- `src/routes/surat.ts` is the most complex route: it accepts multipart submissions for surat (letter) requests, upserts the requester into `penduduk`, and on `GET /api/surat/:id/download-surat` renders one of several `.docx` templates (in `apps/web/public/templates/`) via `docxtemplater` + `pizzip` + `docxtemplater-image-module-free`, picking a template by matching `jenisSurat` substring, formatting Indonesian dates, applying title-case/upper-case helpers, and injecting a signature image (`ttd kades.png` / `ttd_sekdes.png`) based on `metadata.penandatangan`. Template caching is intentionally disabled (`getCachedTemplate` re-reads from disk every call) so template edits in Word take effect without restarting — don't re-enable that cache without checking why it was disabled (see git history / recent commit).
- `scripts/import-penduduk.ts` and `scripts/reset-admin.ts` are standalone `tsx` scripts run via npm scripts above, not part of the server.

### Frontend (`apps/web`, Nuxt 4 + Vue 3 + Tailwind, Nuxt 4's `app/` source layout)

- `runtimeConfig.public.apiBase` (env `NUXT_PUBLIC_API_BASE`, default `http://127.0.0.1:3005`) is the only link to the backend; all calls to it go through the `useApi()` composable (`app/composables/useApi.ts`), which wraps `fetch`, injects `Authorization: Bearer <admin_token>` from `localStorage` when present, and normalizes error handling — use it instead of calling `fetch`/`$fetch` directly for new API calls.
- `app/composables/useAuth.ts` manages the admin login/session on top of `localStorage`'s `admin_token`.
- Layouts: `default.vue` (public site, wraps `SiteHeader`/`SiteFooter`) vs `admin.vue` (admin dashboard shell) — pages under `app/pages/admin/` use the admin layout.
- Public pages (`index`, `profil`, `layanan`, `umkm`, `kontak`) are the village's public-facing site; `layanan.vue` is where residents submit `surat` (letter) requests that flow into the backend described above.
- `public/templates/` holds the `.docx` letter templates and signature images consumed by the API's document generation — these are static assets served by Nuxt but read directly off disk by the API container via the shared Docker volume mount, so template filenames are a contract between `apps/web/public/templates/*.docx` and the `templateName`/`ttdFileName` matching logic in `apps/api/src/routes/surat.ts`.
- `routeRules` prerenders `/profil` and sets long-lived cache headers for `/images/**` and `/templates/**`.

### Data flow for letter requests (representative end-to-end path)

1. Resident fills the form on `layanan.vue` → `POST /api/surat` (multipart, public) — validates NIK/KK format, upserts `penduduk`, inserts a `suratPengajuan` row with a generated `refNumber` and a JSON `metadata` blob (program name, business info, signatory, etc.).
2. Admin reviews/updates status via `admin/dashboard.vue` → authenticated `GET /api/surat`, `PUT /api/surat/:id/status`.
3. Once `status === 'Selesai'`, anyone can `GET /api/surat/:id/download-surat` to generate and download the filled `.docx`.

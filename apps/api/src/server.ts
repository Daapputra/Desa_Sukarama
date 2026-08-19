import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { pool } from './db/index.js'
import { seedDatabase } from './db/seed.js'
import { adminRoutes } from './routes/admin.js'
import { pengumumanRoutes } from './routes/pengumuman.js'
import { suratRoutes } from './routes/surat.js'
import { umkmRoutes } from './routes/umkm.js'
import { kontakRoutes } from './routes/kontak.js'

const PORT = parseInt(process.env.API_PORT || process.env.PORT || '3005')

const app = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024, // 50MB to match existing
})

// ── Plugins ──────────────────────────────────────────────
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

await app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error)

  if ((error as { code?: string }).code === 'FST_REQ_FILE_TOO_LARGE') {
    return reply.status(413).send({ error: 'Ukuran file maksimal 5 MB' })
  }

  return reply.status(500).send({ error: 'Terjadi kesalahan internal' })
})

// ── Routes ───────────────────────────────────────────────
await app.register(adminRoutes)
await app.register(pengumumanRoutes)
await app.register(suratRoutes)
await app.register(umkmRoutes)
await app.register(kontakRoutes)

// ── Health check ─────────────────────────────────────────
app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// ── Initialize & Start ───────────────────────────────────
async function start() {
  try {
    try {
      await seedDatabase()
    } catch (e) {
      console.warn("Skipping DB seed because database is not reachable.")
    }
    await app.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`\n🏘️  API Desa Sukarama (Fastify) berjalan di http://localhost:${PORT}\n`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()

async function gracefulShutdown() {
  try {
    await app.close()
    await pool.end()
  } catch (err) {
    app.log.error(err)
  }
}

process.once('SIGINT', gracefulShutdown)
process.once('SIGTERM', gracefulShutdown)

export default app

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { eq, count } from 'drizzle-orm'
import { db } from '../db/index.js'
import {
  adminUsers,
  pengumuman,
  suratPengajuan,
  umkmProduk,
  pesanKontak,
} from '../db/schema.js'
import {
  hashPassword,
  generateToken,
  setToken,
  getToken,
  deleteToken,
} from '../plugins/auth.js'

// Pre-handler for auth
async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization']
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !getToken(token)) {
    return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }

  request.admin = getToken(token)
}

export async function adminRoutes(fastify: FastifyInstance) {
  // POST /api/admin/login
  fastify.post('/api/admin/login', async (request, reply) => {
    const { username, password } = request.body as { username?: string; password?: string }

    if (!username || !password) {
      return reply.status(400).send({ error: 'Username dan password harus diisi' })
    }

    const result = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1)

    const user = result[0]
    if (!user) {
      return reply.status(401).send({ error: 'Username atau password salah' })
    }

    const hash = hashPassword(password, user.salt)
    if (hash !== user.passwordHash) {
      return reply.status(401).send({ error: 'Username atau password salah' })
    }

    const token = generateToken()
    setToken(token, user.username)
    return { token, username: user.username }
  })

  // POST /api/admin/logout
  fastify.post('/api/admin/logout', { preHandler: requireAuth }, async (request) => {
    const token = request.headers['authorization']?.replace('Bearer ', '')
    if (token) deleteToken(token)
    return { message: 'Berhasil logout' }
  })

  // GET /api/admin/verify
  fastify.get('/api/admin/verify', { preHandler: requireAuth }, async (request) => {
    return { valid: true, username: request.admin?.username }
  })

  // GET /api/admin/stats
  fastify.get('/api/admin/stats', { preHandler: requireAuth }, async () => {
    const [
      [suratBaru],
      [suratProses],
      [suratSelesai],
      [totalSurat],
      [totalUmkm],
      [totalPengumuman],
      [pesanBaru],
    ] = await Promise.all([
      db.select({ c: count() }).from(suratPengajuan).where(eq(suratPengajuan.status, 'Diajukan')),
      db.select({ c: count() }).from(suratPengajuan).where(eq(suratPengajuan.status, 'Diproses')),
      db.select({ c: count() }).from(suratPengajuan).where(eq(suratPengajuan.status, 'Selesai')),
      db.select({ c: count() }).from(suratPengajuan),
      db.select({ c: count() }).from(umkmProduk),
      db.select({ c: count() }).from(pengumuman),
      db.select({ c: count() }).from(pesanKontak).where(eq(pesanKontak.dibaca, 0)),
    ])

    return {
      surat_baru: suratBaru?.c ?? 0,
      surat_proses: suratProses?.c ?? 0,
      surat_selesai: suratSelesai?.c ?? 0,
      total_surat: totalSurat?.c ?? 0,
      total_umkm: totalUmkm?.c ?? 0,
      total_pengumuman: totalPengumuman?.c ?? 0,
      pesan_baru: pesanBaru?.c ?? 0,
    }
  })
}

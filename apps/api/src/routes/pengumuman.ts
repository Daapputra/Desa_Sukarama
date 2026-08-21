import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { pengumuman } from '../db/schema.js'
import { getToken } from '../plugins/auth.js'

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization']
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !getToken(token)) {
    return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }
  request.admin = getToken(token)
}

const JUDUL_MAX_LENGTH = 255

function parsePengumumanId(id: string): number | null {
  const parsed = parseInt(id, 10)
  return Number.isInteger(parsed) ? parsed : null
}

export async function pengumumanRoutes(fastify: FastifyInstance) {
  // GET /api/pengumuman
  fastify.get('/api/pengumuman', async (request) => {
    const { limit } = request.query as { limit?: string }
    const parsedLimit = parseInt(limit ?? '', 10)
    const l = Number.isFinite(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : 100
    const result = await db
      .select()
      .from(pengumuman)
      .orderBy(desc(pengumuman.tanggal), desc(pengumuman.id))
      .limit(l)
    return result
  })

  // GET /api/pengumuman/:id
  fastify.get('/api/pengumuman/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsedId = parsePengumumanId(id)
    if (parsedId === null) {
      return reply.status(400).send({ error: 'ID pengumuman tidak valid' })
    }

    const result = await db
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, parsedId))
      .limit(1)

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' })
    }
    return result[0]
  })

  // POST /api/pengumuman (auth required)
  fastify.post('/api/pengumuman', { preHandler: requireAuth }, async (request, reply) => {
    const { judul, konten, tanggal } = request.body as {
      judul?: string
      konten?: string
      tanggal?: string
    }

    if (!judul || !konten || !tanggal) {
      return reply.status(400).send({ error: 'Judul, konten, dan tanggal harus diisi' })
    }
    if (judul.length > JUDUL_MAX_LENGTH) {
      return reply.status(400).send({ error: `Judul maksimal ${JUDUL_MAX_LENGTH} karakter` })
    }

    const result = await db
      .insert(pengumuman)
      .values({ judul, konten, tanggal })
      .returning({ id: pengumuman.id })

    return reply.status(201).send({ id: result[0].id, judul, konten, tanggal })
  })

  // PUT /api/pengumuman/:id (auth required)
  fastify.put('/api/pengumuman/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsedId = parsePengumumanId(id)
    if (parsedId === null) {
      return reply.status(400).send({ error: 'ID pengumuman tidak valid' })
    }

    const existing = await db
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, parsedId))
      .limit(1)

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' })
    }

    const { judul, konten, tanggal } = request.body as {
      judul?: string
      konten?: string
      tanggal?: string
    }

    if (judul === '' || konten === '' || tanggal === '') {
      return reply.status(400).send({ error: 'Judul, konten, dan tanggal harus diisi' })
    }
    if (judul && judul.length > JUDUL_MAX_LENGTH) {
      return reply.status(400).send({ error: `Judul maksimal ${JUDUL_MAX_LENGTH} karakter` })
    }

    await db
      .update(pengumuman)
      .set({
        judul: judul ?? existing[0].judul,
        konten: konten ?? existing[0].konten,
        tanggal: tanggal ?? existing[0].tanggal,
      })
      .where(eq(pengumuman.id, parsedId))

    return { message: 'Pengumuman berhasil diperbarui' }
  })

  // DELETE /api/pengumuman/:id (auth required)
  fastify.delete('/api/pengumuman/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const parsedId = parsePengumumanId(id)
    if (parsedId === null) {
      return reply.status(400).send({ error: 'ID pengumuman tidak valid' })
    }

    const existing = await db
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, parsedId))
      .limit(1)

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' })
    }

    await db.delete(pengumuman).where(eq(pengumuman.id, parsedId))
    return { message: 'Pengumuman berhasil dihapus' }
  })
}

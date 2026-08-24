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

function bufferToDataURI(buffer: Buffer, mimetype: string): string {
  const b64 = buffer.toString('base64')
  return `data:${mimetype};base64,${b64}`
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const MAX_FOTOS = 3

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

  // POST /api/pengumuman (auth required, multipart)
  fastify.post('/api/pengumuman', { preHandler: requireAuth }, async (request, reply) => {
    const parts = request.parts()
    const fields: Record<string, string> = {}
    const fotos: string[] = []

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'foto') {
          if (fotos.length >= MAX_FOTOS) {
            return reply.status(400).send({ error: `Maksimal ${MAX_FOTOS} foto per pengumuman` })
          }
          if (!allowedImageTypes.has(part.mimetype)) {
            return reply.status(400).send({ error: 'Foto harus berupa JPG, PNG, GIF, atau WEBP' })
          }
          const buffer = await part.toBuffer()
          fotos.push(bufferToDataURI(buffer, part.mimetype))
        }
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    const { judul, konten, tanggal } = fields

    if (!judul || !konten || !tanggal) {
      return reply.status(400).send({ error: 'Judul, konten, dan tanggal harus diisi' })
    }
    if (judul.length > JUDUL_MAX_LENGTH) {
      return reply.status(400).send({ error: `Judul maksimal ${JUDUL_MAX_LENGTH} karakter` })
    }
    if (fotos.length === 0) {
      return reply.status(400).send({ error: 'Minimal 1 foto pengumuman harus diunggah' })
    }

    const result = await db
      .insert(pengumuman)
      .values({ judul, konten, tanggal, fotos })
      .returning({ id: pengumuman.id })

    return reply.status(201).send({ id: result[0].id, judul, konten, tanggal, fotos })
  })

  // PUT /api/pengumuman/:id (auth required, multipart)
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

    const parts = request.parts()
    const fields: Record<string, string> = {}
    const newFotos: string[] = []

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'foto') {
          if (!allowedImageTypes.has(part.mimetype)) {
            return reply.status(400).send({ error: 'Foto harus berupa JPG, PNG, GIF, atau WEBP' })
          }
          const buffer = await part.toBuffer()
          newFotos.push(bufferToDataURI(buffer, part.mimetype))
        }
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    const row = existing[0]
    const { judul, konten, tanggal, fotos_existing } = fields

    if (judul === '' || konten === '' || tanggal === '') {
      return reply.status(400).send({ error: 'Judul, konten, dan tanggal harus diisi' })
    }
    if (judul && judul.length > JUDUL_MAX_LENGTH) {
      return reply.status(400).send({ error: `Judul maksimal ${JUDUL_MAX_LENGTH} karakter` })
    }

    let kept: string[] = row.fotos ?? []
    if (fotos_existing !== undefined) {
      try {
        const parsed = JSON.parse(fotos_existing)
        kept = Array.isArray(parsed) ? parsed.filter((f) => typeof f === 'string') : []
      } catch {
        return reply.status(400).send({ error: 'Data foto tidak valid' })
      }
    }

    const finalFotos = [...kept, ...newFotos].slice(0, MAX_FOTOS)
    if (finalFotos.length === 0) {
      return reply.status(400).send({ error: 'Minimal 1 foto pengumuman harus diunggah' })
    }

    await db
      .update(pengumuman)
      .set({
        judul: judul || row.judul,
        konten: konten || row.konten,
        tanggal: tanggal || row.tanggal,
        fotos: finalFotos,
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

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { umkmProduk } from '../db/schema.js'
import { getToken } from '../plugins/auth.js'

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization']
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !getToken(token)) {
    return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }
  request.admin = getToken(token)
}

function bufferToDataURI(buffer: Buffer, mimetype: string): string {
  const b64 = buffer.toString('base64')
  return `data:${mimetype};base64,${b64}`
}

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

export async function umkmRoutes(fastify: FastifyInstance) {
  // GET /api/umkm (public)
  fastify.get('/api/umkm', async (request) => {
    const { kategori } = request.query as { kategori?: string }

    if (kategori && kategori !== 'Semua') {
      return db
        .select()
        .from(umkmProduk)
        .where(eq(umkmProduk.kategori, kategori))
        .orderBy(desc(umkmProduk.createdAt))
    }

    return db.select().from(umkmProduk).orderBy(desc(umkmProduk.createdAt))
  })

  // GET /api/umkm/:id (public)
  fastify.get('/api/umkm/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await db
      .select()
      .from(umkmProduk)
      .where(eq(umkmProduk.id, parseInt(id)))
      .limit(1)

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Produk tidak ditemukan' })
    }
    return result[0]
  })

  // POST /api/umkm (auth required, multipart)
  fastify.post('/api/umkm', { preHandler: requireAuth }, async (request, reply) => {
    const parts = request.parts()
    const fields: Record<string, string> = {}
    let fotoPath: string | null = null

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'foto') {
          if (!allowedImageTypes.has(part.mimetype)) {
            return reply.status(400).send({ error: 'Foto harus berupa JPG, PNG, GIF, atau WEBP' })
          }
          const buffer = await part.toBuffer()
          fotoPath = bufferToDataURI(buffer, part.mimetype)
        }
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    const { nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, yt_link } = fields

    if (!nama_produk || !harga || !kategori || !deskripsi || !pemilik || !no_wa_pemilik) {
      return reply.status(400).send({ error: 'Semua field harus diisi' })
    }

    let ytId: string | null = null
    if (yt_link && yt_link.trim()) {
      ytId = extractYoutubeId(yt_link)
      if (!ytId) {
        return reply.status(400).send({ error: 'Link YouTube tidak valid. Gunakan link seperti https://youtube.com/watch?v=... atau https://youtu.be/...' })
      }
    }

    const result = await db
      .insert(umkmProduk)
      .values({
        namaProduk: nama_produk,
        harga: parseInt(harga),
        kategori,
        deskripsi,
        pemilik,
        noWaPemilik: no_wa_pemilik,
        fotoPath,
        ytId,
      })
      .returning({ id: umkmProduk.id })

    return reply.status(201).send({ id: result[0].id, message: 'Produk berhasil ditambahkan' })
  })

  // PUT /api/umkm/:id (auth required, multipart)
  fastify.put('/api/umkm/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await db
      .select()
      .from(umkmProduk)
      .where(eq(umkmProduk.id, parseInt(id)))
      .limit(1)

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Produk tidak ditemukan' })
    }

    const parts = request.parts()
    const fields: Record<string, string> = {}
    let fotoPath: string | null = null

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'foto') {
          if (!allowedImageTypes.has(part.mimetype)) {
            return reply.status(400).send({ error: 'Foto harus berupa JPG, PNG, GIF, atau WEBP' })
          }
          const buffer = await part.toBuffer()
          fotoPath = bufferToDataURI(buffer, part.mimetype)
        }
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    const row = existing[0]

    let ytId: string | null = null
    if (fields.yt_link && fields.yt_link.trim()) {
      ytId = extractYoutubeId(fields.yt_link)
      if (!ytId) {
        return reply.status(400).send({ error: 'Link YouTube tidak valid. Gunakan link seperti https://youtube.com/watch?v=... atau https://youtu.be/...' })
      }
    }

    await db
      .update(umkmProduk)
      .set({
        namaProduk: fields.nama_produk || row.namaProduk,
        harga: fields.harga ? parseInt(fields.harga) : row.harga,
        kategori: fields.kategori || row.kategori,
        deskripsi: fields.deskripsi || row.deskripsi,
        pemilik: fields.pemilik || row.pemilik,
        noWaPemilik: fields.no_wa_pemilik || row.noWaPemilik,
        fotoPath: fotoPath || row.fotoPath,
        ytId,
      })
      .where(eq(umkmProduk.id, parseInt(id)))

    return { message: 'Produk berhasil diperbarui' }
  })

  // DELETE /api/umkm/:id (auth required)
  fastify.delete('/api/umkm/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const existing = await db
      .select()
      .from(umkmProduk)
      .where(eq(umkmProduk.id, parseInt(id)))
      .limit(1)

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Produk tidak ditemukan' })
    }

    await db.delete(umkmProduk).where(eq(umkmProduk.id, parseInt(id)))
    return { message: 'Produk berhasil dihapus' }
  })
}

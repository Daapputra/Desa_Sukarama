import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { suratPengajuan, penduduk } from '../db/schema.js'
import { getToken } from '../plugins/auth.js'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fs from 'fs'
import path from 'path'

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization']
  const token = authHeader?.replace('Bearer ', '')
  if (!token || !getToken(token)) {
    return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }
  request.admin = getToken(token)
}

function generateRefNumber(): string {
  const now = new Date()
  const prefix = 'SKR'
  const y = String(now.getFullYear()).slice(2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${prefix}-${y}${m}${d}-${rand}`
}

function bufferToDataURI(buffer: Buffer, mimetype: string): string {
  const b64 = buffer.toString('base64')
  return `data:${mimetype};base64,${b64}`
}

const allowedDocumentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
])

export async function suratRoutes(fastify: FastifyInstance) {
  // POST /api/surat (multipart — public)
  fastify.post('/api/surat', async (request, reply) => {
    const parts = request.parts()
    const fields: Record<string, string> = {}
    let dokumenPath: string | null = null

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'dokumen') {
          if (!allowedDocumentTypes.has(part.mimetype)) {
            return reply.status(400).send({ error: 'Dokumen harus berupa JPG, PNG, GIF, WEBP, atau PDF' })
          }
          const buffer = await part.toBuffer()
          dokumenPath = bufferToDataURI(buffer, part.mimetype)
        }
      } else {
        fields[part.fieldname] = part.value as string
      }
    }

    const { nama, nik, no_kk, jenis_surat, keperluan, no_wa } = fields

    if (!nama || !nik || !no_kk || !jenis_surat || !keperluan || !no_wa) {
      return reply.status(400).send({ error: 'Semua field wajib harus diisi' })
    }
    if (!/^\d{3,16}$/.test(nik)) {
      return reply.status(400).send({ error: 'NIK harus berupa angka (3 - 16 digit)' })
    }
    if (!/^\d{3,16}$/.test(no_kk)) {
      return reply.status(400).send({ error: 'Nomor KK harus berupa angka (3 - 16 digit)' })
    }

    const refNumber = generateRefNumber()

    // Otomatis masukkan NIK baru ke database penduduk jika belum ada
    await db.insert(penduduk).values({
      nik,
      noKk: no_kk,
      namaLengkap: nama,
    }).onConflictDoNothing({ target: penduduk.nik })

    await db.insert(suratPengajuan).values({
      refNumber,
      nama,
      nik,
      noKk: no_kk,
      jenisSurat: jenis_surat,
      keperluan,
      noWa: no_wa,
      dokumenPath,
    })

    return reply.status(201).send({ ref_number: refNumber, message: 'Pengajuan surat berhasil dikirim' })
  })

  // GET /api/surat/cek/:nik (public)
  fastify.get('/api/surat/cek/:nik', async (request, reply) => {
    const { nik } = request.params as { nik: string }
    
    if (!/^\d{3,16}$/.test(nik)) {
      return reply.status(400).send({ error: 'NIK tidak valid' })
    }

    const result = await db
      .select({
        id: suratPengajuan.id,
        ref_number: suratPengajuan.refNumber,
        nama: suratPengajuan.nama,
        jenis_surat: suratPengajuan.jenisSurat,
        status: suratPengajuan.status,
        created_at: suratPengajuan.createdAt,
      })
      .from(suratPengajuan)
      .where(eq(suratPengajuan.nik, nik))
      .orderBy(desc(suratPengajuan.createdAt))

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Tidak ada surat yang ditemukan untuk NIK ini' })
    }
    
    return result
  })

  // GET /api/surat (auth required — admin list)
  fastify.get('/api/surat', { preHandler: requireAuth }, async (request) => {
    const { status } = request.query as { status?: string }

    if (status && status !== 'Semua') {
      return db
        .select()
        .from(suratPengajuan)
        .where(eq(suratPengajuan.status, status))
        .orderBy(desc(suratPengajuan.createdAt))
    }

    return db.select().from(suratPengajuan).orderBy(desc(suratPengajuan.createdAt))
  })

  // GET /api/surat/:id (auth required)
  fastify.get('/api/surat/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await db
      .select()
      .from(suratPengajuan)
      .where(eq(suratPengajuan.id, parseInt(id)))
      .limit(1)

    if (result.length === 0) {
      return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' })
    }

    // Return with snake_case keys to match existing API
    const row = result[0]
    return {
      id: row.id,
      ref_number: row.refNumber,
      nama: row.nama,
      nik: row.nik,
      no_kk: row.noKk,
      jenis_surat: row.jenisSurat,
      keperluan: row.keperluan,
      no_wa: row.noWa,
      dokumen_path: row.dokumenPath,
      status: row.status,
      created_at: row.createdAt,
    }
  })

  // PUT /api/surat/:id/status (auth required)
  fastify.put('/api/surat/:id/status', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { status } = request.body as { status?: string }

    if (!status || !['Diajukan', 'Diproses', 'Selesai'].includes(status)) {
      return reply.status(400).send({ error: 'Status tidak valid. Gunakan: Diajukan, Diproses, atau Selesai' })
    }

    const existing = await db
      .select()
      .from(suratPengajuan)
      .where(eq(suratPengajuan.id, parseInt(id)))
      .limit(1)

    if (existing.length === 0) {
      return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' })
    }

    await db
      .update(suratPengajuan)
      .set({ status })
      .where(eq(suratPengajuan.id, parseInt(id)))

    return { message: `Status diperbarui menjadi "${status}"` }
  })

  // GET /api/surat/:id/download-surat (public)
  fastify.get('/api/surat/:id/download-surat', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    const [surat] = await db
      .select()
      .from(suratPengajuan)
      .where(eq(suratPengajuan.id, parseInt(id)))
      .limit(1)

    if (!surat) {
      return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' })
    }

    if (surat.status !== 'Selesai') {
      return reply.status(400).send({ error: 'Surat belum selesai diproses' })
    }

    // Ambil data penduduk
    const [warga] = await db
      .select()
      .from(penduduk)
      .where(eq(penduduk.nik, surat.nik))
      .limit(1)

    // Tentukan template mana yang dipakai berdasarkan jenis surat
    let templateName = ''
    if (surat.jenisSurat.toLowerCase().includes('domisili')) {
      templateName = 'Surat_Domisili.docx'
    } else if (surat.jenisSurat.toLowerCase().includes('beda nama')) {
      templateName = 'Surat_Beda_Nama.docx'
    } else {
      // Default fallback jika tidak match
      templateName = 'Surat_Domisili.docx'
    }

    const templatePath = path.resolve(`../web/public/templates/${templateName}`)
    if (!fs.existsSync(templatePath)) {
      return reply.status(404).send({ error: 'Template surat tidak ditemukan' })
    }

    try {
      const content = fs.readFileSync(templatePath, 'binary')
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      // Set data untuk di-replace di dalam template Word
      doc.render({
        nama: warga?.namaLengkap || surat.nama,
        nik: surat.nik,
        noKk: surat.noKk,
        tempatLahir: warga?.tempatLahir || '',
        tanggalLahir: warga?.tanggalLahir || '',
        jenisKelamin: warga?.jenisKelamin || '',
        agama: warga?.agama || '',
        pekerjaan: warga?.jenisPekerjaan || '',
        alamat: warga?.alamat || '',
        rt: warga?.rt || '',
        rw: warga?.rw || '',
        keperluan: surat.keperluan,
        tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      })

      const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })

      reply.header('Content-Disposition', `attachment; filename="${surat.jenisSurat}_${surat.nama}.docx"`)
      reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return reply.send(buf)
    } catch (error) {
      console.error('Error generating document:', error)
      return reply.status(500).send({ error: 'Gagal membuat dokumen surat' })
    }
  })
}

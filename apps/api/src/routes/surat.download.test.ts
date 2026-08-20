import Fastify from 'fastify'
import PizZip from 'pizzip'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db, pool } from '../db/index.js'
import { suratPengajuan } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { suratRoutes } from './surat.js'
import { setToken, deleteToken } from '../plugins/auth.js'

function extractDocumentXml(docxBuffer: Buffer): string {
  const zip = new PizZip(docxBuffer)
  return zip.file('word/document.xml')!.asText()
}

// Integration tests for GET /api/surat/:id/download-surat, covering the three
// bug fixes made to this public endpoint: no stack trace in error responses,
// nomor_surat override gated behind admin auth, and a hard 400 (instead of a
// silent wrong template) for an unrecognized jenis_surat.
// Requires a reachable Postgres database (DATABASE_URL from apps/api/.env).
describe('GET /api/surat/:id/download-surat', () => {
  const app = Fastify()
  const adminToken = 'test-admin-token-for-download-surat-spec'
  const realRefNumber = `TEST-REF-${Date.now()}`
  let unmatchedJenisSuratId: number
  let matchedJenisSuratId: number

  beforeAll(async () => {
    await app.register(suratRoutes)
    await app.ready()
    setToken(adminToken, 'test-admin')

    const [unmatched] = await db.insert(suratPengajuan).values({
      refNumber: `TEST-${Date.now()}-A`,
      nama: 'Warga Uji Coba',
      nik: '0000000000000000',
      noKk: '0000000000000000',
      jenisSurat: 'Surat Aneh Yang Tidak Ada Templatenya',
      keperluan: 'Pengujian otomatis',
      noWa: '628000000000',
      status: 'Selesai',
    }).returning({ id: suratPengajuan.id })
    unmatchedJenisSuratId = unmatched.id

    const [matched] = await db.insert(suratPengajuan).values({
      refNumber: realRefNumber,
      nama: 'Warga Uji Coba Usaha',
      nik: '0000000000000001',
      noKk: '0000000000000001',
      jenisSurat: 'Surat Keterangan Usaha',
      keperluan: 'Pengujian otomatis',
      noWa: '628000000000',
      status: 'Selesai',
    }).returning({ id: suratPengajuan.id })
    matchedJenisSuratId = matched.id
  })

  afterAll(async () => {
    await db.delete(suratPengajuan).where(eq(suratPengajuan.id, unmatchedJenisSuratId))
    await db.delete(suratPengajuan).where(eq(suratPengajuan.id, matchedJenisSuratId))
    deleteToken(adminToken)
    await app.close()
    await pool.end()
  })

  it('returns 400 with no matching template, instead of silently using the wrong one', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/surat/${unmatchedJenisSuratId}/download-surat`,
    })

    expect(res.statusCode).toBe(400)
    expect(res.json()).toMatchObject({
      error: expect.stringContaining('Tidak ada template dokumen'),
    })
  })

  it('returns 404 without leaking a stack trace for a nonexistent surat', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/surat/999999999/download-surat',
    })

    expect(res.statusCode).toBe(404)
    expect(res.json()).not.toHaveProperty('stack')
  })

  it('ignores a nomor_surat override from an unauthenticated caller', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/surat/${matchedJenisSuratId}/download-surat?nomor_surat=470/PALSU/2099`,
    })

    expect(res.statusCode).toBe(200)
    const xml = extractDocumentXml(res.rawPayload)
    expect(xml).not.toContain('PALSU')
    expect(xml).toContain(realRefNumber)
  })

  it('honors a nomor_surat override from an authenticated admin', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/surat/${matchedJenisSuratId}/download-surat?nomor_surat=470/ASLI-ADMIN/2026`,
      headers: { authorization: `Bearer ${adminToken}` },
    })

    expect(res.statusCode).toBe(200)
    const xml = extractDocumentXml(res.rawPayload)
    expect(xml).toContain('ASLI-ADMIN')
  })
})

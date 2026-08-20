import { FastifyInstance } from 'fastify'
import { desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { pengumuman } from '../db/schema.js'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free'
const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY_TURNS = 6

// Rate limit sederhana per-IP, in-memory (proses-lokal, sama seperti auth token
// store) — cukup untuk mencegah 1 klien membanjiri kuota gratis OpenRouter.
const RATE_LIMIT_MAX = 15
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

const JENIS_SURAT_INFO = `
- Surat Keterangan Domisili: bukti domisili tempat tinggal sah di wilayah Desa Sukarama.
- Surat Keterangan Usaha (SKU): legalitas kepemilikan usaha aktif di desa untuk pinjaman/izin.
- Surat Beda Nama (KTP vs KK): klarifikasi resmi perbedaan ejaan nama antara Kartu Keluarga dan KTP/Ijazah.
- Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu: pernyataan keikutsertaan program bantuan/kegiatan pemberdayaan.
Semua pengajuan surat dilakukan online lewat halaman "Layanan" di website ini, memakai NIK dan No. KK. Status bisa dicek dengan nomor referensi yang diberikan setelah pengajuan. Dokumen bisa diunduh setelah status "Selesai".
`.trim()

const CONTACT_INFO = `
- Alamat Kantor Desa: Jl. Raya Sukarama No. 01, Kec. Bojongpicung, Kab. Cianjur, Jawa Barat 43283
- Telepon/WhatsApp: (0263) 123-4567 / 0812-3456-7890
- Email: desa.sukarama@cianjurkab.go.id
- Jam Pelayanan: Senin - Jumat 08.00-15.00 WIB, Sabtu-Minggu & hari libur tutup
`.trim()

async function buildSystemPrompt(): Promise<string> {
  const pengumumanTerbaru = await db
    .select({ judul: pengumuman.judul, tanggal: pengumuman.tanggal })
    .from(pengumuman)
    .orderBy(desc(pengumuman.tanggal), desc(pengumuman.id))
    .limit(5)

  const pengumumanText = pengumumanTerbaru.length > 0
    ? pengumumanTerbaru.map(p => `- ${p.judul} (${p.tanggal})`).join('\n')
    : '(belum ada pengumuman terbaru)'

  return `Kamu adalah "Asisten Desa", chatbot resmi website Desa Sukarama, Kec. Bojongpicung, Kab. Cianjur.

Tugasmu HANYA menjawab pertanyaan seputar layanan dan informasi desa ini, menggunakan informasi berikut:

## Jenis surat yang bisa diajukan online
${JENIS_SURAT_INFO}

## Kontak & jam layanan
${CONTACT_INFO}

## Pengumuman terbaru
${pengumumanText}

## Aturan penting
- Jawab singkat, ramah, dan dalam Bahasa Indonesia.
- Kalau pertanyaan di luar topik desa (bukan soal layanan surat, pengumuman, kontak, atau UMKM desa), tolak dengan sopan dan arahkan kembali ke topik desa.
- Jangan pernah meminta warga mengirimkan NIK, No. KK, atau data pribadi lain lewat chat ini — arahkan mereka ke halaman "Layanan" resmi untuk pengajuan yang butuh data pribadi.
- Jangan mengarang informasi (nomor surat, status pengajuan, jadwal) yang tidak ada di atas — kalau tidak tahu, arahkan untuk menghubungi kantor desa langsung.
- Jangan memberi nasihat hukum/keuangan personal, hanya info umum layanan desa.`
}

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.post('/api/chat', async (request, reply) => {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return reply.status(503).send({ error: 'Fitur chat AI belum dikonfigurasi di server.' })
    }

    const ip = request.ip
    if (isRateLimited(ip)) {
      return reply.status(429).send({ error: 'Terlalu banyak pesan. Silakan coba lagi beberapa menit lagi.' })
    }

    const { message, history } = request.body as {
      message?: string
      history?: { role: 'user' | 'bot'; text: string }[]
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return reply.status(400).send({ error: 'Pesan tidak boleh kosong.' })
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return reply.status(400).send({ error: `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.` })
    }

    const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_TURNS) : []

    try {
      const systemPrompt = await buildSystemPrompt()

      const messages = [
        { role: 'system', content: systemPrompt },
        ...trimmedHistory.map(h => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: String(h.text).slice(0, MAX_MESSAGE_LENGTH),
        })),
        { role: 'user', content: message.trim() },
      ]

      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: MODEL, messages }),
      })

      if (!res.ok) {
        fastify.log.error(`OpenRouter error ${res.status}: ${await res.text()}`)
        return reply.status(502).send({ error: 'Asisten sedang tidak bisa dihubungi, silakan coba lagi nanti.' })
      }

      const data = await res.json() as any
      const reply_text = data?.choices?.[0]?.message?.content?.trim()

      if (!reply_text) {
        return reply.status(502).send({ error: 'Asisten tidak memberikan jawaban, silakan coba lagi.' })
      }

      return { reply: reply_text }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Terjadi kesalahan saat menghubungi asisten.' })
    }
  })
}

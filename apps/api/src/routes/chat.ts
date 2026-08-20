import { FastifyInstance } from 'fastify'
import { desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { pengumuman } from '../db/schema.js'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Model gratis di OpenRouter berbagi kuota upstream (sering kena 429 sesaat)
// dan model kecil kadang balas 200 OK tapi isinya rusak. Dicoba satu-satu
// secara berurutan (lihat loop di bawah) sampai dapat jawaban yang valid.
const FALLBACK_MODELS = [
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
]
const MODELS = process.env.OPENROUTER_MODEL
  ? [process.env.OPENROUTER_MODEL, ...FALLBACK_MODELS.filter(m => m !== process.env.OPENROUTER_MODEL)]
  : FALLBACK_MODELS
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
Semua jenis surat diajukan lewat form online di halaman "Layanan". Data yang selalu diminta di semua jenis surat: Nama, NIK, No. KK, Keperluan surat, No. WhatsApp, pilih penandatangan (Kepala Desa atau Sekretaris Desa), dan lampiran foto KTP/KK (opsional, maks 5MB, format jpg/png/pdf).

Jenis surat yang tersedia dan data tambahan yang diminta:
- Surat Keterangan Domisili: bukti domisili tempat tinggal sah di wilayah Desa Sukarama. Tidak ada data tambahan selain data umum di atas.
- Surat Keterangan Usaha (SKU): legalitas kepemilikan usaha aktif di desa untuk pinjaman/izin. Data tambahan: bidang/jenis usaha, lama usaha berjalan, alamat lokasi usaha.
- Surat Beda Nama (KTP vs KK): klarifikasi resmi perbedaan ejaan nama antara Kartu Keluarga dan KTP/dokumen lain. Data tambahan: nama sesuai Kartu Keluarga, dan nama sesuai KTP/dokumen lain.
- Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu: pernyataan keikutsertaan program bantuan/kegiatan pemberdayaan desa. Data tambahan: nama program/kegiatan, tahun program.

Setelah form dikirim, pemohon dapat nomor referensi untuk cek status pengajuan. Dokumen .docx bisa diunduh setelah status berubah menjadi "Selesai".
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

## Format jawaban
- Tulis PLAIN TEXT saja — JANGAN pakai simbol markdown sama sekali (tidak ada **tebal**, tidak ada tanda #, tidak ada bullet "-" atau "*"). Tampilan chat ini tidak merender markdown, jadi simbol-simbol itu akan muncul mentah dan bikin jawaban terlihat berantakan.
- Kalau perlu langkah bernomor, tulis dengan angka biasa diikuti titik dan baris baru, misalnya:
1. Buka halaman Layanan
2. Pilih jenis surat
- Pisahkan poin/paragraf dengan baris baru biasa (enter), bukan simbol.

## Cara menjawab
- Ngobrol senatural dan seramah mungkin, seperti petugas desa yang membantu langsung — bukan seperti robot yang kaku atau template.
- Kalau kamu TIDAK TAHU jawabannya (tidak ada di informasi atas, atau di luar hal yang kamu pahami), akui terus terang "maaf, saya belum punya info soal itu" lalu arahkan ke kontak kantor desa di atas. JANGAN mengarang jawaban, apalagi soal nomor surat, status pengajuan, atau jadwal yang tidak tercantum di atas.
- Kalau pertanyaan di luar topik desa sama sekali (misal soal berita nasional, hiburan, dll), boleh jawab singkat dengan sopan lalu arahkan kembali ke topik layanan desa — tidak perlu menolak secara kaku, cukup natural seperti obrolan biasa.
- Jangan pernah meminta warga mengirimkan NIK, No. KK, atau data pribadi lain lewat chat ini — arahkan mereka ke halaman "Layanan" resmi untuk pengajuan yang butuh data pribadi.
- Jangan memberi nasihat hukum/keuangan personal, hanya info umum layanan desa.
- Jawab dalam Bahasa Indonesia, singkat dan jelas (tidak perlu bertele-tele).`
}

// Jaring pengaman kalau model tetap terlepas menulis markdown meski sudah
// diinstruksikan lewat system prompt — widget chat cuma render plain text.
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // **tebal**
    .replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '$1') // *miring*
    .replace(/^#{1,6}\s+/gm, '') // # heading
    .replace(/^[ \t]*[-*]\s+/gm, '') // - bullet / * bullet
    .trim()
}

// Model kecil gratis kadang "macet" dan mengulang kata yang sama puluhan kali
// (glitch, bukan jawaban valid) — deteksi ini supaya tidak dikirim ke warga.
export function hasRepetitionLoop(text: string): boolean {
  const words = text.split(/\s+/)
  let run = 1
  for (let i = 1; i < words.length; i++) {
    if (words[i].length > 1 && words[i] === words[i - 1]) {
      run++
      if (run >= 6) return true
    } else {
      run = 1
    }
  }
  return false
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

      // Coba tiap model satu-satu (bukan sekadar kirim array `models` ke
      // OpenRouter) supaya kita bisa memvalidasi ISI jawabannya, bukan cuma
      // status HTTP-nya — model kecil gratis kadang balas 200 OK tapi isinya
      // rusak (macet mengulang kata yang sama).
      let rawReply: string | undefined
      let lastErrorStatus: number | undefined

      for (const model of MODELS) {
        const res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 600 }),
        })

        if (!res.ok) {
          lastErrorStatus = res.status
          fastify.log.error(`OpenRouter error (${model}) ${res.status}: ${await res.text()}`)
          continue
        }

        const data = await res.json() as any
        const candidate = data?.choices?.[0]?.message?.content?.trim()

        if (candidate && !hasRepetitionLoop(candidate)) {
          rawReply = candidate
          break
        }
        fastify.log.error(`Model ${model} returned an empty or degenerate reply, trying next fallback`)
      }

      if (!rawReply) {
        fastify.log.error(`All chat models failed, last status: ${lastErrorStatus}`)
        return reply.status(502).send({ error: 'Maaf, asisten sedang sibuk. Coba tanya lagi sebentar lagi ya.' })
      }

      return { reply: stripMarkdown(rawReply) }
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({ error: 'Terjadi kesalahan saat menghubungi asisten.' })
    }
  })
}

import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { suratPengajuan } from '../db/schema.js';
import { getToken } from '../plugins/auth.js';
async function requireAuth(request, reply) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!token || !getToken(token)) {
        return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
    request.admin = getToken(token);
}
function generateRefNumber() {
    const now = new Date();
    const prefix = 'SKR';
    const y = String(now.getFullYear()).slice(2);
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${prefix}-${y}${m}${d}-${rand}`;
}
function bufferToDataURI(buffer, mimetype) {
    const b64 = buffer.toString('base64');
    return `data:${mimetype};base64,${b64}`;
}
const allowedDocumentTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
]);
export async function suratRoutes(fastify) {
    // POST /api/surat (multipart — public)
    fastify.post('/api/surat', async (request, reply) => {
        const parts = request.parts();
        const fields = {};
        let dokumenPath = null;
        for await (const part of parts) {
            if (part.type === 'file') {
                if (part.fieldname === 'dokumen') {
                    if (!allowedDocumentTypes.has(part.mimetype)) {
                        return reply.status(400).send({ error: 'Dokumen harus berupa JPG, PNG, GIF, WEBP, atau PDF' });
                    }
                    const buffer = await part.toBuffer();
                    dokumenPath = bufferToDataURI(buffer, part.mimetype);
                }
            }
            else {
                fields[part.fieldname] = part.value;
            }
        }
        const { nama, nik, no_kk, jenis_surat, keperluan, no_wa } = fields;
        if (!nama || !nik || !no_kk || !jenis_surat || !keperluan || !no_wa) {
            return reply.status(400).send({ error: 'Semua field wajib harus diisi' });
        }
        if (!/^\d{3,16}$/.test(nik)) {
            return reply.status(400).send({ error: 'NIK harus berupa angka (3 - 16 digit)' });
        }
        if (!/^\d{3,16}$/.test(no_kk)) {
            return reply.status(400).send({ error: 'Nomor KK harus berupa angka (3 - 16 digit)' });
        }
        const refNumber = generateRefNumber();
        await db.insert(suratPengajuan).values({
            refNumber,
            nama,
            nik,
            noKk: no_kk,
            jenisSurat: jenis_surat,
            keperluan,
            noWa: no_wa,
            dokumenPath,
        });
        return reply.status(201).send({ ref_number: refNumber, message: 'Pengajuan surat berhasil dikirim' });
    });
    // GET /api/surat/cek/:ref (public)
    fastify.get('/api/surat/cek/:ref', async (request, reply) => {
        const { ref } = request.params;
        const result = await db
            .select({
            ref_number: suratPengajuan.refNumber,
            nama: suratPengajuan.nama,
            jenis_surat: suratPengajuan.jenisSurat,
            status: suratPengajuan.status,
            created_at: suratPengajuan.createdAt,
        })
            .from(suratPengajuan)
            .where(eq(suratPengajuan.refNumber, ref))
            .limit(1);
        if (result.length === 0) {
            return reply.status(404).send({ error: 'Nomor referensi tidak ditemukan' });
        }
        return result[0];
    });
    // GET /api/surat (auth required — admin list)
    fastify.get('/api/surat', { preHandler: requireAuth }, async (request) => {
        const { status } = request.query;
        if (status && status !== 'Semua') {
            return db
                .select()
                .from(suratPengajuan)
                .where(eq(suratPengajuan.status, status))
                .orderBy(desc(suratPengajuan.createdAt));
        }
        return db.select().from(suratPengajuan).orderBy(desc(suratPengajuan.createdAt));
    });
    // GET /api/surat/:id (auth required)
    fastify.get('/api/surat/:id', { preHandler: requireAuth }, async (request, reply) => {
        const { id } = request.params;
        const result = await db
            .select()
            .from(suratPengajuan)
            .where(eq(suratPengajuan.id, parseInt(id)))
            .limit(1);
        if (result.length === 0) {
            return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' });
        }
        // Return with snake_case keys to match existing API
        const row = result[0];
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
        };
    });
    // PUT /api/surat/:id/status (auth required)
    fastify.put('/api/surat/:id/status', { preHandler: requireAuth }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        if (!status || !['Diajukan', 'Diproses', 'Selesai'].includes(status)) {
            return reply.status(400).send({ error: 'Status tidak valid. Gunakan: Diajukan, Diproses, atau Selesai' });
        }
        const existing = await db
            .select()
            .from(suratPengajuan)
            .where(eq(suratPengajuan.id, parseInt(id)))
            .limit(1);
        if (existing.length === 0) {
            return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' });
        }
        await db
            .update(suratPengajuan)
            .set({ status })
            .where(eq(suratPengajuan.id, parseInt(id)));
        return { message: `Status diperbarui menjadi "${status}"` };
    });
}
//# sourceMappingURL=surat.js.map
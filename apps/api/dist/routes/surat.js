import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { suratPengajuan, penduduk } from '../db/schema.js';
import { getToken } from '../plugins/auth.js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import fs from 'fs';
import path from 'path';
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
// In-memory template and signature asset caching for blazing-fast generation
const templateCache = new Map();
const imageCache = new Map();
function getCachedTemplate(templatePath) {
    // Nonaktifkan cache sementara (baca file fresh) agar editan MS Word langsung berefek
    return fs.readFileSync(templatePath, 'binary');
}
function getCachedImage(imagePath) {
    let cached = imageCache.get(imagePath);
    if (!cached) {
        cached = fs.readFileSync(imagePath);
        imageCache.set(imagePath, cached);
    }
    return cached;
}
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
        const { nama, nik, no_kk, jenis_surat, keperluan, no_wa, nama_kk, nama_ktp, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, pekerjaan, alamat, nama_program, tahun_program, nama_usaha, sektor_usaha, nomor_kontak, bidang_usaha, alamat_usaha, lama_usaha, penandatangan } = fields;
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
        // Masukkan atau update NIK ke database penduduk
        const insertData = {
            nik,
            noKk: no_kk,
            namaLengkap: nama,
        };
        const updateData = { noKk: no_kk, namaLengkap: nama };
        if (tempat_lahir) {
            insertData.tempatLahir = tempat_lahir;
            updateData.tempatLahir = tempat_lahir;
        }
        if (tanggal_lahir) {
            insertData.tanggalLahir = tanggal_lahir;
            updateData.tanggalLahir = tanggal_lahir;
        }
        if (jenis_kelamin) {
            insertData.jenisKelamin = jenis_kelamin;
            updateData.jenisKelamin = jenis_kelamin;
        }
        if (agama) {
            insertData.agama = agama;
            updateData.agama = agama;
        }
        if (pekerjaan) {
            insertData.jenisPekerjaan = pekerjaan;
            updateData.jenisPekerjaan = pekerjaan;
        }
        if (alamat) {
            insertData.alamat = alamat;
            updateData.alamat = alamat;
        }
        await db.insert(penduduk).values(insertData).onConflictDoUpdate({
            target: penduduk.nik,
            set: updateData
        });
        await db.insert(suratPengajuan).values({
            refNumber,
            nama,
            nik,
            noKk: no_kk,
            jenisSurat: jenis_surat,
            keperluan,
            noWa: no_wa,
            dokumenPath,
            metadata: {
                namaKk: nama_kk || '',
                namaKtp: nama_ktp || '',
                namaProgram: nama_program || '',
                tahunProgram: tahun_program || '',
                namaUsaha: nama_usaha || '',
                sektorUsaha: sektor_usaha || '',
                nomorKontak: nomor_kontak || '',
                bidangUsaha: bidang_usaha || '',
                alamatUsaha: alamat_usaha || '',
                lamaUsaha: lama_usaha || '',
                penandatangan: penandatangan || 'Kepala Desa'
            }
        });
        return reply.status(201).send({ ref_number: refNumber, message: 'Pengajuan surat berhasil dikirim' });
    });
    // GET /api/surat/cek-penduduk/:nik (public)
    fastify.get('/api/surat/cek-penduduk/:nik', async (request, reply) => {
        const { nik } = request.params;
        if (!/^\d{3,16}$/.test(nik)) {
            return reply.status(400).send({ error: 'NIK tidak valid' });
        }
        const [warga] = await db
            .select({
            namaLengkap: penduduk.namaLengkap,
            noKk: penduduk.noKk
        })
            .from(penduduk)
            .where(eq(penduduk.nik, nik))
            .limit(1);
        if (!warga) {
            return { found: false };
        }
        return { found: true, namaLengkap: warga.namaLengkap, noKk: warga.noKk };
    });
    // GET /api/surat/cek/:nik (public)
    fastify.get('/api/surat/cek/:nik', async (request, reply) => {
        const { nik } = request.params;
        if (!/^\d{3,16}$/.test(nik)) {
            return reply.status(400).send({ error: 'NIK tidak valid' });
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
            .orderBy(desc(suratPengajuan.createdAt));
        if (result.length === 0) {
            return reply.status(404).send({ error: 'Tidak ada surat yang ditemukan untuk NIK ini' });
        }
        return result;
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
    // GET /api/surat/:id/download-surat (public)
    fastify.get('/api/surat/:id/download-surat', async (request, reply) => {
        const { id } = request.params;
        const [surat] = await db
            .select()
            .from(suratPengajuan)
            .where(eq(suratPengajuan.id, parseInt(id)))
            .limit(1);
        if (!surat) {
            return reply.status(404).send({ error: 'Pengajuan tidak ditemukan' });
        }
        if (surat.status !== 'Selesai') {
            return reply.status(400).send({ error: 'Surat belum selesai diproses' });
        }
        // Ambil data penduduk
        const [warga] = await db
            .select()
            .from(penduduk)
            .where(eq(penduduk.nik, surat.nik))
            .limit(1);
        // Tentukan template mana yang dipakai berdasarkan jenis surat
        let templateName = '';
        if (surat.jenisSurat.toLowerCase().includes('domisili')) {
            templateName = 'Surat_Domisili.docx';
        }
        else if (surat.jenisSurat.toLowerCase().includes('beda nama')) {
            templateName = 'Surat_Beda_Nama.docx';
        }
        else if (surat.jenisSurat.toLowerCase().includes('pernyataan kesediaan')) {
            templateName = 'Surat Pernyataan Kesediaan Mengikuti Program.docx';
        }
        else if (surat.jenisSurat.toLowerCase().includes('usaha')) {
            templateName = 'SKU.docx';
        }
        else {
            // Default fallback jika tidak match
            templateName = 'Surat_Domisili.docx';
        }
        function findTemplatePath(fileName) {
            const candidates = [
                path.resolve(`../web/public/templates/${fileName}`),
                path.resolve(`apps/web/public/templates/${fileName}`),
                path.resolve(process.cwd(), `../web/public/templates/${fileName}`),
                path.resolve(process.cwd(), `apps/web/public/templates/${fileName}`),
            ];
            for (const c of candidates) {
                if (fs.existsSync(c))
                    return c;
            }
            return candidates[0];
        }
        const templatePath = findTemplatePath(templateName);
        if (!fs.existsSync(templatePath)) {
            return reply.status(404).send({ error: 'Template surat tidak ditemukan' });
        }
        try {
            const content = getCachedTemplate(templatePath);
            const zip = new PizZip(content);
            const opts = {
                centered: false,
                getImage(tagValue) {
                    return getCachedImage(tagValue);
                },
                getSize() {
                    return [130, 70]; // Width and height of the signature (dikurangi agar tidak terlalu besar)
                }
            };
            const imageModule = new ImageModule(opts);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                modules: [imageModule],
                nullGetter(part) {
                    if (!part.module) {
                        return "";
                    }
                    if (part.module === "rawxml") {
                        return "";
                    }
                    return "";
                }
            });
            let metadata = {};
            if (typeof surat.metadata === 'string') {
                try {
                    metadata = JSON.parse(surat.metadata);
                }
                catch (e) { }
            }
            else if (surat.metadata) {
                metadata = surat.metadata;
            }
            const penandatangan = metadata?.penandatangan || 'Kepala Desa';
            const ttdFileName = penandatangan === 'Sekretaris Desa' ? 'ttd_sekdes.png' : 'ttd kades.png';
            const ttdPath = findTemplatePath(ttdFileName);
            const namaPemohon = warga?.namaLengkap || surat.nama;
            let formattedTanggalLahir = warga?.tanggalLahir || '-';
            if (warga?.tanggalLahir) {
                try {
                    const tgl = new Date(warga.tanggalLahir);
                    if (!isNaN(tgl.getTime())) {
                        formattedTanggalLahir = tgl.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    }
                }
                catch (e) { }
            }
            const tempatTglLahir = `${warga?.tempatLahir || '-'}, ${formattedTanggalLahir}`;
            const now = new Date();
            const tglSurat = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const berlakuDate = new Date(now);
            berlakuDate.setMonth(berlakuDate.getMonth() + 3); // Berlaku 3 bulan otomatis
            const tglBerlaku = berlakuDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const toTitleCase = (str) => {
                if (!str)
                    return '';
                return str.toString().toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
            };
            const toUpper = (str) => (str || '').toString().toUpperCase();
            // Render dokumen dengan data
            doc.render({
                nama: toUpper(namaPemohon),
                NAMA: toUpper(namaPemohon),
                nik: surat.nik,
                NIK: surat.nik,
                noKk: surat.noKk,
                NO_KK: surat.noKk,
                keperluan: toUpper(surat.keperluan),
                KEPERLUAN: toUpper(surat.keperluan),
                tempatLahir: toTitleCase(warga?.tempatLahir),
                tanggalLahir: warga?.tanggalLahir || '',
                tempat_tanggal_lahir: toTitleCase(tempatTglLahir),
                TEMPAT_TANGGAL_LAHIR: toTitleCase(tempatTglLahir),
                tempatTanggalLahir: toTitleCase(tempatTglLahir),
                jenisKelamin: toTitleCase(warga?.jenisKelamin),
                JENIS_KELAMIN: toTitleCase(warga?.jenisKelamin),
                statusPerkawinan: toTitleCase(warga?.statusPerkawinan),
                STATUS_PERKAWINAN: toTitleCase(warga?.statusPerkawinan),
                agama: toTitleCase(warga?.agama),
                AGAMA: toTitleCase(warga?.agama),
                pekerjaan: toTitleCase(warga?.jenisPekerjaan),
                PEKERJAAN: toTitleCase(warga?.jenisPekerjaan),
                alamat: toTitleCase(warga?.alamat),
                ALAMAT: toTitleCase(warga?.alamat),
                rt: warga?.rt || '',
                rw: warga?.rw || '',
                tanggal: tglSurat,
                tanggal_surat: tglSurat,
                TANGGAL_SURAT: tglSurat,
                namaKk: toTitleCase(metadata?.namaKk),
                namaKtp: toTitleCase(metadata?.namaKtp),
                tempatLahirKk: toTitleCase(warga?.tempatLahir),
                tanggalLahirKk: warga?.tanggalLahir || '',
                nama_program: toTitleCase(metadata?.namaProgram),
                NAMA_PROGRAM: toTitleCase(metadata?.namaProgram),
                namaProgram: toTitleCase(metadata?.namaProgram),
                tahun_program: metadata?.tahunProgram || '',
                TAHUN_PROGRAM: metadata?.tahunProgram || '',
                tahunProgram: metadata?.tahunProgram || '',
                nama_usaha: toTitleCase(metadata?.namaUsaha),
                NAMA_USAHA: toTitleCase(metadata?.namaUsaha),
                namaUsaha: toTitleCase(metadata?.namaUsaha),
                sektor_usaha: toTitleCase(metadata?.sektorUsaha),
                SEKTOR_USAHA: toTitleCase(metadata?.sektorUsaha),
                sektorUsaha: toTitleCase(metadata?.sektorUsaha),
                nomor_kontak: metadata?.nomorKontak || '',
                NOMOR_KONTAK: metadata?.nomorKontak || '',
                nomorKontak: metadata?.nomorKontak || '',
                bidang_usaha: toTitleCase(metadata?.bidangUsaha),
                BIDANG_USAHA: toTitleCase(metadata?.bidangUsaha),
                bidangUsaha: toTitleCase(metadata?.bidangUsaha),
                alamat_usaha: toTitleCase(metadata?.alamatUsaha),
                ALAMAT_USAHA: toTitleCase(metadata?.alamatUsaha),
                alamatUsaha: toTitleCase(metadata?.alamatUsaha),
                lama_usaha: metadata?.lamaUsaha || '',
                LAMA_USAHA: metadata?.lamaUsaha || '',
                lamaUsaha: metadata?.lamaUsaha || '',
                tanggal_berlaku: tglBerlaku,
                TANGGAL_BERLAKU: tglBerlaku,
                tanggalBerlaku: tglBerlaku,
                nomor_surat: request.query.nomor_surat || surat.refNumber,
                NOMOR_SURAT: request.query.nomor_surat || surat.refNumber,
                jabatan_penandatangan: metadata?.penandatangan === 'Sekretaris Desa' ? 'Sekretaris Desa' : 'Kepala Desa',
                JABATAN_PENANDATANGAN: metadata?.penandatangan === 'Sekretaris Desa' ? 'SEKRETARIS DESA' : 'KEPALA DESA',
                nama_penandatangan: metadata?.penandatangan === 'Sekretaris Desa' ? 'WAWAN SAEPUDIN' : 'WAHYU KOMARA',
                NAMA_PENANDATANGAN: metadata?.penandatangan === 'Sekretaris Desa' ? 'WAWAN SAEPUDIN' : 'WAHYU KOMARA',
                nip_penandatangan: metadata?.penandatangan === 'Sekretaris Desa' ? '19820212 201001 1 015' : '-', // Ganti NIP Sekdes di sini
                NIP_PENANDATANGAN: metadata?.penandatangan === 'Sekretaris Desa' ? '19820212 201001 1 015' : '-', // Ganti NIP Kepala Desa jika ada
                nipd: '',
                NIPD: '',
                namaPejabat: metadata?.penandatangan === 'Sekretaris Desa' ? 'WAWAN SAEPUDIN' : 'WAHYU KOMARA',
                NamaPejabat: metadata?.penandatangan === 'Sekretaris Desa' ? 'WAWAN SAEPUDIN' : 'WAHYU KOMARA',
                NAMA_KEPALA_DESA: metadata?.penandatangan === 'Sekretaris Desa' ? 'WAWAN SAEPUDIN' : 'WAHYU KOMARA',
                jabatan: metadata?.penandatangan === 'Sekretaris Desa' ? 'Sekretaris Desa' : 'Kepala Desa',
                Jabatan: metadata?.penandatangan === 'Sekretaris Desa' ? 'Sekretaris Desa' : 'Kepala Desa',
                jabatanPejabat: metadata?.penandatangan === 'Sekretaris Desa' ? 'Sekretaris Desa' : 'Kepala Desa',
                JabatanPejabat: metadata?.penandatangan === 'Sekretaris Desa' ? 'Sekretaris Desa' : 'Kepala Desa',
                ttd: fs.existsSync(ttdPath) ? ttdPath : null
            });
            const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
            reply.header('Content-Disposition', `attachment; filename="${surat.jenisSurat}_${surat.nama}.docx"`);
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            return reply.send(buf);
        }
        catch (error) {
            console.error('Error generating document:', error);
            const details = error.properties && error.properties.errors
                ? error.properties.errors.map((e) => e.message).join(', ')
                : error.message;
            return reply.status(500).send({ error: 'Gagal membuat dokumen surat', details, stack: error.stack });
        }
    });
}
//# sourceMappingURL=surat.js.map
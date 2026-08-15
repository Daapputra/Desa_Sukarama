import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pengumuman } from '../db/schema.js';
import { getToken } from '../plugins/auth.js';
async function requireAuth(request, reply) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!token || !getToken(token)) {
        return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
    request.admin = getToken(token);
}
export async function pengumumanRoutes(fastify) {
    // GET /api/pengumuman
    fastify.get('/api/pengumuman', async (request) => {
        const { limit } = request.query;
        const l = parseInt(limit || '100');
        const result = await db
            .select()
            .from(pengumuman)
            .orderBy(desc(pengumuman.tanggal), desc(pengumuman.id))
            .limit(l);
        return result;
    });
    // GET /api/pengumuman/:id
    fastify.get('/api/pengumuman/:id', async (request, reply) => {
        const { id } = request.params;
        const result = await db
            .select()
            .from(pengumuman)
            .where(eq(pengumuman.id, parseInt(id)))
            .limit(1);
        if (result.length === 0) {
            return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' });
        }
        return result[0];
    });
    // POST /api/pengumuman (auth required)
    fastify.post('/api/pengumuman', { preHandler: requireAuth }, async (request, reply) => {
        const { judul, konten, tanggal } = request.body;
        if (!judul || !konten || !tanggal) {
            return reply.status(400).send({ error: 'Judul, konten, dan tanggal harus diisi' });
        }
        const result = await db
            .insert(pengumuman)
            .values({ judul, konten, tanggal })
            .returning({ id: pengumuman.id });
        return reply.status(201).send({ id: result[0].id, judul, konten, tanggal });
    });
    // PUT /api/pengumuman/:id (auth required)
    fastify.put('/api/pengumuman/:id', { preHandler: requireAuth }, async (request, reply) => {
        const { id } = request.params;
        const existing = await db
            .select()
            .from(pengumuman)
            .where(eq(pengumuman.id, parseInt(id)))
            .limit(1);
        if (existing.length === 0) {
            return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' });
        }
        const { judul, konten, tanggal } = request.body;
        await db
            .update(pengumuman)
            .set({
            judul: judul || existing[0].judul,
            konten: konten || existing[0].konten,
            tanggal: tanggal || existing[0].tanggal,
        })
            .where(eq(pengumuman.id, parseInt(id)));
        return { message: 'Pengumuman berhasil diperbarui' };
    });
    // DELETE /api/pengumuman/:id (auth required)
    fastify.delete('/api/pengumuman/:id', { preHandler: requireAuth }, async (request, reply) => {
        const { id } = request.params;
        const existing = await db
            .select()
            .from(pengumuman)
            .where(eq(pengumuman.id, parseInt(id)))
            .limit(1);
        if (existing.length === 0) {
            return reply.status(404).send({ error: 'Pengumuman tidak ditemukan' });
        }
        await db.delete(pengumuman).where(eq(pengumuman.id, parseInt(id)));
        return { message: 'Pengumuman berhasil dihapus' };
    });
}
//# sourceMappingURL=pengumuman.js.map
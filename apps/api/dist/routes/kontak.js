import { desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { pesanKontak } from '../db/schema.js';
import { getToken } from '../plugins/auth.js';
async function requireAuth(request, reply) {
    const authHeader = request.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    if (!token || !getToken(token)) {
        return reply.status(401).send({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
    request.admin = getToken(token);
}
export async function kontakRoutes(fastify) {
    // POST /api/kontak (public)
    fastify.post('/api/kontak', async (request, reply) => {
        const { nama, kontak, pesan } = request.body;
        if (!nama || !kontak || !pesan) {
            return reply.status(400).send({ error: 'Semua field harus diisi' });
        }
        await db.insert(pesanKontak).values({ nama, kontak, pesan });
        return reply.status(201).send({ message: 'Pesan berhasil dikirim. Terima kasih!' });
    });
    // GET /api/kontak (auth required)
    fastify.get('/api/kontak', { preHandler: requireAuth }, async () => {
        return db.select().from(pesanKontak).orderBy(desc(pesanKontak.createdAt));
    });
}
//# sourceMappingURL=kontak.js.map
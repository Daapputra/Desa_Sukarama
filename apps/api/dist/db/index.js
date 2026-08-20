import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL wajib diisi untuk terhubung ke PostgreSQL database');
}
export const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
export const db = drizzle(pool, { schema });
export default db;
//# sourceMappingURL=index.js.map
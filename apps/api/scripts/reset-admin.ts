import { eq } from 'drizzle-orm'
import { db, pool } from '../src/db/index.js'
import { adminUsers } from '../src/db/schema.js'
import { hashPassword } from '../src/plugins/auth.js'
import crypto from 'node:crypto'

async function resetAdmin() {
  const password = process.argv[2] || 'admin123'
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)

  await db.update(adminUsers)
    .set({ passwordHash: hash, salt })
    .where(eq(adminUsers.username, 'admin'))

  console.log(process.argv[2]
    ? '✅ Password admin berhasil diganti.'
    : '✅ Admin password reset to: admin123')
  await pool.end()
}

resetAdmin().catch((err) => {
  console.error('❌ Reset admin error:', err)
  process.exit(1)
})

import { describe, it, expect, afterAll } from 'vitest'
import { eq, inArray } from 'drizzle-orm'
import { db, pool } from '../src/db/index.js'
import { penduduk } from '../src/db/schema.js'
import { upsertPendudukBatch } from './import-penduduk.js'

// Regression test for a bug where onConflictDoUpdate used a fixed JS value
// (batch[0].namaLengkap) instead of `excluded.<column>`, so every conflicting
// row in a batch got overwritten with the FIRST row's data on re-import.
// Requires a reachable Postgres database (DATABASE_URL from apps/api/.env).
describe('upsertPendudukBatch', () => {
  const NIK_A = 'TEST-UPSERT-0000000001'
  const NIK_B = 'TEST-UPSERT-0000000002'

  afterAll(async () => {
    await db.delete(penduduk).where(inArray(penduduk.nik, [NIK_A, NIK_B]))
    await pool.end()
  })

  it('updates each conflicting row with its own data, not the first row in the batch', async () => {
    await db.delete(penduduk).where(inArray(penduduk.nik, [NIK_A, NIK_B]))

    await upsertPendudukBatch([
      { nik: NIK_A, noKk: 'KK-A', namaLengkap: 'Warga A (lama)' },
      { nik: NIK_B, noKk: 'KK-B', namaLengkap: 'Warga B (lama)' },
    ])

    // Re-import with fresh data, same NIKs, in reverse order — this is the
    // scenario that used to corrupt data: row B's update would have used
    // row A's values because batch[0] was always the fixed reference.
    await upsertPendudukBatch([
      { nik: NIK_B, noKk: 'KK-B', namaLengkap: 'Warga B (baru)' },
      { nik: NIK_A, noKk: 'KK-A', namaLengkap: 'Warga A (baru)' },
    ])

    const rowA = await db.select().from(penduduk).where(eq(penduduk.nik, NIK_A)).limit(1)
    const rowB = await db.select().from(penduduk).where(eq(penduduk.nik, NIK_B)).limit(1)

    expect(rowA[0]?.namaLengkap).toBe('Warga A (baru)')
    expect(rowB[0]?.namaLengkap).toBe('Warga B (baru)')
  })
})

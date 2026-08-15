

import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './src/db/schema.js'
import xlsx from 'xlsx'
import path from 'path'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

async function importPenduduk() {
  console.log('🔄 Membaca file Excel...')
  const filePath = path.resolve('../../uploads/Data Penduduk Desa Sukarama Kecamatan Bojongpicung Status Nik Permanen.xlsx')
  
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  // Ambil data dalam bentuk array of arrays
  const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 })
  
  // Data sebenarnya mulai dari baris ke-3 (index 2)
  const rows = data.slice(2)
  
  const pendudukData = []
  
  for (const row of rows) {
    // Abaikan baris kosong
    if (!row[1] || !row[2] || !row[3]) continue;
    
    // NIK (index 3) biasanya bisa terbaca sebagai number oleh Excel, ubah jadi string
    const nik = String(row[3]).trim()
    const noKk = String(row[1]).trim()
    const namaLengkap = String(row[2]).trim()
    
    if (nik.length < 5) continue;
    
    pendudukData.push({
      noKk,
      nik,
      namaLengkap,
      jenisKelamin: row[4] ? String(row[4]).trim() : null,
      tempatLahir: row[5] ? String(row[5]).trim() : null,
      tanggalLahir: row[6] ? String(row[6]).trim() : null,
      agama: row[7] ? String(row[7]).trim() : null,
      pendidikan: row[8] ? String(row[8]).trim() : null,
      jenisPekerjaan: row[9] ? String(row[9]).trim() : null,
      statusPerkawinan: row[11] ? String(row[11]).trim() : null,
      alamat: row[20] ? String(row[20]).trim() : null,
      rt: row[21] ? String(row[21]).trim() : null,
      rw: row[22] ? String(row[22]).trim() : null,
    })
  }

  console.log(`📊 Ditemukan ${pendudukData.length} data penduduk. Memulai proses insert...`)
  
  // Insert dalam batch agar tidak error too many parameters
  const batchSize = 1000
  let inserted = 0
  
  for (let i = 0; i < pendudukData.length; i += batchSize) {
    const batch = pendudukData.slice(i, i + batchSize)
    
    try {
      await db.insert(schema.penduduk)
        .values(batch)
        .onConflictDoNothing({
          target: schema.penduduk.nik
        })
      inserted += batch.length
      console.log(`✅ Berhasil insert ${inserted}/${pendudukData.length} data...`)
    } catch (err) {
      console.error(`❌ Gagal insert batch pada index ${i}:`, err)
    }
  }
  
  console.log('🎉 Selesai mengimport data penduduk!')
  process.exit(0)
}

importPenduduk().catch(console.error)

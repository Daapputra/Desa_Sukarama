import xlsx from 'xlsx'
import path from 'path'
import fs from 'fs'
import { db, pool } from './src/db/index.js'
import { penduduk } from './src/db/schema.js'

function findUploadPath(fileName: string): string {
  const candidates = [
    path.resolve(`../../uploads/${fileName}`),
    path.resolve(`../uploads/${fileName}`),
    path.resolve(`uploads/${fileName}`),
    path.resolve(process.cwd(), `uploads/${fileName}`),
    path.resolve(process.cwd(), `../uploads/${fileName}`),
    path.resolve(process.cwd(), `../../uploads/${fileName}`),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return candidates[0]
}

function cleanString(val: any): string | null {
  if (val === undefined || val === null) return null
  let s = String(val).trim()
  if (s.startsWith("'")) s = s.replace(/^'+/, '').trim()
  return s.length > 0 ? s : null
}

async function importPenduduk() {
  console.log('🔄 Membaca file Excel kependudukan...')
  const filePath = findUploadPath('Data Penduduk Desa Sukarama Kecamatan Bojongpicung Status Nik Permanen.xlsx')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File Excel tidak ditemukan di: ${filePath}`)
    process.exit(1)
  }

  console.log(`📁 Lokasi file: ${filePath}`)
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  // Ambil data dalam bentuk array of arrays
  const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 })
  
  // Data dimulai dari baris ke-3 (index 2)
  const rows = data.slice(2)
  
  const pendudukMap = new Map<string, any>()
  
  for (const row of rows) {
    if (!row || row.length === 0) continue

    const noKk = cleanString(row[1])
    const namaLengkap = cleanString(row[2])
    const nik = cleanString(row[3])
    
    if (!nik || !namaLengkap || nik.length < 5) continue

    pendudukMap.set(nik, {
      noKk: noKk || '',
      nik,
      namaLengkap,
      jenisKelamin: cleanString(row[4]),
      tempatLahir: cleanString(row[5]),
      tanggalLahir: cleanString(row[6]),
      agama: cleanString(row[7]),
      pendidikan: cleanString(row[8]),
      jenisPekerjaan: cleanString(row[9]),
      statusPerkawinan: cleanString(row[11]),
      alamat: cleanString(row[20]),
      rt: cleanString(row[21]),
      rw: cleanString(row[22]),
    })
  }

  const pendudukList = Array.from(pendudukMap.values())
  console.log(`📊 Ditemukan ${pendudukList.length} data penduduk unik. Memulai proses insert ke PostgreSQL...`)
  
  // Insert dalam batch agar efisien dan aman dari parameter limit
  const batchSize = 500
  let inserted = 0
  
  for (let i = 0; i < pendudukList.length; i += batchSize) {
    const batch = pendudukList.slice(i, i + batchSize)
    
    try {
      await db.insert(penduduk)
        .values(batch)
        .onConflictDoUpdate({
          target: penduduk.nik,
          set: {
            noKk: db.$inferInsert<typeof penduduk>['noKk'],
            namaLengkap: db.$inferInsert<typeof penduduk>['namaLengkap'],
            jenisKelamin: db.$inferInsert<typeof penduduk>['jenisKelamin'],
            tempatLahir: db.$inferInsert<typeof penduduk>['tempatLahir'],
            tanggalLahir: db.$inferInsert<typeof penduduk>['tanggalLahir'],
            agama: db.$inferInsert<typeof penduduk>['agama'],
            pendidikan: db.$inferInsert<typeof penduduk>['pendidikan'],
            jenisPekerjaan: db.$inferInsert<typeof penduduk>['jenisPekerjaan'],
            statusPerkawinan: db.$inferInsert<typeof penduduk>['statusPerkawinan'],
            alamat: db.$inferInsert<typeof penduduk>['alamat'],
            rt: db.$inferInsert<typeof penduduk>['rt'],
            rw: db.$inferInsert<typeof penduduk>['rw'],
          }
        })
      inserted += batch.length
      console.log(`✅ Berhasil proses ${inserted}/${pendudukList.length} data...`)
    } catch (err: any) {
      console.error(`❌ Gagal insert batch pada index ${i}:`, err.message || err)
    }
  }
  
  console.log(`\n🎉 Selesai! Sebanyak ${inserted} data penduduk Desa Sukarama berhasil masuk ke database PostgreSQL.`)
  await pool.end()
  process.exit(0)
}

importPenduduk().catch(async (err) => {
  console.error('❌ Error import penduduk:', err)
  await pool.end()
  process.exit(1)
})

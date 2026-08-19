import xlsx from 'xlsx'
import path from 'path'
import fs from 'fs'
import { db, pool } from '../src/db/index.js'
import { penduduk } from '../src/db/schema.js'

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
  const worksheet = workbook.Sheets[sheetName]
  
  const rawRows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
  console.log(`📊 Total baris di Excel: ${rawRows.length}`)

  const validRecords: any[] = []
  const seenNiks = new Set<string>()

  for (let i = 3; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (!row || row.length === 0) continue

    const nik = cleanString(row[3])
    const noKk = cleanString(row[1])
    const nama = cleanString(row[2])

    if (!nik || !nama || !noKk) continue
    if (seenNiks.has(nik)) continue
    seenNiks.add(nik)

    validRecords.push({
      nik,
      noKk,
      namaLengkap: nama,
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

  console.log(`✨ Jumlah data valid dan unik yang akan diimpor: ${validRecords.length}`)

  // Batch insert per 500 baris untuk efisiensi
  const BATCH_SIZE = 500
  let inserted = 0

  for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
    const batch = validRecords.slice(i, i + BATCH_SIZE)
    
    await db.insert(penduduk)
      .values(batch)
      .onConflictDoUpdate({
        target: penduduk.nik,
        set: {
          noKk: batch[0].noKk, // fallback field for query syntax
          namaLengkap: batch[0].namaLengkap,
        }
      })
    
    inserted += batch.length
    process.stdout.write(`\r🚀 Mengimpor ke database... ${inserted}/${validRecords.length} data`)
  }

  console.log('\n\n✅ Impor data penduduk selesai dengan sukses!')
  console.log(`🎉 Total ${validRecords.length} penduduk tersimpan di tabel "penduduk".`)
  
  await pool.end()
}

importPenduduk().catch((err) => {
  console.error('\n❌ Terjadi kesalahan saat mengimpor:', err)
  process.exit(1)
})

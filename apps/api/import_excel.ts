import xlsx from 'xlsx'
import path from 'path'
import { db, pool } from './src/db/index.js'
import { penduduk } from './src/db/schema.js'

async function importExcel() {
  const filePath = path.resolve('../../uploads/Data Penduduk Desa Sukarama Kecamatan Bojongpicung Status Nik Permanen.xlsx')
  console.log('Membaca file Excel:', filePath)
  
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' })

  console.log(`Total baris di Excel: ${data.length}`)
  
  let successCount = 0
  
  for (const row of data) {
    let nik = String(row['NIK'] || '').trim()
    let noKk = String(row['No.KK'] || '').trim()
    let namaLengkap = String(row['Nama Lengkap'] || '').trim()
    let jenisKelamin = String(row['Jenis Kelamin'] || '').trim()
    let tempatLahir = String(row['Tempat Lahir'] || '').trim()
    let tanggalLahir = String(row['Tanggal Lahir'] || '').trim()
    let agama = String(row['Agama'] || '').trim()
    let jenisPekerjaan = String(row['Jenis Pekerjaan'] || '').trim()
    
    // Hapus tanda kutip tunggal di awal
    if (nik.startsWith("'")) nik = nik.substring(1)
    if (noKk.startsWith("'")) noKk = noKk.substring(1)
      
    if (!nik || nik.length < 5) continue // Skip invalid NIK
      
    try {
      await db.insert(penduduk).values({
        nik,
        noKk,
        namaLengkap,
        jenisKelamin,
        tempatLahir,
        tanggalLahir,
        agama,
        jenisPekerjaan
      }).onConflictDoNothing()
      successCount++
    } catch (e) {
      // ignore
    }
  }

  console.log(`Berhasil mengimpor/memperbarui: ${successCount} data.`)
  await pool.end()
}

importExcel().catch(e => {
  console.error(e)
  process.exit(1)
})

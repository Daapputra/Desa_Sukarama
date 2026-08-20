import crypto from 'node:crypto'
import { db, pool } from './index.js'
import { adminUsers, pengumuman, umkmProduk } from './schema.js'
import { eq, count } from 'drizzle-orm'

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}

export async function seedDatabase() {
  try {
    // ── Seed Admin ─────────────────────────────────────────
    const adminExists = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.username, 'admin'))
      .limit(1)

    if (adminExists.length === 0) {
      const salt = crypto.randomBytes(16).toString('hex')
      const hash = hashPassword('admin123', salt)
      await db.insert(adminUsers).values({
        username: 'admin',
        passwordHash: hash,
        salt,
      })
      console.log('✅ Admin default dibuat (username: admin, password: admin123)')
    }

    // ── Seed Pengumuman ────────────────────────────────────
    const [cntPengumuman] = await db.select({ c: count() }).from(pengumuman)
    if (cntPengumuman.c === 0) {
      await db.insert(pengumuman).values([
        {
          judul: 'Jadwal Posyandu Bulan Juli 2026',
          konten: 'Diberitahukan kepada seluruh warga Desa Sukarama bahwa kegiatan Posyandu akan dilaksanakan pada:\n\n• Dusun Sukamanah: Senin, 6 Juli 2026\n• Dusun Sukamaju: Rabu, 8 Juli 2026\n• Dusun Sukasenang: Jumat, 10 Juli 2026\n\nWaktu: 08.00 – 12.00 WIB\nTempat: Pos Posyandu masing-masing dusun\n\nHarap membawa KMS (Kartu Menuju Sehat) dan buku catatan kesehatan anak.',
          tanggal: '2026-07-01',
        },
        {
          judul: 'Pendaftaran BLT Dana Desa Tahap II Tahun 2026',
          konten: 'Pemerintah Desa Sukarama membuka pendaftaran penerima Bantuan Langsung Tunai (BLT) Dana Desa Tahap II Tahun 2026.\n\nSyarat:\n• Warga Desa Sukarama yang terdaftar di DTKS\n• Keluarga pra-sejahtera\n• Membawa KTP, KK, dan surat keterangan tidak mampu\n\nPendaftaran dibuka mulai 15 Juli – 31 Juli 2026 di Kantor Desa Sukarama.\n\nInformasi lebih lanjut hubungi Sekretariat Desa.',
          tanggal: '2026-07-10',
        },
        {
          judul: 'Persiapan Lomba HUT RI ke-81 Tahun 2026',
          konten: 'Dalam rangka memperingati HUT Kemerdekaan RI ke-81, Pemerintah Desa Sukarama akan menyelenggarakan berbagai lomba:\n\n• Lomba panjat pinang\n• Lomba balap karung\n• Lomba makan kerupuk\n• Lomba 17-an untuk anak-anak\n• Lomba kebersihan antar RT\n\nPendaftaran peserta melalui ketua RT masing-masing paling lambat 10 Agustus 2026.',
          tanggal: '2026-07-15',
        },
      ])
      console.log('✅ Seed pengumuman berhasil (3 data)')
    }

    // ── Seed UMKM ─────────────────────────────────────────
    const [cntUmkm] = await db.select({ c: count() }).from(umkmProduk)
    if (cntUmkm.c === 0) {
      await db.insert(umkmProduk).values([
        {
          namaProduk: 'Keripik Singkong Pedas Bu Enah',
          harga: 15000,
          kategori: 'Makanan',
          deskripsi: 'Keripik singkong renyah dengan bumbu pedas khas Cianjur. Dibuat dari singkong pilihan yang diolah secara tradisional. Tersedia varian original, pedas, dan balado.',
          pemilik: 'Bu Enah Sukaenah',
          noWaPemilik: '6281234567890',
          fotoPath: '/images/products/keripik.jpg',
        },
        {
          namaProduk: 'Dodol Cianjur Pak Oman',
          harga: 25000,
          kategori: 'Makanan',
          deskripsi: 'Dodol khas Cianjur yang legit dan manis. Terbuat dari beras ketan, gula aren, dan santan kelapa murni. Cocok untuk oleh-oleh keluarga.',
          pemilik: 'Pak Oman Sulaeman',
          noWaPemilik: '6281234567891',
          fotoPath: '/images/products/dodol.jpg',
        },
        {
          namaProduk: 'Anyaman Bambu Mang Dadang',
          harga: 75000,
          kategori: 'Kerajinan',
          deskripsi: 'Kerajinan anyaman bambu buatan tangan. Tersedia berbagai bentuk: tampah, boboko, dan hiasan dinding. Setiap produk unik dan dibuat dengan teliti.',
          pemilik: 'Mang Dadang Hermawan',
          noWaPemilik: '6281234567892',
          fotoPath: '/images/products/anyaman.jpg',
        },
        {
          namaProduk: 'Gula Aren Asli Pak Udin',
          harga: 35000,
          kategori: 'Hasil Tani',
          deskripsi: 'Gula aren murni 100% tanpa campuran. Diambil langsung dari pohon aren di kebun sekitar desa. Cocok untuk memasak dan minuman tradisional.',
          pemilik: 'Pak Udin Saepuloh',
          noWaPemilik: '6281234567893',
          fotoPath: '/images/products/gula-aren.jpg',
        },
      ])
      console.log('✅ Seed UMKM berhasil (4 data)')
    }

    console.log('✅ Database Postgres siap (Drizzle ORM)')
  } catch (error) {
    console.error('❌ Gagal seed database:', (error as Error).message)
  }
}

// Support running this file directly for first-time local setup.
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => pool.end())
    .catch(async (error) => {
      console.error('❌ Gagal menjalankan seed:', error)
      await pool.end()
      process.exitCode = 1
    })
}

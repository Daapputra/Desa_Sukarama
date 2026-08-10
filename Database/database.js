const { Pool } = require('pg');
const crypto = require('crypto');

// Create connection pool
// Gunakan DATABASE_URL dari environment variable Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/desa_sukarama',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

/**
 * Hash password using PBKDF2 with salt
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

/**
 * Initialize database tables and seed data
 */
async function initDatabase() {
  try {
    // ── Create Tables ──────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pengumuman (
        id SERIAL PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        konten TEXT NOT NULL,
        tanggal VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS surat_pengajuan (
        id SERIAL PRIMARY KEY,
        ref_number VARCHAR(100) UNIQUE NOT NULL,
        nama VARCHAR(255) NOT NULL,
        nik VARCHAR(50) NOT NULL,
        no_kk VARCHAR(50) NOT NULL,
        jenis_surat VARCHAR(100) NOT NULL,
        keperluan TEXT NOT NULL,
        no_wa VARCHAR(50) NOT NULL,
        dokumen_path TEXT,
        status VARCHAR(50) DEFAULT 'Diajukan' CHECK(status IN ('Diajukan','Diproses','Selesai')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS umkm_produk (
        id SERIAL PRIMARY KEY,
        nama_produk VARCHAR(255) NOT NULL,
        harga INTEGER NOT NULL,
        kategori VARCHAR(50) NOT NULL CHECK(kategori IN ('Makanan','Kerajinan','Hasil Tani','Lainnya')),
        deskripsi TEXT NOT NULL,
        pemilik VARCHAR(255) NOT NULL,
        no_wa_pemilik VARCHAR(50) NOT NULL,
        foto_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pesan_kontak (
        id SERIAL PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        kontak VARCHAR(255) NOT NULL,
        pesan TEXT NOT NULL,
        dibaca INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Seed Admin ─────────────────────────────────────────
    const adminExists = await pool.query('SELECT id FROM admin_users WHERE username = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('admin123', salt);
      await pool.query('INSERT INTO admin_users (username, password_hash, salt) VALUES ($1, $2, $3)', ['admin', hash, salt]);
      console.log('✅ Admin default dibuat (username: admin, password: admin123)');
    }

    // ── Seed Pengumuman ────────────────────────────────────
    const cntPengumuman = await pool.query('SELECT COUNT(*) as c FROM pengumuman');
    if (parseInt(cntPengumuman.rows[0].c) === 0) {
      const data = [
        {
          judul: 'Jadwal Posyandu Bulan Juli 2026',
          konten: 'Diberitahukan kepada seluruh warga Desa Sukarama bahwa kegiatan Posyandu akan dilaksanakan pada:\\n\\n• Dusun Sukamanah: Senin, 6 Juli 2026\\n• Dusun Sukamaju: Rabu, 8 Juli 2026\\n• Dusun Sukasenang: Jumat, 10 Juli 2026\\n\\nWaktu: 08.00 – 12.00 WIB\\nTempat: Pos Posyandu masing-masing dusun\\n\\nHarap membawa KMS (Kartu Menuju Sehat) dan buku catatan kesehatan anak.',
          tanggal: '2026-07-01'
        },
        {
          judul: 'Pendaftaran BLT Dana Desa Tahap II Tahun 2026',
          konten: 'Pemerintah Desa Sukarama membuka pendaftaran penerima Bantuan Langsung Tunai (BLT) Dana Desa Tahap II Tahun 2026.\\n\\nSyarat:\\n• Warga Desa Sukarama yang terdaftar di DTKS\\n• Keluarga pra-sejahtera\\n• Membawa KTP, KK, dan surat keterangan tidak mampu\\n\\nPendaftaran dibuka mulai 15 Juli – 31 Juli 2026 di Kantor Desa Sukarama.\\n\\nInformasi lebih lanjut hubungi Sekretariat Desa.',
          tanggal: '2026-07-10'
        },
        {
          judul: 'Persiapan Lomba HUT RI ke-81 Tahun 2026',
          konten: 'Dalam rangka memperingati HUT Kemerdekaan RI ke-81, Pemerintah Desa Sukarama akan menyelenggarakan berbagai lomba:\\n\\n• Lomba panjat pinang\\n• Lomba balap karung\\n• Lomba makan kerupuk\\n• Lomba 17-an untuk anak-anak\\n• Lomba kebersihan antar RT\\n\\nPendaftaran peserta melalui ketua RT masing-masing paling lambat 10 Agustus 2026.',
          tanggal: '2026-07-15'
        }
      ];
      for (const d of data) {
        await pool.query('INSERT INTO pengumuman (judul, konten, tanggal) VALUES ($1, $2, $3)', [d.judul, d.konten, d.tanggal]);
      }
      console.log('✅ Seed pengumuman berhasil (3 data)');
    }

    // ── Seed UMKM ─────────────────────────────────────────
    const cntUmkm = await pool.query('SELECT COUNT(*) as c FROM umkm_produk');
    if (parseInt(cntUmkm.rows[0].c) === 0) {
      const data = [
        {
          nama_produk: 'Keripik Singkong Pedas Bu Enah',
          harga: 15000,
          kategori: 'Makanan',
          deskripsi: 'Keripik singkong renyah dengan bumbu pedas khas Cianjur. Dibuat dari singkong pilihan yang diolah secara tradisional. Tersedia varian original, pedas, dan balado.',
          pemilik: 'Bu Enah Sukaenah',
          no_wa_pemilik: '6281234567890',
          foto_path: '/images/products/keripik.jpg'
        },
        {
          nama_produk: 'Dodol Cianjur Pak Oman',
          harga: 25000,
          kategori: 'Makanan',
          deskripsi: 'Dodol khas Cianjur yang legit dan manis. Terbuat dari beras ketan, gula aren, dan santan kelapa murni. Cocok untuk oleh-oleh keluarga.',
          pemilik: 'Pak Oman Sulaeman',
          no_wa_pemilik: '6281234567891',
          foto_path: '/images/products/dodol.jpg'
        },
        {
          nama_produk: 'Anyaman Bambu Mang Dadang',
          harga: 75000,
          kategori: 'Kerajinan',
          deskripsi: 'Kerajinan anyaman bambu buatan tangan. Tersedia berbagai bentuk: tampah, boboko, dan hiasan dinding. Setiap produk unik dan dibuat dengan teliti.',
          pemilik: 'Mang Dadang Hermawan',
          no_wa_pemilik: '6281234567892',
          foto_path: '/images/products/anyaman.jpg'
        },
        {
          nama_produk: 'Gula Aren Asli Pak Udin',
          harga: 35000,
          kategori: 'Hasil Tani',
          deskripsi: 'Gula aren murni 100% tanpa campuran. Diambil langsung dari pohon aren di kebun sekitar desa. Cocok untuk memasak dan minuman tradisional.',
          pemilik: 'Pak Udin Saepuloh',
          no_wa_pemilik: '6281234567893',
          foto_path: '/images/products/gula-aren.jpg'
        }
      ];
      for (const d of data) {
        await pool.query(
          'INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, foto_path) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [d.nama_produk, d.harga, d.kategori, d.deskripsi, d.pemilik, d.no_wa_pemilik, d.foto_path]
        );
      }
      console.log('✅ Seed UMKM berhasil');
    }

    console.log('✅ Database Postgres siap');
  } catch (error) {
    console.error('❌ Gagal inisialisasi database:', error.message);
  }
}

module.exports = { pool, initDatabase, hashPassword };

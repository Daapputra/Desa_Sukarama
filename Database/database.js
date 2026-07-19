const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'desa.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Hash password using PBKDF2 with salt
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

/**
 * Initialize database tables and seed data
 */
function initDatabase() {
  // ── Create Tables ──────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pengumuman (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      judul TEXT NOT NULL,
      konten TEXT NOT NULL,
      tanggal TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS surat_pengajuan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_number TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      nik TEXT NOT NULL,
      no_kk TEXT NOT NULL,
      jenis_surat TEXT NOT NULL,
      keperluan TEXT NOT NULL,
      no_wa TEXT NOT NULL,
      dokumen_path TEXT,
      status TEXT DEFAULT 'Diajukan' CHECK(status IN ('Diajukan','Diproses','Selesai')),
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS umkm_produk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_produk TEXT NOT NULL,
      harga INTEGER NOT NULL,
      kategori TEXT NOT NULL CHECK(kategori IN ('Makanan','Kerajinan','Hasil Tani','Lainnya')),
      deskripsi TEXT NOT NULL,
      pemilik TEXT NOT NULL,
      no_wa_pemilik TEXT NOT NULL,
      foto_path TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS pesan_kontak (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      kontak TEXT NOT NULL,
      pesan TEXT NOT NULL,
      dibaca INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ── Seed Admin ─────────────────────────────────────────
  const adminExists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
  if (!adminExists) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('admin123', salt);
    db.prepare('INSERT INTO admin_users (username, password_hash, salt) VALUES (?, ?, ?)')
      .run('admin', hash, salt);
    console.log('✅ Admin default dibuat (username: admin, password: admin123)');
  }

  // ── Seed Pengumuman ────────────────────────────────────
  const cntPengumuman = db.prepare('SELECT COUNT(*) as c FROM pengumuman').get();
  if (cntPengumuman.c === 0) {
    const data = [
      {
        judul: 'Jadwal Posyandu Bulan Juli 2026',
        konten: 'Diberitahukan kepada seluruh warga Desa Sukarama bahwa kegiatan Posyandu akan dilaksanakan pada:\n\n• Dusun Sukamanah: Senin, 6 Juli 2026\n• Dusun Sukamaju: Rabu, 8 Juli 2026\n• Dusun Sukasenang: Jumat, 10 Juli 2026\n\nWaktu: 08.00 – 12.00 WIB\nTempat: Pos Posyandu masing-masing dusun\n\nHarap membawa KMS (Kartu Menuju Sehat) dan buku catatan kesehatan anak.',
        tanggal: '2026-07-01'
      },
      {
        judul: 'Pendaftaran BLT Dana Desa Tahap II Tahun 2026',
        konten: 'Pemerintah Desa Sukarama membuka pendaftaran penerima Bantuan Langsung Tunai (BLT) Dana Desa Tahap II Tahun 2026.\n\nSyarat:\n• Warga Desa Sukarama yang terdaftar di DTKS\n• Keluarga pra-sejahtera\n• Membawa KTP, KK, dan surat keterangan tidak mampu\n\nPendaftaran dibuka mulai 15 Juli – 31 Juli 2026 di Kantor Desa Sukarama.\n\nInformasi lebih lanjut hubungi Sekretariat Desa.',
        tanggal: '2026-07-10'
      },
      {
        judul: 'Persiapan Lomba HUT RI ke-81 Tahun 2026',
        konten: 'Dalam rangka memperingati HUT Kemerdekaan RI ke-81, Pemerintah Desa Sukarama akan menyelenggarakan berbagai lomba:\n\n• Lomba panjat pinang\n• Lomba balap karung\n• Lomba makan kerupuk\n• Lomba 17-an untuk anak-anak\n• Lomba kebersihan antar RT\n\nPendaftaran peserta melalui ketua RT masing-masing paling lambat 10 Agustus 2026.',
        tanggal: '2026-07-15'
      }
    ];
    const stmt = db.prepare('INSERT INTO pengumuman (judul, konten, tanggal) VALUES (?, ?, ?)');
    for (const d of data) stmt.run(d.judul, d.konten, d.tanggal);
    console.log('✅ Seed pengumuman berhasil (3 data)');
  }

  // ── Seed UMKM ─────────────────────────────────────────
  const cntUmkm = db.prepare('SELECT COUNT(*) as c FROM umkm_produk').get();
  if (cntUmkm.c === 0) {
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
      },
      {
        nama_produk: 'Kopi Robusta Bojongpicung',
        harga: 45000,
        kategori: 'Hasil Tani',
        deskripsi: 'Kopi robusta pilihan dari perkebunan warga Desa Sukarama. Dipetik dan disangrai manual untuk cita rasa kopi yang khas dan nikmat.',
        pemilik: 'Pak Cecep Mulyadi',
        no_wa_pemilik: '6281234567894',
        foto_path: '/images/products/kopi.jpg'
      },
      {
        nama_produk: 'Sayur Organik Teh Imas',
        harga: 12000,
        kategori: 'Hasil Tani',
        deskripsi: 'Sayuran segar organik tanpa pestisida. Tersedia kangkung, bayam, kacang panjang, dan terong. Dipanen langsung dari kebun setiap pagi.',
        pemilik: 'Teh Imas Rohaeti',
        no_wa_pemilik: '6281234567895',
        foto_path: '/images/products/sayur.jpg'
      }
    ];
    const stmt = db.prepare(
      'INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, foto_path) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const d of data) {
      stmt.run(d.nama_produk, d.harga, d.kategori, d.deskripsi, d.pemilik, d.no_wa_pemilik, d.foto_path);
    }
    console.log('✅ Seed UMKM berhasil (6 produk)');
  }

  console.log('✅ Database siap');
}

module.exports = { db, initDatabase, hashPassword };

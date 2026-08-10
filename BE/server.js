const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const { pool, initDatabase, hashPassword } = require('../Database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Initialize ───────────────────────────────────────────
initDatabase();

// ── Middleware ────────────────────────────────────────────
app.use(cors());
// Set higher payload limit for base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../FE')));

// ── Multer Upload Config (Memory Storage untuk Vercel) ───
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

// Helper function to convert buffer to base64 Data URI
function bufferToDataURI(file) {
  if (!file) return null;
  const b64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${b64}`;
}

// ── Auth ─────────────────────────────────────────────────
const authTokens = new Map(); // token → { username, createdAt }

function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token || !authTokens.has(token)) {
    return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
  }
  req.admin = authTokens.get(token);
  next();
}

function generateRefNumber() {
  const now = new Date();
  const prefix = 'SKR';
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${y}${m}${d}-${rand}`;
}

// ══════════════════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════════════════

// ── Admin Auth ───────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const hash = hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    authTokens.set(token, { username: user.username, createdAt: Date.now() });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan internal' });
  }
});

app.post('/api/admin/logout', authMiddleware, (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  authTokens.delete(token);
  res.json({ message: 'Berhasil logout' });
});

app.get('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// ── Dashboard Stats ──────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [
      suratBaru, suratProses, suratSelesai, totalSurat, totalUmkm, totalPengumuman, pesanBaru
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Diajukan'"),
      pool.query("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Diproses'"),
      pool.query("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Selesai'"),
      pool.query('SELECT COUNT(*) as c FROM surat_pengajuan'),
      pool.query('SELECT COUNT(*) as c FROM umkm_produk'),
      pool.query('SELECT COUNT(*) as c FROM pengumuman'),
      pool.query('SELECT COUNT(*) as c FROM pesan_kontak WHERE dibaca = 0')
    ]);

    res.json({
      surat_baru: parseInt(suratBaru.rows[0].c),
      surat_proses: parseInt(suratProses.rows[0].c),
      surat_selesai: parseInt(suratSelesai.rows[0].c),
      total_surat: parseInt(totalSurat.rows[0].c),
      total_umkm: parseInt(totalUmkm.rows[0].c),
      total_pengumuman: parseInt(totalPengumuman.rows[0].c),
      pesan_baru: parseInt(pesanBaru.rows[0].c)
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat statistik' });
  }
});

// ── Pengumuman ───────────────────────────────────────────
app.get('/api/pengumuman', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await pool.query('SELECT * FROM pengumuman ORDER BY tanggal DESC, id DESC LIMIT $1', [limit]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

app.get('/api/pengumuman/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pengumuman WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
});

app.post('/api/pengumuman', authMiddleware, async (req, res) => {
  try {
    const { judul, konten, tanggal } = req.body;
    if (!judul || !konten || !tanggal) {
      return res.status(400).json({ error: 'Judul, konten, dan tanggal harus diisi' });
    }
    const result = await pool.query(
      'INSERT INTO pengumuman (judul, konten, tanggal) VALUES ($1, $2, $3) RETURNING id',
      [judul, konten, tanggal]
    );
    res.status(201).json({ id: result.rows[0].id, judul, konten, tanggal });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah pengumuman' });
  }
});

app.put('/api/pengumuman/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM pengumuman WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    
    const { judul, konten, tanggal } = req.body;
    await pool.query(
      'UPDATE pengumuman SET judul = $1, konten = $2, tanggal = $3 WHERE id = $4',
      [judul || existing.rows[0].judul, konten || existing.rows[0].konten, tanggal || existing.rows[0].tanggal, req.params.id]
    );
    res.json({ message: 'Pengumuman berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal update pengumuman' });
  }
});

app.delete('/api/pengumuman/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM pengumuman WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    
    await pool.query('DELETE FROM pengumuman WHERE id = $1', [req.params.id]);
    res.json({ message: 'Pengumuman berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus pengumuman' });
  }
});

// ── Surat Pengajuan ──────────────────────────────────────
app.post('/api/surat', upload.single('dokumen'), async (req, res) => {
  try {
    const { nama, nik, no_kk, jenis_surat, keperluan, no_wa } = req.body;
    if (!nama || !nik || !no_kk || !jenis_surat || !keperluan || !no_wa) {
      return res.status(400).json({ error: 'Semua field wajib harus diisi' });
    }
    if (!/^\d{3,16}$/.test(nik)) {
      return res.status(400).json({ error: 'NIK harus berupa angka (3 - 16 digit)' });
    }
    if (!/^\d{3,16}$/.test(no_kk)) {
      return res.status(400).json({ error: 'Nomor KK harus berupa angka (3 - 16 digit)' });
    }
    
    const refNumber = generateRefNumber();
    const dokumenPath = bufferToDataURI(req.file); // Convert to Base64
    
    await pool.query(
      'INSERT INTO surat_pengajuan (ref_number, nama, nik, no_kk, jenis_surat, keperluan, no_wa, dokumen_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [refNumber, nama, nik, no_kk, jenis_surat, keperluan, no_wa, dokumenPath]
    );
    res.status(201).json({ ref_number: refNumber, message: 'Pengajuan surat berhasil dikirim' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengajukan surat' });
  }
});

app.get('/api/surat/cek/:ref', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ref_number, nama, jenis_surat, status, created_at FROM surat_pengajuan WHERE ref_number = $1',
      [req.params.ref]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Nomor referensi tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengecek status' });
  }
});

app.get('/api/surat', authMiddleware, async (req, res) => {
  try {
    const status = req.query.status;
    let result;
    if (status && status !== 'Semua') {
      result = await pool.query('SELECT * FROM surat_pengajuan WHERE status = $1 ORDER BY created_at DESC', [status]);
    } else {
      result = await pool.query('SELECT * FROM surat_pengajuan ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

app.get('/api/surat/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surat_pengajuan WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
});

app.put('/api/surat/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Diajukan', 'Diproses', 'Selesai'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Gunakan: Diajukan, Diproses, atau Selesai' });
    }
    const existing = await pool.query('SELECT * FROM surat_pengajuan WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
    
    await pool.query('UPDATE surat_pengajuan SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: `Status diperbarui menjadi "${status}"` });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui status' });
  }
});

// ── UMKM Produk ──────────────────────────────────────────
app.get('/api/umkm', async (req, res) => {
  try {
    const { kategori } = req.query;
    let result;
    if (kategori && kategori !== 'Semua') {
      result = await pool.query('SELECT * FROM umkm_produk WHERE kategori = $1 ORDER BY created_at DESC', [kategori]);
    } else {
      result = await pool.query('SELECT * FROM umkm_produk ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data' });
  }
});

app.get('/api/umkm/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM umkm_produk WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Terjadi kesalahan' });
  }
});

app.post('/api/umkm', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const { nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik } = req.body;
    if (!nama_produk || !harga || !kategori || !deskripsi || !pemilik || !no_wa_pemilik) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    
    const fotoPath = bufferToDataURI(req.file); // Convert to Base64
    
    const result = await pool.query(
      'INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, foto_path) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [nama_produk, parseInt(harga), kategori, deskripsi, pemilik, no_wa_pemilik, fotoPath]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

app.put('/api/umkm/:id', authMiddleware, upload.single('foto'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM umkm_produk WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    
    const { nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik } = req.body;
    const fotoPath = req.file ? bufferToDataURI(req.file) : existing.rows[0].foto_path;
    
    await pool.query(
      'UPDATE umkm_produk SET nama_produk=$1, harga=$2, kategori=$3, deskripsi=$4, pemilik=$5, no_wa_pemilik=$6, foto_path=$7 WHERE id=$8',
      [
        nama_produk || existing.rows[0].nama_produk,
        parseInt(harga) || existing.rows[0].harga,
        kategori || existing.rows[0].kategori,
        deskripsi || existing.rows[0].deskripsi,
        pemilik || existing.rows[0].pemilik,
        no_wa_pemilik || existing.rows[0].no_wa_pemilik,
        fotoPath,
        req.params.id
      ]
    );
    res.json({ message: 'Produk berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal memperbarui produk' });
  }
});

app.delete('/api/umkm/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM umkm_produk WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    
    await pool.query('DELETE FROM umkm_produk WHERE id = $1', [req.params.id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

// ── Pesan Kontak ─────────────────────────────────────────
app.post('/api/kontak', async (req, res) => {
  try {
    const { nama, kontak, pesan } = req.body;
    if (!nama || !kontak || !pesan) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    await pool.query('INSERT INTO pesan_kontak (nama, kontak, pesan) VALUES ($1, $2, $3)', [nama, kontak, pesan]);
    res.status(201).json({ message: 'Pesan berhasil dikirim. Terima kasih!' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengirim pesan' });
  }
});

app.get('/api/kontak', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pesan_kontak ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pesan' });
  }
});

// ── SPA Fallback ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FE', 'index.html'));
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\\n🏘️  Website Desa Sukarama berjalan di http://localhost:${PORT}\\n`);
});

// Export for Vercel Serverless
module.exports = app;

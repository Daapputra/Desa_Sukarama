const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { db, initDatabase, hashPassword } = require('../Database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Initialize ───────────────────────────────────────────
initDatabase();

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../FE')));
app.use('/uploads', express.static(UPLOAD_DIR));

// ── Multer Upload Config ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
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
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
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
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const suratBaru = db.prepare("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Diajukan'").get();
  const suratProses = db.prepare("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Diproses'").get();
  const suratSelesai = db.prepare("SELECT COUNT(*) as c FROM surat_pengajuan WHERE status = 'Selesai'").get();
  const totalSurat = db.prepare('SELECT COUNT(*) as c FROM surat_pengajuan').get();
  const totalUmkm = db.prepare('SELECT COUNT(*) as c FROM umkm_produk').get();
  const totalPengumuman = db.prepare('SELECT COUNT(*) as c FROM pengumuman').get();
  const pesanBaru = db.prepare('SELECT COUNT(*) as c FROM pesan_kontak WHERE dibaca = 0').get();
  res.json({
    surat_baru: suratBaru.c,
    surat_proses: suratProses.c,
    surat_selesai: suratSelesai.c,
    total_surat: totalSurat.c,
    total_umkm: totalUmkm.c,
    total_pengumuman: totalPengumuman.c,
    pesan_baru: pesanBaru.c
  });
});

// ── Pengumuman ───────────────────────────────────────────
app.get('/api/pengumuman', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const rows = db.prepare('SELECT * FROM pengumuman ORDER BY tanggal DESC, id DESC LIMIT ?').all(limit);
  res.json(rows);
});

app.get('/api/pengumuman/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM pengumuman WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
  res.json(row);
});

app.post('/api/pengumuman', authMiddleware, (req, res) => {
  const { judul, konten, tanggal } = req.body;
  if (!judul || !konten || !tanggal) {
    return res.status(400).json({ error: 'Judul, konten, dan tanggal harus diisi' });
  }
  const result = db.prepare('INSERT INTO pengumuman (judul, konten, tanggal) VALUES (?, ?, ?)')
    .run(judul, konten, tanggal);
  res.status(201).json({ id: result.lastInsertRowid, judul, konten, tanggal });
});

app.put('/api/pengumuman/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM pengumuman WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
  const { judul, konten, tanggal } = req.body;
  db.prepare('UPDATE pengumuman SET judul = ?, konten = ?, tanggal = ? WHERE id = ?')
    .run(judul || existing.judul, konten || existing.konten, tanggal || existing.tanggal, req.params.id);
  res.json({ message: 'Pengumuman berhasil diperbarui' });
});

app.delete('/api/pengumuman/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM pengumuman WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
  db.prepare('DELETE FROM pengumuman WHERE id = ?').run(req.params.id);
  res.json({ message: 'Pengumuman berhasil dihapus' });
});

// ── Surat Pengajuan ──────────────────────────────────────
app.post('/api/surat', upload.single('dokumen'), (req, res) => {
  const { nama, nik, no_kk, jenis_surat, keperluan, no_wa } = req.body;
  if (!nama || !nik || !no_kk || !jenis_surat || !keperluan || !no_wa) {
    return res.status(400).json({ error: 'Semua field wajib harus diisi' });
  }
  if (!/^\d{16}$/.test(nik)) {
    return res.status(400).json({ error: 'NIK harus terdiri dari 16 digit angka' });
  }
  if (!/^\d{16}$/.test(no_kk)) {
    return res.status(400).json({ error: 'Nomor KK harus terdiri dari 16 digit angka' });
  }
  const refNumber = generateRefNumber();
  const dokumenPath = req.file ? `/uploads/${req.file.filename}` : null;
  db.prepare(
    'INSERT INTO surat_pengajuan (ref_number, nama, nik, no_kk, jenis_surat, keperluan, no_wa, dokumen_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(refNumber, nama, nik, no_kk, jenis_surat, keperluan, no_wa, dokumenPath);
  res.status(201).json({ ref_number: refNumber, message: 'Pengajuan surat berhasil dikirim' });
});

app.get('/api/surat/cek/:ref', (req, res) => {
  const row = db.prepare(
    'SELECT ref_number, nama, jenis_surat, status, created_at FROM surat_pengajuan WHERE ref_number = ?'
  ).get(req.params.ref);
  if (!row) return res.status(404).json({ error: 'Nomor referensi tidak ditemukan' });
  res.json(row);
});

app.get('/api/surat', authMiddleware, (req, res) => {
  const status = req.query.status;
  let rows;
  if (status && status !== 'Semua') {
    rows = db.prepare('SELECT * FROM surat_pengajuan WHERE status = ? ORDER BY created_at DESC').all(status);
  } else {
    rows = db.prepare('SELECT * FROM surat_pengajuan ORDER BY created_at DESC').all();
  }
  res.json(rows);
});

app.get('/api/surat/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM surat_pengajuan WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  res.json(row);
});

app.put('/api/surat/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  if (!['Diajukan', 'Diproses', 'Selesai'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid. Gunakan: Diajukan, Diproses, atau Selesai' });
  }
  const existing = db.prepare('SELECT * FROM surat_pengajuan WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  db.prepare('UPDATE surat_pengajuan SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: `Status diperbarui menjadi "${status}"` });
});

// ── UMKM Produk ──────────────────────────────────────────
app.get('/api/umkm', (req, res) => {
  const { kategori } = req.query;
  let rows;
  if (kategori && kategori !== 'Semua') {
    rows = db.prepare('SELECT * FROM umkm_produk WHERE kategori = ? ORDER BY created_at DESC').all(kategori);
  } else {
    rows = db.prepare('SELECT * FROM umkm_produk ORDER BY created_at DESC').all();
  }
  res.json(rows);
});

app.get('/api/umkm/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM umkm_produk WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  res.json(row);
});

app.post('/api/umkm', authMiddleware, upload.single('foto'), (req, res) => {
  const { nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik } = req.body;
  if (!nama_produk || !harga || !kategori || !deskripsi || !pemilik || !no_wa_pemilik) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;
  const result = db.prepare(
    'INSERT INTO umkm_produk (nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik, foto_path) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(nama_produk, parseInt(harga), kategori, deskripsi, pemilik, no_wa_pemilik, fotoPath);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Produk berhasil ditambahkan' });
});

app.put('/api/umkm/:id', authMiddleware, upload.single('foto'), (req, res) => {
  const existing = db.prepare('SELECT * FROM umkm_produk WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  const { nama_produk, harga, kategori, deskripsi, pemilik, no_wa_pemilik } = req.body;
  const fotoPath = req.file ? `/uploads/${req.file.filename}` : existing.foto_path;
  db.prepare(
    'UPDATE umkm_produk SET nama_produk=?, harga=?, kategori=?, deskripsi=?, pemilik=?, no_wa_pemilik=?, foto_path=? WHERE id=?'
  ).run(
    nama_produk || existing.nama_produk,
    parseInt(harga) || existing.harga,
    kategori || existing.kategori,
    deskripsi || existing.deskripsi,
    pemilik || existing.pemilik,
    no_wa_pemilik || existing.no_wa_pemilik,
    fotoPath,
    req.params.id
  );
  res.json({ message: 'Produk berhasil diperbarui' });
});

app.delete('/api/umkm/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM umkm_produk WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  db.prepare('DELETE FROM umkm_produk WHERE id = ?').run(req.params.id);
  res.json({ message: 'Produk berhasil dihapus' });
});

// ── Pesan Kontak ─────────────────────────────────────────
app.post('/api/kontak', (req, res) => {
  const { nama, kontak, pesan } = req.body;
  if (!nama || !kontak || !pesan) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  db.prepare('INSERT INTO pesan_kontak (nama, kontak, pesan) VALUES (?, ?, ?)').run(nama, kontak, pesan);
  res.status(201).json({ message: 'Pesan berhasil dikirim. Terima kasih!' });
});

app.get('/api/kontak', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM pesan_kontak ORDER BY created_at DESC').all();
  res.json(rows);
});

// ── SPA Fallback ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../FE', 'index.html'));
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏘️  Website Desa Sukarama berjalan di http://localhost:${PORT}\n`);
});

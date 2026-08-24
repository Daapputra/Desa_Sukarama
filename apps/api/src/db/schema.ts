import { pgTable, serial, varchar, text, integer, timestamp, check, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * Schema Drizzle ORM — exact match dengan tabel PostgreSQL existing
 * Lengkap dengan index optimasi query
 */

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  salt: varchar('salt', { length: 255 }).notNull(),
})

export const pengumuman = pgTable('pengumuman', {
  id: serial('id').primaryKey(),
  judul: varchar('judul', { length: 255 }).notNull(),
  konten: text('konten').notNull(),
  tanggal: varchar('tanggal', { length: 50 }).notNull(),
  fotos: text('fotos').array(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_pengumuman_tanggal').on(table.tanggal),
  index('idx_pengumuman_created_at').on(table.createdAt),
])

export const suratPengajuan = pgTable('surat_pengajuan', {
  id: serial('id').primaryKey(),
  refNumber: varchar('ref_number', { length: 100 }).unique().notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  nik: varchar('nik', { length: 50 }).notNull(),
  noKk: varchar('no_kk', { length: 50 }).notNull(),
  jenisSurat: varchar('jenis_surat', { length: 100 }).notNull(),
  keperluan: text('keperluan').notNull(),
  noWa: varchar('no_wa', { length: 50 }).notNull(),
  dokumenPath: text('dokumen_path'),
  status: varchar('status', { length: 50 }).default('Diajukan'),
  metadata: text('metadata').$type<Record<string, string>>(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  check('surat_pengajuan_status_check', sql`${table.status} IN ('Diajukan', 'Diproses', 'Selesai')`),
  index('idx_surat_nik').on(table.nik),
  index('idx_surat_status').on(table.status),
  index('idx_surat_created_at').on(table.createdAt),
])

export const umkmProduk = pgTable('umkm_produk', {
  id: serial('id').primaryKey(),
  namaProduk: varchar('nama_produk', { length: 255 }).notNull(),
  harga: integer('harga').notNull(),
  kategori: varchar('kategori', { length: 50 }).notNull(),
  deskripsi: text('deskripsi').notNull(),
  pemilik: varchar('pemilik', { length: 255 }).notNull(),
  noWaPemilik: varchar('no_wa_pemilik', { length: 50 }).notNull(),
  fotoPath: text('foto_path'),
  ytId: varchar('yt_id', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  check('umkm_produk_kategori_check', sql`${table.kategori} IN ('Makanan', 'Kerajinan', 'Hasil Tani', 'Lainnya')`),
  index('idx_umkm_kategori').on(table.kategori),
  index('idx_umkm_created_at').on(table.createdAt),
])

export const pesanKontak = pgTable('pesan_kontak', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  kontak: varchar('kontak', { length: 255 }).notNull(),
  pesan: text('pesan').notNull(),
  dibaca: integer('dibaca').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_pesan_dibaca').on(table.dibaca),
  index('idx_pesan_created_at').on(table.createdAt),
])

export const penduduk = pgTable('penduduk', {
  id: serial('id').primaryKey(),
  noKk: varchar('no_kk', { length: 50 }).notNull(),
  nik: varchar('nik', { length: 50 }).unique().notNull(),
  namaLengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
  jenisKelamin: varchar('jenis_kelamin', { length: 50 }),
  tempatLahir: varchar('tempat_lahir', { length: 100 }),
  tanggalLahir: varchar('tanggal_lahir', { length: 50 }),
  agama: varchar('agama', { length: 50 }),
  pendidikan: varchar('pendidikan', { length: 100 }),
  jenisPekerjaan: varchar('jenis_pekerjaan', { length: 100 }),
  statusPerkawinan: varchar('status_perkawinan', { length: 50 }),
  alamat: text('alamat'),
  rt: varchar('rt', { length: 10 }),
  rw: varchar('rw', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('idx_penduduk_no_kk').on(table.noKk),
  index('idx_penduduk_nama_lengkap').on(table.namaLengkap),
])

// Type exports
export type AdminUser = typeof adminUsers.$inferSelect
export type Pengumuman = typeof pengumuman.$inferSelect
export type SuratPengajuan = typeof suratPengajuan.$inferSelect
export type UmkmProduk = typeof umkmProduk.$inferSelect
export type PesanKontak = typeof pesanKontak.$inferSelect
export type Penduduk = typeof penduduk.$inferSelect

CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"salt" varchar(255) NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "pengumuman" (
	"id" serial PRIMARY KEY NOT NULL,
	"judul" varchar(255) NOT NULL,
	"konten" text NOT NULL,
	"tanggal" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pesan_kontak" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(255) NOT NULL,
	"kontak" varchar(255) NOT NULL,
	"pesan" text NOT NULL,
	"dibaca" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "surat_pengajuan" (
	"id" serial PRIMARY KEY NOT NULL,
	"ref_number" varchar(100) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"nik" varchar(50) NOT NULL,
	"no_kk" varchar(50) NOT NULL,
	"jenis_surat" varchar(100) NOT NULL,
	"keperluan" text NOT NULL,
	"no_wa" varchar(50) NOT NULL,
	"dokumen_path" text,
	"status" varchar(50) DEFAULT 'Diajukan',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "surat_pengajuan_ref_number_unique" UNIQUE("ref_number"),
	CONSTRAINT "surat_pengajuan_status_check" CHECK ("surat_pengajuan"."status" IN ('Diajukan', 'Diproses', 'Selesai'))
);
--> statement-breakpoint
CREATE TABLE "umkm_produk" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_produk" varchar(255) NOT NULL,
	"harga" integer NOT NULL,
	"kategori" varchar(50) NOT NULL,
	"deskripsi" text NOT NULL,
	"pemilik" varchar(255) NOT NULL,
	"no_wa_pemilik" varchar(50) NOT NULL,
	"foto_path" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "umkm_produk_kategori_check" CHECK ("umkm_produk"."kategori" IN ('Makanan', 'Kerajinan', 'Hasil Tani', 'Lainnya'))
);

CREATE TABLE "penduduk" (
	"id" serial PRIMARY KEY NOT NULL,
	"no_kk" varchar(50) NOT NULL,
	"nik" varchar(50) NOT NULL,
	"nama_lengkap" varchar(255) NOT NULL,
	"jenis_kelamin" varchar(50),
	"tempat_lahir" varchar(100),
	"tanggal_lahir" varchar(50),
	"agama" varchar(50),
	"pendidikan" varchar(100),
	"jenis_pekerjaan" varchar(100),
	"status_perkawinan" varchar(50),
	"alamat" text,
	"rt" varchar(10),
	"rw" varchar(10),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "penduduk_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
ALTER TABLE "pengumuman" ADD COLUMN "fotos" text[];--> statement-breakpoint
ALTER TABLE "surat_pengajuan" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "umkm_produk" ADD COLUMN "yt_id" varchar(20);--> statement-breakpoint
CREATE INDEX "idx_penduduk_no_kk" ON "penduduk" USING btree ("no_kk");--> statement-breakpoint
CREATE INDEX "idx_penduduk_nama_lengkap" ON "penduduk" USING btree ("nama_lengkap");--> statement-breakpoint
CREATE INDEX "idx_pengumuman_tanggal" ON "pengumuman" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "idx_pengumuman_created_at" ON "pengumuman" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pesan_dibaca" ON "pesan_kontak" USING btree ("dibaca");--> statement-breakpoint
CREATE INDEX "idx_pesan_created_at" ON "pesan_kontak" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_surat_nik" ON "surat_pengajuan" USING btree ("nik");--> statement-breakpoint
CREATE INDEX "idx_surat_status" ON "surat_pengajuan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_surat_created_at" ON "surat_pengajuan" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_umkm_kategori" ON "umkm_produk" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "idx_umkm_created_at" ON "umkm_produk" USING btree ("created_at");
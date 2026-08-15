# 🌲 Desa Sukarama Digital
> Sistem Informasi Administrasi & Layanan Publik Modern untuk Desa Sukarama.

![Banner](https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=2074&auto=format&fit=crop)

Sebuah platform aplikasi cerdas, terintegrasi, dan mudah digunakan (User-Friendly) untuk mendigitalisasi layanan masyarakat di Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur. Aplikasi ini dibangun dengan standar profesional, mengedepankan performa tinggi, keamanan (security), serta desain modern (UI/UX) yang ramah bagi warga desa.

## ✨ Fitur Unggulan

### 🧑‍🤝‍🧑 Layanan Warga
- **Portal Informasi Publik:** Menyajikan data UMKM lokal, jumlah penduduk, luas wilayah, dan statistik real-time desa.
- **Pengajuan Surat Online:** Warga dapat mengajukan Surat Keterangan Domisili, Surat Beda Nama, dll dari rumah.
- **Auto-Generate Dokumen:** Sistem secara pintar akan me-replace template Microsoft Word (`.docx`) menggunakan *Mail Merge/Docxtemplater* dan mengisinya dengan data warga secara otomatis.
- **Lacak Surat Real-time:** Cukup dengan NIK, warga dapat memantau apakah surat mereka masih *Diajukan*, *Diproses*, atau *Selesai*.
- **Unduh Dokumen:** Dokumen yang sudah jadi bisa langsung diunduh oleh warga secara online, atau warga bisa mendownload template kosong (offline) untuk ditulis tangan.

### 💼 Admin Dashboard
- **Manajemen Pengajuan Terpusat:** Mengubah status surat hanya dengan 1 kali klik.
- **Database Penduduk (Auto-Import):** Mendukung import massal dari file Excel ribuan data penduduk ke PostgreSQL. Warga yang belum terdaftar namun mengajukan surat, NIK-nya akan otomatis tersimpan (*auto-learning*).
- **Statistik & Monitoring:** Melacak total surat masuk, UMKM terdaftar, dan notifikasi pesan kontak baru.
- **Keamanan Enkripsi:** Password admin dienkripsi menggunakan `crypto` salt + scrypt hashing.

## 🛠 Tech Stack

Proyek ini menggunakan arsitektur **Monorepo** yang memisahkan antara frontend dan backend, namun tetap rapi dalam satu repositori.

### Frontend (Client)
- **Nuxt 3** - Framework Vue.js modern dengan SSR (Server-Side Rendering).
- **TailwindCSS** - Framework styling untuk desain responsif, elegan, dan estetik.
- **Lucide Icons** - Ikonografi modern.

### Backend (Server)
- **Fastify** - Web server Node.js super cepat dan aman.
- **Drizzle ORM** - TypeScript ORM ringan untuk query dan skema database.
- **PostgreSQL** - Relational Database Management System terpercaya (bisa dideploy via Docker).
- **Docxtemplater & PizZip** - Engine untuk generasi otomatis dokumen MS Word.

## 🚀 Panduan Instalasi & Menjalankan (Local)

### Persyaratan Sistem
- [Node.js](https://nodejs.org/en/) v18+
- [Docker](https://www.docker.com/) (Opsional, untuk menjalankan PostgreSQL secara mudah)

### Langkah Instalasi
1. **Clone Repositori:**
   ```bash
   git clone https://github.com/Daapputra/Desa_Sukarama.git
   cd Desa_Sukarama
   ```

2. **Jalankan Database PostgreSQL:**
   Pastikan Anda telah menginstal Docker, lalu jalankan:
   ```bash
   docker run --name desa-sukarama-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=rahasia -e POSTGRES_DB=desasukarama -p 5432:5432 -d postgres:15
   ```

3. **Install Dependencies (API & Web):**
   ```bash
   cd apps/api
   npm install
   cd ../web
   npm install
   ```

4. **Konfigurasi Environment Backend (`.env`):**
   Di folder `apps/api/`, buat file `.env`:
   ```env
   DATABASE_URL="postgres://postgres:rahasia@localhost:5432/desasukarama"
   PORT=3005
   ADMIN_INITIAL_USERNAME="admin"
   ADMIN_INITIAL_PASSWORD="password123"
   ```

5. **Push Schema & Jalankan Server API:**
   ```bash
   cd apps/api
   npx drizzle-kit push
   npx tsx reset-admin.ts
   npm run dev
   ```

6. **Jalankan Frontend (Web):**
   Buka terminal/tab baru:
   ```bash
   cd apps/web
   npm run dev
   ```
   Aplikasi dapat diakses melalui browser di: `http://localhost:3002`

## 🗂 Struktur Direktori
```
Desa_Sukarama/
├── apps/
│   ├── api/            # Backend (Fastify, Drizzle ORM, Surat Generator)
│   └── web/            # Frontend (Nuxt 3, UI/UX, Tailwind CSS)
├── uploads/            # (Ignored) Tempat menyimpan master file Excel
└── README.md
```

## 📜 Lisensi
Aplikasi ini dikembangkan untuk keperluan operasional dan digitalisasi Desa Sukarama.

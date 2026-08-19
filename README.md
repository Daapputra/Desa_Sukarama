# 🌲 Desa Sukarama Digital
> Sistem Informasi Administrasi & Layanan Publik Modern untuk Desa Sukarama.

![Banner](https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=2074&auto=format&fit=crop)

Sebuah platform aplikasi cerdas, terintegrasi, dan mudah digunakan (*User-Friendly*) untuk mendigitalisasi layanan masyarakat di Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur. Aplikasi ini dibangun dengan standar profesional, mengedepankan performa tinggi, keamanan (*security*), serta desain modern (UI/UX) yang ramah bagi warga desa.

## ✨ Fitur Unggulan

### 🧑‍🤝‍🧑 Layanan Warga
- **Portal Informasi Publik:** Menyajikan data UMKM lokal, jumlah penduduk, luas wilayah, dan statistik real-time desa.
- **Pengajuan Surat Online:** Warga dapat mengajukan Surat Keterangan Domisili, Surat Beda Nama, SKU, dan Surat Pernyataan dari rumah.
- **Auto-Generate Dokumen:** Sistem secara pintar me-replace template Microsoft Word (`.docx`) menggunakan *Mail Merge / Docxtemplater* dan mengisinya dengan data warga beserta tanda tangan digital otomatis.
- **Lacak Surat Real-time:** Cukup dengan NIK, warga dapat memantau status pengajuan (*Diajukan*, *Diproses*, atau *Selesai*).
- **Unduh Dokumen:** Dokumen yang sudah disetujui dapat langsung diunduh dalam format `.docx`.

### 💼 Admin Dashboard
- **Manajemen Pengajuan Terpusat:** Mengubah status surat hanya dengan 1 kali klik.
- **Database Penduduk (Auto-Import & Auto-Learning):** Mendukung import massal dari file Excel ribuan data penduduk ke PostgreSQL. Warga yang belum terdaftar namun mengajukan surat, NIK dan identitasnya akan otomatis tersimpan.
- **Statistik & Monitoring:** Melacak total surat masuk, UMKM terdaftar, dan notifikasi pesan kontak baru.
- **Keamanan & Autentikasi:** Password admin dienkripsi menggunakan PBKDF2 / Scrypt hashing dengan token-based authentication.

## 🛠 Tech Stack

Proyek ini menggunakan arsitektur **Monorepo** yang memisahkan antara frontend dan backend dalam satu repositori.

### Frontend (Client)
- **Nuxt 4** (`apps/web`) - Framework Vue 3 modern dengan SSR (Server-Side Rendering).
- **TailwindCSS & Radix Vue** - Framework styling dan UI primitives yang responsif dan elegan.
- **Lucide Icons** - Ikonografi modern.

### Backend (Server)
- **Fastify v5** (`apps/api`) - Web server Node.js performa tinggi.
- **Drizzle ORM** - TypeScript ORM untuk query dan schema migration.
- **PostgreSQL** - Relational Database (dijalankan via Docker).
- **Docxtemplater & PizZip** - Engine generasi otomatis dokumen MS Word dengan embedding image signature.

---

## 🚀 Panduan Instalasi & Menjalankan (Local)

### Persyaratan Sistem
- [Node.js](https://nodejs.org/en/) v18+ atau v20+ / v22+
- [Docker](https://www.docker.com/) (Untuk menjalankan PostgreSQL)

---

### Langkah 1: Clone Repositori
```bash
git clone https://github.com/Daapputra/Desa_Sukarama.git
cd Desa_Sukarama
```

---

### Langkah 2: Jalankan Database PostgreSQL (Docker)
Jalankan container PostgreSQL:
```bash
docker run --name desa-sukarama-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=rahasia \
  -e POSTGRES_DB=desasukarama \
  -p 5433:5432 -d postgres:15
```
*(Catatan: Jika port 5432 di komputer Anda sudah dipakai oleh PostgreSQL lokal bawaan host, gunakan port `5433:5432` seperti perintah di atas).*

---

### Langkah 3: Install Dependencies
```bash
# Install backend
cd apps/api
npm install

# Install frontend
cd ../web
npm install
```

---

### Langkah 4: Konfigurasi Environment (`.env`)

1. **Backend (`apps/api/.env`)**:
   ```env
   DATABASE_URL="postgresql://postgres:rahasia@localhost:5433/desasukarama"
   API_PORT=3005
   DATABASE_SSL=false
   ```
   *(Sesuaikan port database jika menggunakan 5432 atau 5433)*.

2. **Frontend (`apps/web/.env`)**:
   ```env
   API_BASE=http://localhost:3005
   ```

---

### Langkah 5: Sinkronisasi Skema Database & Seed Data
Masuk ke folder `apps/api`:
```bash
cd apps/api

# 1. Push schema Drizzle ke database PostgreSQL
npm run db:push

# 2. Masukkan data awal (Admin, Pengumuman, dan UMKM)
npm run db:seed
```

> **🔑 Kredensial Login Admin Default:**
> - **Username:** `admin`
> - **Password:** `admin123`

---

### Langkah 6: Menjalankan Aplikasi

#### Pilihan A: Menjalankan Bersamaan dari Root (Rekomendasi)
Di folder utama (`Desa_Sukarama`):
```bash
npm run dev
```

#### Pilihan B: Menjalankan di Dua Terminal Terpisah
- **Terminal 1 (Backend API):**
  ```bash
  cd apps/api
  npm run dev
  ```
  *(API berjalan di `http://localhost:3005`)*

- **Terminal 2 (Frontend Nuxt):**
  ```bash
  cd apps/web
  npm run dev
  ```
  *(Web berjalan di `http://localhost:3000`)*

---

### 🌐 Akses Aplikasi di Browser
- **Portal Warga & Layanan:** `http://localhost:3000`
- **Dashboard Admin:** `http://localhost:3000/admin`
- **Health Check API:** `http://localhost:3005/api/health`

---

## 🗂 Struktur Direktori
```
Desa_Sukarama/
├── apps/
│   ├── api/            # Backend (Fastify, Drizzle ORM, Surat Generator)
│   │   ├── src/
│   │   │   ├── db/     # Schema Drizzle & Seeder
│   │   │   ├── routes/ # Endpoint API (Surat, Admin, UMKM, Kontak, Pengumuman)
│   │   │   └── server.ts
│   │   └── .env
│   └── web/            # Frontend (Nuxt 4, Vue 3, Tailwind CSS)
│       ├── app/        # Pages, Components, Layouts
│       ├── public/     # Static assets & Word templates
│       └── .env
├── uploads/            # Tempat menyimpan file master Excel data penduduk
└── README.md
```

## 📜 Lisensi
Aplikasi ini dikembangkan untuk keperluan operasional dan digitalisasi Desa Sukarama.

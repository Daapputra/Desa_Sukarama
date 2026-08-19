# 🌲 Desa Sukarama Digital
> Sistem Informasi Administrasi & Layanan Publik Modern untuk Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur.

![Banner](https://images.unsplash.com/photo-1542273917363-3b1817f69a5d?q=80&w=2074&auto=format&fit=crop)

---

## 🏛️ Arsitektur Monorepo & Tech Stack

Aplikasi ini menggunakan standar arsitektur **Monorepo (NPM Workspaces)** yang bersih, modular, dan siap dijalankan baik untuk local development maupun containerized production via **Docker Compose**:

```
                    ┌─────────────────────────┐
                    │      Web Browser        │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Nuxt 4 Web Frontend   │ (Port 3000)
                    │   apps/web              │
                    └────────────┬────────────┘
                                 │ HTTP API
                                 ▼
                    ┌─────────────────────────┐
                    │   Fastify Backend API   │ (Port 3005)
                    │   apps/api              │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   PostgreSQL Database   │ (Port 5432)
                    │   Named Volume Storage  │
                    └─────────────────────────┘
```

### 📁 Struktur Direktori Repository

```text
Desa_Sukarama/
├── apps/
│   ├── api/                           # Backend Fastify + Drizzle ORM
│   │   ├── dist/                      # Compiled JavaScript output
│   │   ├── scripts/                   # Utility & import scripts (import-penduduk.ts)
│   │   ├── src/                       # Source code (db, plugins, routes, types, server.ts)
│   │   ├── Dockerfile                 # Multi-stage production build container
│   │   ├── drizzle.config.ts          # Drizzle ORM configuration
│   │   ├── package.json               # Backend dependencies
│   │   └── tsconfig.json
│   │
│   └── web/                           # Frontend Nuxt 4 + Tailwind CSS
│       ├── app/                       # Nuxt 4 app (assets, components, composables, pages, utils)
│       ├── public/                    # Static assets & Word template files (.docx)
│       ├── Dockerfile                 # Multi-stage production build container
│       ├── nuxt.config.ts             # Nuxt 4 configuration & Nitro caching
│       ├── tailwind.config.ts         # Tailwind design tokens
│       ├── package.json               # Frontend dependencies
│       └── tsconfig.json
│
├── uploads/                           # Data source files (.xlsx data penduduk)
├── compose.yml                        # Docker Compose full-stack orchestration
├── .dockerignore                      # Docker context ignore rules
├── .gitignore                         # Git ignore rules
├── .env.example                       # Template environment variables
├── package.json                       # Root NPM Workspaces orchestrator
└── README.md                          # Panduan resmi penggunaan proyek
```

---

## 🚀 Panduan Mulai Cepat (Quick Start)

Panduan ini ditujukan bagi anggota tim atau developer baru untuk menjalankan aplikasi dari nol hingga siap digunakan, lengkap beserta datanya.

### 1. Clone Repository
Langkah pertama, clone repository ini ke mesin lokal Anda:
```bash
git clone https://github.com/Daapputra/Desa_Sukarama.git
cd Desa_Sukarama
```

### 2. Siapkan Environment Variables
Salin file template environment bawaan:
```bash
cp .env.example .env
```
*(Anda dapat mengubah isi `.env` nantinya jika butuh password database atau port khusus).*

### 3. Nyalakan Aplikasi (via Docker)
Sangat direkomendasikan menjalankan aplikasi dalam mode *detached* (background) via Docker Compose. Perintah ini akan mengunduh, mem-build, dan menjalankan Database, API, serta Web sekaligus:
```bash
docker compose up --build -d
```
Tunggu beberapa saat hingga seluruh proses build selesai.

### 4. Instalasi Dependensi & Import Data (NIK)
Agar aplikasi memiliki data admin dan data riil penduduk (dari file Excel), Anda perlu melakukan *seeding*. Pastikan **Node.js** terinstal di laptop Anda, lalu jalankan:
```bash
# Instal seluruh dependensi project (NPM Workspaces)
npm install

# (Opsional) Push skema database terbaru jika ada perubahan struktur
npm run db:push

# Masukkan data dummy dasar dan akun Administrator
npm run db:seed

# Import ribuan data riil penduduk (Data NIK) dari file Excel
npm run import:penduduk
```

### 5. Akses Aplikasi
Setelah semua langkah di atas selesai, sistem sudah siap digunakan sepenuhnya:
* 🌐 **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend API Health:** [http://localhost:3005/api/health](http://localhost:3005/api/health)
* 🔐 **Login Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) *(Username: `admin`, Password: `admin123`)*

### 6. Akses Database GUI (Built-in)
Tidak perlu menginstall DBeaver atau pgAdmin. Proyek ini sudah terintegrasi dengan GUI Database **Pgweb** di dalam Docker:
* 🗄️ **Database Manager:** [http://localhost:8081](http://localhost:8081)
* Anda bisa langsung melihat tabel, mengedit isi database, melihat log 6.000+ data NIK, atau menjalankan query SQL langsung dari browser!

---

## 🛠️ Manajemen Aplikasi (Start / Stop)

Sebagai developer, Anda harus tahu cara mematikan, menyalakan, dan mereset aplikasi Docker ini.

### 🔍 Melihat Log Aplikasi (Realtime)
Untuk melihat aktivitas atau mencari tahu jika ada error:
```bash
# Log seluruh sistem
docker compose logs -f

# Log khusus backend API saja
docker compose logs -f api
```

### ⏸️ Pause & Resume (Shortcut Cepat)
Jika Anda ingin mematikan aplikasi sementara (misal: mematikan laptop) tanpa menghapus *container*:
```bash
# Mematikan sementara
docker compose stop

# Menyalakan kembali (sangat cepat, tanpa build ulang)
docker compose start
```

### 🛑 Mematikan & Menghapus Container
Jika Anda ingin mematikan aplikasi sepenuhnya dan membersihkan *resources* komputer Anda:
```bash
docker compose down
```
> [!NOTE]  
> Jangan khawatir, **Data PostgreSQL (NIK, dll) tersimpan sangat aman** di Named Volume (`sukarama_postgres_data`). Data tidak akan terhapus saat Anda menjalankan perintah `down`.

### 🗑️ Reset Data Total (Factory Reset)
Gunakan perintah ini **hanya** jika Anda ingin menghapus sistem secara total, termasuk menghancurkan seluruh data NIK dan database permanen:
```bash
docker compose down -v
```

---

## 💻 Cara Menjalankan untuk Local Development (Tanpa Docker App)

Jika ingin menjalankan aplikasi secara langsung di mesin lokal dengan hot-reload:

### 1. Prasyarat
* **Node.js** v20+ atau v22+
* **PostgreSQL** aktif di port `5432` (misal via Docker: `docker run -d --name pg-desa -p 5432:5432 -e POSTGRES_PASSWORD=rahasia -e POSTGRES_DB=desasukarama postgres:16-alpine`)

### 2. Instalasi Dependensi Monorepo
Jalankan di root folder:
```bash
npm install
```

### 3. Jalankan Seluruh Aplikasi Sekaligus
```bash
npm run dev
```
Perintah ini akan menyalakan server backend Fastify (`:3005`) dan server frontend Nuxt 4 (`:3000`) secara bersamaan dengan logging warna terpisah.

---

## 📦 Skrip Perintah Monorepo

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan backend API & frontend Web secara bersamaan |
| `npm run dev:api` | Menjalankan hanya backend API di port 3005 |
| `npm run dev:web` | Menjalankan hanya frontend Web di port 3000 |
| `npm run build` | Melakukan kompilasi TypeScript backend dan build bundle Nuxt 4 |
| `npm run typecheck` | Memvalidasi seluruh TypeScript types pada backend dan frontend |
| `npm run import:penduduk` | Mengimpor data 6.167+ penduduk dari file Excel ke database |

---

## 👥 Akun Administrator Bawaan

* **URL Login:** `/admin`
* **Username:** `admin`
* **Password:** `admin123`

*(Password dapat di-reset kapan saja menggunakan perintah `npm --prefix apps/api run reset:admin`)*.

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

## ⚡ Cara Menjalankan dengan Docker Compose (Rekomendasi)

Cukup **satu perintah** untuk menjalankan seluruh stack (*PostgreSQL*, *Fastify API*, dan *Nuxt Web*):

### 1. Salin Environment
```bash
cp .env.example .env
```

### 2. Jalankan Full-Stack Container (Background Mode)
Sangat direkomendasikan menjalankan dalam mode *detached* (background) agar terminal bisa tetap digunakan:
```bash
docker compose up --build -d
```

Setelah container berjalan:
* 🌐 **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend API Health:** [http://localhost:3005/api/health](http://localhost:3005/api/health)
* 🔐 **Login Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) *(Username: `admin`, Password: `admin123`)*

### 🔍 Melihat Log Aplikasi (Realtime)
Jika dijalankan dalam mode background (`-d`), Anda bisa melihat log aplikasi kapan saja:
```bash
# Melihat log semua aplikasi (Web, API, DB)
docker compose logs -f

# Melihat log API saja
docker compose logs -f api
```

### ⏸️ Mematikan & Menyalakan (Shortcut Cepat)
Jika Anda hanya ingin mematikan *sementara* dan menyalakannya lagi (tanpa menghapus container):
```bash
# Mematikan sementara
docker compose stop

# Menyalakan kembali
docker compose start
```

### 🛑 Mematikan & Menghapus Container
Jika Anda ingin mematikan dan membersihkan resources container (data database akan tetap aman):
```bash
docker compose down
```

> [!NOTE]
> Data PostgreSQL tersimpan secara aman di Docker Named Volume (`sukarama_postgres_data`). Data tidak akan hilang saat container dihancurkan.

### 🗑️ Menghapus Data Database (Reset Total)
Jika Anda ingin mereset/menghapus seluruh data di database secara permanen:
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

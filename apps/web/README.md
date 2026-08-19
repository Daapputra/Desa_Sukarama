# 🌿 Frontend Web Desa Sukarama

Aplikasi web modern berbasis **Nuxt 4** dan **Tailwind CSS** untuk portal layanan publik, administrasi surat desa, dan katalog UMKM Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur.

---

## 📂 Struktur Direktori Standar

```
apps/web/
├── app/
│   ├── assets/css/        # Desain tokens, tema warna & utility styles
│   ├── components/        # Komponen UI (SiteHeader, SiteFooter)
│   ├── composables/       # Logika API fetching (useApi) & auth (useAuth)
│   ├── layouts/           # Layouts (default, admin)
│   ├── pages/             # Routing halaman (index, layanan, umkm, profil, kontak, admin)
│   ├── plugins/           # Nuxt plugins (animasi scroll)
│   ├── utils/             # Format tanggal, Rupiah & string helpers
│   └── app.vue            # Root template
├── public/                # Asset publik (gambar, template surat docx)
├── nuxt.config.ts         # Konfigurasi Nuxt 4, Nitro caching, SEO meta
├── tailwind.config.ts     # Konfigurasi tema Tailwind CSS
└── package.json           # Dependencies ringan & skrip build
```

---

## ⚡ Skrip Tersedia

```bash
# Menjalankan server development (Port 3000)
npm run dev

# Membangun bundle produksi teroptimasi
npm run build

# Menjalankan preview dari build produksi
npm run preview
```

<script setup lang="ts">
import {
  ArrowRight, FileText, ShoppingBag, Users, Home, Map, Ruler,
  ShieldCheck, User, Calendar, MessageCircle, ChevronRight,
  Building2, Search, HeartHandshake
} from 'lucide-vue-next'
import { formatTanggal, formatRupiah } from '~/utils/format'

useHead({
  title: 'Pemerintah Desa Sukarama — Kecamatan Bojongpicung, Cianjur',
  meta: [
    { name: 'description', content: 'Website Resmi Pemerintah Desa Sukarama. Portal administrasi surat online, direktori UMKM desa, pengumuman warga, dan informasi publik terpadu.' }
  ]
})

const { apiGet } = useApi()

// Fetch real data
const { data: pengumumanList } = useAsyncData('pengumuman', () =>
  apiGet<any[]>('/api/pengumuman?limit=3').catch(() => [])
)

const { data: umkmList } = useAsyncData('umkm', () =>
  apiGet<any[]>('/api/umkm').catch(() => [])
)

const produkUnggulanLokal = [
  { id: 1, namaProduk: 'Keripik Singkong Pedas Bu Enah', harga: 15000, kategori: 'Makanan', pemilik: 'Bu Enah', noWaPemilik: '6281234567890', fotoPath: '/images/products/keripik.jpg' },
  { id: 2, namaProduk: 'Dodol Cianjur Pak Oman', harga: 25000, kategori: 'Makanan', pemilik: 'Pak Oman', noWaPemilik: '6281234567891', fotoPath: '/images/products/dodol.jpg' },
  { id: 3, namaProduk: 'Anyaman Bambu Mang Dadang', harga: 75000, kategori: 'Kerajinan', pemilik: 'Mang Dadang', noWaPemilik: '6281234567892', fotoPath: '/images/products/anyaman.jpg' },
  { id: 4, namaProduk: 'Gula Aren Asli Pak Udin', harga: 35000, kategori: 'Hasil Tani', pemilik: 'Pak Udin', noWaPemilik: '6281234567893', fotoPath: '/images/products/gula-aren.jpg' },
]

const produkUnggulan = computed(() => {
  if (umkmList.value && umkmList.value.length > 0) {
    return umkmList.value.slice(0, 4)
  }
  return produkUnggulanLokal
})

const stats = [
  { icon: Users, label: 'Penduduk Terindeks', value: '6.167+', desc: 'Jiwa di Database Desa' },
  { icon: Home, label: 'Kepala Keluarga', value: '1.950+', desc: 'Terdaftar di KK' },
  { icon: Map, label: 'Wilayah Desa', value: '3 Dusun', desc: '6 RW & 33 RT' },
  { icon: Ruler, label: 'Luas Wilayah', value: '485 Ha', desc: 'Lahan Produktif & Pemukiman' },
]

function getProductImg(produk: any) {
  const path = produk.foto_path || produk.fotoPath
  if (path && (path.startsWith('http') || path.startsWith('/images/'))) {
    return path
  }
  if (produk.kategori === 'Makanan') return '/images/products/keripik.jpg'
  if (produk.kategori === 'Kerajinan') return '/images/products/anyaman.jpg'
  return '/images/products/gula-aren.jpg'
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/images/products/keripik.jpg'
}

function getWhatsappUrl(p: any): string {
  let phone = p.no_wa_pemilik || p.noWaPemilik || '6281234567890'
  phone = phone.replace(/\D/g, '')
  if (phone.startsWith('0')) phone = '62' + phone.substring(1)
  const name = p.nama_produk || p.namaProduk
  const seller = p.pemilik || 'Bapak/Ibu'
  const message = `Halo ${seller}, saya melihat produk "${name}" di Website Resmi Desa Sukarama. Apakah produk ini tersedia?`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-[90vh] flex items-center bg-slate-950 overflow-hidden">
      <!-- Background Image with Ambient Glow -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/hero-banner1.jpeg"
          alt="Pemandangan Desa Sukarama"
          class="w-full h-full object-cover opacity-90 scale-105 animate-[heroBgZoom_20s_ease-out_forwards]"
          decoding="async"
        />
      </div>
      <div class="absolute inset-0 z-10 bg-gradient-to-tr from-slate-950 via-slate-950/75 to-emerald-950/50"></div>

      <!-- Hero Content -->
      <div class="container-app relative z-20 py-24 md:py-32 text-center text-white">
        <div class="max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-8 backdrop-blur-md shadow-lg shadow-black/20 animate-fade-in">
            <ShieldCheck class="w-4 h-4 text-emerald-400" />
            <span>Portal Resmi Pemerintah Desa Sukarama</span>
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.12] tracking-tight mb-6 drop-shadow-lg">
            Mewujudkan Pelayanan Publik Desa yang Cerdas, Cepat & Terintegrasi
          </h1>

          <p class="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-10 max-w-2xl mx-auto drop-shadow">
            Kecamatan Bojongpicung, Kabupaten Cianjur, Jawa Barat.<br class="hidden sm:inline">
            Nikmati kemudahan pembuatan surat administrasi online, katalog produk UMKM lokal, dan transparansi informasi desa.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink
              to="/layanan"
              class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <FileText class="w-4 h-4" />
              <span>Ajukan Surat Online</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/layanan?tab=cek"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm backdrop-blur-md active:scale-95 transition-all duration-300"
            >
              <Search class="w-4 h-4" />
              <span>Lacak Surat (Via NIK)</span>
            </NuxtLink>

            <NuxtLink
              to="/umkm"
              class="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/80 text-emerald-200 font-bold text-sm backdrop-blur-md transition-all duration-300"
            >
              <ShoppingBag class="w-4 h-4" />
              <span>Belanja UMKM Desa</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Real Stats Counter Banner -->
    <section class="relative z-30 -mt-10 mb-10">
      <div class="container-app">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="st in stats"
            :key="st.label"
            class="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-950/5 flex items-center gap-4 group hover:border-emerald-300 transition-all"
          >
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <component :is="st.icon" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {{ st.value }}
              </div>
              <div class="text-xs font-bold text-slate-700 leading-tight">
                {{ st.label }}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">
                {{ st.desc }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sambutan Kepala Desa -->
    <section class="py-14 md:py-20 bg-white">
      <div class="container-app">
        <div class="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50/70 to-slate-50 rounded-3xl border border-emerald-100 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 border-4 border-white shadow-xl shadow-emerald-950/10">
            <User class="w-16 h-16 opacity-90" />
          </div>
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck class="w-3.5 h-3.5" />
              Sambutan Kepala Desa
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">
              Wahyu Komara
            </h2>
            <p class="text-sm text-slate-600 leading-relaxed text-justify mb-5">
              "Assalamu’alaikum Warahmatullahi Wabarakatuh. Selamat datang di Website Resmi Desa Sukarama. Portal ini kami hadirkan sebagai wujud komitmen keterbukaan informasi publik dan digitalisasi pelayanan warga secara mandiri, efisien, dan ramah masyarakat. Mari kita bersama membangun Desa Sukarama yang maju, mandiri, dan sejahtera."
            </p>
            <NuxtLink
              to="/profil"
              class="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-800 hover:text-emerald-700"
            >
              <span>Pelajari Profil & Sejarah Desa</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Layanan Unggulan Cepat -->
    <section class="py-14 bg-slate-50/70 border-y border-slate-200/80">
      <div class="container-app">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Kemudahan Layanan
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3 mb-2">
            Administrasi Surat dalam 4 Langkah
          </h2>
          <p class="text-xs sm:text-sm text-slate-500">
            Tak perlu lagi antre di kantor desa. Dokumen resmi dibuat otomatis dan bertanda tangan digital.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            to="/layanan"
            class="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <Building2 class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-slate-900 text-base mb-1.5 group-hover:text-emerald-800 transition-colors">
                Surat Domisili
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Bukti domisili resmi tempat tinggal di wilayah Sukarama untuk berbagai keperluan administrasi.
              </p>
            </div>
            <div class="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>Ajukan Sekarang</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>

          <NuxtLink
            to="/layanan"
            class="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <ShoppingBag class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-slate-900 text-base mb-1.5 group-hover:text-emerald-800 transition-colors">
                Keterangan Usaha (SKU)
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Legalitas keterangan usaha warga desa untuk pengajuan modal usaha, izin, atau persyaratan bank.
              </p>
            </div>
            <div class="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>Ajukan Sekarang</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>

          <NuxtLink
            to="/layanan"
            class="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <FileText class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-slate-900 text-base mb-1.5 group-hover:text-emerald-800 transition-colors">
                Surat Beda Nama
              </h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Klarifikasi resmi perbedaan ejaan nama antara Kartu Keluarga dan KTP/Ijazah warga.
              </p>
            </div>
            <div class="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>Ajukan Sekarang</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>

          <NuxtLink
            to="/layanan?tab=cek"
            class="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl shadow-emerald-950/20 hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div>
              <div class="w-12 h-12 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center mb-4">
                <Search class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-white text-base mb-1.5">
                Lacak Pengajuan Surat
              </h3>
              <p class="text-xs text-emerald-200/80 leading-relaxed">
                Cukup ketik NIK untuk melihat status persetujuan surat dan langsung mengunduh file dokumen resmi.
              </p>
            </div>
            <div class="mt-6 flex items-center gap-1 text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition-transform">
              <span>Cek Status NIK</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Pengumuman Terbaru -->
    <section class="py-16 bg-white">
      <div class="container-app">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Warta & Informasi
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Pengumuman & Agenda Desa
            </h2>
          </div>
          <NuxtLink to="/layanan" class="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
            <span>Lihat semua layanan</span>
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div v-if="pengumumanList && pengumumanList.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="p in pengumumanList"
            :key="p.id"
            class="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 mb-3">
                <Calendar class="w-3.5 h-3.5" />
                <span>{{ formatTanggal(p.tanggal) }}</span>
              </div>
              <h3 class="font-extrabold text-slate-900 text-base leading-snug mb-2">
                {{ p.judul }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {{ p.konten }}
              </p>
            </div>
            <div class="pt-4 mt-4 border-t border-slate-200/60 text-[11px] font-bold text-emerald-800">
              Pengumuman Resmi Kantor Desa
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase Produk UMKM -->
    <section class="py-16 bg-slate-50/70 border-t border-slate-200/80">
      <div class="container-app">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Karya Warga Desa
            </span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Produk Unggulan UMKM Sukarama
            </h2>
          </div>
          <NuxtLink to="/umkm" class="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
            <span>Buka Katalog Lengkap</span>
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="p in produkUnggulan"
            :key="p.id"
            class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
          >
            <div class="h-44 overflow-hidden bg-slate-100 relative">
              <img
                :src="getProductImg(p)"
                :alt="p.nama_produk || p.namaProduk"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
                @error="handleImageError"
              />
              <span class="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-emerald-900">
                {{ p.kategori }}
              </span>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm leading-snug mb-1 group-hover:text-emerald-800 transition-colors">
                  {{ p.nama_produk || p.namaProduk }}
                </h3>
                <p class="text-[11px] text-slate-500 mb-3">Oleh: {{ p.pemilik }}</p>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-sm font-black text-emerald-800">
                  {{ formatRupiah(p.harga) }}
                </span>
                <a
                  :href="getWhatsappUrl(p)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  title="Pesan via WhatsApp"
                >
                  <MessageCircle class="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call To Action Aspirasi Warga -->
    <section class="py-16 bg-gradient-to-br from-emerald-900 to-slate-900 text-white">
      <div class="container-app">
        <div class="max-w-3xl mx-auto text-center">
          <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <HeartHandshake class="w-7 h-7 text-emerald-400" />
          </div>
          <h2 class="text-2xl sm:text-3xl font-black mb-3">
            Punya Saran, Keluhan, atau Aspirasi untuk Desa?
          </h2>
          <p class="text-xs sm:text-sm text-emerald-100/80 mb-8 leading-relaxed">
            Suara Anda sangat berharga untuk kemajuan bersama. Sampaikan aspirasi atau keluhan secara langsung melalui saluran komunikasi resmi pemerintah desa.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-3">
            <NuxtLink
              to="/kontak"
              class="px-8 py-3.5 rounded-full bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 active:scale-95 shadow-xl transition-all"
            >
              Kirim Pesan & Aspirasi
            </NuxtLink>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Desa%20Sukarama"
              target="_blank"
              rel="noopener noreferrer"
              class="px-8 py-3.5 rounded-full border border-emerald-400/50 hover:bg-white/10 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle class="w-4 h-4" />
              <span>WhatsApp Kantor Desa</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Chatbot Asisten Warga (tampilan saja, belum terhubung backend) -->
    <ChatWidget />
  </div>
</template>

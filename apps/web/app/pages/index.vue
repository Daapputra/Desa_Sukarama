<script setup lang="ts">
import { ArrowRight, FileText, ShoppingBag, Users, Home, Map, Ruler, Info, ShieldCheck, User, Calendar, MessageCircle, Newspaper, ChevronRight } from 'lucide-vue-next'

const { apiGet } = useApi()

// Fetch data
const { data: pengumumanList } = useAsyncData('pengumuman', () =>
  apiGet<any[]>('/api/pengumuman?limit=3').catch(() => [])
)
const { data: umkmList } = useAsyncData('umkm', () =>
  apiGet<any[]>('/api/umkm').catch(() => [])
)

const produkUnggulanLokal = [
  { id: 'lokal-keripik', namaProduk: 'Keripik Singkong Pedas', harga: 15000, kategori: 'Makanan', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567890', fotoPath: '/images/products/keripik.jpg' },
  { id: 'lokal-dodol', namaProduk: 'Dodol Khas Cianjur', harga: 25000, kategori: 'Makanan', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567891', fotoPath: '/images/products/dodol.jpg' },
  { id: 'lokal-anyaman', namaProduk: 'Anyaman Bambu', harga: 75000, kategori: 'Kerajinan', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567892', fotoPath: '/images/products/anyaman.jpg' },
  { id: 'lokal-gula-aren', namaProduk: 'Gula Aren Asli', harga: 35000, kategori: 'Hasil Tani', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567893', fotoPath: '/images/products/gula-aren.jpg' },
  { id: 'lokal-kopi', namaProduk: 'Kopi Pilihan Desa', harga: 30000, kategori: 'Hasil Tani', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567894', fotoPath: '/images/products/kopi.jpg' },
]

const produkUnggulan = computed(() => umkmList.value?.length ? umkmList.value : produkUnggulanLokal)

const stats = [
  { icon: Users, label: 'Jumlah Penduduk', value: '7.500', color: 'bg-green-50 text-green-700' },
  { icon: Home, label: 'Kepala Keluarga', value: '1.500', color: 'bg-green-50 text-green-700' },
  { icon: Map, label: 'Dusun / 6 RW / 33 RT', value: '3', color: 'bg-green-50 text-green-700' },
  { icon: Ruler, label: 'Luas Wilayah (Ha)', value: '485', color: 'bg-green-50 text-green-700' },
]

function productImage(produk: Record<string, string>) {
  return produk.foto_path || produk.fotoPath || ''
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-[85vh] flex items-center bg-slate-900 overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/hero-banner1.jpeg"
          alt="Desa Sukarama"
          class="w-full h-full object-cover opacity-100 scale-105 animate-[heroBgZoom_15s_ease-out_forwards]"
        >
      </div>
      <!-- Overlay -->
      <div class="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/85 to-green-900/65"></div>

      <!-- Content -->
      <div class="container-app relative z-20 py-24 md:py-32 text-center text-white animate-fade-in-up">
        <div class="max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold tracking-wide uppercase mb-8 backdrop-blur-sm shadow-sm">
            <ShieldCheck class="w-4 h-4" />
            Website Resmi Pemerintah Desa
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-[4.2rem] font-extrabold text-white leading-[1.15] tracking-tight mb-8 drop-shadow-md">
            Selamat Datang di Website Resmi Desa Sukarama
          </h1>

          <p class="text-lg md:text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto drop-shadow">
            Portal informasi, layanan publik, dan produk unggulan desa.<br>
            Kecamatan Bojongpicung, Kabupaten Cianjur, Provinsi Jawa Barat.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink
              to="/layanan"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-green-700 text-white font-semibold hover:bg-green-600 active:scale-95 hover:-translate-y-0.5 shadow-md transition-all duration-300"
            >
              <FileText class="w-5 h-5" />
              Ajukan Surat Online
            </NuxtLink>
            <NuxtLink
              to="/profil"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-white/5 border border-white/40 text-white font-semibold backdrop-blur-md hover:bg-white/15 hover:border-white active:scale-95 hover:-translate-y-1 shadow-lg transition-all duration-300"
            >
              <Info class="w-5 h-5" />
              Profil Desa
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Sambutan Kepala Desa -->
    <section class="py-16 md:py-24 bg-white overflow-hidden">
      <div class="container-app">
        <div class="flex flex-col md:flex-row gap-10 items-center" v-animate>
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border-4 border-slate-50 shadow-sm hover:scale-105 transition-transform duration-500">
            <User class="w-16 h-16" />
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Sambutan Kepala Desa</h3>
            <p class="text-base text-slate-600 leading-relaxed mb-6">
              Assalamu'alaikum Wr. Wb.<br><br>
              Puji serta syukur kita panjatkan kehadirat Allah SWT. Atas rahmat dan karunia-Nya, 
              website resmi Desa Sukarama dapat hadir untuk melayani masyarakat secara digital. 
              Website ini merupakan wujud komitmen kami dalam meningkatkan transparansi informasi 
              dan kemudahan layanan publik bagi seluruh warga Desa Sukarama.<br><br>
              Melalui website ini, warga dapat mengakses informasi desa, mengajukan surat secara 
              online, serta mengenal produk UMKM unggulan desa kita. Semoga website ini bermanfaat 
              bagi kemajuan Desa Sukarama.
            </p>
            <div class="font-bold text-slate-900 text-lg">Wahyu Komara</div>
            <div class="text-sm text-green-700 font-medium">Kepala Desa Sukarama</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistik Desa -->
    <section class="py-16 md:py-24 bg-slate-50 overflow-hidden">
      <div class="container-app">
        <div class="text-center mb-16" v-animate>
          <h2 class="text-3xl font-extrabold text-slate-900 mb-3">Desa Sukarama dalam Angka</h2>
          <p class="text-base text-slate-600 max-w-2xl mx-auto">Data statistik desa yang terus kami perbarui untuk transparansi informasi</p>
          <div class="w-12 h-1 bg-gradient-to-r from-green-700 to-green-500 rounded-full mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            v-animate="{ delay: index * 100 }"
            class="bg-white rounded-xl p-8 border border-slate-200 text-center hover:-translate-y-2 hover:shadow-xl hover:border-green-100 cursor-pointer active:scale-95 transition-all duration-300"
          >
            <div class="w-12 h-12 rounded-lg bg-green-50 text-green-700 flex items-center justify-center mx-auto mb-4">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
            <div class="text-4xl font-extrabold text-green-800 mb-2 leading-none">{{ stat.value }}</div>
            <div class="text-sm font-medium text-slate-600">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pengumuman -->
    <section class="py-16 md:py-24 bg-white overflow-hidden">
      <div class="container-app">
        <div class="text-center mb-16" v-animate>
          <h2 class="text-3xl font-extrabold text-slate-900 mb-3">Pengumuman Terbaru</h2>
          <p class="text-base text-slate-600 max-w-2xl mx-auto">Informasi dan pengumuman terbaru dari Pemerintah Desa Sukarama</p>
          <div class="w-12 h-1 bg-gradient-to-r from-green-700 to-green-500 rounded-full mx-auto mt-6"></div>
        </div>

        <div v-if="pengumumanList && pengumumanList.length" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(item, index) in pengumumanList"
            :key="item.id"
            v-animate="{ delay: index * 100 }"
            class="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-2 hover:border-green-100 cursor-pointer active:scale-[0.98] transition-all duration-300 flex flex-col"
          >
            <div class="flex items-center gap-2 mb-3 text-slate-400 text-sm">
              <Calendar class="w-4 h-4" />
              <span>{{ formatTanggal(item.tanggal) }}</span>
            </div>
            <h3 class="font-bold text-slate-900 text-lg mb-3 leading-snug group-hover:text-green-700 transition-colors">
              {{ item.judul }}
            </h3>
            <p class="text-sm text-slate-600 leading-relaxed mb-6 flex-1 line-clamp-3">
              {{ truncateText(item.konten, 150) }}
            </p>
            <button class="inline-flex items-center gap-1 text-sm font-semibold text-green-700 group-hover:gap-2 transition-all">
              Baca selengkapnya <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-else class="text-center py-16 text-slate-500" v-animate>
          <p>Belum ada pengumuman.</p>
        </div>
      </div>
    </section>

    <!-- Preview UMKM -->
    <section class="py-16 md:py-24 bg-green-50 overflow-hidden">
      <div class="container-app">
        <div class="text-center mb-16" v-animate>
          <h2 class="text-3xl font-extrabold text-slate-900 mb-3">Produk UMKM Unggulan</h2>
          <p class="text-base text-slate-600 max-w-2xl mx-auto">Dukung produk lokal warga Desa Sukarama</p>
          <div class="w-12 h-1 bg-gradient-to-r from-green-700 to-green-500 rounded-full mx-auto mt-6"></div>
        </div>

        <div v-if="produkUnggulan.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(produk, index) in produkUnggulan.slice(0, 6)"
            :key="produk.id"
            v-animate="{ delay: index * 100 }"
            class="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 hover:border-green-100 transition-all duration-300 flex flex-col"
          >
            <div class="relative aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                v-if="productImage(produk)"
                :src="productImage(produk)"
                :alt="`Foto ${produk.nama_produk || produk.namaProduk}`"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              >
              <ShoppingBag v-else class="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div class="p-6 flex flex-col flex-1 text-center">
              <span class="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-3 w-fit mx-auto">
                {{ produk.kategori }}
              </span>
              <h3 class="font-bold text-slate-900 text-lg mb-2 group-hover:text-green-700 transition-colors">
                {{ produk.nama_produk || produk.namaProduk }}
              </h3>
              <p class="text-green-700 font-bold text-xl mb-1">{{ formatRupiah(produk.harga) }}</p>
              <div class="flex items-center justify-center gap-1.5 text-sm text-slate-500 mb-6">
                <User class="w-4 h-4" />
                {{ produk.pemilik }}
              </div>
              <a
                :href="`https://wa.me/${produk.no_wa_pemilik}?text=${encodeURIComponent('Halo, saya tertarik dengan produk ' + (produk.nama_produk || produk.namaProduk) + ' dari Website Desa Sukarama.')}`"
                target="_blank"
                class="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1EBE5A] active:scale-95 hover:-translate-y-px shadow-sm transition-all duration-300"
              >
                <MessageCircle class="w-4 h-4" />
                Pesan via WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16 text-slate-500" v-animate>
          <p>Belum ada produk UMKM.</p>
        </div>
        
        <div class="text-center mt-12" v-animate>
          <NuxtLink
            to="/umkm"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-md border-2 border-green-700 text-green-700 font-semibold hover:bg-green-700 hover:text-white active:scale-95 transition-all duration-300"
          >
            <ArrowRight class="w-5 h-5" />
            Lihat Semua Produk
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes heroBgZoom {
  0% { transform: scale(1.05); }
  100% { transform: scale(1.15); }
}
</style>

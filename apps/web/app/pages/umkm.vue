<script setup lang="ts">
import { ShoppingBag, ChevronRight, ExternalLink } from 'lucide-vue-next'

useHead({ title: 'UMKM Desa — Desa Sukarama' })

const { apiGet } = useApi()
const activeKategori = ref('Semua')
const kategoriList = ['Semua', 'Makanan', 'Kerajinan', 'Hasil Tani', 'Lainnya']

// Foto produk dari folder FE/images/products ditampilkan langsung agar katalog
// tetap menarik, termasuk saat layanan data belum tersedia.
const produkLokal = [
  { id: 'lokal-keripik', namaProduk: 'Keripik Singkong Pedas', harga: 15000, kategori: 'Makanan', deskripsi: 'Keripik singkong renyah dengan bumbu pedas khas Cianjur.', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567890', fotoPath: '/images/products/keripik.jpg' },
  { id: 'lokal-dodol', namaProduk: 'Dodol Khas Cianjur', harga: 25000, kategori: 'Makanan', deskripsi: 'Dodol legit berbahan ketan, gula aren, dan santan pilihan.', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567891', fotoPath: '/images/products/dodol.jpg' },
  { id: 'lokal-anyaman', namaProduk: 'Anyaman Bambu', harga: 75000, kategori: 'Kerajinan', deskripsi: 'Kerajinan anyaman bambu buatan tangan warga desa.', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567892', fotoPath: '/images/products/anyaman.jpg' },
  { id: 'lokal-gula-aren', namaProduk: 'Gula Aren Asli', harga: 35000, kategori: 'Hasil Tani', deskripsi: 'Gula aren murni dari kebun warga Desa Sukarama.', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567893', fotoPath: '/images/products/gula-aren.jpg' },
  { id: 'lokal-kopi', namaProduk: 'Kopi Pilihan Desa', harga: 30000, kategori: 'Hasil Tani', deskripsi: 'Kopi lokal dengan aroma hangat untuk dinikmati bersama keluarga.', pemilik: 'UMKM Desa Sukarama', noWaPemilik: '6281234567894', fotoPath: '/images/products/kopi.jpg' },
]

const { data: allProduk, pending } = useAsyncData('umkm-all', () =>
  apiGet<any[]>('/api/umkm').catch(() => [])
)

const filteredProduk = computed(() => {
  const produk = allProduk.value?.length ? allProduk.value : produkLokal
  if (activeKategori.value === 'Semua') return produk
  return produk.filter((p: any) => p.kategori === activeKategori.value)
})

function productImage(produk: Record<string, string>) {
  return produk.foto_path || produk.fotoPath || ''
}
</script>

<template>
  <div>
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute bottom-10 right-10 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>
      <div class="container-app relative z-10 text-center">
        <div class="flex items-center justify-center gap-2 text-green-300 text-xs font-medium mb-4">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span class="text-white">UMKM</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-3">Produk UMKM Desa Sukarama</h1>
        <p class="text-green-200/70 text-sm max-w-lg mx-auto">Dukung produk lokal dari warga Desa Sukarama. Belanja langsung dari produsen!</p>
      </div>
    </section>

    <section class="py-12 md:py-16">
      <div class="container-app">
        <!-- Filter -->
        <div class="flex flex-wrap gap-2 justify-center mb-10">
          <button
            v-for="kat in kategoriList"
            :key="kat"
            class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            :class="activeKategori === kat
              ? 'bg-green-900 text-white shadow-lg shadow-green-900/25'
              : 'bg-white text-slate-500 border border-border hover:border-green-300 hover:text-green-800'"
            @click="activeKategori = kat"
          >
            {{ kat }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-3 border-border border-t-green-800 rounded-full animate-spin"></div>
        </div>

        <!-- Products -->
        <div v-else-if="filteredProduk.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="produk in filteredProduk"
            :key="produk.id"
            class="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div class="aspect-[4/3] bg-gradient-to-br from-green-50 to-slate-100 flex items-center justify-center text-5xl relative overflow-hidden">
              <img
                v-if="productImage(produk)"
                :src="productImage(produk)"
                :alt="`Foto ${produk.nama_produk || produk.namaProduk}`"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <span v-else aria-hidden="true">🛍️</span>
              <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-semibold text-green-800">
                {{ produk.kategori }}
              </span>
            </div>
            <div class="p-5 text-center">
              <h3 class="font-bold text-slate-900 text-sm mb-1 group-hover:text-green-800 transition-colors">
                {{ produk.nama_produk || produk.namaProduk }}
              </h3>
              <p class="text-green-800 font-bold text-lg mb-2">{{ formatRupiah(produk.harga) }}</p>
              <p class="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                {{ produk.deskripsi }}
              </p>
              <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-2">
                <span class="text-xs text-muted-foreground">{{ produk.pemilik }}</span>
                <a
                  :href="`https://wa.me/${produk.no_wa_pemilik || produk.noWaPemilik}?text=Halo, saya tertarik dengan produk ${produk.nama_produk || produk.namaProduk}`"
                  target="_blank"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-800 text-xs font-semibold hover:bg-green-100 transition-colors"
                >
                  <ExternalLink class="w-3 h-3" />
                  Hubungi
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="text-center py-20 text-muted-foreground">
          <ShoppingBag class="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p class="text-sm font-medium">Belum ada produk {{ activeKategori !== 'Semua' ? `kategori "${activeKategori}"` : '' }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

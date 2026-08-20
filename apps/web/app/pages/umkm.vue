<script setup lang="ts">
import {
  ShoppingBag, ChevronRight, Search, MessageCircle,
  User, Sparkles, X
} from 'lucide-vue-next'
import { formatRupiah } from '~/utils/format'

useHead({
  title: 'Katalog Produk UMKM Desa Sukarama',
  meta: [
    { name: 'description', content: 'Jelajahi berbagai produk kerajinan, kuliner, dan hasil bumi unggulan dari pelaku UMKM Desa Sukarama. Pesan langsung ke produsen melalui WhatsApp.' }
  ]
})

const { apiGet } = useApi()
const activeKategori = ref('Semua')
const searchQuery = ref('')
const selectedProduct = ref<any | null>(null)

const kategoriList = ['Semua', 'Makanan', 'Kerajinan', 'Hasil Tani', 'Lainnya']

// Foto produk lokal sebagai fallback visual yang tetap elegan
const produkLokal = [
  { id: 5, namaProduk: 'Kukumbul (Pelampung Pancing)', harga: 80000, kategori: 'Kerajinan', deskripsi: 'Kerajinan pelampung pancing (kukumbul) buatan tangan berkualitas.', pemilik: 'Pengrajin Kukumbul', noWaPemilik: '6281573276932', fotoPath: '/images/kukumbul.jpeg' },
  { id: 6, namaProduk: 'Sapu Injuk Tradisional', harga: 150000, kategori: 'Kerajinan', deskripsi: 'Sapu injuk buatan tangan asli warga Desa Sukarama. Sangat kuat, awet, dan nyaman digunakan.', pemilik: 'Perajin Injuk Desa', noWaPemilik: '6283817916016', fotoPath: '/images/sapu injuk.jpeg' },
  { id: 7, namaProduk: 'Doran Pacul Kayu Jati', harga: 140000, kategori: 'Kerajinan', deskripsi: 'Gagang cangkul dari kayu jati berkualitas tinggi yang kokoh untuk kebutuhan pertanian.', pemilik: 'Pengrajin Kayu Sukarama', noWaPemilik: '6285943097900', fotoPath: '/images/doranpacul.jpeg' },
  { id: 8, namaProduk: 'Pentol Jagoan', harga: 5000, kategori: 'Makanan', deskripsi: 'Pentol Jagoan yang lezat dan gurih. Harga satuan bervariasi dari Rp 1.000, Rp 2.000, hingga Rp 5.000.', pemilik: 'Pentol Jagoan', noWaPemilik: '6283871171146', fotoPath: '/images/products/pentol_jagoan.jpg' },
]

const { data: dbProduk } = useAsyncData('umkm-all', () =>
  apiGet<any[]>('/api/umkm').catch(() => []),
  { server: false }
)

const allProduk = computed(() => {
  let list = produkLokal
  if (dbProduk.value && dbProduk.value.length > 0) {
    list = [...produkLokal, ...dbProduk.value]
  }
  // Remove duplicates by name
  const seen = new Set()
  return list.filter((item: any) => {
    const name = (item.namaProduk || item.nama_produk || '').toLowerCase().trim()
    if (seen.has(name)) return false
    seen.add(name)
    return true
  })
})

const filteredProduk = computed(() => {
  let list = allProduk.value
  if (activeKategori.value !== 'Semua') {
    list = list.filter((p: any) => p.kategori === activeKategori.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((p: any) =>
      (p.nama_produk || p.namaProduk || '').toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q) ||
      (p.pemilik || '').toLowerCase().includes(q)
    )
  }
  return list
})

function getProductImg(p: any): string {
  const path = p.foto_path || p.fotoPath
  if (path && (path.startsWith('http') || path.startsWith('/images/'))) {
    return path
  }
  // Default image based on category
  if (p.kategori === 'Makanan') return '/images/products/keripik.jpg'
  if (p.kategori === 'Kerajinan') return '/images/products/anyaman.jpg'
  return '/images/products/gula-aren.jpg'
}

function handleImageError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/images/products/keripik.jpg'
}

function getWhatsappUrl(p: any): string {
  let phone = p.no_wa_pemilik || p.noWaPemilik || '6281234567890'
  phone = phone.replace(/\D/g, '')
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1)
  }
  const name = p.nama_produk || p.namaProduk
  const seller = p.pemilik || 'Bapak/Ibu'
  const message = `Halo ${seller}, saya melihat produk "${name}" di Website Resmi Desa Sukarama. Apakah produk ini masih tersedia dan bisa saya pesan?`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Scroll reveal directive with multiple animation types
const vScrollReveal = {
  mounted(el: HTMLElement, binding: any) {
    if (typeof window === 'undefined') return;
    const type = binding.value?.type || 'up'
    let delay = binding.value?.delay || 0
    const stagger = binding.value?.stagger

    const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

    if (stagger) {
      Array.from(el.children).forEach((c: any, i) => {
        c.style.opacity = '0'
        c.style.transform = 'translateY(120px)'
        c.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}`
        c.style.transitionDelay = `${delay + (i * 150)}ms`
      })
    } else {
      el.style.opacity = '0'
      el.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}, filter 1s ease`
      el.style.filter = 'blur(8px)'
      if (delay) el.style.transitionDelay = `${delay}ms`

      switch (type) {
        case 'left': el.style.transform = 'translateX(-120px)'; break
        case 'right': el.style.transform = 'translateX(120px)'; break
        case 'zoom': el.style.transform = 'scale(0.85) translateY(40px)'; break
        default: el.style.transform = 'translateY(120px)'
      }
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(() => {
          if (stagger) {
            Array.from(el.children).forEach((c: any) => {
              c.style.opacity = '1'
              c.style.transform = 'translate(0)'
            })
          } else {
            el.style.opacity = '1'
            el.style.transform = 'translate(0) scale(1)'
            el.style.filter = 'blur(0)'
          }
        })
        observer.unobserve(el)
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' })
    
    setTimeout(() => {
      observer.observe(el)
    }, 50)
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 overflow-hidden text-white">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div class="container-app relative z-10 text-center">
        <div class="inline-flex items-center gap-2 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span>Katalog UMKM</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3" v-scroll-reveal="{ type: 'zoom' }">
          Pusat Produk UMKM Desa Sukarama
        </h1>
        <p class="text-emerald-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed" v-scroll-reveal="{ delay: 150 }">
          Dukung kemajuan ekonomi lokal warga Sukarama. Belanja langsung dari perajin dan petani desa dengan transaksi tanpa perantara!
        </p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-10 md:py-14">
      <div class="container-app">
        <!-- Search & Filter Controls -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-10" v-scroll-reveal="{ type: 'up' }">
          <div class="flex flex-col md:flex-row gap-4 justify-between items-center">
            <!-- Search input -->
            <div class="relative w-full md:w-96">
              <Search class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                v-model="searchQuery"
                type="text"
                class="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                placeholder="Cari nama produk, perajin, dll..."
              />
            </div>

            <!-- Categories Tabs -->
            <div class="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
              <button
                v-for="kat in kategoriList"
                :key="kat"
                class="px-4 py-2 rounded-full text-xs font-bold transition-all"
                :class="activeKategori === kat
                  ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-600 bg-slate-100/80 hover:bg-slate-200/80'"
                @click="activeKategori = kat"
              >
                {{ kat }}
              </button>
            </div>
          </div>
        </div>

        <!-- Product Grid -->
        <div v-if="filteredProduk.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" v-scroll-reveal="{ stagger: true }">
          <div
            v-for="p in filteredProduk"
            :key="p.id"
            class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
          >
            <!-- Product Image -->
            <div class="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" @click="selectedProduct = p">
              <img
                :src="getProductImg(p)"
                :alt="p.nama_produk || p.namaProduk"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                @error="handleImageError"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span class="text-white text-xs font-bold flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
                  Lihat Detail Produk
                </span>
              </div>
              <span class="absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-900 shadow-sm">
                {{ p.kategori }}
              </span>
            </div>

            <!-- Content -->
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3
                  class="font-extrabold text-slate-900 text-base leading-snug mb-1.5 group-hover:text-emerald-800 transition-colors cursor-pointer"
                  @click="selectedProduct = p"
                >
                  {{ p.nama_produk || p.namaProduk }}
                </h3>
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {{ p.deskripsi }}
                </p>
                <div class="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
                  <User class="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span class="font-medium truncate">{{ p.pemilik }}</span>
                </div>
              </div>

              <!-- Price & CTA -->
              <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span class="text-[10px] text-slate-400 block leading-none font-medium">Harga</span>
                  <span class="text-base font-black text-emerald-800">
                    {{ formatRupiah(p.harga) }}
                    <span v-if="(p.nama_produk || p.namaProduk).toLowerCase().includes('kukumbul')" class="text-xs font-normal text-slate-500">/ Pack</span>
                    <span v-else class="text-xs font-normal text-slate-500">/ Kodi</span>
                  </span>
                </div>

                <a
                  :href="getWhatsappUrl(p)"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
                  title="Pesan Langsung via WhatsApp"
                >
                  <MessageCircle class="w-3.5 h-3.5" />
                  <span>Pesan</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto">
          <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">Produk Tidak Ditemukan</h3>
          <p class="text-xs text-slate-500 mb-4">Tidak ada produk yang cocok dengan kata kunci atau kategori yang Anda pilih.</p>
          <button
            class="px-5 py-2 rounded-full bg-emerald-900 text-white text-xs font-bold"
            @click="searchQuery = ''; activeKategori = 'Semua'"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </section>

    <!-- Product Detail Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="selectedProduct"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        @click.self="selectedProduct = null"
      >
        <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fade-in relative">
          <!-- Close button -->
          <button
            class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            @click="selectedProduct = null"
          >
            <X class="w-5 h-5" />
          </button>

          <!-- Modal Image -->
          <div class="h-64 bg-slate-100 overflow-hidden relative">
            <img
              :src="getProductImg(selectedProduct)"
              :alt="selectedProduct.nama_produk || selectedProduct.namaProduk"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <span class="absolute bottom-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-900 text-white shadow-md">
              {{ selectedProduct.kategori }}
            </span>
          </div>

          <!-- Modal Content -->
          <div class="p-6">
            <div class="flex justify-between items-start gap-3 mb-2">
              <h3 class="text-xl font-black text-slate-900 leading-tight">
                {{ selectedProduct.nama_produk || selectedProduct.namaProduk }}
              </h3>
              <span class="text-lg font-black text-emerald-800 whitespace-nowrap">
                {{ formatRupiah(selectedProduct.harga) }}
                <span v-if="(selectedProduct.nama_produk || selectedProduct.namaProduk).toLowerCase().includes('kukumbul')" class="text-sm font-normal text-slate-500">/ Pack</span>
                <span v-else class="text-sm font-normal text-slate-500">/ Kodi</span>
              </span>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed mb-6">
              {{ selectedProduct.deskripsi }}
            </p>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-6 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-500">Produsen / Pemilik</span>
                <span class="font-bold text-slate-800">{{ selectedProduct.pemilik }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Kontak WhatsApp</span>
                <span class="font-mono text-emerald-800 font-semibold">{{ selectedProduct.no_wa_pemilik || selectedProduct.noWaPemilik }}</span>
              </div>
            </div>

            <a
              :href="getWhatsappUrl(selectedProduct)"
              target="_blank"
              class="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all"
            >
              <MessageCircle class="w-4 h-4" />
              <span>Hubungi & Pesan Sekarang via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

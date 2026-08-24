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
const hoveredProduct = ref<number | null>(null)
const isMobile = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth < 768
    })
  }
})

const kategoriList = ['Semua', 'Makanan', 'Kerajinan', 'Hasil Tani', 'Lainnya']

// getCachedData: () => undefined memaksa refetch tiap kali halaman ini dibuka
// (lihat catatan yang sama di index.vue) supaya perubahan admin selalu terlihat.
const { data: dbProduk } = useAsyncData('umkm-all', () =>
  apiGet<any[]>('/api/umkm').catch(() => []),
  { server: false, getCachedData: () => undefined }
)

const allProduk = computed(() => dbProduk.value || [])

const filteredProduk = computed(() => {
  let list = allProduk.value
  if (activeKategori.value !== 'Semua') {
    list = list.filter((p: any) => p.kategori === activeKategori.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((p: any) =>
      (p.namaProduk || '').toLowerCase().includes(q) ||
      (p.deskripsi || '').toLowerCase().includes(q) ||
      (p.pemilik || '').toLowerCase().includes(q)
    )
  }
  return list
})

function getProductImg(p: any): string {
  const path = p.fotoPath
  if (path && (path.startsWith('http') || path.startsWith('/images/') || path.startsWith('data:'))) {
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
  let phone = p.noWaPemilik || '6281234567890'
  phone = phone.replace(/\D/g, '')
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1)
  }
  const name = p.namaProduk
  const seller = p.pemilik || 'Bapak/Ibu'
  const message = `Halo ${seller}, saya melihat produk "${name}" di Website Resmi Desa Sukarama. Apakah produk ini masih tersedia dan bisa saya pesan?`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Hanya 1 video YouTube boleh autoplay lewat scroll dalam satu waktu (kartu
// yang paling baru masuk viewport menang) — katalog ini bisa punya banyak
// produk, jadi tanpa batasan ini beberapa video bisa autoplay bersamaan saat
// scroll melewati beberapa kartu sekaligus, yang sangat berat di mobile.
const activeMobileVideoId = ref<number | null>(null)

// Directive for autoplay video on mobile scroll
const vObserveVisibility = {
  mounted(el: HTMLElement, binding: any) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        binding.value(true)
      } else {
        binding.value(false)
      }
    }, { threshold: 0.6 }) // Trigger when 60% of the element is visible
    
    // Small delay to ensure layout is done
    setTimeout(() => {
      observer.observe(el)
    }, 100)
    
    ;(el as any)._visibilityObserver = observer
  },
  unmounted(el: HTMLElement) {
    if ((el as any)._visibilityObserver) {
      (el as any)._visibilityObserver.disconnect()
    }
  }
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
      if (entries[0]?.isIntersecting) {
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
    <section class="relative py-24 md:py-28 overflow-hidden text-white">
      <!-- Background Image -->
      <img src="/images/kantordesa3.png" alt="Background UMKM" class="absolute inset-0 w-full h-full object-cover object-[50%_65%] md:object-[50%_55%] z-0 animate-slow-pan" />
      
      <!-- Clean Dark Overlay (Tanpa Hijau Tebal) -->
      <div class="absolute inset-0 z-[1] bg-gradient-to-tr from-slate-950 via-slate-900/80 to-slate-900/40"></div>
      <!-- Subtle Grid Pattern (Opsional, lebih elegan dari titik) -->
      <div class="absolute inset-0 z-[2] opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]"></div>

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
                class="px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 active:scale-90 hover:-translate-y-0.5"
                :class="activeKategori === kat
                  ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20 scale-105'
                  : 'text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 hover:shadow-sm'"
                @click="activeKategori = kat"
              >
                {{ kat }}
              </button>
            </div>
          </div>
        </div>

        <!-- Product Grid -->
        <TransitionGroup
          v-if="filteredProduk.length > 0"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 scale-90 translate-y-8"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
          move-class="transition-all duration-500 ease-out"
        >
          <div
            v-for="(p, idx) in filteredProduk"
            :key="p.id"
            class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            :style="{ transitionDelay: `${idx * 80}ms` }"
            @mouseenter="hoveredProduct = p.id"
            @mouseleave="hoveredProduct = null"
            v-observe-visibility="(val) => { if (val) activeMobileVideoId = p.id; else if (activeMobileVideoId === p.id) activeMobileVideoId = null }"
          >
            <!-- Product Image / Video Hover Preview -->
            <div class="relative h-[240px] md:h-[280px] overflow-hidden bg-slate-900 cursor-pointer flex-shrink-0" @click="selectedProduct = p">
              <!-- Default Thumbnail -->
              <img
                :src="getProductImg(p)"
                :alt="p.nama_produk || p.namaProduk"
                class="w-full h-full object-cover transition-all duration-700 absolute inset-0 z-0"
                :class="p.ytId && (hoveredProduct === p.id || (isMobile && activeMobileVideoId === p.id)) ? 'scale-110 blur-sm opacity-50' : 'opacity-100 group-hover:scale-105'"
                @error="handleImageError"
              />

              <!-- Netflix-style Hover Autoplay Video -->
              <iframe
                v-if="p.ytId && (hoveredProduct === p.id || (isMobile && activeMobileVideoId === p.id))"
                :src="`https://www.youtube.com/embed/${p.ytId}?autoplay=1&controls=0&modestbranding=1&showinfo=0&rel=0&loop=1&playlist=${p.ytId}`"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full h-full absolute inset-0 z-20 pointer-events-none scale-105"
              ></iframe>

              <!-- Overlay CTA -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent transition-opacity duration-300 flex items-end p-4 z-10" :class="p.ytId && (hoveredProduct === p.id || (isMobile && activeMobileVideoId === p.id)) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'">
                <span class="text-white text-xs font-bold flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
                  Lihat Detail & Nyalakan Suara
                </span>
              </div>
              
              <!-- Category Badge -->
              <span class="absolute top-4 right-4 text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-900 shadow-sm z-30 pointer-events-none transition-opacity duration-300" :class="p.ytId && (hoveredProduct === p.id || (isMobile && activeMobileVideoId === p.id)) ? 'opacity-0' : 'opacity-100'">
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
                  {{ p.namaProduk }}
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
                    <span v-if="p.namaProduk.toLowerCase().includes('kukumbul')" class="text-xs font-normal text-slate-500">/ Pack</span>
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
        </TransitionGroup>

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

          <!-- Modal Image / Video -->
          <div class="h-64 md:h-80 bg-slate-100 overflow-hidden relative">
            <iframe
              v-if="selectedProduct.ytId"
              :src="`https://www.youtube.com/embed/${selectedProduct.ytId}?autoplay=1`"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="w-full h-full absolute inset-0"
            ></iframe>
            <img
              v-else
              :src="getProductImg(selectedProduct)"
              :alt="selectedProduct.namaProduk"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <span class="absolute bottom-3 left-3 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-900 text-white shadow-md pointer-events-none z-10">
              {{ selectedProduct.kategori }}
            </span>
          </div>

          <!-- Modal Content -->
          <div class="p-6">
            <div class="flex justify-between items-start gap-3 mb-2">
              <h3 class="text-xl font-black text-slate-900 leading-tight">
                {{ selectedProduct.namaProduk }}
              </h3>
              <span class="text-lg font-black text-emerald-800 whitespace-nowrap">
                {{ formatRupiah(selectedProduct.harga) }}
                <span v-if="selectedProduct.namaProduk.toLowerCase().includes('kukumbul')" class="text-sm font-normal text-slate-500">/ Pack</span>
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
                <span class="font-mono text-emerald-800 font-semibold">{{ selectedProduct.noWaPemilik }}</span>
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

<style scoped>
@keyframes slowZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}
.animate-slow-zoom {
  animation: slowZoom 20s ease-in-out infinite alternate;
  will-change: transform;
}
</style>

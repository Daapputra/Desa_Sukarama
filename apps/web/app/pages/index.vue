<script setup lang="ts">
import {
  ArrowRight, FileText, ShoppingBag, Users, Home, Map, Ruler,
  ShieldCheck, User, Calendar, MessageCircle, ChevronRight,
  Building2, Search, HeartHandshake, Sparkles
} from 'lucide-vue-next'
import { formatTanggal, formatRupiah } from '~/utils/format'

useHead({
  title: 'Pemerintah Desa Sukarama — Kecamatan Bojongpicung, Cianjur',
  meta: [
    { name: 'description', content: 'Website Resmi Pemerintah Desa Sukarama. Portal administrasi surat online, direktori UMKM desa, pengumuman warga, dan informasi publik terpadu.' }
  ]
})

const { apiGet } = useApi()

const hoveredProduct = ref<number | null>(null)
const isMobile = ref(false)
const visibleProducts = reactive<Record<number, boolean>>({})

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
    }, { threshold: 0.6 })
    
    setTimeout(() => { observer.observe(el) }, 100)
    ;(el as any)._visibilityObserver = observer
  },
  unmounted(el: HTMLElement) {
    if ((el as any)._visibilityObserver) {
      (el as any)._visibilityObserver.disconnect()
    }
  }
}

const galeriKegiatan = [
  { image: '/images/kegiatan1.png', title: 'Perayaan Kemerdekaan', desc: 'Kemeriahan warga Desa Sukarama merayakan HUT RI ke-79.' },
  { image: '/images/kegiatan2.png', title: 'Lomba Tradisional', desc: 'Antusiasme warga dalam mengikuti berbagai perlombaan 17 Agustus.' },
  { image: '/images/kegiatan3.png', title: 'Karnaval Desa', desc: 'Pawai budaya dan karnaval meriah mengelilingi jalan utama desa.' },
  { image: '/images/kegiatan4.JPG', title: 'Gotong Royong Warga', desc: 'Kekompakan warga dalam mempersiapkan acara kemerdekaan.' },
  { image: '/images/kegiatan5.JPG', title: 'Malam Puncak Kemerdekaan', desc: 'Acara hiburan dan pembagian hadiah bagi para pemenang lomba.' },
  { image: '/images/kegiatan6.JPG', title: 'Kreativitas Anak Muda', desc: 'Partisipasi pemuda-pemudi desa dalam menyukseskan acara.' },
  { image: '/images/kegiatan7.JPG', title: 'Kebersamaan Warga', desc: 'Momen kehangatan dan silaturahmi seluruh elemen warga desa.' },
  { image: '/images/kegiatan8.JPG', title: 'Lomba Anak-anak', desc: 'Keseruan lomba balap karung dan makan kerupuk anak-anak.' },
  { image: '/images/kegiatan9.png', title: 'Hiburan Rakyat', desc: 'Pentas seni dan hiburan penutup perayaan kemerdekaan.' },
]

// Hero slideshow
const heroImages = [
  '/images/kantordesa.jpg',
  '/images/kantordesa2.jpg',
  '/images/kantordesa3.png',
]
const currentSlide = ref(0)
const prevSlide = ref(-1)
let slideInterval: ReturnType<typeof setInterval> | null = null

function goToSlide(idx: number) {
  prevSlide.value = currentSlide.value
  currentSlide.value = idx
  resetInterval()
}

function resetInterval() {
  if (slideInterval) clearInterval(slideInterval)
  slideInterval = setInterval(() => {
    prevSlide.value = currentSlide.value
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
  }, 6000)
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

// Number count-up animation directive
const vCountUp = {
  mounted(el: HTMLElement, binding: any) {
    const target = parseFloat(binding.value.value) || 0
    const suffix = binding.value.suffix || ''
    const duration = 2000 // ms
    
    // Helper to format numbers like 7500 -> 7.500
    const format = (num: number) => {
      if (num % 1 !== 0) return num.toFixed(1).replace('.', ',') + suffix
      return num.toLocaleString('id-ID') + suffix
    }
    
    el.innerText = format(0)
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        let startTime: number | null = null
        const step = (timestamp: number) => {
          if (!startTime) startTime = timestamp
          const progress = Math.min((timestamp - startTime) / duration, 1)
          
          // easeOutQuart
          const easeOut = 1 - Math.pow(1 - progress, 4)
          const current = target * easeOut
          
          el.innerText = format(current)
          if (progress < 1) window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
        observer.unobserve(el)
      }
    }, { threshold: 0.1 })
    observer.observe(el)
  }
}

onMounted(() => {
  resetInterval()
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth < 768
    })
  }
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})


// Fetch real data
const { data: pengumumanList } = useAsyncData('pengumuman', () =>
  apiGet<any[]>('/api/pengumuman?limit=3').catch(() => null)
)

const pengumumanLokal = [
  { id: 1, tanggal: '2026-08-20', judul: 'Jadwal Imunisasi Balita Bulan Agustus', konten: 'Diberitahukan kepada seluruh warga Desa Sukarama yang memiliki balita, kegiatan Posyandu dan imunisasi akan dilaksanakan pada hari Sabtu ini di Balai Desa.' },
  { id: 2, tanggal: '2026-08-15', judul: 'Kerja Bakti Rutin Jelang Musim Hujan', konten: 'Mengundang partisipasi Bapak/Ibu sekalian untuk ikut serta dalam gotong royong membersihkan saluran air dan fasilitas umum guna mencegah genangan air.' },
  { id: 3, tanggal: '2026-08-10', judul: 'Penyaluran Bantuan Langsung Tunai (BLT)', konten: 'Pencairan BLT Tahap III bagi Keluarga Penerima Manfaat (KPM) dapat diambil langsung di kantor desa dengan membawa e-KTP dan KK asli.' }
]

// null = fetch API gagal (pakai data contoh lokal); array kosong = memang belum ada pengumuman
const pengumumanTampil = computed(() => {
  if (pengumumanList.value === null) return pengumumanLokal
  return pengumumanList.value.slice(0, 3)
})

const { data: umkmList } = useAsyncData('umkm', () =>
  apiGet<any[]>('/api/umkm').catch(() => [])
)

const produkUnggulanLokal = [
  { id: 5, namaProduk: 'Kukumbul (Pelampung Pancing)', harga: 80000, kategori: 'Kerajinan', pemilik: 'Pengrajin Kukumbul', noWaPemilik: '6281573276932', fotoPath: '/images/kukumbul.jpeg', ytId: 'znTmT3Ovk7w' },
  { id: 6, namaProduk: 'Sapu Injuk Tradisional', harga: 150000, kategori: 'Kerajinan', pemilik: 'Perajin Injuk Desa', noWaPemilik: '6283817916016', fotoPath: '/images/sapu injuk.jpeg', ytId: '20vErQ0hn14' },
  { id: 7, namaProduk: 'Doran Pacul Kayu Jati', harga: 140000, kategori: 'Kerajinan', pemilik: 'Pengrajin Kayu Sukarama', noWaPemilik: '6285943097900', fotoPath: '/images/doranpacul.jpeg', ytId: 'qKSE2ijrqjA' },
  { id: 1, namaProduk: 'Keripik Singkong Pedas', harga: 15000, kategori: 'Makanan', pemilik: 'Bu Enah', noWaPemilik: '6281234567890', fotoPath: '/images/products/keripik.jpg' },
]

const produkUnggulan = computed(() => {
  let list = produkUnggulanLokal
  if (umkmList.value && umkmList.value.length > 0) {
    list = [...produkUnggulanLokal, ...umkmList.value]
  }
  
  const seen = new Set()
  return list.filter((item: any) => {
    const name = (item.namaProduk || item.nama_produk || '').toLowerCase().trim()
    if (seen.has(name)) return false
    seen.add(name)
    return true
  }).slice(0, 4)
})

const stats = [
  { icon: Users, label: 'Penduduk Terindeks', value: 7526, suffix: '+', desc: 'Jiwa di Database Desa' },
  { icon: Home, label: 'Kepala Keluarga', value: 3100, suffix: '+', desc: 'Terdaftar di KK' },
  { icon: Map, label: 'Wilayah Desa', value: 3, suffix: ' Dusun', desc: '6 RW & 33 RT' },
  { icon: Ruler, label: 'Luas Wilayah', value: 1186, suffix: ' Ha', desc: 'Lahan Produktif & Pemukiman' },
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

function getPengumumanImg(p: any): string | null {
  const foto = Array.isArray(p.fotos) && p.fotos.length > 0 ? p.fotos[0] : null
  return foto || null
}

function handlePengumumanImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
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
    <section class="relative min-h-[70vh] md:min-h-[90vh] flex items-center bg-slate-950 overflow-hidden">
      <!-- Background Slideshow with Ken Burns -->
      <div class="absolute inset-0 z-0">
        <div
          v-for="(img, idx) in heroImages"
          :key="img"
          class="absolute inset-0 hero-slide"
          :class="[
            idx === currentSlide ? 'hero-slide-active' : '',
            idx === prevSlide ? 'hero-slide-prev' : '',
            idx !== currentSlide && idx !== prevSlide ? 'hero-slide-hidden' : '',
            'hero-kb-' + idx
          ]"
        >
          <img
            :src="img"
            alt="Kantor Desa Sukarama"
            class="w-full h-full object-cover"
            :class="idx === 0 ? 'object-[15%_25%] md:object-center' : 'object-center'"
            decoding="async"
          />
        </div>
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 z-[5] bg-gradient-to-tr from-slate-950 via-slate-950/70 to-emerald-950/40"></div>
      <div class="absolute inset-0 z-[6] bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>

      <!-- Floating Particles -->
      <div class="absolute inset-0 z-[7] overflow-hidden pointer-events-none">
        <div class="absolute w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl animate-[floatUp_12s_ease-in-out_infinite]" style="top: 60%; left: 10%;"></div>
        <div class="absolute w-56 h-56 rounded-full bg-emerald-400/8 blur-3xl animate-[floatUp_15s_ease-in-out_infinite_2s]" style="top: 30%; right: 10%;"></div>
        <div class="absolute w-40 h-40 rounded-full bg-white/5 blur-2xl animate-[floatUp_10s_ease-in-out_infinite_4s]" style="top: 70%; left: 50%;"></div>
      </div>

      <!-- Slide Indicators (Modern Progress Bar Style) -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        <button
          v-for="(img, idx) in heroImages"
          :key="'dot-'+idx"
          class="group relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
          :class="idx === currentSlide ? 'w-14 bg-white/30' : 'w-7 bg-white/20 hover:bg-white/30'"
          @click="goToSlide(idx)"
        >
          <div
            class="absolute inset-y-0 left-0 bg-white rounded-full"
            :class="idx === currentSlide ? 'animate-[slideProgress_6s_linear_forwards]' : 'w-0'"
          ></div>
        </button>
      </div>

      <!-- Hero Content -->
      <div class="container-app relative z-20 py-20 md:py-32 text-center text-white mt-8 md:mt-0">
        <div class="max-w-4xl mx-auto">
          <div class="animate-hero-1 inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-sm font-semibold tracking-wide uppercase mb-4 md:mb-8 backdrop-blur-md shadow-lg shadow-black/20">
              <ShieldCheck class="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span>Portal Resmi Pemerintah Desa Sukarama</span>
            </div>

          <h1 class="animate-hero-2 text-2xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] tracking-tight mb-3 md:mb-6 drop-shadow-lg">
            Mewujudkan Pelayanan Publik Desa yang Cerdas, Cepat & Terintegrasi
          </h1>

          <p class="animate-hero-3 text-[13px] sm:text-lg text-emerald-100/90 leading-relaxed mb-6 md:mb-10 max-w-2xl mx-auto drop-shadow">
            Kecamatan Bojongpicung, Kabupaten Cianjur, Jawa Barat.<br class="hidden sm:inline">
            Nikmati kemudahan pembuatan surat administrasi online, katalog produk UMKM lokal, dan transparansi informasi desa.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-2.5 md:gap-4 px-4 sm:px-0 w-full">
            <div class="animate-hero-4 w-full sm:w-auto">
              <NuxtLink
                to="/layanan"
                class="group relative flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-extrabold text-xs sm:text-sm overflow-hidden shadow-xl shadow-emerald-950/30 hover:shadow-2xl hover:shadow-emerald-900/50 hover:-translate-y-1 hover:scale-105 active:scale-90 active:-translate-y-0 active:shadow-inner transition-all duration-300 ease-out border border-emerald-500/30 w-full"
              >
                <!-- Ripple/Shine effect layer -->
                <span class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></span>
                <FileText class="w-4 h-4 group-hover:rotate-12 group-active:-rotate-12 transition-transform duration-300" />
                <span class="relative">Ajukan Surat Online</span>
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </NuxtLink>
            </div>

            <div class="animate-hero-5 w-full sm:w-auto">
              <NuxtLink
                to="/layanan?tab=cek"
                class="group relative flex items-center justify-center gap-1.5 px-6 py-3 md:px-8 md:py-4 rounded-full overflow-hidden bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-90 active:-translate-y-0 active:bg-white/30 transition-all duration-300 ease-out w-full"
              >
                <span class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></span>
                <Search class="w-4 h-4 group-hover:scale-110 group-active:scale-90 transition-transform duration-300" />
                <span class="relative">Lacak Surat (Via NIK)</span>
              </NuxtLink>
            </div>

            <div class="animate-hero-6 w-full sm:w-auto">
              <NuxtLink
                to="/umkm"
                class="group relative flex items-center justify-center gap-1.5 px-6 py-3 md:px-7 md:py-4 rounded-full overflow-hidden bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/80 text-emerald-200 font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-90 active:-translate-y-0 transition-all duration-300 ease-out w-full"
              >
                <span class="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></span>
                <ShoppingBag class="w-4 h-4 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />
                <span class="relative">Belanja UMKM Desa</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Real Stats Counter Banner -->
    <section class="relative z-30 -mt-10 mb-10">
      <div class="container-app">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" v-scroll-reveal="{ stagger: true, delay: 100 }">
          <div
            v-for="st in stats"
            :key="st.label"
            class="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-950/5 flex items-center gap-4 group hover:border-emerald-300 transition-all"
          >
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <component :is="st.icon" class="w-6 h-6" />
            </div>
            <div>
              <div 
                class="text-xl sm:text-2xl font-black text-slate-900 leading-tight"
                v-count-up="{ value: st.value, suffix: st.suffix }"
              >
                0{{ st.suffix }}
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
    <section class="py-14 md:py-20 bg-white" v-scroll-reveal="{ type: 'up' }">
      <div class="container-app">
        <div class="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50/70 to-slate-50 rounded-3xl border border-emerald-100 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div class="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 border-4 border-white shadow-xl shadow-emerald-950/10 overflow-hidden bg-emerald-50">
            <img src="/images/foto-kades.png" alt="Foto Kepala Desa Wahyu Komara" class="w-full h-full object-cover object-top" />
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
        <div class="text-center max-w-2xl mx-auto mb-10" v-scroll-reveal>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" v-scroll-reveal="{ stagger: true }">
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
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10" v-scroll-reveal>
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

        <div v-if="pengumumanTampil && pengumumanTampil.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6" v-scroll-reveal="{ stagger: true }">
          <div
            v-for="p in pengumumanTampil"
            :key="p.id"
            class="bg-slate-50/70 rounded-3xl border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div v-if="getPengumumanImg(p)" class="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  :src="getPengumumanImg(p) ?? ''"
                  :alt="p.judul"
                  class="w-full h-full object-cover"
                  @error="handlePengumumanImageError"
                />
              </div>
              <div class="p-6">
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
            </div>
            <div class="px-6 pb-6 pt-4 mt-4 border-t border-slate-200/60 text-[11px] font-bold text-emerald-800">
              Pengumuman Resmi Kantor Desa
            </div>
          </div>
        </div>
        <p v-else class="text-center text-sm text-slate-400 py-8">Belum ada pengumuman terbaru saat ini.</p>
      </div>
    </section>

    <!-- Sorotan Kegiatan -->
    <section class="py-16 bg-white border-t border-slate-200/80">
      <div class="container-app">
        <div class="text-center max-w-2xl mx-auto mb-12" v-scroll-reveal>
          <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-block mb-3">
            Dokumentasi Desa
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sorotan Kegiatan Desa
          </h2>
          <p class="text-sm text-slate-500 mt-3 leading-relaxed">
            Potret semarak perayaan HUT RI ke-79, program pemberdayaan, serta antusiasme warga bergotong royong membangun kemajuan desa.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" v-scroll-reveal="{ stagger: true }">
          <div 
            v-for="(kegiatan, index) in galeriKegiatan" 
            :key="index"
            class="group rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 relative bg-slate-100"
          >
            <div class="aspect-[4/3] w-full overflow-hidden relative">
              <img 
                :src="kegiatan.image" 
                :alt="kegiatan.title" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
                @error="handleImageError"
              />
              <!-- Teks dan Gradient disembunyikan sementara sampai kontennya sudah fix -->
              <!-- 
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>
              <div class="absolute bottom-0 left-0 w-full p-5 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 class="text-white font-bold text-lg mb-1.5 leading-snug">{{ kegiatan.title }}</h3>
                <p class="text-emerald-50/80 text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {{ kegiatan.desc }}
                </p>
              </div> 
              -->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase Produk UMKM -->
    <section class="py-16 bg-slate-50/70 border-t border-slate-200/80">
      <div class="container-app">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10" v-scroll-reveal>
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-scroll-reveal="{ stagger: true }">
          <div
            v-for="p in produkUnggulan.slice(0, 3)"
            :key="p.id"
            class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            v-observe-visibility="(val) => visibleProducts[p.id] = val"
            @mouseenter="hoveredProduct = p.id"
            @mouseleave="hoveredProduct = null"
          >
            <!-- Product Image / Video Hover Preview -->
            <div class="relative h-[240px] md:h-[280px] overflow-hidden bg-slate-900 flex-shrink-0">
              <img
                :src="getProductImg(p)"
                :alt="p.nama_produk || p.namaProduk"
                class="w-full h-full object-cover transition-all duration-700 absolute inset-0 z-0"
                :class="p.ytId && (hoveredProduct === p.id || (isMobile && visibleProducts[p.id])) ? 'scale-110 blur-sm opacity-50' : 'opacity-100 group-hover:scale-105'"
                loading="lazy"
                decoding="async"
                @error="handleImageError"
              />
              
              <!-- Netflix-style Hover Autoplay Video -->
              <iframe
                v-if="p.ytId && (hoveredProduct === p.id || (isMobile && visibleProducts[p.id]))"
                :src="`https://www.youtube.com/embed/${p.ytId}?autoplay=1&controls=0&modestbranding=1&showinfo=0&rel=0&loop=1&playlist=${p.ytId}`"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full h-full absolute inset-0 z-20 pointer-events-none scale-105"
              ></iframe>

              <!-- Overlay CTA -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent transition-opacity duration-300 flex items-end p-4 z-10" :class="p.ytId && (hoveredProduct === p.id || (isMobile && visibleProducts[p.id])) ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'">
                <span class="text-white text-xs font-bold flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
                  Lihat Detail & Nyalakan Suara
                </span>
              </div>

              <!-- Category Badge -->
              <span class="absolute top-4 right-4 text-[10px] font-extrabold px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-emerald-900 shadow-sm z-30 pointer-events-none transition-opacity duration-300" :class="p.ytId && (hoveredProduct === p.id || (isMobile && visibleProducts[p.id])) ? 'opacity-0' : 'opacity-100'">
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
    <section class="py-16 bg-gradient-to-br from-emerald-900 to-slate-900 text-white" v-scroll-reveal="{ type: 'zoom' }">
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
  </div>
</template>

<style scoped>
/* Hero slide transitions */
.hero-slide {
  will-change: transform, opacity;
}

.hero-slide-hidden {
  opacity: 0;
  transform: scale(1.1) translateX(15%);
  z-index: 0;
}

.hero-slide-prev {
  opacity: 0;
  transform: scale(1.2) translateX(-15%);
  transition: opacity 1.8s cubic-bezier(0.25, 1, 0.5, 1), transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 1;
}

.hero-slide-active {
  opacity: 1;
  transform: scale(1) translateX(0);
  transition: opacity 1.8s cubic-bezier(0.25, 1, 0.5, 1), transform 1.8s cubic-bezier(0.25, 1, 0.5, 1);
  z-index: 2;
}

/* Ken Burns: each slide pans differently */
.hero-slide-active.hero-kb-0 img {
  animation: kb0 7s ease-in-out forwards;
}
.hero-slide-active.hero-kb-1 img {
  animation: kb1 7s ease-in-out forwards;
}
.hero-slide-active.hero-kb-2 img {
  animation: kb2 7s ease-in-out forwards;
}

@keyframes kb0 {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.18) translate(-2%, -1%); }
}
@keyframes kb1 {
  0% { transform: scale(1.05) translate(-2%, 0); }
  100% { transform: scale(1.15) translate(2%, -2%); }
}
@keyframes kb2 {
  0% { transform: scale(1) translate(1%, 1%); }
  100% { transform: scale(1.2) translate(-1%, -2%); }
}

@keyframes floatUp {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-40px) scale(1.15);
    opacity: 1;
  }
}

@keyframes slideProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

@keyframes heroEntry {
  0% { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.animate-hero-1 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
.animate-hero-2 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
.animate-hero-3 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; opacity: 0; }
.animate-hero-4 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards; opacity: 0; }
.animate-hero-5 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards; opacity: 0; }
.animate-hero-6 { animation: heroEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.0s forwards; opacity: 0; }
</style>


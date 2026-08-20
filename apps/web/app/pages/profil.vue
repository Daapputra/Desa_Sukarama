<script setup lang="ts">
import { Eye, Target, BookOpen, Users, MapPin, ChevronRight, Landmark, ShieldCheck, Image as ImageIcon } from 'lucide-vue-next'

useHead({
  title: 'Profil & Sejarah — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Kenali sejarah Kerajaan Tanjung Singuru di Bojongpicung, visi misi, struktur aparatur desa, dan profil demografi Desa Sukarama.' }
  ]
})

const activeTab = ref('sejarah')
const selectedImage = ref<string | null>(null)

const tabs = [
  { id: 'sejarah', label: 'Sejarah & Asal Usul', icon: BookOpen },
  { id: 'visimisi', label: 'Visi & Misi', icon: Target },
  { id: 'aparatur', label: 'Struktur Aparatur', icon: Users },
  { id: 'demografi', label: 'Demografi & Wilayah', icon: Landmark },
]

const aparatur = [
  { nama: 'Wahyu Komara', jabatan: 'Kepala Desa', inisial: 'WK', tugas: 'Memimpin penyelenggaraan pemerintahan, pembangunan, dan pembinaan kemasyarakatan desa.' },
  { nama: 'Wawan Saepudin', jabatan: 'Sekretaris Desa', inisial: 'WS', tugas: 'Mengkoordinasikan administrasi umum, perencanaan, dan pelaporan keuangan desa.' },
  { nama: 'Euis Nurhayati, SE', jabatan: 'Kaur Keuangan', inisial: 'EN', tugas: 'Pengelolaan kas desa, penatausahaan APBDes, dan pembukuan anggaran.' },
  { nama: 'Asep Saepudin', jabatan: 'Kaur Perencanaan & Umum', inisial: 'AS', tugas: 'Penyusunan rencana kerja pembangunan dan inventarisasi aset desa.' },
  { nama: 'Iis Aisyah, S.Pd', jabatan: 'Kasi Pemerintahan', inisial: 'IA', tugas: 'Manajemen administrasi kependudukan dan penataan wilayah RT/RW.' },
  { nama: 'Nana Suryana', jabatan: 'Kasi Kesejahteraan', inisial: 'NS', tugas: 'Penyaluran program bantuan sosial, pemberdayaan ekonomi, dan keagamaan.' },
  { nama: 'Ujang Hendra', jabatan: 'Kasi Pelayanan', inisial: 'UH', tugas: 'Pelayanan penerbitan surat pengantar, rekomendasi, dan perizinan warga.' },
  { nama: 'Yanti Rohayati', jabatan: 'Staf Pelayanan Terpadu', inisial: 'YR', tugas: 'Front office pelayanan administrasi kependudukan dan surat online.' },
]

const demografi = [
  { label: 'Total Penduduk Terindeks', value: '6.167 jiwa' },
  { label: 'Jumlah Kepala Keluarga (KK)', value: '1.950+ KK' },
  { label: 'Wilayah Dusun', value: '3 Dusun' },
  { label: 'Pembagian RW & RT', value: '6 RW / 33 RT' },
  { label: 'Luas Wilayah Total', value: '485,5 Hektar' },
  { label: 'Topografi & Ketinggian', value: 'Dataran Rendah & Pertanian (350 - 450 mdpl)' },
  { label: 'Komoditas Unggulan', value: 'Padi, Kukumbul, Sapu Injuk, Doran Pacul, & Anyaman' },
]

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
    <!-- Hero Banner -->
    <section class="relative py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 overflow-hidden text-white">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div class="container-app relative z-10 text-center">
        <div class="inline-flex items-center gap-2 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span>Profil Desa</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3" v-scroll-reveal="{ type: 'zoom' }">
          Profil & Sejarah Desa Sukarama
        </h1>
        <p class="text-emerald-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed" v-scroll-reveal="{ delay: 150 }">
          Mengenal lebih dekat warisan sejarah Tanjung Singuru, arah visi-misi pembangunan, dan aparatur pelayan masyarakat.
        </p>
      </div>
    </section>

    <!-- Content Tabs -->
    <section class="py-10 md:py-14">
      <div class="container-app">
        <!-- Tab Selector -->
        <div class="flex justify-center mb-10 overflow-x-auto pb-2">
          <div class="inline-flex p-1.5 rounded-full bg-slate-200/70 border border-slate-300/80 shadow-inner">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200"
              :class="activeTab === tab.id
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/25'
                : 'text-slate-600 hover:text-emerald-900'"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Sejarah -->
        <div v-if="activeTab === 'sejarah'" class="max-w-4xl mx-auto">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <BookOpen class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sejarah & Jejak Peradaban Desa Sukarama
                </h2>
                <span class="text-xs text-slate-400">Akar sejarah masa Kerajaan Pajajaran & Saluran Irigasi Kolonial 1897</span>
              </div>
            </div>

            <div class="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4 text-slate-600 text-justify">
              <p>
                Desa Sukarama di Kecamatan Bojongpicung, Kabupaten Cianjur, memiliki nilai historis yang mendalam dan berakar pada era Kerajaan Sunda Pajajaran. Berdasarkan naskah kuno <i>Babad Cianjur</i>, kawasan Kampung Cisuru di wilayah Sukarama diyakini sebagai tapak istana kuno <b>Kerajaan Tanjung Singuru</b>.
              </p>
              
              <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 my-6">
                <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-emerald-700" />
                  Situs Kerajaan Tanjung Singuru (Kampung Cisuru)
                </h4>
                <p class="text-xs text-emerald-800 leading-relaxed mb-0">
                  Kerajaan Tanjung Singuru memegang peranan penting dalam perlintasan niaga dan pertahanan di lembah Cianjur timur, yang dalam riwayat sejarah pernah menjadi pusat perhatian pasukan gabungan Kesultanan Cirebon, Demak, dan Banten pada masa ekspansi Islam di tanah Pasundan.
                </p>
              </div>

              <p>
                Selain sejarah kerajaan kuno, Desa Sukarama juga dikenal dengan mahakarya infrastruktur pertanian berupa <b>Jembatan Irigasi Cai Kolonial Belanda</b> yang dibangun pada tahun 1897 di kawasan dataran Tjihea (Tjihea Vlakte). Saluran irigasi monumental ini hingga kini terus mengairi ribuan hektar persawahan subur di Bojongpicung.
              </p>

              <!-- Galeri Sejarah -->
              <div class="mt-12 mb-4">
                <div class="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ImageIcon class="w-4 h-4" />
                  </div>
                  <h3 class="text-lg font-bold text-slate-800">
                    Galeri Dokumentasi Sejarah
                  </h3>
                </div>
                
                <!-- Foto Utama (sejarah8) -->
                <figure class="mb-6 relative group overflow-hidden rounded-2xl shadow-md border border-slate-200 cursor-pointer" @click="selectedImage = '/images/sejarah8.jpg'" v-scroll-reveal="{ type: 'zoom' }">
                  <img
                    src="/images/sejarah8.jpg"
                    alt="Dokumentasi Sejarah Utama"
                    class="w-full h-[250px] sm:h-[400px] object-cover transition-transform duration-700 animate-history-pan group-hover:scale-[1.15]"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <figcaption class="absolute bottom-4 left-6 right-6 text-white text-sm sm:text-base font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    Arsip Sejarah Desa Sukarama
                  </figcaption>
                </figure>

                <!-- Grid Foto Lainnya dengan efek STAGGER -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4" v-scroll-reveal="{ stagger: true }">
                  <figure v-for="num in [2, 3, 4, 5, 6, 7, 9, 10]" :key="num" class="relative group overflow-hidden rounded-xl shadow-sm border border-slate-200 aspect-[4/3] sm:aspect-square cursor-pointer" @click="selectedImage = `/images/sejarah${num}.jpg`">
                    <img
                      :src="`/images/sejarah${num}.jpg`"
                      :alt="`Dokumentasi Sejarah ${num}`"
                      class="w-full h-full object-cover transition-transform duration-500 animate-history-pan group-hover:scale-125"
                      :style="{ animationDelay: `-${num * 1.5}s` }"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/30 transition-colors duration-300 flex items-center justify-center">
                      <ImageIcon class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-50 group-hover:scale-100" />
                    </div>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Visi & Misi -->
        <div v-if="activeTab === 'visimisi'" class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" v-scroll-reveal="{ stagger: true }">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Eye class="w-5 h-5" />
              </div>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">Arah Pembangunan</span>
              <h3 class="text-xl font-black text-slate-900 mb-4">Visi Desa Sukarama</h3>
              <div class="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                <p class="text-xs sm:text-sm text-emerald-950 font-bold text-center leading-relaxed italic">
                  "Mewujudkan Pembangunan Kawasan Perdesaan Berbasis Pertanian, Budaya, dan Potensi Lokal Untuk Mempercepat Pertumbuhan Serta Pemerataan Ekonomi Rakyat yang Berakhlak Mulia."
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <Target class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">Langkah Nyata</span>
            <h3 class="text-xl font-black text-slate-900 mb-4">Misi Desa Sukarama</h3>
            <ol class="space-y-3.5 text-xs text-slate-600 list-decimal pl-4 marker:text-emerald-700 marker:font-bold leading-relaxed">
              <li>Meningkatkan kualitas pelayanan publik berbasis teknologi digital yang cepat, transparan, dan akuntabel.</li>
              <li>Mendorong produktivitas sektor pertanian dan memfasilitasi pemasaran produk UMKM lokal warga.</li>
              <li>Meningkatkan partisipasi aktif masyarakat dan pemuda dalam setiap musyawarah pembangunan desa.</li>
              <li>Memelihara dan menjaga kelestarian infrastruktur pertanian, irigasi, serta situs warisan budaya desa.</li>
            </ol>
          </div>
        </div>

        <!-- Tab 3: Aparatur -->
        <div v-if="activeTab === 'aparatur'" class="max-w-5xl mx-auto">
          <div class="text-center max-w-xl mx-auto mb-10">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Struktur Pemerintah Desa Sukarama</h2>
            <p class="text-xs text-slate-500 mt-1">Perangkat dan staf pelayanan yang berdedikasi melayani masyarakat.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" v-scroll-reveal="{ stagger: true }">
            <div
              v-for="orang in aparatur"
              :key="orang.nama"
              class="bg-white rounded-3xl border border-slate-200/80 p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-900 font-black text-lg flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                {{ orang.inisial }}
              </div>
              <h4 class="font-extrabold text-slate-900 text-sm mb-0.5">{{ orang.nama }}</h4>
              <span class="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-3 border border-emerald-200/60">
                {{ orang.jabatan }}
              </span>
              <p class="text-[11px] text-slate-500 leading-relaxed">
                {{ orang.tugas }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab 4: Demografi -->
        <div v-if="activeTab === 'demografi'" class="max-w-4xl mx-auto space-y-8" v-scroll-reveal="{ type: 'up' }">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Landmark class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">Statistik Data Wilayah & Penduduk</h3>
                <span class="text-xs text-slate-400">Data terintegrasi sistem kependudukan resmi</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="row in demografi"
                :key="row.label"
                class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex justify-between items-center text-xs"
              >
                <span class="font-medium text-slate-500">{{ row.label }}</span>
                <span class="font-black text-slate-900 text-right">{{ row.value }}</span>
              </div>
            </div>
          </div>

          <!-- Peta Interaktif -->
          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <MapPin class="w-5 h-5 text-emerald-700" />
              <h3 class="text-lg font-bold text-slate-900">Peta Wilayah Desa Sukarama</h3>
            </div>
            <div class="rounded-2xl overflow-hidden border border-slate-200 h-[380px]">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=107.20%2C-6.87%2C107.28%2C-6.82&layer=mapnik"
                width="100%"
                height="100%"
                style="border:none;"
                loading="lazy"
                title="Peta wilayah Desa Sukarama"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Lightbox Modal -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="selectedImage" 
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 p-4 sm:p-8 backdrop-blur-md"
      @click="selectedImage = null"
    >
      <button class="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all" @click="selectedImage = null" aria-label="Tutup">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <img :src="selectedImage" class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10" @click.stop />
    </div>
  </Transition>
</template>

<style scoped>
@keyframes pan-image {
  0% { transform: scale(1.05) translate(0, 0); }
  33% { transform: scale(1.12) translate(-2%, 1%); }
  66% { transform: scale(1.08) translate(1%, -1.5%); }
  100% { transform: scale(1.05) translate(0, 0); }
}

.animate-history-pan {
  animation: pan-image 18s ease-in-out infinite;
}
</style>

<script setup lang="ts">
import { Sprout, Tractor, BookOpen, Users, MapPin, ChevronRight, Landmark, ShieldCheck, Image as ImageIcon } from 'lucide-vue-next'

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
  { id: 'visimisi', label: 'Visi & Misi', icon: Sprout },
  { id: 'aparatur', label: 'Struktur Aparatur', icon: Users },
  { id: 'demografi', label: 'Demografi & Wilayah', icon: Landmark },
]

const aparatur = [
  { nama: 'Wahyu Komara', jabatan: 'Kepala Desa', inisial: 'WK', foto: '/images/foto-kades.png', tugas: 'Memimpin penyelenggaraan pemerintahan, pembangunan, dan pembinaan kemasyarakatan desa.' },
  { nama: 'Wawan Saepudin', jabatan: 'Sekretaris Desa', inisial: 'WS', foto: '/images/foto-sekdes.jpeg', tugas: 'Mengkoordinasikan administrasi umum, perencanaan, dan pelaporan keuangan desa.' },
  { nama: 'Abad Kartamiharja', jabatan: 'Kasi Pemerintahan', inisial: 'AK', tugas: 'Manajemen administrasi kependudukan dan penataan wilayah RT/RW.' },
  { nama: 'Badru Hikam', jabatan: 'Kasi Kesjahtraan', inisial: 'BH', tugas: 'Penyaluran program bantuan sosial, pemberdayaan ekonomi, dan keagamaan.' },
  { nama: 'Lisnawati', jabatan: 'Kasi Pelayanan', inisial: 'L', tugas: 'Pelayanan penerbitan surat pengantar, rekomendasi, dan perizinan warga.' },
  { nama: 'Nurjamil', jabatan: 'Kaur Keuangan', inisial: 'N', tugas: 'Pengelolaan kas desa, penatausahaan APBDes, dan pembukuan anggaran.' },
  { nama: 'Dede Suhara', jabatan: 'Kaur TU dan Umum', inisial: 'DS', tugas: 'Pelayanan ketatausahaan, kearsipan, dan umum.' },
  { nama: 'Cecep Ali Rahmat', jabatan: 'Kaur Perencanaan', inisial: 'CA', tugas: 'Penyusunan rencana kerja pembangunan dan inventarisasi aset desa.' },
  { nama: 'Deden Jaenudin', jabatan: 'Kawil I', inisial: 'DJ', tugas: 'Pembinaan ketentraman, ketertiban, dan kerukunan warga di wilayah I.' },
  { nama: 'Mu\'man', jabatan: 'Kawil II', inisial: 'M', tugas: 'Pembinaan ketentraman, ketertiban, dan kerukunan warga di wilayah II.' },
  { nama: 'Asep Kamaludin', jabatan: 'Kawil III', inisial: 'AK', tugas: 'Pembinaan ketentraman, ketertiban, dan kerukunan warga di wilayah III.' },
]

const demografi = [
  { label: 'Total Penduduk Terindeks', value: '7.526+ jiwa' },
  { label: 'Jumlah Kepala Keluarga (KK)', value: '3.100+ KK' },
  { label: 'Wilayah Dusun', value: '3 Dusun' },
  { label: 'Pembagian RW & RT', value: '6 RW / 33 RT' },
  { label: 'Luas Wilayah Total', value: '1.186 Hektar' },
  { label: 'Topografi & Ketinggian', value: 'Dataran Rendah & Pertanian (350 - 450 mdpl)' },
  { label: 'Komoditas Unggulan', value: 'Padi, Kukumbul, Sapu Injuk, Doran Pacul, & Anyaman' },
]

const galeriSejarah = [
  { file: 'sejarah2.jpg', caption: 'Kawasan dataran Cihea tahun 1920-1930-an Dok Nationaal Museum van Wereldculturen Belanda' },
  { file: 'sejarah3.jpg', caption: 'Tentara Belanda di Bojong Picung tahun 1947 Sumber Gedenkboek 1-5 RI. Dok Indiegangers.nl' },
  { file: 'sejarah4.jpg', caption: 'Kawasan produksi padi di Cianjur tahun 1920-1940 Dok Nationaal Museum van Wereldculturen Belanda' },
  { file: 'sejarah5.jpg', caption: 'Sungai Cisokan salah satu pengairan Tjihea Vlakte tahun 1917 Dok Nationaal Museum van Wereldculturen-TropenMuseum Belanda' },
  { file: 'sejarah6.jpg', caption: 'Kawasan dataran Cihea tahun 1920-1930-an Dok Nationaal Museum van Wereldculturen Belanda' },
  { file: 'sejarah7.jpg', caption: 'Bangunan Tjihea-Hoeve, Bojong Picung diduga tahun 1920-1930an Dok Kodar Solihat, Balai Benih Padi dan Palawija, Bojong Picung-Cihea, Dinas Tanaman Pangan dan Hortikultura Provinsi Jawa Barat' },
  { file: 'sejarah8.jpg', caption: 'Irigasi di Tjihea Vlakte tahun 1917 Dok Nationaal Museum van Wereldculturen-TropenMuseum Belanda' },
  { file: 'sejarah9.jpg', caption: 'Petani membawa beras di lintas Cianjur-Bandung, 28 Juli 1947 Dok Spaarnestadphoto Belanda' },
  { file: 'sejarah10.jpg', caption: 'Tentara Belanda di Bojong Picung tahun 1947 Sumber Gedenkboek 1-5 RI. Dok Indiegangers.nl' }
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
    <!-- Hero Banner -->
    <section class="relative py-24 md:py-28 overflow-hidden text-white">
      <!-- Background Image -->
      <img src="/images/kantordesa3.png" alt="Background Profil" class="absolute inset-0 w-full h-full object-cover object-[50%_65%] md:object-[50%_55%] z-0 animate-slow-pan" />
      
      <!-- Clean Dark Overlay (Tanpa Hijau Tebal) -->
      <div class="absolute inset-0 z-[1] bg-gradient-to-tr from-slate-950 via-slate-900/80 to-slate-900/40"></div>
      <!-- Subtle Grid Pattern (Opsional, lebih elegan dari titik) -->
      <div class="absolute inset-0 z-[2] opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]"></div>

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
        <div class="flex mb-10 overflow-x-auto pb-2">
          <div class="inline-flex mx-auto p-1.5 rounded-full bg-slate-200/70 border border-slate-300/80 shadow-inner">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-90 hover:-translate-y-0.5"
              :class="activeTab === tab.id
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/25 scale-105'
                : 'text-slate-600 hover:text-emerald-900 hover:shadow-sm'"
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
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100" v-scroll-reveal>
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

            <div class="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-600 text-justify">
              
              <!-- Bagian 1: Asal Usul -->
              <div v-scroll-reveal="{ delay: 100 }">
                <h3 class="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
                  Asal Usul & Kerajaan Tanjung Singuru
                </h3>
                <p>
                  Desa Sukarama terletak di Kecamatan Bojongpicung, Kabupaten Cianjur — sebuah wilayah yang menyimpan jejak peradaban sejak era <b>Kerajaan Sunda Pajajaran</b>. Menurut naskah kuno <i>Babad Cianjur</i>, Kampung Cisuru di wilayah Sukarama merupakan lokasi tapak istana sakral peninggalan <b>Kerajaan Tanjung Singuru</b>.
                </p>
                <p class="mt-3">
                  Kerajaan ini pernah menjadi pusat kekuasaan yang berjaya di lembah Cianjur timur, berfungsi sebagai episentrum perdagangan dan benteng pertahanan yang strategis.
                </p>
              </div>

              <!-- Highlight Box -->
              <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-inner" v-scroll-reveal="{ delay: 200, type: 'left' }">
                <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-emerald-700" />
                  Tahukah Anda?
                </h4>
                <p class="text-xs text-emerald-800 leading-relaxed mb-0">
                  Wilayah Cisuru bahkan pernah menjadi titik pertemuan pasukan gabungan dari <b>Kesultanan Cirebon, Demak, dan Banten</b> pada era ekspansi Islam yang menembus jantung tanah Pasundan. Hal ini menunjukkan betapa pentingnya posisi strategis Desa Sukarama dalam konstelasi sejarah Nusantara.
                </p>
              </div>

              <!-- Bagian 2: Era Kolonial -->
              <div v-scroll-reveal="{ delay: 300 }">
                <h3 class="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
                  Warisan Infrastruktur Kolonial
                </h3>
                <p>
                  Memasuki akhir abad ke-19, desa ini menjadi saksi pembangunan mahakarya infrastruktur pengairan. <b>Jembatan Irigasi Kolonial Belanda</b> yang dibangun pada tahun <b>1897</b> di dataran Tjihea <i>(Tjihea Vlakte)</i> masih berdiri kokoh hingga hari ini.
                </p>
                <p class="mt-3">
                  Saluran irigasi monumental ini bukan sekadar monumen — melainkan sistem pengairan yang masih aktif menghidupi <b>ribuan hektar</b> persawahan subur di Bojongpicung, menjaga denyut nadi pertanian warga hingga saat ini.
                </p>
              </div>

              <!-- Bagian 3: Identitas Desa -->
              <div v-scroll-reveal="{ delay: 400 }">
                <h3 class="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-emerald-600 rounded-full inline-block"></span>
                  Desa Sukarama Hari Ini
                </h3>
                <p>
                  Berbekal warisan sejarah yang kaya, Desa Sukarama kini terus bertransformasi menjadi desa yang mandiri dan berdaya. Nilai-nilai luhur gotong royong, kearifan lokal, dan semangat pertanian yang diwariskan nenek moyang tetap menjadi pondasi utama pembangunan desa.
                </p>
              </div>
            </div>

              <!-- Galeri Sejarah -->
              <div class="mt-12 mb-4">
                <div class="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100" v-scroll-reveal>
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ImageIcon class="w-4 h-4" />
                  </div>
                  <h3 class="text-lg font-bold text-slate-800">
                    Galeri Dokumentasi Sejarah
                  </h3>
                </div>

                <!-- Grid Foto 3 Kolom Sama Besar -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-scroll-reveal="{ stagger: true }">
                  <figure v-for="(item, index) in galeriSejarah" :key="index" class="relative group overflow-hidden rounded-xl shadow-md border border-slate-200 aspect-[4/3] cursor-pointer" @click="selectedImage = `/images/${item.file}`">
                    <img
                      :src="`/images/${item.file}`"
                      :alt="item.caption"
                      class="w-full h-full object-cover transition-transform duration-700 animate-history-pan group-hover:scale-110"
                      :style="{ animationDelay: `-${index * 1.5}s` }"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                      <p class="text-white text-xs sm:text-[11px] md:text-xs font-medium leading-snug drop-shadow-md">
                        {{ item.caption }}
                      </p>
                    </div>
                  </figure>
                </div>
              </div>
          </div>
        </div>

        <!-- Tab 2: Visi & Misi -->
        <div v-if="activeTab === 'visimisi'" class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" v-scroll-reveal="{ stagger: true }">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Sprout class="w-5 h-5" />
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
              <Tractor class="w-5 h-5" />
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
          <div class="text-center max-w-xl mx-auto mb-10" v-scroll-reveal>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Struktur Pemerintah Desa Sukarama</h2>
            <p class="text-xs text-slate-500 mt-1">Perangkat dan staf pelayanan yang berdedikasi melayani masyarakat.</p>
          </div>

          <!-- Kepala Desa -->
          <div class="mb-6" v-scroll-reveal="{ type: 'zoom' }">
            <div class="max-w-sm mx-auto bg-white rounded-3xl border-2 border-emerald-300/70 p-8 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div class="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-emerald-200 shadow-md group-hover:border-emerald-500 transition-colors duration-500 ring-4 ring-emerald-50">
                <img :src="aparatur[0].foto" :alt="aparatur[0].nama" class="w-full h-full object-cover object-top" />
              </div>
              <span class="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 mb-2">Kepala Desa</span>
              <h3 class="text-xl font-black text-slate-900 mb-1">{{ aparatur[0].nama }}</h3>
              <p class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{{ aparatur[0].tugas }}</p>
            </div>
            <div class="flex justify-center my-3">
              <div class="w-px h-8 bg-gradient-to-b from-emerald-300 to-slate-200"></div>
            </div>
          </div>

          <!-- Sekretaris Desa -->
          <div class="mb-6" v-scroll-reveal="{ delay: 100 }">
            <div class="max-w-xs mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 text-center shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div v-if="aparatur[1].foto" class="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-3 border-emerald-200 shadow-sm group-hover:border-emerald-500 transition-colors ring-2 ring-emerald-50">
                <img :src="aparatur[1].foto" :alt="aparatur[1].nama" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-emerald-50 text-emerald-900 font-black text-lg flex items-center justify-center mx-auto mb-3 border-2 border-emerald-200 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                {{ aparatur[1].inisial }}
              </div>
              <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1 border border-emerald-200/60">{{ aparatur[1].jabatan }}</span>
              <h4 class="font-extrabold text-slate-900 text-base mb-1">{{ aparatur[1].nama }}</h4>
              <p class="text-[11px] text-slate-500 leading-relaxed">{{ aparatur[1].tugas }}</p>
            </div>
            <div class="flex justify-center my-3">
              <div class="w-px h-8 bg-gradient-to-b from-slate-200 to-slate-300"></div>
            </div>
          </div>

          <!-- Kasi & Kaur -->
          <div class="mb-6">
            <div class="text-center mb-5" v-scroll-reveal="{ delay: 150 }">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">Kepala Seksi & Kepala Urusan</span>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto" v-scroll-reveal="{ stagger: true }">
              <div
                v-for="orang in aparatur.slice(2, 8)"
                :key="orang.nama"
                class="bg-white rounded-2xl border border-slate-200/80 p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-900 font-black text-sm flex items-center justify-center mx-auto mb-3 border-2 border-emerald-100 group-hover:bg-emerald-800 group-hover:text-white group-hover:border-emerald-700 transition-colors">
                  {{ orang.inisial }}
                </div>
                <h4 class="font-extrabold text-slate-900 text-sm mb-0.5">{{ orang.nama }}</h4>
                <span class="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-2 border border-emerald-200/60">
                  {{ orang.jabatan }}
                </span>
                <p class="text-[10px] text-slate-500 leading-relaxed">{{ orang.tugas }}</p>
              </div>
            </div>
          </div>

          <!-- Kepala Wilayah -->
          <div>
            <div class="flex justify-center mb-3">
              <div class="w-px h-8 bg-gradient-to-b from-slate-200 to-slate-300"></div>
            </div>
            <div class="text-center mb-5" v-scroll-reveal="{ delay: 200 }">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">Kepala Wilayah / Dusun</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto" v-scroll-reveal="{ stagger: true }">
              <div
                v-for="orang in aparatur.slice(8)"
                :key="orang.nama"
                class="bg-white rounded-2xl border border-slate-200/80 p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div class="w-12 h-12 rounded-full bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center mx-auto mb-3 border-2 border-slate-200 group-hover:bg-emerald-800 group-hover:text-white group-hover:border-emerald-700 transition-colors">
                  {{ orang.inisial }}
                </div>
                <h4 class="font-extrabold text-slate-900 text-sm mb-0.5">{{ orang.nama }}</h4>
                <span class="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-2 border border-emerald-200/60">
                  {{ orang.jabatan }}
                </span>
                <p class="text-[10px] text-slate-500 leading-relaxed">{{ orang.tugas }}</p>
              </div>
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
@keyframes slowZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}
.animate-slow-zoom {
  animation: slowZoom 20s ease-in-out infinite alternate;
  will-change: transform;
}

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

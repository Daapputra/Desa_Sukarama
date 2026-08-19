<script setup lang="ts">
import { Eye, Target, BookOpen, Users, MapPin, ChevronRight, Landmark, ShieldCheck, HeartHandshake } from 'lucide-vue-next'

useHead({
  title: 'Profil & Sejarah — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Kenali sejarah Kerajaan Tanjung Singuru di Bojongpicung, visi misi, struktur aparatur desa, dan profil demografi Desa Sukarama.' }
  ]
})

const activeTab = ref('sejarah')

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
  { label: 'Wilayah Dusun', value: '3 Dusun (Sukamanah, Sukamaju, Sukasenang)' },
  { label: 'Pembagian RW & RT', value: '6 RW / 33 RT' },
  { label: 'Luas Wilayah Total', value: '485,5 Hektar' },
  { label: 'Topografi & Ketinggian', value: 'Dataran Rendah & Pertanian (350 - 450 mdpl)' },
  { label: 'Komoditas Unggulan', value: 'Padi, Singkong, Gula Aren, Perikanan, & Anyaman' },
]
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
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Profil & Sejarah Desa Sukarama
        </h1>
        <p class="text-emerald-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
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

              <figure class="my-8">
                <img
                  src="/images/sejarah-jembatan.jpg"
                  alt="Irigasi Kolonial Tjihea Vlakte 1917"
                  class="w-full rounded-2xl shadow-md border border-slate-200"
                />
                <figcaption class="text-center text-xs text-slate-500 mt-2.5 italic">
                  Dokumentasi Saluran Irigasi Kolonial Belanda di kawasan Bojongpicung (Arsip Bersejarah)
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <!-- Tab 2: Visi & Misi -->
        <div v-if="activeTab === 'visimisi'" class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <div v-if="activeTab === 'demografi'" class="max-w-4xl mx-auto space-y-8">
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
</template>

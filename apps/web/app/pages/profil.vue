<script setup lang="ts">
import { Eye, Target, BookOpen, Users, MapPin, ImageIcon, ChevronRight } from 'lucide-vue-next'

useHead({ title: 'Profil Desa — Desa Sukarama' })

const activeTab = ref('sejarah')

const tabs = [
  { id: 'sejarah', label: 'Sejarah', icon: BookOpen },
  { id: 'visimisi', label: 'Visi & Misi', icon: Target },
  { id: 'aparatur', label: 'Aparatur Desa', icon: Users },
  { id: 'demografi', label: 'Demografi', icon: Users },
]

const aparatur = [
  { nama: 'Wahyu Komara', jabatan: 'Kepala Desa', inisial: 'WK' },
  { nama: 'Dedi Mulyadi, S.IP', jabatan: 'Sekretaris Desa', inisial: 'DM' },
  { nama: 'Euis Nurhayati, SE', jabatan: 'Kaur Keuangan', inisial: 'EN' },
  { nama: 'Asep Saepudin', jabatan: 'Kaur Umum', inisial: 'AS' },
  { nama: 'Iis Aisyah, S.Pd', jabatan: 'Kasi Pemerintahan', inisial: 'IA' },
  { nama: 'Nana Suryana', jabatan: 'Kasi Kesejahteraan', inisial: 'NS' },
  { nama: 'Ujang Hendra', jabatan: 'Kasi Pelayanan', inisial: 'UH' },
  { nama: 'Yanti Rohayati', jabatan: 'Staf Administrasi', inisial: 'YR' },
]

const demografi = [
  { label: 'Jumlah Penduduk', value: '4.523 jiwa' },
  { label: 'Jumlah KK', value: '1.284 KK' },
  { label: 'Laki-laki', value: '2.301 jiwa' },
  { label: 'Perempuan', value: '2.222 jiwa' },
  { label: 'Luas Wilayah', value: '385,5 Ha' },
  { label: 'Jumlah RT/RW', value: '12 RT / 4 RW' },
  { label: 'Dusun', value: '3 Dusun' },
  { label: 'Ketinggian', value: '450 mdpl' },
]
</script>

<template>
  <div>
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-20 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
      </div>
      <div class="container-app relative z-10 text-center">
        <div class="flex items-center justify-center gap-2 text-green-300 text-xs font-medium mb-4">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span class="text-white">Profil Desa</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-3">Profil Desa Sukarama</h1>
        <p class="text-green-200/70 text-sm max-w-lg mx-auto">Mengenal lebih dekat sejarah, visi misi, dan aparatur Desa Sukarama</p>
      </div>
    </section>

    <!-- Tabs -->
    <section class="py-12 md:py-16">
      <div class="container-app">
        <div class="flex justify-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-border">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
            :class="activeTab === tab.id
              ? 'bg-green-900 text-white shadow-lg shadow-green-900/25'
              : 'text-slate-500 hover:text-green-800 hover:bg-green-50'"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Sejarah -->
        <div v-if="activeTab === 'sejarah'" class="max-w-3xl">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <BookOpen class="w-6 h-6 text-green-800" />
            Sejarah Desa Sukarama
          </h2>
          <div class="prose prose-slate max-w-none text-sm leading-7 space-y-4 text-slate-600">
            <p>Desa Sukarama di Kecamatan Bojongpicung, Cianjur, memiliki akar sejarah yang erat dengan masa Kerajaan Pajajaran. Wilayah ini dikenal sebagai tempat bersejarah karena pernah menjadi pusat atau lokasi Kerajaan Tanjung Singuru, yang jejaknya kini berada di Kampung Cisuru.</p>
            
            <h3 class="text-base font-bold text-slate-800 mt-6 mb-2">Catatan dan peninggalan bersejarah di Desa Sukarama meliputi:</h3>
            
            <ul class="list-disc pl-5 space-y-3">
              <li>
                <strong class="text-slate-800">Kerajaan Tanjung Singuru:</strong> Menurut naskah Babad Cianjur, wilayah Kampung Cisuru (kini masuk kawasan Sukarama) merupakan tapak kerajaan kuno Tanjung Singuru. Kerajaan ini pernah menjadi sasaran gempuran pasukan gabungan Cirebon, Demak, dan Banten.
              </li>
              <li>
                <strong class="text-slate-800">Jembatan Cai dan Irigasi Peninggalan Belanda:</strong> Daerah ini terkenal dengan bangunan irigasi kolonial yang mulai beroperasi pada tahun 1897. Infrastruktur ini sangat vital untuk pertanian dan kini menjadi daya tarik wisata sejarah di Bojongpicung.
              </li>
            </ul>

            <figure class="my-8">
              <img src="/images/sejarah-jembatan.jpg" alt="Irigasi di Tjihea Vlakte tahun 1917" class="w-full rounded-2xl shadow-md border border-border" />
              <figcaption class="text-center text-xs text-slate-500 mt-3 italic">
                Ilustrasi Irigasi Kolonial Peninggalan Belanda
              </figcaption>
            </figure>
          </div>
        </div>

        <!-- Visi Misi -->
        <div v-if="activeTab === 'visimisi'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl border border-border p-8 flex flex-col">
            <h3 class="text-lg font-bold text-green-800 flex items-center gap-2 mb-4">
              <Eye class="w-5 h-5" /> Visi
            </h3>
            <div class="bg-green-50/50 rounded-xl p-5 border border-green-100 flex-1 flex items-center justify-center">
              <p class="text-sm md:text-base text-green-900 leading-relaxed font-semibold text-center uppercase tracking-wide">
                "Mewujudkan Pembangunan Kawasan Perdesaan Berbasis Pertanian, Wisata, Budaya dan Potensi Lokal Untuk Mempercepat Pertumbuhan Serta Pemerataan Ekonomi Rakyat"
              </p>
            </div>
          </div>
          <div class="bg-white rounded-2xl border border-border p-8">
            <h3 class="text-lg font-bold text-green-800 flex items-center gap-2 mb-4">
              <Target class="w-5 h-5" /> Misi
            </h3>
            <ol class="space-y-4 text-sm text-slate-600 leading-relaxed list-decimal pl-5 marker:text-green-700 marker:font-bold">
              <li class="pl-2">Memberikan peluang seluas-luasnya kepada Aparatur Pemerintahan Desa dan Lembaga Pemerintahan Desa serta Masyarakat untuk meningkatkan kapasitas diri dan masyarakat.</li>
              <li class="pl-2">Meningkatkan Sumber Daya Manusia dan Partisipasi Masyarakat dalam Pembangunan.</li>
              <li class="pl-2">Mengembangkan Usaha Ekonomi Produktif melalui pembangunan yang berpihak pada ekonomi kerakyatan.</li>
              <li class="pl-2">Meningkatkan Pemanfaatan Sumber Daya Alam Melalui Teknologi dan Inovasi.</li>
            </ol>
          </div>
        </div>

        <!-- Aparatur -->
        <div v-if="activeTab === 'aparatur'">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Aparatur Desa</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <div
              v-for="orang in aparatur"
              :key="orang.nama"
              class="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-3 text-green-800 font-bold text-lg border-2 border-green-100">
                {{ orang.inisial }}
              </div>
              <p class="font-bold text-slate-900 text-sm mb-0.5">{{ orang.nama }}</p>
              <p class="text-xs text-green-700 font-medium">{{ orang.jabatan }}</p>
            </div>
          </div>
        </div>

        <!-- Demografi -->
        <div v-if="activeTab === 'demografi'">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Data Demografi</h2>
          <div class="bg-white rounded-2xl border border-border overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-50">
                  <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Keterangan</th>
                  <th class="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in demografi" :key="row.label" class="border-t border-border hover:bg-green-50/40 transition-colors">
                  <td class="px-6 py-4 text-sm font-medium text-slate-700">{{ row.label }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Peta -->
          <div class="mt-8">
            <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-green-800" /> Lokasi Desa
            </h3>
            <div class="rounded-2xl overflow-hidden border border-border h-[400px]">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=107.09%2C-6.84%2C107.11%2C-6.82&layer=mapnik"
                width="100%"
                height="100%"
                style="border:none;"
                loading="lazy"
                title="Peta lokasi Desa Sukarama"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

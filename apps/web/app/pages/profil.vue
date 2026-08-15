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
  { nama: 'H. Ahmad Suryadi, S.Sos', jabatan: 'Kepala Desa', inisial: 'AS' },
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
            <p>Desa Sukarama merupakan salah satu desa di Kecamatan Bojongpicung, Kabupaten Cianjur, Provinsi Jawa Barat. Nama "Sukarama" berasal dari bahasa Sunda yang berarti "suka keramaian", mencerminkan semangat gotong royong dan kebersamaan masyarakatnya.</p>
            <p>Desa ini telah berdiri sejak zaman kolonial Belanda dan terus berkembang hingga saat ini. Dengan luas wilayah sekitar 385,5 hektar, Desa Sukarama terdiri dari 3 dusun, 4 RW, dan 12 RT yang dihuni oleh sekitar 4.523 jiwa penduduk.</p>
            <p>Mayoritas penduduk bermata pencaharian sebagai petani, dengan komoditas utama padi, palawija, dan tanaman perkebunan. Selain pertanian, UMKM juga menjadi penopang ekonomi masyarakat dengan berbagai produk unggulan seperti kerajinan anyaman bambu dan makanan khas tradisional.</p>
          </div>
        </div>

        <!-- Visi Misi -->
        <div v-if="activeTab === 'visimisi'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl border border-border p-8">
            <h3 class="text-lg font-bold text-green-800 flex items-center gap-2 mb-4">
              <Eye class="w-5 h-5" /> Visi
            </h3>
            <p class="text-sm text-slate-600 leading-7 italic">
              "Terwujudnya Desa Sukarama yang Maju, Mandiri, dan Sejahtera berbasis Pertanian dan Kearifan Lokal"
            </p>
          </div>
          <div class="bg-white rounded-2xl border border-border p-8">
            <h3 class="text-lg font-bold text-green-800 flex items-center gap-2 mb-4">
              <Target class="w-5 h-5" /> Misi
            </h3>
            <ol class="space-y-2 text-sm text-slate-600 leading-7 list-decimal pl-5">
              <li>Meningkatkan kualitas pelayanan publik yang transparan dan akuntabel</li>
              <li>Mengembangkan potensi pertanian dan UMKM untuk meningkatkan ekonomi masyarakat</li>
              <li>Meningkatkan kualitas sumber daya manusia melalui pendidikan dan pelatihan</li>
              <li>Membangun infrastruktur desa yang memadai dan berkelanjutan</li>
              <li>Melestarikan nilai-nilai budaya dan kearifan lokal Sunda</li>
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

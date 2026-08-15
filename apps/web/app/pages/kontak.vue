<script setup lang="ts">
import { MapPin, Phone, Clock, Mail, Send, ChevronRight, AlertCircle, CheckCircle } from 'lucide-vue-next'

useHead({ title: 'Kontak — Desa Sukarama' })

const { apiPost } = useApi()

const form = reactive({
  nama: '',
  kontak: '',
  pesan: '',
})

const submitting = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  if (!form.nama || !form.kontak || !form.pesan) {
    error.value = 'Semua field harus diisi'
    return
  }
  submitting.value = true
  try {
    await apiPost('/api/kontak', form)
    success.value = true
    Object.assign(form, { nama: '', kontak: '', pesan: '' })
    setTimeout(() => (success.value = false), 5000)
  } catch (err: any) {
    error.value = err.message || 'Gagal mengirim pesan'
  } finally {
    submitting.value = false
  }
}

const contactInfo = [
  { icon: MapPin, title: 'Alamat', desc: 'Jl. Desa Sukarama No. 01\nKec. Bojongpicung, Kab. Cianjur\nJawa Barat 43263' },
  { icon: Phone, title: 'Telepon', desc: '(0263) 123-4567' },
  { icon: Mail, title: 'Email', desc: 'desa.sukarama@cianjurkab.go.id' },
  { icon: Clock, title: 'Jam Kerja', desc: 'Senin – Jumat: 08.00 – 15.00 WIB\nSabtu – Minggu: Tutup' },
]
</script>

<template>
  <div>
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 right-10 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
      </div>
      <div class="container-app relative z-10 text-center">
        <div class="flex items-center justify-center gap-2 text-green-300 text-xs font-medium mb-4">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span class="text-white">Kontak</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-3">Hubungi Kami</h1>
        <p class="text-green-200/70 text-sm max-w-lg mx-auto">Silakan kirim pesan atau kunjungi kantor Desa Sukarama</p>
      </div>
    </section>

    <section class="py-12 md:py-16">
      <div class="container-app">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Info -->
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-6">Informasi Kontak</h2>
            <div class="space-y-6 mb-10">
              <div v-for="item in contactInfo" :key="item.title" class="flex gap-4">
                <div class="w-11 h-11 rounded-xl bg-green-50 text-green-800 flex items-center justify-center shrink-0">
                  <component :is="item.icon" class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-0.5">{{ item.title }}</h4>
                  <p class="text-sm text-slate-500 whitespace-pre-line leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Peta -->
            <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-green-800" /> Lokasi
            </h3>
            <div class="rounded-2xl overflow-hidden border border-border h-[300px]">
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

          <!-- Form -->
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-6">Kirim Pesan</h2>

            <div v-if="success" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm mb-6">
              <CheckCircle class="w-4 h-4 shrink-0" /> Pesan berhasil dikirim. Terima kasih!
            </div>
            <div v-if="error" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm mb-6">
              <AlertCircle class="w-4 h-4 shrink-0" /> {{ error }}
            </div>

            <form class="bg-white rounded-2xl border border-border p-8" @submit.prevent="handleSubmit">
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap <span class="text-red-500">*</span></label>
                <input v-model="form.nama" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="Nama Anda">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-2">No. HP / Email <span class="text-red-500">*</span></label>
                <input v-model="form.kontak" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="Nomor HP atau alamat email">
              </div>
              <div class="mb-8">
                <label class="block text-sm font-semibold text-slate-700 mb-2">Pesan <span class="text-red-500">*</span></label>
                <textarea v-model="form.pesan" rows="5" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all resize-y" placeholder="Tulis pesan Anda..."></textarea>
              </div>
              <button
                type="submit"
                :disabled="submitting"
                class="w-full py-3.5 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/25 flex items-center justify-center gap-2"
              >
                <Send class="w-4 h-4" />
                {{ submitting ? 'Mengirim...' : 'Kirim Pesan' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

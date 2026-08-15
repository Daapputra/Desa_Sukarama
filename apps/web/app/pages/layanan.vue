<script setup lang="ts">
import { ChevronRight, UploadCloud, Search, FileText, CheckCircle, AlertCircle, Loader2, Download, Upload, Clock, HelpCircle } from 'lucide-vue-next'

useHead({ title: 'Layanan Surat Online — Desa Sukarama' })

const { apiPost, apiGet } = useApi()
const route = useRoute()

const activeTab = ref(route.query.tab === 'cek' ? 'cek' : 'ajukan')

// Form state
const form = reactive({
  nama: '',
  nik: '',
  no_kk: '',
  jenis_surat: '',
  keperluan: '',
  no_wa: '',
  dokumen: null as File | null,
})

const jenisSuratOptions = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Keterangan Usaha',
  'Surat Pengantar KTP',
  'Surat Pengantar KK',
  'Surat Keterangan Pindah',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Kematian',
  'Surat Keterangan Lainnya',
]

const submitting = ref(false)
const submitResult = ref<{ ref_number: string } | null>(null)
const submitError = ref('')

async function handleSubmit() {
  submitError.value = ''
  if (!form.nama || !form.nik || !form.no_kk || !form.jenis_surat || !form.keperluan || !form.no_wa) {
    submitError.value = 'Semua field wajib harus diisi'
    return
  }

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('nama', form.nama)
    fd.append('nik', form.nik)
    fd.append('no_kk', form.no_kk)
    fd.append('jenis_surat', form.jenis_surat)
    fd.append('keperluan', form.keperluan)
    fd.append('no_wa', form.no_wa)
    if (form.dokumen) fd.append('dokumen', form.dokumen)

    const res = await apiPost<{ ref_number: string }>('/api/surat', fd)
    submitResult.value = res
  } catch (err: any) {
    submitError.value = err.message || 'Gagal mengirim pengajuan'
  } finally {
    submitting.value = false
  }
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
    submitError.value = 'Dokumen harus berupa gambar atau PDF dengan ukuran maksimal 5 MB'
    input.value = ''
    form.dokumen = null
    return
  }
  submitError.value = ''
  form.dokumen = file
}

// Cek status state
const refInput = ref('')
const checking = ref(false)
const statusResult = ref<any>(null)
const statusError = ref('')

async function handleCekStatus() {
  statusError.value = ''
  statusResult.value = null
  if (!refInput.value.trim()) {
    statusError.value = 'Masukkan NIK Anda'
    return
  }
  checking.value = true
  try {
    const res = await apiGet(`/api/surat/cek/${refInput.value.trim()}`)
    statusResult.value = res // res is an array now
  } catch (err: any) {
    statusError.value = err.message || 'Tidak ada pengajuan surat dengan NIK ini'
  } finally {
    checking.value = false
  }
}

const steps = [
  { num: '1', title: 'Isi Formulir', desc: 'Lengkapi data diri dan jenis surat' },
  { num: '2', title: 'Upload Dokumen', desc: 'Lampirkan dokumen pendukung' },
  { num: '3', title: 'Cek Berkala', desc: 'Pantau status surat melalui NIK Anda' },
]
</script>

<template>
  <div>
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-20 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
      </div>
      <div class="container-app relative z-10 text-center">
        <div class="flex items-center justify-center gap-2 text-green-300 text-xs font-medium mb-4">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span class="text-white">Layanan Surat</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-white mb-3">Layanan Surat Online</h1>
        <p class="text-green-200/70 text-sm max-w-lg mx-auto">Ajukan surat secara online dan pantau statusnya dengan mudah</p>
      </div>
    </section>

    <section class="py-12 md:py-16">
      <div class="container-app">
        <!-- Steps -->
        <div class="flex flex-col sm:flex-row justify-center gap-8 mb-12">
          <div v-for="step in steps" :key="step.num" class="flex flex-col items-center text-center max-w-[200px]">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-green-800 to-green-600 text-white flex items-center justify-center text-xl font-bold mb-3 shadow-lg shadow-green-900/25">
              {{ step.num }}
            </div>
            <p class="font-bold text-slate-900 text-sm mb-1">{{ step.title }}</p>
            <p class="text-xs text-muted-foreground">{{ step.desc }}</p>
          </div>
        </div>

        <!-- Tab Switch -->
        <div class="flex gap-2 justify-center mb-10">
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            :class="activeTab === 'ajukan'
              ? 'bg-green-900 text-white shadow-lg shadow-green-900/25'
              : 'text-slate-500 hover:bg-green-50 hover:text-green-800'"
            @click="activeTab = 'ajukan'"
          >
            <FileText class="w-4 h-4" /> Ajukan Surat
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            :class="activeTab === 'cek'
              ? 'bg-green-900 text-white shadow-lg shadow-green-900/25'
              : 'text-slate-500 hover:bg-green-50 hover:text-green-800'"
            @click="activeTab = 'cek'"
          >
            <Search class="w-4 h-4" /> Cek Status
          </button>
        </div>

        <!-- Ajukan Form -->
        <div v-if="activeTab === 'ajukan'" class="max-w-2xl mx-auto">
          <!-- Success State -->
          <div v-if="submitResult" class="bg-white rounded-2xl border border-border p-10 text-center">
            <div class="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Pengajuan Berhasil!</h3>
            <p class="text-sm text-slate-500 mb-4">Pengajuan Anda sudah masuk antrean dan sedang kami proses.</p>
            <p class="text-xs text-muted-foreground mb-6 max-w-md mx-auto">
              Anda dapat mengecek status pengajuan kapan saja melalui menu "Cek Status" menggunakan <b>NIK</b> Anda, tanpa perlu repot menyimpan nomor resi!
            </p>
            <button
              class="px-6 py-2.5 rounded-full bg-green-900 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
              @click="submitResult = null; Object.assign(form, { nama:'', nik:'', no_kk:'', jenis_surat:'', keperluan:'', no_wa:'', dokumen: null })"
            >
              Ajukan Surat Baru
            </button>
          </div>

          <!-- Form -->
          <form v-else class="bg-white rounded-2xl border border-border p-8" @submit.prevent="handleSubmit">
            <div v-if="submitError" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm mb-6">
              <AlertCircle class="w-4 h-4 shrink-0" /> {{ submitError }}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap <span class="text-red-500">*</span></label>
                <input v-model="form.nama" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="Nama sesuai KTP">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">NIK <span class="text-red-500">*</span></label>
                <input v-model="form.nik" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="Nomor Induk Kependudukan">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">No. KK <span class="text-red-500">*</span></label>
                <input v-model="form.no_kk" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="Nomor Kartu Keluarga">
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">No. WhatsApp <span class="text-red-500">*</span></label>
                <input v-model="form.no_wa" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all" placeholder="08xxxxxxxxxx">
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Jenis Surat <span class="text-red-500">*</span></label>
              <select v-model="form.jenis_surat" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all appearance-none bg-white">
                <option value="" disabled>— Pilih jenis surat —</option>
                <option v-for="opt in jenisSuratOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Keperluan <span class="text-red-500">*</span></label>
              <textarea v-model="form.keperluan" rows="4" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all resize-y" placeholder="Jelaskan keperluan pengajuan surat..."></textarea>
            </div>

            <div class="mb-8">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Dokumen Pendukung</label>
              <label class="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-green-800 hover:bg-green-50/30 transition-all">
                <Upload class="w-6 h-6 text-muted-foreground mb-2" />
                <span class="text-sm text-slate-500">{{ form.dokumen ? form.dokumen.name : 'Klik untuk upload file' }}</span>
                <span class="text-xs text-muted-foreground mt-1">JPG, PNG, atau PDF (maks. 5MB)</span>
                <input type="file" class="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" @change="handleFileChange">
              </label>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3.5 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/25"
            >
              {{ submitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </form>
        </div>

        <!-- Cek Status -->
        <div v-if="activeTab === 'cek'" class="max-w-lg mx-auto">
          <div class="bg-white rounded-2xl border border-border p-8">
            <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search class="w-5 h-5 text-green-800" /> Cek Status Pengajuan
            </h3>
            <div class="flex gap-3 mb-6">
              <input
                v-model="refInput"
                type="text"
                class="flex-1 px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all font-mono"
                placeholder="Masukkan NIK Anda..."
                @keyup.enter="handleCekStatus"
              >
              <button
                :disabled="checking"
                class="px-6 py-3 rounded-xl bg-green-900 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
                @click="handleCekStatus"
              >
                {{ checking ? '...' : 'Cek' }}
              </button>
            </div>

            <div v-if="statusError" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertCircle class="w-4 h-4 shrink-0" /> {{ statusError }}
            </div>

            <div v-if="statusResult" class="flex flex-col gap-4">
              <div v-for="surat in statusResult" :key="surat.ref_number" class="border border-border rounded-xl overflow-hidden">
                <div class="flex justify-between px-4 py-3 border-b border-border bg-slate-50">
                  <span class="text-sm font-semibold text-slate-700">Jenis Surat</span>
                  <span class="text-sm text-slate-900 font-medium">{{ surat.jenis_surat }}</span>
                </div>
                <div class="flex justify-between px-4 py-3 border-b border-border">
                  <span class="text-sm font-semibold text-slate-700">Status</span>
                  <span :class="[getStatusColor(surat.status), 'px-3 py-0.5 rounded-full text-xs font-semibold']">
                    {{ surat.status }}
                  </span>
                </div>
                <div class="flex justify-between px-4 py-3">
                  <span class="text-sm font-semibold text-slate-700">Tanggal Ajuan</span>
                  <span class="text-sm text-slate-600">{{ formatTanggal(surat.created_at) }}</span>
                </div>
                <div v-if="surat.status === 'Selesai'" class="p-4 border-t border-border bg-green-50/50">
                  <a
                    :href="`http://localhost:3005/api/surat/${surat.id}/download-surat`"
                    target="_blank"
                    class="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-800 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Download class="w-4 h-4" /> Download Surat (Otomatis)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Help box -->
          <div class="mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <HelpCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-amber-800">Butuh bantuan?</p>
              <p class="text-xs text-amber-700 mt-1">Jika ada data yang tidak sesuai atau proses yang terlalu lama, silakan hubungi kantor desa atau gunakan menu Kontak.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

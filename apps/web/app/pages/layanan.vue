<script setup lang="ts">
import {
  ChevronRight, Search, FileText, CheckCircle2, AlertCircle, Loader2, Download,
  Upload, Clock, HelpCircle, UserCheck, ShieldCheck, ArrowRight, Building2,
  FileCheck2, Sparkles, RefreshCw, FileQuestion
} from 'lucide-vue-next'
import { formatTanggal, getStatusColor } from '~/utils/format'

useHead({
  title: 'Layanan Surat Online — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Ajukan surat administrasi desa secara online seperti Surat Domisili, SKU, Surat Beda Nama, dan lacak status secara instan dengan NIK.' }
  ]
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3005'
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
  nama_kk: '',
  nama_ktp: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  jenis_kelamin: '',
  agama: 'Islam',
  pekerjaan: '',
  alamat: '',
  nama_program: '',
  tahun_program: new Date().getFullYear().toString(),
  nama_usaha: '',
  sektor_usaha: '',
  nomor_kontak: '',
  bidang_usaha: '',
  alamat_usaha: '',
  lama_usaha: '',
  penandatangan: 'Kepala Desa',
  dokumen: null as File | null,
})

const nikFound = ref<boolean | null>(null)
const checkingNik = ref(false)
const residentDetail = ref<{ namaLengkap: string; noKk: string } | null>(null)

// Format input NIK (Numeric only, max 16)
function onNikInput(e: Event) {
  const target = e.target as HTMLInputElement
  form.nik = target.value.replace(/\D/g, '').slice(0, 16)
}

function onKkInput(e: Event) {
  const target = e.target as HTMLInputElement
  form.no_kk = target.value.replace(/\D/g, '').slice(0, 16)
}

// Watch NIK change
watch(() => form.nik, async (newNik) => {
  if (newNik && newNik.length === 16) {
    checkingNik.value = true
    try {
      const res = await apiGet<any>(`/api/surat/cek-penduduk/${newNik}`)
      if (res.found) {
        nikFound.value = true
        residentDetail.value = { namaLengkap: res.namaLengkap, noKk: res.noKk }
        form.nama = res.namaLengkap
        form.no_kk = res.noKk
      } else {
        nikFound.value = false
        residentDetail.value = null
      }
    } catch {
      nikFound.value = false
      residentDetail.value = null
    } finally {
      checkingNik.value = false
    }
  } else {
    nikFound.value = null
    residentDetail.value = null
  }
})

const jenisSuratOptions = [
  {
    id: 'Surat Keterangan Domisili',
    title: 'Surat Keterangan Domisili',
    desc: 'Surat keterangan bukti domisili tempat tinggal sah di wilayah Desa Sukarama.',
    icon: Building2,
    badge: 'Paling Sering Digunakan'
  },
  {
    id: 'Surat Keterangan Usaha',
    title: 'Surat Keterangan Usaha (SKU)',
    desc: 'Surat legalitas keterangan kepemilikan usaha aktif di desa untuk pinjaman/izin.',
    icon: FileCheck2,
    badge: 'Untuk Pelaku Usaha'
  },
  {
    id: 'Surat Beda Nama',
    title: 'Surat Beda Nama (KTP vs KK)',
    desc: 'Klarifikasi resmi perbedaan ejaan nama antara Kartu Keluarga dan KTP/Ijazah.',
    icon: FileQuestion,
    badge: 'Koreksi Data'
  },
  {
    id: 'Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu',
    title: 'Surat Pernyataan Program',
    desc: 'Surat pernyataan keikutsertaan program bantuan/kegiatan pemberdayaan.',
    icon: Sparkles,
    badge: 'Program Pemerintah'
  },
]

const submitting = ref(false)
const submitResult = ref<{ ref_number: string } | null>(null)
const submitError = ref('')

async function handleSubmit() {
  submitError.value = ''
  if (!form.nama || !form.nik || !form.no_kk || !form.jenis_surat || !form.keperluan || !form.no_wa) {
    submitError.value = 'Mohon lengkapi semua kolom wajib bertanda bintang (*)'
    return
  }

  if (form.nik.length < 16) {
    submitError.value = 'NIK harus berjumlah 16 digit angka'
    return
  }

  if (form.no_kk.length < 16) {
    submitError.value = 'Nomor KK harus berjumlah 16 digit angka'
    return
  }

  if (nikFound.value === false) {
    if (!form.tempat_lahir || !form.tanggal_lahir || !form.jenis_kelamin || !form.agama || !form.pekerjaan || !form.alamat) {
      submitError.value = 'NIK Anda baru, mohon lengkapi biodata kependudukan tambahan'
      return
    }
  }

  if (form.jenis_surat === 'Surat Beda Nama') {
    if (!form.nama_kk || !form.nama_ktp) {
      submitError.value = 'Nama di KK dan Nama di KTP wajib diisi untuk Surat Beda Nama'
      return
    }
  }

  if (form.jenis_surat === 'Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu') {
    if (!form.nama_program || !form.tahun_program) {
      submitError.value = 'Nama Program dan Tahun Program wajib diisi'
      return
    }
  }

  if (form.jenis_surat === 'Surat Keterangan Usaha') {
    if (!form.bidang_usaha || !form.alamat_usaha || !form.lama_usaha) {
      submitError.value = 'Bidang usaha, alamat usaha, dan lama usaha wajib diisi'
      return
    }
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

    if (form.jenis_surat === 'Surat Beda Nama') {
      fd.append('nama_kk', form.nama_kk)
      fd.append('nama_ktp', form.nama_ktp)
    }

    if (form.jenis_surat === 'Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu') {
      fd.append('nama_program', form.nama_program)
      fd.append('tahun_program', form.tahun_program)
      fd.append('nama_usaha', form.nama_usaha)
      fd.append('sektor_usaha', form.sektor_usaha)
      fd.append('nomor_kontak', form.nomor_kontak)
    }

    if (form.jenis_surat === 'Surat Keterangan Usaha') {
      fd.append('bidang_usaha', form.bidang_usaha)
      fd.append('alamat_usaha', form.alamat_usaha)
      fd.append('lama_usaha', form.lama_usaha)
    }

    if (nikFound.value === false) {
      fd.append('tempat_lahir', form.tempat_lahir)
      fd.append('tanggal_lahir', form.tanggal_lahir)
      fd.append('jenis_kelamin', form.jenis_kelamin)
      fd.append('agama', form.agama)
      fd.append('pekerjaan', form.pekerjaan)
      fd.append('alamat', form.alamat)
    }

    fd.append('penandatangan', form.penandatangan)
    if (form.dokumen) {
      fd.append('dokumen', form.dokumen)
    }

    const res = await apiPost<{ ref_number: string }>('/api/surat', fd)
    submitResult.value = res
  } catch (err: any) {
    submitError.value = err.message || 'Gagal mengirim pengajuan surat'
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
    submitError.value = 'Dokumen lampiran harus berupa JPG, PNG, atau PDF (maksimal 5 MB)'
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
const statusResult = ref<any[] | null>(null)
const statusError = ref('')

async function handleCekStatus() {
  statusError.value = ''
  statusResult.value = null
  const cleanedNik = refInput.value.replace(/\D/g, '').trim()
  if (!cleanedNik) {
    statusError.value = 'Silakan masukkan 16 digit NIK Anda'
    return
  }
  checking.value = true
  try {
    const res = await apiGet<any[]>(`/api/surat/cek/${cleanedNik}`)
    statusResult.value = res
  } catch (err: any) {
    statusError.value = err.message || 'Tidak ada riwayat pengajuan surat untuk NIK tersebut'
  } finally {
    checking.value = false
  }
}

function getDownloadUrl(suratId: number) {
  return `${apiBase}/api/surat/${suratId}/download-surat`
}

const steps = [
  { num: '1', title: 'Input NIK & Data', desc: 'Autofill otomatis dari data desa' },
  { num: '2', title: 'Pilih Jenis Surat', desc: 'Domisili, SKU, Beda Nama, dll' },
  { num: '3', title: 'Verifikasi & TTD', desc: 'Diproses online oleh perangkat desa' },
  { num: '4', title: 'Unduh Dokumen', desc: 'Langsung download file Word (.docx)' },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-20">
    <!-- Page Hero -->
    <section class="relative py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 overflow-hidden text-white">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div class="container-app relative z-10 text-center">
        <div class="inline-flex items-center gap-2 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span>Layanan Surat</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Layanan Administrasi Surat Digital
        </h1>
        <p class="text-emerald-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Pengajuan surat keterangan desa secara mandiri dari rumah dengan sistem cerdas terhubung ke data kependudukan resmi.
        </p>
      </div>
    </section>

    <!-- Main Section -->
    <section class="py-10 md:py-14">
      <div class="container-app">
        <!-- Steps Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div
            v-for="step in steps"
            :key="step.num"
            class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:border-emerald-300 transition-all"
          >
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center text-base mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors shadow-inner">
              {{ step.num }}
            </div>
            <p class="font-bold text-slate-900 text-sm mb-1">{{ step.title }}</p>
            <p class="text-xs text-slate-500 leading-tight">{{ step.desc }}</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex justify-center mb-10">
          <div class="inline-flex p-1.5 rounded-full bg-slate-200/70 border border-slate-300/80 shadow-inner">
            <button
              class="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200"
              :class="activeTab === 'ajukan'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/25'
                : 'text-slate-600 hover:text-emerald-900'"
              @click="activeTab = 'ajukan'"
            >
              <FileText class="w-4 h-4" />
              <span>Buat Pengajuan Surat</span>
            </button>
            <button
              class="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200"
              :class="activeTab === 'cek'
                ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/25'
                : 'text-slate-600 hover:text-emerald-900'"
              @click="activeTab = 'cek'"
            >
              <Search class="w-4 h-4" />
              <span>Lacak Status Surat (Via NIK)</span>
            </button>
          </div>
        </div>

        <!-- TAB 1: AJUKAN SURAT -->
        <div v-if="activeTab === 'ajukan'" class="max-w-3xl mx-auto">
          <!-- Success Card -->
          <div v-if="submitResult" class="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-xl shadow-emerald-950/5 animate-fade-in-up">
            <div class="w-18 h-18 w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle2 class="w-10 h-10" />
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-3">
              Nomor Referensi: {{ submitResult.ref_number }}
            </span>
            <h3 class="text-2xl font-black text-slate-900 mb-2">Pengajuan Berhasil Terkirim!</h3>
            <p class="text-sm text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
              Surat permohonan Anda telah berhasil didaftarkan dan segera diverifikasi oleh operator pelayanan Desa Sukarama.
            </p>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-8 max-w-lg mx-auto text-left text-xs text-slate-600 space-y-2">
              <div class="flex items-start gap-2">
                <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><b>Auto-Tracking Aktif:</b> Cukup masukkan <b>NIK</b> Anda di menu tab "Lacak Status" untuk melihat progres persetujuan tanpa perlu mengingat nomor resi.</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-3">
              <button
                class="px-6 py-3 rounded-full bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md"
                @click="submitResult = null; Object.assign(form, { nama:'', nik:'', no_kk:'', jenis_surat:'', keperluan:'', no_wa:'', nama_kk:'', nama_ktp:'', nama_program:'', tahun_program:'2026', nama_usaha:'', sektor_usaha:'', nomor_kontak:'', bidang_usaha:'', alamat_usaha:'', lama_usaha:'', penandatangan:'Kepala Desa', dokumen: null })"
              >
                Ajukan Surat Lainnya
              </button>
              <button
                class="px-6 py-3 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                @click="activeTab = 'cek'; refInput = form.nik; handleCekStatus()"
              >
                Lihat di Menu Lacak
              </button>
            </div>
          </div>

          <!-- Main Submission Form -->
          <form v-else class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm" @submit.prevent="handleSubmit">
            <div class="mb-8 pb-6 border-b border-slate-100">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText class="w-5 h-5 text-emerald-700" />
                Formulir Pengajuan Surat Warga
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                Lengkapi NIK untuk memuat data kependudukan resmi secara instan.
              </p>
            </div>

            <!-- Error Banner -->
            <div v-if="submitError" class="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 animate-fade-in">
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{{ submitError }}</span>
            </div>

            <!-- NIK & Autofill Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="text-xs font-bold text-slate-700">NIK (Nomor Induk Kependudukan) <span class="text-rose-500">*</span></label>
                  <span class="text-[11px] text-slate-400 font-mono">{{ form.nik.length }}/16</span>
                </div>
                <div class="relative">
                  <input
                    :value="form.nik"
                    type="text"
                    inputmode="numeric"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none font-mono transition-all pr-10"
                    placeholder="Contoh: 3203061708980009"
                    @input="onNikInput"
                  />
                  <Loader2 v-if="checkingNik" class="w-4 h-4 text-emerald-700 absolute right-3 top-3.5 animate-spin" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Nama Lengkap <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.nama"
                  type="text"
                  :disabled="nikFound === true"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all disabled:bg-slate-100/80 disabled:text-slate-700 disabled:font-medium"
                  placeholder="Nama sesuai KTP"
                />
              </div>
            </div>

            <!-- NIK Detected Banner -->
            <div v-if="nikFound === true && residentDetail" class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3 animate-fade-in">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <UserCheck class="w-5 h-5" />
                </div>
                <div>
                  <div class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    <span>✓ Terverifikasi di Master Data</span>
                  </div>
                  <p class="text-xs text-emerald-950 font-bold">
                    {{ residentDetail.namaLengkap }} &bull; KK: {{ residentDetail.noKk }}
                  </p>
                </div>
              </div>
              <span class="text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-semibold hidden sm:inline">
                Autofill Aktif
              </span>
            </div>

            <!-- NIK Not Found Notice (Auto-Register Alert) -->
            <div v-if="nikFound === false && form.nik.length === 16" class="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 animate-fade-in">
              <div class="flex items-start gap-3 mb-4">
                <AlertCircle class="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wide">NIK Belum Terdaftar di Master</h4>
                  <p class="text-xs text-amber-800 mt-1 leading-relaxed">
                    Jangan khawatir! Anda tetap dapat mengajukan surat. Lengkapi biodata tambahan berikut, dan sistem akan <b>secara otomatis mendaftarkan data Anda</b> untuk kemudahan layanan di masa mendatang.
                  </p>
                </div>
              </div>

              <!-- Extra fields for new residents -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-amber-200/60">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tempat Lahir <span class="text-rose-500">*</span></label>
                  <input v-model="form.tempat_lahir" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none" placeholder="Contoh: Cianjur">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Lahir <span class="text-rose-500">*</span></label>
                  <input v-model="form.tanggal_lahir" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin <span class="text-rose-500">*</span></label>
                  <select v-model="form.jenis_kelamin" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none bg-white">
                    <option value="" disabled>Pilih Jenis Kelamin</option>
                    <option value="LAKI-LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Agama <span class="text-rose-500">*</span></label>
                  <select v-model="form.agama" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none bg-white">
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan <span class="text-rose-500">*</span></label>
                  <input v-model="form.pekerjaan" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none" placeholder="Contoh: Wiraswasta">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Lengkap <span class="text-rose-500">*</span></label>
                  <input v-model="form.alamat" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 outline-none" placeholder="Kp. Sukamanah RT 01 RW 02">
                </div>
              </div>
            </div>

            <!-- Nomor KK & WhatsApp -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label class="text-xs font-bold text-slate-700">Nomor Kartu Keluarga (KK) <span class="text-rose-500">*</span></label>
                  <span class="text-[11px] text-slate-400 font-mono">{{ form.no_kk.length }}/16</span>
                </div>
                <input
                  :value="form.no_kk"
                  type="text"
                  inputmode="numeric"
                  :disabled="nikFound === true"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none font-mono transition-all disabled:bg-slate-100/80 disabled:text-slate-700"
                  placeholder="16 digit Nomor KK"
                  @input="onKkInput"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Nomor WhatsApp Aktif <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.no_wa"
                  type="text"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>

            <!-- Pilihan Jenis Surat (Interactive Cards) -->
            <div class="mb-6">
              <label class="block text-xs font-bold text-slate-700 mb-3">Pilih Jenis Dokumen Surat <span class="text-rose-500">*</span></label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div
                  v-for="opt in jenisSuratOptions"
                  :key="opt.id"
                  class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between"
                  :class="form.jenis_surat === opt.id
                    ? 'border-emerald-800 bg-emerald-50/70 ring-2 ring-emerald-800/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'"
                  @click="form.jenis_surat = opt.id"
                >
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-800 bg-emerald-100/80">
                      <component :is="opt.icon" class="w-4 h-4" />
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {{ opt.badge }}
                    </span>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-900 leading-snug">{{ opt.title }}</h4>
                    <p class="text-[11px] text-slate-500 mt-1 leading-tight">{{ opt.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Khusus: Surat Beda Nama -->
            <div v-if="form.jenis_surat === 'Surat Beda Nama'" class="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 mb-6 animate-fade-in">
              <h4 class="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">Rincian Perbedaan Nama</h4>
              <p class="text-xs text-amber-700 mb-4">Mohon isi ejaan nama tepat sesuai dokumen yang bersangkutan.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nama di Kartu Keluarga <span class="text-rose-500">*</span></label>
                  <input v-model="form.nama_kk" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Sesuai dokumen KK">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nama di KTP / Dokumen Lain <span class="text-rose-500">*</span></label>
                  <input v-model="form.nama_ktp" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Sesuai dokumen KTP">
                </div>
              </div>
            </div>

            <!-- Form Khusus: Surat Keterangan Usaha (SKU) -->
            <div v-if="form.jenis_surat === 'Surat Keterangan Usaha'" class="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 mb-6 animate-fade-in">
              <h4 class="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">Rincian Legalitas Usaha</h4>
              <p class="text-xs text-blue-700 mb-4">Data ini akan tercantum dalam surat pengantar keterangan usaha.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Bidang / Jenis Usaha <span class="text-rose-500">*</span></label>
                  <input v-model="form.bidang_usaha" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Contoh: Toko Sembako, Bengkel, dll">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Lama Usaha Berjalan <span class="text-rose-500">*</span></label>
                  <input v-model="form.lama_usaha" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Contoh: 3 Tahun">
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Alamat Lokasi Usaha <span class="text-rose-500">*</span></label>
                  <input v-model="form.alamat_usaha" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Alamat lengkap lokasi tempat usaha">
                </div>
              </div>
            </div>

            <!-- Form Khusus: Surat Pernyataan Program -->
            <div v-if="form.jenis_surat === 'Surat Pernyataan Kesediaan Mengikuti Program/Kegiatan Tertentu'" class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 mb-6 animate-fade-in">
              <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1">Informasi Program / Kegiatan</h4>
              <p class="text-xs text-emerald-700 mb-4">Lengkapi nama program binaan atau pemberdayaan desa.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Program / Kegiatan <span class="text-rose-500">*</span></label>
                  <input v-model="form.nama_program" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="Contoh: Bantuan UMKM Desa Sukarama">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Tahun Program <span class="text-rose-500">*</span></label>
                  <input v-model="form.tahun_program" type="text" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-800 outline-none" placeholder="2026">
                </div>
              </div>
            </div>

            <!-- Keperluan -->
            <div class="mb-6">
              <label class="block text-xs font-bold text-slate-700 mb-2">Keperluan Permohonan Surat <span class="text-rose-500">*</span></label>
              <textarea
                v-model="form.keperluan"
                rows="3"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none resize-y transition-all"
                placeholder="Contoh: Persyaratan administrasi pembukaan rekening bank, pengajuan beasiswa, dll..."
              ></textarea>
            </div>

            <!-- Penandatangan & Lampiran -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Penandatangan Dokumen <span class="text-rose-500">*</span></label>
                <select v-model="form.penandatangan" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none bg-white">
                  <option value="Kepala Desa">Kepala Desa (Wahyu Komara)</option>
                  <option value="Sekretaris Desa">Sekretaris Desa (Wawan Saepudin)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-2">Lampiran Dokumen (Opsional)</label>
                <label class="flex items-center gap-3 px-4 py-2.5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/30 transition-all">
                  <Upload class="w-4 h-4 text-emerald-700 shrink-0" />
                  <span class="text-xs text-slate-600 truncate">{{ form.dokumen ? form.dokumen.name : 'Upload Foto KTP/KK (Maks 5MB)' }}</span>
                  <input type="file" class="hidden" accept=".jpg,.jpeg,.png,.pdf" @change="handleFileChange">
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-4 rounded-2xl bg-emerald-900 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
              <span>{{ submitting ? 'Memproses Pengajuan Surat...' : 'Kirim Pengajuan Surat Sekarang' }}</span>
            </button>
          </form>
        </div>

        <!-- TAB 2: CEK STATUS SURAT -->
        <div v-if="activeTab === 'cek'" class="max-w-2xl mx-auto">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
            <div class="mb-6 pb-6 border-b border-slate-100">
              <h3 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Search class="w-5 h-5 text-emerald-700" />
                Lacak Status Permohonan Surat
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Masukkan 16 digit NIK Anda untuk memantau semua riwayat pengajuan surat.
              </p>
            </div>

            <div class="flex gap-2 mb-6">
              <input
                v-model="refInput"
                type="text"
                inputmode="numeric"
                class="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                placeholder="Ketik 16 digit NIK..."
                @keyup.enter="handleCekStatus"
              />
              <button
                :disabled="checking"
                class="px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                @click="handleCekStatus"
              >
                <Loader2 v-if="checking" class="w-4 h-4 animate-spin" />
                <span>{{ checking ? 'Mengecek...' : 'Cari Surat' }}</span>
              </button>
            </div>

            <!-- Error alert -->
            <div v-if="statusError" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 mb-6">
              <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
              <span>{{ statusError }}</span>
            </div>

            <!-- Status Results List -->
            <div v-if="statusResult && statusResult.length > 0" class="space-y-4">
              <div
                v-for="surat in statusResult"
                :key="surat.id"
                class="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/50 shadow-sm"
              >
                <!-- Card Header -->
                <div class="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-mono text-slate-400 block mb-0.5">{{ surat.ref_number }}</span>
                    <h4 class="text-sm font-bold text-slate-900">{{ surat.jenis_surat }}</h4>
                  </div>
                  <span :class="[getStatusColor(surat.status), 'px-3 py-1 rounded-full text-xs font-extrabold shadow-sm']">
                    {{ surat.status }}
                  </span>
                </div>

                <!-- Stepper Progress Timeline -->
                <div class="p-5 bg-white border-b border-slate-100">
                  <div class="flex items-center justify-between relative">
                    <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0"></div>
                    <div
                      class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 z-0 transition-all duration-500"
                      :style="{
                        width: surat.status === 'Diajukan' ? '15%' : surat.status === 'Diproses' ? '50%' : '100%'
                      }"
                    ></div>

                    <!-- Step 1 -->
                    <div class="relative z-10 flex flex-col items-center">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-600 text-white shadow">
                        1
                      </div>
                      <span class="text-[10px] font-semibold text-slate-600 mt-1">Diajukan</span>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                        :class="['Diproses', 'Selesai'].includes(surat.status) ? 'bg-emerald-600 text-white shadow' : 'bg-slate-200 text-slate-500'"
                      >
                        2
                      </div>
                      <span class="text-[10px] font-semibold text-slate-600 mt-1">Diproses</span>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                        :class="surat.status === 'Selesai' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-200 text-slate-500'"
                      >
                        ✓
                      </div>
                      <span class="text-[10px] font-semibold text-slate-600 mt-1">Selesai</span>
                    </div>
                  </div>
                </div>

                <!-- Detail & Download Footer -->
                <div class="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span class="text-slate-500">Diajukan pada: {{ formatTanggal(surat.created_at) }}</span>

                  <a
                    v-if="surat.status === 'Selesai'"
                    :href="getDownloadUrl(surat.id)"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all"
                  >
                    <Download class="w-4 h-4" />
                    <span>Download Surat Resmi (.docx)</span>
                  </a>
                  <span v-else class="text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-semibold border border-amber-200/60">
                    Sedang diproses oleh staf desa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

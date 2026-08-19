<script setup lang="ts">
import {
  FileText, ShoppingBag, Newspaper, MessageSquare, LogOut,
  Plus, Pencil, Trash2, Eye, AlertCircle, X, Printer, Search,
  Clock, Globe, Loader2, Download
} from 'lucide-vue-next'
import { formatTanggal, formatRupiah, getStatusColor } from '~/utils/format'

definePageMeta({ layout: 'admin' })
useHead({
  title: 'Dashboard Administrasi — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Panel manajemen layanan administrasi surat, produk UMKM, dan informasi publik Desa Sukarama.' }
  ]
})

const { adminUsername, logout, verify } = useAuth()
const { apiGet, apiPost, apiPut, apiDelete } = useApi()
const router = useRouter()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3005'

// Verify auth on mount
onMounted(async () => {
  const valid = await verify()
  if (!valid) router.push('/admin')
})

// Stats & active tab
const stats = ref<any>(null)
const activeTab = ref<'surat' | 'umkm' | 'pengumuman' | 'pesan'>('surat')

const tabs = [
  { id: 'surat', label: 'Pengajuan Surat', icon: FileText },
  { id: 'umkm', label: 'Produk UMKM', icon: ShoppingBag },
  { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
  { id: 'pesan', label: 'Pesan Masuk', icon: MessageSquare },
]

// Data lists
const suratList = ref<any[]>([])
const umkmList = ref<any[]>([])
const pengumumanList = ref<any[]>([])
const pesanList = ref<any[]>([])

// Filter & Search states
const suratSearch = ref('')
const suratStatusFilter = ref('Semua')
const umkmSearch = ref('')
const pengumumanSearch = ref('')
const pesanSearch = ref('')

// Modal state
const showModal = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const modalType = ref<'surat' | 'umkm' | 'pengumuman' | 'pesan' | ''>('')
const modalData = ref<any>({})
const modalLoading = ref(false)
const modalError = ref('')

async function loadAll() {
  try {
    const [resStats, resSurat, resUmkm, resPengumuman, resPesan] = await Promise.all([
      apiGet('/api/admin/stats').catch(() => null),
      apiGet<any[]>('/api/surat').catch(() => []),
      apiGet<any[]>('/api/umkm').catch(() => []),
      apiGet<any[]>('/api/pengumuman').catch(() => []),
      apiGet<any[]>('/api/kontak').catch(() => []),
    ])
    stats.value = resStats
    suratList.value = resSurat
    umkmList.value = resUmkm
    pengumumanList.value = resPengumuman
    pesanList.value = resPesan
  } catch {
    // Graceful error recovery
  }
}

onMounted(() => {
  loadAll()
})

async function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
    await logout()
    router.push('/admin')
  }
}

// Computed Filtered Lists
const filteredSurat = computed(() => {
  let list = suratList.value
  if (suratStatusFilter.value !== 'Semua') {
    list = list.filter((s) => s.status === suratStatusFilter.value)
  }
  if (suratSearch.value.trim()) {
    const q = suratSearch.value.toLowerCase().trim()
    list = list.filter((s) =>
      (s.nama || '').toLowerCase().includes(q) ||
      (s.nik || '').toLowerCase().includes(q) ||
      (s.ref_number || s.refNumber || '').toLowerCase().includes(q) ||
      (s.jenis_surat || s.jenisSurat || '').toLowerCase().includes(q)
    )
  }
  return list
})

const filteredUmkm = computed(() => {
  let list = umkmList.value
  if (umkmSearch.value.trim()) {
    const q = umkmSearch.value.toLowerCase().trim()
    list = list.filter((u) =>
      (u.nama_produk || u.namaProduk || '').toLowerCase().includes(q) ||
      (u.pemilik || '').toLowerCase().includes(q) ||
      (u.kategori || '').toLowerCase().includes(q)
    )
  }
  return list
})

const filteredPengumuman = computed(() => {
  let list = pengumumanList.value
  if (pengumumanSearch.value.trim()) {
    const q = pengumumanSearch.value.toLowerCase().trim()
    list = list.filter((p) =>
      (p.judul || '').toLowerCase().includes(q) ||
      (p.konten || '').toLowerCase().includes(q)
    )
  }
  return list
})

const filteredPesan = computed(() => {
  let list = pesanList.value
  if (pesanSearch.value.trim()) {
    const q = pesanSearch.value.toLowerCase().trim()
    list = list.filter((m) =>
      (m.nama || '').toLowerCase().includes(q) ||
      (m.kontak || '').toLowerCase().includes(q) ||
      (m.pesan || '').toLowerCase().includes(q)
    )
  }
  return list
})

// Status update for surat
async function updateSuratStatus(id: number, status: string) {
  try {
    await apiPut(`/api/surat/${id}/status`, { status })
    await loadAll()
  } catch (err: any) {
    alert(err.message || 'Gagal memperbarui status surat')
  }
}

// CRUD modals
function openAddModal(type: 'umkm' | 'pengumuman') {
  modalType.value = type
  modalMode.value = 'add'
  modalData.value = type === 'pengumuman'
    ? { tanggal: new Date().toISOString().split('T')[0] }
    : { kategori: 'Makanan' }
  modalError.value = ''
  showModal.value = true
}

function openEditModal(type: 'umkm' | 'pengumuman', data: any) {
  modalType.value = type
  modalMode.value = 'edit'
  modalData.value = { ...data }
  modalError.value = ''
  showModal.value = true
}

function openDetailModal(type: 'surat' | 'pesan', data: any) {
  modalType.value = type
  modalMode.value = 'detail'
  modalData.value = data
  showModal.value = true
}

function handleFotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    modalData.value.fotoFile = input.files[0]
  }
}

async function handleModalSubmit() {
  modalLoading.value = true
  modalError.value = ''
  try {
    if (modalType.value === 'pengumuman') {
      if (!modalData.value.judul || !modalData.value.konten || !modalData.value.tanggal) {
        modalError.value = 'Judul, tanggal, dan konten pengumuman wajib diisi'
        return
      }
      const body = {
        judul: modalData.value.judul,
        konten: modalData.value.konten,
        tanggal: modalData.value.tanggal,
      }
      if (modalMode.value === 'add') {
        await apiPost('/api/pengumuman', body)
      } else {
        await apiPut(`/api/pengumuman/${modalData.value.id}`, body)
      }
    } else if (modalType.value === 'umkm') {
      const nama = modalData.value.nama_produk || modalData.value.namaProduk || ''
      if (!nama || !modalData.value.harga || !modalData.value.pemilik) {
        modalError.value = 'Nama produk, harga, dan nama pemilik wajib diisi'
        return
      }
      const fd = new FormData()
      fd.append('nama_produk', nama)
      fd.append('harga', String(modalData.value.harga || '0'))
      fd.append('kategori', modalData.value.kategori || 'Makanan')
      fd.append('deskripsi', modalData.value.deskripsi || '')
      fd.append('pemilik', modalData.value.pemilik || '')
      fd.append('no_wa_pemilik', modalData.value.no_wa_pemilik || modalData.value.noWaPemilik || '')
      if (modalData.value.fotoFile) {
        fd.append('foto', modalData.value.fotoFile)
      }

      if (modalMode.value === 'add') {
        await apiPost('/api/umkm', fd)
      } else {
        await apiPut(`/api/umkm/${modalData.value.id}`, fd)
      }
    }
    showModal.value = false
    await loadAll()
  } catch (err: any) {
    modalError.value = err.message || 'Gagal menyimpan perubahan'
  } finally {
    modalLoading.value = false
  }
}

async function handleDelete(type: 'pengumuman' | 'umkm', id: number) {
  if (!confirm('Apakah Anda yakin ingin menghapus data ini secara permanen?')) return
  try {
    if (type === 'pengumuman') await apiDelete(`/api/pengumuman/${id}`)
    else if (type === 'umkm') await apiDelete(`/api/umkm/${id}`)
    await loadAll()
  } catch (err: any) {
    alert(err.message || 'Gagal menghapus data')
  }
}

function downloadSurat(id: number) {
  const nomor = window.prompt('Masukkan Nomor Surat Resmi (kosongkan jika ingin memakai nomor referensi bawaan):')
  if (nomor === null) return // Canceled

  const url = new URL(`${apiBase}/api/surat/${id}/download-surat`)
  if (nomor.trim()) {
    url.searchParams.set('nomor_surat', nomor.trim())
  }
  window.open(url.toString(), '_blank')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/70 pb-20">
    <!-- Top Navigation Bar -->
    <header class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <!-- Brand / Identity -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <img
              src="/images/logo-desa.png"
              alt="Logo Desa Sukarama"
              class="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-slate-900 text-sm tracking-tight group-hover:text-emerald-800 transition-colors">
                  Panel Administrator
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60 hidden sm:inline">
                  Desa Sukarama
                </span>
              </div>
              <p class="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                Kecamatan Bojongpicung, Cianjur
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- User Menu & Actions -->
        <div class="flex items-center gap-3 sm:gap-4">
          <NuxtLink
            to="/"
            target="_blank"
            class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all"
            title="Buka Website Publik"
          >
            <Globe class="w-3.5 h-3.5 text-emerald-700" />
            <span>Lihat Website</span>
          </NuxtLink>

          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70 text-xs font-semibold text-slate-700">
            <div class="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-black">
              {{ (adminUsername || 'A').charAt(0).toUpperCase() }}
            </div>
            <span class="hidden sm:inline">{{ adminUsername }}</span>
          </div>

          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200/60 transition-colors"
            @click="handleLogout"
            title="Keluar dari Panel Admin"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Welcome & Stats Overview Banner -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ringkasan Pelayanan Desa
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              Pantau permohonan surat masuk, direktori produk warga, dan komunikasi aspirasi publik.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
            @click="loadAll"
          >
            <span>Segarkan Data</span>
          </button>
        </div>

        <!-- 4 Stats Cards (Emerald / Amber / Blue / Purple accents) -->
        <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:border-amber-300 transition-all flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <span class="text-2xl font-black text-slate-900 block leading-tight">{{ stats.surat_baru || 0 }}</span>
              <span class="text-xs font-bold text-slate-500">Surat Baru Masuk</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-all flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
              <FileText class="w-6 h-6" />
            </div>
            <div>
              <span class="text-2xl font-black text-slate-900 block leading-tight">{{ stats.total_surat || 0 }}</span>
              <span class="text-xs font-bold text-slate-500">Total Arsip Surat</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:border-emerald-300 transition-all flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <ShoppingBag class="w-6 h-6" />
            </div>
            <div>
              <span class="text-2xl font-black text-slate-900 block leading-tight">{{ stats.total_umkm || 0 }}</span>
              <span class="text-xs font-bold text-slate-500">Produk UMKM Terdaftar</span>
            </div>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:border-purple-300 transition-all flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/60">
              <MessageSquare class="w-6 h-6" />
            </div>
            <div>
              <span class="text-2xl font-black text-slate-900 block leading-tight">{{ stats.pesan_baru || 0 }}</span>
              <span class="text-xs font-bold text-slate-500">Pesan Aspirasi Baru</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Pill style matching layanan.vue) -->
      <div class="flex justify-start mb-6 overflow-x-auto pb-2">
        <div class="inline-flex p-1.5 rounded-full bg-slate-200/70 border border-slate-300/80 shadow-inner gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200"
            :class="activeTab === tab.id
              ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/25'
              : 'text-slate-600 hover:text-emerald-900'"
            @click="activeTab = (tab.id as any)"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-extrabold"
              :class="activeTab === tab.id ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-300/70 text-slate-700'"
            >
              {{
                tab.id === 'surat' ? suratList.length :
                tab.id === 'umkm' ? umkmList.length :
                tab.id === 'pengumuman' ? pengumumanList.length : pesanList.length
              }}
            </span>
          </button>
        </div>
      </div>

      <!-- TAB 1: PENGAJUAN SURAT -->
      <div v-if="activeTab === 'surat'" class="space-y-4">
        <!-- Filter and Search controls -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="suratSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
              placeholder="Cari NIK, Nama, Ref, Jenis..."
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              v-model="suratStatusFilter"
              class="px-3 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-800/20"
            >
              <option value="Semua">Semua Status</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">No. Ref</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pemohon / NIK</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Jenis Dokumen</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Status & Aksi Cepat</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Tgl Pengajuan</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="s in filteredSurat"
                  :key="s.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4">
                    <span class="font-mono text-xs font-bold text-slate-700 block">{{ s.ref_number || s.refNumber }}</span>
                    <span class="text-[10px] text-slate-400">ID: #{{ s.id }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="font-bold text-slate-900 text-sm">{{ s.nama }}</div>
                    <div class="text-xs text-slate-500 font-mono">NIK: {{ s.nik }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="inline-block text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {{ s.jenis_surat || s.jenisSurat }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <select
                      :value="s.status"
                      class="text-xs px-3 py-1.5 rounded-xl border font-bold outline-none cursor-pointer transition-all"
                      :class="s.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : s.status === 'Diproses' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-amber-50 text-amber-800 border-amber-300'"
                      @change="updateSuratStatus(s.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="Diajukan">Diajukan</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </td>
                  <td class="px-5 py-4 text-xs text-slate-500">
                    {{ formatTanggal(s.created_at || s.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        @click="openDetailModal('surat', s)"
                        title="Lihat Detail Permohonan"
                      >
                        <Eye class="w-4 h-4" />
                      </button>
                      <button
                        v-if="s.status === 'Selesai'"
                        @click="downloadSurat(s.id)"
                        title="Cetak & Download Dokumen Word (.docx)"
                        class="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                      >
                        <Printer class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="!filteredSurat.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText class="w-6 h-6" />
              </div>
              <h3 class="font-bold text-slate-800 text-sm">Tidak ada permohonan surat</h3>
              <p class="text-xs text-slate-500 mt-1">Belum ada pengajuan surat yang sesuai dengan kata kunci atau filter status.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: PRODUK UMKM -->
      <div v-if="activeTab === 'umkm'" class="space-y-4">
        <!-- Controls -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="umkmSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
              placeholder="Cari produk, kategori, pemilik..."
            />
          </div>

          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all w-full sm:w-auto justify-center"
            @click="openAddModal('umkm')"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Produk UMKM</span>
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Nama Produk</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pemilik / Kontak</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="u in filteredUmkm"
                  :key="u.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4">
                    <div class="font-bold text-slate-900 text-sm">{{ u.nama_produk || u.namaProduk }}</div>
                    <div class="text-xs text-slate-400 line-clamp-1 max-w-sm">{{ u.deskripsi }}</div>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/60">
                      {{ u.kategori }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-sm font-black text-emerald-800">
                    {{ formatRupiah(u.harga) }}
                  </td>
                  <td class="px-5 py-4 text-xs">
                    <div class="font-bold text-slate-800">{{ u.pemilik }}</div>
                    <div class="font-mono text-slate-400">{{ u.no_wa_pemilik || u.noWaPemilik || '-' }}</div>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        @click="openEditModal('umkm', u)"
                        title="Edit Produk"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                        @click="handleDelete('umkm', u.id)"
                        title="Hapus Produk"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredUmkm.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag class="w-6 h-6" />
              </div>
              <h3 class="font-bold text-slate-800 text-sm">Belum ada produk UMKM</h3>
              <p class="text-xs text-slate-500 mt-1">Tambahkan produk kerajinan atau kuliner warga desa melalui tombol di atas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PENGUMUMAN -->
      <div v-if="activeTab === 'pengumuman'" class="space-y-4">
        <!-- Controls -->
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="pengumumanSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
              placeholder="Cari judul atau isi pengumuman..."
            />
          </div>

          <button
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all w-full sm:w-auto justify-center"
            @click="openAddModal('pengumuman')"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Warta / Pengumuman</span>
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Judul Pengumuman</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Tanggal Agenda</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Isi Ringkas</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="p in filteredPengumuman"
                  :key="p.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 font-bold text-slate-900 text-sm max-w-xs">
                    {{ p.judul }}
                  </td>
                  <td class="px-5 py-4 text-xs font-semibold text-emerald-800 whitespace-nowrap">
                    {{ formatTanggal(p.tanggal) }}
                  </td>
                  <td class="px-5 py-4 text-xs text-slate-500 line-clamp-2 max-w-md">
                    {{ p.konten }}
                  </td>
                  <td class="px-5 py-4 text-right whitespace-nowrap">
                    <div class="inline-flex items-center gap-1.5">
                      <button
                        class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        @click="openEditModal('pengumuman', p)"
                        title="Edit Pengumuman"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>
                      <button
                        class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                        @click="handleDelete('pengumuman', p.id)"
                        title="Hapus Pengumuman"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredPengumuman.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Newspaper class="w-6 h-6" />
              </div>
              <h3 class="font-bold text-slate-800 text-sm">Belum ada pengumuman</h3>
              <p class="text-xs text-slate-500 mt-1">Publikasikan informasi atau agenda desa terbaru melalui tombol di atas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PESAN MASUK -->
      <div v-if="activeTab === 'pesan'" class="space-y-4">
        <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="pesanSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
              placeholder="Cari nama pengirim, kontak, isi..."
            />
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Nama Warga</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Kontak (HP/Email)</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Isi Pesan / Aspirasi</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Tanggal Masuk</th>
                  <th class="px-5 py-3.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">Detail</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="m in filteredPesan"
                  :key="m.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 font-bold text-slate-900 text-sm">
                    {{ m.nama }}
                  </td>
                  <td class="px-5 py-4 text-xs font-mono text-emerald-800">
                    {{ m.kontak }}
                  </td>
                  <td class="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                    {{ m.pesan }}
                  </td>
                  <td class="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {{ formatTanggal(m.created_at || m.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <button
                      class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      @click="openDetailModal('pesan', m)"
                      title="Lihat Isi Pesan Lengkap"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredPesan.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare class="w-6 h-6" />
              </div>
              <h3 class="font-bold text-slate-800 text-sm">Tidak ada pesan masuk</h3>
              <p class="text-xs text-slate-500 mt-1">Aspirasi atau masukan dari warga akan ditampilkan pada daftar ini.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Global Modal Dialog (Add, Edit, Detail) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showModal = false"
        >
          <div class="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 class="font-black text-slate-900 text-base">
                {{ modalMode === 'detail' ? 'Rincian Data' : modalMode === 'add' ? 'Tambah Data Baru' : 'Edit Data' }}
                {{ modalType === 'pengumuman' ? 'Pengumuman' : modalType === 'umkm' ? 'Produk UMKM' : modalType === 'surat' ? 'Surat Permohonan' : 'Pesan Warga' }}
              </h3>
              <button
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                @click="showModal = false"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="px-6 py-6">
              <!-- Detail Surat -->
              <div v-if="modalMode === 'detail' && modalType === 'surat'" class="space-y-3 text-xs">
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Nomor Referensi</span>
                  <span class="font-mono font-bold text-slate-900">{{ modalData.ref_number || modalData.refNumber }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Nama Pemohon</span>
                  <span class="font-bold text-slate-900">{{ modalData.nama }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">NIK</span>
                  <span class="font-mono text-slate-800">{{ modalData.nik }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Nomor KK</span>
                  <span class="font-mono text-slate-800">{{ modalData.no_kk || modalData.noKk }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Jenis Dokumen</span>
                  <span class="font-bold text-emerald-800">{{ modalData.jenis_surat || modalData.jenisSurat }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Nomor WhatsApp</span>
                  <span class="font-mono text-slate-800">{{ modalData.no_wa || modalData.noWa }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Status Permohonan</span>
                  <span :class="[getStatusColor(modalData.status), 'px-3 py-1 rounded-full text-xs font-extrabold']">
                    {{ modalData.status }}
                  </span>
                </div>
                <div class="py-2">
                  <span class="text-slate-500 font-medium block mb-1">Keperluan Pembuatan:</span>
                  <p class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {{ modalData.keperluan }}
                  </p>
                </div>

                <div v-if="modalData.status === 'Selesai'" class="pt-3">
                  <button
                    class="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                    @click="downloadSurat(modalData.id)"
                  >
                    <Download class="w-4 h-4" />
                    <span>Cetak / Download File Word (.docx)</span>
                  </button>
                </div>
              </div>

              <!-- Detail Pesan -->
              <div v-if="modalMode === 'detail' && modalType === 'pesan'" class="space-y-3 text-xs">
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Nama Pengirim</span>
                  <span class="font-bold text-slate-900">{{ modalData.nama }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Kontak</span>
                  <span class="font-mono text-emerald-800 font-bold">{{ modalData.kontak }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-slate-100">
                  <span class="text-slate-500 font-medium">Tanggal Diterima</span>
                  <span class="text-slate-700">{{ formatTanggal(modalData.created_at || modalData.createdAt) }}</span>
                </div>
                <div class="py-2">
                  <span class="text-slate-500 font-medium block mb-1">Isi Pesan / Aspirasi:</span>
                  <p class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {{ modalData.pesan }}
                  </p>
                </div>
              </div>

              <!-- Pengumuman Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'pengumuman'" @submit.prevent="handleModalSubmit" class="space-y-4">
                <div v-if="modalError" class="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{{ modalError }}</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Judul Warta / Pengumuman</label>
                  <input
                    v-model="modalData.judul"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                    placeholder="Contoh: Jadwal Pelayanan Administrasi Desa..."
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Agenda</label>
                  <input
                    v-model="modalData.tanggal"
                    type="date"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Konten Pengumuman Lengkap</label>
                  <textarea
                    v-model="modalData.konten"
                    rows="5"
                    class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none resize-y"
                    placeholder="Tuliskan isi pengumuman secara rinci..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  :disabled="modalLoading"
                  class="w-full py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Loader2 v-if="modalLoading" class="w-4 h-4 animate-spin" />
                  <span>{{ modalLoading ? 'Menyimpan...' : 'Simpan Pengumuman' }}</span>
                </button>
              </form>

              <!-- UMKM Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'umkm'" @submit.prevent="handleModalSubmit" class="space-y-4">
                <div v-if="modalError" class="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{{ modalError }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Produk</label>
                    <input
                      v-model="modalData.nama_produk"
                      type="text"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                      placeholder="Nama produk UMKM"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Harga (Rp)</label>
                    <input
                      v-model.number="modalData.harga"
                      type="number"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                      placeholder="Contoh: 25000"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Kategori Produk</label>
                  <select
                    v-model="modalData.kategori"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-800/20"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Hasil Tani">Hasil Tani</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Produk</label>
                  <textarea
                    v-model="modalData.deskripsi"
                    rows="3"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none resize-y"
                    placeholder="Keunggulan atau bahan produk..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Produsen / Pemilik</label>
                    <input
                      v-model="modalData.pemilik"
                      type="text"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                      placeholder="Nama pemilik usaha"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1.5">No. WhatsApp Pemilik</label>
                    <input
                      v-model="modalData.no_wa_pemilik"
                      type="text"
                      class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none"
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1.5">Foto Produk (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                    @change="handleFotoChange"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="modalLoading"
                  class="w-full py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Loader2 v-if="modalLoading" class="w-4 h-4 animate-spin" />
                  <span>{{ modalLoading ? 'Menyimpan...' : 'Simpan Produk UMKM' }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

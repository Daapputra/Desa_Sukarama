<script setup lang="ts">
import {
  FileText, ShoppingBag, Newspaper, MessageSquare,
  Plus, Pencil, Trash2, Eye, AlertCircle, X, Printer, Search,
  Clock, Loader2, Download, LayoutDashboard, MoreVertical
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

// Verify auth first, and only load data once the session is confirmed valid —
// otherwise an expired token still fires every list request (all 401) and the
// admin UI renders real-looking empty state while the redirect is in flight.
onMounted(async () => {
  const valid = await verify()
  if (!valid) {
    router.push('/admin')
    return
  }
  loadAll()
})

// Stats & active tab
const stats = ref<any>(null)
const activeTab = ref<'ringkasan' | 'surat' | 'umkm' | 'pengumuman' | 'pesan'>('ringkasan')

// Live clock — real current time, ticks every second while the page is open
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
})
onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})
const formattedDate = computed(() =>
  now.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)
const formattedTime = computed(() =>
  now.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)

const tabs = computed(() => [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'surat', label: 'Pengajuan Surat', icon: FileText, count: suratList.value.length },
  { id: 'umkm', label: 'Produk UMKM', icon: ShoppingBag, count: umkmList.value.length },
  { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper, count: pengumumanList.value.length },
  { id: 'pesan', label: 'Pesan Masuk', icon: MessageSquare, count: pesanList.value.length },
])

const tabMeta: Record<string, { title: string; desc: string }> = {
  ringkasan: {
    title: 'Ringkasan Pelayanan Desa',
    desc: 'Pantau permohonan surat masuk, direktori produk warga, dan komunikasi aspirasi publik.',
  },
  surat: { title: 'Pengajuan Surat', desc: 'Kelola permohonan surat masuk dari warga.' },
  umkm: { title: 'Produk UMKM', desc: 'Kelola direktori produk usaha warga desa.' },
  pengumuman: { title: 'Pengumuman', desc: 'Kelola warta dan agenda desa.' },
  pesan: { title: 'Pesan Masuk', desc: 'Aspirasi dan masukan warga.' },
}
const activeTabLabel = computed(() => tabMeta[activeTab.value]?.title || '')
const activeTabDescription = computed(() => tabMeta[activeTab.value]?.desc || '')

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

// Transient error banner — replaces blocking native alert() so a failed request
// never freezes the page, and the message matches the rest of the admin styling.
const errorToast = ref('')
let errorToastTimer: ReturnType<typeof setTimeout> | undefined
function showError(message: string) {
  errorToast.value = message
  if (errorToastTimer) clearTimeout(errorToastTimer)
  errorToastTimer = setTimeout(() => { errorToast.value = '' }, 6000)
}
onBeforeUnmount(() => {
  if (errorToastTimer) clearTimeout(errorToastTimer)
})

const showLogoutConfirm = ref(false)

async function handleLogout() {
  showLogoutConfirm.value = false
  await logout()
  router.push('/admin')
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

// Ringkasan (Overview) widgets — pure client-side derivations of already-fetched lists, no new API calls
const recentSurat = computed(() =>
  [...suratList.value]
    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
    .slice(0, 5)
)

const recentPesan = computed(() =>
  [...pesanList.value]
    .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime())
    .slice(0, 5)
)

const umkmByKategori = computed(() => {
  const counts: Record<string, number> = {}
  for (const u of umkmList.value) {
    const k = u.kategori || 'Lainnya'
    counts[k] = (counts[k] || 0) + 1
  }
  return Object.entries(counts).map(([label, count]) => ({ label, count }))
})

// Status update for surat
async function updateSuratStatus(id: number, status: string) {
  try {
    await apiPut(`/api/surat/${id}/status`, { status })
  } catch (err: any) {
    showError(err.message || 'Gagal memperbarui status surat')
  } finally {
    // Reload on both paths: on failure the dropdown would otherwise keep showing
    // the status the admin picked while the database still holds the old one.
    await loadAll()
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
  // Copy, not the row reference — a background loadAll() replaces the list rows
  // and would otherwise leave the open modal pointing at a detached object.
  modalData.value = { ...data }
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

type DeleteTarget = { type: 'pengumuman' | 'umkm'; id: number }

// `deleteTarget` drives the dialog's visibility, so closing the dialog clears it.
// The confirm button's click and the dialog's own close both fire on the same
// element, and their order isn't guaranteed — if the close ran first the delete
// would silently no-op. `pendingDelete` is kept outside that reactive state so
// the handler always sees the record it was opened for.
const deleteTarget = ref<DeleteTarget | null>(null)
let pendingDelete: DeleteTarget | null = null

function requestDelete(type: 'pengumuman' | 'umkm', id: number) {
  pendingDelete = { type, id }
  deleteTarget.value = { type, id }
}

async function handleDelete() {
  const target = pendingDelete
  pendingDelete = null
  deleteTarget.value = null
  if (!target) return
  try {
    if (target.type === 'pengumuman') await apiDelete(`/api/pengumuman/${target.id}`)
    else await apiDelete(`/api/umkm/${target.id}`)
  } catch (err: any) {
    showError(err.message || 'Gagal menghapus data')
  } finally {
    await loadAll()
  }
}

// Nomor surat prompt — an in-app dialog rather than window.prompt(), which blocks
// the page and can't be styled (and is suppressed outright in some browsers).
const downloadTargetId = ref<number | null>(null)
const nomorSurat = ref('')

function downloadSurat(id: number) {
  nomorSurat.value = ''
  downloadTargetId.value = id
}

function confirmDownloadSurat() {
  const id = downloadTargetId.value
  if (id === null) return
  const nomor = nomorSurat.value.trim()
  downloadTargetId.value = null

  const url = new URL(`${apiBase}/api/surat/${id}/download-surat`)
  if (nomor) {
    url.searchParams.set('nomor_surat', nomor)
  }
  window.open(url.toString(), '_blank')
}
</script>

<template>
  <SidebarProvider>
    <AdminSidebar
      :tabs="tabs"
      :active-tab="activeTab"
      :username="adminUsername || ''"
      @update:active-tab="activeTab = ($event as any)"
      @logout="showLogoutConfirm = true"
    />

    <SidebarInset class="bg-slate-50/70">
      <!-- Mobile-only slim topbar -->
      <header class="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-14 flex items-center justify-between px-4">
        <SidebarTrigger class="text-slate-700" />
        <span class="font-semibold text-slate-900 text-sm">{{ activeTabLabel }}</span>
        <div class="w-9 h-9"></div>
      </header>

      <!-- Main Content Area -->
      <div class="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {{ activeTabLabel }}
            </h1>
            <p class="text-xs text-slate-500 mt-1">
              {{ activeTabDescription }}
            </p>
          </div>
          <div class="hidden md:flex flex-col items-end leading-tight self-start sm:self-auto">
            <span class="text-sm font-semibold text-slate-700 tabular-nums">{{ formattedTime }}</span>
            <span class="text-[11px] text-slate-400">{{ formattedDate }}</span>
          </div>
        </div>

        <!-- TAB 0: RINGKASAN -->
        <div v-if="activeTab === 'ringkasan'" class="space-y-6">
          <!-- Stat grid — hairline dividers instead of separate shadowed cards, one flat surface -->
          <div v-if="stats" class="grid grid-cols-2 xl:grid-cols-4 gap-px bg-slate-200/80 border border-slate-200/80 rounded-xl overflow-hidden">
            <div class="bg-white p-5">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Surat Baru</span>
                <Clock class="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span class="text-3xl font-semibold text-slate-900 tabular-nums">{{ (stats.surat_baru || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="bg-white p-5">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Surat</span>
                <FileText class="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span class="text-3xl font-semibold text-slate-900 tabular-nums">{{ (stats.total_surat || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="bg-white p-5">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Produk UMKM</span>
                <ShoppingBag class="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span class="text-3xl font-semibold text-slate-900 tabular-nums">{{ (stats.total_umkm || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="bg-white p-5">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pesan Masuk</span>
                <MessageSquare class="w-3.5 h-3.5 text-slate-300" />
              </div>
              <span class="text-3xl font-semibold text-slate-900 tabular-nums">{{ (stats.pesan_baru || 0).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <!-- Status breakdown of surat — legend row, color used only as a meaning-carrying dot -->
          <div class="bg-white rounded-xl border border-slate-200/80 p-5">
            <h2 class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-4">Status Pengajuan Surat</h2>
            <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span class="text-sm text-slate-600">Diajukan</span>
                <span class="text-sm font-semibold text-slate-900 tabular-nums">{{ stats?.surat_baru || 0 }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                <span class="text-sm text-slate-600">Diproses</span>
                <span class="text-sm font-semibold text-slate-900 tabular-nums">{{ stats?.surat_proses || 0 }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span class="text-sm text-slate-600">Selesai</span>
                <span class="text-sm font-semibold text-slate-900 tabular-nums">{{ stats?.surat_selesai || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Recent surat / recent pesan -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl border border-slate-200/80 p-5">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pengajuan Surat Terbaru</h2>
                <button class="text-xs font-medium text-emerald-700 hover:text-emerald-800" @click="activeTab = 'surat'">Lihat semua</button>
              </div>
              <ul class="divide-y divide-slate-100">
                <li v-for="s in recentSurat" :key="s.id" class="py-3 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium text-slate-900 text-xs truncate">{{ s.nama }}</p>
                    <p class="text-[11px] text-slate-400">{{ s.jenisSurat || s.jenis_surat }} · {{ formatTanggal(s.createdAt || s.created_at) }}</p>
                  </div>
                  <Badge :class="[getStatusColor(s.status), 'rounded-md text-[10px] font-semibold shrink-0']">{{ s.status }}</Badge>
                </li>
                <li v-if="!recentSurat.length" class="py-6 text-center text-xs text-slate-400">Belum ada pengajuan surat.</li>
              </ul>
            </div>

            <div class="bg-white rounded-xl border border-slate-200/80 p-5">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pesan Terbaru</h2>
                <button class="text-xs font-medium text-emerald-700 hover:text-emerald-800" @click="activeTab = 'pesan'">Lihat semua</button>
              </div>
              <ul class="divide-y divide-slate-100">
                <li v-for="m in recentPesan" :key="m.id" class="py-3">
                  <p class="font-medium text-slate-900 text-xs">{{ m.nama }}</p>
                  <p class="text-[11px] text-slate-500 truncate">{{ m.pesan }}</p>
                </li>
                <li v-if="!recentPesan.length" class="py-6 text-center text-xs text-slate-400">Tidak ada pesan baru.</li>
              </ul>
            </div>
          </div>

          <!-- UMKM by kategori -->
          <div class="bg-white rounded-xl border border-slate-200/80 p-5">
            <h2 class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-4">Produk UMKM per Kategori</h2>
            <div v-if="umkmByKategori.length" class="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200/80 border border-slate-200/80 rounded-lg overflow-hidden">
              <div v-for="k in umkmByKategori" :key="k.label" class="text-center py-3 bg-white">
                <span class="text-lg font-semibold text-slate-900 block tabular-nums">{{ k.count }}</span>
                <span class="text-[11px] text-slate-500">{{ k.label }}</span>
              </div>
            </div>
            <p v-else class="text-center text-xs text-slate-400 py-4">Belum ada produk UMKM terdaftar.</p>
          </div>
        </div>

        <!-- TAB 1: PENGAJUAN SURAT -->
      <div v-if="activeTab === 'surat'" class="space-y-4">
        <!-- Filter and Search controls -->
        <div class="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              v-model="suratSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 h-auto rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
              placeholder="Cari NIK, Nama, Ref, Jenis..."
            />
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-sm font-medium text-slate-500 whitespace-nowrap">Status:</span>
            <Select v-model="suratStatusFilter">
              <SelectTrigger class="rounded-lg border-slate-200 text-sm font-medium text-slate-700 h-auto py-2.5 w-full sm:w-40">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="Diajukan">Diajukan</SelectItem>
                <SelectItem value="Diproses">Diproses</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[900px] text-left table-fixed">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="w-[15%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Ref</th>
                  <th class="w-[23%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemohon / NIK</th>
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Dokumen</th>
                  <th class="w-[18%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Aksi Cepat</th>
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tgl Pengajuan</th>
                  <th class="w-[12%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="s in filteredSurat"
                  :key="s.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 truncate">
                    <span class="font-mono text-sm font-medium text-slate-700 block truncate">{{ s.ref_number || s.refNumber }}</span>
                    <span class="text-[10px] text-slate-400">ID: #{{ s.id }}</span>
                  </td>
                  <td class="px-5 py-4 truncate">
                    <div class="font-medium text-slate-900 text-sm truncate">{{ s.nama }}</div>
                    <div class="text-sm text-slate-500 font-mono truncate">NIK: {{ s.nik }}</div>
                  </td>
                  <td class="px-5 py-4 truncate">
                    <span class="inline-block max-w-full truncate text-sm font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {{ s.jenis_surat || s.jenisSurat }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <Select :model-value="s.status" @update:model-value="updateSuratStatus(s.id, $event as string)">
                      <SelectTrigger
                        class="text-sm px-3 py-1.5 h-auto rounded-lg border font-medium w-auto"
                        :class="s.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : s.status === 'Diproses' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-amber-50 text-amber-800 border-amber-300'"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diajukan">Diajukan</SelectItem>
                        <SelectItem value="Diproses">Diproses</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-500">
                    {{ formatTanggal(s.created_at || s.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="rounded-lg text-slate-600 hover:text-slate-900 h-8 w-8">
                          <MoreVertical class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="openDetailModal('surat', s)">
                          <Eye class="w-3.5 h-3.5" />
                          <span>Lihat Detail Permohonan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem v-if="s.status === 'Selesai'" @click="downloadSurat(s.id)">
                          <Printer class="w-3.5 h-3.5" />
                          <span>Cetak & Download (.docx)</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="!filteredSurat.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-slate-800 text-sm">Tidak ada permohonan surat</h3>
              <p class="text-xs text-slate-500 mt-1">Belum ada pengajuan surat yang sesuai dengan kata kunci atau filter status.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: PRODUK UMKM -->
      <div v-if="activeTab === 'umkm'" class="space-y-4">
        <!-- Controls -->
        <div class="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              v-model="umkmSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 h-auto rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
              placeholder="Cari produk, kategori, pemilik..."
            />
          </div>

          <Button
            class="rounded-lg bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm h-auto px-4 py-2.5 w-full sm:w-auto"
            @click="openAddModal('umkm')"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Produk UMKM</span>
          </Button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[820px] text-left table-fixed">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="w-[34%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Produk</th>
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th class="w-[22%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pemilik / Kontak</th>
                  <th class="w-[12%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="u in filteredUmkm"
                  :key="u.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 truncate">
                    <div class="font-medium text-slate-900 text-sm truncate">{{ u.nama_produk || u.namaProduk }}</div>
                    <div class="text-sm text-slate-400 truncate">{{ u.deskripsi }}</div>
                  </td>
                  <td class="px-5 py-4 truncate">
                    <Badge class="rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border-emerald-200/60 hover:bg-emerald-50">
                      {{ u.kategori }}
                    </Badge>
                  </td>
                  <td class="px-5 py-4 text-sm font-semibold text-emerald-800 truncate">
                    {{ formatRupiah(u.harga) }}
                  </td>
                  <td class="px-5 py-4 text-sm truncate">
                    <div class="font-medium text-slate-800 truncate">{{ u.pemilik }}</div>
                    <div class="font-mono text-slate-400 truncate">{{ u.no_wa_pemilik || u.noWaPemilik || '-' }}</div>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="rounded-lg text-slate-600 hover:text-slate-900 h-8 w-8">
                          <MoreVertical class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="openEditModal('umkm', u)">
                          <Pencil class="w-3.5 h-3.5" />
                          <span>Edit Produk</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" @click="requestDelete('umkm', u.id)">
                          <Trash2 class="w-3.5 h-3.5" />
                          <span>Hapus Produk</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredUmkm.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-slate-800 text-sm">Belum ada produk UMKM</h3>
              <p class="text-xs text-slate-500 mt-1">Tambahkan produk kerajinan atau kuliner warga desa melalui tombol di atas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PENGUMUMAN -->
      <div v-if="activeTab === 'pengumuman'" class="space-y-4">
        <!-- Controls -->
        <div class="bg-white rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              v-model="pengumumanSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 h-auto rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
              placeholder="Cari judul atau isi pengumuman..."
            />
          </div>

          <Button
            class="rounded-lg bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm h-auto px-4 py-2.5 w-full sm:w-auto"
            @click="openAddModal('pengumuman')"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Warta / Pengumuman</span>
          </Button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[760px] text-left table-fixed">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="w-[22%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Judul Pengumuman</th>
                  <th class="w-[14%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Agenda</th>
                  <th class="w-[52%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Isi Ringkas</th>
                  <th class="w-[12%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="p in filteredPengumuman"
                  :key="p.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 font-medium text-slate-900 text-sm truncate">
                    {{ p.judul }}
                  </td>
                  <td class="px-5 py-4 text-sm font-semibold text-emerald-800 whitespace-nowrap">
                    {{ formatTanggal(p.tanggal) }}
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-500 line-clamp-2">
                    {{ p.konten }}
                  </td>
                  <td class="px-5 py-4 text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="rounded-lg text-slate-600 hover:text-slate-900 h-8 w-8">
                          <MoreVertical class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="openEditModal('pengumuman', p)">
                          <Pencil class="w-3.5 h-3.5" />
                          <span>Edit Pengumuman</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" @click="requestDelete('pengumuman', p.id)">
                          <Trash2 class="w-3.5 h-3.5" />
                          <span>Hapus Pengumuman</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!filteredPengumuman.length" class="text-center py-16 px-4">
              <div class="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Newspaper class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-slate-800 text-sm">Belum ada pengumuman</h3>
              <p class="text-xs text-slate-500 mt-1">Publikasikan informasi atau agenda desa terbaru melalui tombol di atas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PESAN MASUK -->
      <div v-if="activeTab === 'pesan'" class="space-y-4">
        <div class="bg-white rounded-xl p-4 border border-slate-200/80 flex justify-between items-center">
          <div class="relative w-full sm:w-80">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <Input
              v-model="pesanSearch"
              type="text"
              class="w-full pl-10 pr-4 py-2.5 h-auto rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
              placeholder="Cari nama pengirim, kontak, isi..."
            />
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[820px] text-left table-fixed">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/70">
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Warga</th>
                  <th class="w-[18%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kontak (HP/Email)</th>
                  <th class="w-[40%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Isi Pesan / Aspirasi</th>
                  <th class="w-[16%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Masuk</th>
                  <th class="w-[10%] px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Detail</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="m in filteredPesan"
                  :key="m.id"
                  class="hover:bg-slate-50/60 transition-colors"
                >
                  <td class="px-5 py-4 font-medium text-slate-900 text-sm truncate">
                    {{ m.nama }}
                  </td>
                  <td class="px-5 py-4 text-sm font-mono text-emerald-800 truncate">
                    {{ m.kontak }}
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-600 truncate">
                    {{ m.pesan }}
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-400 whitespace-nowrap">
                    {{ formatTanggal(m.created_at || m.createdAt) }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <button
                      class="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
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
              <div class="w-12 h-12 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-slate-800 text-sm">Tidak ada pesan masuk</h3>
              <p class="text-xs text-slate-500 mt-1">Aspirasi atau masukan dari warga akan ditampilkan pada daftar ini.</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </SidebarInset>

    <!-- Global Modal Dialog (Add, Edit, Detail) -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent :show-close-button="false" class="max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-0 gap-0 border border-slate-200 shadow-2xl">
        <!-- Modal Header -->
        <DialogHeader class="flex-row items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <DialogTitle class="font-semibold text-slate-900 text-base">
            {{ modalMode === 'detail' ? 'Rincian Data' : modalMode === 'add' ? 'Tambah Data Baru' : 'Edit Data' }}
            {{ modalType === 'pengumuman' ? 'Pengumuman' : modalType === 'umkm' ? 'Produk UMKM' : modalType === 'surat' ? 'Surat Permohonan' : 'Pesan Warga' }}
          </DialogTitle>
          <button
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
            @click="showModal = false"
          >
            <X class="w-4 h-4" />
          </button>
        </DialogHeader>

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
                  <Badge :class="[getStatusColor(modalData.status), 'rounded-md text-xs font-extrabold']">
                    {{ modalData.status }}
                  </Badge>
                </div>
                <div class="py-2">
                  <span class="text-slate-500 font-medium block mb-1">Keperluan Pembuatan:</span>
                  <p class="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {{ modalData.keperluan }}
                  </p>
                </div>

                <div v-if="modalData.status === 'Selesai'" class="pt-3">
                  <button
                    class="w-full py-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
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
                  <p class="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {{ modalData.pesan }}
                  </p>
                </div>
              </div>

              <!-- Pengumuman Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'pengumuman'" @submit.prevent="handleModalSubmit" class="space-y-4">
                <div v-if="modalError" class="flex items-center gap-2 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{{ modalError }}</span>
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Judul Warta / Pengumuman</Label>
                  <Input
                    v-model="modalData.judul"
                    type="text"
                    class="w-full h-auto px-4 py-2.5 rounded-xl border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                    placeholder="Contoh: Jadwal Pelayanan Administrasi Desa..."
                  />
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Agenda</Label>
                  <Input
                    v-model="modalData.tanggal"
                    type="date"
                    class="w-full h-auto px-4 py-2.5 rounded-xl border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                  />
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Konten Pengumuman Lengkap</Label>
                  <Textarea
                    v-model="modalData.konten"
                    rows="5"
                    class="w-full px-4 py-2.5 rounded-xl border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800 resize-y"
                    placeholder="Tuliskan isi pengumuman secara rinci..."
                  />
                </div>

                <Button
                  type="submit"
                  :disabled="modalLoading"
                  class="w-full h-auto py-3.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  <Loader2 v-if="modalLoading" class="w-4 h-4 animate-spin" />
                  <span>{{ modalLoading ? 'Menyimpan...' : 'Simpan Pengumuman' }}</span>
                </Button>
              </form>

              <!-- UMKM Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'umkm'" @submit.prevent="handleModalSubmit" class="space-y-4">
                <div v-if="modalError" class="flex items-center gap-2 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{{ modalError }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Produk</Label>
                    <Input
                      v-model="modalData.nama_produk"
                      type="text"
                      class="w-full h-auto px-3.5 py-2.5 rounded-xl border-slate-200 text-xs focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                      placeholder="Nama produk UMKM"
                    />
                  </div>
                  <div>
                    <Label class="block text-xs font-bold text-slate-700 mb-1.5">Harga (Rp)</Label>
                    <Input
                      v-model.number="modalData.harga"
                      type="number"
                      class="w-full h-auto px-3.5 py-2.5 rounded-xl border-slate-200 text-xs focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                      placeholder="Contoh: 25000"
                    />
                  </div>
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Kategori Produk</Label>
                  <Select v-model="modalData.kategori">
                    <SelectTrigger class="w-full h-auto px-3.5 py-2.5 rounded-xl border-slate-200 text-xs font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Makanan">Makanan</SelectItem>
                      <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                      <SelectItem value="Hasil Tani">Hasil Tani</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Produk</Label>
                  <Textarea
                    v-model="modalData.deskripsi"
                    rows="3"
                    class="w-full px-3.5 py-2.5 rounded-xl border-slate-200 text-xs focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800 resize-y"
                    placeholder="Keunggulan atau bahan produk..."
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label class="block text-xs font-bold text-slate-700 mb-1.5">Nama Produsen / Pemilik</Label>
                    <Input
                      v-model="modalData.pemilik"
                      type="text"
                      class="w-full h-auto px-3.5 py-2.5 rounded-xl border-slate-200 text-xs focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                      placeholder="Nama pemilik usaha"
                    />
                  </div>
                  <div>
                    <Label class="block text-xs font-bold text-slate-700 mb-1.5">No. WhatsApp Pemilik</Label>
                    <Input
                      v-model="modalData.no_wa_pemilik"
                      type="text"
                      class="w-full h-auto px-3.5 py-2.5 rounded-xl border-slate-200 text-xs focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>

                <div>
                  <Label class="block text-xs font-bold text-slate-700 mb-1.5">Foto Produk (Opsional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    class="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                    @change="handleFotoChange"
                  />
                </div>

                <Button
                  type="submit"
                  :disabled="modalLoading"
                  class="w-full h-auto py-3.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
                >
                  <Loader2 v-if="modalLoading" class="w-4 h-4 animate-spin" />
                  <span>{{ modalLoading ? 'Menyimpan...' : 'Simpan Produk UMKM' }}</span>
                </Button>
              </form>
            </div>
      </DialogContent>
    </Dialog>

    <!-- Logout confirmation -->
    <AlertDialog :open="showLogoutConfirm" @update:open="showLogoutConfirm = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari Panel Admin?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda perlu login kembali untuk mengakses dashboard administrasi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction class="bg-rose-600 hover:bg-rose-700 text-white" @click="handleLogout">
            Ya, Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Delete confirmation (UMKM / Pengumuman) -->
    <AlertDialog :open="!!deleteTarget" @update:open="(v) => { if (!v) deleteTarget = null }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Ini?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ deleteTarget?.type === 'umkm' ? 'Produk UMKM' : 'Pengumuman' }} ini akan dihapus secara permanen dan tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction class="bg-rose-600 hover:bg-rose-700 text-white" @click="handleDelete">
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Nomor surat before download -->
    <Dialog :open="downloadTargetId !== null" @update:open="(v) => { if (!v) downloadTargetId = null }">
      <DialogContent class="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle class="font-semibold text-slate-900 text-base">Cetak Surat</DialogTitle>
          <DialogDescription class="text-xs text-slate-500">
            Kosongkan jika ingin memakai nomor referensi bawaan.
          </DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="confirmDownloadSurat">
          <div>
            <Label class="block text-xs font-medium text-slate-700 mb-1.5">Nomor Surat Resmi</Label>
            <Input
              v-model="nomorSurat"
              type="text"
              class="w-full h-auto px-3.5 py-2.5 rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
              placeholder="Contoh: 470/12/DS/2026"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              class="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium h-auto px-4 py-2"
              @click="downloadTargetId = null"
            >
              Batal
            </Button>
            <Button
              type="submit"
              class="rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-semibold h-auto px-4 py-2"
            >
              <Download class="w-4 h-4" />
              <span>Cetak &amp; Download</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Transient error notification -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="errorToast"
        class="fixed bottom-6 right-6 z-50 max-w-sm flex items-start gap-2.5 px-4 py-3 rounded-lg bg-white border border-rose-200 shadow-lg text-rose-800 text-sm"
        role="alert"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
        <span class="flex-1">{{ errorToast }}</span>
        <button
          class="shrink-0 text-rose-400 hover:text-rose-700 transition-colors"
          aria-label="Tutup notifikasi"
          @click="errorToast = ''"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </SidebarProvider>
</template>

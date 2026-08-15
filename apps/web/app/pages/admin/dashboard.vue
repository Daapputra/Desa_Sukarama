<script setup lang="ts">
import {
  FileText, ShoppingBag, Newspaper, MessageSquare, LogOut, ChevronDown,
  Plus, Pencil, Trash2, Eye, AlertCircle, CheckCircle, X, Printer
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard Admin — Desa Sukarama' })

const { isLoggedIn, adminUsername, logout, verify } = useAuth()
const { apiGet, apiPost, apiPut, apiDelete } = useApi()
const router = useRouter()

// Verify auth on mount
onMounted(async () => {
  const valid = await verify()
  if (!valid) router.push('/admin')
})

// Stats
const stats = ref<any>(null)
const activeTab = ref('surat')
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

// Modal
const showModal = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const modalType = ref('')
const modalData = ref<any>({})
const modalLoading = ref(false)
const modalError = ref('')

async function loadAll() {
  try {
    stats.value = await apiGet('/api/admin/stats')
    suratList.value = await apiGet('/api/surat')
    umkmList.value = await apiGet('/api/umkm')
    pengumumanList.value = await apiGet('/api/pengumuman')
    pesanList.value = await apiGet('/api/kontak')
  } catch (err) {
    console.error('Error loading data', err)
  }
}

onMounted(() => loadAll())

async function handleLogout() {
  await logout()
  router.push('/admin')
}

// Status update for surat
async function updateSuratStatus(id: number, status: string) {
  try {
    await apiPut(`/api/surat/${id}/status`, { status })
    await loadAll()
  } catch (err: any) {
    alert(err.message)
  }
}

// CRUD modals
function openAddModal(type: string) {
  modalType.value = type
  modalMode.value = 'add'
  modalData.value = {}
  modalError.value = ''
  showModal.value = true
}

function openEditModal(type: string, data: any) {
  modalType.value = type
  modalMode.value = 'edit'
  modalData.value = { ...data }
  modalError.value = ''
  showModal.value = true
}

function openDetailModal(type: string, data: any) {
  modalType.value = type
  modalMode.value = 'detail'
  modalData.value = data
  showModal.value = true
}

async function handleModalSubmit() {
  modalLoading.value = true
  modalError.value = ''
  try {
    if (modalType.value === 'pengumuman') {
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
      const fd = new FormData()
      fd.append('nama_produk', modalData.value.nama_produk || modalData.value.namaProduk || '')
      fd.append('harga', String(modalData.value.harga || ''))
      fd.append('kategori', modalData.value.kategori || '')
      fd.append('deskripsi', modalData.value.deskripsi || '')
      fd.append('pemilik', modalData.value.pemilik || '')
      fd.append('no_wa_pemilik', modalData.value.no_wa_pemilik || modalData.value.noWaPemilik || '')
      if (modalData.value.fotoFile) fd.append('foto', modalData.value.fotoFile)

      if (modalMode.value === 'add') {
        await apiPost('/api/umkm', fd)
      } else {
        await apiPut(`/api/umkm/${modalData.value.id}`, fd)
      }
    }
    showModal.value = false
    await loadAll()
  } catch (err: any) {
    modalError.value = err.message || 'Gagal menyimpan'
  } finally {
    modalLoading.value = false
  }
}

async function handleDelete(type: string, id: number) {
  if (!confirm('Yakin ingin menghapus data ini?')) return
  try {
    if (type === 'pengumuman') await apiDelete(`/api/pengumuman/${id}`)
    else if (type === 'umkm') await apiDelete(`/api/umkm/${id}`)
    await loadAll()
  } catch (err: any) {
    alert(err.message)
  }
}

function handleFotoChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) modalData.value.fotoFile = input.files[0]
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Top Bar -->
    <div class="bg-white border-b border-border sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center text-white font-extrabold text-xs">
            DS
          </div>
          <div>
            <span class="font-bold text-slate-900 text-sm">Admin Panel</span>
            <span class="text-xs text-muted-foreground ml-2">Desa Sukarama</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs text-muted-foreground hidden sm:inline">{{ adminUsername }}</span>
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
            @click="handleLogout"
          >
            <LogOut class="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div v-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><FileText class="w-5 h-5" /></div>
          <div><div class="text-2xl font-extrabold text-slate-900">{{ stats.surat_baru }}</div><div class="text-xs text-muted-foreground">Surat Baru</div></div>
        </div>
        <div class="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FileText class="w-5 h-5" /></div>
          <div><div class="text-2xl font-extrabold text-slate-900">{{ stats.total_surat }}</div><div class="text-xs text-muted-foreground">Total Surat</div></div>
        </div>
        <div class="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><ShoppingBag class="w-5 h-5" /></div>
          <div><div class="text-2xl font-extrabold text-slate-900">{{ stats.total_umkm }}</div><div class="text-xs text-muted-foreground">Produk UMKM</div></div>
        </div>
        <div class="bg-white rounded-xl border border-border p-5 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><MessageSquare class="w-5 h-5" /></div>
          <div><div class="text-2xl font-extrabold text-slate-900">{{ stats.pesan_baru }}</div><div class="text-xs text-muted-foreground">Pesan Baru</div></div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b-2 border-border mb-6 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 px-4 py-3 text-sm font-semibold -mb-[2px] border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === tab.id
            ? 'text-green-800 border-green-800'
            : 'text-slate-400 border-transparent hover:text-slate-600'"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" /> {{ tab.label }}
        </button>
      </div>

      <!-- Surat Tab -->
      <div v-if="activeTab === 'surat'">
        <div class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="bg-slate-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ref</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Jenis</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Aksi</th>
              </tr></thead>
              <tbody>
                <tr v-for="s in suratList" :key="s.id" class="border-t border-border hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 text-xs font-mono text-slate-600">{{ s.ref_number || s.refNumber }}</td>
                  <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ s.nama }}</td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ s.jenis_surat || s.jenisSurat }}</td>
                  <td class="px-4 py-3">
                    <select
                      :value="s.status"
                      class="text-xs px-2 py-1 rounded-lg border border-border"
                      @change="updateSuratStatus(s.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option>Diajukan</option>
                      <option>Diproses</option>
                      <option>Selesai</option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-400">{{ formatTanggal(s.created_at || s.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" @click="openDetailModal('surat', s)">
                        <Eye class="w-4 h-4" />
                      </button>
                      <a
                        v-if="s.status === 'Selesai'"
                        :href="`http://localhost:3005/api/surat/${s.id}/download-surat`"
                        target="_blank"
                        title="Download Dokumen"
                        class="p-1.5 rounded-lg hover:bg-green-100 text-green-600"
                      >
                        <Printer class="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!suratList.length" class="text-center py-12 text-muted-foreground text-sm">Belum ada pengajuan surat</div>
          </div>
        </div>
      </div>

      <!-- UMKM Tab -->
      <div v-if="activeTab === 'umkm'">
        <div class="flex justify-end mb-4">
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900 text-white text-sm font-semibold hover:bg-green-800 transition-colors" @click="openAddModal('umkm')">
            <Plus class="w-4 h-4" /> Tambah Produk
          </button>
        </div>
        <div class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="bg-slate-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Produk</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kategori</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Harga</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pemilik</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Aksi</th>
              </tr></thead>
              <tbody>
                <tr v-for="u in umkmList" :key="u.id" class="border-t border-border hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ u.nama_produk || u.namaProduk }}</td>
                  <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full bg-green-50 text-green-800 text-[11px] font-semibold">{{ u.kategori }}</span></td>
                  <td class="px-4 py-3 text-sm text-slate-600">{{ formatRupiah(u.harga) }}</td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ u.pemilik }}</td>
                  <td class="px-4 py-3 flex gap-1">
                    <button class="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" @click="openEditModal('umkm', u)"><Pencil class="w-4 h-4" /></button>
                    <button class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" @click="handleDelete('umkm', u.id)"><Trash2 class="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!umkmList.length" class="text-center py-12 text-muted-foreground text-sm">Belum ada produk UMKM</div>
          </div>
        </div>
      </div>

      <!-- Pengumuman Tab -->
      <div v-if="activeTab === 'pengumuman'">
        <div class="flex justify-end mb-4">
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900 text-white text-sm font-semibold hover:bg-green-800 transition-colors" @click="openAddModal('pengumuman')">
            <Plus class="w-4 h-4" /> Tambah Pengumuman
          </button>
        </div>
        <div class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="bg-slate-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Judul</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Aksi</th>
              </tr></thead>
              <tbody>
                <tr v-for="p in pengumumanList" :key="p.id" class="border-t border-border hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ p.judul }}</td>
                  <td class="px-4 py-3 text-xs text-slate-400">{{ formatTanggal(p.tanggal) }}</td>
                  <td class="px-4 py-3 flex gap-1">
                    <button class="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" @click="openEditModal('pengumuman', p)"><Pencil class="w-4 h-4" /></button>
                    <button class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600" @click="handleDelete('pengumuman', p.id)"><Trash2 class="w-4 h-4" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!pengumumanList.length" class="text-center py-12 text-muted-foreground text-sm">Belum ada pengumuman</div>
          </div>
        </div>
      </div>

      <!-- Pesan Tab -->
      <div v-if="activeTab === 'pesan'">
        <div class="bg-white rounded-xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead><tr class="bg-slate-50">
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kontak</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pesan</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
              </tr></thead>
              <tbody>
                <tr v-for="m in pesanList" :key="m.id" class="border-t border-border hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-slate-900 font-medium">{{ m.nama }}</td>
                  <td class="px-4 py-3 text-xs text-slate-500">{{ m.kontak }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{{ m.pesan }}</td>
                  <td class="px-4 py-3 text-xs text-slate-400">{{ formatTanggal(m.created_at || m.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!pesanList.length" class="text-center py-12 text-muted-foreground text-sm">Belum ada pesan masuk</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 class="font-bold text-slate-900">
                {{ modalMode === 'detail' ? 'Detail' : modalMode === 'add' ? 'Tambah' : 'Edit' }}
                {{ modalType === 'pengumuman' ? 'Pengumuman' : modalType === 'umkm' ? 'Produk UMKM' : 'Surat' }}
              </h3>
              <button class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600" @click="showModal = false">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5">
              <!-- Detail Surat -->
              <div v-if="modalMode === 'detail' && modalType === 'surat'" class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">Ref</span><span class="font-mono font-medium">{{ modalData.ref_number || modalData.refNumber }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">Nama</span><span class="font-medium">{{ modalData.nama }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">NIK</span><span>{{ modalData.nik }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">No. KK</span><span>{{ modalData.no_kk || modalData.noKk }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">Jenis</span><span>{{ modalData.jenis_surat || modalData.jenisSurat }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">No. WA</span><span>{{ modalData.no_wa || modalData.noWa }}</span></div>
                <div class="flex justify-between py-2 border-b border-border"><span class="text-slate-500">Status</span><span :class="[getStatusColor(modalData.status), 'px-2 py-0.5 rounded-full text-xs font-semibold']">{{ modalData.status }}</span></div>
                <div class="py-2"><span class="text-slate-500 block mb-1">Keperluan</span><p class="text-slate-700 whitespace-pre-wrap">{{ modalData.keperluan }}</p></div>
              </div>

              <!-- Pengumuman Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'pengumuman'" @submit.prevent="handleModalSubmit" class="space-y-5">
                <div v-if="modalError" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm"><AlertCircle class="w-4 h-4" /> {{ modalError }}</div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Judul</label>
                  <input v-model="modalData.judul" type="text" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none" placeholder="Judul pengumuman">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
                  <input v-model="modalData.tanggal" type="date" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Konten</label>
                  <textarea v-model="modalData.konten" rows="6" class="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none resize-y" placeholder="Isi pengumuman..."></textarea>
                </div>
                <button type="submit" :disabled="modalLoading" class="w-full py-3 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 disabled:opacity-50 transition-all">
                  {{ modalLoading ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </form>

              <!-- UMKM Form -->
              <form v-if="modalMode !== 'detail' && modalType === 'umkm'" @submit.prevent="handleModalSubmit" class="space-y-5">
                <div v-if="modalError" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm"><AlertCircle class="w-4 h-4" /> {{ modalError }}</div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Produk</label>
                    <input v-model="modalData.nama_produk" type="text" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Harga (Rp)</label>
                    <input v-model.number="modalData.harga" type="number" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                  <select v-model="modalData.kategori" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none bg-white">
                    <option value="Makanan">Makanan</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Hasil Tani">Hasil Tani</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                  <textarea v-model="modalData.deskripsi" rows="3" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none resize-y"></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Pemilik</label>
                    <input v-model="modalData.pemilik" type="text" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">No. WA Pemilik</label>
                    <input v-model="modalData.no_wa_pemilik" type="text" class="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Foto Produk</label>
                  <input type="file" accept="image/*" class="w-full text-sm" @change="handleFotoChange">
                </div>
                <button type="submit" :disabled="modalLoading" class="w-full py-3 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 disabled:opacity-50 transition-all">
                  {{ modalLoading ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

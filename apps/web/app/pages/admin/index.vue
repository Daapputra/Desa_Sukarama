<script setup lang="ts">
import { Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })
useHead({
  title: 'Login Administrator — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Portal masuk administrator Pemerintah Desa Sukarama.' }
  ]
})

const { login } = useAuth()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!form.username.trim() || !form.password.trim()) {
    error.value = 'Username dan kata sandi wajib diisi'
    return
  }
  loading.value = true
  try {
    await login(form.username.trim(), form.password)
    router.push('/admin/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Username atau kata sandi tidak valid'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
    <!-- Single subtle ambient glow, not a pile of decorative blobs -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-xl p-8 sm:p-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
          <div class="relative inline-block mb-3">
            <img
              src="/images/logo-desa.png"
              alt="Logo Desa Sukarama"
              class="w-14 h-14 object-contain mx-auto"
            />
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold uppercase tracking-wide mb-3">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Portal Administrator</span>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            Pemerintah Desa Sukarama
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Masuk untuk mengelola surat, UMKM, pengumuman & pesan warga
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <Label class="block text-xs font-medium text-slate-700 mb-2">Username Administrator</Label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <Input
                v-model="form.username"
                type="text"
                class="w-full h-auto pl-10 pr-4 py-3 rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                placeholder="Ketik username admin"
                autocomplete="username"
              />
            </div>
          </div>

          <div>
            <Label class="block text-xs font-medium text-slate-700 mb-2">Kata Sandi</Label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <Input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full h-auto pl-10 pr-12 py-3 rounded-lg border-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-emerald-800/20 focus-visible:border-emerald-800"
                placeholder="Ketik kata sandi"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors z-10"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            :disabled="loading"
            class="w-full h-auto py-3 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white font-semibold text-sm"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
          </Button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Website</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

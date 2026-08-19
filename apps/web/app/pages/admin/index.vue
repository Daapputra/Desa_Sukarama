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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden">
    <!-- Ambient Background Elements -->
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Glassmorphic Login Card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-950/40 p-8 sm:p-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
          <div class="relative inline-block mb-3">
            <img
              src="/images/logo-desa.png"
              alt="Logo Desa Sukarama"
              class="w-16 h-16 object-contain mx-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
            />
            <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow"></span>
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Portal Administrator</span>
          </div>

          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Pemerintah Desa Sukarama
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Masuk untuk mengelola surat, UMKM, pengumuman & pesan warga
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 animate-fade-in">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Username Administrator</label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="form.username"
                type="text"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                placeholder="Ketik username admin"
                autocomplete="username"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Kata Sandi</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                placeholder="Ketik kata sandi"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-slate-100 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Website</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

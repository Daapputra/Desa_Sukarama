<script setup lang="ts">
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Login Admin — Desa Sukarama' })

const { login } = useAuth()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!form.username || !form.password) {
    error.value = 'Username dan password harus diisi'
    return
  }
  loading.value = true
  try {
    await login(form.username, form.password)
    router.push('/admin/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl border border-border shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-full bg-green-50 text-green-800 flex items-center justify-center mx-auto mb-4">
            <Lock class="w-6 h-6" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-1">Login Admin</h2>
          <p class="text-sm text-muted-foreground">Panel administrasi Desa Sukarama</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm mb-6">
          <AlertCircle class="w-4 h-4 shrink-0" /> {{ error }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin">
          <div class="mb-5">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div class="relative">
              <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                v-model="form.username"
                type="text"
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all"
                placeholder="Masukkan username"
                autocomplete="username"
              >
            </div>
          </div>
          <div class="mb-8">
            <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div class="relative">
              <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pl-10 pr-12 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-green-800/20 focus:border-green-800 outline-none transition-all"
                placeholder="Masukkan password"
                autocomplete="current-password"
              >
              <button 
                type="button" 
                class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-slate-700 transition-colors"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/25"
          >
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-xs text-muted-foreground hover:text-green-800 transition-colors">
            ← Kembali ke Website
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

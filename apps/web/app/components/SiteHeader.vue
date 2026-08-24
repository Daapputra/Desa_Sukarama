<script setup lang="ts">
import { Menu, X, Home, Landmark, FileText, ShoppingBag, Phone, Shield, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/profil', label: 'Profil Desa', icon: Landmark },
  { path: '/layanan', label: 'Layanan Surat', icon: FileText },
  { path: '/umkm', label: 'UMKM', icon: ShoppingBag },
  { path: '/kontak', label: 'Kontak', icon: Phone },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(route, () => {
  mobileOpen.value = false
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled
      ? 'bg-white/95 shadow-md border-b border-slate-200/80 py-2.5'
      : 'bg-white/95 border-b border-slate-100 py-3.5'"
  >
    <div class="container-app flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="relative">
          <img
            src="/images/logo-desa.png"
            alt="Logo Desa Sukarama"
            class="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          />
          <span class="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
        </div>
        <div>
          <div class="font-extrabold text-slate-900 text-base leading-tight tracking-tight group-hover:text-emerald-800 transition-colors">
            Desa Sukarama
          </div>
          <div class="text-[11px] text-slate-500 font-medium leading-tight">
            Kec. Bojongpicung, Kab. Cianjur
          </div>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1.5 shadow-inner">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-center transition-all duration-200"
          :class="isActive(item.path)
            ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
            : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'"
        >
          <component :is="item.icon" class="w-3.5 h-3.5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Right Action CTA -->
      <div class="hidden sm:flex items-center gap-3">
        <NuxtLink
          to="/layanan"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all duration-200"
        >
          <span>Ajukan Surat</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </NuxtLink>
        <NuxtLink
          to="/admin"
          title="Login Admin Desa"
          class="p-2 rounded-full text-slate-400 hover:text-emerald-800 hover:bg-slate-100 transition-colors"
        >
          <Shield class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Mobile Hamburger -->
      <button
        class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-700 transition-colors"
        @click="mobileOpen = !mobileOpen"
        aria-label="Menu"
      >
        <X v-if="mobileOpen" class="w-5 h-5" />
        <Menu v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile Nav -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="mobileOpen" class="lg:hidden bg-white border-t border-slate-200 shadow-2xl px-5 pt-4 pb-6 mt-2 rounded-b-2xl">
        <div class="space-y-1.5 mb-5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
            :class="isActive(item.path)
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-bold'
              : 'text-slate-600 hover:bg-slate-50'"
            @click="mobileOpen = false"
          >
            <component :is="item.icon" class="w-4 h-4 text-emerald-700" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>

        <div class="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <NuxtLink
            to="/layanan"
            class="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-950/20"
            @click="mobileOpen = false"
          >
            <FileText class="w-4 h-4" />
            <span>Ajukan Surat Online</span>
          </NuxtLink>
          <NuxtLink
            to="/admin"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold"
            @click="mobileOpen = false"
          >
            <Shield class="w-3.5 h-3.5" />
            <span>Portal Admin Desa</span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

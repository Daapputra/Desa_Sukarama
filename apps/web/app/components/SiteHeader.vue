<script setup lang="ts">
import { Menu, X, Home, Landmark, FileText, ShoppingBag, Phone } from 'lucide-vue-next'

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
      ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-border'
      : 'bg-white/80 backdrop-blur-sm'"
  >
    <div class="container-app relative flex items-center justify-between h-[72px]">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div
          class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-green-900/20 group-hover:shadow-green-900/40 transition-shadow"
        >
          DS
        </div>
        <div class="hidden sm:block">
          <div class="font-bold text-slate-900 text-sm leading-tight">Desa Sukarama</div>
          <div class="text-[11px] text-muted-foreground leading-tight">Kec. Bojongpicung, Kab. Cianjur</div>
        </div>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 shadow-sm backdrop-blur-md">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-center transition-all duration-200"
          :class="isActive(item.path)
            ? 'bg-green-900 text-white shadow-lg shadow-green-900/25'
            : 'text-slate-600 hover:text-green-800 hover:bg-green-50'"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Mobile Hamburger -->
      <button
        class="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
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
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-border shadow-xl px-4 pb-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all"
          :class="isActive(item.path)
            ? 'bg-green-50 text-green-900 font-semibold'
            : 'text-slate-600 hover:bg-slate-50'"
          @click="mobileOpen = false"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

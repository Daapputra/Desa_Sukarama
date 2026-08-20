<script setup lang="ts">
import type { Component } from 'vue'
import { Globe, LogOut } from 'lucide-vue-next'

interface SidebarTab {
  id: string
  label: string
  icon: Component
  count?: number
}

defineProps<{
  tabs: SidebarTab[]
  activeTab: string
  username: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', id: string): void
  (e: 'logout'): void
}>()
</script>

<template>
  <Sidebar collapsible="offcanvas">
    <SidebarHeader class="px-4 py-4">
      <NuxtLink to="/" class="flex items-center gap-3 px-1 py-1">
        <img src="/images/logo-desa.png" alt="Logo Desa Sukarama" class="w-10 h-10 object-contain shrink-0" />
        <div class="leading-tight min-w-0">
          <div class="font-semibold text-base text-sidebar-foreground truncate">Panel Administrator</div>
          <p class="text-xs text-sidebar-foreground/60 truncate">Kec. Bojongpicung, Cianjur</p>
        </div>
      </NuxtLink>
    </SidebarHeader>
    <SidebarSeparator />
    <SidebarContent class="py-2">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="gap-1">
            <SidebarMenuItem v-for="tab in tabs" :key="tab.id">
              <SidebarMenuButton
                size="lg"
                class="text-sm gap-3 [&_svg]:size-5"
                :is-active="activeTab === tab.id"
                @click="emit('update:activeTab', tab.id)"
              >
                <component :is="tab.icon" />
                <span>{{ tab.label }}</span>
              </SidebarMenuButton>
              <SidebarMenuBadge v-if="tab.count !== undefined" class="text-xs">{{ tab.count }}</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarSeparator />
    <SidebarFooter class="px-4 pb-4 gap-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="text-sm gap-3 [&_svg]:size-5" as-child>
            <NuxtLink to="/" target="_blank">
              <Globe />
              <span>Lihat Website</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div class="flex items-center gap-3 px-2 py-1.5">
        <div class="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
          {{ (username || 'A').charAt(0).toUpperCase() }}
        </div>
        <span class="truncate text-sm font-medium text-sidebar-foreground">{{ username }}</span>
      </div>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            class="text-sm gap-3 [&_svg]:size-5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            @click="emit('logout')"
          >
            <LogOut />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

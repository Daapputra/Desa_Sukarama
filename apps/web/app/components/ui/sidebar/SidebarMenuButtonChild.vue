<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { SidebarMenuButtonVariants } from '.'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { sidebarMenuButtonVariants } from '.'

// Declared flat (not `extends PrimitiveProps`) — see Button.vue for why: extending an
// externally-resolved reka-ui type here fails Vue's compiler, and ignoring the failure
// with @vue-ignore silently drops `as`/`asChild` from the runtime props, which makes
// reka-ui's Primitive fall back to its own default (`as: 'div'`) instead of 'button'.
export interface SidebarMenuButtonProps {
  as?: string | Component
  asChild?: boolean
  variant?: SidebarMenuButtonVariants['variant']
  size?: SidebarMenuButtonVariants['size']
  isActive?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<SidebarMenuButtonProps>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-button"
    data-sidebar="menu-button"
    :data-size="size"
    :data-active="isActive || undefined"
    :class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
    :as="as"
    :as-child="asChild"
    v-bind="$attrs"
  >
    <slot />
  </Primitive>
</template>

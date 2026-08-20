<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

// Declared flat (not `extends PrimitiveProps`) so Vue's compiler can statically resolve
// the type and register `as`/`asChild` as real runtime props — see reka-ui's own
// Primitive component, whose `as` prop defaults to 'div' when the passed value is
// undefined, which is exactly what happens if these keys aren't registered.
interface Props {
  as?: string | Component
  asChild?: boolean
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>

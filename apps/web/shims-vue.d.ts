// Ambient module declaration for explicit `.vue` imports (used by the shadcn-vue
// component barrel files under app/components/ui/*/index.ts, e.g.
// `export { default as Button } from './Button.vue'`). Nuxt's own components are
// auto-imported and never hit this path, so this only affects those barrel files.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

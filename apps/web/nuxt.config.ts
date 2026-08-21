// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
  ],

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  runtimeConfig: {
    // Server-only: dipakai saat SSR di dalam container Docker, di mana
    // 'localhost'/'127.0.0.1' tidak menjangkau container 'api' lain — butuh
    // nama service Docker (mis. http://api:3005). Fallback ke apiBase publik
    // untuk dev non-Docker, di mana API memang reachable lewat localhost.
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE || 'http://127.0.0.1:3005',
    },
  },

  nitro: {
    compressPublicAssets: true,
  },

  routeRules: {
    '/profil': { prerender: true },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/templates/**': { headers: { 'cache-control': 'public, max-age=86400' } },
  },

  app: {
    head: {
      title: 'Desa Sukarama — Kec. Bojongpicung, Kab. Cianjur',
      htmlAttrs: { lang: 'id' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Website Resmi Pemerintah Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur. Portal informasi, layanan surat online, dan produk UMKM desa.',
        },
        { name: 'theme-color', content: '#064e3b' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
        },
      ],
    },
  },
})

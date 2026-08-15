// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
  ],

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || 'http://127.0.0.1:3005',
    },
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
        { name: 'theme-color', content: '#1B5E20' },
      ],
      link: [
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

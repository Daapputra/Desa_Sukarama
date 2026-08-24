<script setup lang="ts">
import { MapPin, Phone, Clock, Mail, Send, ChevronRight, AlertCircle, CheckCircle2, MessageCircle, Loader2 } from 'lucide-vue-next'

useHead({
  title: 'Kontak & Aspirasi Warga — Desa Sukarama',
  meta: [
    { name: 'description', content: 'Hubungi kantor Pemerintah Desa Sukarama untuk layanan informasi publik, bantuan administrasi, atau sampaikan aspirasi dan saran Anda secara langsung.' }
  ]
})

const { apiPost } = useApi()

const form = reactive({
  nama: '',
  kontak: '',
  pesan: '',
})

const submitting = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  if (!form.nama.trim() || !form.kontak.trim() || !form.pesan.trim()) {
    error.value = 'Semua kolom bertanda bintang (*) wajib diisi'
    return
  }
  submitting.value = true
  try {
    await apiPost('/api/kontak', form)
    success.value = true
    Object.assign(form, { nama: '', kontak: '', pesan: '' })
    setTimeout(() => (success.value = false), 6000)
  } catch (err: any) {
    error.value = err.message || 'Gagal mengirim pesan, silakan coba lagi.'
  } finally {
    submitting.value = false
  }
}

const contactInfo = [
  { icon: MapPin, title: 'Alamat Kantor Desa', desc: 'Jl. Raya Sukarama No. 01, Kec. Bojongpicung, Kab. Cianjur, Jawa Barat 43283' },
  { icon: Phone, title: 'Telepon / WhatsApp Layanan', desc: '+62 858-1779-3254' },
  { icon: Mail, title: 'Email Resmi', desc: 'desasukarama1122@yahoo.com' },
  { icon: Clock, title: 'Jam Pelayanan Kantor', desc: 'Senin – Jumat: 08.00 – 15.00 WIB\nSabtu – Minggu & Hari Libur: Tutup' },
]

// Scroll reveal directive with multiple animation types
const vScrollReveal = {
  mounted(el: HTMLElement, binding: any) {
    if (typeof window === 'undefined') return;
    const type = binding.value?.type || 'up'
    let delay = binding.value?.delay || 0
    const stagger = binding.value?.stagger

    const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

    if (stagger) {
      Array.from(el.children).forEach((c: any, i) => {
        c.style.opacity = '0'
        c.style.transform = 'translateY(120px)'
        c.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}`
        c.style.transitionDelay = `${delay + (i * 150)}ms`
      })
    } else {
      el.style.opacity = '0'
      el.style.transition = `opacity 1.2s ease, transform 1.2s ${easing}, filter 1s ease`
      el.style.filter = 'blur(8px)'
      if (delay) el.style.transitionDelay = `${delay}ms`

      switch (type) {
        case 'left': el.style.transform = 'translateX(-120px)'; break
        case 'right': el.style.transform = 'translateX(120px)'; break
        case 'zoom': el.style.transform = 'scale(0.85) translateY(40px)'; break
        default: el.style.transform = 'translateY(120px)'
      }
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        requestAnimationFrame(() => {
          if (stagger) {
            Array.from(el.children).forEach((c: any) => {
              c.style.opacity = '1'
              c.style.transform = 'translate(0)'
            })
          } else {
            el.style.opacity = '1'
            el.style.transform = 'translate(0) scale(1)'
            el.style.filter = 'blur(0)'
          }
        })
        observer.unobserve(el)
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' })
    
    setTimeout(() => {
      observer.observe(el)
    }, 50)
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 pb-24">
    <!-- Hero Section -->
    <section class="relative py-24 md:py-28 overflow-hidden text-white">
      <!-- Background Image -->
      <img src="/images/kantordesa3.png" alt="Background Kontak" class="absolute inset-0 w-full h-full object-cover object-[50%_65%] md:object-[50%_55%] z-0 animate-slow-pan" />
      
      <!-- Clean Dark Overlay (Tanpa Hijau Tebal) -->
      <div class="absolute inset-0 z-[1] bg-gradient-to-tr from-slate-950 via-slate-900/80 to-slate-900/40"></div>
      <!-- Subtle Grid Pattern (Opsional, lebih elegan dari titik) -->
      <div class="absolute inset-0 z-[2] opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]"></div>

      <div class="container-app relative z-10 text-center">
        <div class="inline-flex items-center gap-2 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4 backdrop-blur-sm">
          <NuxtLink to="/" class="hover:text-white transition-colors">Beranda</NuxtLink>
          <ChevronRight class="w-3 h-3" />
          <span>Kontak & Aspirasi</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3" v-scroll-reveal="{ type: 'zoom' }">
          Hubungi Pemerintah Desa
        </h1>
        <p class="text-emerald-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed" v-scroll-reveal="{ delay: 150 }">
          Kirim saran, aspirasi, atau pertanyaan langsung ke perangkat Desa Sukarama. Kami siap melayani dengan sepenuh hati.
        </p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-10 md:py-14">
      <div class="container-app">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <!-- Information & Map (Left Col) -->
          <div class="lg:col-span-5 space-y-6" v-scroll-reveal="{ type: 'right' }">
            <div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 class="text-lg font-black text-slate-900 tracking-tight mb-6 pb-4 border-b border-slate-100">
                Informasi & Saluran Kontak
              </h2>

              <div class="space-y-5 mb-8">
                <div v-for="item in contactInfo" :key="item.title" class="flex gap-3.5">
                  <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <component :is="item.icon" class="w-4 h-4" />
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-800 mb-0.5">{{ item.title }}</h4>
                    <p class="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{{ item.desc }}</p>
                  </div>
                </div>
              </div>

              <!-- Direct WhatsApp Button -->
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Desa%20Sukarama,%20saya%20ingin%20bertanya%20mengenai%20layanan%20desa..."
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 transition-all"
              >
                <MessageCircle class="w-4 h-4" />
                <span>Chat Langsung via WhatsApp</span>
              </a>
            </div>

            <!-- Map Location -->
            <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-emerald-700" /> Lokasi Kantor Desa
              </h3>
              <div class="rounded-2xl overflow-hidden border border-slate-200 h-[220px]">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=107.20%2C-6.87%2C107.28%2C-6.82&layer=mapnik"
                  width="100%"
                  height="100%"
                  style="border:none;"
                  loading="lazy"
                  title="Peta lokasi kantor Desa Sukarama"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Contact / Aspiration Form (Right Col) -->
          <div class="lg:col-span-7" v-scroll-reveal="{ type: 'left' }">
            <div class="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              <h2 class="text-xl font-black text-slate-900 tracking-tight mb-2">
                Formulir Pesan & Aspirasi
              </h2>
              <p class="text-xs text-slate-500 mb-8 pb-4 border-b border-slate-100">
                Setiap pesan yang masuk akan diteruskan langsung ke meja pelayanan dan pimpinan desa.
              </p>

              <!-- Success Alert -->
              <div v-if="success" class="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-6 animate-fade-in">
                <CheckCircle2 class="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h4 class="font-bold">Pesan Anda Berhasil Terkirim!</h4>
                  <p class="text-emerald-700 mt-0.5">Terima kasih telah berkontribusi memberikan saran untuk kemajuan Desa Sukarama.</p>
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="error" class="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-6 animate-fade-in">
                <AlertCircle class="w-4 h-4 shrink-0 text-rose-600" />
                <span>{{ error }}</span>
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="mb-5">
                  <label class="block text-xs font-bold text-slate-700 mb-2">Nama Lengkap <span class="text-rose-500">*</span></label>
                  <input
                    v-model="form.nama"
                    type="text"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                    placeholder="Nama lengkap Anda"
                  />
                </div>

                <div class="mb-5">
                  <label class="block text-xs font-bold text-slate-700 mb-2">Nomor HP / WhatsApp / Email <span class="text-rose-500">*</span></label>
                  <input
                    v-model="form.kontak"
                    type="text"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none transition-all"
                    placeholder="Contoh: 081234567890 atau email@domain.com"
                  />
                </div>

                <div class="mb-8">
                  <label class="block text-xs font-bold text-slate-700 mb-2">Pesan, Saran, atau Pertanyaan <span class="text-rose-500">*</span></label>
                  <textarea
                    v-model="form.pesan"
                    rows="5"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 outline-none resize-y transition-all"
                    placeholder="Tuliskan aspirasi, kendala administrasi, atau permohonan informasi secara lengkap..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  :disabled="submitting"
                  class="w-full py-4 rounded-2xl bg-emerald-900 hover:bg-emerald-800 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50"
                >
                  <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
                  <Send v-else class="w-4 h-4" />
                  <span>{{ submitting ? 'Mengirim Pesan...' : 'Kirim Aspirasi / Pesan' }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes slowZoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.15); }
}
.animate-slow-zoom {
  animation: slowZoom 20s ease-in-out infinite alternate;
  will-change: transform;
}
</style>

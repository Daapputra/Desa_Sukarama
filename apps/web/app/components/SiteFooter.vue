<script setup lang="ts">
import { MapPin, Phone, Clock, Shield, MessageCircle, Search } from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
    <div class="container-app">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img src="/images/logo-desa.png" alt="Logo Desa Sukarama" class="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <span class="font-extrabold text-white text-lg tracking-tight block">Desa Sukarama</span>
              <span class="text-xs text-emerald-400 font-medium">Bojongpicung, Cianjur</span>
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed text-justify">
            Website resmi Pemerintah Desa Sukarama. Menghadirkan transformasi digital layanan publik, transparansi informasi, serta memajukan perekonomian UMKM warga secara mandiri dan berkelanjutan.
          </p>
          <div class="flex items-center gap-2 pt-2">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Desa%20Sukarama"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold border border-emerald-700/50 transition-colors"
            >
              <MessageCircle class="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Desa</span>
            </a>
          </div>
        </div>

        <!-- Menu Cepat -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Navigasi Utama
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li><NuxtLink to="/" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Beranda</NuxtLink></li>
            <li><NuxtLink to="/profil" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Profil & Sejarah Desa</NuxtLink></li>
            <li><NuxtLink to="/layanan" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Layanan Surat Online</NuxtLink></li>
            <li><NuxtLink to="/umkm" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Produk UMKM Lokal</NuxtLink></li>
            <li><NuxtLink to="/kontak" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Kontak & Aspirasi Warga</NuxtLink></li>
          </ul>
        </div>

        <!-- Layanan Populer -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Layanan Surat
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li><NuxtLink to="/layanan" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Surat Keterangan Domisili</NuxtLink></li>
            <li><NuxtLink to="/layanan" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Surat Beda Nama (KK/KTP)</NuxtLink></li>
            <li><NuxtLink to="/layanan" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Surat Keterangan Usaha (SKU)</NuxtLink></li>
            <li><NuxtLink to="/layanan" class="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"><span>›</span> Surat Pernyataan Program</NuxtLink></li>
            <li>
              <NuxtLink to="/layanan?tab=cek" class="text-emerald-400 font-semibold hover:underline flex items-center gap-1.5">
                <Search class="w-3 h-3 text-emerald-400" />
                <span>Lacak Status Surat (Via NIK)</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Kontak & Jam Layanan -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
            Kantor Pelayanan
          </h4>
          <ul class="space-y-3 text-xs">
            <li class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span class="text-slate-400">Jl. Raya Sukarama No. 01, Kec. Bojongpicung, Kab. Cianjur, Jawa Barat 43283</span>
            </li>
            <li class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-emerald-400 shrink-0" />
              <span class="text-slate-400">(0263) 123-4567 / 0812-3456-7890</span>
            </li>
            <li class="flex items-center gap-2.5">
              <Clock class="w-4 h-4 text-emerald-400 shrink-0" />
              <span class="text-slate-400">Senin – Jumat: 08.00 – 15.00 WIB</span>
            </li>
            <li class="flex items-center gap-2.5 pt-1">
              <Shield class="w-4 h-4 text-slate-500 shrink-0" />
              <NuxtLink to="/admin" class="text-slate-500 hover:text-white transition-colors">
                Masuk Portal Admin Desa
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-t border-slate-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
        <span>&copy; {{ year }} Pemerintah Desa Sukarama. Semua hak dilindungi.</span>
        <span>Dikembangkan untuk masyarakat Desa Sukarama</span>
      </div>
    </div>
  </footer>
</template>

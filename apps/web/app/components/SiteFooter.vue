<script setup lang="ts">
import { MapPin, Phone, Clock } from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-slate-900 text-slate-300 pt-16 pb-6">
    <div class="container-app">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 text-center">
        <!-- Brand -->
        <div>
          <div class="flex items-center justify-center gap-3 mb-4">
            <img src="/images/logo-desa.png" alt="Logo Desa Sukarama" class="w-10 h-10 object-contain drop-shadow-sm" />
            <span class="font-bold text-white text-base">Desa Sukarama</span>
          </div>
          <p class="text-sm text-slate-400 leading-7">
            Website resmi Pemerintah Desa Sukarama, Kecamatan Bojongpicung,
            Kabupaten Cianjur, Provinsi Jawa Barat. Portal informasi dan layanan publik desa.
          </p>
        </div>

        <!-- Menu -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Menu</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Beranda</NuxtLink></li>
            <li><NuxtLink to="/profil" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Profil Desa</NuxtLink></li>
            <li><NuxtLink to="/layanan" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Layanan Surat</NuxtLink></li>
            <li><NuxtLink to="/umkm" class="text-sm text-slate-400 hover:text-green-400 transition-colors">UMKM</NuxtLink></li>
            <li><NuxtLink to="/kontak" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Kontak</NuxtLink></li>
          </ul>
        </div>

        <!-- Layanan -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Layanan</h4>
          <ul class="space-y-2">
            <li><NuxtLink to="/layanan" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Pengajuan Surat</NuxtLink></li>
            <li><NuxtLink to="/layanan?tab=cek" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Cek Status Surat</NuxtLink></li>
            <li><NuxtLink to="/umkm" class="text-sm text-slate-400 hover:text-green-400 transition-colors">Produk UMKM</NuxtLink></li>
          </ul>
        </div>

        <!-- Kontak -->
        <div>
          <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Kontak</h4>
          <ul class="space-y-3">
            <li class="flex items-start justify-center gap-2">
              <MapPin class="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <span class="text-sm text-slate-400">Jl. Desa Sukarama No. 01</span>
            </li>
            <li class="flex items-start justify-center gap-2">
              <Phone class="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <span class="text-sm text-slate-400">(0263) 123-4567</span>
            </li>
            <li class="flex items-start justify-center gap-2">
              <Clock class="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <span class="text-sm text-slate-400">Senin – Jumat: 08.00 – 15.00</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
        <span>&copy; {{ year }} Pemerintah Desa Sukarama. Hak cipta dilindungi.</span>
        <span>Dibuat dengan ❤️ untuk masyarakat Desa Sukarama</span>
      </div>
    </div>
  </footer>
</template>

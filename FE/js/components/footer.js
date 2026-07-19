/**
 * Footer Component
 */
function renderFooter() {
  const footer = document.getElementById('main-footer');
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <div class="logo-icon">DS</div>
              <span>Desa Sukarama</span>
            </div>
            <p>
              Website resmi Pemerintah Desa Sukarama, Kecamatan Bojongpicung, 
              Kabupaten Cianjur, Provinsi Jawa Barat. Portal informasi dan 
              layanan publik desa.
            </p>
          </div>

          <div class="footer-col">
            <h4>Menu</h4>
            <ul>
              <li><a href="#/">Beranda</a></li>
              <li><a href="#/profil">Profil Desa</a></li>
              <li><a href="#/layanan">Layanan Surat</a></li>
              <li><a href="#/umkm">UMKM</a></li>
              <li><a href="#/kontak">Kontak</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Layanan</h4>
            <ul>
              <li><a href="#/layanan">Pengajuan Surat</a></li>
              <li><a href="#/layanan/cek">Cek Status Surat</a></li>
              <li><a href="#/umkm">Produk UMKM</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Kontak</h4>
            <ul>
              <li><a href="#/kontak">
                <i data-lucide="map-pin" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>
                Jl. Desa Sukarama No. 01
              </a></li>
              <li><a href="#/kontak">
                <i data-lucide="phone" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>
                (0263) 123-4567
              </a></li>
              <li><a href="#/kontak">
                <i data-lucide="clock" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i>
                Senin – Jumat: 08.00 – 15.00
              </a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; ${year} Pemerintah Desa Sukarama. Hak cipta dilindungi.</span>
          <span>Dibuat dengan ❤️ untuk masyarakat Desa Sukarama</span>
        </div>
      </div>
    </footer>
  `;

  if (window.lucide) lucide.createIcons();
}

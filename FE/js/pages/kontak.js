/**
 * Halaman Kontak
 */
function renderKontak(container) {
  container.innerHTML = `
    <!-- Page Hero -->
    <section class="section" style="background:linear-gradient(135deg,var(--green-50),var(--slate-50));padding-bottom:var(--space-2xl)">
      <div class="container">
        <div class="section-header fade-in" style="margin-bottom:0">
          <h2>Kontak Kami</h2>
          <p>Hubungi Pemerintah Desa Sukarama untuk pertanyaan atau informasi lebih lanjut.</p>
          <span class="accent-line"></span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="contact-grid">
          
          <!-- Info Kontak & Peta -->
          <div class="fade-in">
            <h3 style="margin-bottom:var(--space-lg);font-size:1.3rem">Informasi Kontak</h3>
            <div class="contact-info-list" style="margin-bottom:var(--space-xl)">
              <div class="contact-info-item">
                <div class="info-icon"><i data-lucide="map-pin"></i></div>
                <div class="info-content">
                  <h4>Alamat Kantor</h4>
                  <p>Jl. Raya Desa Sukarama No. 01, RT 01 / RW 02<br>Kec. Bojongpicung, Kab. Cianjur<br>Jawa Barat 43283</p>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="info-icon"><i data-lucide="phone"></i></div>
                <div class="info-content">
                  <h4>Telepon / WhatsApp</h4>
                  <p>(0263) 123-4567<br>0812-3456-7890 (Layanan WA)</p>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="info-icon"><i data-lucide="clock"></i></div>
                <div class="info-content">
                  <h4>Jam Pelayanan</h4>
                  <p>Senin – Kamis : 08.00 – 15.00 WIB<br>Jumat : 08.00 – 11.30 WIB<br>Sabtu, Minggu & Libur Nasional : Tutup</p>
                </div>
              </div>
            </div>

            <div class="map-container" style="height:250px" id="kontak-map"></div>
            <div style="margin-top:var(--space-sm); text-align:center;">
              <a href="https://www.google.com/maps/search/?api=1&query=Desa+Sukarama,+Bojongpicung,+Cianjur" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;font-size:0.85rem;">
                <i data-lucide="map-pin" style="width:14px;height:14px;"></i> Buka di Google Maps
              </a>
            </div>
          </div>

          <!-- Form Kontak -->
          <div class="fade-in fade-in-delay-1">
            <div class="card" style="padding:var(--space-2xl)">
              <h3 style="margin-bottom:var(--space-lg);font-size:1.3rem">Kirim Pesan</h3>
              <p style="color:var(--color-text-sec);font-size:.9rem;margin-bottom:var(--space-xl)">
                Punya pertanyaan atau saran? Silakan isi formulir di bawah ini. Kami akan membalas melalui kontak yang Anda berikan.
              </p>
              
              <form id="form-kontak">
                <div class="form-group">
                  <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                  <input type="text" class="form-input" name="nama" required placeholder="Masukkan nama Anda">
                </div>
                <div class="form-group">
                  <label class="form-label">Email atau No. HP <span class="required">*</span></label>
                  <input type="text" class="form-input" name="kontak" required placeholder="Untuk balasan kami">
                </div>
                <div class="form-group">
                  <label class="form-label">Pesan <span class="required">*</span></label>
                  <textarea class="form-textarea" name="pesan" required placeholder="Tulis pesan atau pertanyaan Anda di sini..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full" id="btn-submit-kontak">
                  <i data-lucide="send"></i> Kirim Pesan
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  `;

  if (window.lucide) lucide.createIcons();

  // Initialize Leaflet map
  renderKontakMap();

  // Handle Form Submit
  const form = document.getElementById('form-kontak');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-kontak');
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader" class="loader-spinner"></i> Mengirim...';
      if (window.lucide) lucide.createIcons();

      try {
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        
        const data = await apiCall('/api/kontak', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        
        showToast(data.message, 'success');
        form.reset();
        
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send"></i> Kirim Pesan';
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

function renderKontakMap() {
  const mapEl = document.getElementById('kontak-map');
  if (!mapEl || !window.L) return;

  const lat = -6.8248;
  const lng = 107.2407;

  const map = L.map('kontak-map', {
    scrollWheelZoom: false
  }).setView([lat, lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup('<b>Kantor Desa Sukarama</b><br>Kec. Bojongpicung, Kab. Cianjur')
    .openPopup();

  setTimeout(() => map.invalidateSize(), 300);
}

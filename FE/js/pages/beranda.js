/**
 * Halaman Beranda — Homepage
 */
function renderBeranda(container) {
  container.innerHTML = `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <img src="/images/hero-banner.png" alt="Desa Sukarama" />
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <i data-lucide="shield-check" style="width:14px;height:14px"></i>
          Website Resmi Pemerintah Desa
        </div>
        <h1>Selamat Datang di Website Resmi Desa Sukarama</h1>
        <p>Kecamatan Bojongpicung, Kabupaten Cianjur, Provinsi Jawa Barat Portal informasi, layanan publik, dan produk unggulan desa.</p>
        <div class="hero-buttons">
          <a href="#/layanan" class="btn btn-white btn-lg">
            <i data-lucide="file-text"></i>
            Ajukan Surat Online
          </a>
          <a href="#/profil" class="btn btn-outline btn-lg">
            <i data-lucide="info"></i>
            Profil Desa
          </a>
        </div>
      </div>
    </section>

    <!-- Sambutan Kepala Desa -->
    <section class="section">
      <div class="container">
        <div class="welcome-section fade-in">
          <div class="welcome-photo">
            <i data-lucide="user" style="width:60px;height:60px"></i>
          </div>
          <div class="welcome-content">
            <h3>Sambutan Kepala Desa</h3>
            <p>
              Assalamu'alaikum Wr. Wb.<br><br>
              Puji serta syukur kita panjatkan kehadirat Allah SWT. Atas rahmat dan karunia-Nya, 
              website resmi Desa Sukarama dapat hadir untuk melayani masyarakat secara digital. 
              Website ini merupakan wujud komitmen kami dalam meningkatkan transparansi informasi 
              dan kemudahan layanan publik bagi seluruh warga Desa Sukarama.<br><br>
              Melalui website ini, warga dapat mengakses informasi desa, mengajukan surat secara 
              online, serta mengenal produk UMKM unggulan desa kita. Semoga website ini bermanfaat 
              bagi kemajuan Desa Sukarama.
            </p>
            <div class="welcome-name">H. Ahmad Suryadi, S.Sos</div>
            <div class="welcome-role">Kepala Desa Sukarama</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistik Desa -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Desa Sukarama dalam Angka</h2>
          <p>Data statistik desa yang terus kami perbarui untuk transparansi informasi</p>
          <span class="accent-line"></span>
        </div>
        <div class="stats-grid">
          <div class="stat-card fade-in fade-in-delay-1">
            <div class="stat-icon">
              <i data-lucide="users" style="width:24px;height:24px"></i>
            </div>
            <div class="stat-number">4.827</div>
            <div class="stat-label">Jumlah Penduduk</div>
          </div>
          <div class="stat-card fade-in fade-in-delay-2">
            <div class="stat-icon">
              <i data-lucide="home" style="width:24px;height:24px"></i>
            </div>
            <div class="stat-number">1.245</div>
            <div class="stat-label">Kepala Keluarga</div>
          </div>
          <div class="stat-card fade-in fade-in-delay-2">
            <div class="stat-icon">
              <i data-lucide="map" style="width:24px;height:24px"></i>
            </div>
            <div class="stat-number">3</div>
            <div class="stat-label">Dusun / 8 RW / 24 RT</div>
          </div>
          <div class="stat-card fade-in fade-in-delay-3">
            <div class="stat-icon">
              <i data-lucide="ruler" style="width:24px;height:24px"></i>
            </div>
            <div class="stat-number">485</div>
            <div class="stat-label">Luas Wilayah (Ha)</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pengumuman / Berita Terbaru -->
    <section class="section">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Pengumuman Terbaru</h2>
          <p>Informasi dan pengumuman terbaru dari Pemerintah Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>
        <div class="news-grid" id="beranda-news-grid">
          <div class="page-loader"><div class="loader-spinner"></div></div>
        </div>
      </div>
    </section>

    <!-- Preview UMKM -->
    <section class="section section-green">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Produk UMKM Unggulan</h2>
          <p>Dukung produk lokal warga Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>
        <div class="umkm-grid" id="beranda-umkm-grid">
          <div class="page-loader"><div class="loader-spinner"></div></div>
        </div>
        <div class="text-center mt-xl fade-in">
          <a href="#/umkm" class="btn btn-outline-green btn-lg">
            <i data-lucide="arrow-right"></i>
            Lihat Semua Produk
          </a>
        </div>
      </div>
    </section>
  `;

  // Load pengumuman
  loadBerandaPengumuman();
  // Load UMKM preview
  loadBerandaUMKM();
}

async function loadBerandaPengumuman() {
  const grid = document.getElementById('beranda-news-grid');
  try {
    const data = await apiCall('/api/pengumuman?limit=3');
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>Belum ada pengumuman.</p></div>';
      return;
    }
    grid.innerHTML = data.map((item, i) => `
      <div class="card fade-in fade-in-delay-${i + 1}">
        <div class="card-body">
          <div class="card-date">
            <i data-lucide="calendar" style="width:14px;height:14px"></i>
            ${formatTanggal(item.tanggal)}
          </div>
          <h3 class="card-title">${escapeHtml(item.judul)}</h3>
          <p class="card-text">${escapeHtml(truncateText(item.konten, 150))}</p>
          <button class="card-link" onclick="showPengumumanDetail(${item.id})">
            Baca selengkapnya
            <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
          </button>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
    setupScrollAnimations();
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Gagal memuat pengumuman.</p></div>';
  }
}

async function loadBerandaUMKM() {
  const grid = document.getElementById('beranda-umkm-grid');
  try {
    const data = await apiCall('/api/umkm');
    const items = data.slice(0, 6);
    if (items.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>Belum ada produk UMKM.</p></div>';
      return;
    }
    grid.innerHTML = items.map((item, i) => `
      <div class="card umkm-card fade-in fade-in-delay-${(i % 3) + 1}">
        <img 
          src="${item.foto_path || '/images/products/placeholder.jpg'}" 
          alt="${escapeHtml(item.nama_produk)}" 
          class="card-img"
          onerror="handleImageError(this)"
        />
        <div class="card-body">
          <span class="product-category">${escapeHtml(item.kategori)}</span>
          <h3 class="card-title">${escapeHtml(item.nama_produk)}</h3>
          <div class="product-price">${formatRupiah(item.harga)}</div>
          <div class="product-owner">
            <i data-lucide="user" style="width:14px;height:14px"></i>
            ${escapeHtml(item.pemilik)}
          </div>
          <div class="card-actions">
            <a href="https://wa.me/${item.no_wa_pemilik}?text=${encodeURIComponent('Halo, saya tertarik dengan produk ' + item.nama_produk + ' dari Website Desa Sukarama.')}" 
               target="_blank" class="btn btn-whatsapp btn-sm w-full">
              <i data-lucide="message-circle"></i>
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
    setupScrollAnimations();
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><p>Gagal memuat produk UMKM.</p></div>';
  }
}

// Show pengumuman detail in modal
function showPengumumanDetail(id) {
  apiCall(`/api/pengumuman/${id}`).then(data => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${escapeHtml(data.judul)}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x" style="width:20px;height:20px"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="card-date mb-md">
            <i data-lucide="calendar" style="width:14px;height:14px"></i>
            ${formatTanggal(data.tanggal)}
          </div>
          <div style="white-space:pre-line;font-size:.92rem;line-height:1.8;color:var(--color-text-sec)">
            ${escapeHtml(data.konten)}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    if (window.lucide) lucide.createIcons();
  }).catch(() => showToast('Gagal memuat detail pengumuman', 'error'));
}

/**
 * Halaman UMKM Desa
 */
function renderUMKM(container) {
  container.innerHTML = `
    <!-- Page Hero -->
    <section class="section" style="background:linear-gradient(135deg,var(--green-900),var(--green-700));color:white;padding:var(--space-3xl) 0">
      <div class="container text-center">
        <h2 style="color:white;font-size:2.2rem;margin-bottom:var(--space-sm)" class="fade-in">UMKM Desa Sukarama</h2>
        <p style="color:rgba(255,255,255,.8);max-width:600px;margin:0 auto" class="fade-in fade-in-delay-1">
          Dukung perekonomian lokal dengan membeli produk-produk unggulan karya warga Desa Sukarama.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <!-- Filter Kategori -->
        <div class="filter-tabs fade-in" id="umkm-filters">
          <button class="filter-tab active" data-kategori="Semua">Semua Produk</button>
          <button class="filter-tab" data-kategori="Makanan">Makanan</button>
          <button class="filter-tab" data-kategori="Kerajinan">Kerajinan</button>
          <button class="filter-tab" data-kategori="Hasil Tani">Hasil Tani</button>
          <button class="filter-tab" data-kategori="Lainnya">Lainnya</button>
        </div>

        <!-- Grid Produk -->
        <div class="umkm-grid" id="umkm-grid">
          <div class="page-loader" style="grid-column:1/-1"><div class="loader-spinner"></div></div>
        </div>
      </div>
    </section>
  `;

  loadUMKMData('Semua');

  // Filter clicks
  const filters = container.querySelectorAll('.filter-tab');
  filters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filters.forEach(f => f.classList.remove('active'));
      e.target.classList.add('active');
      const kategori = e.target.getAttribute('data-kategori');
      loadUMKMData(kategori);
    });
  });
}

async function loadUMKMData(kategori) {
  const grid = document.getElementById('umkm-grid');
  grid.innerHTML = '<div class="page-loader" style="grid-column:1/-1"><div class="loader-spinner"></div></div>';
  
  try {
    let url = '/api/umkm';
    if (kategori !== 'Semua') {
      url += `?kategori=${encodeURIComponent(kategori)}`;
    }
    
    const data = await apiCall(url);
    
    if (data.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <i data-lucide="package-open" class="empty-icon"></i>
          <p>Belum ada produk untuk kategori ini.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    grid.innerHTML = data.map((item, i) => `
      <div class="card umkm-card fade-in visible" style="transition-delay:${i * 0.1}s">
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
          <p class="card-text" style="font-size:.85rem;flex:1">${escapeHtml(truncateText(item.deskripsi, 100))}</p>
          <div class="product-owner mt-md">
            <i data-lucide="store" style="width:14px;height:14px"></i>
            ${escapeHtml(item.pemilik)}
          </div>
          <div class="card-actions">
            <a href="https://wa.me/${item.no_wa_pemilik}?text=${encodeURIComponent('Halo ' + item.pemilik + ', saya tertarik dengan produk ' + item.nama_produk + ' (Rp ' + item.harga + ') yang saya lihat di Website Desa Sukarama.')}" 
               target="_blank" class="btn btn-whatsapp btn-sm w-full">
              <i data-lucide="message-circle"></i>
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <p class="text-danger">Gagal memuat data produk UMKM.</p>
      </div>
    `;
  }
}

/**
 * Halaman Profil Desa
 */
function renderProfil(container) {
  container.innerHTML = `
    <!-- Page Hero -->
    <section class="section" style="background:linear-gradient(135deg,var(--green-50),var(--slate-50));padding-bottom:0">
      <div class="container">
        <div class="section-header fade-in" style="margin-bottom:var(--space-xl)">
          <h2>Profil Desa Sukarama</h2>
          <p>Mengenal lebih dekat Desa Sukarama, Kecamatan Bojongpicung, Kabupaten Cianjur</p>
          <span class="accent-line"></span>
        </div>
      </div>
    </section>

    <!-- Sejarah -->
    <section class="section">
      <div class="container">
        <div class="fade-in" style="max-width:800px;margin:0 auto">
          <h2 style="display:flex;align-items:center;gap:var(--space-sm);font-size:1.4rem;margin-bottom:var(--space-lg)">
            <i data-lucide="book-open" style="width:24px;height:24px;color:var(--color-primary)"></i>
            Sejarah Desa
          </h2>
          <div style="font-size:.95rem;color:var(--color-text-sec);line-height:1.9">
            <p>
              Desa Sukarama merupakan salah satu desa yang terletak di Kecamatan Bojongpicung, 
              Kabupaten Cianjur, Provinsi Jawa Barat. Nama "Sukarama" berasal dari bahasa Sunda 
              yang berarti "suka keramaian" atau "tempat yang ramai dan menyenangkan", 
              mencerminkan semangat kebersamaan dan gotong royong masyarakatnya.
            </p>
            <br>
            <p>
              Desa ini memiliki sejarah panjang sebagai wilayah agraris yang subur. Sejak zaman 
              dahulu, masyarakat Desa Sukarama hidup dari bertani, terutama padi, palawija, dan 
              tanaman perkebunan. Seiring perkembangan zaman, desa ini terus berbenah dalam 
              pembangunan infrastruktur dan peningkatan pelayanan publik kepada masyarakat.
            </p>
            <br>
            <p>
              Dengan luas wilayah sekitar 485 hektar, Desa Sukarama terdiri dari 3 dusun, 
              8 Rukun Warga (RW), dan 24 Rukun Tetangga (RT). Topografi desa berupa dataran 
              dan perbukitan dengan ketinggian rata-rata 450 meter di atas permukaan laut, 
              menjadikannya memiliki udara yang sejuk dan pemandangan alam yang indah.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Visi & Misi -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Visi & Misi</h2>
          <p>Arah dan tujuan pembangunan Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>
        <div class="visi-misi-grid fade-in">
          <div class="visi-misi-card">
            <h3>
              <i data-lucide="eye" style="width:20px;height:20px"></i>
              Visi
            </h3>
            <p>
              "Terwujudnya Desa Sukarama yang Mandiri, Sejahtera, dan Berakhlak Mulia 
              melalui Pembangunan yang Berkelanjutan dan Berkeadilan."
            </p>
          </div>
          <div class="visi-misi-card">
            <h3>
              <i data-lucide="target" style="width:20px;height:20px"></i>
              Misi
            </h3>
            <ol>
              <li>Meningkatkan kualitas pelayanan publik yang transparan dan akuntabel</li>
              <li>Mengembangkan potensi ekonomi desa melalui pemberdayaan UMKM dan pertanian</li>
              <li>Meningkatkan kualitas infrastruktur dan aksesibilitas desa</li>
              <li>Membangun sumber daya manusia yang berkualitas melalui pendidikan dan kesehatan</li>
              <li>Melestarikan nilai-nilai budaya dan kearifan lokal masyarakat Sunda</li>
              <li>Mewujudkan tata kelola pemerintahan desa yang baik dan bersih</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Struktur Organisasi -->
    <section class="section">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Struktur Organisasi Pemerintahan Desa</h2>
          <p>Perangkat desa yang melayani masyarakat Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>
        <div class="profile-grid" id="profil-struktur-grid">
        </div>
      </div>
    </section>

    <!-- Data Demografis -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Data Demografis</h2>
          <p>Komposisi penduduk Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>

        <div class="visi-misi-grid fade-in">
          <div class="visi-misi-card">
            <h3>
              <i data-lucide="users" style="width:20px;height:20px"></i>
              Penduduk per Dusun
            </h3>
            <table class="info-table" style="margin-top:var(--space-md)">
              <thead>
                <tr>
                  <th>Dusun</th>
                  <th>Laki-laki</th>
                  <th>Perempuan</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Sukamanah</td><td>845</td><td>812</td><td>1.657</td></tr>
                <tr><td>Sukamaju</td><td>782</td><td>769</td><td>1.551</td></tr>
                <tr><td>Sukasenang</td><td>830</td><td>789</td><td>1.619</td></tr>
                <tr style="font-weight:700;background:var(--green-50)">
                  <td>Total</td><td>2.457</td><td>2.370</td><td>4.827</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="visi-misi-card">
            <h3>
              <i data-lucide="briefcase" style="width:20px;height:20px"></i>
              Mata Pencaharian Utama
            </h3>
            <table class="info-table" style="margin-top:var(--space-md)">
              <thead>
                <tr>
                  <th>Mata Pencaharian</th>
                  <th>Jumlah</th>
                  <th>Persentase</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Petani</td><td>1.456</td><td>48%</td></tr>
                <tr><td>Buruh Tani</td><td>523</td><td>17%</td></tr>
                <tr><td>Pedagang</td><td>312</td><td>10%</td></tr>
                <tr><td>Wiraswasta</td><td>245</td><td>8%</td></tr>
                <tr><td>PNS/TNI/Polri</td><td>87</td><td>3%</td></tr>
                <tr><td>Lainnya</td><td>422</td><td>14%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- Peta Lokasi -->
    <section class="section">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Peta Lokasi Desa</h2>
          <p>Lokasi Desa Sukarama di Kecamatan Bojongpicung, Kabupaten Cianjur</p>
          <span class="accent-line"></span>
        </div>
        <div class="map-container fade-in">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31673.88!2d107.14!3d-6.85!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e685f1c8e2b0c2d%3A0x0!2sBojongpicung%2C+Cianjur!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
            allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            title="Peta Desa Sukarama">
          </iframe>
        </div>
      </div>
    </section>

    <!-- Galeri Foto -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Galeri Desa</h2>
          <p>Dokumentasi kegiatan dan potensi Desa Sukarama</p>
          <span class="accent-line"></span>
        </div>
        <div class="gallery-grid fade-in" id="profil-gallery">
        </div>
      </div>
    </section>
  `;

  renderStrukturOrganisasi();
  renderGallery();
}

function renderStrukturOrganisasi() {
  const grid = document.getElementById('profil-struktur-grid');
  const perangkat = [
    { nama: 'H. Ahmad Suryadi, S.Sos', jabatan: 'Kepala Desa', inisial: 'AS' },
    { nama: 'Dedi Kurniawan, S.AP', jabatan: 'Sekretaris Desa', inisial: 'DK' },
    { nama: 'Siti Nurhaliza', jabatan: 'Kaur Keuangan', inisial: 'SN' },
    { nama: 'Rina Marlina', jabatan: 'Kaur Perencanaan', inisial: 'RM' },
    { nama: 'Iwan Setiawan', jabatan: 'Kaur Tata Usaha & Umum', inisial: 'IS' },
    { nama: 'Ujang Hermawan', jabatan: 'Kadus Sukamanah', inisial: 'UH' },
    { nama: 'Asep Saepudin', jabatan: 'Kadus Sukamaju', inisial: 'AS' },
    { nama: 'Nana Suryana', jabatan: 'Kadus Sukasenang', inisial: 'NS' },
  ];

  grid.innerHTML = perangkat.map((p, i) => `
    <div class="profile-card fade-in fade-in-delay-${(i % 3) + 1}">
      <div class="profile-avatar">${p.inisial}</div>
      <div class="profile-name">${escapeHtml(p.nama)}</div>
      <div class="profile-role">${escapeHtml(p.jabatan)}</div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
  setupScrollAnimations();
}

function renderGallery() {
  const grid = document.getElementById('profil-gallery');
  const galleryItems = [
    { title: 'Musyawarah Desa', icon: 'users' },
    { title: 'Kegiatan Posyandu', icon: 'heart-pulse' },
    { title: 'Gotong Royong', icon: 'hand-helping' },
    { title: 'Sawah & Pertanian', icon: 'sprout' },
    { title: 'Kegiatan PKK', icon: 'users' },
    { title: 'Pelatihan UMKM', icon: 'graduation-cap' },
  ];

  grid.innerHTML = galleryItems.map(item => `
    <div class="gallery-item">
      <div style="text-align:center">
        <i data-lucide="${item.icon}" style="width:32px;height:32px;margin-bottom:8px"></i>
        <div style="font-size:.82rem;font-weight:500">${item.title}</div>
        <div style="font-size:.72rem;color:var(--color-text-muted);margin-top:4px">Foto placeholder</div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

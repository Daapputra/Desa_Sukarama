/**
 * Panel Admin — Login & Dashboard CRUD
 */
function renderAdmin(container) {
  // Check auth
  const token = localStorage.getItem('admin_token');
  if (!token) {
    renderAdminLogin(container);
    return;
  }

  // Verify token
  apiCall('/api/admin/verify').then(data => {
    if (data.valid) {
      renderAdminDashboard(container, data.username);
    } else {
      localStorage.removeItem('admin_token');
      renderAdminLogin(container);
    }
  }).catch(() => {
    localStorage.removeItem('admin_token');
    renderAdminLogin(container);
  });
}

// ── Login ────────────────────────────────────────────────
function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="admin-login">
      <div class="login-card fade-in">
        <div class="login-header">
          <div class="login-icon"><i data-lucide="shield"></i></div>
          <h2>Admin Login</h2>
          <p>Akses khusus perangkat Desa Sukarama</p>
        </div>
        <form id="admin-login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" id="username" required>
          </div>
          <div class="form-group mb-xl">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="password" required>
          </div>
          <button type="submit" class="btn btn-primary w-full btn-lg" id="btn-login">
            Login
          </button>
        </form>
        <div class="text-center mt-lg">
          <a href="#/" class="btn btn-ghost btn-sm"><i data-lucide="arrow-left"></i> Kembali ke Beranda</a>
        </div>
      </div>
    </div>
  `;
  
  if (window.lucide) lucide.createIcons();

  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = 'Memeriksa...';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('admin_token', data.token);
      showToast('Login berhasil', 'success');
      renderAdmin(document.getElementById('main-content'));
      
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = 'Login';
    }
  });
}

// ── Dashboard ────────────────────────────────────────────
function renderAdminDashboard(container, username) {
  // Hide main header/footer for admin view to make it app-like
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('main-footer').style.display = 'none';
  document.getElementById('main-content').style.minHeight = '100vh';
  document.getElementById('main-content').style.marginTop = '0';
  document.body.style.background = 'var(--slate-50)';

  container.innerHTML = `
    <!-- Admin Topbar -->
    <div style="background:var(--white);border-bottom:1px solid var(--color-border);padding:var(--space-md) var(--space-xl);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100;">
      <div style="display:flex;align-items:center;gap:12px;font-weight:700;color:var(--slate-900)">
        <div style="width:32px;height:32px;background:var(--color-primary);color:white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.9rem">DS</div>
        Admin Panel Sukarama
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-lg)">
        <span style="font-size:.85rem;color:var(--color-text-sec)">Halo, <b>${username}</b></span>
        <a href="#/" id="btn-back-web" class="btn btn-outline btn-sm" style="color:var(--slate-700);border-color:var(--color-border)"><i data-lucide="globe"></i> Lihat Web</a>
        <button id="btn-logout" class="btn btn-danger btn-sm"><i data-lucide="log-out"></i> Logout</button>
      </div>
    </div>

    <div class="admin-container">
      
      <!-- Stats -->
      <div class="admin-stats" id="admin-stats-container">
        <!-- populated by loadStats -->
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button class="admin-tab active" data-tab="surat"><i data-lucide="file-text"></i> Pengajuan Surat</button>
        <button class="admin-tab" data-tab="umkm"><i data-lucide="shopping-bag"></i> Data UMKM</button>
        <button class="admin-tab" data-tab="pengumuman"><i data-lucide="bell"></i> Pengumuman</button>
      </div>

      <!-- Panel Content -->
      <div class="admin-panel" id="admin-panel-content">
        <!-- populated based on active tab -->
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Handlers
  document.getElementById('btn-back-web').addEventListener('click', () => {
    // Restore header/footer visibility when going back to web
    document.getElementById('main-header').style.display = '';
    document.getElementById('main-footer').style.display = '';
    document.body.style.background = '';
    document.getElementById('main-content').style.marginTop = '';
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    apiCall('/api/admin/logout', { method: 'POST' }).finally(() => {
      localStorage.removeItem('admin_token');
      document.getElementById('main-header').style.display = '';
      document.getElementById('main-footer').style.display = '';
      document.body.style.background = '';
      document.getElementById('main-content').style.marginTop = '';
      window.location.hash = '/';
    });
  });

  // Tab switching
  const tabs = container.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const tabId = e.currentTarget.getAttribute('data-tab');
      loadAdminTab(tabId);
    });
  });

  // Initial load
  loadStats();
  loadAdminTab('surat');
}

// ── Admin: Stats ─────────────────────────────────────────
async function loadStats() {
  try {
    const stats = await apiCall('/api/admin/stats');
    document.getElementById('admin-stats-container').innerHTML = `
      <div class="admin-stat-card">
        <div class="stat-icon-box" style="background:#FEF3C7;color:#D97706"><i data-lucide="file-clock"></i></div>
        <div class="stat-info">
          <div class="stat-number">${stats.surat_baru}</div>
          <div class="stat-label">Surat Baru (Diajukan)</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-icon-box" style="background:#DBEAFE;color:#2563EB"><i data-lucide="loader"></i></div>
        <div class="stat-info">
          <div class="stat-number">${stats.surat_proses}</div>
          <div class="stat-label">Surat Diproses</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-icon-box" style="background:#E0E7FF;color:#4F46E5"><i data-lucide="store"></i></div>
        <div class="stat-info">
          <div class="stat-number">${stats.total_umkm}</div>
          <div class="stat-label">Total UMKM</div>
        </div>
      </div>
      <div class="admin-stat-card">
        <div class="stat-icon-box" style="background:#DCFCE7;color:#16A34A"><i data-lucide="message-square"></i></div>
        <div class="stat-info">
          <div class="stat-number">${stats.pesan_baru}</div>
          <div class="stat-label">Pesan Kontak Baru</div>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error(err);
  }
}

// ── Admin: Tab Routing ───────────────────────────────────
function loadAdminTab(tabId) {
  const panel = document.getElementById('admin-panel-content');
  panel.innerHTML = '<div style="padding:40px;text-align:center"><div class="loader-spinner" style="margin:0 auto"></div></div>';
  
  if (tabId === 'surat') loadTabSurat(panel);
  else if (tabId === 'umkm') loadTabUMKM(panel);
  else if (tabId === 'pengumuman') loadTabPengumuman(panel);
}

// ── Admin: Surat ─────────────────────────────────────────
async function loadTabSurat(panel) {
  try {
    const data = await apiCall('/api/surat');
    
    panel.innerHTML = `
      <div class="admin-panel-header">
        <h3>Daftar Pengajuan Surat</h3>
        <span class="badge" style="background:var(--slate-100);color:var(--slate-700)">Total: ${data.length}</span>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tgl Pengajuan</th>
              <th>No Ref</th>
              <th>Nama & NIK</th>
              <th>Jenis Surat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => {
              const badgeClass = item.status === 'Selesai' ? 'badge-selesai' : item.status === 'Diproses' ? 'badge-diproses' : 'badge-diajukan';
              return `
              <tr>
                <td><div style="font-size:.8rem;color:var(--color-text-sec)">${new Date(item.created_at).toLocaleString('id-ID')}</div></td>
                <td><span style="font-family:monospace;font-weight:600">${item.ref_number}</span></td>
                <td>
                  <div style="font-weight:600">${escapeHtml(item.nama)}</div>
                  <div style="font-size:.75rem;color:var(--color-text-muted)">NIK: ${item.nik}</div>
                </td>
                <td>${escapeHtml(item.jenis_surat)}</td>
                <td><span class="badge ${badgeClass}">${item.status}</span></td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm" onclick="showSuratDetail(${item.id})" title="Lihat Detail">
                    <i data-lucide="eye"></i>
                  </button>
                  <select class="form-select" style="padding:4px 24px 4px 8px;font-size:.75rem;width:auto" onchange="updateSuratStatus(${item.id}, this.value)">
                    <option value="Diajukan" ${item.status==='Diajukan'?'selected':''}>Diajukan</option>
                    <option value="Diproses" ${item.status==='Diproses'?'selected':''}>Diproses</option>
                    <option value="Selesai" ${item.status==='Selesai'?'selected':''}>Selesai</option>
                  </select>
                </td>
              </tr>
            `}).join('')}
            ${data.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-lg">Belum ada pengajuan surat.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    panel.innerHTML = `<div class="p-lg text-danger">${err.message}</div>`;
  }
}

window.showSuratDetail = async function(id) {
  try {
    const data = await apiCall(`/api/surat/${id}`);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Detail Pengajuan: ${data.ref_number}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <table class="info-table">
            <tr><td width="35%" style="font-weight:600">Nama</td><td>${escapeHtml(data.nama)}</td></tr>
            <tr><td style="font-weight:600">NIK</td><td>${data.nik}</td></tr>
            <tr><td style="font-weight:600">No. KK</td><td>${data.no_kk}</td></tr>
            <tr><td style="font-weight:600">No. WhatsApp</td><td>
              <a href="https://wa.me/${data.no_wa.replace(/^0/,'62')}" target="_blank" class="text-primary flex-center gap-sm" style="justify-content:flex-start">
                <i data-lucide="message-circle" style="width:14px;height:14px"></i> ${data.no_wa}
              </a>
            </td></tr>
            <tr><td style="font-weight:600">Jenis Surat</td><td>${escapeHtml(data.jenis_surat)}</td></tr>
            <tr><td style="font-weight:600">Keperluan</td><td>${escapeHtml(data.keperluan)}</td></tr>
            <tr><td style="font-weight:600">Dokumen</td><td>
              ${data.dokumen_path ? `<a href="${data.dokumen_path}" target="_blank" class="btn btn-outline btn-sm"><i data-lucide="download"></i> Lihat Dokumen</a>` : '<span class="text-muted">Tidak ada lampiran</span>'}
            </td></tr>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    showToast('Gagal memuat detail', 'error');
  }
};

window.updateSuratStatus = async function(id, status) {
  try {
    await apiCall(`/api/surat/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast('Status berhasil diperbarui', 'success');
    loadStats(); // update counters
  } catch (err) {
    showToast(err.message, 'error');
    loadAdminTab('surat'); // reload on fail
  }
};

// ── Admin: Pengumuman ────────────────────────────────────
async function loadTabPengumuman(panel) {
  try {
    const data = await apiCall('/api/pengumuman');
    
    panel.innerHTML = `
      <div class="admin-panel-header">
        <h3>Kelola Pengumuman</h3>
        <button class="btn btn-primary btn-sm" onclick="showPengumumanForm()"><i data-lucide="plus"></i> Tambah Baru</button>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Judul</th>
              <th>Cuplikan Konten</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.tanggal}</td>
                <td style="font-weight:600">${escapeHtml(item.judul)}</td>
                <td style="color:var(--color-text-sec);font-size:.8rem">${escapeHtml(truncateText(item.konten, 60))}</td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm text-primary" onclick='showPengumumanForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                  <button class="btn btn-ghost btn-sm text-danger" onclick="deletePengumuman(${item.id})"><i data-lucide="trash-2"></i></button>
                </td>
              </tr>
            `).join('')}
            ${data.length === 0 ? '<tr><td colspan="4" class="text-center text-muted py-lg">Belum ada data.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    panel.innerHTML = `<div class="p-lg text-danger">${err.message}</div>`;
  }
}

window.showPengumumanForm = function(data = null) {
  const isEdit = !!data;
  const today = new Date().toISOString().split('T')[0];
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? 'Edit' : 'Tambah'} Pengumuman</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-pengumuman-admin">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Judul</label>
            <input type="text" class="form-input" name="judul" required value="${isEdit ? escapeHtml(data.judul) : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input type="date" class="form-input" name="tanggal" required value="${isEdit ? data.tanggal : today}">
          </div>
          <div class="form-group">
            <label class="form-label">Konten</label>
            <textarea class="form-textarea" name="konten" required rows="6">${isEdit ? escapeHtml(data.konten) : ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Simpan</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();

  document.getElementById('form-pengumuman-admin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const body = Object.fromEntries(new FormData(e.target));
    const url = isEdit ? `/api/pengumuman/${data.id}` : '/api/pengumuman';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      await apiCall(url, { method, body: JSON.stringify(body) });
      showToast('Pengumuman berhasil disimpan', 'success');
      modal.remove();
      loadAdminTab('pengumuman');
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
    }
  });
};

window.deletePengumuman = async function(id) {
  if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
  try {
    await apiCall(`/api/pengumuman/${id}`, { method: 'DELETE' });
    showToast('Berhasil dihapus', 'success');
    loadAdminTab('pengumuman');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ── Admin: UMKM ──────────────────────────────────────────
async function loadTabUMKM(panel) {
  try {
    const data = await apiCall('/api/umkm');
    
    panel.innerHTML = `
      <div class="admin-panel-header">
        <h3>Data Produk UMKM</h3>
        <button class="btn btn-primary btn-sm" onclick="showUmkmForm()"><i data-lucide="plus"></i> Tambah Produk</button>
      </div>
      <div style="overflow-x:auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="60">Foto</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Pemilik / WA</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>
                  <img src="${item.foto_path || '/images/products/placeholder.jpg'}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+'" style="width:40px;height:40px;object-fit:cover;border-radius:4px">
                </td>
                <td style="font-weight:600">${escapeHtml(item.nama_produk)}</td>
                <td><span class="badge" style="background:var(--color-primary-bg);color:var(--color-primary)">${item.kategori}</span></td>
                <td>${formatRupiah(item.harga)}</td>
                <td>
                  <div style="font-size:.85rem">${escapeHtml(item.pemilik)}</div>
                  <div style="font-size:.75rem;color:var(--color-text-muted)">${item.no_wa_pemilik}</div>
                </td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm text-primary" onclick='showUmkmForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                  <button class="btn btn-ghost btn-sm text-danger" onclick="deleteUmkm(${item.id})"><i data-lucide="trash-2"></i></button>
                </td>
              </tr>
            `).join('')}
            ${data.length === 0 ? '<tr><td colspan="6" class="text-center text-muted py-lg">Belum ada data UMKM.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    panel.innerHTML = `<div class="p-lg text-danger">${err.message}</div>`;
  }
}

window.showUmkmForm = function(data = null) {
  const isEdit = !!data;
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${isEdit ? 'Edit' : 'Tambah'} Produk UMKM</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-umkm-admin">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Produk <span class="required">*</span></label>
              <input type="text" class="form-input" name="nama_produk" required value="${isEdit ? escapeHtml(data.nama_produk) : ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Kategori <span class="required">*</span></label>
              <select class="form-select" name="kategori" required>
                <option value="Makanan" ${isEdit&&data.kategori==='Makanan'?'selected':''}>Makanan</option>
                <option value="Kerajinan" ${isEdit&&data.kategori==='Kerajinan'?'selected':''}>Kerajinan</option>
                <option value="Hasil Tani" ${isEdit&&data.kategori==='Hasil Tani'?'selected':''}>Hasil Tani</option>
                <option value="Lainnya" ${isEdit&&data.kategori==='Lainnya'?'selected':''}>Lainnya</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Harga (Rp) <span class="required">*</span></label>
              <input type="number" class="form-input" name="harga" required value="${isEdit ? data.harga : ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Nama Pemilik Usaha <span class="required">*</span></label>
              <input type="text" class="form-input" name="pemilik" required value="${isEdit ? escapeHtml(data.pemilik) : ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">No. WA Pemilik <span class="required">*</span></label>
            <input type="text" class="form-input" name="no_wa_pemilik" required placeholder="Contoh: 628123456789" value="${isEdit ? data.no_wa_pemilik : ''}">
            <div class="form-hint">Harus diawali 62 (contoh: 62812...) untuk link WhatsApp</div>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Produk <span class="required">*</span></label>
            <textarea class="form-textarea" name="deskripsi" required rows="3">${isEdit ? escapeHtml(data.deskripsi) : ''}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Foto Produk ${isEdit ? '(Biarkan kosong jika tidak diubah)' : '<span class="required">*</span>'}</label>
            <input type="file" class="form-input" name="foto" accept=".jpg,.jpeg,.png,.webp" ${isEdit ? '' : 'required'}>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Batal</button>
          <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Simpan Produk</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();

  document.getElementById('form-umkm-admin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    
    const formData = new FormData(e.target);
    const url = isEdit ? `/api/umkm/${data.id}` : '/api/umkm';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      await apiCall(url, { method, body: formData });
      showToast('Produk berhasil disimpan', 'success');
      modal.remove();
      loadStats();
      loadAdminTab('umkm');
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
    }
  });
};

window.deleteUmkm = async function(id) {
  if (!confirm('Yakin ingin menghapus produk UMKM ini?')) return;
  try {
    await apiCall(`/api/umkm/${id}`, { method: 'DELETE' });
    showToast('Berhasil dihapus', 'success');
    loadStats();
    loadAdminTab('umkm');
  } catch (err) {
    showToast(err.message, 'error');
  }
};
